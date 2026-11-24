// Server only: publishes due scheduled posts through the official Instagram, Facebook Page and YouTube APIs.
import { decryptToken } from "@/lib/crypto";
import { getPool } from "@/lib/db";
import { shouldPostFirstComment } from "@/lib/firstComment";
import { graphBaseFor } from "@/lib/graphHost";
import { canPublishToFacebook, publishToFacebookPage } from "@/lib/facebookPublish";
import { RECONNECT_MESSAGE, publishToThreads } from "@/lib/threadsPublish";
import { YouTubeAuthError, refreshYouTubeToken } from "@/lib/youtubeAuth";
import { isNetworkId } from "@/lib/networks/common";
import { publishNetworkTargets, type ClaimedNetworkRow } from "@/lib/networks/publish";
import { expireReminders } from "@/lib/networks/reminderSend";
import { releasePostMedia, releasePublishedMediaSweep } from "@/lib/mediaLifecycle";
import { classifyPublishError, type PublishErrorKind } from "@/lib/publishErrors";
import { gaveUpNote, nextRetryDelayMs } from "@/lib/publishRetry";

const PUBLISH_TIMEOUT_MS = 20_000;
const YT_VIDEO_FETCH_TIMEOUT_MS = 5 * 60_000;
const YT_UPLOAD_TIMEOUT_MS = 10 * 60_000;

type ClaimedRow = {
  id: string;
  post_id: string;
  caption_override: string | null;
  caption: string;
  media: unknown;
  user_id: string;
  ig_format: string;
  first_comment: string | null;
  yt_metadata: unknown;
  net_options?: unknown;
  /** The exact account picked in the composer (null on rows saved before multi-account). */
  social_account_id?: string | null;
  youtube_channel_id?: string | null;
  /** true = the user picked an account; a null id then means that account was removed. */
  account_locked?: boolean | null;
  attempt_count?: number | null;
};

type AccountRow = {
  id: string;
  external_id: string;
  access_token_enc: string | null;
  auth_type?: string | null;
};

export type PublishResult = { published: number; failed: number; skipped: number; recovered: number; /** Reminder e-mails sent (Instagram personal, Facebook Groups). */ reminded?: number };

/** A claim older than this is treated as an interrupted run (worst real publish is ~10 min: video polling / 10-slide carousel). */
export const STUCK_PUBLISHING_MS = 20 * 60 * 1000;
export const STUCK_PUBLISHING_ERROR =
  "Publishing was interrupted before Instagram confirmed this post. Check your Instagram profile first: if the post is not there, press Retry.";

function cleanError(message: string, token: string): string {
  const safe = token ? message.split(token).join("[redacted]") : message;
  return safe.slice(0, 500);
}

function metaMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null) {
    const err = (body as { error?: unknown }).error;
    if (typeof err === "object" && err !== null) {
      const msg = (err as { message?: unknown }).message;
      if (typeof msg === "string") return msg;
    }
  }
  return fallback;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function firstMedia(
  media: unknown,
): { type: "image" | "video"; url: string } | null {
  if (!Array.isArray(media)) return null;
  for (const item of media) {
    if (typeof item === "object" && item !== null) {
      const row = item as { type?: unknown; url?: unknown };
      if (
        (row.type === "image" || row.type === "video") &&
        typeof row.url === "string"
      ) {
        return {
          type: row.type,
          url: row.url,
        };
      }
    }
  }
  return null;
}

function allImages(media: unknown): string[] {
  if (!Array.isArray(media)) return [];
  const urls: string[] = [];
  for (const item of media) {
    if (typeof item === "object" && item !== null) {
      const row = item as { type?: unknown; url?: unknown };
      if (row.type === "image" && typeof row.url === "string") {
        urls.push(row.url);
      }
    }
  }
  return urls;
}

async function postForId(
  base: string,
  path: string,
  token: string,
  body: Record<string, unknown>,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const mediaRes = await fetch(`${base}/${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(PUBLISH_TIMEOUT_MS),
    });
    const mediaText = await mediaRes.text().catch(() => "");
    let mediaBody: unknown = mediaText;
    try {
      mediaBody = JSON.parse(mediaText);
    } catch {
      // keep raw text
    }
    if (!mediaRes.ok) {
      return {
        ok: false,
        error: cleanError(`HTTP ${mediaRes.status}: ${metaMessage(mediaBody, mediaText)}`, token),
      };
    }
    const id =
      typeof mediaBody === "object" && mediaBody !== null
        ? (mediaBody as { id?: unknown }).id
        : undefined;
    if (typeof id !== "string" || !id) {
      return { ok: false, error: cleanError("Instagram media create returned no id", token) };
    }
    return { ok: true, id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: cleanError(`network: ${message}`, token) };
  }
}

async function publishCreationId(
  base: string,
  igUserId: string,
  token: string,
  creationId: string,
): Promise<{ ok: true; externalPostId: string } | { ok: false; error: string }> {
  const publishRes = await fetch(
    `${base}/${encodeURIComponent(igUserId)}/media_publish`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ creation_id: creationId }),
      signal: AbortSignal.timeout(PUBLISH_TIMEOUT_MS),
    },
  );
  const publishText = await publishRes.text().catch(() => "");
  let publishBody: unknown = publishText;
  try {
    publishBody = JSON.parse(publishText);
  } catch {
    // keep raw text
  }
  if (!publishRes.ok) {
    return {
      ok: false,
      error: cleanError(
        `HTTP ${publishRes.status}: ${metaMessage(publishBody, publishText)}`,
        token,
      ),
    };
  }
  const externalPostId =
    typeof publishBody === "object" && publishBody !== null
      ? (publishBody as { id?: unknown }).id
      : undefined;
  if (typeof externalPostId !== "string" || !externalPostId) {
    return { ok: false, error: cleanError("Instagram publish returned no id", token) };
  }
  return { ok: true, externalPostId };
}

async function waitForVideoContainerReady(
  base: string,
  creationId: string,
  token: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const maxTries = 24;
  for (let attempt = 0; attempt < maxTries; attempt += 1) {
    const statusRes = await fetch(
      `${base}/${encodeURIComponent(creationId)}?fields=status_code`,
      {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(PUBLISH_TIMEOUT_MS),
      },
    );
    const statusText = await statusRes.text().catch(() => "");
    let statusBody: unknown = statusText;
    try {
      statusBody = JSON.parse(statusText);
    } catch {
      // keep raw text
    }
    if (!statusRes.ok) {
      return {
        ok: false,
        error: cleanError(
          `HTTP ${statusRes.status}: ${metaMessage(statusBody, statusText)}`,
          token,
        ),
      };
    }
    const statusCode =
      typeof statusBody === "object" && statusBody !== null
        ? (statusBody as { status_code?: unknown }).status_code
        : undefined;
    if (statusCode === "FINISHED") return { ok: true };
    if (statusCode === "ERROR" || statusCode === "EXPIRED") {
      return {
        ok: false,
        error: cleanError(
          `Instagram could not process the video (status ${String(statusCode)})`,
          token,
        ),
      };
    }
    if (attempt === maxTries - 1) {
      return {
        ok: false,
        error: cleanError(
          "Instagram is still processing the video, try Retry in a few minutes",
          token,
        ),
      };
    }
    await sleep(5000);
  }
  return { ok: false, error: cleanError("Instagram video processing failed", token) };
}

export type FailInfo = {
  /** Category when the caller already knows it (e.g. "no account connected" = reconnect). */
  kind?: PublishErrorKind;
  /** The network's own message, shown as "Message from the network". */
  raw?: string;
  /** Automatic retries already made (post_targets.attempt_count); enables retry for retry / rate_limit. */
  attempts?: number;
};

/**
 * Fail a target, or put it in 'retrying' when the category allows another automatic attempt
 * (src/lib/publishRetry.ts). Only a final failure e-mails the owner.
 */
export async function markTargetFailed(
  targetId: string,
  postId: string,
  error: string,
  token: string,
  info: FailInfo = {},
): Promise<"failed" | "retrying"> {
  const pool = getPool();
  const cleaned = cleanError(error, token);
  const kind: PublishErrorKind = info.kind ?? "unknown";
  const raw = info.raw !== undefined ? cleanError(info.raw, token) : null;
  const attempts = info.attempts ?? 0;
  const delay = info.attempts === undefined ? null : nextRetryDelayMs(kind, attempts);
  if (delay !== null) {
    await pool.query(
      `update socialapp.post_targets set status='retrying', error=$2, error_kind=$3, error_raw=$4,
       attempt_count=attempt_count+1, next_retry_at=now() + ($5::bigint * interval '1 millisecond'),
       published_at=null, external_post_id=null where id=$1`,
      [targetId, cleaned, kind, raw, delay],
    );
    await refreshPostStatus(postId);
    return "retrying";
  }
  await pool.query(
    `update socialapp.post_targets set status='failed', error=$2, error_kind=$3, error_raw=$4, next_retry_at=null,
     published_at=null, external_post_id=null where id=$1`,
    [targetId, cleanError(cleaned + gaveUpNote(kind, attempts), token), kind, raw],
  );
  await refreshPostStatus(postId);
  // Owner alert e-mail, at most one per post (src/lib/emailNotify.ts). Never blocks publishing.
  void import("@/lib/emailNotify").then((m) => m.inBackground("post_failed", () => m.notifyPostFailed(postId))).catch(() => undefined);
  return "failed";
}

/** Classify a network's raw error and fail / schedule a retry for the target. */
export async function failPublish(
  row: { id: string; post_id: string; attempt_count?: number | null },
  platform: string,
  rawError: string,
  token: string,
  hints: { tokenDead?: boolean; status?: number } = {},
): Promise<{ kind: PublishErrorKind; outcome: "failed" | "retrying" }> {
  const raw = cleanError(rawError, token);
  const c = classifyPublishError(platform, raw, hints);
  const outcome = await markTargetFailed(row.id, row.post_id, c.message, token, { kind: c.kind, raw: c.raw, attempts: row.attempt_count ?? 0 });
  return { kind: c.kind, outcome };
}

/** A failed target whose picked account is gone: never post to a different account instead. */
export const PICKED_ACCOUNT_GONE =
  "The account picked for this post was disconnected or removed. Reconnect it in Settings, or edit the post and pick another account.";

export async function refreshPostStatus(postId: string): Promise<void> {
  const pool = getPool();
  // A reminder target ('reminded': e-mail sent, owner still has to post it) keeps the post in
  // 'publishing' until it is marked as posted or its 7-day hold ends (src/lib/networks/reminderSend.ts).
  // A failed target only fails the post once no other target is still pending or publishing: the
  // claim only picks 'scheduled' posts, so failing the post early would strand its other networks.
  const updated = await pool.query<{ status: string }>(
    `update socialapp.scheduled_posts p set status = case
      when exists(select 1 from socialapp.post_targets where post_id=p.id and status='publishing') then p.status
      when exists(select 1 from socialapp.post_targets where post_id=p.id and status in ('pending','retrying')) then 'scheduled'
      when exists(select 1 from socialapp.post_targets where post_id=p.id and status='failed') then 'failed'
      when exists(select 1 from socialapp.post_targets where post_id=p.id and status='reminded') then 'publishing'
      else 'published'
    end, updated_at=now() where p.id=$1 returning p.status`,
    [postId],
  );
  // Every target published: delete the uploaded files now (posters stay). Never throws.
  if (updated.rows[0]?.status === "published") await releasePostMedia(postId);
}

/**
 * Content publishing: POST {ig-user-id}/media (container), wait for video containers, then
 * POST {ig-user-id}/media_publish. `base` is graph.facebook.com for Facebook-login accounts
 * (Page token) and graph.instagram.com for older Instagram-login accounts.
 */
export async function publishToInstagram(
  base: string,
  igUserId: string,
  token: string,
  mediaRaw: unknown,
  caption: string,
  format: "feed" | "story" = "feed",
): Promise<{ ok: true; externalPostId: string } | { ok: false; error: string }> {
  const igPath = `${encodeURIComponent(igUserId)}/media`;

  if (format === "story") {
    const media = firstMedia(mediaRaw);
    if (!media) {
      return { ok: false, error: cleanError("Instagram needs an image or video", token) };
    }
    try {
      const createBody =
        media.type === "video"
          ? { media_type: "STORIES", video_url: media.url }
          : { media_type: "STORIES", image_url: media.url };

      const created = await postForId(base, igPath, token, createBody);
      if (!created.ok) {
        return created;
      }
      const creationId = created.id;

      if (media.type === "video") {
        const ready = await waitForVideoContainerReady(base, creationId, token);
        if (!ready.ok) {
          return ready;
        }
      }

      return publishCreationId(base, igUserId, token, creationId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: cleanError(`network: ${message}`, token) };
    }
  }

  const carouselImages = allImages(mediaRaw);
  if (carouselImages.length >= 2) {
    try {
      const childIds: string[] = [];
      for (const imageUrl of carouselImages) {
        const child = await postForId(base, igPath, token, {
          image_url: imageUrl,
          is_carousel_item: true,
        });
        if (!child.ok) {
          return {
            ok: false,
            error: cleanError(`Carousel slide failed: ${child.error}`, token),
          };
        }
        childIds.push(child.id);
      }
      const carousel = await postForId(base, igPath, token, {
        media_type: "CAROUSEL",
        children: childIds.join(","),
        caption,
      });
      if (!carousel.ok) {
        return carousel;
      }
      return publishCreationId(base, igUserId, token, carousel.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { ok: false, error: cleanError(`network: ${message}`, token) };
    }
  }

  const media = firstMedia(mediaRaw);
  if (!media) {
    return { ok: false, error: cleanError("Instagram needs an image or video", token) };
  }

  try {
    const createBody =
      media.type === "video"
        ? { media_type: "REELS", video_url: media.url, caption }
        : { image_url: media.url, caption };

    const created = await postForId(base, igPath, token, createBody);
    if (!created.ok) {
      return created;
    }
    const creationId = created.id;

    if (media.type === "video") {
      const ready = await waitForVideoContainerReady(base, creationId, token);
      if (!ready.ok) {
        return ready;
      }
    }

    return publishCreationId(base, igUserId, token, creationId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: cleanError(`network: ${message}`, token) };
  }
}

const YT_UPLOAD_BASE = "https://www.googleapis.com/upload/youtube/v3/videos";

export type YouTubeVideoMeta = {
  title: string;
  description: string;
  tags: string[];
  privacy: "public" | "unlisted" | "private";
  shorts: boolean;
};

export type YtUploadResult =
  | { ok: true; videoId: string; videoUrl: string }
  | { ok: false; error: string; tokenDead?: boolean };

function ytMessage(body: string, fallback: string): string {
  try {
    const json = JSON.parse(body) as { error?: { message?: unknown } };
    if (typeof json?.error?.message === "string") return json.error.message;
  } catch {
    // keep the raw text
  }
  return body !== "" ? body.slice(0, 200) : fallback;
}

// A 403 only kills the token when Google says it is an auth failure (insufficientPermissions,
// forbidden-auth, authError). Quota/rate-limit 403s (quotaExceeded, uploadLimitExceeded,
// rateLimitExceeded, …) keep the channel connected: the post stays queued and retries later.
const YT_AUTH_REASONS = new Set(["insufficientPermissions", "forbidden-auth", "authError"]);

function ytAuthReason(body: string): string {
  try {
    const json = JSON.parse(body) as { error?: { errors?: { reason?: unknown }[] } };
    const list = json?.error?.errors;
    if (Array.isArray(list)) {
      for (const item of list) {
        if (item && typeof item.reason === "string") return item.reason;
      }
    }
  } catch {
    // not JSON
  }
  return "";
}

function ytTokenDead(status: number, body: string): boolean {
  if (status === 401) return true;
  if (status === 403) return YT_AUTH_REASONS.has(ytAuthReason(body));
  return false;
}

function ytResource(meta: YouTubeVideoMeta): Record<string, unknown> {
  const description =
    meta.shorts && !/#short\b/i.test(meta.description)
      ? `${meta.description}\n\n#Short`.trim()
      : meta.description;
  return {
    snippet: {
      title: meta.title.slice(0, 100),
      description,
      ...(meta.tags.length > 0 ? { tags: meta.tags.slice(0, 30) } : {}),
      categoryId: "22",
    },
    status: {
      privacyStatus: meta.privacy,
      selfDeclaredMadeForKids: false,
    },
  };
}

/** videos.insert with uploadType=resumable -> the Location header is the upload session URL. */
async function startYtResumableSession(
  accessToken: string,
  resource: Record<string, unknown>,
): Promise<{ ok: true; sessionUrl: string } | { ok: false; error: string; tokenDead?: boolean }> {
  try {
    const res = await fetch(`${YT_UPLOAD_BASE}?part=snippet,status&uploadType=resumable`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify(resource),
      signal: AbortSignal.timeout(PUBLISH_TIMEOUT_MS),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const tokenDead = ytTokenDead(res.status, text);
      return {
        ok: false,
        error: cleanError(`YouTube session start HTTP ${res.status}: ${ytMessage(text, "no message")}`, accessToken),
        tokenDead,
      };
    }
    const location = res.headers.get("location");
    if (!location) {
      return { ok: false, error: cleanError("YouTube session start returned no session URL", accessToken) };
    }
    return { ok: true, sessionUrl: location };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: cleanError(`network: ${message}`, accessToken) };
  }
}

/** PUT the bytes to a session URL. 404/410/400 = the session expired or was rejected (sessionDead). */
async function putYtSession(
  sessionUrl: string,
  accessToken: string,
  bytes: Buffer,
): Promise<{ ok: true; videoId: string } | { ok: false; error: string; sessionDead?: boolean; tokenDead?: boolean }> {
  try {
    const res = await fetch(sessionUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "video/mp4",
        "Content-Length": String(bytes.length),
      },
      body: new Uint8Array(bytes),
      signal: AbortSignal.timeout(YT_UPLOAD_TIMEOUT_MS),
    });
    if (res.ok) {
      const json = (await res.json().catch(() => null)) as { id?: unknown } | null;
      if (json && typeof json.id === "string" && json.id !== "") {
        return { ok: true, videoId: json.id };
      }
      return { ok: false, error: "YouTube upload finished but returned no video id", sessionDead: true };
    }
    const text = await res.text().catch(() => "");
    const sessionDead = res.status === 400 || res.status === 404 || res.status === 410;
    const tokenDead = ytTokenDead(res.status, text);
    return {
      ok: false,
      error: cleanError(`YouTube upload HTTP ${res.status}: ${ytMessage(text, "no message")}`, accessToken),
      sessionDead,
      tokenDead,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: cleanError(`network: ${message}`, accessToken), sessionDead: true };
  }
}

/**
 * Uploads a video to YouTube via resumable upload (videos.insert, uploadType=resumable).
 * An expired or rejected session (404/410/400, or a dropped connection) is DISCARDED and a
 * fresh session is created on the next attempt — a dead session URL is never reused. Two
 * attempts max, and the target is only marked published after the video id is recorded, so
 * a video is never double-uploaded within one run.
 */
export async function publishToYouTube(opts: {
  channelId: string;
  refreshToken: string;
  videoUrl: string;
  meta: YouTubeVideoMeta;
}): Promise<YtUploadResult> {
  let accessToken: string;
  try {
    accessToken = await refreshYouTubeToken(opts.refreshToken);
  } catch (err) {
    // Only Google's invalid_grant means the refresh token is dead. A timeout, 5xx or rate limit
    // must not disconnect the channel (that wipes the stored refresh token for good).
    if (err instanceof YouTubeAuthError && err.tokenDead) {
      return { ok: false, error: "YouTube access expired. Reconnect YouTube in Settings, then retry.", tokenDead: true };
    }
    return { ok: false, error: "Could not reach YouTube to refresh access. Press Retry in a few minutes." };
  }

  let bytes: Buffer;
  try {
    // The timeout covers the connection/headers only; reading the body is unbounded so large
    // videos can download at any speed (a whole-fetch timeout would kill big uploads).
    const connect = new AbortController();
    const connectTimer = setTimeout(() => connect.abort(), YT_VIDEO_FETCH_TIMEOUT_MS);
    let videoRes: Response;
    try {
      videoRes = await fetch(opts.videoUrl, { signal: connect.signal });
    } finally {
      clearTimeout(connectTimer);
    }
    if (!videoRes.ok) {
      return { ok: false, error: `Could not download the video (HTTP ${videoRes.status})` };
    }
    bytes = Buffer.from(await videoRes.arrayBuffer());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: `Could not download the video: ${message}` };
  }
  if (bytes.length === 0) {
    return { ok: false, error: "The video file is empty" };
  }

  const resource = ytResource(opts.meta);
  let lastError: string | undefined;
  let tokenDead = false;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const session = await startYtResumableSession(accessToken, resource);
    if (!session.ok) {
      if (session.tokenDead) tokenDead = true;
      lastError = session.error;
      continue; // no session was created; the next attempt starts a new one
    }
    const put = await putYtSession(session.sessionUrl, accessToken, bytes);
    if (put.ok) {
      return { ok: true, videoId: put.videoId, videoUrl: `https://www.youtube.com/watch?v=${put.videoId}` };
    }
    lastError = put.error;
    if (put.tokenDead) tokenDead = true;
    // sessionDead (or network drop): this session URL is dead — the next loop iteration
    // creates a brand-new session instead of reusing it.
  }
  return { ok: false, error: lastError ?? "YouTube upload failed", tokenDead };
}

/** The per-target yt_metadata jsonb column (title, tags, privacy, shorts hint). */
export function parseYtMetadata(raw: unknown): YouTubeVideoMeta {
  const meta: YouTubeVideoMeta = { title: "", description: "", tags: [], privacy: "public", shorts: false };
  if (typeof raw === "string") {
    try {
      return parseYtMetadata(JSON.parse(raw));
    } catch {
      return meta;
    }
  }
  if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    if (typeof obj.title === "string") meta.title = obj.title.slice(0, 100);
    if (typeof obj.description === "string") meta.description = obj.description;
    if (Array.isArray(obj.tags)) {
      meta.tags = obj.tags.filter((t): t is string => typeof t === "string").slice(0, 30);
    }
    if (obj.privacy === "public" || obj.privacy === "unlisted" || obj.privacy === "private") {
      meta.privacy = obj.privacy;
    }
    if (obj.shorts === true) meta.shorts = true;
  }
  return meta;
}

/**
 * Recovers targets left in 'publishing' by a run that crashed or timed out (bug a).
 * We cannot know whether Instagram received the post, so we never auto-repost: the
 * target is failed with a clear reason and the owner decides to Retry.
 */
export async function recoverStuckPublishing(staleMs = STUCK_PUBLISHING_MS): Promise<number> {
  const pool = getPool();
  const res = await pool.query<{ post_id: string }>(
    `update socialapp.post_targets t set status='failed', error=$1, published_at=null
     from socialapp.scheduled_posts p
     where t.post_id=p.id and t.status='publishing'
       and ((p.status='publishing' and p.updated_at < now() - ($2::int * interval '1 millisecond'))
         or (p.status='scheduled' and p.scheduled_at < now() - ($2::int * interval '1 millisecond')))
     returning t.post_id`,
    [STUCK_PUBLISHING_ERROR, staleMs],
  );
  const postIds = [...new Set(res.rows.map((r) => r.post_id))];
  for (const postId of postIds) {
    console.error("publisher: recovered interrupted publish, post", postId);
    await refreshPostStatus(postId);
  }
  return res.rows.length;
}

/** The user picked an exact account for this target, and that account no longer exists. */
function pickedAccountGone(row: ClaimedRow): boolean {
  return row.account_locked === true && !row.social_account_id && !row.youtube_channel_id;
}

async function markSocialAccountExpired(accountId: string): Promise<void> {
  await getPool()
    .query("update socialapp.social_accounts set status='expired', updated_at=now() where id=$1 and status='active'", [accountId])
    .catch(() => undefined);
}

/** A target the worker may publish now: new, or an automatic retry whose time has come. */
export const CLAIMABLE_TARGET = "(t.status='pending' or (t.status='retrying' and t.next_retry_at <= now()))";

/**
 * Claims due posts in one transaction: the post row becomes 'publishing' together with its
 * Instagram targets, so delete / reschedule (which only touch draft/scheduled/failed rows)
 * can never race the publisher (bugs b, c). SKIP LOCKED keeps overlapping runs apart.
 */
async function claimDueTargets(
  limit: number,
  platform: string,
): Promise<ClaimedRow[]> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const due = await client.query<{ id: string }>(
      `select p.id from socialapp.scheduled_posts p
       where p.status='scheduled' and p.scheduled_at <= now()
         and exists (select 1 from socialapp.post_targets t
           where t.post_id=p.id and t.platform=$2 and ${CLAIMABLE_TARGET})
       order by p.scheduled_at
       limit $1
       for update of p skip locked`,
      [limit, platform],
    );
    const ids = due.rows.map((r) => r.id);
    if (ids.length === 0) {
      await client.query("commit");
      return [];
    }
    await client.query(
      "update socialapp.scheduled_posts set status='publishing', updated_at=now() where id = any($1::uuid[]) and status='scheduled'",
      [ids],
    );
    const claimed = await client.query<ClaimedRow>(
      `update socialapp.post_targets t set status='publishing'
       from socialapp.scheduled_posts p
       where t.post_id=p.id and p.id = any($1::uuid[]) and t.platform=$2 and ${CLAIMABLE_TARGET}
       returning t.id, t.post_id, t.caption_override, p.caption, p.media, p.user_id, p.ig_format, p.first_comment, t.yt_metadata,
         t.social_account_id, t.youtube_channel_id, t.account_locked, t.attempt_count${isNetworkId(platform) ? ", t.net_options" : ""}`,
      [ids, platform],
    );
    await client.query("commit");
    return claimed.rows;
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Claims due posts ONE at a time (up to `limit` posts). Claiming the whole batch up front let the
 * last posts of a long run (video polling, YouTube uploads) sit claimed for over
 * STUCK_PUBLISHING_MS, so the next minute's run "recovered" them as failed while this run was
 * still about to publish them (false failure e-mail; a Retry then posted twice).
 */
async function* claimEach(limit: number, platform: string): AsyncGenerator<ClaimedRow> {
  for (let n = 0; n < limit; n += 1) {
    const rows = await claimDueTargets(1, platform);
    if (rows.length === 0) return;
    yield* rows;
  }
}

export async function publishDuePosts(limit = 20): Promise<PublishResult> {
  const result: PublishResult = { published: 0, failed: 0, skipped: 0, recovered: 0 };
  const pool = getPool();
  try {
    result.recovered = await recoverStuckPublishing();
  } catch (err) {
    console.error("publisher: stuck-claim recovery failed", err instanceof Error ? err.message : err);
  }
  for await (const row of claimEach(limit, "instagram")) {
    let token = "";
    if (pickedAccountGone(row)) {
      await markTargetFailed(row.id, row.post_id, PICKED_ACCOUNT_GONE, token, { kind: "reconnect" });
      result.failed += 1;
      continue;
    }
    const accounts = await pool.query<AccountRow>(
      `select id, external_id, access_token_enc, auth_type from socialapp.social_accounts
       where user_id=$1 and platform='instagram' and status='active' and ($2::uuid is null or id=$2)
       order by created_at limit 1`,
      [row.user_id, row.social_account_id ?? null],
    );
    const account = accounts.rows[0];
    if (!account?.access_token_enc) {
      await markTargetFailed(row.id, row.post_id, row.social_account_id ? "The Instagram account picked for this post needs reconnecting. Reconnect it in Settings, then retry." : "No connected Instagram account. Connect Instagram in Settings, then retry.", token, { kind: "reconnect" });
      result.failed += 1;
      continue;
    }

    const postMedia = firstMedia(row.media);
    if (!postMedia && allImages(row.media).length < 2) {
      await markTargetFailed(row.id, row.post_id, "Instagram needs an image or video", token, { kind: "bad_body" });
      result.failed += 1;
      continue;
    }

    try {
      token = decryptToken(account.access_token_enc);
    } catch {
      await markTargetFailed(row.id, row.post_id, "Instagram access could not be read. Reconnect Instagram in Settings, then retry.", token, { kind: "reconnect" });
      result.failed += 1;
      continue;
    }

    const caption = row.caption_override ?? row.caption;
    const igFormat = row.ig_format === "story" ? "story" : "feed";
    const base = graphBaseFor(account.auth_type);
    const outcome = await publishToInstagram(
      base,
      account.external_id,
      token,
      row.media,
      caption,
      igFormat,
    );

    if (outcome.ok) {
      await pool.query(
        `update socialapp.post_targets set status='published', external_post_id=$2,
         published_at=now(), error=null, error_kind=null, error_raw=null, next_retry_at=null, social_account_id=$3 where id=$1`,
        [row.id, outcome.externalPostId, account.id],
      );
      if (shouldPostFirstComment(igFormat, row.first_comment)) {
        try {
          const comment = await postForId(
            base,
            `${encodeURIComponent(outcome.externalPostId)}/comments`, token,
            { message: row.first_comment },
          );
          if (!comment.ok) throw new Error(comment.error);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("First comment failed:", cleanError(message, token));
          // The post is live; tell the owner the first comment didn't go out (shown on the post).
          await pool
            .query("update socialapp.post_targets set warning=$2 where id=$1", [
              row.id,
              cleanError(`The post is live, but Instagram didn't add the first comment: ${message}. Add it by hand on Instagram.`, token),
            ])
            .catch(() => undefined);
        }
      }
      // This loop only claims Instagram targets; switch on the post's attached auto-DM rule.
      try {
        await pool.query(
          `update socialapp.dm_rules r set status='active',
           social_account_id=coalesce(r.social_account_id,$2), updated_at=now()
           from socialapp.scheduled_posts p
           where p.id=$1 and r.id=p.dm_rule_id and r.user_id=p.user_id`,
          [row.post_id, account.id],
        );
      } catch {
        // Never fail a published post because the rule could not be switched on.
      }
      await refreshPostStatus(row.post_id);
      result.published += 1;
    } else {
      const failed = await failPublish(row, "instagram", outcome.error, token);
      // Expired or revoked token: flag the account so Settings shows a clear Reconnect prompt.
      if (failed.kind === "refresh_token" || failed.kind === "reconnect") await markSocialAccountExpired(account.id);
      result.failed += 1;
    }
  }

  for await (const row of claimEach(limit, "facebook")) {
    let token = "";
    if (pickedAccountGone(row)) {
      await markTargetFailed(row.id, row.post_id, PICKED_ACCOUNT_GONE, token, { kind: "reconnect" });
      result.failed += 1;
      continue;
    }
    const accounts = await pool.query<{
      id: string;
      page_id: string;
      scopes: string[] | null;
      access_token_enc: string | null;
      auth_type: string | null;
    }>(
      `select id, page_id, scopes, access_token_enc, auth_type from socialapp.social_accounts
       where user_id=$1 and platform='instagram' and auth_type='facebook_login' and status='active' and page_id is not null
         and ($2::uuid is null or id=$2)
       order by created_at limit 1`,
      [row.user_id, row.social_account_id ?? null],
    );
    const account = accounts.rows[0];
    if (!account?.access_token_enc) {
      await markTargetFailed(
        row.id,
        row.post_id,
        row.social_account_id
          ? "The Facebook Page picked for this post needs reconnecting. Reconnect it in Settings, then retry."
          : "No Facebook Page connected. Connect Instagram with Facebook login in Settings, then retry.",
        token,
        { kind: "reconnect" },
      );
      result.failed += 1;
      continue;
    }

    if (!canPublishToFacebook(account.scopes, account.auth_type)) {
      await markTargetFailed(
        row.id,
        row.post_id,
        'Posting to your Facebook Page needs the "Manage Page posts" permission. Reconnect in Settings and allow it, then retry.',
        token,
        { kind: "reconnect" },
      );
      result.failed += 1;
      continue;
    }

    try {
      token = decryptToken(account.access_token_enc);
    } catch {
      await markTargetFailed(
        row.id,
        row.post_id,
        "Facebook Page access could not be read. Reconnect in Settings, then retry.",
        token,
        { kind: "reconnect" },
      );
      result.failed += 1;
      continue;
    }

    const outcome = await publishToFacebookPage(
      account.page_id,
      token,
      row.caption_override ?? row.caption,
      row.media,
    );

    if (outcome.ok) {
      await pool.query(
        `update socialapp.post_targets set status='published', external_post_id=$2,
         published_at=now(), error=null, error_kind=null, error_raw=null, next_retry_at=null, social_account_id=$3 where id=$1`,
        [row.id, outcome.postId, account.id],
      );
      await refreshPostStatus(row.post_id);
      result.published += 1;
    } else {
      const failed = await failPublish(row, "facebook", outcome.error, token, { tokenDead: outcome.tokenDead });
      // Expired or revoked Page token: flag the account so Settings shows a clear Reconnect prompt.
      if (failed.kind === "refresh_token" || failed.kind === "reconnect") await markSocialAccountExpired(account.id);
      result.failed += 1;
    }
  }

  for await (const row of claimEach(limit, "threads")) {
    let token = "";
    let counted = false;
    try {
      if (pickedAccountGone(row)) {
        await markTargetFailed(row.id, row.post_id, PICKED_ACCOUNT_GONE, token, { kind: "reconnect" });
        result.failed += 1;
        counted = true;
        continue;
      }
      const accounts = await pool.query<AccountRow>(
        `select id, external_id, access_token_enc from socialapp.social_accounts
         where user_id=$1 and platform='threads' and status='active' and ($2::uuid is null or id=$2)
         order by created_at limit 1`,
        [row.user_id, row.social_account_id ?? null],
      );
      const account = accounts.rows[0];
      if (!account?.access_token_enc) {
        await markTargetFailed(
          row.id,
          row.post_id,
          row.social_account_id
            ? "The Threads account picked for this post needs reconnecting. Reconnect it in Settings, then retry."
            : "No Threads account connected. Connect Threads in Settings, then retry.",
          token,
          { kind: "reconnect" },
        );
        result.failed += 1;
        counted = true;
        continue;
      }

      try {
        token = decryptToken(account.access_token_enc);
      } catch {
        await markTargetFailed(
          row.id,
          row.post_id,
          "Threads access could not be read. Reconnect Threads in Settings, then retry.",
          token,
          { kind: "reconnect" },
        );
        result.failed += 1;
        counted = true;
        continue;
      }

      const media = firstMedia(row.media);
      const outcome = await publishToThreads({
        threadsUserId: account.external_id,
        accessToken: token,
        text: row.caption_override ?? row.caption,
        imageUrl: media?.type === "image" ? media.url : undefined,
        videoUrl: media?.type === "video" ? media.url : undefined,
      });

      if (outcome.ok) {
        await pool.query(
          `update socialapp.post_targets set status='published', external_post_id=$2,
           published_at=now(), error=null, error_kind=null, error_raw=null, next_retry_at=null, social_account_id=$3 where id=$1`,
          [row.id, outcome.id, account.id],
        );
        await refreshPostStatus(row.post_id);
        result.published += 1;
      } else {
        const tokenDead = outcome.error === RECONNECT_MESSAGE;
        // Threads flags HTTP 429 / 5xx as retryable; "Could not reach Threads" (no response) stays ambiguous.
        const status = outcome.retryable && !outcome.error.startsWith("Could not reach") ? 503 : undefined;
        const failed = await failPublish(row, "threads", outcome.error, token, { tokenDead, status });
        counted = true;
        // Expired or revoked Threads token: flag the account so Settings shows a clear Reconnect prompt.
        if (failed.kind === "refresh_token" || failed.kind === "reconnect") await markSocialAccountExpired(account.id);
        result.failed += 1;
      }
    } catch (err) {
      if (!counted) {
        const message = err instanceof Error ? err.message : String(err);
        await markTargetFailed(row.id, row.post_id, `Threads publishing failed: ${message}`, token).catch(
          () => undefined,
        );
        result.failed += 1;
      }
    }
  }

  for await (const row of claimEach(limit, "youtube")) {
    let token = "";
    try {
      if (pickedAccountGone(row)) {
        await markTargetFailed(row.id, row.post_id, PICKED_ACCOUNT_GONE, token, { kind: "reconnect" });
        result.failed += 1;
        continue;
      }
      const channels = await pool.query<{
        id: string;
        channel_id: string;
        refresh_token_enc: string;
      }>(
        `select id, channel_id, refresh_token_enc from socialapp.youtube_channels
         where user_id=$1 and status='active' and ($2::uuid is null or id=$2) order by updated_at desc limit 1`,
        [row.user_id, row.youtube_channel_id ?? null],
      );
      const channel = channels.rows[0];
      if (!channel?.refresh_token_enc) {
        await markTargetFailed(
          row.id,
          row.post_id,
          row.youtube_channel_id
            ? "The YouTube channel picked for this post needs reconnecting. Reconnect it in Settings, then retry."
            : "No YouTube channel connected. Connect YouTube in Settings, then retry.",
          token,
          { kind: "reconnect" },
        );
        result.failed += 1;
        continue;
      }

      let refreshToken = "";
      try {
        refreshToken = decryptToken(channel.refresh_token_enc);
      } catch {
        await markTargetFailed(
          row.id,
          row.post_id,
          "YouTube access could not be read. Reconnect YouTube in Settings, then retry.",
          token,
          { kind: "reconnect" },
        );
        result.failed += 1;
        continue;
      }
      token = refreshToken; // so cleanError can redact it from API messages

      const media = firstMedia(row.media);
      if (!media || media.type !== "video") {
        await markTargetFailed(row.id, row.post_id, "YouTube posts need a video link (.mp4)", token, { kind: "bad_body" });
        result.failed += 1;
        continue;
      }

      const meta = parseYtMetadata(row.yt_metadata);
      if (meta.description === "") meta.description = row.caption_override ?? row.caption;
      const outcome = await publishToYouTube({
        channelId: channel.channel_id,
        refreshToken,
        videoUrl: media.url,
        meta,
      });

      if (outcome.ok) {
        // external_post_id holds the watch URL; social_account_id is a FK to social_accounts, so it stays null.
        await pool.query(
          `update socialapp.post_targets set status='published', external_post_id=$2,
           published_at=now(), error=null, error_kind=null, error_raw=null, next_retry_at=null, youtube_channel_id=$3 where id=$1`,
          [row.id, outcome.videoUrl, channel.id],
        );
        await refreshPostStatus(row.post_id);
        result.published += 1;
      } else {
        // Expired or revoked refresh token: mark the channel disconnected (and clear the dead
        // token) so Settings shows a reconnect prompt.
        if (outcome.tokenDead) {
          await pool
            .query(
              "update socialapp.youtube_channels set status='disconnected', refresh_token_enc='', updated_at=now() where id=$1 and status='active'",
              [channel.id],
            )
            .catch(() => undefined);
        }
        await failPublish(row, "youtube", outcome.error, token, { tokenDead: outcome.tokenDead });
        result.failed += 1;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      await markTargetFailed(row.id, row.post_id, `YouTube publishing failed: ${message}`, token).catch(
        () => undefined,
      );
      result.failed += 1;
    }
  }

  // TikTok, Bluesky, Mastodon, LinkedIn, Pinterest and X (src/lib/networks/publish.ts).
  const more = await publishNetworkTargets(limit, {
    claim: (n, platform) => claimDueTargets(n, platform) as Promise<ClaimedNetworkRow[]>,
    markFailed: markTargetFailed,
    refreshPostStatus,
  });
  result.published += more.published;
  result.failed += more.failed;
  if (more.reminded) result.reminded = more.reminded;

  // Reminder channels: close reminders nobody confirmed within the hold so their files can go.
  try {
    await expireReminders(refreshPostStatus);
  } catch (err) {
    console.error("publisher: reminder expiry failed", err instanceof Error ? err.message : err);
  }

  // Files of published posts whose hold ended (TikTok / Facebook / Pinterest processing) or whose release failed.
  await releasePublishedMediaSweep();

  return result;
}
