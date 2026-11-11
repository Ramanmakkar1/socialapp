// Server only: what happens to an upload after it is attached to a post.
//
// - When EVERY target of a post has published (and the network confirmed it, see holds below), the
//   post's uploaded files are deleted right away. A small poster (<key>.thumb.jpg, made in the
//   browser at upload) stays so the calendar / popover / list still show the post.
// - A file is only deleted when no unpublished post (draft / scheduled / publishing / failed) and
//   no idea, automation, bio page, lead magnet or product still mentions it (reference count by key).
// - Failed or pending targets keep the files so Retry works.
// - Deleting a post / draft releases its files the same way.
// - Storage quota counts only files waiting to be posted (see pendingBytesFor).
import { getPool, query } from "@/lib/db";
import { UNATTACHED_KEEP_DAYS, checkMediaForTargets } from "@/lib/mediaLimits";
import { probeVideoDurationSec } from "@/lib/mediaProbe";
import { planForUser } from "@/lib/planLimits";
import {
  deleteMediaKeys,
  isThumbKey,
  listUserMedia,
  mediaFilePath,
  mediaKeysInText,
  signedMediaUrl,
  statMediaUpload,
  thumbKeyFor,
} from "@/lib/mediaStorage";

/** Neutral posters for published posts whose file is gone and that have no poster of their own. */
export const VIDEO_PLACEHOLDER = "/media/video-placeholder.svg";
export const IMAGE_PLACEHOLDER = "/media/image-placeholder.svg";

/**
 * Networks that fetch our file AFTER their API already answered: keep the file a while after the
 * target is marked published. Facebook /videos with file_url downloads in the background; Pinterest
 * pins fetch the image / video URL asynchronously. TikTok sets post_targets.media_hold_until itself
 * when its status poll ended before PUBLISH_COMPLETE.
 */
export const HOLD_AFTER_PUBLISH_MS: Partial<Record<string, { ms: number; videoOnly?: boolean }>> = {
  facebook: { ms: 60 * 60 * 1000, videoOnly: true },
  pinterest: { ms: 60 * 60 * 1000 },
};

export type TargetState = {
  platform: string;
  status: string;
  published_at: Date | string | null;
  media_hold_until?: Date | string | null;
  external_post_id?: string | null;
};

type MediaJsonItem = Record<string, unknown> & { type?: unknown; url?: unknown };

function ms(v: Date | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  const t = new Date(v).getTime();
  return Number.isNaN(t) ? null : t;
}

/** Latest moment any target still needs the file (null = no hold). */
export function mediaHoldUntil(targets: TargetState[], hasVideo: boolean): number | null {
  let until: number | null = null;
  for (const t of targets) {
    const explicit = ms(t.media_hold_until);
    if (explicit !== null) until = Math.max(until ?? 0, explicit);
    const rule = HOLD_AFTER_PUBLISH_MS[t.platform];
    const published = ms(t.published_at);
    if (rule && published !== null && (!rule.videoOnly || hasVideo)) until = Math.max(until ?? 0, published + rule.ms);
  }
  return until;
}

/** Pure: may the post's files be released now? All targets published and no hold left. */
export function postMediaReleasable(postStatus: string, targets: TargetState[], hasVideo: boolean, nowMs = Date.now()): boolean {
  if (postStatus !== "published" || targets.length === 0) return false;
  if (!targets.every((t) => t.status === "published")) return false;
  const hold = mediaHoldUntil(targets, hasVideo);
  return hold === null || hold <= nowMs;
}

function items(media: unknown): MediaJsonItem[] {
  return Array.isArray(media) ? media.filter((m): m is MediaJsonItem => typeof m === "object" && m !== null) : [];
}

/** Upload keys (not posters) of this user's own files in a post's media JSON. */
export function ownMediaKeys(userId: string, media: unknown): string[] {
  const out: string[] = [];
  for (const item of items(media)) {
    if (item.purged === true || typeof item.url !== "string") continue;
    for (const key of mediaKeysInText(item.url)) {
      if (!isThumbKey(key) && key.startsWith(`${userId.toLowerCase()}/`)) out.push(key);
    }
  }
  return [...new Set(out)];
}

/** Pure: the keys nothing else mentions any more. */
export function keysToDelete(candidates: string[], keepTexts: string[]): string[] {
  const keep = new Set(keepTexts.flatMap(mediaKeysInText));
  return candidates.filter((k) => !keep.has(k.toLowerCase()));
}

/**
 * Pure: the post's media JSON after its files are released. Each own item keeps its type and gets
 * `purged: true` plus `thumb` (our poster, the platform's thumbnail, or a neutral placeholder).
 */
export function releasedMediaJson(
  userId: string,
  media: unknown,
  posterFor: (key: string) => string | null,
  platformThumb: string | null = null,
): unknown[] {
  if (!Array.isArray(media)) return [];
  return media.map((raw) => {
    if (typeof raw !== "object" || raw === null) return raw;
    const item = raw as MediaJsonItem;
    if (item.purged === true || typeof item.url !== "string") return item;
    const key = ownMediaKeys(userId, [item])[0];
    if (!key) return item;
    const isVideo = item.type === "video";
    const thumb = posterFor(key) ?? (isVideo ? platformThumb : null) ?? (isVideo ? VIDEO_PLACEHOLDER : IMAGE_PLACEHOLDER);
    return { ...item, thumb, purged: true };
  });
}

/**
 * Pure: bytes that count toward the "waiting to be posted" quota.
 * An upload counts while an unpublished post mentions it, or when no post mentions it and it is
 * younger than UNATTACHED_KEEP_DAYS. A poster counts with its upload.
 */
export function pendingBytesFor(
  files: { key: string; size: number; mtimeMs: number }[],
  posts: { status: string; mediaText: string }[],
  nowMs = Date.now(),
): number {
  const unpublished = new Set<string>();
  const anyPost = new Set<string>();
  for (const p of posts) {
    for (const k of mediaKeysInText(p.mediaText)) {
      anyPost.add(k);
      if (p.status !== "published") unpublished.add(k);
    }
  }
  const cutoff = nowMs - UNATTACHED_KEEP_DAYS * 86_400_000;
  const counted = new Set<string>();
  for (const f of files) {
    const k = f.key.toLowerCase();
    if (isThumbKey(k)) continue;
    if (unpublished.has(k) || (!anyPost.has(k) && f.mtimeMs >= cutoff)) counted.add(k);
  }
  let total = 0;
  for (const f of files) {
    const k = f.key.toLowerCase();
    if (counted.has(k)) total += f.size;
    else if (isThumbKey(k) && [...counted].some((c) => thumbKeyFor(c) === k)) total += f.size;
  }
  return total;
}

// ---- Database side --------------------------------------------------------------------------

/** Every non-post row of a user that can hold an uploaded media URL (read as JSON text). */
const OTHER_REFERENCE_SQL = [
  "select to_jsonb(x)::text as t from socialapp.ideas x where user_id=$1",
  "select to_jsonb(x)::text as t from socialapp.dm_rules x where user_id=$1",
  "select to_jsonb(x)::text as t from socialapp.bio_pages x where user_id=$1",
  "select to_jsonb(x)::text as t from socialapp.lead_magnets x where user_id=$1",
  "select to_jsonb(x)::text as t from socialapp.products x where user_id=$1",
];

/** All rows that mention a user's uploads (posts + others). Used by the daily unused-file cleanup. */
export async function mediaReferenceTexts(userId: string): Promise<string[]> {
  const out: string[] = [];
  for (const sql of ["select media::text as t from socialapp.scheduled_posts where user_id=$1", ...OTHER_REFERENCE_SQL]) {
    const rows = await query<{ t: string | null }>(sql, [userId]);
    for (const r of rows) if (r.t && r.t.includes("/api/media/")) out.push(r.t);
  }
  return out;
}

/**
 * Texts whose files must stay: unpublished posts (any status but published), published posts
 * whose own release is still waiting on a hold, and every non-post row.
 */
async function keepTexts(userId: string, excludePostId: string | null): Promise<string[]> {
  const out: string[] = [];
  const posts = await query<{ t: string | null }>(
    `select media::text as t from socialapp.scheduled_posts p
     where p.user_id=$1 and ($2::uuid is null or p.id <> $2::uuid)
       and (p.status <> 'published'
         or (p.media_released_at is null and exists (
           select 1 from socialapp.post_targets t where t.post_id=p.id and t.media_hold_until > now())))`,
    [userId, excludePostId],
  );
  for (const r of posts) if (r.t && r.t.includes("/api/media/")) out.push(r.t);
  for (const sql of OTHER_REFERENCE_SQL) {
    const rows = await query<{ t: string | null }>(sql, [userId]);
    for (const r of rows) if (r.t && r.t.includes("/api/media/")) out.push(r.t);
  }
  return out;
}

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export type ReleaseResult = { released: boolean; deleted: number; freedBytes: number };

/**
 * Release one post's files if it is fully published and nothing holds them. Safe to call many
 * times (from refreshPostStatus after every target, and from the sweep). Never throws.
 */
export async function releasePostMedia(postId: string, nowMs = Date.now()): Promise<ReleaseResult> {
  const none: ReleaseResult = { released: false, deleted: 0, freedBytes: 0 };
  try {
    const rows = await query<{ user_id: string; status: string; media: unknown; media_released_at: Date | null }>(
      "select user_id, status, media, media_released_at from socialapp.scheduled_posts where id=$1",
      [postId],
    );
    const post = rows[0];
    if (!post || post.media_released_at || post.status !== "published") return none;
    const targets = await query<TargetState>(
      "select platform, status, published_at, media_hold_until, external_post_id from socialapp.post_targets where post_id=$1",
      [postId],
    );
    const hasVideo = items(post.media).some((m) => m.type === "video");
    if (!postMediaReleasable(post.status, targets, hasVideo, nowMs)) return none;

    const userId = post.user_id;
    const keys = ownMediaKeys(userId, post.media);
    const posters = new Map<string, string | null>();
    for (const item of items(post.media)) {
      if (typeof item.url !== "string") continue;
      const key = ownMediaKeys(userId, [item])[0];
      if (!key) continue;
      const thumbKey = thumbKeyFor(key);
      const origin = originOf(item.url) ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
      posters.set(key, (await statMediaUpload(thumbKey)) && origin ? signedMediaUrl(thumbKey, origin) : null);
    }
    const yt = targets.find((t) => t.platform === "youtube" && t.status === "published" && t.external_post_id);
    const ytThumb = yt?.external_post_id && /^[\w-]{6,20}$/.test(yt.external_post_id) ? `https://i.ytimg.com/vi/${yt.external_post_id}/hqdefault.jpg` : null;
    const nextMedia = releasedMediaJson(userId, post.media, (k) => posters.get(k) ?? null, ytThumb);

    // Mark first: if the row changed meanwhile (e.g. Retry), nothing is deleted.
    const marked = await query<{ id: string }>(
      `update socialapp.scheduled_posts set media=$2::jsonb, media_released_at=now()
       where id=$1 and status='published' and media_released_at is null returning id`,
      [postId, JSON.stringify(nextMedia)],
    );
    if (marked.length === 0 || keys.length === 0) return { released: marked.length > 0, deleted: 0, freedBytes: 0 };
    const doomed = keysToDelete(keys, await keepTexts(userId, postId));
    const result = await deleteMediaKeys(doomed);
    return { released: true, ...result };
  } catch (err) {
    console.error("media release failed for post", postId, err instanceof Error ? err.message : err);
    return none;
  }
}

/**
 * Release published posts whose files are still around (holds that expired, a release that
 * failed, posts published before this existed). Runs with the publish job; cheap when idle.
 */
export async function releasePublishedMediaSweep(limit = 25): Promise<{ released: number; deleted: number; freedBytes: number }> {
  const out = { released: 0, deleted: 0, freedBytes: 0 };
  let ids: { id: string }[] = [];
  try {
    ids = await query<{ id: string }>(
      `select p.id from socialapp.scheduled_posts p
       where p.status='published' and p.media_released_at is null
         and not exists (select 1 from socialapp.post_targets t where t.post_id=p.id
           and (t.status <> 'published' or t.media_hold_until > now()))
       order by p.updated_at limit $1`,
      [limit],
    );
  } catch (err) {
    console.error("media release sweep failed", err instanceof Error ? err.message : err);
    return out;
  }
  for (const { id } of ids) {
    const r = await releasePostMedia(id);
    if (r.released) out.released += 1;
    out.deleted += r.deleted;
    out.freedBytes += r.freedBytes;
  }
  return out;
}

/** After a post / draft is deleted: drop its uploads (and posters) that nothing else mentions. */
export async function releaseDeletedPostMedia(userId: string, mediaTexts: string[]): Promise<void> {
  try {
    const own = new Set<string>();
    for (const t of mediaTexts) {
      for (const k of mediaKeysInText(t)) if (k.startsWith(`${userId.toLowerCase()}/`)) own.add(k);
    }
    if (own.size === 0) return;
    const keep = await keepTexts(userId, null);
    // Published posts keep their posters even though they no longer hold the upload.
    const posterRefs = await query<{ t: string | null }>(
      "select media::text as t from socialapp.scheduled_posts where user_id=$1 and status='published'",
      [userId],
    );
    const candidates = new Set<string>();
    for (const k of own) {
      candidates.add(k);
      if (!isThumbKey(k)) candidates.add(thumbKeyFor(k));
    }
    const keptUploads = new Set(keep.flatMap(mediaKeysInText));
    const keptPosters = new Set(posterRefs.flatMap((r) => mediaKeysInText(r.t ?? "")).filter(isThumbKey));
    const doomed = [...candidates].filter((k) => {
      if (!isThumbKey(k)) return !keptUploads.has(k);
      // A poster stays while a published post shows it or its upload is still kept by someone.
      return !keptPosters.has(k) && !keptUploads.has(k) && ![...keptUploads].some((u) => thumbKeyFor(u) === k);
    });
    await deleteMediaKeys(doomed);
  } catch (err) {
    console.error("media release after delete failed", err instanceof Error ? err.message : err);
  }
}

/** Bytes counted toward the user's "waiting to be posted" storage quota. */
export async function pendingMediaUsage(userId: string): Promise<number> {
  const files = await listUserMedia(userId);
  if (files.length === 0) return 0;
  const posts = await query<{ status: string; t: string | null }>(
    "select status, media::text as t from socialapp.scheduled_posts where user_id=$1 and media::text like '%/api/media/%'",
    [userId],
  );
  return pendingBytesFor(files, posts.map((p) => ({ status: p.status, mediaText: p.t ?? "" })));
}

/** Set by networks whose publish was accepted but not yet confirmed (TikTok still processing). */
export async function holdTargetMedia(targetId: string, hours = 24): Promise<void> {
  await getPool()
    .query("update socialapp.post_targets set media_hold_until = now() + ($2::int * interval '1 hour') where id=$1", [targetId, hours])
    .catch((err) => console.error("media hold failed", err instanceof Error ? err.message : err));
}

const EXT_TYPE: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", mp4: "video/mp4", mov: "video/quicktime" };

/**
 * Schedule-time check of the post's uploaded files against the plan and EVERY selected network
 * (size, type, video length read from the file). Links to other sites are not checked here.
 * Returns the first friendly problem, or null.
 */
export async function scheduledMediaError(
  userId: string,
  platforms: readonly string[],
  media: { type: "image" | "video"; url: string }[],
  igFormat: "feed" | "story",
): Promise<string | null> {
  for (const item of media) {
    const key = ownMediaKeys(userId, [item])[0];
    if (!key) continue;
    const info = await statMediaUpload(key);
    if (!info) {
      return "One of the files in this post is no longer stored (files are removed after they are published). Upload it again.";
    }
    const ext = key.split(".").pop() ?? "";
    const file = mediaFilePath(key);
    const durationSec = item.type === "video" && file ? await probeVideoDurationSec(file) : null;
    const check = checkMediaForTargets(
      { kind: item.type, type: EXT_TYPE[ext] ?? info.contentType, size: info.size, durationSec },
      { plan: await planForUser(userId), platforms, igFormat },
    );
    if (check.errors.length > 0) return check.errors[0];
  }
  return null;
}
