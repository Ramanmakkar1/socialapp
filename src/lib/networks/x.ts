// Server only: X (Twitter) API v2. OAuth 2.0 Authorization Code with PKCE (confidential client),
// scopes tweet.read tweet.write users.read offline.access media.write. Media goes through the v2
// chunked upload (initialize / append / finalize / status), then POST /2/tweets.
import { BRAND } from "@/lib/brand";
import {
  NetworkAuthError,
  downloadMedia,
  obj,
  pkceS256,
  readBody,
  redact,
  sleep as defaultSleep,
  str,
  tokenSetFrom,
  type Fetch,
  type MediaItem,
  type PublishInput,
  type PublishOutcome,
  type TokenSet,
} from "@/lib/networks/common";

export const X_SCOPES = ["tweet.read", "tweet.write", "users.read", "offline.access", "media.write"];
const API = "https://api.x.com";

export function xConfig() {
  return {
    clientId: process.env.X_CLIENT_ID ?? "",
    clientSecret: process.env.X_CLIENT_SECRET ?? "",
    redirectUri: `${BRAND.url}/api/x/callback`,
  };
}

export function isXConfigured(): boolean {
  const c = xConfig();
  return c.clientId !== "" && c.clientSecret !== "";
}

export function xAuthorizeUrl(state: string, verifier: string): string {
  const c = xConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: c.clientId,
    redirect_uri: c.redirectUri,
    scope: X_SCOPES.join(" "),
    state,
    code_challenge: pkceS256(verifier),
    code_challenge_method: "S256",
  });
  return `https://x.com/i/oauth2/authorize?${params.toString()}`;
}

async function tokenRequest(body: Record<string, string>, fetchImpl: Fetch): Promise<TokenSet> {
  const c = xConfig();
  let res: Response;
  try {
    res = await fetchImpl(`${API}/2/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${encodeURIComponent(c.clientId)}:${encodeURIComponent(c.clientSecret)}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ client_id: c.clientId, ...body }).toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    throw new NetworkAuthError("exchange_failed", `X token request failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  const json = obj(await readBody(res));
  if (!res.ok) {
    throw new NetworkAuthError(
      "exchange_failed",
      redact(`X token request failed (${res.status}) ${str(json.error)} ${str(json.error_description)}`, c.clientSecret, body.code, body.refresh_token, body.code_verifier),
      str(json.error) === "invalid_request" || str(json.error) === "invalid_grant",
    );
  }
  return tokenSetFrom(json, "X");
}

export function exchangeXCode(code: string, verifier: string, fetchImpl: Fetch = fetch): Promise<TokenSet> {
  return tokenRequest({ grant_type: "authorization_code", code, redirect_uri: xConfig().redirectUri, code_verifier: verifier }, fetchImpl);
}

/** Access tokens last 2 hours; each refresh returns a new refresh token (the old one stops working). */
export function refreshXToken(refreshToken: string, fetchImpl: Fetch = fetch): Promise<TokenSet> {
  return tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken }, fetchImpl);
}

export type XProfile = { id: string; username: string; name: string; avatar: string | null };

export async function fetchXProfile(token: string, fetchImpl: Fetch = fetch): Promise<XProfile> {
  const res = await fetchImpl(`${API}/2/users/me?user.fields=profile_image_url`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const json = obj(await readBody(res));
  const data = obj(json.data);
  if (!res.ok || !str(data.id)) throw new NetworkAuthError("profile_failed", `X profile request failed (${res.status})`);
  return { id: str(data.id), username: str(data.username), name: str(data.name), avatar: str(data.profile_image_url) || null };
}

function xError(status: number, json: Record<string, unknown>): string {
  const detail = str(json.detail) || str(json.title) || str(obj(Array.isArray(json.errors) ? json.errors[0] : {}).message);
  if (status === 402 || /client-not-enrolled|CreditsDepleted|credits/i.test(`${str(json.type)} ${detail}`)) {
    return "X refused the request: the Poskoo X developer app has no API access or credits left on its plan. (The owner must add credits / upgrade the X API plan.)";
  }
  if (status === 429) return "X rate limit reached for this app or account. Retry later.";
  if (status === 403 && /duplicate/i.test(detail)) return "X rejected a duplicate post (the same text was posted recently).";
  return `X error (HTTP ${status})${detail ? `: ${detail}` : ""}`;
}

async function call(
  path: string,
  token: string,
  init: { method?: string; json?: unknown; form?: FormData },
  fetchImpl: Fetch,
): Promise<{ ok: true; json: Record<string, unknown> } | { ok: false; status: number; error: string }> {
  let res: Response;
  try {
    res = await fetchImpl(`${API}${path}`, {
      method: init.method ?? "GET",
      headers: { Authorization: `Bearer ${token}`, ...(init.json !== undefined ? { "Content-Type": "application/json" } : {}) },
      body: init.form ?? (init.json !== undefined ? JSON.stringify(init.json) : undefined),
      cache: "no-store",
      signal: AbortSignal.timeout(5 * 60_000),
    });
  } catch (err) {
    return { ok: false, status: 0, error: `Could not reach X: ${err instanceof Error ? err.message : String(err)}` };
  }
  const json = obj(await readBody(res));
  if (!res.ok) return { ok: false, status: res.status, error: redact(xError(res.status, json), token) };
  return { ok: true, json };
}

const SEGMENT = 4 * 1024 * 1024;

/** Chunked v2 upload of one image or video; waits for processing. Returns the media id. */
export async function uploadXMedia(
  token: string,
  item: MediaItem,
  fetchImpl: Fetch = fetch,
  sleep: (ms: number) => Promise<void> = defaultSleep,
): Promise<{ ok: true; id: string } | { ok: false; error: string; tokenDead?: boolean }> {
  const file = await downloadMedia(item.url, fetchImpl, item.type === "video" ? 512 * 1024 * 1024 : 5 * 1024 * 1024);
  if (!file.ok) return file;
  const mediaType = item.type === "video" ? (file.contentType.startsWith("video/") ? file.contentType : "video/mp4") : file.contentType.startsWith("image/") ? file.contentType : "image/jpeg";
  const init = await call(
    "/2/media/upload/initialize",
    token,
    { method: "POST", json: { media_type: mediaType, total_bytes: file.bytes.length, media_category: item.type === "video" ? "tweet_video" : "tweet_image" } },
    fetchImpl,
  );
  if (!init.ok) return { ok: false, error: init.error, tokenDead: init.status === 401 };
  const id = str(obj(init.json.data).id);
  if (!id) return { ok: false, error: "X returned no media id" };
  for (let i = 0, off = 0; off < file.bytes.length; i += 1, off += SEGMENT) {
    const form = new FormData();
    form.append("segment_index", String(i));
    form.append("media", new Blob([new Uint8Array(file.bytes.subarray(off, off + SEGMENT))], { type: "application/octet-stream" }), "chunk");
    const ap = await call(`/2/media/upload/${encodeURIComponent(id)}/append`, token, { method: "POST", form }, fetchImpl);
    if (!ap.ok) return { ok: false, error: ap.error, tokenDead: ap.status === 401 };
  }
  const fin = await call(`/2/media/upload/${encodeURIComponent(id)}/finalize`, token, { method: "POST" }, fetchImpl);
  if (!fin.ok) return { ok: false, error: fin.error, tokenDead: fin.status === 401 };
  let info = obj(obj(fin.json.data).processing_info);
  for (let i = 0; i < 60 && str(info.state) !== "" && str(info.state) !== "succeeded"; i += 1) {
    if (str(info.state) === "failed") return { ok: false, error: `X could not process the media${str(obj(info.error).message) ? `: ${str(obj(info.error).message)}` : ""}` };
    await sleep(Math.min(Math.max(Number(info.check_after_secs ?? 2), 1), 30) * 1000);
    const st = await call(`/2/media/upload?command=STATUS&media_id=${encodeURIComponent(id)}`, token, {}, fetchImpl);
    if (!st.ok) return { ok: false, error: st.error, tokenDead: st.status === 401 };
    info = obj(obj(st.json.data).processing_info);
  }
  if (str(info.state) !== "" && str(info.state) !== "succeeded") return { ok: false, error: "X is still processing the video; retry in a few minutes." };
  return { ok: true, id };
}

/** Text + up to 4 images or 1 video. */
export async function publishToX(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const sleep = input.sleep ?? defaultSleep;
  const token = input.account.accessToken;
  const videos = input.media.filter((m) => m.type === "video");
  if (videos.length > 1 || (videos.length === 1 && input.media.length > 1)) return { ok: false, error: "X takes one video, or up to 4 images." };
  if (input.media.length > 4) return { ok: false, error: "X takes up to 4 images per post." };
  const ids: string[] = [];
  for (const m of input.media) {
    const up = await uploadXMedia(token, m, fetchImpl, sleep);
    if (!up.ok) return up;
    ids.push(up.id);
  }
  const r = await call("/2/tweets", token, { method: "POST", json: { text: input.text.trim(), ...(ids.length ? { media: { media_ids: ids } } : {}) } }, fetchImpl);
  if (!r.ok) return { ok: false, error: r.error, tokenDead: r.status === 401 };
  const id = str(obj(r.json.data).id);
  if (!id) return { ok: false, error: "X returned no post id" };
  const handle = input.account.username;
  return { ok: true, id, url: handle ? `https://x.com/${handle}/status/${id}` : `https://x.com/i/web/status/${id}` };
}
