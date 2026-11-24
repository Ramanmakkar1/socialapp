// Starts or resumes Stripe Connect onboarding. POST (Settings form) creates the connected
// account on first use; GET (Stripe's refresh_url, "Continue setup") makes a fresh Account Link.
import { NextResponse } from "next/server";

import { BRAND } from "@/lib/brand";
import { isDbConfigured } from "@/lib/db";
import { isFeatureReady } from "@/lib/featureReadiness";
import { CONNECT_COUNTRIES, ensureConnectedAccount, getConnectedAccount, onboardingLink } from "@/lib/stripeConnect";
import { getWorkspaceUserAtLeast } from "@/lib/workspace";

const back = (status: string) => NextResponse.redirect(new URL(`/app/settings?payments=${status}#payments-heading`, BRAND.url), 303);

async function start(country: string | null) {
  const user = await getWorkspaceUserAtLeast("owner");
  if (!user) return NextResponse.redirect(new URL("/login", BRAND.url), 303);
  // Stripe onboarding only once card payments are live (src/lib/featureReadiness.ts).
  if (!isFeatureReady("card_payments") || !isDbConfigured()) return back("not_configured");
  try {
    let accountId = (await getConnectedAccount(user.id))?.stripe_account_id ?? null;
    if (!accountId) {
      if (!country) return back("error");
      accountId = await ensureConnectedAccount(user, country);
    }
    return NextResponse.redirect(await onboardingLink(accountId), 303);
  } catch (err) {
    console.error("stripe connect onboarding failed for user", user.id, err instanceof Error ? err.message : err);
    return back("error");
  }
}

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const raw = String(form?.get("country") ?? "").toUpperCase();
  const country = CONNECT_COUNTRIES.some((c) => c.code === raw) ? raw : null;
  return start(country);
}

export async function GET() {
  return start(null);
}
