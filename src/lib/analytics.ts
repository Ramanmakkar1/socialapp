// Server-only analytics queries + pure helpers (CSV export, growth series) for the analytics page and report.
import { isDbConfigured, query } from "@/lib/db";

export const RANGE_OPTIONS = [7, 30, 90] as const;

// Date-range picker value → days. Anything else falls back to 30.
export function parseRangeDays(value: string | null | undefined): number {
  if (value == null) return 30;
  const n = Number(value);
  if (Number.isInteger(n) && (RANGE_OPTIONS as readonly number[]).includes(n)) return n;
  return 30;
}

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

// Per-post metrics (Instagram insights + link clicks) for the last `days` days.
// Tolerates missing columns/tables: returns [] on any query error.
export async function getPostPerformance(userId: string, days: number): Promise<PostPerformanceRow[]> {
  if (!isDbConfigured()) return [];
  try {
    return await query<PostPerformanceRow>(
      `with rp as (
        select p.id, p.caption, p.dm_rule_id,
          max(t.published_at) as published_ts,
          array_agg(distinct t.platform) as platforms,
          (select t2.insights from socialapp.post_targets t2
           where t2.post_id = p.id and t2.platform = 'instagram' and t2.status = 'published'
           limit 1) as insights
        from socialapp.scheduled_posts p
        join socialapp.post_targets t on t.post_id = p.id
        where p.user_id = $1
          and t.status = 'published'
          and t.published_at > now() - make_interval(days => $2)
        group by p.id
        )
        select rp.id, rp.caption,
          to_json(rp.published_ts) #>> '{}' as "publishedAt",
          rp.platforms,
          (rp.insights->>'reach')::int as reach,
          (rp.insights->>'impressions')::int as impressions,
          (rp.insights->>'likes')::int as likes,
          (rp.insights->>'comments')::int as comments,
          (rp.insights->>'saved')::int as saved,
          coalesce((select count(*)::int from socialapp.link_clicks c
            join socialapp.short_links s on s.code = c.code
            where s.user_id = $1 and s.rule_id = rp.dm_rule_id
              and c.clicked_at >= rp.published_ts), 0) as "linkClicks"
        from rp
        order by rp.published_ts desc
        limit 200`,
      [userId, days]
    );
  } catch {
    return [];
  }
}

export type GrowthSnapshotRow = { day: string; account: string; followers: number };

// Latest follower snapshot per account per day (UTC) in the last `days` days.
export async function getGrowthSnapshots(userId: string, days: number): Promise<GrowthSnapshotRow[]> {
  if (!isDbConfigured()) return [];
  try {
    return await query<GrowthSnapshotRow>(
      `select to_char((taken_at at time zone 'UTC')::date, 'YYYY-MM-DD') as day,
        account_id::text as account,
        max(followers)::int as followers
       from socialapp.account_snapshots
       where user_id = $1
         and (taken_at at time zone 'UTC')::date >= (now() at time zone 'UTC')::date - ($2 - 1)
       group by 1, 2
       order by 1, 2`,
      [userId, days]
    );
  } catch {
    return [];
  }
}

export type GrowthDay = { day: string; followers: number };

// Pure: forward-fill each account's latest snapshot and sum across accounts, one row per day.
// `rows` must be sorted by day asc within each account (the query guarantees this).
export function buildGrowthSeries(today: string, days: number, rows: GrowthSnapshotRow[]): GrowthDay[] {
  const base = new Date(`${today}T00:00:00Z`);
  if (Number.isNaN(base.getTime())) return [];
  const dayList: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    dayList.push(new Date(base.getTime() - i * 86400000).toISOString().slice(0, 10));
  }
  const byAccount = new Map<string, GrowthSnapshotRow[]>();
  for (const row of rows) {
    const list = byAccount.get(row.account) ?? [];
    list.push(row);
    byAccount.set(row.account, list);
  }
  return dayList.map((day) => {
    let total = 0;
    for (const list of byAccount.values()) {
      let latest: number | null = null;
      for (const row of list) {
        if (row.day <= day) latest = row.followers;
        else break;
      }
      if (latest != null) total += latest;
    }
    return { day, followers: total };
  });
}

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
