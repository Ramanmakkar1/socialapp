// Pure referral-code and cookie helpers (no DB, no Node APIs) shared by src/proxy.ts,
// the /r/<code> route and src/lib/referrals.ts.

export const REF_COOKIE = "pf_ref";
export const REF_WINDOW_DAYS = 60;
export const REF_WINDOW_MS = REF_WINDOW_DAYS * 24 * 60 * 60 * 1000;
/** Only accounts created this recently can be attributed (sign-up, not a later login). */
export const NEW_ACCOUNT_MS = 60 * 60 * 1000;

const CODE_RE = /^[A-Z0-9]{6,16}$/;
/** No 0/O/1/I so codes survive being read aloud or retyped. */
export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeCode(raw: string | null | undefined): string | null {
  const code = (raw ?? "").trim().toUpperCase();
  return CODE_RE.test(code) ? code : null;
}

export function refCookieValue(code: string, issuedAt: number): string {
  return `${code}.${issuedAt}`;
}

/** Parses the cookie; null when malformed, from the future, or older than the 60-day window. */
export function parseRefCookie(value: string | null | undefined, now = Date.now()): { code: string; issuedAt: number } | null {
  if (!value) return null;
  const m = value.match(/^([A-Za-z0-9]{6,16})\.(\d{10,15})$/);
  if (!m) return null;
  const code = normalizeCode(m[1]);
  const issuedAt = Number(m[2]);
  if (!code || !Number.isSafeInteger(issuedAt)) return null;
  if (issuedAt > now + 5 * 60 * 1000 || now - issuedAt > REF_WINDOW_MS) return null;
  return { code, issuedAt };
}

/** Cookie options: first touch, 60 days, readable only by the server. */
export function refCookieOptions(secure: boolean) {
  return { httpOnly: true, sameSite: "lax" as const, secure, path: "/", maxAge: Math.floor(REF_WINDOW_MS / 1000) };
}
