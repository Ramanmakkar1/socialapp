// Server only: Mastodon (any instance). The app registers itself per instance (POST /api/v1/apps)
// the first time someone from that instance connects; client id/secret are stored per instance
// (mastodon_apps, secret encrypted). OAuth authorization code flow with PKCE (instances that do
// not support PKCE ignore it). No env vars needed.
import { safeFetch } from "@/lib/netGuard";
import { BRAND } from "@/lib/brand";
import {
  NetworkAuthError,
  downloadMedia,
  guessMime,
  obj,
  pkceS256,
  readBody,
  redact,
  sleep as defaultSleep,
  str,
  type Fetch,
  type PublishInput,
  type PublishOutcome,
  type TokenSet,
} from "@/lib/networks/common";

export const MASTODON_SCOPES = "read:accounts write:statuses write:media";
export const MASTODON_DEFAULT_MAX_CHARS = 500;
export const MASTODON_DEFAULT_MAX_MEDIA = 4;

export function mastodonRedirectUri(): string {
  return `${BRAND.url}/api/mastodon/callback`;
}

/**
 * "mastodon.social", "@me@mastodon.social", "https://mastodon.social/@me" -> "mastodon.social".
 * Returns null for anything that is not a plausible public host name.
 */
export function normalizeInstance(input: string): string | null {
  let raw = input.trim().toLowerCase();
  if (raw === "") return null;
  const at = raw.includes("://") ? null : raw.match(/^@?[^@\s/]+@([^@\s/]+)$/);
  if (at) raw = at[1];
  try {
    const u = new URL(raw.includes("://") ? raw : `https://${raw}`);
    const host = u.hostname;
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host)) return null;
    if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return null;
    return u.port ? null : host;
  } catch {
    return null;
  }
}

/** POST /api/v1/apps on the instance. */
export async function registerMastodonApp(
  instance: string,
  fetchImpl: Fetch = safeFetch,
): Promise<{ clientId: string; clientSecret: string; redirectUri: string }> {
  const redirectUri = mastodonRedirectUri();
  let res: Response;
  try {
    res = await fetchImpl(`https://${instance}/api/v1/apps`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_name: BRAND.name, redirect_uris: redirectUri, scopes: MASTODON_SCOPES, website: BRAND.url }).toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new NetworkAuthError("instance_unreachable", `We couldn't reach ${instance}. Check the server name.`);
  }
  const json = obj(await readBody(res));
  const clientId = str(json.client_id);
  const clientSecret = str(json.client_secret);
  if (!res.ok || !clientId || !clientSecret) {
    throw new NetworkAuthError("instance_unreachable", `${instance} did not accept the app registration. Is it a Mastodon server?`);
  }
  return { clientId, clientSecret, redirectUri };
}

export function mastodonAuthorizeUrl(instance: string, clientId: string, state: string, verifier: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    scope: MASTODON_SCOPES,
    redirect_uri: mastodonRedirectUri(),
    response_type: "code",
    state,
    code_challenge: pkceS256(verifier),
    code_challenge_method: "S256",
  });
  return `https://${instance}/oauth/authorize?${params.toString()}`;
}

export async function exchangeMastodonCode(
  instance: string,
  app: { clientId: string; clientSecret: string },
  code: string,
  verifier: string,
  fetchImpl: Fetch = safeFetch,
): Promise<TokenSet> {
  let res: Response;
  try {
    res = await fetchImpl(`https://${instance}/oauth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: app.clientId,
        client_secret: app.clientSecret,
        redirect_uri: mastodonRedirectUri(),
        scope: MASTODON_SCOPES,
        code_verifier: verifier,
      }).toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new NetworkAuthError("exchange_failed", `We couldn't reach ${instance}.`);
  }
  const json = obj(await readBody(res));
  const accessToken = str(json.access_token);
  if (!res.ok || !accessToken) throw new NetworkAuthError("exchange_failed", redact(`Mastodon token exchange failed (${res.status}) ${str(json.error)}`, app.clientSecret, code));
  // Mastodon user tokens do not expire.
  return { accessToken };
}

async function api(
  instance: string,
  token: string,
  path: string,
  init: { method?: string; body?: BodyInit; headers?: Record<string, string> },
  fetchImpl: Fetch,
): Promise<{ ok: true; status: number; json: Record<string, unknown> } | { ok: false; status: number; error: string }> {
  let res: Response;
  try {
    res = await fetchImpl(`https://${instance}${path}`, {
      method: init.method ?? "GET",
      headers: { Authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
      body: init.body,
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err) {
    return { ok: false, status: 0, error: err instanceof Error ? err.message : String(err) };
  }
  const json = obj(await readBody(res));
  if (!res.ok) return { ok: false, status: res.status, error: redact(str(json.error) || `HTTP ${res.status}`, token) };
  return { ok: true, status: res.status, json };
}

export type MastodonProfile = { id: string; username: string; acct: string; url: string; avatar: string | null };

export async function verifyMastodonCredentials(instance: string, token: string, fetchImpl: Fetch = safeFetch): Promise<MastodonProfile> {
  const r = await api(instance, token, "/api/v1/accounts/verify_credentials", {}, fetchImpl);
  if (!r.ok || !str(r.json.id)) throw new NetworkAuthError("profile_failed", `Mastodon profile request failed (${r.ok ? "no id" : r.error})`);
  return {
    id: str(r.json.id),
    username: str(r.json.username),
    acct: str(r.json.acct),
    url: str(r.json.url),
    avatar: str(r.json.avatar) || null,
  };
}

/** Character + attachment limits of the instance (/api/v2/instance, falling back to v1). */
export async function fetchInstanceLimits(instance: string, fetchImpl: Fetch = safeFetch): Promise<{ maxChars: number; maxMedia: number }> {
  for (const path of ["/api/v2/instance", "/api/v1/instance"]) {
    try {
      const res = await fetchImpl(`https://${instance}${path}`, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
      if (!res.ok) continue;
      const json = obj(await readBody(res));
      const statuses = obj(obj(json.configuration).statuses);
      const maxChars = Number(statuses.max_characters ?? json.max_toot_chars ?? 0);
      const maxMedia = Number(statuses.max_media_attachments ?? 0);
      return {
        maxChars: maxChars > 0 ? maxChars : MASTODON_DEFAULT_MAX_CHARS,
        maxMedia: maxMedia > 0 ? maxMedia : MASTODON_DEFAULT_MAX_MEDIA,
      };
    } catch {
      // try the next one
    }
  }
  return { maxChars: MASTODON_DEFAULT_MAX_CHARS, maxMedia: MASTODON_DEFAULT_MAX_MEDIA };
}

/** Upload one attachment (POST /api/v2/media) and wait until the instance has processed it. */
async function uploadMedia(
  instance: string,
  token: string,
  url: string,
  fetchImpl: Fetch,
  sleep: (ms: number) => Promise<void>,
  alt = "",
): Promise<{ ok: true; id: string } | { ok: false; error: string; tokenDead?: boolean }> {
  const file = await downloadMedia(url, fetchImpl, 200 * 1024 * 1024);
  if (!file.ok) return file;
  const type = file.contentType && file.contentType !== "application/octet-stream" ? file.contentType : guessMime(url);
  const form = new FormData();
  const name = (() => {
    try {
      return new URL(url).pathname.split("/").pop() || "media";
    } catch {
      return "media";
    }
  })();
  form.append("file", new Blob([new Uint8Array(file.bytes)], { type }), name);
  if (alt) form.append("description", alt.slice(0, 1500));
  const r = await api(instance, token, "/api/v2/media", { method: "POST", body: form }, fetchImpl);
  if (!r.ok) return { ok: false, error: `Mastodon media upload failed: ${r.error}`, tokenDead: r.status === 401 };
  const id = str(r.json.id);
  if (!id) return { ok: false, error: "Mastodon media upload returned no id" };
  // 202 = still processing (url is null until done).
  if (r.status === 202 || r.json.url === null) {
    for (let i = 0; i < 30; i += 1) {
      await sleep(2_000);
      const s = await api(instance, token, `/api/v1/media/${encodeURIComponent(id)}`, {}, fetchImpl);
      if (s.ok && s.status === 200 && s.json.url) return { ok: true, id };
      if (!s.ok && s.status !== 206) return { ok: false, error: `Mastodon media processing failed: ${s.error}` };
    }
    return { ok: false, error: "Mastodon is still processing the media; retry in a few minutes." };
  }
  return { ok: true, id };
}

/** POST /api/v1/statuses with media attachments. Idempotency-Key makes a retried request safe. */
export async function publishToMastodon(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? safeFetch;
  const sleep = input.sleep ?? defaultSleep;
  const instance = str(input.account.meta.instance);
  if (!instance) return { ok: false, error: "This Mastodon account has no server stored. Reconnect Mastodon in Settings.", tokenDead: true };
  const token = input.account.accessToken;
  const maxMedia = Number(input.account.meta.maxMedia ?? MASTODON_DEFAULT_MAX_MEDIA) || MASTODON_DEFAULT_MAX_MEDIA;
  if (input.media.length > maxMedia) return { ok: false, error: `Your Mastodon server takes up to ${maxMedia} attachments per post.` };
  if (input.media.some((m) => m.type === "video") && input.media.length > 1) {
    return { ok: false, error: "Mastodon takes one video, or up to 4 images." };
  }
  const mediaIds: string[] = [];
  for (const m of input.media) {
    const up = await uploadMedia(instance, token, m.url, fetchImpl, sleep, m.alt ?? "");
    if (!up.ok) return up;
    mediaIds.push(up.id);
  }
  const body = new URLSearchParams({ status: input.text.trim(), visibility: "public" });
  for (const id of mediaIds) body.append("media_ids[]", id);
  const r = await api(
    instance,
    token,
    "/api/v1/statuses",
    {
      method: "POST",
      body: body.toString(),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        ...(input.idempotencyKey ? { "Idempotency-Key": input.idempotencyKey } : {}),
      },
    },
    fetchImpl,
  );
  if (!r.ok) return { ok: false, error: `Mastodon post failed: ${r.error}`, tokenDead: r.status === 401 };
  const id = str(r.json.id);
  if (!id) return { ok: false, error: "Mastodon returned no post id" };
  return { ok: true, id, url: str(r.json.url) || undefined };
}
