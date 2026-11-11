// Webhook for Poskoo's OWN subscriptions: a "Your account" endpoint (platform events), separate
// from the Connect endpoint (/api/stripe/webhook, src/lib/stripeWebhook.ts) and with its own
// secret STRIPE_BILLING_WEBHOOK_SECRET. Kept apart from the route so it is unit tested.
import Stripe from "stripe";
import { getPool } from "@/lib/db";
import { applySubscriptionState, fetchSubscription, notifyBillingAfterApply, resolveBillingUser } from "@/lib/billing";
import { subscriptionState } from "@/lib/billingState";

export const BILLING_EVENTS = [
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
] as const;

export type BillingWebhookOutcome = { status: number; body: Record<string, string> };
export type BillingDeps = {
  /** Reads the subscription fresh from Stripe (state never comes from a stale payload). */
  fetchSubscription?: (id: string) => Promise<Stripe.Subscription>;
  /** Post-commit side effects (e-mails). Tests replace it. */
  notify?: (kind: "state" | "payment_failed", userId: string, data: unknown) => void;
};

type EventLike = Pick<Stripe.Event, "id" | "type" | "data"> & { account?: string | null; context?: string | null };

function idOf(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && typeof (v as { id?: unknown }).id === "string") return (v as { id: string }).id;
  return null;
}

/** Subscription id of an invoice: parent.subscription_details (current API) or the legacy field. */
export function invoiceSubscriptionId(invoice: unknown): string | null {
  const inv = invoice as { parent?: { subscription_details?: { subscription?: unknown } | null } | null; subscription?: unknown };
  return idOf(inv.parent?.subscription_details?.subscription) ?? idOf(inv.subscription);
}

/** Which subscription (and user hints) an event is about; null = not ours / nothing to do. */
export function subscriptionRef(event: EventLike): { subscriptionId: string; hints: (string | null)[] } | null {
  const obj = event.data.object as unknown as Record<string, unknown>;
  switch (event.type) {
    case "checkout.session.completed": {
      if (obj.mode !== "subscription") return null;
      const sub = idOf(obj.subscription);
      const meta = obj.metadata as Record<string, string> | null | undefined;
      return sub ? { subscriptionId: sub, hints: [typeof obj.client_reference_id === "string" ? obj.client_reference_id : null, meta?.poskoo_user_id ?? null] } : null;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const meta = obj.metadata as Record<string, string> | null | undefined;
      return typeof obj.id === "string" ? { subscriptionId: obj.id, hints: [meta?.poskoo_user_id ?? null] } : null;
    }
    case "invoice.paid":
    case "invoice.payment_failed": {
      const sub = invoiceSubscriptionId(obj);
      return sub ? { subscriptionId: sub, hints: [] } : null;
    }
    default:
      return null;
  }
}

function defaultNotify(kind: "state" | "payment_failed", userId: string, data: unknown): void {
  if (kind === "state") {
    notifyBillingAfterApply(userId, data as Parameters<typeof notifyBillingAfterApply>[1]);
    return;
  }
  void import("@/lib/emailNotify")
    .then((m) => m.inBackground("billing_failed", () => m.notifyBillingPaymentFailed(userId, data as { invoiceId: string; amountCents: number | null; currency: string | null; plan: string | null })))
    .catch(() => undefined);
}

/**
 * Applies one verified platform event exactly once: the event id goes into stripe_events in
 * the same transaction as the subscription row, so a replay is "duplicate" and a failure rolls
 * both back for Stripe's retry. Events from connected accounts are "ignored" (wrong endpoint).
 */
export async function handleBillingEvent(event: EventLike, deps: BillingDeps = {}): Promise<"processed" | "duplicate" | "ignored"> {
  if (!(BILLING_EVENTS as readonly string[]).includes(event.type)) return "ignored";
  if (event.account || event.context) return "ignored";
  const ref = subscriptionRef(event);
  if (!ref) return "ignored";
  const pool = getPool();
  const seen = await pool.query("select 1 from socialapp.stripe_events where id=$1", [event.id]);
  if (seen.rows.length > 0) return "duplicate";
  const sub = await (deps.fetchSubscription ?? ((id: string) => fetchSubscription(id)))(ref.subscriptionId);
  const state = subscriptionState(sub);
  const client = await pool.connect();
  let userId: string | null = null;
  let applied = false;
  try {
    await client.query("begin");
    const fresh = await client.query("insert into socialapp.stripe_events (id, type) values ($1, $2) on conflict (id) do nothing returning id", [event.id, event.type]);
    if (fresh.rows.length === 0) {
      await client.query("commit");
      return "duplicate";
    }
    userId = await resolveBillingUser(client, state.customerId, [...ref.hints, sub.metadata?.poskoo_user_id ?? null]);
    if (userId) applied = await applySubscriptionState(client, userId, state);
    await client.query("commit");
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
  if (!userId) return "ignored";
  const notify = deps.notify ?? defaultNotify;
  if (applied) notify("state", userId, state);
  if (event.type === "invoice.payment_failed") {
    const inv = event.data.object as unknown as { id: string; amount_due?: number; currency?: string };
    notify("payment_failed", userId, { invoiceId: inv.id, amountCents: inv.amount_due ?? null, currency: inv.currency ?? null, plan: state.plan });
  }
  return "processed";
}

/**
 * Verifies the Stripe-Signature header against the RAW body, then applies the event.
 * 400 bad/missing signature, 503 not configured, 500 processing error (Stripe retries).
 */
export async function processBillingWebhook(rawBody: string, signature: string | null, secret: string | undefined = process.env.STRIPE_BILLING_WEBHOOK_SECRET, deps: BillingDeps = {}): Promise<BillingWebhookOutcome> {
  if (!secret) return { status: 503, body: { error: "billing is not switched on" } };
  if (!signature) return { status: 400, body: { error: "missing signature" } };
  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return { status: 400, body: { error: "invalid signature" } };
  }
  try {
    const result = await handleBillingEvent(event, deps);
    return { status: 200, body: { received: "true", result } };
  } catch (err) {
    console.error("billing webhook failed for event", event.id, err instanceof Error ? err.message : err);
    return { status: 500, body: { error: "processing failed" } };
  }
}
