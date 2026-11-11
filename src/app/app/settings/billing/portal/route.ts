// "Manage billing" (POST): Stripe Customer Portal for the user's platform customer
// (switch Pro/Agency and monthly/yearly, cancel at period end, card, invoices).
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { BILLING_PATH, getBilling, isBillingConfigured, portalUrl } from "@/lib/billing";

const back = (status: string) => NextResponse.redirect(new URL(`${BILLING_PATH}?billing=${status}`, BRAND.url), 303);

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", BRAND.url), 303);
  if (!isBillingConfigured()) return back("not_configured");
  try {
    if (!(await getBilling(user.id))) return back("no_customer");
    return NextResponse.redirect(await portalUrl(user.id), 303);
  } catch (err) {
    console.error("billing portal failed for user", user.id, err instanceof Error ? err.message : err);
    return back("error");
  }
}
