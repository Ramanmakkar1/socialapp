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
} as const;

export type PlatformId = keyof typeof PLATFORMS;

const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;
const MENTION_RE = /@[\w.]+/g;

export type CaptionCheck = {
  length: number;
  hashtags: number;
  mentions: number;
  errors: string[];
  warnings: string[];
};

export function checkCaption(platform: PlatformId, text: string): CaptionCheck {
  const config = PLATFORMS[platform];
  const length = text.length;
  const hashtags = [...text.matchAll(HASHTAG_RE)].length;
  const mentions = [...text.matchAll(MENTION_RE)].length;
  const errors: string[] = [];
  const warnings: string[] = [];

  if (length > config.captionMax) {
    errors.push(
      `${(length - config.captionMax).toLocaleString("en-US")} characters over the ${config.captionMax.toLocaleString("en-US")} limit.`,
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

  return { length, hashtags, mentions, errors, warnings };
}
