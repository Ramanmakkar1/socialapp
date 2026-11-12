export const YT_LIMITS = {
  title: 100,
  titleVisible: 70,
  description: 5000,
  descriptionVisible: 157,
  tags: 500,
} as const;

export type YouTubeField = "title" | "description";

export function countYouTube(text: string, field: YouTubeField) {
  const characters = Array.from(text);
  const chars = characters.length;
  const limit = YT_LIMITS[field];
  const visibleLimit = field === "title" ? YT_LIMITS.titleVisible : YT_LIMITS.descriptionVisible;
  const remaining = limit - chars;

  return {
    chars,
    remaining,
    over: remaining < 0,
    visiblePreview: characters.slice(0, visibleLimit).join(""),
  };
}

export function countTags(input: string) {
  const tags = input.split(",").map((tag) => tag.trim()).filter(Boolean);
  const total = tags.reduce((sum, tag) => {
    const quotedLength = /\s/u.test(tag) ? 2 : 0;
    return sum + Array.from(tag).length + quotedLength;
  }, Math.max(0, tags.length - 1));

  return { total, tags, over: total > YT_LIMITS.tags };
}

export function hasInvalidTitleChars(text: string) {
  return /[<>]/u.test(text);
}
