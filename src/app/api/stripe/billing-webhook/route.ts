// Stripe webhook for Poskoo's OWN Pro / Agency subscriptions: a "Your account" (platform) endpoint
// with its own secret STRIPE_BILLING_WEBHOOK_SECRET. The creator-products Connect webhook is
// /api/stripe/webhook. Subscribe to: checkout.session.completed, customer.subscription.created,
// customer.subscription.updated, customer.subscription.deleted, invoice.paid, invoice.payment_failed.
import { isDbConfigured } from "@/lib/db";
import { processBillingWebhook } from "@/lib/billingWebhook";

export async function POST(request: Request) {
  if (!isDbConfigured() || !process.env.STRIPE_SECRET_KEY) return Response.json({ error: "not configured" }, { status: 503 });
  // The signature covers the exact bytes Stripe sent: read the raw text, never parsed JSON.
  const raw = await request.text();
  const outcome = await processBillingWebhook(raw, request.headers.get("stripe-signature"));
  return Response.json(outcome.body, { status: outcome.status });
}
