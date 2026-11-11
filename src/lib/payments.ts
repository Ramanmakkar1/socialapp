// Stripe client for creator product sales (Stripe Connect). Server only.
// Pure money helpers live in src/lib/money.ts (re-exported here).
import Stripe from "stripe";

export {
  DEFAULT_PLATFORM_FEE_BPS,
  SUPPORTED_CURRENCIES,
  centsToInput,
  formatMoney,
  isSupportedCurrency,
  parsePriceToCents,
  platformFeeBps,
  platformFeeCents,
  type Currency,
} from "@/lib/money";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function isStripeWebhookConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

declare global {
  var __poskooStripe: Stripe | undefined;
}

/** Shared Stripe client (SDK default = latest API version). Throws when STRIPE_SECRET_KEY is missing. */
export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
  if (!globalThis.__poskooStripe) {
    globalThis.__poskooStripe = new Stripe(key, {
      appInfo: { name: "Poskoo", url: "https://poskoo.com" },
      maxNetworkRetries: 2,
      timeout: 20_000,
    });
  }
  return globalThis.__poskooStripe;
}
