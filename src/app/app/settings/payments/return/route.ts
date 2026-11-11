// Stripe sends the creator back here after onboarding: re-read the account and report.
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { isStripeConfigured } from "@/lib/payments";
import { refreshConnectedAccount } from "@/lib/stripeConnect";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", BRAND.url));
  let status = "not_configured";
  if (isStripeConfigured()) {
    try {
      const account = await refreshConnectedAccount(user.id);
      status = account?.charges_enabled ? "connected" : "pending";
    } catch (err) {
      console.error("stripe account refresh failed for user", user.id, err instanceof Error ? err.message : err);
      status = "error";
    }
  }
  return NextResponse.redirect(new URL(`/app/settings?payments=${status}#payments-heading`, BRAND.url));
}
