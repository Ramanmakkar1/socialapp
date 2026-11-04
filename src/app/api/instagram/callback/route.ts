import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { encryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import { IG_SCOPES, exchangeCode, fetchProfile, longLivedToken } from "@/lib/instagram";

export const dynamic = "force-dynamic";

function back(result: "connected" | "error") {
  return NextResponse.redirect(new URL(`/app/settings?ig=${result}`, BRAND.url));
}

export async function GET(request: Request) {
  // Outside the try so the /login redirect is not swallowed.
  const user = await requireUser();
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const store = await cookies();
    const expected = store.get("ig_oauth_state")?.value;
    store.delete({ name: "ig_oauth_state", path: "/api/instagram" });
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
       on conflict (platform, external_id) do update set user_id=excluded.user_id, username=excluded.username, access_token_enc=excluded.access_token_enc, token_expires_at=excluded.token_expires_at, scopes=excluded.scopes, status='active', updated_at=now()`,
      [user.id, externalId, profile.username || null, encryptToken(long.access_token), String(long.expires_in), IG_SCOPES]
    );
    return back("connected");
  } catch {
    return back("error");
  }
}
