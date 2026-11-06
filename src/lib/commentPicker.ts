// Pure helpers for the free Instagram comment picker tool.
// No DB, no Next.js, no network: comments are pasted by the user and stay in the browser.

import { matchComment } from './match.ts';

export type CommentEntry = {
  /** Instagram username without the @, or null for a plain line with no recognisable username. */
  username: string | null;
  text: string;
  /** The original pasted line (trimmed). */
  line: string;
};

export type PickerOptions = {
  /** Keep only comments that contain this word or phrase (case-insensitive, whole words). */
  keyword?: string;
  /** Keep only the first comment from each username. */
  dedupe?: boolean;
  /** Keep only comments that tag at least this many @accounts. */
  minMentions?: number;
};

// Instagram usernames: letters, numbers, periods and underscores, up to 30 characters.
const HANDLE = /^@?([A-Za-z0-9._]{1,30})$/;
const COLON_FORM = /^@?([A-Za-z0-9._]{1,30})\s*:\s*(.*)$/;
const AT_FORM = /^@([A-Za-z0-9._]{1,30})(?:\s+(.*))?$/;
const PLAIN_USER_FORM = /^([A-Za-z0-9._]{1,30})\s+(.+)$/;

function cleanHandle(name: string): string {
  return name.replace(/\.+$/, '').toLowerCase();
}

/** Parse one pasted line. Returns null for empty lines. */
export function parseLine(raw: string): CommentEntry | null {
  const line = String(raw ?? '').trim();
  if (!line) return null;

  // "@user: comment" or "user: comment"
  const colon = COLON_FORM.exec(line);
  if (colon && cleanHandle(colon[1])) {
    return { username: cleanHandle(colon[1]), text: colon[2].trim(), line };
  }
  // "@user comment" or a bare "@user"
  const at = AT_FORM.exec(line);
  if (at && cleanHandle(at[1])) {
    return { username: cleanHandle(at[1]), text: (at[2] ?? '').trim(), line };
  }
  // "user comment": first word looks like a handle and there is text after it.
  // Lines whose first word cannot be a handle (emoji, punctuation) stay plain.
  const plain = PLAIN_USER_FORM.exec(line);
  if (plain && HANDLE.test(plain[1]) && cleanHandle(plain[1])) {
    return { username: cleanHandle(plain[1]), text: plain[2].trim(), line };
  }
  return { username: null, text: line, line };
}

/** Split pasted text into comment entries, one per non-empty line. */
export function parseComments(text: string): CommentEntry[] {
  const out: CommentEntry[] = [];
  for (const raw of String(text ?? '').split(/\r?\n/)) {
    const entry = parseLine(raw);
    if (entry) out.push(entry);
  }
  return out;
}

/** Count tagged accounts (@name) in a comment's text. */
export function countMentions(text: string): number {
  return (String(text ?? '').match(/@\w+/g) ?? []).length;
}

/** Apply keyword, minimum-mention and one-entry-per-person filters, keeping paste order. */
export function filterEntries(entries: CommentEntry[], options: PickerOptions = {}): CommentEntry[] {
  const keyword = (options.keyword ?? '').trim();
  const minMentions = Math.max(0, Math.floor(Number(options.minMentions) || 0));
  const rule = { id: 'picker', keywords: [keyword], match_type: 'contains' as const, status: 'active' as const };
  const seen = new Set<string>();
  const out: CommentEntry[] = [];
  for (const entry of entries) {
    if (keyword && !matchComment(entry.text, [rule])) continue;
    if (minMentions > 0 && countMentions(entry.text) < minMentions) continue;
    if (options.dedupe) {
      // Plain lines have no username, so they are deduped by their exact text.
      const key = entry.username ? `u:${entry.username}` : `l:${entry.line.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
    }
    out.push(entry);
  }
  return out;
}

/**
 * Pick up to `count` unique winners with a Fisher-Yates shuffle.
 * `rng` must return a number in [0, 1); pass a seeded function for repeatable results.
 */
export function pickWinners<T>(entries: T[], count: number, rng: () => number = Math.random): T[] {
  const pool = entries.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const r = Math.min(Math.max(rng(), 0), 0.999999999);
    const j = Math.floor(r * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const n = Math.max(0, Math.min(Math.floor(Number(count) || 0), pool.length));
  return pool.slice(0, n);
}
