// Saves the seller's payout country (Settings, Payments). It routes payments:
// India -> Direct UPI, Stripe countries -> Stripe Connect, anything else -> not available yet.
import { NextResponse } from "next/server";

import { BRAND } from "@/lib/brand";
import { isDbConfigured } from "@/lib/db";
import { STRIPE_COUNTRY_CODES, UPI_COUNTRY } from "@/lib/upi";
import { saveSellerCountry } from "@/lib/upiOrders";
import { getWorkspaceUserAtLeast } from "@/lib/workspace";

const back = (status: string) => NextResponse.redirect(new URL(`/app/settings?payments=${status}#payments-heading`, BRAND.url), 303);
const ALLOWED = new Set<string>([...STRIPE_COUNTRY_CODES, UPI_COUNTRY, "OTHER"]);

export async function POST(request: Request) {
  const user = await getWorkspaceUserAtLeast("owner");
  if (!user) return NextResponse.redirect(new URL("/login", BRAND.url), 303);
  if (!isDbConfigured()) return back("not_configured");
  const form = await request.formData().catch(() => null);
  const country = String(form?.get("country") ?? "").toUpperCase();
  if (!ALLOWED.has(country)) return back("country_error");
  try {
    await saveSellerCountry(user.id, country);
  } catch (err) {
    console.error("save payout country failed for user", user.id, err instanceof Error ? err.message : err);
    return back("upi_error");
  }
  return back("country");
}
