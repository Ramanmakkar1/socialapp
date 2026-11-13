export const PINTEREST_LIMITS = {
  title: { max: 100, shown: 40 },
  description: { max: 500, shown: 50 },
  altText: { max: 500 },
  boardName: { max: 50 },
} as const;

export type PinterestField = keyof typeof PINTEREST_LIMITS;

/**
 * Count a Pinterest text field and return its live result.
 * Characters are counted by code point so an emoji counts as one.
 * `truncatedPreview` is cut at the feed-visible length (when the field has one)
 * and ends with an ellipsis only when the text is longer than that preview.
 */
export function countPinterest(text: string, field: PinterestField) {
  const characters = Array.from(text);
  const count = characters.length;
  const limit = PINTEREST_LIMITS[field] as { max: number; shown?: number };
  const remaining = limit.max - count;
  const over = remaining < 0;
  const truncatedPreview =
    limit.shown === undefined
      ? characters.join("")
      : characters.slice(0, limit.shown).join("") + (count > limit.shown ? "…" : "");

  return { count, remaining, over, truncatedPreview };
}

export { countPinterest as count };
