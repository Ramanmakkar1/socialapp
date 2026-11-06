/** Clamp a value to the inclusive [min, max] range. */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

type CropFocusInput =
  | number
  | {
      x?: number;
      y?: number;
      focusX?: number;
      focusY?: number;
      focalX?: number;
      focalY?: number;
      horizontal?: number;
      vertical?: number;
    };

function focusFromInput(
  input: CropFocusInput | undefined,
  fallbackX: number,
  fallbackY: number,
): { x: number; y: number } {
  if (input === undefined || input === null) {
    return { x: fallbackX, y: fallbackY };
  }
  if (typeof input === "number") {
    // A single number applies to the horizontal axis; vertical keeps fallback.
    return { x: input, y: fallbackY };
  }
  const o = input;
  const x =
    o.focusX ?? o.focalX ?? o.x ?? o.horizontal ?? fallbackX;
  const y =
    o.focusY ?? o.focalY ?? o.y ?? o.vertical ?? fallbackY;
  return { x, y };
}

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

/** Crop that matches `ratio` (width ÷ height), optionally focused on a normalized point (0..1). */
export function cropRect(
  srcW: number,
  srcH: number,
  ratio: number,
  focusX?: CropFocusInput,
  focusY?: number,
): CropRect {
  if (srcW <= 0 || srcH <= 0 || ratio <= 0) {
    return { x: 0, y: 0, w: Math.max(0, srcW), h: Math.max(0, srcH) };
  }

  let fx: unknown;
  let fy: unknown;
  if (typeof focusX === "object" && focusX !== null) {
    const resolved = focusFromInput(focusX, 0.5, 0.5);
    fx = resolved.x;
    fy = resolved.y;
  } else if (typeof focusX === "number") {
    fx = focusX;
    fy = focusY === undefined ? 0.5 : focusY;
  } else if (focusX === undefined) {
    fx = 0.5;
    fy = focusY === undefined ? 0.5 : focusY;
  } else {
    fx = focusX;
    fy = focusY === undefined ? 0.5 : focusY;
  }

  const clampFocus = (v: unknown): number => {
    const n = Number(v);
    if (!Number.isFinite(n)) return 0.5;
    return clamp(n, 0, 1);
  };
  const fxn = clampFocus(fx);
  const fyn = clampFocus(fy);

  const srcRatio = srcW / srcH;
  if (srcRatio > ratio) {
    const h = srcH;
    const w = h * ratio;
    const slack = Math.max(0, srcW - w);
    const x = clamp(slack * fxn, 0, slack);
    return { x, y: 0, w, h };
  }
  if (srcRatio < ratio) {
    const w = srcW;
    const h = w / ratio;
    const slack = Math.max(0, srcH - h);
    const y = clamp(slack * fyn, 0, slack);
    return { x: 0, y, w, h };
  }
  return { x: 0, y: 0, w: srcW, h: srcH };
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