// Server only: YouTube Data API v3 OAuth (authorization code flow + PKCE + state + nonce).
// Uses the SAME Google OAuth client as "Sign in with Google" (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET);
// the Google project "poskoo" has YouTube Data API v3 enabled. access_type=offline + prompt=consent
// make Google return a refresh token so we can upload later without the user present.
// No SDK: the code is exchanged at oauth2.googleapis.com/token. Secrets only from env vars; tokens are never logged.
import { createHash, randomBytes } from "node:crypto";
import { BRAND } from "@/lib/brand";
import { decryptToken, encryptToken } from "@/lib/crypto";

export const YOUTUBE_COOKIE = "yt_oauth";
export const YOUTUBE_COOKIE_PATH = "/api/youtube";
export const YOUTUBE_COOKIE_MAX_AGE_S = 600;

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const API_BASE = "https://www.googleapis.com/youtube/v3";
const SCOPES = "https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly";

export function youtubeConfig() {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    redirectUri: `${BRAND.url}/api/youtube/callback`,
  };
}

/** The YouTube connect button shows only when the Google OAuth client is configured. */
export function isYouTubeConfigured(): boolean {
  const { clientId, clientSecret } = youtubeConfig();
  return clientId !== "" && clientSecret !== "";
}

function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function pkceChallenge(verifier: string): string {
  return b64url(createHash("sha256").update(verifier, "ascii").digest());
}

export type YouTubeFlow = { state: string; verifier: string };

export function newYouTubeFlow(): YouTubeFlow {
  return { state: b64url(randomBytes(24)), verifier: b64url(randomBytes(48)) };
}

/** Encrypted flow cookie value (state, PKCE verifier). */
export function sealFlow(flow: YouTubeFlow): string {
  return encryptToken(JSON.stringify(flow));
}

export function openFlow(raw: string | undefined): YouTubeFlow | null {
  if (!raw) return null;
  try {
    const f = JSON.parse(decryptToken(raw)) as Partial<YouTubeFlow>;
    if (typeof f.state !== "string" || typeof f.verifier !== "string") return null;
    return { state: f.state, verifier: f.verifier };
  } catch {
    return null;
  }
}

export function youtubeAuthorizeUrl(flow: YouTubeFlow): string {
  const { clientId, redirectUri } = youtubeConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES,
    state: flow.state,
    code_challenge: pkceChallenge(flow.verifier),
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export type YouTubeFailure = "exchange_failed" | "no_refresh_token" | "channel_not_found" | "not_configured";

export class YouTubeAuthError extends Error {
  readonly reason: YouTubeFailure;
  constructor(reason: YouTubeFailure) {
    super(reason);
    this.reason = reason;
  }
}

type TokenResponse = {
  access_token?: unknown;
  refresh_token?: unknown;
  expires_in?: unknown;
  error?: unknown;
};

async function tokenRequest(body: Record<string, string>): Promise<TokenResponse> {
  const { clientId, clientSecret } = youtubeConfig();
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, ...body }).toString(),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  const json = (await res.json().catch(() => null)) as TokenResponse | null;
  if (!res.ok) throw new YouTubeAuthError("exchange_failed");
  return json ?? {};
}

/** Code (+ PKCE verifier) -> access token + refresh token. Throws YouTubeAuthError. */
export async function exchangeYouTubeCode(code: string, flow: YouTubeFlow): Promise<{ accessToken: string; refreshToken: string }> {
  const { redirectUri } = youtubeConfig();
  const json = await tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: flow.verifier,
  });
  const accessToken = typeof json.access_token === "string" ? json.access_token : "";
  const refreshToken = typeof json.refresh_token === "string" ? json.refresh_token : "";
  if (accessToken === "") throw new YouTubeAuthError("exchange_failed");
  // Google may omit the refresh token even with prompt=consent (e.g. the account already
  // granted these scopes). Return "" so the caller keeps the existing refresh token or
  // asks the user to reconnect — the access token must NOT be stored as the refresh token.
  return { accessToken, refreshToken };
}

/** Refresh token -> fresh access token (short-lived, ~1 h). Throws YouTubeAuthError. */
export async function refreshYouTubeToken(refreshToken: string): Promise<string> {
  const json = await tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken });
  const accessToken = typeof json.access_token === "string" ? json.access_token : "";
  if (accessToken === "") throw new YouTubeAuthError("exchange_failed");
  return accessToken;
}

export type YouTubeChannel = {
  channelId: string;
  title: string;
  avatarUrl: string | null;
};

type ChannelItem = {
  id?: unknown;
  snippet?: { title?: unknown; thumbnails?: { default?: { url?: unknown } } };
};

/** The channel belonging to the access token (channels?mine=true). Throws YouTubeAuthError. */
export async function fetchYouTubeChannel(accessToken: string): Promise<YouTubeChannel> {
  const res = await fetch(`${API_BASE}/channels?part=snippet&mine=true`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new YouTubeAuthError("channel_not_found");
  const json = (await res.json().catch(() => null)) as { items?: ChannelItem[] } | null;
  const item = Array.isArray(json?.items) ? json.items[0] : undefined;
  if (!item || typeof item.id !== "string") throw new YouTubeAuthError("channel_not_found");
  const title = typeof item.snippet?.title === "string" ? item.snippet.title : "";
  const avatar = item.snippet?.thumbnails?.default?.url;
  return { channelId: item.id, title, avatarUrl: typeof avatar === "string" ? avatar : null };
}
