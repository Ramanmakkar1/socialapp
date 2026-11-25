// Server only: the media library (socialapp.media_assets, migration 055).
//
// Every upload becomes an asset of the WORKSPACE OWNER (callers pass the owner id from
// src/lib/workspace.ts, never the real signed-in person). A live asset keeps its file on disk:
// src/lib/mediaLifecycle.ts counts live asset keys as references, so publishing no longer deletes it.
// Deleting from the library is a soft delete; the file is removed once no unpublished post, idea,
// automation, bio page, lead magnet or product still mentions it. Published posts that showed it
// switch to their poster (or a placeholder), like an ordinary release.
import { query } from "@/lib/db";
import { IMAGE_PLACEHOLDER, VIDEO_PLACEHOLDER, nonPostReferenceTexts, pendingBytesFor } from "@/lib/mediaLifecycle";
import { PLAN_MEDIA_LIMITS } from "@/lib/mediaLimits";
import {
  deleteMediaKeys,
  isThumbKey,
  listUserMedia,
  mediaKeysInText,
  signedMediaUrl,
  statMediaUpload,
  thumbKeyFor,
} from "@/lib/mediaStorage";
import type { PlanName } from "@/lib/planLimits";

export type MediaKindName = "image" | "video";

export type MediaAsset = {
  id: string;
  key: string;
  name: string;
  mime: string;
  kind: MediaKindName;
  bytes: number;
  width: number | null;
  height: number | null;
  durationSec: number | null;
  alt: string;
  thumbKey: string | null;
  uploadedBy: string | null;
  createdAt: string;
};

/** What the browser gets: the asset plus signed links (the file and its poster). */
export type MediaAssetView = MediaAsset & { url: string | null; thumbUrl: string | null; gif: boolean };

type Row = {
  id: string;
  storage_key: string;
  original_name: string;
  mime: string;
  kind: MediaKindName;
  bytes: string | number;
  width: number | null;
  height: number | null;
  duration_sec: string | number | null;
  alt_text: string;
  thumb_key: string | null;
  uploaded_by_user_id: string | null;
  created_at: Date | string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const ALT_MAX = 1000;
export const LIST_MAX = 200;

function toAsset(r: Row): MediaAsset {
  return {
    id: r.id,
    key: r.storage_key,
    name: r.original_name,
    mime: r.mime,
    kind: r.kind,
    bytes: Number(r.bytes) || 0,
    width: r.width,
    height: r.height,
    durationSec: r.duration_sec === null ? null : Number(r.duration_sec),
    alt: r.alt_text ?? "",
    thumbKey: r.thumb_key,
    uploadedBy: r.uploaded_by_user_id,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

/** Pure: "a.gif"-style names / GIF mime show a GIF badge (stored GIFs are rare: uploads take JPG/PNG/MP4/MOV). */
export function isGif(a: Pick<MediaAsset, "name" | "mime">): boolean {
  return a.mime === "image/gif" || /\.gif$/i.test(a.name);
}

export function viewOf(a: MediaAsset, baseUrl: string): MediaAssetView {
  return {
    ...a,
    url: signedMediaUrl(a.key, baseUrl),
    thumbUrl: a.thumbKey ? signedMediaUrl(a.thumbKey, baseUrl) : null,
    gif: isGif(a),
  };
}

/** Pure: clean alt text (trim, collapse whitespace, cap). */
export function cleanAlt(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, ALT_MAX);
}

/** Pure: the storage key must sit in the owner's own folder. */
export function keyBelongsTo(ownerId: string, key: string): boolean {
  return key.toLowerCase().startsWith(`${ownerId.toLowerCase()}/`) && !isThumbKey(key);
}

/** Record a finished upload as a library asset (idempotent on storage key). */
export async function recordAsset(input: {
  ownerId: string;
  key: string;
  name: string;
  mime: string;
  kind: MediaKindName;
  bytes: number;
  width?: number | null;
  height?: number | null;
  durationSec?: number | null;
  uploadedBy?: string | null;
}): Promise<MediaAsset | null> {
  if (!keyBelongsTo(input.ownerId, input.key)) return null;
  const dim = (n: number | null | undefined) => (typeof n === "number" && Number.isFinite(n) && n > 0 && n < 100_000 ? Math.round(n) : null);
  const rows = await query<Row>(
    `insert into socialapp.media_assets
       (user_id, storage_key, original_name, mime, kind, bytes, width, height, duration_sec, uploaded_by_user_id)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     on conflict (storage_key) do update set deleted_at = null
     returning *`,
    [
      input.ownerId,
      input.key,
      input.name.slice(0, 255),
      input.mime,
      input.kind,
      Math.max(0, Math.round(input.bytes)),
      dim(input.width),
      dim(input.height),
      typeof input.durationSec === "number" && Number.isFinite(input.durationSec) ? input.durationSec : null,
      input.uploadedBy && UUID_RE.test(input.uploadedBy) ? input.uploadedBy : null,
    ],
  );
  return rows[0] ? toAsset(rows[0]) : null;
}

/** The poster for an asset arrived (X-Thumb-For on the upload route). */
export async function setAssetThumb(ownerId: string, key: string, thumbKey: string): Promise<void> {
  await query("update socialapp.media_assets set thumb_key=$3 where user_id=$1 and lower(storage_key)=lower($2)", [ownerId, key, thumbKey]);
}

export type ListFilter = { q?: string; kind?: MediaKindName | "gif" | "all"; ids?: string[]; limit?: number; offset?: number };

/** Pure: SQL + params for a library listing of one owner (live assets only). */
export function listStatement(ownerId: string, f: ListFilter = {}): { text: string; params: unknown[] } {
  const params: unknown[] = [ownerId];
  const where = ["user_id=$1", "deleted_at is null"];
  if (f.ids && f.ids.length > 0) {
    params.push(f.ids.filter((id) => UUID_RE.test(id)).slice(0, LIST_MAX));
    where.push(`id = any($${params.length}::uuid[])`);
  }
  const q = (f.q ?? "").trim().slice(0, 100);
  if (q) {
    params.push(`%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`);
    where.push(`(original_name ilike $${params.length} or alt_text ilike $${params.length})`);
  }
  if (f.kind === "image" || f.kind === "video") {
    params.push(f.kind);
    where.push(`kind = $${params.length}`);
  } else if (f.kind === "gif") {
    where.push(`(mime = 'image/gif' or original_name ilike '%.gif')`);
  }
  const limit = Math.min(Math.max(1, Math.floor(f.limit ?? 60)), LIST_MAX);
  const offset = Math.max(0, Math.floor(f.offset ?? 0));
  params.push(limit, offset);
  return {
    text: `select * from socialapp.media_assets where ${where.join(" and ")} order by created_at desc limit $${params.length - 1} offset $${params.length}`,
    params,
  };
}

export async function listAssets(ownerId: string, f: ListFilter = {}): Promise<MediaAsset[]> {
  const { text, params } = listStatement(ownerId, f);
  return (await query<Row>(text, params)).map(toAsset);
}

export async function getAssets(ownerId: string, ids: string[]): Promise<MediaAsset[]> {
  const clean = ids.filter((id) => UUID_RE.test(id));
  if (clean.length === 0) return [];
  return listAssets(ownerId, { ids: clean, limit: LIST_MAX });
}

export async function updateAssetAlt(ownerId: string, id: string, alt: string): Promise<boolean> {
  if (!UUID_RE.test(id)) return false;
  const rows = await query<{ id: string }>(
    "update socialapp.media_assets set alt_text=$3 where user_id=$1 and id=$2 and deleted_at is null returning id",
    [ownerId, id, cleanAlt(alt)],
  );
  return rows.length > 0;
}

/** Bytes of live library files (originals + posters). */
export async function libraryAssetBytes(ownerId: string): Promise<number> {
  const rows = await query<{ n: string | null }>(
    "select coalesce(sum(bytes), 0)::bigint as n from socialapp.media_assets where user_id=$1 and deleted_at is null",
    [ownerId],
  );
  return Number(rows[0]?.n ?? 0) || 0;
}

/**
 * Storage counted toward the plan's media-library quota: live library files, plus older uploads that
 * are not in the library but still wait to be posted (uploaded before the library existed).
 */
export async function libraryUsage(ownerId: string): Promise<number> {
  const [assetBytes, files, live] = await Promise.all([
    libraryAssetBytes(ownerId),
    listUserMedia(ownerId),
    query<{ k: string; t: string | null }>(
      // Live assets only: a deleted asset whose file still waits for an unpublished post counts as pending.
      "select lower(storage_key) as k, lower(thumb_key) as t from socialapp.media_assets where user_id=$1 and deleted_at is null",
      [ownerId],
    ),
  ]);
  const inLibrary = new Set<string>();
  for (const r of live) {
    inLibrary.add(r.k);
    inLibrary.add(r.t ?? thumbKeyFor(r.k));
  }
  const legacy = files.filter((f) => !inLibrary.has(f.key.toLowerCase()));
  if (legacy.length === 0) return assetBytes;
  const posts = await query<{ status: string; t: string | null }>(
    "select status, media::text as t from socialapp.scheduled_posts where user_id=$1 and media::text like '%/api/media/%'",
    [ownerId],
  );
  return assetBytes + pendingBytesFor(legacy, posts.map((p) => ({ status: p.status, mediaText: p.t ?? "" })));
}

export function libraryQuotaBytes(plan: PlanName): number {
  return PLAN_MEDIA_LIMITS[plan].libraryBytes;
}

/** Pure: an item of a published post's media JSON after its library file went away. */
export function purgedItem(item: Record<string, unknown>, poster: string | null): Record<string, unknown> {
  const isVideo = item.type === "video";
  return { ...item, thumb: poster ?? (isVideo ? VIDEO_PLACEHOLDER : IMAGE_PLACEHOLDER), purged: true };
}

/**
 * Soft-delete assets (only this owner's; `canDelete` decides per asset, e.g. members may only delete
 * their own uploads). Files go when nothing else still uses them. Returns how many were deleted.
 */
export async function deleteAssets(
  ownerId: string,
  ids: string[],
  canDelete: (a: MediaAsset) => boolean,
  baseUrl: string,
): Promise<{ deleted: number; refused: number }> {
  const assets = await getAssets(ownerId, ids);
  const allowed = assets.filter(canDelete);
  if (allowed.length === 0) return { deleted: 0, refused: assets.length };
  const marked = await query<{ storage_key: string; thumb_key: string | null }>(
    "update socialapp.media_assets set deleted_at=now() where user_id=$1 and id = any($2::uuid[]) and deleted_at is null returning storage_key, thumb_key",
    [ownerId, allowed.map((a) => a.id)],
  );
  // What must stay: unpublished posts, other rows and the REMAINING live assets (the marked ones no longer count).
  const keepTexts = await nonPostReferenceTexts(ownerId).catch(() => null);
  if (keepTexts === null) return { deleted: marked.length, refused: assets.length - allowed.length };
  const unpublished = await query<{ t: string | null }>(
    "select media::text as t from socialapp.scheduled_posts where user_id=$1 and status <> 'published' and media::text like '%/api/media/%'",
    [ownerId],
  );
  const otherKeep = new Set(keepTexts.concat(unpublished.map((r) => r.t ?? "")).flatMap(mediaKeysInText));
  // Published posts that still point at a deleted file switch to its poster.
  for (const m of marked) {
    const key = m.storage_key.toLowerCase();
    if (otherKeep.has(key)) continue;
    const thumb = m.thumb_key ?? thumbKeyFor(key);
    const poster = (await statMediaUpload(thumb)) ? signedMediaUrl(thumb, baseUrl) : null;
    const posts = await query<{ id: string; media: unknown }>(
      "select id, media from socialapp.scheduled_posts where user_id=$1 and status='published' and media::text ilike $2",
      [ownerId, `%/api/media/${key}%`],
    );
    for (const p of posts) {
      if (!Array.isArray(p.media)) continue;
      const next = p.media.map((raw) => {
        if (typeof raw !== "object" || raw === null) return raw;
        const item = raw as Record<string, unknown>;
        if (item.purged === true || typeof item.url !== "string") return item;
        return mediaKeysInText(item.url).includes(key) ? purgedItem(item, poster) : item;
      });
      await query("update socialapp.scheduled_posts set media=$2::jsonb where id=$1", [p.id, JSON.stringify(next)]);
    }
    await deleteMediaKeys([key]);
    // The poster stays while a published post shows it.
    const shown = await query<{ id: string }>(
      "select id from socialapp.scheduled_posts where user_id=$1 and status='published' and media::text ilike $2 limit 1",
      [ownerId, `%/api/media/${thumb}%`],
    );
    if (shown.length === 0 && !otherKeep.has(thumb)) await deleteMediaKeys([thumb]);
  }
  return { deleted: marked.length, refused: assets.length - allowed.length };
}
