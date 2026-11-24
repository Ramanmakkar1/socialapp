// Opens the creator's Stripe Express Dashboard (payouts, balance) with a one-time login link.
import { NextResponse } from "next/server";

import { BRAND } from "@/lib/brand";
import { isStripeConfigured } from "@/lib/payments";
import { expressDashboardLink, getConnectedAccount } from "@/lib/stripeConnect";
import { getWorkspaceUserAtLeast } from "@/lib/workspace";

export async function GET() {
  const user = await getWorkspaceUserAtLeast("owner");
  if (!user) return NextResponse.redirect(new URL("/login", BRAND.url));
  if (!isStripeConfigured()) return NextResponse.redirect(new URL("/app/settings?payments=not_configured#payments-heading", BRAND.url));
  try {
    const account = await getConnectedAccount(user.id);
    if (!account) return NextResponse.redirect(new URL("/app/settings#payments-heading", BRAND.url));
    return NextResponse.redirect(await expressDashboardLink(account.stripe_account_id));
  } catch (err) {
    console.error("stripe dashboard link failed for user", user.id, err instanceof Error ? err.message : err);
    return NextResponse.redirect(new URL("/app/settings?payments=error#payments-heading", BRAND.url));
  }
}
