// Refer and earn. Server only (DB), with pure helpers that are unit tested.
//
// Flow:
//  1. Each user has a code (referral_codes, created on first visit to /app/referrals).
//     Share link: <site>/r/<CODE> (counts a click, then lands on /signup?ref=CODE).
//     <site>/?ref=CODE and /signup?ref=CODE also work (src/proxy.ts sets the cookie).
//  2. First touch wins: the pf_ref cookie ("CODE.<issued-ms>") is only set when no valid one
//     exists, and is honoured for 60 days (cookie max-age AND issued-at check on the server).
//  3. On sign-up (email or Google) attributeReferral() stores the referrer on the new user
//     (users.referred_by_user_id + a referrals row). Refused: self-referral (same user or the
//     same mailbox), accounts older than 1 hour (existing users logging in with a cookie),
//     expired cookies, unknown codes, and a second attribution (referred_user_id is unique).
//  4. Qualifying event: the referred user connects a social account (any social_accounts row).
//     qualifyReferrals() stamps qualified_at + the connected account; a given social account
//     can qualify only one referral ever (unique index), so reconnecting the same Instagram to
//     new sign-ups earns nothing. It runs every minute from the send-dms job and before the
//     referrer's limit or stats are read.
//  5. Reward: REFERRAL_BONUS_DMS (+500) automated DMs per UTC month per qualified referral,
//     added to the plan's monthly auto-DM limit (planLimits.monthlyAutoDmLimit).
import { randomBytes } from "node:crypto";
import { query } from "@/lib/db";
import { CODE_ALPHABET, NEW_ACCOUNT_MS, parseRefCookie } from "@/lib/referralCode";

export { NEW_ACCOUNT_MS, REF_COOKIE, REF_WINDOW_DAYS, REF_WINDOW_MS, normalizeCode, parseRefCookie, refCookieValue } from "@/lib/referralCode";

export function newReferralCode(): string {
  const bytes = randomBytes(8);
  let out = "";
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return out;
}

/** Same mailbox: case-insensitive, ignores +tags everywhere and dots for Gmail. */
export function sameMailbox(a: string, b: string): boolean {
  const canon = (email: string) => {
    const [localRaw, domainRaw] = email.trim().toLowerCase().split("@");
    if (!localRaw || !domainRaw) return email.trim().toLowerCase();
    const domain = domainRaw === "googlemail.com" ? "gmail.com" : domainRaw;
    let local = localRaw.split("+")[0] ?? localRaw;
    if (domain === "gmail.com") local = local.replace(/\./g, "");
    return `${local}@${domain}`;
  };
  return canon(a) === canon(b);
}

export type AttributionResult =
  | { ok: true; referrerUserId: string }
  | { ok: false; reason: "no_cookie" | "unknown_code" | "self" | "not_new" | "already" };

/**
 * Stores who referred `newUserId`, from the pf_ref cookie value. Safe to call after every
 * sign-up / Google login: it refuses anything that is not a fresh account. Never throws.
 */
export async function attributeReferral(newUserId: string, cookieValue: string | null | undefined, now = Date.now()): Promise<AttributionResult> {
  const parsed = parseRefCookie(cookieValue, now);
  if (!parsed) return { ok: false, reason: "no_cookie" };
  try {
    const owners = await query<{ user_id: string; email: string }>(
      "select rc.user_id, u.email from socialapp.referral_codes rc join socialapp.users u on u.id = rc.user_id where rc.code=$1",
      [parsed.code],
    );
    const owner = owners[0];
    if (!owner) return { ok: false, reason: "unknown_code" };
    const users = await query<{ email: string; created_at: Date; referred_by_user_id: string | null }>(
      "select email, created_at, referred_by_user_id from socialapp.users where id=$1",
      [newUserId],
    );
    const user = users[0];
    if (!user) return { ok: false, reason: "not_new" };
    if (owner.user_id === newUserId || sameMailbox(owner.email, user.email)) return { ok: false, reason: "self" };
    if (now - new Date(user.created_at).getTime() > NEW_ACCOUNT_MS) return { ok: false, reason: "not_new" };
    if (user.referred_by_user_id) return { ok: false, reason: "already" };
    const inserted = await query<{ id: string }>(
      `insert into socialapp.referrals (referrer_user_id, referred_user_id, code, first_touch_at)
       values ($1, $2, $3, $4) on conflict (referred_user_id) do nothing returning id`,
      [owner.user_id, newUserId, parsed.code, new Date(parsed.issuedAt).toISOString()],
    );
    if (inserted.length === 0) return { ok: false, reason: "already" };
    await query("update socialapp.users set referred_by_user_id=$2 where id=$1 and referred_by_user_id is null", [newUserId, owner.user_id]);
    return { ok: true, referrerUserId: owner.user_id };
  } catch (err) {
    console.error("attributeReferral failed for user", newUserId, err instanceof Error ? err.message : err);
    return { ok: false, reason: "unknown_code" };
  }
}

export const REFERRAL_BONUS_DMS = 500;

/**
 * Marks referrals as qualified once the referred user has a connected social account.
 * `referrerUserId` limits it to one referrer; null = everyone (cron). Returns rows qualified.
 * Never throws (missing migration, unique race on the same account): the next run retries.
 */
export async function qualifyReferrals(referrerUserId: string | null = null): Promise<number> {
  try {
    const rows = await query<{ id: string }>(
      `update socialapp.referrals r
       set qualified_at = now(), qualified_platform = a.platform, qualified_external_id = a.external_id, bonus_dms = $2
       from (
         select distinct on (user_id) user_id, platform, external_id
         from socialapp.social_accounts order by user_id, created_at
       ) a
       where a.user_id = r.referred_user_id
         and r.qualified_at is null
         and ($1::uuid is null or r.referrer_user_id = $1::uuid)
         and not exists (
           select 1 from socialapp.referrals q
           where q.qualified_platform = a.platform and q.qualified_external_id = a.external_id
         )
       returning r.id`,
      [referrerUserId, REFERRAL_BONUS_DMS],
    );
    if (rows.length > 0) {
      // "+500 DMs" e-mail to each referrer, once per referral (src/lib/emailNotify.ts).
      const ids = rows.map((r) => r.id);
      void import("@/lib/emailNotify").then((m) => m.inBackground("referral", () => m.notifyReferralsQualified(ids))).catch(() => undefined);
    }
    return rows.length;
  } catch (err) {
    console.error("qualifyReferrals failed", err instanceof Error ? err.message : err);
    return 0;
  }
}

/** Bonus automated DMs per month earned by `userId` (sum over qualified referrals). 0 on any error. */
export async function referralBonusDms(userId: string): Promise<number> {
  try {
    const rows = await query<{ n: number }>(
      "select coalesce(sum(bonus_dms), 0)::int as n from socialapp.referrals where referrer_user_id=$1 and qualified_at is not null",
      [userId],
    );
    return rows[0]?.n ?? 0;
  } catch (err) {
    console.error("referralBonusDms failed for user", userId, err instanceof Error ? err.message : err);
    return 0;
  }
}

/** The user's code, created on first use. */
export async function ensureReferralCode(userId: string): Promise<{ code: string; clicks: number }> {
  const existing = await query<{ code: string; clicks: number }>("select code, clicks from socialapp.referral_codes where user_id=$1", [userId]);
  if (existing[0]) return existing[0];
  for (let attempt = 0; attempt < 5; attempt++) {
    const rows = await query<{ code: string; clicks: number }>(
      `insert into socialapp.referral_codes (user_id, code) values ($1, $2)
       on conflict do nothing returning code, clicks`,
      [userId, newReferralCode()],
    );
    if (rows[0]) return rows[0];
    const again = await query<{ code: string; clicks: number }>("select code, clicks from socialapp.referral_codes where user_id=$1", [userId]);
    if (again[0]) return again[0];
  }
  throw new Error("could not create a referral code");
}

/** Counts a click on a share link. Returns false for unknown codes. */
export async function countReferralClick(code: string): Promise<boolean> {
  const rows = await query<{ code: string }>(
    "update socialapp.referral_codes set clicks = clicks + 1 where code=$1 returning code",
    [code],
  );
  return rows.length > 0;
}

export type ReferralListRow = {
  id: string;
  created_at: Date;
  qualified_at: Date | null;
  bonus_dms: number;
  email: string;
  name: string | null;
};

export async function referralStats(userId: string) {
  await qualifyReferrals(userId);
  const code = await ensureReferralCode(userId);
  const list = await query<ReferralListRow>(
    `select r.id, r.created_at, r.qualified_at, r.bonus_dms, u.email, u.name
     from socialapp.referrals r join socialapp.users u on u.id = r.referred_user_id
     where r.referrer_user_id=$1 order by r.created_at desc limit 200`,
    [userId],
  );
  const totals = await query<{ signups: number; qualified: number; bonus: number }>(
    `select count(*)::int as signups, count(qualified_at)::int as qualified,
       coalesce(sum(bonus_dms) filter (where qualified_at is not null), 0)::int as bonus
     from socialapp.referrals where referrer_user_id=$1`,
    [userId],
  );
  const { signups = 0, qualified = 0, bonus = 0 } = totals[0] ?? {};
  return { code: code.code, clicks: code.clicks, signups, qualified, bonus, list };
}

/** "jane.doe@example.com" -> "ja•••@example.com" so the referrer sees who joined without the full address. */
export function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "•••";
  return `${local.slice(0, 2)}•••@${domain}`;
}
