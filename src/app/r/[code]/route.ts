// Referral share link: /r/<CODE>. Counts the click (once per browser per code), sets the
// first-touch pf_ref cookie and sends the visitor to sign-up with ?ref so the code is visible.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BRAND } from "@/lib/brand";
import { isDbConfigured } from "@/lib/db";
import { REF_COOKIE, normalizeCode, parseRefCookie, refCookieOptions, refCookieValue } from "@/lib/referralCode";
import { countReferralClick } from "@/lib/referrals";

export async function GET(_request: Request, ctx: { params: Promise<{ code: string }> }) {
  const code = normalizeCode((await ctx.params).code);
  if (!code) return NextResponse.redirect(new URL("/signup", BRAND.url));
  const jar = await cookies();
  const existing = parseRefCookie(jar.get(REF_COOKIE)?.value);
  let known = true;
  if (isDbConfigured() && existing?.code !== code) {
    try {
      known = await countReferralClick(code);
    } catch (err) {
      console.error("referral click not counted", err instanceof Error ? err.message : err);
    }
  }
  if (!known) return NextResponse.redirect(new URL("/signup", BRAND.url));
  const res = NextResponse.redirect(new URL(`/signup?ref=${code}`, BRAND.url));
  if (!existing) res.cookies.set(REF_COOKIE, refCookieValue(code, Date.now()), refCookieOptions(BRAND.url.startsWith("https:")));
  return res;
}
