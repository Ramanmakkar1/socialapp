// Pure helpers shared by the admin list pages: query-string parsing, keyset-free pagination
// (LIMIT n+1 tells us whether a next page exists, so no count(*) over big tables) and safe
// ILIKE patterns. No DB access here, so everything is unit-tested in adminPaging.test.ts.

export const ADMIN_PAGE_SIZE = 25;
/** Deep pages are never useful in an admin list and make OFFSET scans expensive. */
export const MAX_ADMIN_PAGE = 200;

export type SearchParams = Record<string, string | string[] | undefined>;

/** First value of a query-string parameter, trimmed ("" when missing). */
export function param(sp: SearchParams, name: string): string {
  const v = sp[name];
  const s = Array.isArray(v) ? v[0] : v;
  return typeof s === "string" ? s.trim() : "";
}

/** 1-based page number from ?page=, clamped to 1..MAX_ADMIN_PAGE. Junk becomes 1. */
export function parsePage(raw: string | undefined | null): number {
  const n = Number.parseInt(String(raw ?? ""), 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return Math.min(n, MAX_ADMIN_PAGE);
}

/** LIMIT/OFFSET for a page; LIMIT is one more than the page size to detect a next page. */
export function pageWindow(page: number, size = ADMIN_PAGE_SIZE): { limit: number; offset: number } {
  return { limit: size + 1, offset: (Math.max(1, page) - 1) * size };
}

/** Trims the extra look-ahead row off a LIMIT n+1 result. */
export function pageSlice<T>(rows: T[], size = ADMIN_PAGE_SIZE): { rows: T[]; hasNext: boolean } {
  return { rows: rows.slice(0, size), hasNext: rows.length > size };
}

/** The value when it is one of `allowed`, otherwise "" (no filter). */
export function pickOne<T extends string>(value: string, allowed: readonly T[]): T | "" {
  return (allowed as readonly string[]).includes(value) ? (value as T) : "";
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

/**
 * An ILIKE "contains" pattern for user input, or null when there is nothing to search.
 * %, _ and \ are escaped (Postgres' default LIKE escape is \), a leading @ is dropped so
 * "@handle" finds the username "handle", and input is capped at 100 characters.
 */
export function containsPattern(input: string): string | null {
  const q = input.trim().replace(/^@+/, "").slice(0, 100);
  if (!q) return null;
  return `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/** Builds an admin list URL keeping only non-empty params (page 1 is left out). */
export function listHref(path: string, params: Record<string, string | number | undefined | null>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    if (k === "page" && Number(v) <= 1) continue;
    qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}
