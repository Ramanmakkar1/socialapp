import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { encryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import { IG_SCOPES, exchangeCode, fetchProfile, longLivedToken } from "@/lib/instagram";
import { PICK_COOKIE, PICK_MAX_AGE_S, encodePick, saveFacebookLoginAccount } from "@/lib/metaAccounts";
import { MetaApiError, discoverMetaAccounts, isMetaLoginConfigured, verifyState } from "@/lib/metaLogin";

type BackResult =
  | "connected"
  | "connected_no_webhooks"
  | "error"
  | "state_error"
  | "expired_code"
  | "declined"
  | "missing_permissions"
  | "no_pages"
  | "no_ig_business";

function back(result: BackResult) {
  return NextResponse.redirect(new URL(`/app/settings?ig=${result}`, BRAND.url));
}

export async function GET(request: Request) {
  // Outside the try so the /login redirect is not swallowed.
  const user = await requireUser();
  if (isMetaLoginConfigured()) {
    try {
      const url = new URL(request.url);
      const code = url.searchParams.get("code");
      const state = url.searchParams.get("state");
      const error = url.searchParams.get("error");
      const errorReason = url.searchParams.get("error_reason");
      const store = await cookies();
      const cookieNonce = store.get("ig_oauth_state")?.value;
      store.delete({ name: "ig_oauth_state", path: "/api/instagram" });
      if (errorReason === "user_denied" || error === "access_denied") return back("declined");
      if (!code) return back("error");
      if (!state || !cookieNonce || !verifyState(state, cookieNonce)) return back("state_error");
      const found = await discoverMetaAccounts(code);
      if (!found.ok) return back(found.reason);
      if (found.pages.length === 1) {
        const { subscribed } = await saveFacebookLoginAccount(user.id, found.pages[0], found.scopes, found.metaUserId);
        return back(subscribed ? "connected" : "connected_no_webhooks");
      }
      // More than one Instagram account: let the user choose. Only the encrypted user token is kept
      // (15 min, httpOnly); the chooser reads the Page list again with it.
      const res = NextResponse.redirect(new URL("/app/settings/instagram", BRAND.url));
      res.cookies.set(PICK_COOKIE, encodePick(user.id, found.userToken, found.scopes, found.metaUserId), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: PICK_MAX_AGE_S,
      });
      return res;
    } catch (err) {
      // A reused or old code (Meta error 100 on the exchange) or an invalid token: ask to try again.
      if (err instanceof MetaApiError && (err.tokenInvalid || err.code === 100)) return back("expired_code");
      console.error("instagram callback (facebook login) failed", err instanceof MetaApiError ? `meta ${err.status}/${err.code}` : "unexpected");
      return back("error");
    }
  }
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const store = await cookies();
    const expected = store.get("ig_oauth_state")?.value;
    store.delete({ name: "ig_oauth_state", path: "/api/instagram" });
    if (error === "access_denied") return back("declined");
    if (error || !code || !state || !expected || state !== expected) {
      return back("error");
    }
    const short = await exchangeCode(code);
    const long = await longLivedToken(short.access_token);
    const profile = await fetchProfile(long.access_token);
    const externalId = profile.user_id || short.user_id;
    if (!externalId) return back("error");
    await query(
      `insert into socialapp.social_accounts (user_id, platform, external_id, username, access_token_enc, token_expires_at, scopes, status)
       values ($1,'instagram',$2,$3,$4, now() + ($5 || ' seconds')::interval, $6, 'active')
       on conflict (platform, external_id) do update set user_id=excluded.user_id, username=excluded.username, access_token_enc=excluded.access_token_enc, token_expires_at=excluded.token_expires_at, scopes=excluded.scopes, status='active', auth_type='instagram_login', page_id=null, page_name=null, updated_at=now()`,
      [user.id, externalId, profile.username || null, encryptToken(long.access_token), String(long.expires_in), IG_SCOPES]
    );
    // App-scoped id = the user_id Meta sends in deauthorize/data-deletion signed_requests (migration 012).
    if (short.user_id) {
      await query(
        "update socialapp.social_accounts set app_user_id=$2 where platform='instagram' and external_id=$1",
        [externalId, short.user_id]
      ).catch(() => undefined);
    }
    return back("connected");
  } catch {
    return back("error");
  }
}
