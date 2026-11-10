// Client-safe analytics helpers (types + CSV export). No database imports here, so client components can use it.

export type PostPerformanceRow = {
  id: string;
  caption: string;
  publishedAt: string | null;
  platforms: string[];
  reach: number | null;
  impressions: number | null;
  likes: number | null;
  comments: number | null;
  saved: number | null;
  linkClicks: number;
};

export const PERFORMANCE_CSV_HEADERS = [
  "Post",
  "Published (UTC)",
  "Platforms",
  "Reach",
  "Impressions",
  "Likes",
  "Comments",
  "Saves",
  "Link clicks",
];

export function performanceCsvRows(rows: PostPerformanceRow[]): (string | number | null)[][] {
  return rows.map((r) => [
    r.caption,
    r.publishedAt ?? "",
    r.platforms.join(" "),
    r.reach,
    r.impressions,
    r.likes,
    r.comments,
    r.saved,
    r.linkClicks,
  ]);
}

// RFC 4180 CSV: quotes fields containing commas/quotes/newlines, CRLF line endings.
export function toCsv(headers: string[], rows: (string | number | null)[][]): string {
  const esc = (v: string | number | null): string => {
    if (v == null) return "";
    const s = String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(esc).join(",")];
  for (const row of rows) lines.push(row.map(esc).join(","));
  return lines.join("\r\n");
}
