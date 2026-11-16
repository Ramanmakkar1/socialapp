// Server only: stores Instagram accounts connected through Facebook Login for Business,
// and the short-lived "choose an account" hand-off when the user has more than one.
import { decryptToken, encryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import { subscribePage, type MetaPageWithInstagram } from "@/lib/metaLogin";

/** Cookie holding the encrypted long-lived user token while the user picks an account. */
export const PICK_COOKIE = "ig_pick";
export const PICK_MAX_AGE_S = 15 * 60;

type PickPayload = { u: string; t: string; s: string[]; m: string | null; e: number };

export function encodePick(userId: string, userToken: string, scopes: string[], metaUserId: string | null, now = Date.now()): string {
  const payload: PickPayload = { u: userId, t: userToken, s: scopes, m: metaUserId, e: now + PICK_MAX_AGE_S * 1000 };
  return encryptToken(JSON.stringify(payload));
}

/** The pick hand-off for this user, or null when missing, expired, tampered or for another user. */
export function decodePick(raw: string | undefined, userId: string, now = Date.now()): { userToken: string; scopes: string[]; metaUserId: string | null } | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(decryptToken(raw)) as PickPayload;
    if (p.u !== userId || typeof p.t !== "string" || !Array.isArray(p.s) || typeof p.e !== "number" || p.e < now) return null;
    return { userToken: p.t, scopes: p.s.filter((x) => typeof x === "string"), metaUserId: typeof p.m === "string" ? p.m : null };
  } catch {
    return null;
  }
}

/** Where the callbacks send the user when the Instagram account belongs to another Poskoo user
 * (ConnectChannelDialog shows "This Instagram account is already connected to another Poskoo account."). */
export const INSTAGRAM_TAKEN_PATH = "/app/calendar?net=instagram&connect_error=taken";

/** The Poskoo user that owns this Instagram account, or null when nobody has connected it. */
export async function instagramOwner(igUserId: string): Promise<string | null> {
  const rows = await query<{ user_id: string }>(
    "select user_id from socialapp.social_accounts where platform='instagram' and external_id=$1",
    [igUserId],
  );
  return rows[0]?.user_id ?? null;
}

/** True when another Poskoo user already owns this Instagram account (never taken over on reconnect). */
export async function isInstagramTakenByOther(userId: string, igUserId: string): Promise<boolean> {
  const owner = await instagramOwner(igUserId);
  return owner !== null && owner !== userId;
}

/**
 * Saves (or re-connects) an account connected through Instagram Login (instagram.com OAuth).
 * A row owned by another Poskoo user is never taken over: returns "taken" (the upsert's WHERE
 * also guards the race between the ownership check and the write).
 */
export async function saveInstagramLoginAccount(
  userId: string,
  input: { igUserId: string; username: string | null; accessToken: string; expiresIn: number | string; scopes: string[]; appUserId: string | null },
): Promise<"ok" | "taken"> {
  if (await isInstagramTakenByOther(userId, input.igUserId)) return "taken";
  const saved = await query<{ id: string }>(
    `insert into socialapp.social_accounts (user_id, platform, external_id, username, access_token_enc, token_expires_at, scopes, status)
     values ($1,'instagram',$2,$3,$4, now() + ($5 || ' seconds')::interval, $6, 'active')
     on conflict (platform, external_id) do update set username=excluded.username, access_token_enc=excluded.access_token_enc, token_expires_at=excluded.token_expires_at, scopes=excluded.scopes, status='active', auth_type='instagram_login', page_id=null, page_name=null, updated_at=now()
     where social_accounts.user_id = excluded.user_id
     returning id`,
    [userId, input.igUserId, input.username, encryptToken(input.accessToken), String(input.expiresIn), input.scopes],
  );
  if (saved.length === 0) return "taken";
  // App-scoped id = the user_id Meta sends in deauthorize/data-deletion signed_requests (migration 012).
  if (input.appUserId) {
    await query("update socialapp.social_accounts set app_user_id=$3 where platform='instagram' and external_id=$1 and user_id=$2", [
      input.igUserId,
      userId,
      input.appUserId,
    ]).catch(() => undefined);
  }
  return "ok";
}

/**
 * Saves (or re-connects) one Instagram professional account with its Page token (encrypted),
 * then installs the app on the Page so comment and DM webhooks arrive. Returns false when the
 * webhook subscription failed (the account still works for publishing; the caller can warn).
 * Returns { taken: true } (and writes nothing) when another Poskoo user owns the account.
 */
export async function saveFacebookLoginAccount(
  userId: string,
  page: MetaPageWithInstagram,
  scopes: string[],
  metaUserId: string | null,
): Promise<{ taken: true } | { taken?: false; subscribed: boolean }> {
  if (await isInstagramTakenByOther(userId, page.igUserId)) return { taken: true };
  const saved = await query<{ id: string }>(
    `insert into socialapp.social_accounts (user_id, platform, external_id, username, access_token_enc, token_expires_at, scopes, status, auth_type, page_id, page_name)
     values ($1,'instagram',$2,$3,$4, null, $5, 'active', 'facebook_login', $6, $7)
     on conflict (platform, external_id) do update set username=excluded.username, access_token_enc=excluded.access_token_enc, token_expires_at=null, scopes=excluded.scopes, status='active', auth_type='facebook_login', page_id=excluded.page_id, page_name=excluded.page_name, updated_at=now()
     where social_accounts.user_id = excluded.user_id
     returning id`,
    [userId, page.igUserId, page.igUsername || null, encryptToken(page.pageToken), scopes, page.pageId, page.pageName],
  );
  if (saved.length === 0) return { taken: true };
  if (metaUserId) {
    // App-scoped Facebook user id = the user_id in deauthorize / data-deletion signed_requests (migration 012).
    await query("update socialapp.social_accounts set app_user_id=$3 where platform='instagram' and external_id=$1 and user_id=$2", [
      page.igUserId,
      userId,
      metaUserId,
    ]).catch(() => undefined);
  }
  try {
    await subscribePage(page.pageId, page.pageToken);
    return { subscribed: true };
  } catch {
    console.error("subscribePage failed for page", page.pageId);
    return { subscribed: false };
  }
}
