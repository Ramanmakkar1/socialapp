// Public "Choose Pro / Choose Agency" link target (pricing pages stay static and cacheable).
// Logged in: straight to the billing page with the plan picked. Visitor: remember the choice in a
// 1-hour cookie, then sign up; after sign-up the billing page (and a dashboard banner) picks it up.
// GET never creates a Stripe session: Checkout starts from a POST on the billing page.
import { NextResponse } from "next/server";

import { BRAND } from "@/lib/brand";
import { parsePlanChoice } from "@/lib/billingState";
import { isFeatureReady } from "@/lib/featureReadiness";
import { UPGRADE_INTENT_COOKIE, UPGRADE_INTENT_MAX_AGE, billingChoiceHref, serializeUpgradeIntent } from "@/lib/upgradeIntent";
import { getOwnWorkspaceUser } from "@/lib/workspace";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const choice = parsePlanChoice(url.searchParams.get("plan"), url.searchParams.get("interval") ?? "month");
  if (!choice) return NextResponse.redirect(new URL("/pricing", BRAND.url), 303);
  const user = await getOwnWorkspaceUser().catch(() => null);
  // Paid plans not on sale yet (featureReadiness "billing"): the billing page explains, and a
  // visitor just signs up for Free (no plan remembered, so no "Continue to checkout" banner).
  const paidReady = isFeatureReady("billing");
  if (user) return NextResponse.redirect(new URL(paidReady ? billingChoiceHref(choice) : "/app/settings/billing#plans", BRAND.url), 303);
  const res = NextResponse.redirect(new URL(url.searchParams.get("login") === "1" ? "/login" : "/signup", BRAND.url), 303);
  // Only a real click remembers the choice (never a router/browser prefetch).
  if (!paidReady) return res;
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
