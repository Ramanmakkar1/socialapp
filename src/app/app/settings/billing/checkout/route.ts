// "Upgrade" (billing page form, POST): Stripe Checkout (mode=subscription) on the PLATFORM account.
// A user who already pays is sent to the Customer Portal instead (plan switches happen there).
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { BILLING_PATH, startCheckout } from "@/lib/billing";
import { isFeatureReady } from "@/lib/featureReadiness";
import { parsePlanChoice } from "@/lib/billingState";
import { UPGRADE_INTENT_COOKIE } from "@/lib/upgradeIntent";

const back = (status: string) => NextResponse.redirect(new URL(`${BILLING_PATH}?billing=${status}`, BRAND.url), 303);

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", BRAND.url), 303);
  // Paid plans launch only with live Stripe keys etc. (src/lib/featureReadiness.ts): never a test checkout.
  if (!isFeatureReady("billing")) return back("not_configured");
  const form = await request.formData().catch(() => null);
  const choice = parsePlanChoice(form?.get("plan"), form?.get("interval"));
  if (!choice) return back("error");
  try {
    const { url } = await startCheckout(user, choice.plan, choice.interval);
    const res = NextResponse.redirect(url, 303);
    res.cookies.delete(UPGRADE_INTENT_COOKIE);
    return res;
  } catch (err) {
    console.error("billing checkout failed for user", user.id, err instanceof Error ? err.message : err);
    return back("error");
  }
}
