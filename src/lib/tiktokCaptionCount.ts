export const TIKTOK_CAPTION_LIMIT = 4000;
export const TIKTOK_PREVIEW_CHARS = 100;

const HASHTAG_RE = /#[\p{L}\p{N}_]+/gu;
const MENTION_RE = /@[\p{L}\p{N}_.]+/gu;

export function countTikTokCaption(text: string): {
  chars: number;
  hashtags: string[];
  mentions: string[];
  remaining: number;
  over: boolean;
  preview: string;
} {
  const characters = Array.from(text);
  const chars = characters.length;

  return {
    chars,
    hashtags: [...new Set(text.match(HASHTAG_RE) ?? [])],
    mentions: [...new Set(text.match(MENTION_RE) ?? [])],
    remaining: TIKTOK_CAPTION_LIMIT - chars,
    over: chars > TIKTOK_CAPTION_LIMIT,
    preview: characters.slice(0, TIKTOK_PREVIEW_CHARS).join(""),
  };
}
