import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { IG_SCOPES, exchangeCode, fetchProfile, longLivedToken } from "@/lib/instagram";
import {
  INSTAGRAM_TAKEN_PATH,
  PICK_COOKIE,
  PICK_MAX_AGE_S,
  encodePick,
  isInstagramTakenByOther,
  saveFacebookLoginAccount,
  saveInstagramLoginAccount,
} from "@/lib/metaAccounts";
import { MetaApiError, discoverMetaAccounts, isMetaLoginConfigured, verifyState } from "@/lib/metaLogin";
import { accountLimitError } from "@/lib/planLimits";

type BackResult =
  | "connected"
  | "connected_no_webhooks"
  | "error"
  | "state_error"
  | "expired_code"
  | "declined"
  | "missing_permissions"
  | "no_pages"
  | "no_ig_business"
  | "limit"
  | "taken";

function back(result: BackResult) {
  // Success opens the Connect dialog's "connected" step (ConnectChannelDialog); problems keep the Settings banners.
  if (result === "connected") return NextResponse.redirect(new URL("/app/publish?connected=instagram", BRAND.url));
  // Owned by another Poskoo user: the Connect dialog's "already connected to another Poskoo account" message.
  if (result === "taken") return NextResponse.redirect(new URL(INSTAGRAM_TAKEN_PATH, BRAND.url));
  return NextResponse.redirect(new URL(`/app/settings?ig=${result}`, BRAND.url));
}

export async function GET(request: Request) {
  // Outside the try so the /login redirect is not swallowed.
  const user = await requireUser();
  // The Connect dialog's "Continue with Instagram" sets ig_flow=instagram (Instagram Login) even
  // when Facebook Login for Business is configured too.
  const flowStore = await cookies();
  const instagramFlow = flowStore.get("ig_flow")?.value === "instagram";
  if (instagramFlow) flowStore.delete({ name: "ig_flow", path: "/api/instagram" });
  if (isMetaLoginConfigured() && !instagramFlow) {
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
        // Another Poskoo user's account is never taken over (its rules, contacts and posts stay theirs).
        if (await isInstagramTakenByOther(user.id, found.pages[0].igUserId)) return back("taken");
        // Plan limit: a NEW account over the limit is refused; reconnecting an existing one works.
        if (await accountLimitError(user.id, { kind: "social", platform: "instagram", externalId: found.pages[0].igUserId })) return back("limit");
        const saved = await saveFacebookLoginAccount(user.id, found.pages[0], found.scopes, found.metaUserId);
        if (saved.taken) return back("taken");
        return back(saved.subscribed ? "connected" : "connected_no_webhooks");
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
    // Another Poskoo user's account is never taken over (its rules, contacts and posts stay theirs).
    if (await isInstagramTakenByOther(user.id, externalId)) return back("taken");
    if (await accountLimitError(user.id, { kind: "social", platform: "instagram", externalId })) return back("limit");
    const saved = await saveInstagramLoginAccount(user.id, {
      igUserId: externalId,
      username: profile.username || null,
      accessToken: long.access_token,
      expiresIn: long.expires_in,
      scopes: IG_SCOPES,
      appUserId: short.user_id || null,
    });
    if (saved === "taken") return back("taken");
    return back("connected");
  } catch {
    return back("error");
  }
}
