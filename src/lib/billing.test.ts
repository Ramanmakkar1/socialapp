import assert from "node:assert/strict";
import { test } from "node:test";
import type pg from "pg";
import Stripe from "stripe";
import {
  ALL_LOOKUP_KEYS,
  PLAN_PRICES,
  lookupKeyFor,
  parsePlanChoice,
  planFromBilling,
  planFromLookupKey,
  shouldApplySubscription,
  subscriptionState,
  yearlySavingPercent,
} from "./billingState.ts";
import { checkoutSessionParams, clearPriceCache, resolvePriceId } from "./billing.ts";
import { handleBillingEvent, invoiceSubscriptionId, processBillingWebhook } from "./billingWebhook.ts";
import { PLANS } from "./plans.ts";
import { parseUpgradeIntent, serializeUpgradeIntent } from "./upgradeIntent.ts";

const SECRET = "whsec_billing_test";
const USER = "44444444-4444-4444-8444-444444444444";
const OTHER_USER = "55555555-5555-4555-8555-555555555555";
const DAY = 86_400_000;

// ---- Prices + lookup keys ---------------------------------------------------------------------

test("lookup keys cover the 4 prices and round-trip to plan + interval", () => {
  assert.deepEqual([...ALL_LOOKUP_KEYS].sort(), ["poskoo_agency_monthly", "poskoo_agency_yearly", "poskoo_pro_monthly", "poskoo_pro_yearly"]);
  assert.equal(lookupKeyFor("Pro", "month"), "poskoo_pro_monthly");
  assert.deepEqual(planFromLookupKey("poskoo_agency_yearly"), { plan: "Agency", interval: "year" });
  assert.equal(planFromLookupKey("poskoo_enterprise_monthly"), null);
  assert.equal(planFromLookupKey(null), null);
  assert.deepEqual(parsePlanChoice("PRO", "yearly"), { plan: "Pro", interval: "year" });
  assert.equal(parsePlanChoice("free", "month"), null);
  assert.equal(parsePlanChoice("pro", "weekly"), null);
  assert.deepEqual(parseUpgradeIntent(serializeUpgradeIntent({ plan: "Agency", interval: "month" })), { plan: "Agency", interval: "month" });
  assert.equal(parseUpgradeIntent("pro.decade"), null);
});

test("billing amounts match the owner-approved prices on the plan cards", () => {
  for (const plan of ["Pro", "Agency"] as const) {
    const card = PLANS.find((p) => p.name === plan)!;
    assert.equal(card.price, `$${PLAN_PRICES[plan].month / 100}`);
    assert.ok(card.yearly?.startsWith(`$${PLAN_PRICES[plan].year / 1200} / month billed yearly`), card.yearly);
  }
  assert.equal(PLAN_PRICES.Pro.year, 16800);
  assert.equal(PLAN_PRICES.Agency.year, 34800);
  assert.equal(yearlySavingPercent("Pro"), 18);
  assert.equal(yearlySavingPercent("Agency"), 17);
});

test("resolvePriceId finds the active price by lookup_key, caches it, and explains a missing setup", async () => {
  clearPriceCache();
  const calls: unknown[] = [];
  const stripe = {
    prices: {
      list: async (params: { lookup_keys: string[] }) => {
        calls.push(params);
        return { data: params.lookup_keys[0] === "poskoo_pro_yearly" ? [{ id: "price_pro_y" }] : [] };
      },
    },
  } as unknown as Pick<Stripe, "prices">;
  assert.equal(await resolvePriceId("Pro", "year", stripe, 1000), "price_pro_y");
  assert.equal(await resolvePriceId("Pro", "year", stripe, 2000), "price_pro_y");
  assert.equal(calls.length, 1, "second lookup is cached");
  assert.deepEqual(calls[0], { lookup_keys: ["poskoo_pro_yearly"], active: true, limit: 1 });
  await assert.rejects(resolvePriceId("Agency", "month", stripe, 3000), /lookup_key poskoo_agency_monthly.*stripe-setup-billing/);
  assert.equal(await resolvePriceId("Pro", "year", stripe, 1000 + 11 * 60 * 1000), "price_pro_y");
  assert.equal(calls.length, 3, "cache expires after 10 minutes");
  clearPriceCache();
});

test("checkout params: subscription mode, reused customer, user id, promo codes, tax only with the env flag", () => {
  const prev = process.env.STRIPE_TAX_ENABLED;
  try {
    delete process.env.STRIPE_TAX_ENABLED;
    const p = checkoutSessionParams({ userId: USER, customerId: "cus_1", priceId: "price_1", plan: "Pro", interval: "month", baseUrl: "https://poskoo.com" });
    assert.equal(p.mode, "subscription");
    assert.equal(p.customer, "cus_1");
    assert.equal(p.client_reference_id, USER);
    assert.equal(p.allow_promotion_codes, true);
    assert.equal(p.billing_address_collection, "auto");
    assert.equal(p.automatic_tax, undefined);
    assert.equal("payment_method_types" in p, false);
    assert.equal(p.success_url, "https://poskoo.com/app/settings/billing?upgraded=1&session_id={CHECKOUT_SESSION_ID}");
    assert.equal(p.subscription_data?.metadata?.poskoo_user_id, USER);
    process.env.STRIPE_TAX_ENABLED = "true";
    assert.deepEqual(checkoutSessionParams({ userId: USER, customerId: "cus_1", priceId: "price_1", plan: "Pro", interval: "month" }).automatic_tax, { enabled: true });
  } finally {
    if (prev === undefined) delete process.env.STRIPE_TAX_ENABLED;
    else process.env.STRIPE_TAX_ENABLED = prev;
  }
});

// ---- State mapping + planForUser rule ---------------------------------------------------------

function sub(over: Partial<{ id: string; status: string; customer: string; lookup: string | null; end: number; cancelAtPeriodEnd: boolean; cancelAt: number | null; userId: string }> = {}) {
  return {
    id: over.id ?? "sub_1",
    object: "subscription",
    status: over.status ?? "active",
    customer: over.customer ?? "cus_1",
    cancel_at_period_end: over.cancelAtPeriodEnd ?? false,
    cancel_at: over.cancelAt ?? null,
    metadata: { poskoo_user_id: over.userId ?? USER },
    items: { data: [{ current_period_end: over.end ?? 1_800_000_000, price: { lookup_key: over.lookup === undefined ? "poskoo_pro_monthly" : over.lookup, unit_amount: 1700, currency: "usd", recurring: { interval: "month" }, product: { metadata: { poskoo_plan: "Pro" } } } }] },
  } as unknown as Stripe.Subscription;
}

test("subscriptionState maps plan, interval, status, period end and cancel flags", () => {
  const s = subscriptionState(sub({ status: "past_due", cancelAtPeriodEnd: true, end: 1_800_000_000 }));
  assert.equal(s.plan, "Pro");
  assert.equal(s.interval, "month");
  assert.equal(s.status, "past_due");
  assert.equal(s.customerId, "cus_1");
  assert.equal(s.currentPeriodEnd?.toISOString(), new Date(1_800_000_000_000).toISOString());
  assert.equal(s.cancelAtPeriodEnd, true);
  assert.equal(s.amountCents, 1700);
  // Price without a lookup key: product metadata + interval.
  const fallback = subscriptionState(sub({ lookup: null }));
  assert.deepEqual([fallback.plan, fallback.interval], ["Pro", "month"]);
  assert.equal(subscriptionState(sub({ cancelAt: 1_800_000_500 })).cancelAt?.getTime(), 1_800_000_500_000);
  assert.equal(subscriptionState(sub({ status: "something_new" })).status, "incomplete");
});

test("planFromBilling: active/trialing are paid, past_due only for 7 days, everything else Free", () => {
  const now = new Date("2026-11-20T00:00:00Z");
  assert.equal(planFromBilling(null, now), "Free");
  assert.equal(planFromBilling({ plan: "Pro", status: "active", past_due_since: null }, now), "Pro");
  assert.equal(planFromBilling({ plan: "Agency", status: "trialing", past_due_since: null }, now), "Agency");
  assert.equal(planFromBilling({ plan: "Pro", status: "past_due", past_due_since: new Date(now.getTime() - 6.9 * DAY) }, now), "Pro");
  assert.equal(planFromBilling({ plan: "Pro", status: "past_due", past_due_since: new Date(now.getTime() - 7 * DAY) }, now), "Free");
  assert.equal(planFromBilling({ plan: "Pro", status: "past_due", past_due_since: null }, now), "Pro", "just turned past_due");
  for (const status of ["canceled", "incomplete", "incomplete_expired", "unpaid", "paused", null]) {
    assert.equal(planFromBilling({ plan: "Pro", status, past_due_since: null }, now), "Free", String(status));
  }
  assert.equal(planFromBilling({ plan: null, status: "active", past_due_since: null }, now), "Free");
});

test("a dead duplicate subscription never overwrites a live one", () => {
  assert.equal(shouldApplySubscription(null, { subscriptionId: "sub_2", status: "incomplete" }), true);
  assert.equal(shouldApplySubscription({ stripe_subscription_id: "sub_1", status: "active" }, { subscriptionId: "sub_1", status: "canceled" }), true);
  assert.equal(shouldApplySubscription({ stripe_subscription_id: "sub_1", status: "active" }, { subscriptionId: "sub_2", status: "incomplete_expired" }), false);
  assert.equal(shouldApplySubscription({ stripe_subscription_id: "sub_1", status: "canceled" }, { subscriptionId: "sub_2", status: "active" }), true);
});

test("invoice subscription id comes from parent.subscription_details (current API) or the legacy field", () => {
  assert.equal(invoiceSubscriptionId({ parent: { subscription_details: { subscription: "sub_9" } } }), "sub_9");
  assert.equal(invoiceSubscriptionId({ subscription: { id: "sub_8" } }), "sub_8");
  assert.equal(invoiceSubscriptionId({ parent: null }), null);
});

// ---- Webhook: signature, idempotency, recording ----------------------------------------------

type Row = { user_id: string; stripe_customer_id: string; stripe_subscription_id: string | null; plan: string | null; status: string | null; billing_interval: string | null; current_period_end: string | null; cancel_at_period_end: boolean; past_due_since: Date | null };

/** Transactional fake for stripe_events / billing_subscriptions / users: writes apply on commit, vanish on rollback. */
function billingWorld(opts: { failUpsert?: number } = {}) {
  const events = new Set<string>();
  const rows = new Map<string, Row>();
  const users = new Set([USER, OTHER_USER]);
  let failures = opts.failUpsert ?? 0;
  const run = async (staged: (() => void)[] | null, sql: string, p: unknown[] = []) => {
    const s = sql.replace(/\s+/g, " ").trim();
    const apply = (fn: () => void) => (staged ? staged.push(fn) : fn());
    if (/^select 1 from socialapp\.stripe_events where id=\$1/.test(s)) return { rows: events.has(String(p[0])) ? [{}] : [] };
    if (/^insert into socialapp\.stripe_events/.test(s)) {
      if (events.has(String(p[0]))) return { rows: [] };
      apply(() => events.add(String(p[0])));
      return { rows: [{ id: p[0] }] };
    }
    if (/^select user_id from socialapp\.billing_subscriptions where stripe_customer_id=\$1/.test(s)) {
      return { rows: [...rows.values()].filter((r) => r.stripe_customer_id === p[0]).map((r) => ({ user_id: r.user_id })) };
    }
    if (/^select id from socialapp\.users where id=\$1/.test(s)) return { rows: users.has(String(p[0])) ? [{ id: p[0] }] : [] };
    if (/^select stripe_subscription_id, status from socialapp\.billing_subscriptions where user_id=\$1 for update/.test(s)) {
      const r = rows.get(String(p[0]));
      return { rows: r ? [{ stripe_subscription_id: r.stripe_subscription_id, status: r.status }] : [] };
    }
    if (/^insert into socialapp\.billing_subscriptions as b/.test(s)) {
      if (failures > 0) {
        failures -= 1;
        throw new Error("db down");
      }
      apply(() => {
        const prev = rows.get(String(p[0]));
        const status = String(p[5]);
        const keepSince = prev && prev.status === "past_due" && prev.stripe_subscription_id === p[2] ? prev.past_due_since : null;
        rows.set(String(p[0]), {
          user_id: String(p[0]),
          stripe_customer_id: String(p[1]),
          stripe_subscription_id: String(p[2]),
          plan: (p[3] as string | null) ?? prev?.plan ?? null,
          billing_interval: (p[4] as string | null) ?? prev?.billing_interval ?? null,
          status,
          current_period_end: p[7] as string | null,
          cancel_at_period_end: p[8] === true,
          past_due_since: status === "past_due" ? (keepSince ?? new Date()) : null,
        });
      });
      return { rows: [] };
    }
    throw new Error(`unexpected SQL: ${s.slice(0, 120)}`);
  };
  const pool = {
    query: (sql: string, p?: unknown[]) => run(null, sql, p),
    connect: async () => {
      let staged: (() => void)[] | null = null;
      return {
        query: async (sql: string, p?: unknown[]) => {
          if (sql === "begin") { staged = []; return { rows: [] }; }
          if (sql === "commit") { staged?.forEach((fn) => fn()); staged = null; return { rows: [] }; }
          if (sql === "rollback") { staged = null; return { rows: [] }; }
          return run(staged, sql, p);
        },
        release: () => {},
      };
    },
  } as unknown as pg.Pool;
  return { pool, events, rows, users };
}

async function withWorld<T>(world: ReturnType<typeof billingWorld>, fn: () => Promise<T>): Promise<T> {
  const prevPool = globalThis.__socialappPool;
  const prevUrl = process.env.DATABASE_URL;
  const prevErr = console.error;
  globalThis.__socialappPool = world.pool;
  process.env.DATABASE_URL = "mock";
  console.error = () => {};
  try {
    return await fn();
  } finally {
    globalThis.__socialappPool = prevPool;
    if (prevUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = prevUrl;
    console.error = prevErr;
  }
}

function signed(event: object, secret = SECRET) {
  const payload = JSON.stringify(event);
  return { payload, header: Stripe.webhooks.generateTestHeaderString({ payload, secret }) };
}
const evt = (id: string, type: string, object: object, extra: Record<string, unknown> = {}) => ({ id, object: "event", type, data: { object }, ...extra }) as unknown as Stripe.Event;
const checkoutDone = (over: Record<string, unknown> = {}) => ({ id: "cs_test_1", object: "checkout.session", mode: "subscription", client_reference_id: USER, customer: "cus_1", subscription: "sub_1", metadata: {}, ...over });

/** Stripe "API": the current subscription state, fetched fresh for every event. */
function stripeSubs(initial: Stripe.Subscription) {
  let current = initial;
  const fetched: string[] = [];
  const notified: { kind: string; userId: string }[] = [];
  return {
    set: (s: Stripe.Subscription) => { current = s; },
    fetched,
    notified,
    deps: {
      fetchSubscription: async (id: string) => { fetched.push(id); return current; },
      notify: (kind: "state" | "payment_failed", userId: string) => { notified.push({ kind, userId }); },
    },
  };
}

test("billing webhook rejects missing, forged, tampered and wrong-secret signatures without touching the DB", async () => {
  const world = billingWorld();
  const api = stripeSubs(sub());
  await withWorld(world, async () => {
    const { payload, header } = signed(evt("evt_1", "checkout.session.completed", checkoutDone()));
    assert.equal((await processBillingWebhook(payload, null, SECRET, api.deps)).status, 400);
    assert.equal((await processBillingWebhook(payload, "t=1,v1=deadbeef", SECRET, api.deps)).status, 400);
    assert.equal((await processBillingWebhook(payload, header, "whsec_other", api.deps)).status, 400);
    assert.equal((await processBillingWebhook(payload.replace("sub_1", "sub_X"), header, SECRET, api.deps)).status, 400);
    assert.equal((await processBillingWebhook(payload, header, undefined, api.deps)).status, 503);
    // The Connect secret does not open the billing endpoint.
    const connect = signed(evt("evt_1", "checkout.session.completed", checkoutDone()), "whsec_connect");
    assert.equal((await processBillingWebhook(connect.payload, connect.header, SECRET, api.deps)).status, 400);
    assert.equal(world.rows.size, 0);
    assert.equal(world.events.size, 0);
    assert.equal(api.fetched.length, 0);
  });
});

test("checkout.session.completed records Pro for the user; a replayed event is a no-op", async () => {
  const world = billingWorld();
  const api = stripeSubs(sub());
  await withWorld(world, async () => {
    const { payload, header } = signed(evt("evt_1", "checkout.session.completed", checkoutDone()));
    const first = await processBillingWebhook(payload, header, SECRET, api.deps);
    assert.deepEqual(first, { status: 200, body: { received: "true", result: "processed" } });
    const row = world.rows.get(USER)!;
    assert.equal(row.plan, "Pro");
    assert.equal(row.status, "active");
    assert.equal(row.stripe_customer_id, "cus_1");
    assert.equal(planFromBilling({ plan: "Pro", status: row.status, past_due_since: row.past_due_since }), "Pro");
    const again = await processBillingWebhook(payload, header, SECRET, api.deps);
    assert.equal(again.body.result, "duplicate");
    assert.equal(api.fetched.length, 1, "duplicate does not call Stripe");
    assert.deepEqual(api.notified, [{ kind: "state", userId: USER }]);
  });
});

test("events are applied from the fresh subscription, so out-of-order deliveries end in the latest state", async () => {
  const world = billingWorld();
  const api = stripeSubs(sub());
  await withWorld(world, async () => {
    await handleBillingEvent(evt("evt_c", "checkout.session.completed", checkoutDone()), api.deps);
    // Stripe now says: switched to yearly and set to cancel at period end; an OLD "created" event arrives late.
    api.set(sub({ lookup: "poskoo_pro_yearly", cancelAtPeriodEnd: true }));
    assert.equal(await handleBillingEvent(evt("evt_old", "customer.subscription.created", sub()), api.deps), "processed");
    const row = world.rows.get(USER)!;
    assert.equal(row.billing_interval, "year");
    assert.equal(row.cancel_at_period_end, true);
  });
});

test("payment failed -> past_due with grace start kept across retries; paid again clears it; deleted -> Free", async () => {
  const world = billingWorld();
  const api = stripeSubs(sub());
  await withWorld(world, async () => {
    await handleBillingEvent(evt("evt_1", "checkout.session.completed", checkoutDone()), api.deps);
    api.set(sub({ status: "past_due" }));
    const invoice = { id: "in_1", object: "invoice", amount_due: 1700, currency: "usd", parent: { subscription_details: { subscription: "sub_1" } } };
    assert.equal(await handleBillingEvent(evt("evt_2", "invoice.payment_failed", invoice), api.deps), "processed");
    const since = world.rows.get(USER)!.past_due_since;
    assert.ok(since instanceof Date);
    assert.equal(planFromBilling({ plan: "Pro", status: "past_due", past_due_since: since }), "Pro", "inside grace");
    assert.ok(api.notified.some((n) => n.kind === "payment_failed"));
    await handleBillingEvent(evt("evt_3", "invoice.payment_failed", { ...invoice, id: "in_1b" }), api.deps);
    assert.equal(world.rows.get(USER)!.past_due_since, since, "grace starts at the FIRST failure");
    api.set(sub({ status: "active" }));
    await handleBillingEvent(evt("evt_4", "invoice.paid", invoice), api.deps);
    assert.equal(world.rows.get(USER)!.past_due_since, null);
    api.set(sub({ status: "canceled" }));
    await handleBillingEvent(evt("evt_5", "customer.subscription.deleted", sub({ status: "canceled" })), api.deps);
    const row = world.rows.get(USER)!;
    assert.equal(row.status, "canceled");
    assert.equal(planFromBilling({ plan: row.plan as "Pro", status: row.status, past_due_since: row.past_due_since }), "Free");
  });
});

test("a processing failure rolls back the event id so Stripe's retry applies it", async () => {
  const world = billingWorld({ failUpsert: 1 });
  const api = stripeSubs(sub());
  await withWorld(world, async () => {
    const { payload, header } = signed(evt("evt_1", "checkout.session.completed", checkoutDone()));
    assert.equal((await processBillingWebhook(payload, header, SECRET, api.deps)).status, 500);
    assert.equal(world.events.size, 0);
    assert.equal((await processBillingWebhook(payload, header, SECRET, api.deps)).body.result, "processed");
    assert.equal(world.rows.get(USER)?.status, "active");
  });
});

test("ignored: connected-account events, payment-mode sessions, unknown users and unhandled types", async () => {
  const world = billingWorld();
  const api = stripeSubs(sub({ customer: "cus_unknown", userId: "not-a-uuid" }));
  await withWorld(world, async () => {
    assert.equal(await handleBillingEvent(evt("e1", "checkout.session.completed", checkoutDone(), { account: "acct_creator" }), api.deps), "ignored");
    assert.equal(await handleBillingEvent(evt("e2", "checkout.session.completed", checkoutDone({ mode: "payment" })), api.deps), "ignored");
    assert.equal(await handleBillingEvent(evt("e3", "charge.refunded", {}), api.deps), "ignored");
    assert.equal(await handleBillingEvent(evt("e4", "customer.subscription.updated", sub({ customer: "cus_unknown", userId: "not-a-uuid" })), api.deps), "ignored");
    assert.equal(world.rows.size, 0);
  });
});

test("a different user's client_reference_id cannot take over a customer that already belongs to someone", async () => {
  const world = billingWorld();
  const api = stripeSubs(sub());
  await withWorld(world, async () => {
    await handleBillingEvent(evt("e1", "checkout.session.completed", checkoutDone()), api.deps);
    await handleBillingEvent(evt("e2", "checkout.session.completed", checkoutDone({ client_reference_id: OTHER_USER })), api.deps);
    assert.equal(world.rows.has(OTHER_USER), false);
    assert.equal(world.rows.get(USER)?.stripe_customer_id, "cus_1");
  });
});

// ---- Downgrade enforcement: limits follow the plan, nothing is deleted ------------------------

test("limits follow the stored plan: Pro lifts the post cap and the account cap; Free again blocks only NEW items", async () => {
  const { createFakePool, installFakePool } = await import("../test-utils/fakePool.ts");
  const { accountLimitError, monthlyAutoDmLimit, planForUser, scheduledPostLimitError } = await import("./planLimits.ts");
  const { saveBioPage } = await import("./bioPage.ts");
  let billingRow: Record<string, unknown> | null = { plan: "Pro", status: "active", past_due_since: null };
  const { pool } = createFakePool([
    { match: /^select plan, status, past_due_since from socialapp\.billing_subscriptions/, reply: () => (billingRow ? [billingRow] : []) },
    { match: /^select count\(\*\)::int as n from socialapp\.scheduled_posts/, reply: () => [{ n: 40 }] },
    { match: /from socialapp\.social_accounts where user_id=\$1 and status <> 'disconnected'/, reply: (p) => [{ social: 4, youtube: 0, already: p[3] === "ig-existing" }] },
    { match: /from socialapp\.referrals where referrer_user_id=\$1/, reply: () => [{ n: 0 }] },
    { match: /^select count\(\*\)::int as n from socialapp\.bio_links/, reply: () => [{ n: 12 }] },
  ]);
  const restore = installFakePool(pool);
  try {
    assert.equal(await planForUser(USER), "Pro");
    assert.equal(await scheduledPostLimitError(USER, new Date("2026-12-15T10:00:00Z")), null, "Pro = unlimited scheduling");
    assert.equal(await accountLimitError(USER, { kind: "social", platform: "threads", externalId: "new" }), null, "4 of 5 on Pro");
    assert.equal((await monthlyAutoDmLimit(USER)).limit, 2500);

    // Past due beyond the grace period, or canceled: back to Free limits.
    billingRow = { plan: "Pro", status: "past_due", past_due_since: new Date(Date.now() - 8 * DAY) };
    assert.equal(await planForUser(USER), "Free");
    billingRow = { plan: "Pro", status: "canceled", past_due_since: null };
    assert.match((await scheduledPostLimitError(USER, new Date("2026-12-15T10:00:00Z"))) ?? "", /Free plan includes 10 scheduled posts.*Upgrade to Pro/);
    assert.match((await accountLimitError(USER, { kind: "social", platform: "threads", externalId: "new" })) ?? "", /Free plan includes 2 connected accounts/);
    assert.equal(await accountLimitError(USER, { kind: "social", platform: "instagram", externalId: "ig-existing" }), null, "reconnecting a kept account still works");
    assert.equal((await monthlyAutoDmLimit(USER)).limit, 500);
    billingRow = null;
    assert.equal(await planForUser(USER), "Free");
  } finally {
    restore();
  }

  // Bio page: 12 links kept from Pro can still be saved on Free (no link added); adding a 13th is refused.
  const saved: string[] = [];
  const bio = createFakePool([
    { match: /^select plan, status, past_due_since from socialapp\.billing_subscriptions/, reply: () => [] },
    { match: /^select count\(\*\)::int as n from socialapp\.bio_links/, reply: () => [{ n: 12 }] },
    { match: /^insert into socialapp\.bio_pages/, reply: () => [{ id: "page-1" }] },
    { match: /^select l\.id, l\.label, l\.url/, reply: () => [] },
    { match: /^insert into socialapp\.bio_links/, reply: () => { saved.push("link"); return []; } },
    { match: /^update socialapp\.bio_links/, reply: () => [] },
    { match: /^select exists|^select 1 from socialapp\.links|short_code/, reply: () => [] },
  ]);
  const restoreBio = installFakePool(bio.pool);
  try {
    const links = (n: number) => Array.from({ length: n }, (_, i) => ({ label: `Link ${i}`, url: `https://example.com/${i}` }));
    const input = (n: number) => ({ handle: "demo", displayName: "Demo", bio: "", links: links(n), theme: "default", published: true });
    await assert.rejects(saveBioPage(USER, input(13) as never), /Free plan includes 5 links.*upgrade/);
    await saveBioPage(USER, input(12) as never).catch((err: Error) => {
      // Any later failure must not be the plan check.
      assert.doesNotMatch(err.message, /plan includes/);
    });
  } finally {
    restoreBio();
  }
});
