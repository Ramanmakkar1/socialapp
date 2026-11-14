// Instagram Reels & Story safe zones for a 1080×1920 (9:16) frame.
// All values are percentages of the frame (0–100). These are approximate
// guides: Instagram's UI varies by device, app version and caption length,
// so leave a little extra margin around anything important.

export const FRAME_W = 1080;
export const FRAME_H = 1920;

export type Rect = { x: number; y: number; w: number; h: number };
export type SafeZone = Rect & { id: string; label: string };
export type SafeZoneMode = "reels" | "story" | "tiktok";

export const SAFE_ZONES: Record<SafeZoneMode, SafeZone[]> = {
  reels: [
    { id: "top", label: "Reels header & camera", x: 0, y: 0, w: 100, h: 14 },
    { id: "bottom", label: "Caption & audio", x: 0, y: 65, w: 100, h: 35 },
    { id: "right", label: "Like/comment/share buttons", x: 84, y: 14, w: 16, h: 51 },
  ],
  story: [
    { id: "top", label: "Profile & progress bar", x: 0, y: 0, w: 100, h: 13 },
    { id: "bottom", label: "Reply bar", x: 0, y: 87, w: 100, h: 13 },
  ],
  tiktok: [
    { id: "top", label: "Following / For You tabs", x: 0, y: 0, w: 100, h: 8 },
    { id: "bottom", label: "Caption, username & sound", x: 0, y: 74, w: 100, h: 26 },
    { id: "right", label: "Like/comment/save/share buttons", x: 86, y: 8, w: 14, h: 66 },
  ],
};

export const SAFE_ZONE_MODES: { id: SafeZoneMode; label: string }[] = [
  { id: "reels", label: "Reels" },
  { id: "story", label: "Story" },
];

export const MODE_META: Record<SafeZoneMode, { label: string; noun: string }> = {
  reels: { label: "Reels safe zone", noun: "Reel" },
  story: { label: "Story safe zone", noun: "Story" },
  tiktok: { label: "TikTok safe zone", noun: "TikTok video" },
};

/** True when two rects (same unit) overlap by any area. Touching edges do not count. */
export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
}

/** True when `rect` (percent of the frame) sits fully inside the frame and avoids every zone. */
export function isRectSafe(rect: Rect, zones: Rect[]): boolean {
  if (rect.w <= 0 || rect.h <= 0) return false;
  if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > 100 || rect.y + rect.h > 100) return false;
  return !zones.some((z) => rectsOverlap(rect, z));
}

/** Convert a percent rect to pixels for a frame of the given size. */
export function toPixels(rect: Rect, width = FRAME_W, height = FRAME_H): Rect {
  return {
    x: Math.round((rect.x / 100) * width),
    y: Math.round((rect.y / 100) * height),
    w: Math.round((rect.w / 100) * width),
    h: Math.round((rect.h / 100) * height),
  };
}
