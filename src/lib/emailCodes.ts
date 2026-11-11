// Pure helpers for one-time e-mail codes (password reset, e-mail verification). No DB, no Next.
// A code is 6 random digits plus a 32-byte magic-link token. Only hashes are stored.
import { createHash, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

export const CODE_TTL_MS = 15 * 60 * 1000;
export const MAX_CODE_ATTEMPTS = 5;

export type CodePurpose = "reset" | "verify";

/** Cookie that hides the dashboard "Verify your email" banner for a few days. */
export const VERIFY_DISMISS_COOKIE = "pk_verify_later";

/** 6 digits, uniformly random, zero-padded ("004211"). */
export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/** URL-safe magic-link token (256 bits). */
export function generateLinkToken(): string {
  return randomBytes(32).toString("base64url");
}

function sha256(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

/** "<saltHex>$<sha256(salt:code)>". A per-row salt keeps equal codes from having equal hashes. */
export function hashCode(code: string, salt = randomBytes(16).toString("hex")): string {
  return `${salt}$${sha256(`${salt}:${code}`)}`;
}

export function codeMatches(code: string, stored: string): boolean {
  const [salt, hash] = typeof stored === "string" ? stored.split("$") : [];
  if (!salt || !hash || !/^\d{6}$/.test(code)) return false;
  const a = Buffer.from(sha256(`${salt}:${code}`), "hex");
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Digits only: users paste "482 913" or "482-913". */
export function normalizeCodeInput(raw: string): string {
  return (raw ?? "").replace(/\D/g, "").slice(0, 6);
}

export type CodeRowState = { code_hash: string; attempts: number; expires_at: Date | string; used_at: Date | string | null };
export type CodeCheck = "ok" | "wrong" | "expired" | "used" | "locked";

/**
 * Decides a code attempt. "wrong" means the caller must count the attempt; once attempts reach
 * MAX_CODE_ATTEMPTS the code is "locked" (even the right code is refused) and a new one is needed.
 */
export function checkCode(row: CodeRowState | null | undefined, input: string, now = Date.now()): CodeCheck {
  if (!row) return "expired";
  if (row.used_at) return "used";
  if (new Date(row.expires_at).getTime() <= now) return "expired";
  if (row.attempts >= MAX_CODE_ATTEMPTS) return "locked";
  return codeMatches(normalizeCodeInput(input), row.code_hash) ? "ok" : "wrong";
}

export const CODE_MESSAGES: Record<Exclude<CodeCheck, "ok">, string> = {
  wrong: "That code isn’t right. Check the email and try again.",
  expired: "That code has expired. Request a new one.",
  used: "That code was already used. Request a new one.",
  locked: "Too many wrong tries for this code. Request a new one.",
};
