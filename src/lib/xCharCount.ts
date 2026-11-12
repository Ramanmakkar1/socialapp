export const X_LIMIT = 280;
export const X_PREMIUM_LIMIT = 25000;

const URL_RE = /https?:\/\/[^\s]+|(?:[\p{L}\p{N}](?:[\p{L}\p{N}-]{0,61}[\p{L}\p{N}])?\.)+[\p{L}]{2,63}(?::\d{1,5})?(?:[/?#][^\s]*)?/giu;
const HASHTAG_RE = /(^|\s)#[\p{L}\p{N}_]+/gu;
const MENTION_RE = /(^|\s)@\w{1,15}/g;
const EMOJI_RE = /\p{Extended_Pictographic}/u;
const LIGHT_RANGES: [number, number][] = [
  [0x0000, 0x10ff],
  [0x2000, 0x200d],
  [0x2010, 0x201f],
  [0x2032, 0x2037],
];

/** X's twitter-text v3 weighting: https://docs.x.com/resources/fundamentals/counting-characters */
export function countX(text: string): {
  weighted: number;
  remaining: number;
  urls: number;
  hashtags: number;
  mentions: number;
  overBy: number;
} {
  const urls = text.match(URL_RE)?.length ?? 0;
  const withoutUrls = text.replace(URL_RE, "");
  let weighted = urls * 23;

  for (const { segment } of new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(withoutUrls)) {
    if (EMOJI_RE.test(segment)) {
      weighted += 2;
      continue;
    }
    for (const character of segment) {
      const codePoint = character.codePointAt(0) ?? 0;
      weighted += LIGHT_RANGES.some(([start, end]) => codePoint >= start && codePoint <= end) ? 1 : 2;
    }
  }

  return {
    weighted,
    remaining: X_LIMIT - weighted,
    urls,
    hashtags: [...text.matchAll(HASHTAG_RE)].length,
    mentions: [...text.matchAll(MENTION_RE)].length,
    overBy: Math.max(0, weighted - X_LIMIT),
  };
}
