// Pure helpers for the Instagram Reel Cover Maker tool.
// No React, no DOM: crop math, cover-fit drawing, title wrapping and layout.

/** A 9:16 reel cover frame. */
export const REEL_W = 1080;
export const REEL_H = 1920;

export interface ReelCrop {
  id: "grid" | "feed";
  label: string;
  w: number;
  h: number;
}

/** The two places a cover is seen: the profile grid (3:4) and the feed (4:5). */
export const GRID_CROP: ReelCrop = { id: "grid", label: "Profile grid (3:4)", w: 1080, h: 1440 };
export const FEED_CROP: ReelCrop = { id: "feed", label: "Feed (4:5)", w: 1080, h: 1350 };
export const CROPS: ReelCrop[] = [GRID_CROP, FEED_CROP];

/** Centred crop rectangle inside the 1080x1920 frame. */
export function cropRect(crop: ReelCrop): { x: number; y: number; w: number; h: number } {
  return {
    x: Math.round((REEL_W - crop.w) / 2),
    y: Math.round((REEL_H - crop.h) / 2),
    w: crop.w,
    h: crop.h,
  };
}

/**
 * "Cover" fit of a photo into the 1080x1920 frame for ctx.drawImage.
 * Zoom is clamped to 1..3; offsets run from -1 to 1 and move the photo within
 * its overflow. The result is clamped so the photo always covers the frame.
 */
export function coverFit(
  imgW: number,
  imgH: number,
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
): { dx: number; dy: number; dw: number; dh: number } {
  const z = Math.min(3, Math.max(1, zoom));
  const scale = Math.max(REEL_W / imgW, REEL_H / imgH) * z;
  const dw = imgW * scale;
  const dh = imgH * scale;
  const dx = Math.min(0, Math.max(REEL_W - dw, (REEL_W - dw) / 2 + (offsetX * (dw - REEL_W)) / 2));
  const dy = Math.min(0, Math.max(REEL_H - dh, (REEL_H - dh) / 2 + (offsetY * (dh - REEL_H)) / 2));
  return { dx, dy, dw, dh };
}

export interface TitleStyle {
  id: string;
  name: string;
  bg: string | null;
  fg: string;
  band: boolean;
}

/** 4 presets using the brand colours from highlightCovers.ts PALETTES. */
export const TITLE_STYLES: TitleStyle[] = [
  { id: "brand", name: "Brand", bg: "#6b4eff", fg: "#ffffff", band: true },
  { id: "charcoal", name: "Charcoal", bg: "#1e1631", fg: "#ffffff", band: true },
  { id: "cream", name: "Cream", bg: "#fffcf6", fg: "#1e1631", band: true },
  { id: "none", name: "No band", bg: null, fg: "#ffffff", band: false },
];

/**
 * Split a title into lines on word boundaries. Words longer than maxChars are
 * hard-broken; at most maxLines lines are kept, with an ellipsis on the last
 * line when text was cut.
 */
export function wrapTitle(text: string, maxChars = 18, maxLines = 3): string[] {
  const words = text.trim().split(/\s+/).filter((w) => w.length > 0);
  const lines: string[] = [];
  let current = "";
  const push = () => {
    if (current.length > 0) lines.push(current);
    current = "";
  };
  for (const word of words) {
    let rest = word;
    while (rest.length > maxChars) {
      const piece = rest.slice(0, maxChars);
      rest = rest.slice(maxChars);
      if (current.length > 0 && current.length + 1 + piece.length > maxChars) push();
      current = current.length > 0 ? current + " " + piece : piece;
    }
    if (current.length > 0 && current.length + 1 + rest.length > maxChars) push();
    current = current.length > 0 ? current + " " + rest : rest;
  }
  push();
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].slice(0, Math.max(0, maxChars - 1)) + "…";
    return kept;
  }
  return lines;
}

/**
 * The title band rectangle, centred vertically inside the GRID crop so the
 * title still shows on the profile grid. Padding = 0.5*fontSize, line height
 * = 1.15*fontSize, 60 px side margins.
 */
export function titleBox(lines: string[], fontSize: number): { x: number; y: number; w: number; h: number } {
  const rect = cropRect(GRID_CROP);
  const padding = 0.5 * fontSize;
  const lineHeight = 1.15 * fontSize;
  const h = lines.length * lineHeight + padding * 2;
  const y = rect.y + rect.h / 2 - h / 2;
  return { x: 60, y, w: REEL_W - 120, h };
}
