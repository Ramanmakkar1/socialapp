export const BLUESKY_POST_MAX = 300;

export function countBluesky(text: string) {
  // Bluesky counts the full text of typed links (it does not shorten URLs like X).
  // Image alt text is limited to 2,000 characters per image, with up to 4 images per post.
  const count = typeof Intl !== "undefined" && "Segmenter" in Intl
    ? Array.from(new Intl.Segmenter("en", { granularity: "grapheme" }).segment(text)).length
    : Array.from(text).length;
  const remaining = BLUESKY_POST_MAX - count;

  return { count, remaining, over: remaining < 0 };
}
