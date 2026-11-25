// Server only: shared helpers for the networks added on 2026-11-11 (TikTok, Bluesky, Mastodon,
// LinkedIn, Pinterest, X). No SDKs: plain fetch, and every network function takes a fetchImpl so
// unit tests run without the network. Tokens are never logged; error messages are redacted.
import { createHash, randomBytes } from "node:crypto";
import { decryptToken, encryptToken } from "@/lib/crypto";
import { safeFetch } from "@/lib/netGuard";
import { EXTRA_NETWORK_IDS, EXTRA_NETWORK_LABEL, type ExtraNetworkId } from "@/lib/networks/tokenNetworks";

// ig_personal / fb_group are reminder channels (no posting API): Poskoo e-mails the user at the
// scheduled time instead of publishing (src/lib/networks/reminder.ts).
// Token networks (Telegram, Discord, Matrix, WordPress, ...) connect with a token / key / webhook
// instead of a reviewed OAuth app (src/lib/networks/tokenNetworks.ts).
export type NetworkId = "tiktok" | "bluesky" | "mastodon" | "linkedin" | "pinterest" | "x" | "gbp" | "ig_personal" | "fb_group" | ExtraNetworkId;
export const NETWORK_IDS: NetworkId[] = ["tiktok", "bluesky", "mastodon", "linkedin", "pinterest", "x", "gbp", "ig_personal", "fb_group", ...EXTRA_NETWORK_IDS];

export const NETWORK_LABEL: Record<NetworkId, string> = {
  tiktok: "TikTok",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  x: "X",
  gbp: "Google Business Profile",
  ig_personal: "Instagram (personal)",
  fb_group: "Facebook Group",
  ...EXTRA_NETWORK_LABEL,
};

export function isNetworkId(value: unknown): value is NetworkId {
  return typeof value === "string" && (NETWORK_IDS as string[]).includes(value);
}

export type Fetch = typeof fetch;

/** alt: image description from the media library / composer (networks that support it send it on). */
export type MediaItem = { type: "image" | "video"; url: string; alt?: string };

/** A stored account with decrypted tokens, handed to a network's publish function. */
export type NetAccount = {
  id: string;
  platform: NetworkId;
  externalId: string;
  username: string | null;
  accessToken: string;
  refreshToken: string;
  tokenExpiresAt: Date | null;
  meta: Record<string, unknown>;
  secret: Record<string, string>;
};

/** New tokens after a refresh. expiresIn / refreshExpiresIn in seconds (0 or undefined = unknown / no expiry). */
export type TokenSet = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  refreshExpiresIn?: number;
};

export type PublishOutcome =
  | {
      ok: true;
      id: string;
      url?: string;
      /** Accepted but not confirmed yet (still processing): keep the uploaded file for a while. */
      mediaPending?: boolean;
      /** Reminder channels: the e-mail went out, the user still has to post it themselves. */
      reminded?: boolean;
    }
  | { ok: false; error: string; tokenDead?: boolean; /** HTTP status when known; 0 = no response. */ status?: number };

export type PublishInput = {
  account: NetAccount;
  text: string;
  media: MediaItem[];
  options: Record<string, unknown>;
  /** Stable per-target key (post_targets.id) for networks that support idempotency keys. */
  idempotencyKey?: string;
  fetchImpl?: Fetch;
  sleep?: (ms: number) => Promise<void>;
};

/** Thrown by auth helpers; `reason` maps to a Settings banner, `message` is safe to show. */
export class NetworkAuthError extends Error {
  readonly reason: string;
  readonly tokenDead: boolean;
  constructor(reason: string, message: string, tokenDead = false) {
    super(message);
    this.reason = reason;
    this.tokenDead = tokenDead;
  }
}

/** Replace every secret in the message with [redacted] and cap the length. */
export function redact(message: string, ...secrets: (string | undefined | null)[]): string {
  let safe = message;
  for (const s of secrets) {
    if (s && s.length >= 4) safe = safe.split(s).join("[redacted]");
  }
  return safe.slice(0, 500);
}

/** Parse a response body as JSON; returns the raw text when it is not JSON. */
export async function readBody(res: Response): Promise<unknown> {
  const text = await res.text().catch(() => "");
  if (text === "") return {};
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export function str(v: unknown): string {
  return typeof v === "string" ? v : typeof v === "number" ? String(v) : "";
}

export function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function b64url(buf: Buffer): string {
  return buf.toString("base64url");
}

export function randomState(): string {
  return b64url(randomBytes(24));
}

/** RFC 7636 PKCE: 64-char verifier, S256 challenge (base64url). */
export function newPkceVerifier(): string {
  return b64url(randomBytes(48));
}

export function pkceS256(verifier: string): string {
  return b64url(createHash("sha256").update(verifier, "ascii").digest());
}

/** Encrypted OAuth flow cookie (state, optional PKCE verifier, optional extras such as the Mastodon instance). */
export type OAuthFlow = { state: string; verifier?: string; extra?: Record<string, string> };

export function sealOAuthFlow(flow: OAuthFlow): string {
  return encryptToken(JSON.stringify(flow));
}

export function openOAuthFlow(raw: string | undefined): OAuthFlow | null {
  if (!raw) return null;
  try {
    const f = JSON.parse(decryptToken(raw)) as Partial<OAuthFlow>;
    if (typeof f.state !== "string" || f.state === "") return null;
    const extra: Record<string, string> = {};
    for (const [k, v] of Object.entries(obj(f.extra))) if (typeof v === "string") extra[k] = v;
    return { state: f.state, verifier: typeof f.verifier === "string" ? f.verifier : undefined, extra };
  } catch {
    return null;
  }
}

export const OAUTH_COOKIE_MAX_AGE_S = 600;

/** Cookie options for the per-network OAuth flow cookie, scoped to /api/<network>. */
export function oauthCookieOptions(network: NetworkId) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: `/api/${network}`,
    maxAge: OAUTH_COOKIE_MAX_AGE_S,
  };
}

export function oauthCookieName(network: NetworkId): string {
  return `${network}_oauth`;
}

/** Media from the post (images and videos), in order. */
export function mediaItems(raw: unknown): MediaItem[] {
  if (!Array.isArray(raw)) return [];
  const out: MediaItem[] = [];
  for (const item of raw) {
    const row = obj(item);
    if ((row.type === "image" || row.type === "video") && typeof row.url === "string" && row.url !== "") {
      const alt = typeof row.alt === "string" ? row.alt.trim().slice(0, 1000) : "";
      out.push(alt ? { type: row.type, url: row.url, alt } : { type: row.type, url: row.url });
    }
  }
  return out;
}

const DOWNLOAD_CONNECT_TIMEOUT_MS = 5 * 60_000;

/**
 * Download a media file into memory. The timeout covers connecting only, so big videos can stream at
 * any speed. Media URLs can come from the user (MCP / API), so the real fetch is swapped for
 * safeFetch (no internal hosts, pinned DNS, redirects re-checked); injected test fetches run as is.
 */
export async function downloadMedia(
  url: string,
  fetchImpl: Fetch = safeFetch,
  maxBytes = 1024 * 1024 * 1024,
): Promise<{ ok: true; bytes: Buffer; contentType: string } | { ok: false; error: string }> {
  const get = fetchImpl === globalThis.fetch ? safeFetch : fetchImpl;
  const connect = new AbortController();
  const timer = setTimeout(() => connect.abort(), DOWNLOAD_CONNECT_TIMEOUT_MS);
  let res: Response;
  try {
    res = await get(url, { signal: connect.signal, cache: "no-store" });
  } catch (err) {
    return { ok: false, error: `Could not download the media file: ${err instanceof Error ? err.message : String(err)}` };
  } finally {
    clearTimeout(timer);
  }
  if (!res.ok) return { ok: false, error: `Could not download the media file (HTTP ${res.status})` };
  const declared = Number(res.headers.get("content-length") ?? "0");
  if (declared > maxBytes) return { ok: false, error: "The media file is too large for this network." };
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length === 0) return { ok: false, error: "The media file is empty." };
  if (bytes.length > maxBytes) return { ok: false, error: "The media file is too large for this network." };
  const contentType = (res.headers.get("content-type") ?? "").split(";")[0].trim() || guessMime(url);
  return { ok: true, bytes, contentType };
}

export function guessMime(url: string): string {
  const path = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return url.toLowerCase();
    }
  })();
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".gif")) return "image/gif";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".mov")) return "video/quicktime";
  if (path.endsWith(".webm")) return "video/webm";
  if (path.endsWith(".mp4")) return "video/mp4";
  return "application/octet-stream";
}

/** Standard OAuth2 token response -> TokenSet. Throws when there is no access token. */
export function tokenSetFrom(json: unknown, label: string): TokenSet {
  const o = obj(json);
  const accessToken = str(o.access_token);
  if (!accessToken) throw new NetworkAuthError("exchange_failed", `${label} returned no access token`);
  const num = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0)) || 0;
  return {
    accessToken,
    refreshToken: str(o.refresh_token) || undefined,
    expiresIn: num(o.expires_in),
    refreshExpiresIn: num(o.refresh_expires_in ?? o.refresh_token_expires_in),
  };
}
