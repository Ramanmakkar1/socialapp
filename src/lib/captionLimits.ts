// Pure caption helpers for the free /tools/instagram-caption-counter page.
// Only limits we can point to a Meta source for are listed. Where Meta does not
// publish a number, the field is left out (null) instead of guessed.

export type Platform = "instagram" | "facebook" | "threads";

export type PlatformLimit = {
  label: string;
  /** Max caption/post length in characters, or null when Meta publishes no number. */
  max: number | null;
  /** Max hashtags per post, or null when not published. */
  hashtags: number | null;
  /** Max @mentions per post, or null when not published. */
  mentions: number | null;
  /** Approximate feed cut-off before "... more". Display estimate, not a Meta rule. */
  foldAt: number | null;
  source: string;
};

export const PLATFORM_LIMITS: Record<Platform, PlatformLimit> = {
  instagram: {
    label: "Instagram",
    // Caption: max 2,200 characters, 30 hashtags and 20 @ tags (IG User Media reference).
    // https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media
    max: 2200,
    hashtags: 30,
    mentions: 20,
    // Feed shows roughly the first 125 characters before "more" (varies by device).
    foldAt: 125,
    source: "https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/ig-user/media",
  },
  facebook: {
    label: "Facebook",
    // Meta's Pages API docs publish no caption length limit, so none is enforced here.
    // https://developers.facebook.com/docs/pages-api/posts
    max: null,
    hashtags: null,
    mentions: null,
    foldAt: null,
    source: "https://developers.facebook.com/docs/pages-api/posts",
  },
  threads: {
    label: "Threads",
    // Threads posts: text is limited to 500 characters.
    // https://developers.facebook.com/docs/threads/posts
    max: 500,
    hashtags: null,
    mentions: null,
    foldAt: null,
    source: "https://developers.facebook.com/docs/threads/posts",
  },
};

export const PLATFORMS = Object.keys(PLATFORM_LIMITS) as Platform[];

export type CaptionAnalysis = {
  chars: number;
  hashtags: string[];
  mentions: string[];
  /** Characters over the max (0 when within the limit or no limit). */
  overBy: number;
  /** Hashtags over the limit (0 when within the limit or no limit). */
  overHashtags: number;
  /** Mentions over the limit (0 when within the limit or no limit). */
  overMentions: number;
  /** Text shown before "... more" in the feed. */
  foldPreview: string;
  /** True when the feed would hide part of the caption. */
  folded: boolean;
};

function graphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/** Counts user-visible characters, so one emoji (even with skin tone or ZWJ) counts as 1. */
export function countChars(text: string): number {
  return graphemes(text).length;
}

// A hashtag must start at the beginning or after a non-word character and must
// contain at least one letter or underscore: "#123" is not counted.
const HASHTAG_RE = /(?:^|[^\p{L}\p{N}_&#])#([\p{L}\p{N}_]*[\p{L}_][\p{L}\p{N}_]*)/gu;
// Instagram usernames: letters, numbers, periods and underscores, up to 30.
// Must not follow a word character, so emails like a@b.com are skipped.
const MENTION_RE = /(?:^|[^\p{L}\p{N}_.@])@([A-Za-z0-9_](?:[A-Za-z0-9._]{0,28}[A-Za-z0-9_])?)/gu;

export function extractHashtags(text: string): string[] {
  return Array.from(text.matchAll(HASHTAG_RE), (m) => `#${m[1]}`);
}

export function extractMentions(text: string): string[] {
  return Array.from(text.matchAll(MENTION_RE), (m) => `@${m[1]}`);
}

/**
 * Feed preview: cut at the fold length, or earlier at the second line break,
 * since the feed shows about two lines before "more".
 */
export function foldCaption(text: string, foldAt: number | null): { preview: string; folded: boolean } {
  if (foldAt === null) return { preview: text, folded: false };
  const parts = graphemes(text);
  let cut = Math.min(foldAt, parts.length);
  let breaks = 0;
  for (let i = 0; i < cut; i++) {
    if (parts[i] === "\n" || parts[i] === "\r\n") {
      breaks++;
      if (breaks === 2) {
        cut = i;
        break;
      }
    }
  }
  if (cut >= parts.length) return { preview: text, folded: false };
  return { preview: parts.slice(0, cut).join("").trimEnd(), folded: true };
}

export function analyzeCaption(text: string, platform: Platform): CaptionAnalysis {
  const limit = PLATFORM_LIMITS[platform];
  const chars = countChars(text);
  const hashtags = extractHashtags(text);
  const mentions = extractMentions(text);
  const { preview, folded } = foldCaption(text, limit.foldAt);
  return {
    chars,
    hashtags,
    mentions,
    overBy: limit.max === null ? 0 : Math.max(0, chars - limit.max),
    overHashtags: limit.hashtags === null ? 0 : Math.max(0, hashtags.length - limit.hashtags),
    overMentions: limit.mentions === null ? 0 : Math.max(0, mentions.length - limit.mentions),
    foldPreview: preview,
    folded,
  };
}
