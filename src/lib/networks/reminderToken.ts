// Server only (node:crypto): signed "Mark as posted" tokens for reminder e-mails.
// Format: <targetId>.<expiry, base36 ms>.<HMAC-SHA256 base64url>. Nothing secret is inside; the
// signature only proves Poskoo issued the link for that target and that it has not expired.
import { createHmac, timingSafeEqual } from "node:crypto";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mac(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(`reminder-done:${payload}`).digest("base64url");
}

export function signReminderToken(targetId: string, expiresAtMs: number, secret: string): string {
  if (!secret) throw new Error("reminder token secret missing");
  const payload = `${targetId}.${Math.floor(expiresAtMs).toString(36)}`;
  return `${payload}.${mac(payload, secret)}`;
}

/** The target id when the token is genuine and not expired, else null. */
export function verifyReminderToken(token: string, secret: string, nowMs = Date.now()): string | null {
  if (!secret || typeof token !== "string" || token.length > 200) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [targetId, exp, sig] = parts;
  if (!UUID.test(targetId) || !/^[0-9a-z]{1,12}$/.test(exp)) return null;
  const expected = Buffer.from(mac(`${targetId}.${exp}`, secret));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (parseInt(exp, 36) < nowMs) return null;
  return targetId;
}

/** HMAC key for reminder links: its own env var, or derived from the token encryption key. */
export function reminderSecret(): string {
  const own = process.env.REMINDER_LINK_SECRET?.trim();
  if (own) return own;
  const base = process.env.TOKEN_ENCRYPTION_KEY?.trim();
  return base ? createHmac("sha256", base).update("poskoo-reminder-links").digest("base64url") : "";
}
