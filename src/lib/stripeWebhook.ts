// Stripe webhook entry point, kept apart from the route so it is unit tested.
import Stripe from "stripe";
import { handleStripeEvent } from "@/lib/orders";

export type WebhookOutcome = { status: number; body: Record<string, string> };

/**
 * Verifies the Stripe-Signature header against the RAW body with STRIPE_WEBHOOK_SECRET, then
 * applies the event once (idempotent on event id). 400 for a bad or missing signature (Stripe
 * does not retry those), 503 when not configured, 500 on a processing error (Stripe retries).
 */
export async function processStripeWebhook(rawBody: string, signature: string | null, secret: string | undefined = process.env.STRIPE_WEBHOOK_SECRET): Promise<WebhookOutcome> {
  if (!secret) return { status: 503, body: { error: "payments are not switched on" } };
  if (!signature) return { status: 400, body: { error: "missing signature" } };
  let event: Stripe.Event;
  try {
    event = Stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch {
    return { status: 400, body: { error: "invalid signature" } };
  }
  try {
    const result = await handleStripeEvent(event);
    return { status: 200, body: { received: "true", result } };
  } catch (err) {
    console.error("stripe webhook failed for event", event.id, err instanceof Error ? err.message : err);
    return { status: 500, body: { error: "processing failed" } };
  }
}
