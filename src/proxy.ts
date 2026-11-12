// API rate limits (see src/lib/apiRateLimit.ts) and refer and earn: remember the first referral code a visitor arrives with (?ref=CODE on the
// home page or /signup) in the pf_ref cookie for 60 days. First touch wins: a valid existing
// cookie is never overwritten.
import { NextResponse, type NextRequest } from "next/server";
import { REF_COOKIE, normalizeCode, parseRefCookie, refCookieOptions, refCookieValue } from "@/lib/referralCode";
import { apiTier } from "@/lib/apiRateLimit";
import { clientIp, rateLimit } from "@/lib/rateLimit";

export function proxy(request: NextRequest) {
  // Per-IP limits for /api/* (tiers and exemptions in src/lib/apiRateLimit.ts).
  const tier = apiTier(request.nextUrl.pathname);
  if (tier) {
    const r = rateLimit(`api:${tier.name}:${clientIp(request.headers)}`, tier.limit, tier.windowMs);
    if (!r.ok) {
      const retry = Math.max(1, Math.ceil(r.retryAfterMs / 1000));
      return NextResponse.json({ error: "Too many requests. Please slow down and try again shortly." }, { status: 429, headers: { "Retry-After": String(retry) } });
    }
    return NextResponse.next();
  }
  const res = NextResponse.next();
  const code = normalizeCode(request.nextUrl.searchParams.get("ref"));
  if (!code || parseRefCookie(request.cookies.get(REF_COOKIE)?.value)) return res;
  res.cookies.set(REF_COOKIE, refCookieValue(code, Date.now()), refCookieOptions(request.nextUrl.protocol === "https:"));
  return res;
}

export const config = {
  matcher: [
    "/api/:path*",
    { source: "/", has: [{ type: "query", key: "ref" }] },
    { source: "/signup", has: [{ type: "query", key: "ref" }] },
  ],
};
