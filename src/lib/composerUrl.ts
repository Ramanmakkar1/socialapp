// Pure helpers for opening the post composer from the URL (?compose=1&day=YYYY-MM-DD or ?draft=<id>).

export function composerOpenFromParams(params: URLSearchParams): boolean {
  return params.has("compose") || params.has("draft");
}

/** The same URL without the composer params, so closing the window doesn't reopen it on refresh. */
export function hrefWithoutComposer(pathname: string, params: URLSearchParams): string {
  const next = new URLSearchParams(params.toString());
  next.delete("compose");
  next.delete("draft");
  next.delete("day");
  next.delete("at");
  const q = next.toString();
  return q ? `${pathname}?${q}` : pathname;
}

/**
 * Start time for a post created from a calendar day: 9:00 local on that day, or the next
 * full hour when that is already past (e.g. clicking "+" on today in the afternoon).
 * Returns null for a malformed day.
 */
export function dayPrefill(day: string | null, now = new Date()): Date | null {
  if (!day || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const [y, m, d] = day.split("-").map(Number);
  const at = new Date(y, m - 1, d, 9, 0, 0, 0);
  if (Number.isNaN(at.getTime()) || at.getMonth() !== m - 1) return null;
  if (at.getTime() > now.getTime()) return at;
  const next = new Date(now);
  next.setMinutes(0, 0, 0);
  next.setHours(next.getHours() + 1);
  // A past day (not today) has no sensible slot: use the next full hour from now.
  return next;
}

/**
 * Start time for a post created from an empty week-grid slot (?compose=1&at=<ISO instant>).
 * Null for a malformed or past instant, so the caller falls back to `day` / the default.
 */
export function slotPrefill(at: string | null, now = new Date()): Date | null {
  if (!at || at.length > 40 || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(at)) return null;
  const d = new Date(at);
  if (Number.isNaN(d.getTime()) || d.getTime() <= now.getTime()) return null;
  return d;
}
