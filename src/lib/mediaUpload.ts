// Shared (client + server) rules for composer media uploads. No Node APIs here so the
// browser can validate a file before it is sent to /api/media/upload.
import { IG_FORMATS } from "@/lib/igSizes";
import { PLAN_MEDIA_LIMITS, planMediaError } from "@/lib/mediaLimits";
import type { PlanName } from "@/lib/planLimits";

export type MediaKind = "image" | "video";

/** Largest files any plan accepts (per-plan and per-network caps live in src/lib/mediaLimits.ts). */
export const MEDIA_IMAGE_MAX_BYTES = PLAN_MEDIA_LIMITS.Agency.imageBytes;
export const MEDIA_VIDEO_MAX_BYTES = PLAN_MEDIA_LIMITS.Agency.videoBytes;

const IMAGE_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
};

const VIDEO_MIME: Record<string, string> = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};

export type MediaFileInfo = {
  type: string;
  size: number;
  name?: string;
};

export type MediaValidation =
  | { ok: true; kind: MediaKind; ext: string }
  | { ok: false; error: string };

/** Validates a browser File (or a server upload): supported type, not empty, within the plan's per-file size. */
export function validateMediaFile(file: MediaFileInfo, plan: PlanName = "Free"): MediaValidation {
  const type = (file.type || "").toLowerCase();
  const imageExt = IMAGE_MIME[type];
  const videoExt = VIDEO_MIME[type];
  const ext = imageExt ?? videoExt;
  if (!ext) {
    return { ok: false, error: "Use a JPG, PNG, MP4 or MOV file." };
  }
  const kind: MediaKind = imageExt ? "image" : "video";
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, error: "That file is empty." };
  }
  const tooBig = planMediaError({ kind, size: file.size }, plan);
  if (tooBig) return { ok: false, error: tooBig };
  return { ok: true, kind, ext };
}

/** The media kind from a public URL's file extension (signed upload URLs keep the extension). */
export function mediaKindFromUrl(url: string): MediaKind | null {
  try {
    const pathname = new URL(url).pathname.toLowerCase();
    if (/\.(jpe?g|png)$/.test(pathname)) return "image";
    if (/\.(mp4|mov)$/.test(pathname)) return "video";
  } catch {
    // Not a URL (for example a half-typed link): no preview.
  }
  return null;
}

const FEED_PORTRAIT = IG_FORMATS.find((format) => format.id === "feed-portrait");
const FEED_LANDSCAPE = IG_FORMATS.find((format) => format.id === "landscape");

/**
 * Instagram feed images must sit between 4:5 portrait and 1.91:1 landscape. Returns a
 * friendly warning for images outside that range, or null when the size is fine.
 */
export function instagramAspectWarning(width: number, height: number): string | null {
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }
  const ratio = width / height;
  const min = FEED_PORTRAIT?.ratio ?? 1080 / 1350;
  const max = FEED_LANDSCAPE?.ratio ?? 1080 / 566;
  if (ratio < min - 0.001) {
    return `This image is taller than Instagram's 4:5 feed limit (${width}×${height}). Crop it to 4:5, or use it as a Story.`;
  }
  if (ratio > max + 0.001) {
    return `This image is wider than Instagram's 1.91:1 feed limit (${width}×${height}). Crop it to 1.91:1 or square.`;
  }
  return null;
}

/**
 * Picture for a saved post's media JSON: the kept poster (`thumb`, set once the upload is deleted
 * after publishing), else the first image itself. Null for a video without a poster.
 */
export function postThumbUrl(media: unknown): string | null {
  const first = Array.isArray(media) ? (media[0] as { url?: unknown; thumb?: unknown } | undefined) : undefined;
  if (typeof first?.thumb === "string" && first.thumb !== "") return first.thumb;
  if (typeof first?.url === "string" && !/\.(mp4|mov|webm)(\?|$)/i.test(first.url)) return first.url;
  return null;
}
