// Server only: Bluesky (AT Protocol) with an app password. No developer app or env vars needed.
// The handle + app password create a session (accessJwt ~2 h, refreshJwt ~2 months). The app
// password is stored encrypted (social_accounts.secret_enc) so an expired session can be recreated.
import { safeFetch } from "@/lib/netGuard";
import {
  NetworkAuthError,
  downloadMedia,
  obj,
  readBody,
  redact,
  str,
  type Fetch,
  type PublishInput,
  type PublishOutcome,
  type TokenSet,
} from "@/lib/networks/common";

export const BLUESKY_DEFAULT_SERVICE = "https://bsky.social";
export const BLUESKY_MAX_IMAGES = 4;
/** app.bsky.embed.images: each image blob must be 1,000,000 bytes or smaller. */
export const BLUESKY_MAX_IMAGE_BYTES = 1_000_000;

/** Normalise a handle: strips "@", spaces and a bsky.app profile URL; lower case. */
export function normalizeHandle(input: string): string {
  let h = input.trim();
  const m = h.match(/bsky\.app\/profile\/([^/?#]+)/i);
  if (m) h = m[1];
  h = h.replace(/^@/, "").toLowerCase();
  if (h !== "" && !h.includes(".") && !h.startsWith("did:")) h = `${h}.bsky.social`;
  return h;
}

/** App passwords look like xxxx-xxxx-xxxx-xxxx. */
export function looksLikeAppPassword(pw: string): boolean {
  return /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/i.test(pw.trim());
}

export function normalizeService(input: string | undefined | null): string | null {
  const raw = (input ?? "").trim();
  if (raw === "") return BLUESKY_DEFAULT_SERVICE;
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (u.protocol !== "https:") return null;
    return `https://${u.host}`;
  } catch {
    return null;
  }
}

export type BlueskySession = {
  did: string;
  handle: string;
  accessJwt: string;
  refreshJwt: string;
  /** The PDS that serves this account (from the DID document), used for every later call. */
  service: string;
};

function pdsFromDidDoc(doc: unknown): string | null {
  const services = obj(doc).service;
  if (!Array.isArray(services)) return null;
  for (const s of services) {
    const svc = obj(s);
    if (str(svc.id).endsWith("#atproto_pds") && str(svc.serviceEndpoint).startsWith("https://")) {
      return str(svc.serviceEndpoint).replace(/\/$/, "");
    }
  }
  return null;
}

async function xrpc(
  service: string,
  method: string,
  init: { token?: string; body?: unknown; raw?: Uint8Array; contentType?: string; get?: boolean },
  fetchImpl: Fetch,
): Promise<{ ok: true; json: Record<string, unknown> } | { ok: false; status: number; error: string; message: string }> {
  const headers: Record<string, string> = {};
  if (init.token) headers.Authorization = `Bearer ${init.token}`;
  let body: BodyInit | undefined;
  if (init.raw) {
    headers["Content-Type"] = init.contentType ?? "application/octet-stream";
    body = init.raw as unknown as BodyInit;
  } else if (!init.get) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(init.body ?? {});
  }
  let res: Response;
  try {
    res = await fetchImpl(`${service}/xrpc/${method}`, {
      method: init.get ? "GET" : "POST",
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    return { ok: false, status: 0, error: "network", message: err instanceof Error ? err.message : String(err) };
  }
  const json = obj(await readBody(res));
  if (!res.ok) return { ok: false, status: res.status, error: str(json.error) || `HTTP ${res.status}`, message: str(json.message) };
  return { ok: true, json };
}

/** com.atproto.server.createSession with handle + app password. Throws NetworkAuthError. */
export async function createBlueskySession(
  identifier: string,
  appPassword: string,
  service = BLUESKY_DEFAULT_SERVICE,
  fetchImpl: Fetch = safeFetch,
): Promise<BlueskySession> {
  const r = await xrpc(service, "com.atproto.server.createSession", { body: { identifier, password: appPassword } }, fetchImpl);
  if (!r.ok) {
    if (r.status === 401 || r.error === "AuthenticationRequired") {
      throw new NetworkAuthError("bad_login", "Bluesky did not accept that handle and app password. Check both and try again.", true);
    }
    if (r.error === "AuthFactorTokenRequired") {
      throw new NetworkAuthError("bad_login", "Bluesky asked for an email code: use an app password (Settings → Privacy and security → App passwords), not your main password.");
    }
    throw new NetworkAuthError("error", redact(`Bluesky login failed: ${r.error}${r.message ? ` ${r.message}` : ""}`, appPassword));
  }
  const did = str(r.json.did);
  const accessJwt = str(r.json.accessJwt);
  const refreshJwt = str(r.json.refreshJwt);
  if (!did || !accessJwt) throw new NetworkAuthError("error", "Bluesky login returned no session.");
  return { did, handle: str(r.json.handle) || identifier, accessJwt, refreshJwt, service: pdsFromDidDoc(r.json.didDoc) ?? service };
}

/** com.atproto.server.refreshSession (the refresh JWT is the bearer). Throws NetworkAuthError(tokenDead) when expired. */
export async function refreshBlueskySession(service: string, refreshJwt: string, fetchImpl: Fetch = safeFetch): Promise<TokenSet> {
  const r = await xrpc(service, "com.atproto.server.refreshSession", { token: refreshJwt }, fetchImpl);
  if (!r.ok) {
    const dead = r.status === 400 || r.status === 401 || r.error === "ExpiredToken" || r.error === "InvalidToken";
    throw new NetworkAuthError("refresh_failed", redact(`Bluesky session refresh failed: ${r.error}`, refreshJwt), dead);
  }
  const accessJwt = str(r.json.accessJwt);
  if (!accessJwt) throw new NetworkAuthError("refresh_failed", "Bluesky refresh returned no token");
  // accessJwt lives ~2 hours; refresh 15 minutes early.
  return { accessToken: accessJwt, refreshToken: str(r.json.refreshJwt) || undefined, expiresIn: 105 * 60 };
}

/** Session expiry for a fresh accessJwt (read from its exp claim, default 2 hours). */
export function jwtExpiresIn(jwt: string, nowMs = Date.now()): number {
  try {
    const payload = JSON.parse(Buffer.from(jwt.split(".")[1] ?? "", "base64url").toString("utf8")) as { exp?: number };
    if (typeof payload.exp === "number") return Math.max(0, Math.floor(payload.exp - nowMs / 1000) - 15 * 60);
  } catch {
    // not a JWT we can read
  }
  return 105 * 60;
}

type Facet = { index: { byteStart: number; byteEnd: number }; features: Record<string, unknown>[] };

function byteIndex(text: string, charIndex: number): number {
  return Buffer.byteLength(text.slice(0, charIndex), "utf8");
}

const LINK_RE = /https?:\/\/[^\s<>"'()]+[^\s<>"'().,;:!?]/g;
const TAG_RE = /(^|\s)#([\p{L}\p{N}_]*[\p{L}_][\p{L}\p{N}_]*)/gu;
const MENTION_RE = /(^|\s)@([a-z0-9][a-z0-9.-]*\.[a-z]{2,})/gi;

/**
 * Rich-text facets (UTF-8 byte offsets): links, hashtags and @mentions. Mentions are resolved to a
 * DID with `resolveHandle`; an unresolvable mention stays plain text.
 */
export async function buildFacets(text: string, resolveHandle: (handle: string) => Promise<string | null>): Promise<Facet[]> {
  const facets: Facet[] = [];
  for (const m of text.matchAll(LINK_RE)) {
    const start = m.index ?? 0;
    facets.push({
      index: { byteStart: byteIndex(text, start), byteEnd: byteIndex(text, start + m[0].length) },
      features: [{ $type: "app.bsky.richtext.facet#link", uri: m[0] }],
    });
  }
  for (const m of text.matchAll(TAG_RE)) {
    const start = (m.index ?? 0) + m[1].length;
    const tag = m[2];
    if (tag.length > 64) continue;
    facets.push({
      index: { byteStart: byteIndex(text, start), byteEnd: byteIndex(text, start + 1 + tag.length) },
      features: [{ $type: "app.bsky.richtext.facet#tag", tag }],
    });
  }
  for (const m of text.matchAll(MENTION_RE)) {
    const start = (m.index ?? 0) + m[1].length;
    const did = await resolveHandle(m[2].toLowerCase()).catch(() => null);
    if (!did) continue;
    facets.push({
      index: { byteStart: byteIndex(text, start), byteEnd: byteIndex(text, start + 1 + m[2].length) },
      features: [{ $type: "app.bsky.richtext.facet#mention", did }],
    });
  }
  return facets.sort((a, b) => a.index.byteStart - b.index.byteStart);
}

function metaContent(html: string, prop: string): string {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']*)["']`, "i");
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${prop}["']`, "i");
  const m = html.match(re) ?? html.match(re2);
  return m ? decodeEntities(m[1]).trim() : "";
}

function decodeEntities(s: string): string {
  return s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

/** Link card (app.bsky.embed.external) for the first link: title/description from the page's Open Graph tags. */
export async function linkCard(url: string, fetchImpl: Fetch): Promise<{ uri: string; title: string; description: string }> {
  let title = "";
  let description = "";
  try {
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(5_000), headers: { Accept: "text/html" }, cache: "no-store" });
    if (res.ok && (res.headers.get("content-type") ?? "").includes("html")) {
      const html = (await res.text()).slice(0, 200_000);
      title = metaContent(html, "og:title") || decodeEntities(html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? "").trim();
      description = metaContent(html, "og:description") || metaContent(html, "description");
    }
  } catch {
    // a card without a title still works
  }
  if (!title) {
    try {
      title = new URL(url).host;
    } catch {
      title = url;
    }
  }
  return { uri: url, title: title.slice(0, 300), description: description.slice(0, 1000) };
}

/** Shrink an image over Bluesky's 1 MB blob limit (sharp ships with Next.js; when it is missing the error explains). */
async function fitImage(bytes: Buffer, contentType: string): Promise<{ bytes: Buffer; contentType: string } | null> {
  if (bytes.length <= BLUESKY_MAX_IMAGE_BYTES) return { bytes, contentType };
  try {
    const sharp = (await import("sharp")).default;
    for (const [width, quality] of [[2000, 85], [1600, 80], [1200, 75], [1000, 65]] as const) {
      const out = await sharp(bytes).rotate().resize({ width, height: width, fit: "inside", withoutEnlargement: true }).jpeg({ quality }).toBuffer();
      if (out.length <= BLUESKY_MAX_IMAGE_BYTES) return { bytes: out, contentType: "image/jpeg" };
    }
  } catch {
    return null;
  }
  return null;
}

/** Post text + up to 4 images (or a link card) with facets. The account's accessToken is the accessJwt. */
export async function publishToBluesky(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? safeFetch;
  const token = input.account.accessToken;
  const service = str(input.account.meta.service) || BLUESKY_DEFAULT_SERVICE;
  const did = input.account.externalId;
  const text = input.text.trim();
  if (input.media.some((m) => m.type === "video")) {
    return { ok: false, error: "Bluesky posts from Poskoo support images only for now. Remove the video or untick Bluesky." };
  }
  const images = input.media.filter((m) => m.type === "image");
  if (images.length > BLUESKY_MAX_IMAGES) return { ok: false, error: "Bluesky takes up to 4 images per post." };

  const fail = (r: { status: number; error: string; message: string }, what: string): PublishOutcome => ({
    ok: false,
    error: redact(`Bluesky ${what} failed: ${r.error}${r.message ? ` ${r.message}` : ""}`, token),
    tokenDead: r.status === 401 || r.error === "ExpiredToken" || r.error === "InvalidToken",
  });

  let embed: Record<string, unknown> | undefined;
  if (images.length > 0) {
    const uploaded: Record<string, unknown>[] = [];
    for (const img of images) {
      const file = await downloadMedia(img.url, fetchImpl, 50 * 1024 * 1024);
      if (!file.ok) return file;
      const fitted = await fitImage(file.bytes, file.contentType.startsWith("image/") ? file.contentType : "image/jpeg");
      if (!fitted) return { ok: false, error: "A Bluesky image must be 1 MB or smaller. Use a smaller image." };
      const r = await xrpc(service, "com.atproto.repo.uploadBlob", { token, raw: new Uint8Array(fitted.bytes), contentType: fitted.contentType }, fetchImpl);
      if (!r.ok) return fail(r, "image upload");
      uploaded.push({ alt: "", image: r.json.blob });
    }
    embed = { $type: "app.bsky.embed.images", images: uploaded };
  } else {
    const link = text.match(LINK_RE)?.[0];
    if (link) embed = { $type: "app.bsky.embed.external", external: await linkCard(link, fetchImpl) };
  }

  const facets = await buildFacets(text, async (handle) => {
    const r = await xrpc(service, `com.atproto.identity.resolveHandle?handle=${encodeURIComponent(handle)}`, { token, get: true }, fetchImpl);
    return r.ok ? str(r.json.did) || null : null;
  });

  const record: Record<string, unknown> = {
    $type: "app.bsky.feed.post",
    text,
    createdAt: new Date().toISOString(),
    ...(facets.length > 0 ? { facets } : {}),
    ...(embed ? { embed } : {}),
  };
  const r = await xrpc(service, "com.atproto.repo.createRecord", { token, body: { repo: did, collection: "app.bsky.feed.post", record } }, fetchImpl);
  if (!r.ok) return fail(r, "post");
  const uri = str(r.json.uri);
  const rkey = uri.split("/").pop() ?? "";
  const handle = input.account.username ?? did;
  return { ok: true, id: uri, url: rkey ? `https://bsky.app/profile/${handle}/post/${rkey}` : undefined };
}
