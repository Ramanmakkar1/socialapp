// Pure CTR helpers (safe to import from client components).

/** Click-through rate in whole percent from unique clicks, capped at 100; null when nothing was sent. */
export function ctrPercent(uniqueClicks: number, sent: number): number | null {
  if (!sent || sent <= 0) return null;
  return Math.min(100, Math.round((Math.max(0, uniqueClicks) / sent) * 100));
}

/** CTR label for tables: "42%" or "–" when nothing was sent. */
export function formatCtr(uniqueClicks: number, sent: number): string {
  const pct = ctrPercent(uniqueClicks, sent);
  return pct === null ? "–" : `${pct}%`;
}
