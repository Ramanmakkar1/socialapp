// Stripe webhook: a CONNECT ("Connected accounts") endpoint, because direct charges and their
// events live on the creators' connected accounts (event.account). Subscribe to: checkout.session.completed,
// checkout.session.async_payment_succeeded, checkout.session.async_payment_failed,
// charge.refunded, charge.dispute.created, charge.dispute.closed.
import { isDbConfigured } from "@/lib/db";
import { processStripeWebhook } from "@/lib/stripeWebhook";

export async function POST(request: Request) {
  if (!isDbConfigured()) return Response.json({ error: "not configured" }, { status: 503 });
  // The signature covers the exact bytes Stripe sent: read the raw text, never parsed JSON.
  const raw = await request.text();
  const outcome = await processStripeWebhook(raw, request.headers.get("stripe-signature"));
  return Response.json(outcome.body, { status: outcome.status });
}
