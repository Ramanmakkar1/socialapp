// Pure helpers for the Instagram Highlight Cover Maker tool.
// No React, no DOM: layout math, colour presets and hand-drawn icon paths.

/** Instagram crops highlight covers to a circle centred in a 1080-wide story. */
export const COVER_SIZE = 1080;

export interface Palette {
  id: string;
  name: string;
  bg: string;
  fg: string;
}

export interface Icon {
  id: string;
  name: string;
  path: string;
}

/** 8 named presets. Brand colours come from the tokens in src/app/globals.css. */
export const PALETTES: Palette[] = [
  { id: "blush", name: "Blush", bg: "#f8c8dc", fg: "#5a2440" },
  { id: "sand", name: "Sand", bg: "#ffcf96", fg: "#5a3a1e" },
  { id: "sage", name: "Sage", bg: "#bdebd2", fg: "#1e4634" },
  { id: "sky", name: "Sky", bg: "#bde0f5", fg: "#1e3a52" },
  { id: "lilac", name: "Lilac", bg: "#cdbdf6", fg: "#3a2a6b" },
  { id: "charcoal", name: "Charcoal", bg: "#1e1631", fg: "#ffffff" },
  { id: "cream", name: "Cream", bg: "#fffcf6", fg: "#1e1631" },
  { id: "brand", name: "Brand", bg: "#6b4eff", fg: "#ffffff" },
];

/**
 * 16 simple icons as SVG path strings on a 24x24 viewBox, drawn as basic
 * shapes (not copied from an icon set). `link` and `gift` use the exact
 * paths approved in review.
 */
export const ICONS: Icon[] = [
  { id: "heart", name: "Heart", path: "M12 20.5C12 20.5 3.5 15 3.5 9.5C3.5 6.5 5.8 4.5 8.2 4.5C10 4.5 11.3 5.6 12 7C12.7 5.6 14 4.5 15.8 4.5C18.2 4.5 20.5 6.5 20.5 9.5C20.5 15 12 20.5 12 20.5Z" },
  { id: "star", name: "Star", path: "M12 2.5L14.9 8.6L21.5 9.5L16.7 14.1L17.9 20.7L12 17.5L6.1 20.7L7.3 14.1L2.5 9.5L9.1 8.6Z" },
  { id: "chat", name: "Chat bubble", path: "M12 3C6.5 3 2 6.5 2 11C2 13.5 3.4 15.7 5.6 17.1L4.5 21L8.6 19.3C9.7 19.6 10.8 19.7 12 19.7C17.5 19.7 22 16.2 22 11C22 6.5 17.5 3 12 3Z" },
  { id: "camera", name: "Camera", path: "M4 7H7.5L9 5H15L16.5 7H20A2 2 0 0122 9V17A2 2 0 0120 19H4A2 2 0 012 17V9A2 2 0 014 7ZM12 9.5A3.5 3.5 0 1012 16.5A3.5 3.5 0 1012 9.5Z" },
  { id: "bag", name: "Shopping bag", path: "M5 8H19L18 20H6L5 8ZM8 8V6A4 4 0 0116 6V8" },
  { id: "tag", name: "Tag", path: "M20 4H11L3 12L12 21L20 13V4ZM16 8A1.5 1.5 0 1116 11A1.5 1.5 0 0116 8Z" },
  { id: "info", name: "Info", path: "M12 2A10 10 0 1012 22A10 10 0 0012 2ZM12 7A1.5 1.5 0 1112 10A1.5 1.5 0 0112 7ZM11 12H13V17H11V12Z" },
  { id: "question", name: "Question", path: "M12 2A10 10 0 1012 22A10 10 0 0012 2ZM12 16.5A1.5 1.5 0 1112 19.5A1.5 1.5 0 0112 16.5ZM9 8C9 6 10.5 5 12 5C13.8 5 15 6.2 15 8C15 9.5 13.8 10.2 13 11C12.6 11.4 12.5 11.8 12.5 12.5H10.5C10.5 11.2 11 10.7 11.6 10.2C12.2 9.7 13 9.3 13 8C13 7.3 12.6 7 12 7C11.4 7 11 7.4 11 8H9Z" },
  { id: "calendar", name: "Calendar", path: "M7 3V5H5A2 2 0 003 7V19A2 2 0 005 21H19A2 2 0 0021 19V7A2 2 0 0019 5H17V3H15V5H9V3H7ZM5 9H19V19H5V9Z" },
  { id: "play", name: "Play", path: "M8 5L19 12L8 19V5Z" },
  { id: "pin", name: "Map pin", path: "M12 2A8 8 0 004 10C4 16 12 22 12 22C12 22 20 16 20 10A8 8 0 0012 2ZM12 13A3 3 0 1112 7A3 3 0 0112 13Z" },
  { id: "sparkle", name: "Sparkle", path: "M12 2L13.8 9.2L21 11L13.8 12.8L12 20L10.2 12.8L3 11L10.2 9.2Z" },
  { id: "mail", name: "Mail", path: "M3 5H21A1 1 0 0122 6V18A1 1 0 0121 19H3A1 1 0 012 18V6A1 1 0 013 5ZM4 7L12 13L20 7" },
  { id: "link", name: "Link", path: "M3 12a4 4 0 014-4h4v2H7a2 2 0 000 4h4v2H7a4 4 0 01-4-4zm10-4h4a4 4 0 010 8h-4v-2h4a2 2 0 000-4h-4V8zm-5 3h8v2H8v-2z" },
  { id: "home", name: "Home", path: "M12 3L2 12H5V21H10V14H14V21H19V12H22L12 3Z" },
  { id: "gift", name: "Gift", path: "M3 8h8v4H3V8zm10 0h8v4h-8V8zM4 13h7v9H4v-9zm9 0h7v9h-7v-9zM12 2c-2 0-3.5 1.5-3.5 3.5 0 1.5 1.5 2.5 3.5 2.5V2zm0 0c2 0 3.5 1.5 3.5 3.5 0 1.5-1.5 2.5-3.5 2.5V2z" },
];

export type CoverFormat = "square" | "story";

export interface CoverLayout {
  width: number;
  height: number;
  cx: number;
  cy: number;
  circleR: number;
  iconSize: number;
}

/**
 * Canvas layout for a cover. Square is a 1080x1080 PNG (the circle fills it);
 * story is a 1080x1920 frame with the same centred circle, so the icon stays
 * inside the middle ~60% that Instagram keeps.
 */
export function coverLayout(format: CoverFormat): CoverLayout {
  const circleR = COVER_SIZE / 2;
  const iconSize = Math.round(circleR * 0.8);
  if (format === "story") {
    return { width: COVER_SIZE, height: 1920, cx: 540, cy: 960, circleR, iconSize };
  }
  return { width: COVER_SIZE, height: COVER_SIZE, cx: 540, cy: 540, circleR, iconSize };
}

/** Trim a label and cap it at 12 characters. */
export function clampText(label: string): string {
  return label.trim().slice(0, 12);
}
