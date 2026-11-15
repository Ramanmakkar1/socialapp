// Admin → Billing (read-only): subscription counts and MRR from the real plan prices in code
// (billingState.PLAN_PRICES), recent Stripe webhook events and failed / abandoned checkouts.
//
// What exists: billing_subscriptions (one row per user who started a checkout) and stripe_events
// (webhook idempotency: id, type, received_at only, no payload). Stripe Checkout Sessions are not
// stored, so an "abandoned checkout" is a customer row whose subscription never started or ended up
// incomplete; the session itself is only visible in Stripe.
import { query } from "@/lib/db";
import { ADMIN_PAGE_SIZE, pageSlice, pageWindow } from "@/lib/adminPaging";
import { PAST_DUE_GRACE_DAYS, PLAN_PRICES, type BillingInterval, type PaidPlan } from "@/lib/billingState";

export type SubscriptionGroup = { plan: PaidPlan | null; billing_interval: BillingInterval | null; status: string | null; in_grace: boolean; started: boolean; n: number };

export type BillingSummary = {
  /** Monthly recurring revenue in USD cents: yearly plans count as a twelfth. */
  mrrCents: number;
  paying: number;
  trialing: number;
  pastDue: number;
  canceled: number;
  abandoned: number;
  byPlan: { plan: PaidPlan; interval: BillingInterval; paying: number; mrrCents: number }[];
  byStatus: { status: string; n: number }[];
};

/** A subscription earns MRR while active, or past_due within the grace period (same rule as planFromBilling). Trials earn nothing yet. */
export function earnsRevenue(g: Pick<SubscriptionGroup, "status" | "in_grace">): boolean {
  return g.status === "active" || (g.status === "past_due" && g.in_grace);
}

export function monthlyCents(plan: PaidPlan, interval: BillingInterval): number {
  const price = PLAN_PRICES[plan][interval];
  return interval === "year" ? Math.round(price / 12) : price;
}

export function summarizeSubscriptions(groups: SubscriptionGroup[]): BillingSummary {
  const out: BillingSummary = { mrrCents: 0, paying: 0, trialing: 0, pastDue: 0, canceled: 0, abandoned: 0, byPlan: [], byStatus: [] };
  const plans = new Map<string, BillingSummary["byPlan"][number]>();
  const statuses = new Map<string, number>();
  for (const g of groups) {
    const status = !g.started ? "checkout not completed" : (g.status ?? "unknown");
    statuses.set(status, (statuses.get(status) ?? 0) + g.n);
    if (!g.started || g.status === "incomplete" || g.status === "incomplete_expired") out.abandoned += g.n;
    if (g.status === "trialing") out.trialing += g.n;
    if (g.status === "past_due" || g.status === "unpaid") out.pastDue += g.n;
    if (g.status === "canceled") out.canceled += g.n;
    if (!g.plan || !g.billing_interval || !earnsRevenue(g)) continue;
    const each = monthlyCents(g.plan, g.billing_interval);
    out.paying += g.n;
    out.mrrCents += each * g.n;
    const key = `${g.plan}/${g.billing_interval}`;
    const row = plans.get(key) ?? { plan: g.plan, interval: g.billing_interval, paying: 0, mrrCents: 0 };
    row.paying += g.n;
    row.mrrCents += each * g.n;
    plans.set(key, row);
  }
  out.byPlan = [...plans.values()].sort((a, b) => b.mrrCents - a.mrrCents);
  out.byStatus = [...statuses.entries()].map(([status, n]) => ({ status, n })).sort((a, b) => b.n - a.n);
  return out;
}

export async function getBillingSummary(): Promise<BillingSummary> {
  const groups = await query<SubscriptionGroup>(
    `select plan, billing_interval, status,
            (status = 'past_due' and coalesce(past_due_since, now()) > now() - ($1::int * interval '1 day')) as in_grace,
            (stripe_subscription_id is not null) as started,
            count(*)::int as n
       from socialapp.billing_subscriptions
      group by 1, 2, 3, 4, 5`,
    [PAST_DUE_GRACE_DAYS],
  );
  return summarizeSubscriptions(groups);
}

export type StripeEventRow = { id: string; type: string; received_at: Date };

/** Newest first (stripe_events_received_idx, migration 051). Shared by the billing and creator-checkout webhooks. */
export async function listStripeEvents(page: number): Promise<{ rows: StripeEventRow[]; hasNext: boolean }> {
  const { limit, offset } = pageWindow(page);
  const rows = await query<StripeEventRow>("select id, type, received_at from socialapp.stripe_events order by received_at desc, id limit $1 offset $2", [limit, offset]);
  return pageSlice(rows, ADMIN_PAGE_SIZE);
}

export type ProblemCheckout = {
  user_id: string;
  email: string;
  plan: PaidPlan | null;
  billing_interval: BillingInterval | null;
  status: string | null;
  started: boolean;
  past_due_since: Date | null;
  created_at: Date;
  updated_at: Date;
};

/** Checkouts that never became a subscription, incomplete ones, and failing renewals (past_due / unpaid). */
export async function listProblemCheckouts(page: number): Promise<{ rows: ProblemCheckout[]; hasNext: boolean }> {
  const { limit, offset } = pageWindow(page);
  const rows = await query<ProblemCheckout>(
    `select b.user_id, u.email, b.plan, b.billing_interval, b.status, (b.stripe_subscription_id is not null) as started,
            b.past_due_since, b.created_at, b.updated_at
       from socialapp.billing_subscriptions b
       join socialapp.users u on u.id = b.user_id
      where b.stripe_subscription_id is null or b.status in ('incomplete','incomplete_expired','past_due','unpaid')
      order by b.updated_at desc, b.user_id
      limit $1 offset $2`,
    [limit, offset],
  );
  return pageSlice(rows, ADMIN_PAGE_SIZE);
}
