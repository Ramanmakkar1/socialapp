import { TOKEN_PLATFORMS } from "@/lib/networks/tokenNetworks";

export const PLATFORMS = {
  instagram: {
    label: "Instagram",
    captionMax: 2200,
    hashtagMax: 30,
    mentionMax: 20,
  },
  facebook: {
    label: "Facebook",
    captionMax: 63206,
  },
  threads: {
    label: "Threads",
    captionMax: 500,
    hashtagMax: 1,
  },
  youtube: {
    label: "YouTube",
    captionMax: 5000,
  },
  tiktok: {
    // Content Posting API: post_info.title is max 2200 UTF-16 runes.
    label: "TikTok",
    captionMax: 2200,
  },
  bluesky: {
    // app.bsky.feed.post text: max 300 graphemes.
    label: "Bluesky",
    captionMax: 300,
    counter: "graphemes",
  },
  mastodon: {
    // 500 is the Mastodon default; instances can raise it (read per account from /api/v2/instance).
    label: "Mastodon",
    captionMax: 500,
  },
  linkedin: {
    // Posts API commentary: max 3000 characters.
    label: "LinkedIn",
    captionMax: 3000,
  },
  pinterest: {
    // Pin description: max 500 characters (the 100-character title is a separate field).
    label: "Pinterest",
    captionMax: 500,
  },
  gbp: {
    // Google Business Profile local post summary: max 1,500 characters.
    label: "Google Business Profile",
    captionMax: 1500,
  },
  ig_personal: {
    // Reminder channel: the user pastes the caption into Instagram (same 2,200 limit).
    label: "Instagram (personal)",
    captionMax: 2200,
    hashtagMax: 30,
  },
  fb_group: {
    // Reminder channel: the user posts it to the group themselves.
    label: "Facebook Group",
    captionMax: 63206,
  },
  x: {
    // 280 weighted characters (links count as 23, most CJK and emoji count as 2).
    label: "X",
    captionMax: 280,
    counter: "x",
  },
  // Telegram, Discord, Matrix, WordPress, ... (src/lib/networks/tokenNetworks.ts).
  ...TOKEN_PLATFORMS,
} as const;

export type PlatformId = keyof typeof PLATFORMS;

/** Every platform id, in the order the composer shows them. */
export const PLATFORM_IDS = Object.keys(PLATFORMS) as PlatformId[];

const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;
const MENTION_RE = /@[\w.]+/g;
const URL_RE = /https?:\/\/[^\s]+/gi;

function graphemeCount(text: string): number {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(text)).length;
  }
  return Array.from(text).length;
}

// twitter-text v3 weighting: these code point ranges weigh 1, everything else 2.
const X_LIGHT_RANGES: [number, number][] = [
  [0, 4351],
  [8192, 8205],
  [8208, 8223],
  [8242, 8247],
];

/**
 * X's weighted length: every link counts as 23, an emoji (one grapheme with an emoji code point)
 * counts as 2, Latin text counts 1 per character and most other scripts 2.
 */
export function xWeightedLength(text: string): number {
  let total = 0;
  const withoutUrls = text.replace(URL_RE, () => {
    total += 23;
    return "";
  });
  const segments =
    typeof Intl !== "undefined" && "Segmenter" in Intl
      ? Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(withoutUrls), (s) => s.segment)
      : Array.from(withoutUrls);
  for (const g of segments) {
    if (/\p{Extended_Pictographic}/u.test(g)) {
      total += 2;
      continue;
    }
    for (const ch of g) {
      const cp = ch.codePointAt(0) ?? 0;
      total += X_LIGHT_RANGES.some(([a, b]) => cp >= a && cp <= b) ? 1 : 2;
    }
  }
  return total;
}

/** The length a network counts for this text. */
export function captionLength(platform: PlatformId, text: string): number {
  const config = PLATFORMS[platform];
  if ("counter" in config) {
    if (config.counter === "graphemes") return graphemeCount(text);
    if (config.counter === "x") return xWeightedLength(text);
  }
  return text.length;
}

export type CaptionCheck = {
  length: number;
  /** The limit used (the platform default, or an account-specific one such as a Mastodon instance's). */
  max: number;
  hashtags: number;
  mentions: number;
  errors: string[];
  warnings: string[];
};

export function checkCaption(platform: PlatformId, text: string, maxOverride?: number | null): CaptionCheck {
  const config = PLATFORMS[platform];
  const max = typeof maxOverride === "number" && maxOverride > 0 ? maxOverride : config.captionMax;
  const length = captionLength(platform, text);
  const hashtags = [...text.matchAll(HASHTAG_RE)].length;
  const mentions = [...text.matchAll(MENTION_RE)].length;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (length > max) {
    errors.push(
      `${(length - max).toLocaleString("en-US")} characters over the ${config.label} limit of ${max.toLocaleString("en-US")}.`,
    );
  }
  if ("hashtagMax" in config && hashtags > config.hashtagMax) {
    errors.push(`${hashtags - config.hashtagMax} hashtags over the limit of ${config.hashtagMax}.`);
  }
  if ("mentionMax" in config && mentions > config.mentionMax) {
    errors.push(`${mentions - config.mentionMax} mentions over the limit of ${config.mentionMax}.`);
  }

  if (platform === "instagram") {
    const firstLine = text.slice(0, 125).split(/\r?\n/)[0] ?? "";
    if (firstLine.trim() === "") {
      warnings.push('The first line is empty — add a hook before Instagram’s “more” cutoff.');
    }
  }

  return { length, max, hashtags, mentions, errors, warnings };
}
