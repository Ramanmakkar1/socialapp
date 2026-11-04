export type CropRect = { x: number; y: number; w: number; h: number };

export type IgFormat = {
  id: string;
  label: string;
  width: number;
  height: number;
  ratio: number;
  note: string;
  /** Show circular clip in the preview (profile photo). */
  circlePreview?: boolean;
  /** Omit from the interactive crop tool (informational only). */
  infoOnly?: boolean;
};

/** Centered crop that matches `ratio` (width ÷ height). */
export function cropRect(srcW: number, srcH: number, ratio: number): CropRect {
  if (srcW <= 0 || srcH <= 0 || ratio <= 0) {
    return { x: 0, y: 0, w: Math.max(0, srcW), h: Math.max(0, srcH) };
  }
  const srcRatio = srcW / srcH;
  if (srcRatio > ratio) {
    const h = srcH;
    const w = h * ratio;
    return { x: (srcW - w) / 2, y: 0, w, h };
  }
  const w = srcW;
  const h = w / ratio;
  return { x: 0, y: (srcH - h) / 2, w, h };
}

export const IG_FORMATS: IgFormat[] = [
  {
    id: "feed-square",
    label: "Feed post (square)",
    width: 1080,
    height: 1080,
    ratio: 1,
    note: "Classic 1:1 grid tile; still works everywhere but uses less vertical feed space than portrait.",
  },
  {
    id: "feed-portrait",
    label: "Feed post (portrait)",
    width: 1080,
    height: 1350,
    ratio: 1080 / 1350,
    note: "4:5 portrait — taller in the feed than square; good default for photos and product shots.",
  },
  {
    id: "feed-tall",
    label: "Feed post (tall portrait)",
    width: 1080,
    height: 1440,
    ratio: 1080 / 1440,
    note: "3:4 — newer tall grid size on Instagram; maximum vertical presence in the home feed.",
  },
  {
    id: "landscape",
    label: "Feed post (landscape)",
    width: 1080,
    height: 566,
    ratio: 1080 / 566,
    note: "About 1.91:1 — widest feed format; useful for banners and group shots.",
  },
  {
    id: "story-reel",
    label: "Story / Reel cover",
    width: 1080,
    height: 1920,
    ratio: 1080 / 1920,
    note: "9:16 full screen. Keep important text and logos out of the top and bottom ~250 px (UI overlays).",
  },
  {
    id: "profile",
    label: "Profile photo",
    width: 320,
    height: 320,
    ratio: 1,
    note: "Displayed as a circle on your profile — keep faces and logos centered.",
    circlePreview: true,
  },
  {
    id: "carousel",
    label: "Carousel",
    width: 1080,
    height: 1350,
    ratio: 1080 / 1350,
    note: "Every slide must use the same aspect ratio as the first slide (pick one size and stick with it).",
    infoOnly: true,
  },
];

export const CROP_FORMATS = IG_FORMATS.filter((f) => !f.infoOnly);

/** Safe-zone inset from top/bottom for 9:16 (Story/Reel), in output pixels at 1080×1920. */
export const STORY_SAFE_ZONE_PX = 250;

export function formatById(id: string): IgFormat | undefined {
  return IG_FORMATS.find((f) => f.id === id);
}
