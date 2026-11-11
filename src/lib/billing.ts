// Poskoo's own subscription billing (Pro / Agency) on the PLATFORM Stripe account. Server only.
// Separate from the creator-products Stripe Connect code (src/lib/stripeConnect.ts, orders.ts):
// nothing here uses a connected account. Table: billing_subscriptions (migration 043).
// Prices are found by lookup_key (scripts/stripe-setup-billing.mjs creates them); never hardcoded ids.
import type pg from "pg";
import type Stripe from "stripe";
import { BRAND } from "@/lib/brand";
import { getPool, isDbConfigured, query } from "@/lib/db";
import { getStripe, isStripeConfigured } from "@/lib/payments";
import {
  endsAt,
  lookupKeyFor,
  shouldApplySubscription,
  subscriptionState,
  type BillingInterval,
  type PaidPlan,
  type SubscriptionState,
} from "@/lib/billingState";

export const BILLING_PATH = "/app/settings/billing";
/** Metadata tag the setup script puts on the Customer Portal configuration it manages. */
export const PORTAL_CONFIG_TAG = "poskoo_billing_portal_v1";

export function isBillingConfigured(): boolean {
  return isStripeConfigured() && isDbConfigured();
}

export type StoredBilling = {
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  plan: PaidPlan | null;
  billing_interval: BillingInterval | null;
  status: string | null;
  price_lookup_key: string | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  cancel_at: Date | null;
  past_due_since: Date | null;
  updated_at: Date;
};

type Db = Pick<pg.PoolClient, "query">;

const COLUMNS =
  "user_id, stripe_customer_id, stripe_subscription_id, plan, billing_interval, status, price_lookup_key, current_period_end, cancel_at_period_end, cancel_at, past_due_since, updated_at";

export async function getBilling(userId: string): Promise<StoredBilling | null> {
  const rows = await query<StoredBilling>(`select ${COLUMNS} from socialapp.billing_subscriptions where user_id=$1`, [userId]);
  return rows[0] ?? null;
}

// ---- Prices (by lookup_key, cached) ---------------------------------------------------------

type CachedPrice = { id: string; at: number };
const priceCache = new Map<string, CachedPrice>();
const PRICE_TTL_MS = 10 * 60 * 1000;

/**
 * Active price id for a plan + interval, looked up by lookup_key (poskoo_pro_monthly ...).
 * Cached 10 minutes. Throws a clear error when the setup script has not been run on this account.
 */
export async function resolvePriceId(plan: PaidPlan, interval: BillingInterval, stripe: Pick<Stripe, "prices"> = getStripe(), now = Date.now()): Promise<string> {
  const key = lookupKeyFor(plan, interval);
  const hit = priceCache.get(key);
  if (hit && now - hit.at < PRICE_TTL_MS) return hit.id;
  const list = await stripe.prices.list({ lookup_keys: [key], active: true, limit: 1 });
  const price = list.data[0];
  if (!price) throw new Error(`No active Stripe price with lookup_key ${key}. Run scripts/stripe-setup-billing.mjs for this Stripe account.`);
  priceCache.set(key, { id: price.id, at: now });
  return price.id;
}

export function clearPriceCache(): void {
  priceCache.clear();
}

// ---- Customer ---------------------------------------------------------------------------------

/** The user's Stripe customer on the platform account, created once (idempotency key per user). */
export async function ensureCustomer(user: { id: string; email: string; name: string | null }, stripe: Pick<Stripe, "customers"> = getStripe()): Promise<string> {
  const existing = await getBilling(user.id);
  if (existing) return existing.stripe_customer_id;
  const customer = await stripe.customers.create(
    { email: user.email, name: user.name ?? undefined, metadata: { poskoo_user_id: user.id } },
    { idempotencyKey: `poskoo-billing-customer-${user.id}` },
  );
  await query(
    `insert into socialapp.billing_subscriptions (user_id, stripe_customer_id) values ($1, $2)
     on conflict (user_id) do nothing`,
    [user.id, customer.id],
  );
  return (await getBilling(user.id))?.stripe_customer_id ?? customer.id;
}

// ---- Checkout + portal ------------------------------------------------------------------------

// Tags Poskoo's subscription Checkout Sessions in the Dashboard (fixed random suffix: one flow).
const CHECKOUT_TAG = "poskoo_plan_checkout_vbqtrnxe";

/** Stripe Tax only when the owner switched it on (needs an active registration, see docs/ENV-NEEDED.md). */
export function taxEnabled(): boolean {
  return process.env.STRIPE_TAX_ENABLED === "true";
}

export function checkoutSessionParams(input: { userId: string; customerId: string; priceId: string; plan: PaidPlan; interval: BillingInterval; baseUrl?: string }): Stripe.Checkout.SessionCreateParams {
  const base = input.baseUrl ?? BRAND.url;
  const params: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    customer: input.customerId,
    client_reference_id: input.userId,
    line_items: [{ price: input.priceId, quantity: 1 }],
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    // Keep the customer's saved name/address in sync with what they type in Checkout (needed for tax).
    customer_update: { address: "auto", name: "auto" },
    subscription_data: { metadata: { poskoo_user_id: input.userId, poskoo_plan: input.plan, poskoo_interval: input.interval } },
    metadata: { poskoo_user_id: input.userId, poskoo_plan: input.plan, poskoo_interval: input.interval },
    success_url: `${base}${BILLING_PATH}?upgraded=1&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}${BILLING_PATH}?canceled=1`,
    integration_identifier: CHECKOUT_TAG,
  };
  if (taxEnabled()) params.automatic_tax = { enabled: true };
  return params;
}

/**
 * Stripe-hosted Checkout URL for a new subscription. A user who already has a live subscription
 * gets the Customer Portal instead (plan changes happen there; never two subscriptions).
 */
export async function startCheckout(user: { id: string; email: string; name: string | null }, plan: PaidPlan, interval: BillingInterval): Promise<{ url: string; kind: "checkout" | "portal" }> {
  const stored = await getBilling(user.id);
  if (stored?.stripe_subscription_id && ["active", "trialing", "past_due", "unpaid", "paused"].includes(stored.status ?? "")) {
    return { url: await portalUrl(user.id), kind: "portal" };
  }
  const stripe = getStripe();
  const customerId = await ensureCustomer(user, stripe);
  const priceId = await resolvePriceId(plan, interval, stripe);
  const session = await stripe.checkout.sessions.create(checkoutSessionParams({ userId: user.id, customerId, priceId, plan, interval }));
  if (!session.url) throw new Error("Stripe returned no Checkout URL");
  return { url: session.url, kind: "checkout" };
}

let portalConfigCache: { id: string | null; at: number } | null = null;

/** Portal configuration made by the setup script (env STRIPE_PORTAL_CONFIGURATION_ID overrides). */
export async function portalConfigurationId(stripe: Pick<Stripe, "billingPortal"> = getStripe()): Promise<string | null> {
  if (process.env.STRIPE_PORTAL_CONFIGURATION_ID) return process.env.STRIPE_PORTAL_CONFIGURATION_ID;
  if (portalConfigCache && Date.now() - portalConfigCache.at < PRICE_TTL_MS) return portalConfigCache.id;
  let id: string | null = null;
  for await (const c of stripe.billingPortal.configurations.list({ active: true, limit: 100 })) {
    if (c.metadata?.poskoo === PORTAL_CONFIG_TAG) {
      id = c.id;
      break;
    }
  }
  portalConfigCache = { id, at: Date.now() };
  return id;
}

/** Customer Portal session (switch plan / interval, cancel at period end, card, invoices). */
export async function portalUrl(userId: string): Promise<string> {
  const stored = await getBilling(userId);
  if (!stored) throw new Error("This account has no Stripe customer yet");
  const stripe = getStripe();
  const configuration = await portalConfigurationId(stripe);
  const session = await stripe.billingPortal.sessions.create({
    customer: stored.stripe_customer_id,
    return_url: `${BRAND.url}${BILLING_PATH}?portal=1`,
    ...(configuration ? { configuration } : {}),
  });
  return session.url;
}

// ---- Recording subscription state -------------------------------------------------------------

export type ApplyResult = { applied: boolean; userId: string | null; state: SubscriptionState };

/** Fetches the subscription fresh from Stripe (state is never taken from a possibly stale payload). */
export async function fetchSubscription(id: string, stripe: Pick<Stripe, "subscriptions"> = getStripe()): Promise<Stripe.Subscription> {
  return stripe.subscriptions.retrieve(id, { expand: ["items.data.price.product"] });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Which Poskoo user a subscription belongs to: the user whose row holds its Stripe customer
 * (the customer Poskoo created), else the hint (Checkout's client_reference_id), else
 * metadata.poskoo_user_id. The user must exist.
 */
export async function resolveBillingUser(db: Db, customerId: string, hints: (string | null | undefined)[]): Promise<string | null> {
  const byCustomer = await db.query<{ user_id: string }>("select user_id from socialapp.billing_subscriptions where stripe_customer_id=$1", [customerId]);
  if (byCustomer.rows[0]) return byCustomer.rows[0].user_id;
  for (const hint of hints) {
    if (!hint || !UUID.test(hint)) continue;
    const user = await db.query<{ id: string }>("select id from socialapp.users where id=$1", [hint]);
    if (user.rows[0]) return user.rows[0].id;
  }
  return null;
}

/**
 * Stores a subscription's state for a user (inside the caller's transaction). A non-live
 * duplicate subscription never overwrites a live one. past_due_since starts at the first
 * past_due sighting of that subscription and is cleared when it recovers.
 */
export async function applySubscriptionState(db: Db, userId: string, s: SubscriptionState): Promise<boolean> {
  const prev = await db.query<{ stripe_subscription_id: string | null; status: string | null }>(
    "select stripe_subscription_id, status from socialapp.billing_subscriptions where user_id=$1 for update",
    [userId],
  );
  if (!shouldApplySubscription(prev.rows[0] ?? null, s)) return false;
  await db.query(
    `insert into socialapp.billing_subscriptions as b
       (user_id, stripe_customer_id, stripe_subscription_id, plan, billing_interval, status, price_lookup_key,
        current_period_end, cancel_at_period_end, cancel_at, past_due_since, updated_at)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, case when $6 = 'past_due' then now() end, now())
     on conflict (user_id) do update set
       stripe_customer_id = excluded.stripe_customer_id,
       stripe_subscription_id = excluded.stripe_subscription_id,
       plan = coalesce(excluded.plan, b.plan),
       billing_interval = coalesce(excluded.billing_interval, b.billing_interval),
       status = excluded.status,
       price_lookup_key = excluded.price_lookup_key,
       current_period_end = excluded.current_period_end,
       cancel_at_period_end = excluded.cancel_at_period_end,
       cancel_at = excluded.cancel_at,
       past_due_since = case when excluded.status = 'past_due'
         then coalesce(case when b.status = 'past_due' and b.stripe_subscription_id = excluded.stripe_subscription_id then b.past_due_since end, now())
         end,
       updated_at = now()`,
    [
      userId,
      s.customerId,
      s.subscriptionId,
      s.plan,
      s.interval,
      s.status,
      s.lookupKey,
      s.currentPeriodEnd?.toISOString() ?? null,
      s.cancelAtPeriodEnd,
      s.cancelAt?.toISOString() ?? null,
    ],
  );
  return true;
}

/** E-mails that follow a stored state (each at most once, see emailNotify.notifyBillingState). */
export function notifyBillingAfterApply(userId: string, s: SubscriptionState): void {
  void import("@/lib/emailNotify")
    .then((m) => m.inBackground("billing", () => m.notifyBillingState(userId, { ...s, endsAt: endsAt(s) })))
    .catch(() => undefined);
}

/**
 * Pulls one subscription from Stripe and records it (own transaction). Used by the success
 * page (so a slow or missing webhook never leaves a paying user on Free) and by the billing
 * page refresh. `expectedUserId` must match the resolved owner, or nothing is written.
 */
export async function syncSubscription(subscriptionId: string, expectedUserId: string, deps: { fetch?: (id: string) => Promise<Stripe.Subscription> } = {}): Promise<ApplyResult> {
  const sub = await (deps.fetch ?? ((id: string) => fetchSubscription(id)))(subscriptionId);
  const state = subscriptionState(sub);
  const client = await getPool().connect();
  let applied = false;
  let userId: string | null = null;
  try {
    await client.query("begin");
    userId = await resolveBillingUser(client, state.customerId, [sub.metadata?.poskoo_user_id]);
    if (userId === expectedUserId) applied = await applySubscriptionState(client, userId, state);
    await client.query("commit");
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
  if (applied && userId) notifyBillingAfterApply(userId, state);
  return { applied, userId, state };
}

/**
 * Success page: the Checkout Session is retrieved server-side and must belong to this user
 * (client_reference_id) before its subscription is recorded. Idempotent.
 */
export async function syncFromCheckoutSession(sessionId: string, userId: string): Promise<"recorded" | "not_paid" | "not_yours" | "skipped"> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return "not_yours";
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.client_reference_id !== userId || session.mode !== "subscription") return "not_yours";
  if (session.status !== "complete") return "not_paid";
  const subId = typeof session.subscription === "string" ? session.subscription : session.subscription?.id;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
  if (!subId || !customerId) return "not_paid";
  // The customer row exists already (created before Checkout); make sure, in case it was created elsewhere.
  await query(
    "insert into socialapp.billing_subscriptions (user_id, stripe_customer_id) values ($1, $2) on conflict (user_id) do nothing",
    [userId, customerId],
  );
  const result = await syncSubscription(subId, userId);
  return result.applied ? "recorded" : "skipped";
}

/** Billing page: re-read the stored subscription from Stripe when it may be stale (portal changes, missed webhooks). */
export async function refreshStoredSubscription(userId: string, maxAgeMs = 60_000): Promise<void> {
  const stored = await getBilling(userId);
  if (!stored?.stripe_subscription_id) return;
  if (Date.now() - new Date(stored.updated_at).getTime() < maxAgeMs) return;
  await syncSubscription(stored.stripe_subscription_id, userId);
}
