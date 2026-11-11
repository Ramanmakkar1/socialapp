// Server-only analytics queries + pure helpers (CSV export, growth series) for the analytics page and report.
import { isDbConfigured, query } from "@/lib/db";
import type { PostPerformanceRow } from "@/lib/analyticsCsv";

export const RANGE_OPTIONS = [7, 30, 90] as const;

/** A period as UTC instants: `from` inclusive, `to` exclusive. */
export type DateRange = { from: Date; to: Date };
/** Data functions take a day count ("last N days", as before) or an explicit range. */
export type RangeInput = number | DateRange;

const DAY_MS = 86_400_000;

/** A day count becomes [now - days, now); a range is passed through. */
export function resolveRange(input: RangeInput, now: Date = new Date()): DateRange {
  if (typeof input === "number") return { from: new Date(now.getTime() - input * DAY_MS), to: now };
  return input;
}

export type PeriodKey = "7" | "30" | "90" | "mtd" | "last_month";

export type Period = {
  key: PeriodKey;
  /** Short label for the period control, e.g. "30 days", "Month to date". */
  label: string;
  /** Phrase for copy, e.g. "last 30 days", "this month so far", "October 2026". */
  phrase: string;
  range: DateRange;
  /** Calendar days (UTC) covered, for daily series. */
  days: number;
  /** Last UTC day (YYYY-MM-DD) of the period, the end of daily series. */
  lastDay: string;
};

export const PERIOD_OPTIONS: { key: PeriodKey; label: string }[] = [
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
  { key: "mtd", label: "Month to date" },
  { key: "last_month", label: "Last month" },
];

/** Period picker value → period (UTC calendar months). Anything unknown falls back to 30 days. */
export function parsePeriod(value: string | null | undefined, now: Date = new Date()): Period {
  const today = now.toISOString().slice(0, 10);
  if (value === "mtd") {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    return { key: "mtd", label: "Month to date", phrase: "this month so far", range: { from, to: now }, days: now.getUTCDate(), lastDay: today };
  }
  if (value === "last_month") {
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const to = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const days = Math.round((to.getTime() - from.getTime()) / DAY_MS);
    const name = from.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });
    return { key: "last_month", label: "Last month", phrase: name, range: { from, to }, days, lastDay: new Date(to.getTime() - DAY_MS).toISOString().slice(0, 10) };
  }
  const days = parseRangeDays(value);
  return { key: String(days) as PeriodKey, label: `${days} days`, phrase: `last ${days} days`, range: resolveRange(days, now), days, lastDay: today };
}

// Date-range picker value → days. Anything else falls back to 30.
export function parseRangeDays(value: string | null | undefined): number {
  if (value == null) return 30;
  const n = Number(value);
  if (Number.isInteger(n) && (RANGE_OPTIONS as readonly number[]).includes(n)) return n;
  return 30;
}

// Per-post metrics (Instagram insights + link clicks) for the last `days` days or a {from,to} range,
// optionally for one connected account (post_targets.social_account_id).
// Tolerates missing columns/tables: returns [] on any query error.
export async function getPostPerformance(userId: string, period: RangeInput, accountId: string | null = null): Promise<PostPerformanceRow[]> {
  if (!isDbConfigured()) return [];
  const { from, to } = resolveRange(period);
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
          and t.published_at >= $2 and t.published_at < $3
          and ($4::uuid is null or t.social_account_id = $4::uuid)
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
      [userId, from, to, accountId]
    );
  } catch {
    return [];
  }
}

export type GrowthSnapshotRow = { day: string; account: string; followers: number };

// Latest follower snapshot per account per day (UTC) in the last `days` days (today included)
// or the UTC days of a {from,to} range, optionally for one account.
export async function getGrowthSnapshots(userId: string, period: RangeInput, accountId: string | null = null): Promise<GrowthSnapshotRow[]> {
  if (!isDbConfigured()) return [];
  const { firstDay, lastDay } = growthDays(period);
  try {
    return await query<GrowthSnapshotRow>(
      `select to_char((taken_at at time zone 'UTC')::date, 'YYYY-MM-DD') as day,
        account_id::text as account,
        max(followers)::int as followers
       from socialapp.account_snapshots
       where user_id = $1
         and (taken_at at time zone 'UTC')::date between $2::date and $3::date
         and ($4::uuid is null or account_id = $4::uuid)
       group by 1, 2
       order by 1, 2`,
      [userId, firstDay, lastDay, accountId]
    );
  } catch {
    return [];
  }
}

/** First and last UTC day (YYYY-MM-DD) of a period: N days ending today, or the days a range touches. */
export function growthDays(period: RangeInput, now: Date = new Date()): { firstDay: string; lastDay: string } {
  if (typeof period === "number") {
    const lastDay = now.toISOString().slice(0, 10);
    const firstDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - (Math.max(1, period) - 1) * DAY_MS).toISOString().slice(0, 10);
    return { firstDay, lastDay };
  }
  return {
    firstDay: period.from.toISOString().slice(0, 10),
    lastDay: new Date(Math.max(period.from.getTime(), period.to.getTime() - 1)).toISOString().slice(0, 10),
  };
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

// CSV helpers + the row type live in the client-safe analyticsCsv.ts; re-exported here for server callers.
export { PERFORMANCE_CSV_HEADERS, performanceCsvRows, toCsv } from "@/lib/analyticsCsv";
export type { PostPerformanceRow } from "@/lib/analyticsCsv";
