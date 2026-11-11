// "Buy now": creates a Stripe Checkout Session ON the creator's connected account (direct
// charge, application fee = PLATFORM_FEE_BPS) and redirects the buyer to Stripe.
import { NextResponse } from "next/server";
import { BRAND } from "@/lib/brand";
import { isDbConfigured } from "@/lib/db";
import { isStripeConfigured } from "@/lib/payments";
import { createCheckoutUrl, getPublicProduct } from "@/lib/products";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export async function POST(request: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const back = (q = "") => NextResponse.redirect(new URL(`/p/${encodeURIComponent(slug)}${q}`, BRAND.url), 303);
  if (!isStripeConfigured() || !isDbConfigured()) return back();
  const limited = rateLimit(`checkout:${clientIp(request.headers)}`, 20, 10 * 60 * 1000);
  if (!limited.ok) return back("?error=busy");
  try {
    const product = await getPublicProduct(slug);
    if (!product || !product.active || !product.charges_enabled || !product.stripe_account_id) return back();
    return NextResponse.redirect(await createCheckoutUrl(product, product.stripe_account_id), 303);
  } catch (err) {
    console.error("checkout session failed for product", slug, err instanceof Error ? err.message : err);
    return back("?error=checkout");
  }
}
