export const FB_LIMITS = {
  post: 63206,
  seeMore: 477,
  adPrimaryVisible: 125,
  adHeadline: 40,
  pageBio: 255,
  comment: 8000,
} as const;

export type FacebookField = "post" | "comment" | "ad" | "adHeadline" | "pageBio";

const FIELD_LIMITS: Record<FacebookField, number> = {
  post: FB_LIMITS.post,
  comment: FB_LIMITS.comment,
  ad: FB_LIMITS.adPrimaryVisible,
  adHeadline: FB_LIMITS.adHeadline,
  pageBio: FB_LIMITS.pageBio,
};

export function countFacebook(text: string, field: FacebookField) {
  const characters = Array.from(text);
  const chars = characters.length;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/u).length : 0;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;

  let fifthLineEnd = chars;
  let line = 1;
  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    if (character !== "\n" && character !== "\r") continue;
    const lineEnd = index;
    if (character === "\r" && characters[index + 1] === "\n") index += 1;
    line += 1;
    if (line === 6) {
      fifthLineEnd = lineEnd;
      break;
    }
  }

  const previewCut = field === "post"
    ? Math.min(FB_LIMITS.seeMore, fifthLineEnd)
    : field === "ad"
      ? Math.min(FB_LIMITS.adPrimaryVisible, chars)
      : chars;
  const limit = FIELD_LIMITS[field];

  return {
    chars,
    words,
    lines,
    remaining: limit - chars,
    over: chars > limit,
    preview: characters.slice(0, previewCut).join(""),
  };
}
