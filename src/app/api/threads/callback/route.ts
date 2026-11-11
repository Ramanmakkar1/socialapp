import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { BRAND } from "@/lib/brand";
import { encryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import { accountLimitError } from "@/lib/planLimits";
import { THREADS_SCOPES, exchangeThreadsCode, fetchThreadsProfile, threadsLongLivedToken } from "@/lib/threadsAuth";

type BackResult = "connected" | "error" | "state_error" | "declined" | "limit";

function back(result: BackResult) {
  // Success opens the Connect dialog's "connected" step (ConnectChannelDialog); problems keep the Settings banners.
  if (result === "connected") return NextResponse.redirect(new URL("/app/calendar?connected=threads", BRAND.url));
  return NextResponse.redirect(new URL(`/app/settings?threads=${result}`, BRAND.url));
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
    const expected = store.get("threads_oauth_state")?.value;
    store.delete({ name: "threads_oauth_state", path: "/api/threads" });
    if (error) return back("declined");
    if (!code || !state || !expected || state !== expected) return back("state_error");
    const short = await exchangeThreadsCode(code);
    const long = await threadsLongLivedToken(short.access_token);
    const profile = await fetchThreadsProfile(long.access_token);
    const externalId = profile.user_id || short.user_id;
    if (!externalId) return back("error");
    // A row owned by a different user is not taken over.
    const existing = await query<{ user_id: string }>(
      "select user_id from socialapp.social_accounts where platform='threads' and external_id=$1",
      [externalId]
    );
    if (existing[0] && existing[0].user_id !== user.id) return back("error");
    // Plan limit: a NEW account over the limit is refused; reconnecting an existing one works.
    if (await accountLimitError(user.id, { kind: "social", platform: "threads", externalId })) return back("limit");
    await query(
      `insert into socialapp.social_accounts (user_id, platform, external_id, username, access_token_enc, token_expires_at, scopes, status)
       values ($1,'threads',$2,$3,$4, now() + ($5 || ' seconds')::interval, $6, 'active')
       on conflict (platform, external_id) do update set user_id=excluded.user_id, username=excluded.username, access_token_enc=excluded.access_token_enc, token_expires_at=excluded.token_expires_at, scopes=excluded.scopes, status='active', updated_at=now()
       where social_accounts.user_id = excluded.user_id`,
      [user.id, externalId, profile.username || null, encryptToken(long.access_token), String(long.expires_in), THREADS_SCOPES]
    );
    return back("connected");
  } catch {
    return back("error");
  }
}
