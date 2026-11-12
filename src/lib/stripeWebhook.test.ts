import assert from "node:assert/strict";
import { test } from "node:test";
import type pg from "pg";
import Stripe from "stripe";
import { ordersCsv, recordSessionFromSuccessPage, type OrderRow } from "./orders.ts";
import { processStripeWebhook } from "./stripeWebhook.ts";

const SECRET = "whsec_test_secret";
const SELLER = "22222222-2222-4222-8222-222222222222";
const PRODUCT = "11111111-1111-4111-8111-111111111111";
const ACCT = "acct_creator123";
const OTHER_SELLER = "33333333-3333-4333-8333-333333333333";
const OTHER_ACCT = "acct_othercreator";

type Order = { account: string | null; session: string; pi: string | null; status: string; amount: number; fee: number; refunded: number; email: string | null; user_id: string; product_id: string | null; title: string };

/** Tiny transactional fake for stripe_events / products / orders: writes apply on commit, vanish on rollback. */
function ordersWorld(opts: { failOrderInsert?: number } = {}) {
  const events = new Set<string>();
  const orders: Order[] = [];
  let failures = opts.failOrderInsert ?? 0;
  const run = async (staged: (() => void)[] | null, sql: string, p: unknown[] = []) => {
    const s = sql.replace(/\s+/g, " ").trim();
    const apply = (fn: () => void) => (staged ? staged.push(fn) : fn());
    if (/^insert into socialapp\.stripe_events/.test(s)) {
      if (events.has(String(p[0]))) return { rows: [] };
      apply(() => events.add(String(p[0])));
      return { rows: [{ id: p[0] }] };
    }
    if (/^select user_id from socialapp\.stripe_accounts where stripe_account_id=\$1/.test(s)) {
      const owner = p[0] === ACCT ? SELLER : p[0] === OTHER_ACCT ? OTHER_SELLER : null;
      return { rows: owner ? [{ user_id: owner }] : [] };
    }
    if (/^select id, title, user_id from socialapp\.products/.test(s)) {
      return { rows: p[0] === PRODUCT ? [{ id: PRODUCT, title: "My Ebook", user_id: SELLER }] : [] };
    }
    if (/^insert into socialapp\.orders/.test(s)) {
      if (failures > 0) {
        failures -= 1;
        throw new Error("db down");
      }
      apply(() => {
        const existing = orders.find((o) => o.session === p[3]);
        if (existing) {
          existing.pi ??= (p[4] as string | null);
          existing.email ??= (p[5] as string | null);
          if (existing.status === "pending") existing.status = String(p[9]);
          return;
        }
        orders.push({ account: p[10] as string | null, user_id: String(p[0]), product_id: p[1] as string | null, title: String(p[2]), session: String(p[3]), pi: p[4] as string | null, email: p[5] as string | null, amount: Number(p[6]), fee: Number(p[7]), status: String(p[9]), refunded: 0 });
      });
      return { rows: [] };
    }
    if (/^update socialapp\.orders set amount_refunded_cents/.test(s)) {
      apply(() => orders.filter((o) => o.pi === p[0] && o.user_id === p[3]).forEach((o) => {
        o.refunded = Number(p[1]);
        if (!["disputed", "dispute_lost"].includes(o.status)) o.status = String(p[2]);
      }));
      return { rows: [] };
    }
    if (/^update socialapp\.orders set status=\$2/.test(s)) {
      apply(() => orders.filter((o) => o.pi === p[0] && o.user_id === p[2]).forEach((o) => { o.status = String(p[1]); }));
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
  return { pool, events, orders };
}

async function withWorld<T>(world: ReturnType<typeof ordersWorld>, fn: () => Promise<T>): Promise<T> {
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

const session = (over: Record<string, unknown> = {}) => ({
  id: "cs_test_123",
  object: "checkout.session",
  mode: "payment",
  payment_status: "paid",
  amount_total: 1999,
  currency: "usd",
  payment_intent: "pi_123",
  customer_details: { email: "buyer@example.com" },
  metadata: { poskoo_product_id: PRODUCT, poskoo_seller_user_id: SELLER, poskoo_fee_cents: "60" },
  ...over,
});
// Direct charges: events come from the creator's connected account (Connect endpoint).
const evt = (id: string, type: string, object: object, account: string | null = ACCT) => ({ id, object: "event", type, ...(account ? { account } : {}), data: { object } });

test("webhook rejects missing, forged and wrong-secret signatures without touching the DB", async () => {
  const world = ordersWorld();
  await withWorld(world, async () => {
    const { payload, header } = signed(evt("evt_1", "checkout.session.completed", session()));
    assert.equal((await processStripeWebhook(payload, null, SECRET)).status, 400);
    assert.equal((await processStripeWebhook(payload, "t=1,v1=deadbeef", SECRET)).status, 400);
    assert.equal((await processStripeWebhook(payload, header, "whsec_other")).status, 400);
    // Body tampered after signing.
    assert.equal((await processStripeWebhook(payload.replace("1999", "1"), header, SECRET)).status, 400);
    assert.equal((await processStripeWebhook(payload, header, undefined)).status, 503);
    assert.equal(world.orders.length, 0);
    assert.equal(world.events.size, 0);
  });
});

test("checkout.session.completed records one paid order with the fee; a replayed event is a no-op", async () => {
  const world = ordersWorld();
  await withWorld(world, async () => {
    const { payload, header } = signed(evt("evt_1", "checkout.session.completed", session()));
    const first = await processStripeWebhook(payload, header, SECRET);
    assert.equal(first.status, 200);
    assert.equal(first.body.result, "processed");
    const again = await processStripeWebhook(payload, header, SECRET);
    assert.equal(again.body.result, "duplicate");
    assert.equal(world.orders.length, 1);
    assert.deepEqual(
      { status: world.orders[0].status, amount: world.orders[0].amount, fee: world.orders[0].fee, email: world.orders[0].email, user: world.orders[0].user_id, title: world.orders[0].title, account: world.orders[0].account },
      { status: "paid", amount: 1999, fee: 60, email: "buyer@example.com", user: SELLER, title: "My Ebook", account: ACCT },
    );
    // A different event for the same session (e.g. the success page) does not duplicate the order.
    await recordSessionFromSuccessPage(session(), { sellerUserId: SELLER, accountId: ACCT });
    assert.equal(world.orders.length, 1);
  });
});

test("a processing failure rolls back the event id so Stripe's retry is processed", async () => {
  const world = ordersWorld({ failOrderInsert: 1 });
  await withWorld(world, async () => {
    const { payload, header } = signed(evt("evt_retry", "checkout.session.completed", session()));
    assert.equal((await processStripeWebhook(payload, header, SECRET)).status, 500);
    assert.equal(world.events.size, 0);
    const retry = await processStripeWebhook(payload, header, SECRET);
    assert.equal(retry.body.result, "processed");
    assert.equal(world.orders.length, 1);
  });
});

test("async payments: pending, then paid; failed; refunds and disputes update the order", async () => {
  const world = ordersWorld();
  await withWorld(world, async () => {
    const send = async (e: object) => {
      const { payload, header } = signed(e);
      return processStripeWebhook(payload, header, SECRET);
    };
    await send(evt("evt_a", "checkout.session.completed", session({ payment_status: "unpaid" })));
    assert.equal(world.orders[0].status, "pending");
    await send(evt("evt_b", "checkout.session.async_payment_succeeded", session()));
    assert.equal(world.orders[0].status, "paid");
    await send(evt("evt_c", "charge.refunded", { object: "charge", payment_intent: "pi_123", amount: 1999, amount_refunded: 500 }));
    assert.equal(world.orders[0].status, "partially_refunded");
    assert.equal(world.orders[0].refunded, 500);
    await send(evt("evt_d", "charge.dispute.created", { object: "dispute", payment_intent: "pi_123", status: "needs_response" }));
    assert.equal(world.orders[0].status, "disputed");
    await send(evt("evt_e", "charge.dispute.closed", { object: "dispute", payment_intent: "pi_123", status: "lost" }));
    assert.equal(world.orders[0].status, "dispute_lost");
    // Paid state never moves a later state back.
    await send(evt("evt_f", "checkout.session.completed", session()));
    assert.equal(world.orders[0].status, "dispute_lost");

    await send(evt("evt_g", "checkout.session.async_payment_failed", session({ id: "cs_test_fail", payment_status: "unpaid", payment_intent: "pi_fail" })));
    assert.equal(world.orders.find((o) => o.session === "cs_test_fail")?.status, "failed");
  });
});

test("sessions that are not Poskoo product sales, claim another seller, or come from the wrong account are ignored", async () => {
  const world = ordersWorld();
  await withWorld(world, async () => {
    const cases: [object, string][] = [
      [session({ id: "cs_other", metadata: {} }), ACCT],
      // Metadata names a seller who does not own the connected account the session lives on.
      [session({ id: "cs_spoof", metadata: { poskoo_product_id: PRODUCT, poskoo_seller_user_id: OTHER_SELLER } }), ACCT],
      // Another creator's account claiming this seller's product.
      [session({ id: "cs_cross" }), OTHER_ACCT],
    ];
    for (const [i, [s, account]] of cases.entries()) {
      const { payload, header } = signed(evt(`evt_x${i}`, "checkout.session.completed", s, account));
      assert.equal((await processStripeWebhook(payload, header, SECRET)).status, 200);
    }
    assert.equal(world.orders.length, 0);
    // A platform-account event (no event.account) and an unknown connected account change nothing.
    for (const [id, account] of [["evt_platform", null], ["evt_unknown", "acct_unknown"]] as const) {
      const { payload, header } = signed(evt(id, "checkout.session.completed", session({ id: `cs_${id}` }), account));
      const out = await processStripeWebhook(payload, header, SECRET);
      assert.equal(out.status, 200);
      assert.equal(out.body.result, "ignored");
    }
    assert.equal(world.orders.length, 0);
    const { payload, header } = signed(evt("evt_ignored", "customer.created", { object: "customer" }));
    assert.equal((await processStripeWebhook(payload, header, SECRET)).body.result, "ignored");
  });
});

test("refunds and disputes from another creator's account never touch this seller's order", async () => {
  const world = ordersWorld();
  await withWorld(world, async () => {
    const send = async (e: object) => {
      const { payload, header } = signed(e);
      return processStripeWebhook(payload, header, SECRET);
    };
    await send(evt("evt_p", "checkout.session.completed", session()));
    await send(evt("evt_r", "charge.refunded", { object: "charge", payment_intent: "pi_123", amount: 1999, amount_refunded: 1999 }, OTHER_ACCT));
    await send(evt("evt_d", "charge.dispute.created", { object: "dispute", payment_intent: "pi_123", status: "needs_response" }, OTHER_ACCT));
    assert.equal(world.orders[0].status, "paid");
    assert.equal(world.orders[0].refunded, 0);
    await send(evt("evt_r2", "charge.refunded", { object: "charge", payment_intent: "pi_123", amount: 1999, amount_refunded: 1999 }));
    assert.equal(world.orders[0].status, "refunded");
  });
});

test("orders CSV is formula-safe with amounts, fee and status", () => {
  const rows: OrderRow[] = [{ id: "o1", created_at: new Date("2026-11-11T10:00:00Z"), buyer_email: "=evil@x.com", product_title: "Ebook", amount_cents: 1999, fee_cents: 60, amount_refunded_cents: 0, currency: "usd", status: "paid", payment_method: "stripe", buyer_name: null, upi_utr: null, order_ref: null }];
  const csv = ordersCsv(rows, "Asia/Kolkata");
  const lines = csv.replace(/^﻿/, "").trim().split("\r\n");
  assert.equal(lines[0], '"date_utc","date_local (Asia/Kolkata)","buyer_email","product","amount","platform_fee","refunded","currency","status","payment_method","upi_utr"');
  assert.equal(lines[1], '"2026-11-11T10:00:00.000Z","2026-11-11 15:30:00","\'=evil@x.com","Ebook","19.99","0.60","0.00","USD","Paid","Stripe",""');
});
