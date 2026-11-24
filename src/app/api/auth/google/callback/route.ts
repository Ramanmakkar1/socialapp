import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { startSession } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { isDbConfigured } from "@/lib/db";
import {
  GOOGLE_COOKIE,
  GOOGLE_COOKIE_PATH,
  GoogleSignInError,
  exchangeGoogleCode,
  findOrCreateGoogleUser,
  isGoogleConfigured,
  openFlow,
} from "@/lib/googleAuth";
import { clientIp, rateLimit } from "@/lib/rateLimit";
import { attributeReferralFromCookie } from "@/lib/referralCookie";
import { INVITE_COOKIE, invitePath } from "@/lib/inviteCookie";

function toLogin(reason: string) {
  return NextResponse.redirect(new URL(`/login?google=${reason}`, BRAND.url));
}

function sameString(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

// Google redirects here with ?code&state. On success the user gets a normal Poskoo session.
export async function GET(request: Request) {
  if (!isGoogleConfigured() || !isDbConfigured()) return toLogin("not_configured");
  const ip = clientIp(request.headers);
  const limited = rateLimit(`google-callback:${ip}`, 30, 15 * 60 * 1000);
  if (!limited.ok) return toLogin("rate_limited");

  const url = new URL(request.url);
  const store = await cookies();
  const flow = openFlow(store.get(GOOGLE_COOKIE)?.value);
  store.delete({ name: GOOGLE_COOKIE, path: GOOGLE_COOKIE_PATH });
  if (url.searchParams.get("error")) return toLogin("cancelled");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!flow || !code || !state || !sameString(state, flow.state)) return toLogin("state");

  try {
    const identity = await exchangeGoogleCode(code, flow);
    const user = await findOrCreateGoogleUser(identity);
    await attributeReferralFromCookie(user.id);
    await startSession(user.id, request.headers.get("user-agent") ?? undefined);
  } catch (err) {
    if (err instanceof GoogleSignInError) return toLogin(err.reason);
    console.error("google sign-in failed", err instanceof Error ? err.message.slice(0, 120) : "unknown");
    return toLogin("error");
  }
  // A team invite opened while logged out (src/lib/inviteCookie.ts): back to it to accept.
  return NextResponse.redirect(new URL(invitePath((request.headers.get("cookie") ?? "").split(/;\s*/).find((c) => c.startsWith(`${INVITE_COOKIE}=`))?.slice(INVITE_COOKIE.length + 1)) ?? "/app", BRAND.url));
}
