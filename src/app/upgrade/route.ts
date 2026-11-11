// Public "Choose Pro / Choose Agency" link target (pricing pages stay static and cacheable).
// Logged in: straight to the billing page with the plan picked. Visitor: remember the choice in a
// 1-hour cookie, then sign up; after sign-up the billing page (and a dashboard banner) picks it up.
// GET never creates a Stripe session: Checkout starts from a POST on the billing page.
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { parsePlanChoice } from "@/lib/billingState";
import { UPGRADE_INTENT_COOKIE, UPGRADE_INTENT_MAX_AGE, billingChoiceHref, serializeUpgradeIntent } from "@/lib/upgradeIntent";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const choice = parsePlanChoice(url.searchParams.get("plan"), url.searchParams.get("interval") ?? "month");
  if (!choice) return NextResponse.redirect(new URL("/pricing", BRAND.url), 303);
  const user = await getCurrentUser().catch(() => null);
  if (user) return NextResponse.redirect(new URL(billingChoiceHref(choice), BRAND.url), 303);
  const res = NextResponse.redirect(new URL(url.searchParams.get("login") === "1" ? "/login" : "/signup", BRAND.url), 303);
  // Only a real click remembers the choice (never a router/browser prefetch).
  const h = request.headers;
  if (h.get("next-router-prefetch") || h.get("rsc") || h.get("purpose") === "prefetch" || h.get("sec-purpose")?.includes("prefetch")) return res;
  res.cookies.set(UPGRADE_INTENT_COOKIE, serializeUpgradeIntent(choice), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: UPGRADE_INTENT_MAX_AGE,
  });
  return res;
}
