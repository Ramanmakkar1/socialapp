export const LINKEDIN_LIMITS = {
  post: 3000,
  comment: 1250,
  headline: 220,
  about: 2600,
  article_headline: 150,
} as const;

export type LinkedInField = keyof typeof LINKEDIN_LIMITS;

export function countLinkedIn(text: string) {
  const characters = [...text];
  const chars = characters.length;
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/u).length : 0;
  const lines = text ? text.split(/\r\n|\r|\n/).length : 0;

  let thirdLineEnd = chars;
  let line = 1;
  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    if (character !== "\n" && character !== "\r") continue;
    const lineEnd = index;
    if (character === "\r" && characters[index + 1] === "\n") index += 1;
    line += 1;
    if (line === 4) {
      thirdLineEnd = lineEnd;
      break;
    }
  }

  return {
    chars,
    words,
    lines,
    seeMoreCut: Math.min(210, thirdLineEnd),
    overLimit: {
      post: chars > LINKEDIN_LIMITS.post,
      comment: chars > LINKEDIN_LIMITS.comment,
      headline: chars > LINKEDIN_LIMITS.headline,
      about: chars > LINKEDIN_LIMITS.about,
      article_headline: chars > LINKEDIN_LIMITS.article_headline,
    },
  };
}
