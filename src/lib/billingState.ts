// Subscription billing: pure helpers (no DB, no Stripe client), shared by the server code, the
// webhook, the billing page and the tests. Prices are resolved in Stripe by lookup_key; the
// amounts here are only for display and for the setup script's sanity check (owner-approved
// prices, src/lib/plans.ts).
import type Stripe from "stripe";

export type PaidPlan = "Pro" | "Agency";
export type BillingInterval = "month" | "year";
export type SubscriptionStatus = "active" | "trialing" | "past_due" | "canceled" | "incomplete" | "incomplete_expired" | "unpaid" | "paused";

export const PAID_PLANS: readonly PaidPlan[] = ["Pro", "Agency"];
export const BILLING_INTERVALS: readonly BillingInterval[] = ["month", "year"];

/** USD cents per billing period. Pro $17/mo or $168/yr ($14/mo); Agency $35/mo or $348/yr ($29/mo). */
export const PLAN_PRICES: Record<PaidPlan, Record<BillingInterval, number>> = {
  Pro: { month: 1700, year: 16800 },
  Agency: { month: 3500, year: 34800 },
};

/** Days a past_due subscription keeps its paid limits (Stripe keeps retrying the card meanwhile). */
export const PAST_DUE_GRACE_DAYS = 7;

export function lookupKeyFor(plan: PaidPlan, interval: BillingInterval): string {
  return `poskoo_${plan.toLowerCase()}_${interval === "month" ? "monthly" : "yearly"}`;
}

export const ALL_LOOKUP_KEYS: readonly string[] = PAID_PLANS.flatMap((p) => BILLING_INTERVALS.map((i) => lookupKeyFor(p, i)));

export function planFromLookupKey(key: string | null | undefined): { plan: PaidPlan; interval: BillingInterval } | null {
  const m = /^poskoo_(pro|agency)_(monthly|yearly)$/.exec(key ?? "");
  if (!m) return null;
  return { plan: m[1] === "pro" ? "Pro" : "Agency", interval: m[2] === "monthly" ? "month" : "year" };
}

/** Parses ?plan=pro&interval=year style input (case-insensitive). */
export function parsePlanChoice(plan: unknown, interval: unknown): { plan: PaidPlan; interval: BillingInterval } | null {
  const p = typeof plan === "string" ? plan.toLowerCase() : "";
  const i = typeof interval === "string" ? interval.toLowerCase() : "month";
  const paid: PaidPlan | null = p === "pro" ? "Pro" : p === "agency" ? "Agency" : null;
  const int: BillingInterval | null = i === "month" || i === "monthly" ? "month" : i === "year" || i === "yearly" ? "year" : null;
  return paid && int ? { plan: paid, interval: int } : null;
}

/** Yearly saving vs paying monthly for 12 months, in whole percent (Pro 18%, Agency 17%). */
export function yearlySavingPercent(plan: PaidPlan): number {
  const { month, year } = PLAN_PRICES[plan];
  return Math.round((1 - year / (month * 12)) * 100);
}

/** Statuses that hold a paid plan (past_due only during the grace period). */
export function isLiveStatus(status: string | null | undefined): boolean {
  return status === "active" || status === "trialing" || status === "past_due";
}

export type BillingRow = {
  plan: PaidPlan | null;
  status: string | null;
  past_due_since: Date | string | null;
};

/**
 * The plan a user gets from their stored subscription: the paid plan while active or trialing,
 * or past_due for at most PAST_DUE_GRACE_DAYS after the first failed renewal; otherwise Free.
 */
export function planFromBilling(row: BillingRow | null | undefined, now: Date = new Date()): "Free" | PaidPlan {
  if (!row || !row.plan) return "Free";
  if (row.status === "active" || row.status === "trialing") return row.plan;
  if (row.status === "past_due") {
    const since = row.past_due_since ? new Date(row.past_due_since).getTime() : now.getTime();
    if (Number.isNaN(since)) return "Free";
    return now.getTime() - since < PAST_DUE_GRACE_DAYS * 86_400_000 ? row.plan : "Free";
  }
  return "Free";
}

/** When a past_due grace period ends (for the banner). */
export function graceEndsAt(pastDueSince: Date | string | null | undefined): Date | null {
  if (!pastDueSince) return null;
  const t = new Date(pastDueSince).getTime();
  return Number.isNaN(t) ? null : new Date(t + PAST_DUE_GRACE_DAYS * 86_400_000);
}

export type SubscriptionState = {
  subscriptionId: string;
  customerId: string;
  plan: PaidPlan | null;
  interval: BillingInterval | null;
  status: SubscriptionStatus;
  lookupKey: string | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  cancelAt: Date | null;
  /** Unit amount in cents of the current price (for e-mails), null if unknown. */
  amountCents: number | null;
  currency: string | null;
};

type SubLike = Pick<Stripe.Subscription, "id" | "status" | "cancel_at_period_end" | "cancel_at"> & {
  customer: string | { id: string };
  items: { data: Array<Pick<Stripe.SubscriptionItem, "current_period_end"> & { price: Pick<Stripe.Price, "lookup_key" | "unit_amount" | "currency"> & { recurring?: { interval: string } | null; product?: unknown } }> };
};

const KNOWN_STATUS = new Set<SubscriptionStatus>(["active", "trialing", "past_due", "canceled", "incomplete", "incomplete_expired", "unpaid", "paused"]);

/**
 * Maps a Stripe Subscription to what Poskoo stores. The plan comes from the price's lookup_key
 * (poskoo_pro_monthly ...), falling back to the product's metadata.poskoo_plan + the price interval
 * when a price was created without a lookup key. current_period_end lives on the subscription
 * item in current API versions.
 */
export function subscriptionState(sub: SubLike): SubscriptionState {
  const item = sub.items?.data?.[0];
  const price = item?.price;
  let parsed = planFromLookupKey(price?.lookup_key);
  if (!parsed && price) {
    const product = price.product as { metadata?: Record<string, string> } | string | undefined;
    const metaPlan = typeof product === "object" && product ? product.metadata?.poskoo_plan : undefined;
    const interval = price.recurring?.interval;
    if ((metaPlan === "Pro" || metaPlan === "Agency") && (interval === "month" || interval === "year")) parsed = { plan: metaPlan, interval };
  }
  const status = (KNOWN_STATUS.has(sub.status as SubscriptionStatus) ? sub.status : "incomplete") as SubscriptionStatus;
  const periodEnds = (sub.items?.data ?? []).map((i) => i.current_period_end).filter((n): n is number => typeof n === "number");
  return {
    subscriptionId: sub.id,
    customerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
    plan: parsed?.plan ?? null,
    interval: parsed?.interval ?? null,
    status,
    lookupKey: price?.lookup_key ?? null,
    currentPeriodEnd: periodEnds.length ? new Date(Math.min(...periodEnds) * 1000) : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end === true,
    cancelAt: typeof sub.cancel_at === "number" ? new Date(sub.cancel_at * 1000) : null,
    amountCents: typeof price?.unit_amount === "number" ? price.unit_amount : null,
    currency: price?.currency ?? null,
  };
}

/** The date a subscription that is set to cancel will end (cancel_at, or the period end). */
export function endsAt(s: { cancelAtPeriodEnd: boolean; cancelAt: Date | null; currentPeriodEnd: Date | null }): Date | null {
  if (s.cancelAt) return s.cancelAt;
  return s.cancelAtPeriodEnd ? s.currentPeriodEnd : null;
}

/**
 * When the user already has a row for another subscription that is still live, a different
 * subscription that is NOT live (an abandoned/expired duplicate) must not overwrite it.
 */
export function shouldApplySubscription(stored: { stripe_subscription_id: string | null; status: string | null } | null, incoming: { subscriptionId: string; status: string }): boolean {
  if (!stored || !stored.stripe_subscription_id) return true;
  if (stored.stripe_subscription_id === incoming.subscriptionId) return true;
  if (!isLiveStatus(stored.status)) return true;
  return isLiveStatus(incoming.status);
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
