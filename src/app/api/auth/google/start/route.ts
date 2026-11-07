import { NextResponse } from "next/server";
import { BRAND } from "@/lib/brand";
import {
  GOOGLE_COOKIE,
  GOOGLE_COOKIE_MAX_AGE_S,
  GOOGLE_COOKIE_PATH,
  googleAuthorizeUrl,
  isGoogleConfigured,
  newGoogleFlow,
  sealFlow,
} from "@/lib/googleAuth";
import { clientIp, rateLimit } from "@/lib/rateLimit";

// "Continue with Google": sends the browser to Google with state, nonce and a PKCE challenge.
export async function GET(request: Request) {
  if (!isGoogleConfigured()) return NextResponse.redirect(new URL("/login?google=not_configured", BRAND.url));
  const limited = rateLimit(`google-start:${clientIp(request.headers)}`, 30, 15 * 60 * 1000);
  if (!limited.ok) return NextResponse.redirect(new URL("/login?google=rate_limited", BRAND.url));
  const flow = newGoogleFlow();
  const res = NextResponse.redirect(googleAuthorizeUrl(flow));
  res.cookies.set(GOOGLE_COOKIE, sealFlow(flow), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: GOOGLE_COOKIE_PATH,
    maxAge: GOOGLE_COOKIE_MAX_AGE_S,
  });
  return res;
}
