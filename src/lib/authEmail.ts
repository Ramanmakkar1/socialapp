// Server only: one-time codes in the DB (migration 040) for password reset and e-mail verification.
import { query } from "@/lib/db";
import {
  CODE_TTL_MS,
  MAX_CODE_ATTEMPTS,
  checkCode,
  generateCode,
  generateLinkToken,
  hashCode,
  type CodeCheck,
  type CodePurpose,
  type CodeRowState,
} from "@/lib/emailCodes";
import { hashPassword, hashToken } from "@/lib/password";

/** Creates a fresh code + link token for the user; older unused codes of that purpose stop working. */
export async function issueCode(userId: string, purpose: CodePurpose): Promise<{ code: string; token: string }> {
  const code = generateCode();
  const token = generateLinkToken();
  await query("update socialapp.email_codes set used_at=now() where user_id=$1 and purpose=$2 and used_at is null", [userId, purpose]);
  await query(
    "insert into socialapp.email_codes (user_id, purpose, code_hash, token_hash, expires_at) values ($1, $2, $3, $4, now() + $5 * interval '1 millisecond')",
    [userId, purpose, hashCode(code), hashToken(token), CODE_TTL_MS],
  );
  return { code, token };
}

/**
 * Checks a typed code against the user's newest code of that purpose. A wrong code counts an
 * attempt (atomically, capped at MAX_CODE_ATTEMPTS); the right code is consumed exactly once.
 */
export async function redeemCode(userId: string, purpose: CodePurpose, input: string): Promise<CodeCheck> {
  const rows = await query<CodeRowState & { id: string }>(
    "select id, code_hash, attempts, expires_at, used_at from socialapp.email_codes where user_id=$1 and purpose=$2 order by created_at desc limit 1",
    [userId, purpose],
  );
  const row = rows[0];
  const result = checkCode(row, input);
  if (result === "wrong") {
    await query("update socialapp.email_codes set attempts = least(attempts + 1, $2) where id=$1", [row!.id, MAX_CODE_ATTEMPTS]);
    return result;
  }
  if (result !== "ok") return result;
  const used = await query("update socialapp.email_codes set used_at=now() where id=$1 and used_at is null and attempts < $2 returning id", [row!.id, MAX_CODE_ATTEMPTS]);
  return used[0] ? "ok" : "used";
}

/** Looks up a live magic-link token without consuming it (reset page shows its form first). */
export async function peekToken(token: string, purpose: CodePurpose): Promise<{ userId: string; email: string } | null> {
  if (!token || token.length > 100) return null;
  const rows = await query<{ user_id: string; email: string }>(
    `select c.user_id, u.email from socialapp.email_codes c join socialapp.users u on u.id = c.user_id
     where c.token_hash=$1 and c.purpose=$2 and c.used_at is null and c.expires_at > now() and c.attempts < $3`,
    [hashToken(token), purpose, MAX_CODE_ATTEMPTS],
  );
  return rows[0] ? { userId: rows[0].user_id, email: rows[0].email } : null;
}

/** Consumes a live magic-link token. With `userId`, only that user's token is accepted. */
export async function consumeToken(token: string, purpose: CodePurpose, userId?: string): Promise<string | null> {
  if (!token || token.length > 100) return null;
  const rows = await query<{ user_id: string }>(
    `update socialapp.email_codes set used_at=now()
     where token_hash=$1 and purpose=$2 and used_at is null and expires_at > now() and attempts < $3
       and ($4::uuid is null or user_id = $4::uuid)
     returning user_id`,
    [hashToken(token), purpose, MAX_CODE_ATTEMPTS, userId ?? null],
  );
  return rows[0]?.user_id ?? null;
}

export type ResetTarget = { id: string; email: string; name: string | null; hasPassword: boolean };

export async function findUserByEmail(email: string): Promise<ResetTarget | null> {
  const rows = await query<{ id: string; email: string; name: string | null; has_password: boolean }>(
    "select id, email, name, (password_hash is not null) as has_password from socialapp.users where email=$1",
    [email],
  );
  const r = rows[0];
  return r ? { id: r.id, email: r.email, name: r.name, hasPassword: r.has_password } : null;
}

/**
 * Sets a new password. A reset proves the person owns the address, so the e-mail counts as
 * verified, and every session is revoked (an attacker who knew the old password is signed out).
 */
export async function setPasswordAndRevoke(userId: string, newPassword: string): Promise<{ email: string; name: string | null } | null> {
  const hash = await hashPassword(newPassword);
  const rows = await query<{ email: string; name: string | null }>(
    "update socialapp.users set password_hash=$2, email_verified_at=coalesce(email_verified_at, now()) where id=$1 returning email, name",
    [userId, hash],
  );
  if (!rows[0]) return null;
  await query("delete from socialapp.sessions where user_id=$1", [userId]);
  await query("update socialapp.email_codes set used_at=now() where user_id=$1 and purpose='reset' and used_at is null", [userId]);
  return rows[0];
}

/** Marks the e-mail verified. Returns false when it already was. */
export async function markEmailVerified(userId: string): Promise<boolean> {
  const rows = await query("update socialapp.users set email_verified_at=now() where id=$1 and email_verified_at is null returning id", [userId]);
  return rows.length > 0;
}

/** True the first time `key` is seen: the "send this notification once" guard (email_sends). */
export async function claimEmailKey(key: string): Promise<boolean> {
  const rows = await query("insert into socialapp.email_sends (key) values ($1) on conflict (key) do nothing returning key", [key.slice(0, 300)]);
  return rows.length > 0;
}
