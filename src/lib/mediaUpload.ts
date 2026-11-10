// Shared (client + server) rules for composer media uploads. No Node APIs here so the
// browser can validate a file before it is sent to /api/media/upload.
import { IG_FORMATS } from "@/lib/igSizes";

export type MediaKind = "image" | "video";

export const MEDIA_IMAGE_MAX_BYTES = 8 * 1024 * 1024;
export const MEDIA_VIDEO_MAX_BYTES = 100 * 1024 * 1024;

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

/** Validates a browser File (or a server upload) against the formats Instagram accepts. */
export function validateMediaFile(file: MediaFileInfo): MediaValidation {
  const type = (file.type || "").toLowerCase();
  const imageExt = IMAGE_MIME[type];
  const videoExt = VIDEO_MIME[type];
  const ext = imageExt ?? videoExt;
  if (!ext) {
    return { ok: false, error: "Use a JPG, PNG, MP4 or MOV file." };
  }
  const kind: MediaKind = imageExt ? "image" : "video";
  const max = kind === "image" ? MEDIA_IMAGE_MAX_BYTES : MEDIA_VIDEO_MAX_BYTES;
  if (!Number.isFinite(file.size) || file.size <= 0) {
    return { ok: false, error: "That file is empty." };
  }
  if (file.size > max) {
    return {
      ok: false,
      error: `${kind === "image" ? "Images" : "Videos"} must be ${Math.round(max / 1024 / 1024)} MB or smaller.`,
    };
  }
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
