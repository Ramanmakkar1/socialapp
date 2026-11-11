// Per-file media limits: ONE table for the composer (browser checks before upload), the upload
// route and schedule-time validation (src/lib/savePost.ts). Pure, no Node APIs.
//
// Sizes are decimal (1 MB = 1,000,000 bytes) like the platforms' docs, so a file that passes here
// is never rejected by the network for being a few binary megabytes too big.
// Sources (checked 2026-11-11) are listed next to each network.
import type { PlanName } from "@/lib/planLimits";

export const MB = 1_000_000;
export const GB = 1_000_000_000;

export type MediaKind = "image" | "video";

/** What each plan allows per file, and how much "waiting to be posted" storage it gets. */
export const PLAN_MEDIA_LIMITS: Record<PlanName, { imageBytes: number; videoBytes: number; pendingBytes: number }> = {
  Free: { imageBytes: 20 * MB, videoBytes: 250 * MB, pendingBytes: 2 * GB },
  Pro: { imageBytes: 30 * MB, videoBytes: 1 * GB, pendingBytes: 20 * GB },
  Agency: { imageBytes: 30 * MB, videoBytes: 2 * GB, pendingBytes: 100 * GB },
};

/** Days an upload that is not attached to any post still counts (and is kept). */
export const UNATTACHED_KEEP_DAYS = 7;

export type MediaRuleId =
  | "instagram_feed"
  | "instagram_reels"
  | "instagram_story"
  | "facebook"
  | "threads"
  | "youtube"
  | "tiktok"
  | "linkedin"
  | "pinterest"
  | "x"
  | "bluesky"
  | "mastodon"
  | "gbp";

export type MediaRule = {
  /** Network name in messages ("Instagram"). */
  network: string;
  /** What a video is called there ("Reel", "Story", "video"). */
  videoNoun: string;
  imageNoun: string;
  /** null = this target takes no images / no video. */
  imageBytes: number | null;
  videoBytes: number | null;
  imageTypes: string[];
  videoTypes: string[];
  videoMinSec?: number;
  videoMaxSec?: number;
  /** Poskoo shrinks bigger images before sending them (Bluesky), so the size is a note, not an error. */
  downscalesImages?: boolean;
  /** Smallest accepted image file / side (Google Business Profile: 10 KB, 250×250). */
  imageMinBytes?: number;
  imageMinPx?: number;
  /** Vertical-first formats: warn when a video is not about 9:16. */
  vertical?: boolean;
};

const JPEG = ["image/jpeg"];
const JPEG_PNG = ["image/jpeg", "image/png"];
const MP4_MOV = ["video/mp4", "video/quicktime"];

export const NETWORK_MEDIA_LIMITS: Record<MediaRuleId, MediaRule> = {
  // developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media
  instagram_feed: { network: "Instagram", videoNoun: "Reel", imageNoun: "image", imageBytes: 8 * MB, videoBytes: 300 * MB, imageTypes: JPEG, videoTypes: MP4_MOV, videoMinSec: 3, videoMaxSec: 15 * 60, vertical: true },
  instagram_reels: { network: "Instagram", videoNoun: "Reel", imageNoun: "image", imageBytes: 8 * MB, videoBytes: 300 * MB, imageTypes: JPEG, videoTypes: MP4_MOV, videoMinSec: 3, videoMaxSec: 15 * 60, vertical: true },
  instagram_story: { network: "Instagram", videoNoun: "Story", imageNoun: "Story image", imageBytes: 8 * MB, videoBytes: 100 * MB, imageTypes: JPEG, videoTypes: MP4_MOV, videoMinSec: 3, videoMaxSec: 60, vertical: true },
  // developers.facebook.com/docs/video-api/guides/publishing + /docs/graph-api/reference/page/photos
  facebook: { network: "Facebook", videoNoun: "video", imageNoun: "photo", imageBytes: 10 * MB, videoBytes: 1 * GB, imageTypes: JPEG_PNG, videoTypes: MP4_MOV },
  // developers.facebook.com/docs/threads/overview#media-specifications (image 8 MB, video 1 GB, 5 min)
  threads: { network: "Threads", videoNoun: "video", imageNoun: "image", imageBytes: 8 * MB, videoBytes: 1 * GB, imageTypes: JPEG_PNG, videoTypes: MP4_MOV, videoMaxSec: 5 * 60 },
  // developers.google.com/youtube/v3/docs/videos/insert (API allows 256 GB; 2 GB is our cap)
  youtube: { network: "YouTube", videoNoun: "video", imageNoun: "image", imageBytes: null, videoBytes: 2 * GB, imageTypes: [], videoTypes: MP4_MOV },
  // developers.tiktok.com/doc/content-posting-api-media-transfer-guide (API 4 GB; 1 GB is our cap)
  tiktok: { network: "TikTok", videoNoun: "video", imageNoun: "photo", imageBytes: 20 * MB, videoBytes: 1 * GB, imageTypes: JPEG, videoTypes: MP4_MOV, videoMinSec: 3, videoMaxSec: 10 * 60, vertical: true },
  // learn.microsoft.com/linkedin/marketing/community-management/shares/videos-api + images-api
  linkedin: { network: "LinkedIn", videoNoun: "video", imageNoun: "image", imageBytes: 10 * MB, videoBytes: 200 * MB, imageTypes: JPEG_PNG, videoTypes: MP4_MOV, videoMinSec: 3, videoMaxSec: 30 * 60 },
  // developers.pinterest.com/docs/api/v5/ (pins media) + help.pinterest.com (image 20 MB, video 2 GB)
  pinterest: { network: "Pinterest", videoNoun: "video Pin", imageNoun: "image", imageBytes: 20 * MB, videoBytes: 1 * GB, imageTypes: JPEG_PNG, videoTypes: MP4_MOV, videoMinSec: 4, videoMaxSec: 15 * 60 },
  // docs.x.com/x-api/media/quickstart/media-upload-chunked (non-premium accounts)
  x: { network: "X", videoNoun: "video", imageNoun: "image", imageBytes: 5 * MB, videoBytes: 512 * MB, imageTypes: JPEG_PNG, videoTypes: MP4_MOV, videoMinSec: 0.5, videoMaxSec: 140 },
  // docs.bsky.app (app.bsky.embed.images: 1,000,000 bytes; app.bsky.embed.video)
  bluesky: { network: "Bluesky", videoNoun: "video", imageNoun: "image", imageBytes: 1_000_000, videoBytes: 50 * MB, imageTypes: JPEG_PNG, videoTypes: MP4_MOV, videoMaxSec: 3 * 60, downscalesImages: true },
  // docs.joinmastodon.org/user/posting/#media (server defaults; some servers differ)
  mastodon: { network: "Mastodon", videoNoun: "video", imageNoun: "image", imageBytes: 16 * MB, videoBytes: 99 * MB, imageTypes: JPEG_PNG, videoTypes: MP4_MOV },
  // developers.google.com/my-business/content/posts-data (local post photo: JPG/PNG, 10 KB-5 MB, min 250x250; one photo, no video)
  gbp: { network: "Google Business Profile", videoNoun: "video", imageNoun: "photo", imageBytes: 5 * MB, videoBytes: null, imageTypes: JPEG_PNG, videoTypes: [], imageMinBytes: 10_000, imageMinPx: 250 },
};

/** The rule a post target uses for a media kind. Instagram feed videos publish as Reels. */
export function mediaRuleFor(platform: string, kind: MediaKind, igFormat: "feed" | "story" = "feed"): MediaRuleId | null {
  if (platform === "instagram") {
    if (igFormat === "story") return "instagram_story";
    return kind === "video" ? "instagram_reels" : "instagram_feed";
  }
  return platform in NETWORK_MEDIA_LIMITS ? (platform as MediaRuleId) : null;
}

export type MediaFacts = {
  kind: MediaKind;
  /** MIME type, e.g. image/jpeg. */
  type: string;
  size: number;
  durationSec?: number | null;
  width?: number | null;
  height?: number | null;
};

export type MediaCheck = { errors: string[]; warnings: string[] };

/** "412 MB", "1.5 GB", "800 KB". */
export function formatBytes(bytes: number): string {
  if (bytes >= GB) return `${Number((bytes / GB).toFixed(1))} GB`;
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`;
  return `${Math.max(1, Math.round(bytes / 1000))} KB`;
}

/** "45 s", "5 min", "16 min 20 s". */
export function formatDuration(sec: number): string {
  const s = Math.round(sec);
  if (s < 60) return `${s} s`;
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return rest ? `${m} min ${rest} s` : `${m} min`;
}

function typeLabel(types: string[]): string {
  const names = [...new Set(types.map((t) => (t === "image/jpeg" ? "JPG" : t === "image/png" ? "PNG" : t === "video/mp4" ? "MP4" : t === "video/quicktime" ? "MOV" : t)))];
  return names.join(" or ");
}

/** Plan-level check (per-file size by plan). */
export function planMediaError(facts: Pick<MediaFacts, "kind" | "size">, plan: PlanName): string | null {
  const limits = PLAN_MEDIA_LIMITS[plan];
  const max = facts.kind === "image" ? limits.imageBytes : limits.videoBytes;
  if (facts.size > max) {
    const noun = facts.kind === "image" ? "image" : "video";
    return `This ${noun} is ${formatBytes(facts.size)}. The ${plan} plan allows ${noun}s up to ${formatBytes(max)}. ${facts.kind === "video" ? "Compress it or trim it." : "Save it smaller or as a JPG."}`;
  }
  return null;
}

/** Check one file against one network rule. Duration / size checks only run when the fact is known. */
export function networkMediaCheck(facts: MediaFacts, ruleId: MediaRuleId): MediaCheck {
  const rule = NETWORK_MEDIA_LIMITS[ruleId];
  const out: MediaCheck = { errors: [], warnings: [] };
  const isVideo = facts.kind === "video";
  const noun = isVideo ? rule.videoNoun : rule.imageNoun;
  const max = isVideo ? rule.videoBytes : rule.imageBytes;
  const types = isVideo ? rule.videoTypes : rule.imageTypes;
  if (max === null) {
    out.errors.push(`${rule.network} takes ${isVideo ? "images" : "videos"} only. Remove this ${isVideo ? "video" : "image"} or untick ${rule.network}.`);
    return out;
  }
  if (facts.type && !types.includes(facts.type.toLowerCase())) {
    out.errors.push(`${rule.network} only accepts ${typeLabel(types)} ${isVideo ? "videos" : "images"}. Save this file as ${typeLabel(types).split(" or ")[0]} and upload it again.`);
  }
  if (facts.size > max) {
    if (!isVideo && rule.downscalesImages) {
      out.warnings.push(`${rule.network} takes images up to ${formatBytes(max)}, so Poskoo will send a smaller copy of this one.`);
    } else {
      out.errors.push(`This ${noun} is ${formatBytes(facts.size)}. ${rule.network} allows up to ${formatBytes(max)}. ${isVideo ? "Compress it or trim it." : "Save it smaller and upload it again."}`);
    }
  }
  if (!isVideo && rule.imageMinBytes !== undefined && facts.size > 0 && facts.size < rule.imageMinBytes) {
    out.errors.push(`This ${noun} is ${formatBytes(facts.size)}. ${rule.network} needs at least ${formatBytes(rule.imageMinBytes)}. Use a larger image.`);
  }
  if (!isVideo && rule.imageMinPx !== undefined && (facts.width ?? 0) > 0 && (facts.height ?? 0) > 0 && Math.min(facts.width ?? 0, facts.height ?? 0) < rule.imageMinPx) {
    out.errors.push(`This ${noun} is ${facts.width}×${facts.height}. ${rule.network} needs at least ${rule.imageMinPx}×${rule.imageMinPx} pixels.`);
  }
  const dur = facts.durationSec;
  if (isVideo && typeof dur === "number" && Number.isFinite(dur) && dur > 0) {
    if (rule.videoMaxSec !== undefined && dur > rule.videoMaxSec + 0.5) {
      out.errors.push(`This ${noun} is ${formatDuration(dur)} long. ${rule.network} allows up to ${formatDuration(rule.videoMaxSec)}. Trim it.`);
    }
    if (rule.videoMinSec !== undefined && dur < rule.videoMinSec - 0.05) {
      out.errors.push(`This ${noun} is ${formatDuration(dur)} long. ${rule.network} needs at least ${formatDuration(rule.videoMinSec)}.`);
    }
  }
  const w = facts.width ?? 0;
  const h = facts.height ?? 0;
  if (isVideo && rule.vertical && w > 0 && h > 0 && Math.abs(w / h - 9 / 16) > 0.03) {
    out.warnings.push(`${rule.network} ${noun}s look best at 9:16 (for example 1080×1920). This one is ${w}×${h}, so it will show with bars or be cropped.`);
  }
  return out;
}

/**
 * Check one file against the plan and every selected network (the strictest wins).
 * Duplicate messages (Instagram feed + Reels share text) are dropped.
 */
export function checkMediaForTargets(
  facts: MediaFacts,
  ctx: { plan: PlanName; platforms: readonly string[]; igFormat?: "feed" | "story" },
): MediaCheck {
  const errors: string[] = [];
  const warnings: string[] = [];
  const planError = planMediaError(facts, ctx.plan);
  if (planError) errors.push(planError);
  for (const platform of ctx.platforms) {
    const ruleId = mediaRuleFor(platform, facts.kind, ctx.igFormat ?? "feed");
    if (!ruleId) continue;
    const check = networkMediaCheck(facts, ruleId);
    errors.push(...check.errors);
    warnings.push(...check.warnings);
  }
  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}

/** Largest file of this kind the plan and every selected network accept (for "up to N MB" hints). */
export function maxBytesForTargets(kind: MediaKind, ctx: { plan: PlanName; platforms: readonly string[]; igFormat?: "feed" | "story" }): number {
  let max = kind === "image" ? PLAN_MEDIA_LIMITS[ctx.plan].imageBytes : PLAN_MEDIA_LIMITS[ctx.plan].videoBytes;
  for (const platform of ctx.platforms) {
    const ruleId = mediaRuleFor(platform, kind, ctx.igFormat ?? "feed");
    if (!ruleId) continue;
    const rule = NETWORK_MEDIA_LIMITS[ruleId];
    const cap = kind === "image" ? (rule.downscalesImages ? null : rule.imageBytes) : rule.videoBytes;
    if (cap !== null && cap > 0) max = Math.min(max, cap);
  }
  return max;
}

/** Sidebar / Settings line: "Media storage: 0.4 / 2 GB". */
export function pendingStorageLabel(usedBytes: number, plan: PlanName): string {
  const quota = PLAN_MEDIA_LIMITS[plan].pendingBytes;
  const used = usedBytes / GB;
  const usedText = used >= 10 ? used.toFixed(0) : used.toFixed(1);
  return `Media storage: ${usedText} / ${Math.round(quota / GB)} GB`;
}

export function pendingQuotaMessage(usedBytes: number, plan: PlanName): string {
  const quota = PLAN_MEDIA_LIMITS[plan].pendingBytes;
  return `Your media storage is full (${formatBytes(usedBytes)} of ${formatBytes(quota)} waiting to be posted). Files free up as soon as their posts are published. Delete unused drafts, or use a link to the file instead.`;
}
