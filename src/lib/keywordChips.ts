export const MAX_KEYWORD_CHIPS = 20;
export const ANY_COMMENT_KEYWORD = "*";

/** Parse comma/Enter-delimited keyword chips, ignoring blanks and duplicate spelling. */
export function parseKeywordChips(raw: string, limit = MAX_KEYWORD_CHIPS): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const part of raw.split(/[,，\n\r]+/)) {
    const keyword = part.trim();
    if (!keyword) continue;
    const key = keyword.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(keyword);
    if (out.length >= limit) break;
  }
  return out;
}
