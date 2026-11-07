// Server only: "Sign in with Google" (OAuth 2.0 authorization code flow + PKCE + state + nonce).
// No SDK: the code is exchanged at oauth2.googleapis.com/token and the id_token is checked with
// Google's tokeninfo endpoint (the token came straight from Google over TLS; tokeninfo also checks
// its signature and expiry). Secrets only from env vars; tokens are never logged.
import { createHash, randomBytes } from "node:crypto";
import { BRAND } from "@/lib/brand";
import { decryptToken, encryptToken } from "@/lib/crypto";
import { query } from "@/lib/db";
import { normalizeEmail } from "@/lib/password";
import type { CurrentUser } from "@/lib/auth";

export const GOOGLE_COOKIE = "g_oauth";
export const GOOGLE_COOKIE_PATH = "/api/auth/google";
export const GOOGLE_COOKIE_MAX_AGE_S = 600;

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo";
const ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);

export function googleConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri: `${BRAND.url}/api/auth/google/callback`,
  };
}

/** The Google button shows only when both env vars are set. */
export function isGoogleConfigured(): boolean {
  const { clientId, clientSecret } = googleConfig();
  return clientId !== "" && clientSecret !== "";
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function pkceChallenge(verifier: string): string {
  return b64url(createHash("sha256").update(verifier, "ascii").digest());
}

export type GoogleFlow = { state: string; verifier: string; nonce: string };

export function newGoogleFlow(): GoogleFlow {
  return { state: b64url(randomBytes(24)), verifier: b64url(randomBytes(48)), nonce: b64url(randomBytes(16)) };
}

/** Encrypted flow cookie value (state, PKCE verifier, nonce). */
export function sealFlow(flow: GoogleFlow): string {
  return encryptToken(JSON.stringify(flow));
}

export function openFlow(raw: string | undefined): GoogleFlow | null {
  if (!raw) return null;
  try {
    const f = JSON.parse(decryptToken(raw)) as Partial<GoogleFlow>;
    if (typeof f.state !== "string" || typeof f.verifier !== "string" || typeof f.nonce !== "string") return null;
    return { state: f.state, verifier: f.verifier, nonce: f.nonce };
  } catch {
    return null;
  }
}

export function googleAuthorizeUrl(flow: GoogleFlow): string {
  const { clientId, redirectUri } = googleConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: flow.state,
    nonce: flow.nonce,
    code_challenge: pkceChallenge(flow.verifier),
    code_challenge_method: "S256",
    prompt: "select_account",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export type GoogleIdentity = { sub: string; email: string; emailVerified: boolean; name: string | null };

export type GoogleFailure =
  | "exchange_failed"
  | "invalid_token"
  | "unverified_email"
  | "linked_other"
  | "not_ready";

export class GoogleSignInError extends Error {
  readonly reason: GoogleFailure;
  constructor(reason: GoogleFailure) {
    super(reason);
    this.reason = reason;
  }
}

/** Code (+ PKCE verifier) -> id_token -> verified identity. Throws GoogleSignInError. */
export async function exchangeGoogleCode(code: string, flow: GoogleFlow, now = Date.now()): Promise<GoogleIdentity> {
  const { clientId, clientSecret, redirectUri } = googleConfig();
  let idToken: unknown;
  try {
    const res = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        code_verifier: flow.verifier,
      }).toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    const json = (await res.json().catch(() => null)) as { id_token?: unknown } | null;
    if (!res.ok) throw new GoogleSignInError("exchange_failed");
    idToken = json?.id_token;
  } catch (err) {
    if (err instanceof GoogleSignInError) throw err;
    throw new GoogleSignInError("exchange_failed");
  }
  if (typeof idToken !== "string" || idToken === "") throw new GoogleSignInError("exchange_failed");
  return verifyIdToken(idToken, flow.nonce, now);
}

type TokenInfo = {
  aud?: unknown;
  iss?: unknown;
  sub?: unknown;
  email?: unknown;
  email_verified?: unknown;
  exp?: unknown;
  nonce?: unknown;
  name?: unknown;
};

export async function verifyIdToken(idToken: string, nonce: string, now = Date.now()): Promise<GoogleIdentity> {
  const { clientId } = googleConfig();
  let info: TokenInfo | null = null;
  try {
    const res = await fetch(`${TOKENINFO_URL}?id_token=${encodeURIComponent(idToken)}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) info = (await res.json().catch(() => null)) as TokenInfo | null;
  } catch {
    info = null;
  }
  if (!info) throw new GoogleSignInError("invalid_token");
  const exp = Number(info.exp);
  if (
    info.aud !== clientId ||
    typeof info.iss !== "string" ||
    !ISSUERS.has(info.iss) ||
    typeof info.sub !== "string" ||
    info.sub === "" ||
    !Number.isFinite(exp) ||
    exp * 1000 <= now ||
    info.nonce !== nonce
  ) {
    throw new GoogleSignInError("invalid_token");
  }
  return {
    sub: info.sub,
    email: typeof info.email === "string" ? normalizeEmail(info.email) : "",
    emailVerified: info.email_verified === true || info.email_verified === "true",
    name: typeof info.name === "string" && info.name.trim() !== "" ? info.name.trim().slice(0, 120) : null,
  };
}

function isMissingColumn(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "42703";
}

/**
 * Finds or creates the Poskoo user for a verified Google identity:
 * 1. a user already linked to this Google account (sub), else
 * 2. a user with the same (Google-verified) email: the Google account is linked to it, else
 * 3. a new user without a password.
 * Unverified Google emails are rejected. Throws GoogleSignInError("not_ready") until migration 016 runs.
 */
export async function findOrCreateGoogleUser(id: GoogleIdentity): Promise<CurrentUser> {
  if (!id.emailVerified || !id.email) throw new GoogleSignInError("unverified_email");
  try {
    const bySub = await query<CurrentUser>("select id, email, name from socialapp.users where google_sub=$1", [id.sub]);
    if (bySub[0]) return bySub[0];
    const byEmail = await query<CurrentUser & { google_sub: string | null }>(
      "select id, email, name, google_sub from socialapp.users where email=$1",
      [id.email],
    );
    const existing = byEmail[0];
    if (existing) {
      if (existing.google_sub && existing.google_sub !== id.sub) throw new GoogleSignInError("linked_other");
      await query("update socialapp.users set google_sub=$2 where id=$1 and google_sub is null", [existing.id, id.sub]);
      return { id: existing.id, email: existing.email, name: existing.name };
    }
    const created = await query<CurrentUser>(
      "insert into socialapp.users (email, password_hash, name, google_sub) values ($1, null, $2, $3) on conflict do nothing returning id, email, name",
      [id.email, id.name, id.sub],
    );
    if (created[0]) return created[0];
    // Lost a race with a parallel sign-in or sign-up: use the row that won.
    const again = await query<CurrentUser>("select id, email, name from socialapp.users where google_sub=$1 or email=$2 order by (google_sub=$1) desc nulls last limit 1", [
      id.sub,
      id.email,
    ]);
    if (again[0]) return again[0];
    throw new GoogleSignInError("exchange_failed");
  } catch (err) {
    if (isMissingColumn(err)) throw new GoogleSignInError("not_ready");
    throw err;
  }
}

/** Messages for /login?google=<reason>. */
export const GOOGLE_ERRORS: Record<string, string> = {
  cancelled: "Google sign-in was cancelled.",
  state: "Your Google sign-in link expired or was opened in another browser. Please try again.",
  exchange_failed: "Google sign-in didn't work. Please try again.",
  invalid_token: "Google sign-in didn't work. Please try again.",
  unverified_email: "Your Google account's email address isn't verified, so we can't use it to sign you in.",
  linked_other: "This email is already linked to a different Google account. Use that Google account or log in with your password.",
  not_ready: "Google sign-in isn't switched on yet. Please use your email and password.",
  not_configured: "Google sign-in isn't switched on yet. Please use your email and password.",
  rate_limited: "Too many attempts. Please wait a few minutes and try again.",
  error: "Sign-in is not available right now. Please try again.",
};
