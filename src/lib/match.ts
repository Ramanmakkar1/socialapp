// Pure comment-to-rule matching and Instagram webhook comment parsing.
// No DB, no Next.js, no network: safe to unit test and reuse anywhere.

export type MatchableRule = {
  id: string;
  keywords: string[];
  match_type: 'contains' | 'exact';
  status: 'active' | 'paused';
};

const DIACRITICS = /[̀-ͯ]/g;
const LEADING_MENTIONS = /^(?:\s*@[\w.]+)+/;
// Built with the constructor so the ES2017 TS target accepts the `u` flag.
const NON_WORD = new RegExp('[^\\p{L}\\p{N}\\p{Extended_Pictographic}\\s]', 'gu');
// Emoji become their own words, without variation selectors / skin tones / joiners,
// so "🔥🔥" matches the keyword "🔥" and "link🔥" still matches "link".
const EMOJI = new RegExp('\\p{Extended_Pictographic}', 'gu');
const EMOJI_MODIFIERS = new RegExp('[\\u{FE0E}\\u{FE0F}\\u{200D}\\u{1F3FB}-\\u{1F3FF}]', 'gu');

export function normalize(text: string): string {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(DIACRITICS, '')
    .replace(LEADING_MENTIONS, ' ')
    .replace(EMOJI_MODIFIERS, '')
    .replace(NON_WORD, ' ')
    .replace(EMOJI, (e) => ` ${e} `)
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchComment<T extends MatchableRule>(
  text: string,
  rules: T[],
): { rule: T; keyword: string } | null {
  const normalized = normalize(text);
  const padded = ' ' + normalized + ' ';
  for (const rule of rules) {
    if (rule.status === 'paused') continue;
    for (const raw of rule.keywords ?? []) {
      const keyword = normalize(raw);
      if (!keyword) continue;
      if (rule.match_type === 'exact') {
        if (normalized === keyword) return { rule, keyword };
      } else if (padded.includes(' ' + keyword + ' ')) {
        return { rule, keyword };
      }
    }
  }
  return null;
}

export type CommentEvent = {
  accountId: string;
  commentId: string;
  mediaId: string | null;
  fromId: string;
  fromUsername: string | null;
  text: string;
};

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(v: unknown): string | null {
  if (typeof v === 'string' && v !== '') return v;
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return null;
}

export function extractComments(payload: unknown): CommentEvent[] {
  const out: CommentEvent[] = [];
  try {
    if (!isObject(payload) || !Array.isArray(payload.entry)) return out;
    for (const entry of payload.entry) {
      if (!isObject(entry) || !Array.isArray(entry.changes)) continue;
      const accountId = str(entry.id);
      if (!accountId) continue;
      for (const change of entry.changes) {
        if (!isObject(change) || change.field !== 'comments') continue;
        const value = change.value;
        if (!isObject(value) || !isObject(value.from)) continue;
        const commentId = str(value.id);
        const fromId = str(value.from.id);
        const text = typeof value.text === 'string' ? value.text : null;
        if (!commentId || !fromId || text === null) continue;
        if (fromId === accountId) continue; // the account itself: avoid DM loops
        const username = value.from.username;
        out.push({
          accountId,
          commentId,
          mediaId: isObject(value.media) ? str(value.media.id) : null,
          fromId,
          fromUsername: typeof username === 'string' && username ? username : null,
          text,
        });
      }
    }
  } catch {
    // Never throw on hostile input; return what was parsed so far.
  }
  return out;
}
