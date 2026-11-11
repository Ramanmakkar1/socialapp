// Refer and earn: remember the first referral code a visitor arrives with (?ref=CODE on the
// home page or /signup) in the pf_ref cookie for 60 days. First touch wins: a valid existing
// cookie is never overwritten. Nothing else runs here (matcher limits it to those two pages).
import { NextResponse, type NextRequest } from "next/server";
import { REF_COOKIE, normalizeCode, parseRefCookie, refCookieOptions, refCookieValue } from "@/lib/referralCode";

export function proxy(request: NextRequest) {
  const res = NextResponse.next();
  const code = normalizeCode(request.nextUrl.searchParams.get("ref"));
  if (!code || parseRefCookie(request.cookies.get(REF_COOKIE)?.value)) return res;
  res.cookies.set(REF_COOKIE, refCookieValue(code, Date.now()), refCookieOptions(request.nextUrl.protocol === "https:"));
  return res;
}

export const config = {
  matcher: [
    { source: "/", has: [{ type: "query", key: "ref" }] },
    { source: "/signup", has: [{ type: "query", key: "ref" }] },
  ],
};
