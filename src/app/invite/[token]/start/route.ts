// Logged-out invitee: remember the invite (src/lib/inviteCookie.ts) and go to log in / sign up.
// After auth, src/app/login/actions.ts and the Google callback send them back to /invite/<token>.
import { NextResponse } from "next/server";
import { BRAND } from "@/lib/brand";
import { INVITE_COOKIE, INVITE_COOKIE_MAX_AGE, invitePath } from "@/lib/inviteCookie";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const to = new URL(request.url).searchParams.get("to") === "signup" ? "/signup" : "/login";
  if (!invitePath(token)) return NextResponse.redirect(new URL("/login", BRAND.url));
  const res = NextResponse.redirect(new URL(to, BRAND.url));
  res.cookies.set(INVITE_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: INVITE_COOKIE_MAX_AGE,
  });
  return res;
}
