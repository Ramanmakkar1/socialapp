// Layout and drawing math for the Instagram Story Maker tool.
// Canvas: 1080x1920 (9:16). Safe-zone data comes from ./safeZones.ts and is
// never copied here; the photo cover-fit and text wrapping are reused from
// ./reelCover.ts where they fit. No React, no DOM.
import { coverFit, wrapTitle } from "./reelCover.ts";
import {
  FRAME_W,
  FRAME_H,
  SAFE_ZONES,
  type Rect,
  type SafeZone,
  rectsOverlap,
  toPixels,
} from "./safeZones.ts";

export const STORY_W = FRAME_W;
export const STORY_H = FRAME_H;

/** Re-exported from ./safeZones.ts so consumers have one import path. */
export type { Rect, SafeZone };
export { rectsOverlap, toPixels };

/** The two Instagram Story bars the design keeps clear: top bar and reply bar. */
export const STORY_SAFE_ZONES = SAFE_ZONES.story;

/**
 * The clear middle band of the frame, in pixels: below the top bar and above
 * the reply bar (top and bottom 250 px kept clear).
 */
export const STORY_CLEAR_ZONE: Rect = { x: 0, y: 250, w: STORY_W, h: STORY_H - 500 };

/** Maximum characters that fit on one line inside the frame with side padding. */
export function maxCharsFor(fontSize: number): number {
  return Math.max(8, Math.floor((STORY_W - 120 - fontSize) / (0.56 * fontSize)));
}

/**
 * Wrap text into whole-word lines of at most maxChars, capped at maxLines.
 * Words longer than maxChars are hard-broken; a cut last line ends in "…".
 */
export function wrapText(text: string, maxChars: number, maxLines: number): string[] {
  return wrapTitle(text, maxChars, maxLines);
}

/**
 * A text box fitted inside `target` (pixels): wraps `text` at `fontSize`,
 * centres the box vertically in the target, with 0.5*fontSize padding and
 * 1.15*fontSize line height. Returns the wrapped lines and the box rect.
 */
export function textBox(
  text: string,
  fontSize: number,
  target: Rect,
): { lines: string[]; box: Rect } {
  const lines = wrapText(text, maxCharsFor(fontSize), 4);
  const padding = 0.5 * fontSize;
  const lineHeight = 1.15 * fontSize;
  const boxH = lines.length * lineHeight + padding * 2;
  const boxY = target.y + Math.round(target.h / 2 - boxH / 2);
  return { lines, box: { x: target.x, y: boxY, w: target.w, h: boxH } };
}

/** Cover-fit a photo into the Story frame (reused from ./reelCover.ts). */
export function storyPhotoFit(
  imgW: number,
  imgH: number,
  zoom = 1,
  offsetX = 0,
  offsetY = 0,
): ReturnType<typeof coverFit> {
  return coverFit(imgW, imgH, zoom, offsetX, offsetY);
}
