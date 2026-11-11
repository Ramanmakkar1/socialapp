// Server only: TikTok Login Kit (web, OAuth v2) + Content Posting API (Direct Post and inbox upload).
// Docs: developers.tiktok.com/doc/login-kit-web, /doc/content-posting-api-reference-direct-post,
// /doc/content-posting-api-reference-query-creator-info, /doc/content-posting-api-media-transfer-guide.
// Note: TikTok's web Login Kit does not use PKCE (PKCE is only for desktop/mobile apps, and there the
// challenge is hex-encoded); the web flow is protected by the state value in an encrypted cookie.
import { BRAND } from "@/lib/brand";
import {
  NetworkAuthError,
  downloadMedia,
  obj,
  readBody,
  redact,
  sleep as defaultSleep,
  str,
  tokenSetFrom,
  type Fetch,
  type PublishInput,
  type PublishOutcome,
  type TokenSet,
} from "@/lib/networks/common";
import { PRIVACY_VALUES, parseTikTokOptions, tiktokOptionsError, type TikTokOptions, type TikTokPrivacy } from "@/lib/networks/options";

export { parseTikTokOptions, tiktokOptionsError, tiktokConsentText, TIKTOK_PRIVACY_LABEL, type TikTokOptions, type TikTokPrivacy } from "@/lib/networks/options";

export const TIKTOK_SCOPES = ["user.info.basic", "video.publish", "video.upload"];
const AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
export const TIKTOK_API = "https://open.tiktokapis.com";

export function tiktokConfig() {
  return {
    clientKey: process.env.TIKTOK_CLIENT_KEY ?? "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? "",
    redirectUri: `${BRAND.url}/api/tiktok/callback`,
  };
}

export function isTikTokConfigured(): boolean {
  const c = tiktokConfig();
  return c.clientKey !== "" && c.clientSecret !== "";
}

export function tiktokAuthorizeUrl(state: string): string {
  const c = tiktokConfig();
  const params = new URLSearchParams({
    client_key: c.clientKey,
    response_type: "code",
    scope: TIKTOK_SCOPES.join(","),
    redirect_uri: c.redirectUri,
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

async function tokenRequest(body: Record<string, string>, fetchImpl: Fetch): Promise<{ tokens: TokenSet; openId: string; scope: string }> {
  const c = tiktokConfig();
  let res: Response;
  try {
    res = await fetchImpl(`${TIKTOK_API}/v2/oauth/token/`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "Cache-Control": "no-cache" },
      body: new URLSearchParams({ client_key: c.clientKey, client_secret: c.clientSecret, ...body }).toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    throw new NetworkAuthError("exchange_failed", `TikTok token request failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  const json = obj(await readBody(res));
  // TikTok answers 200 with { error, error_description } on OAuth errors.
  if (!res.ok || (str(json.error) !== "" && !str(json.access_token))) {
    const code = str(json.error);
    const dead = code === "invalid_grant" || code === "invalid_request";
    throw new NetworkAuthError(
      "exchange_failed",
      redact(`TikTok token request failed (${res.status})${code ? `: ${code} ${str(json.error_description)}` : ""}`, c.clientSecret, body.code, body.refresh_token),
      dead,
    );
  }
  return { tokens: tokenSetFrom(json, "TikTok"), openId: str(json.open_id), scope: str(json.scope) };
}

export function exchangeTikTokCode(code: string, fetchImpl: Fetch = fetch) {
  return tokenRequest({ code, grant_type: "authorization_code", redirect_uri: tiktokConfig().redirectUri }, fetchImpl);
}

export async function refreshTikTokToken(refreshToken: string, fetchImpl: Fetch = fetch): Promise<TokenSet> {
  return (await tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken }, fetchImpl)).tokens;
}

type ApiResult = { ok: true; data: Record<string, unknown>; raw: string } | { ok: false; status: number; code: string; message: string };

async function tiktokApi(path: string, token: string, body: unknown, fetchImpl: Fetch, method = "POST"): Promise<ApiResult> {
  let res: Response;
  try {
    res = await fetchImpl(`${TIKTOK_API}${path}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json; charset=UTF-8" },
      body: method === "GET" ? undefined : JSON.stringify(body ?? {}),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    return { ok: false, status: 0, code: "network", message: err instanceof Error ? err.message : String(err) };
  }
  const raw = await res.text().catch(() => "");
  let json: Record<string, unknown> = {};
  try {
    json = obj(JSON.parse(raw));
  } catch {
    // not JSON
  }
  const error = obj(json.error);
  const code = str(error.code) || (res.ok ? "ok" : "http_error");
  if (!res.ok || code !== "ok") {
    return { ok: false, status: res.status, code, message: redact(str(error.message), token) };
  }
  return { ok: true, data: obj(json.data), raw };
}

export type TikTokUser = { openId: string; displayName: string; avatarUrl: string | null };

export async function fetchTikTokUser(token: string, fetchImpl: Fetch = fetch): Promise<TikTokUser> {
  const r = await tiktokApi("/v2/user/info/?fields=open_id,avatar_url,display_name", token, undefined, fetchImpl, "GET");
  if (!r.ok) throw new NetworkAuthError("profile_failed", `TikTok profile request failed: ${r.code}`);
  const user = obj(r.data.user);
  return { openId: str(user.open_id), displayName: str(user.display_name), avatarUrl: str(user.avatar_url) || null };
}

export type TikTokCreatorInfo = {
  nickname: string;
  username: string;
  avatarUrl: string | null;
  privacyLevelOptions: TikTokPrivacy[];
  commentDisabled: boolean;
  duetDisabled: boolean;
  stitchDisabled: boolean;
  maxVideoPostDurationSec: number;
};

/** Creator info must be read right before posting (and shown in the composer) per TikTok's UX rules. */
export async function queryCreatorInfo(
  token: string,
  fetchImpl: Fetch = fetch,
): Promise<{ ok: true; info: TikTokCreatorInfo } | { ok: false; error: string; tokenDead?: boolean }> {
  const r = await tiktokApi("/v2/post/publish/creator_info/query/", token, {}, fetchImpl);
  if (!r.ok) return { ok: false, error: tiktokErrorMessage(r.code, r.message), tokenDead: isTokenDead(r.code) };
  const d = r.data;
  const options = Array.isArray(d.privacy_level_options)
    ? d.privacy_level_options.filter((v): v is TikTokPrivacy => PRIVACY_VALUES.includes(v as TikTokPrivacy))
    : [];
  return {
    ok: true,
    info: {
      nickname: str(d.creator_nickname),
      username: str(d.creator_username),
      avatarUrl: str(d.creator_avatar_url) || null,
      privacyLevelOptions: options,
      commentDisabled: d.comment_disabled === true,
      duetDisabled: d.duet_disabled === true,
      stitchDisabled: d.stitch_disabled === true,
      maxVideoPostDurationSec: Number(d.max_video_post_duration_sec ?? 0) || 0,
    },
  };
}

function isTokenDead(code: string): boolean {
  return code === "access_token_invalid" || code === "scope_not_authorized";
}

export const TIKTOK_UNAUDITED_MESSAGE =
  "TikTok has not audited the Poskoo app yet, so TikTok only accepts posts to PRIVATE TikTok accounts with the visibility set to “Only me”. Make your TikTok account private (or wait for the audit), choose “Only me”, then retry.";

/** Friendly text for a Content Posting API error code. */
export function tiktokErrorMessage(code: string, message: string): string {
  switch (code) {
    case "unaudited_client_can_only_post_to_private_accounts":
      return TIKTOK_UNAUDITED_MESSAGE;
    case "access_token_invalid":
      return "TikTok access expired. Reconnect TikTok in Settings, then retry.";
    case "scope_not_authorized":
      return "TikTok did not grant posting permission. Reconnect TikTok in Settings and allow posting, then retry.";
    case "spam_risk_too_many_posts":
      return "TikTok's daily posting limit for this account is reached. Try again tomorrow.";
    case "spam_risk_user_banned_from_posting":
      return "TikTok has blocked this account from posting through apps.";
    case "reached_active_user_cap":
      return "Poskoo reached TikTok's daily limit of posting users. Try again tomorrow.";
    case "privacy_level_option_mismatch":
      return "The chosen TikTok visibility is no longer available for this account. Edit the post, pick a visibility again, then retry.";
    case "url_ownership_unverified":
      return "TikTok could not fetch the media because the media domain is not verified in the TikTok developer portal.";
    case "rate_limit_exceeded":
      return "TikTok rate limit reached. Retry in a minute.";
    case "network":
      return `Could not reach TikTok: ${message}`;
    default:
      return `TikTok error (${code})${message ? `: ${message}` : ""}`;
  }
}

/** True when TikTok can pull this URL itself (it is served from our verified domain). */
export function isOwnMediaUrl(url: string, siteUrl = BRAND.url): boolean {
  return url.startsWith(`${siteUrl.replace(/\/$/, "")}/api/media/`);
}

const ONE_CHUNK_MAX = 64 * 1024 * 1024;
const CHUNK = 10 * 1024 * 1024;

/** Media Transfer Guide: up to 64 MB goes as one chunk; bigger files in 10 MB chunks, the last one takes the remainder. */
export function tiktokChunkPlan(size: number): { chunkSize: number; count: number } {
  if (size <= ONE_CHUNK_MAX) return { chunkSize: size, count: 1 };
  return { chunkSize: CHUNK, count: Math.floor(size / CHUNK) };
}

async function uploadChunks(uploadUrl: string, bytes: Buffer, contentType: string, fetchImpl: Fetch): Promise<string | null> {
  const { chunkSize, count } = tiktokChunkPlan(bytes.length);
  for (let i = 0; i < count; i += 1) {
    const start = i * chunkSize;
    const end = i === count - 1 ? bytes.length - 1 : start + chunkSize - 1;
    const part = bytes.subarray(start, end + 1);
    let res: Response;
    try {
      res = await fetchImpl(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
          "Content-Length": String(part.length),
          "Content-Range": `bytes ${start}-${end}/${bytes.length}`,
        },
        body: new Uint8Array(part),
        signal: AbortSignal.timeout(10 * 60_000),
      });
    } catch (err) {
      return `TikTok upload failed: ${err instanceof Error ? err.message : String(err)}`;
    }
    if (!(res.status === 201 || res.status === 206 || res.ok)) return `TikTok upload failed (HTTP ${res.status})`;
  }
  return null;
}

function videoMime(contentType: string, url: string): string {
  if (contentType === "video/quicktime" || url.toLowerCase().includes(".mov")) return "video/quicktime";
  if (contentType === "video/webm") return "video/webm";
  return "video/mp4";
}

const STATUS_POLLS = 30;
const STATUS_INTERVAL_MS = 10_000;

/** Poll /status/fetch until TikTok finishes. A post still processing after ~5 minutes is reported as accepted. */
export async function pollTikTokStatus(
  token: string,
  publishId: string,
  fetchImpl: Fetch,
  sleep: (ms: number) => Promise<void>,
): Promise<{ ok: true; postId: string | null; pending?: boolean } | { ok: false; error: string; tokenDead?: boolean }> {
  for (let i = 0; i < STATUS_POLLS; i += 1) {
    const r = await tiktokApi("/v2/post/publish/status/fetch/", token, { publish_id: publishId }, fetchImpl);
    if (!r.ok) {
      if (r.code === "rate_limit_exceeded" || r.code === "network" || r.status >= 500) {
        await sleep(STATUS_INTERVAL_MS);
        continue;
      }
      return { ok: false, error: tiktokErrorMessage(r.code, r.message), tokenDead: isTokenDead(r.code) };
    }
    const status = str(r.data.status);
    if (status === "PUBLISH_COMPLETE" || status === "SEND_TO_USER_INBOX") {
      // (sic) TikTok spells the field "publicaly_available_post_id". The ids are int64 numbers, too
      // big for a JS number, so they are read from the raw text.
      const first = r.raw.match(/"publicaly_available_post_id"\s*:\s*\[\s*"?(\d+)/)?.[1] ?? "";
      return { ok: true, postId: first || null };
    }
    if (status === "FAILED") {
      const reason = str(r.data.fail_reason);
      return { ok: false, error: `TikTok could not publish the post${reason ? ` (${reason})` : ""}.` };
    }
    await sleep(STATUS_INTERVAL_MS);
  }
  // Not PUBLISH_COMPLETE yet: TikTok may still be pulling our file, so the caller keeps it (media hold).
  return { ok: true, postId: null, pending: true };
}

export function buildTikTokPostInfo(opts: TikTokOptions, info: TikTokCreatorInfo, caption: string, kind: "video" | "photo"): Record<string, unknown> {
  const base: Record<string, unknown> = {
    privacy_level: opts.privacyLevel,
    disable_comment: !opts.allowComment || info.commentDisabled,
    brand_content_toggle: opts.brandedContent,
    brand_organic_toggle: opts.yourBrand,
  };
  if (kind === "video") {
    return {
      ...base,
      title: caption,
      disable_duet: !opts.allowDuet || info.duetDisabled,
      disable_stitch: !opts.allowStitch || info.stitchDisabled,
      ...(opts.isAigc ? { is_aigc: true } : {}),
    };
  }
  // Photo posts: title max 90 runes, description max 4000.
  const firstLine = caption.split(/\r?\n/)[0] ?? "";
  return { ...base, title: Array.from(firstLine).slice(0, 90).join(""), description: Array.from(caption).slice(0, 4000).join(""), auto_add_music: true };
}

/**
 * Publish one target to TikTok: creator_info first (privacy option still valid?), then a video
 * (PULL_FROM_URL from our verified media domain, otherwise FILE_UPLOAD in chunks) or a photo post
 * (PULL_FROM_URL only), then poll the publish status.
 */
export async function publishToTikTok(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const sleep = input.sleep ?? defaultSleep;
  const token = input.account.accessToken;
  const opts = parseTikTokOptions(input.options);
  const invalid = tiktokOptionsError(opts, input.media);
  if (invalid) return { ok: false, error: invalid };
  const inbox = opts.mode === "inbox";
  const caption = input.text.trim();

  const creator = await queryCreatorInfo(token, fetchImpl);
  if (!creator.ok) return creator;
  const info = creator.info;
  if (!inbox && !info.privacyLevelOptions.includes(opts.privacyLevel as TikTokPrivacy)) {
    return { ok: false, error: tiktokErrorMessage("privacy_level_option_mismatch", "") };
  }

  const video = input.media.find((m) => m.type === "video");
  let publishId = "";
  if (video) {
    const path = inbox ? "/v2/post/publish/inbox/video/init/" : "/v2/post/publish/video/init/";
    const postInfo = inbox ? undefined : buildTikTokPostInfo(opts, info, caption, "video");
    let init: ApiResult | null = null;
    if (isOwnMediaUrl(video.url)) {
      init = await tiktokApi(path, token, { ...(postInfo ? { post_info: postInfo } : {}), source_info: { source: "PULL_FROM_URL", video_url: video.url } }, fetchImpl);
      if (!init.ok && init.code !== "url_ownership_unverified") {
        return { ok: false, error: tiktokErrorMessage(init.code, init.message), tokenDead: isTokenDead(init.code) };
      }
      if (!init.ok) init = null; // domain not verified (yet): fall back to FILE_UPLOAD
    }
    if (!init) {
      const file = await downloadMedia(video.url, fetchImpl, 4 * 1024 * 1024 * 1024);
      if (!file.ok) return file;
      const plan = tiktokChunkPlan(file.bytes.length);
      const up = await tiktokApi(
        path,
        token,
        {
          ...(postInfo ? { post_info: postInfo } : {}),
          source_info: { source: "FILE_UPLOAD", video_size: file.bytes.length, chunk_size: plan.chunkSize, total_chunk_count: plan.count },
        },
        fetchImpl,
      );
      if (!up.ok) return { ok: false, error: tiktokErrorMessage(up.code, up.message), tokenDead: isTokenDead(up.code) };
      const uploadUrl = str(up.data.upload_url);
      if (!uploadUrl) return { ok: false, error: "TikTok returned no upload URL." };
      const failed = await uploadChunks(uploadUrl, file.bytes, videoMime(file.contentType, video.url), fetchImpl);
      if (failed) return { ok: false, error: failed };
      init = up;
    }
    publishId = str(init.data.publish_id);
  } else {
    const images = input.media.filter((m) => m.type === "image").map((m) => m.url);
    if (images.some((u) => !isOwnMediaUrl(u))) {
      return { ok: false, error: "TikTok photo posts need photos uploaded in Poskoo (TikTok only pulls photos from our verified domain). Upload the photos instead of linking them." };
    }
    const r = await tiktokApi(
      "/v2/post/publish/content/init/",
      token,
      {
        ...(inbox ? {} : { post_info: buildTikTokPostInfo(opts, info, caption, "photo") }),
        ...(inbox ? { post_info: { title: Array.from(caption.split(/\r?\n/)[0] ?? "").slice(0, 90).join(""), description: Array.from(caption).slice(0, 4000).join("") } } : {}),
        source_info: { source: "PULL_FROM_URL", photo_cover_index: 0, photo_images: images },
        post_mode: inbox ? "MEDIA_UPLOAD" : "DIRECT_POST",
        media_type: "PHOTO",
      },
      fetchImpl,
    );
    if (!r.ok) return { ok: false, error: tiktokErrorMessage(r.code, r.message), tokenDead: isTokenDead(r.code) };
    publishId = str(r.data.publish_id);
  }
  if (!publishId) return { ok: false, error: "TikTok returned no publish id." };

  const done = await pollTikTokStatus(token, publishId, fetchImpl, sleep);
  if (!done.ok) return done;
  const username = info.username || input.account.username || "";
  if (done.postId && username) {
    return { ok: true, id: done.postId, url: `https://www.tiktok.com/@${username}/video/${done.postId}` };
  }
  return { ok: true, id: done.postId ?? publishId, ...(done.pending ? { mediaPending: true } : {}) };
}
