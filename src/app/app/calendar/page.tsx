import Link from "next/link";
import Composer from "./Composer";
import MonthView from "./MonthView";
import PostList, { type Post } from "./PostList";
import WeekView from "./WeekView";
import { requireUser } from "@/lib/auth";
import { topHours } from "@/lib/bestTime";
import { isDbConfigured, query } from "@/lib/db";

export const metadata = { title: "Calendar" };

type WeekPost = {
  id: string;
  caption: string;
  scheduled_at: Date | string | null;
  status: string;
  platforms: string[];
};

type PublishedPost = {
  id: string;
  caption: string;
  published_at: Date | string | null;
  platforms: string[];
};

type RuleOption = { id: string; name: string; status: string };

function mondayUtcStart(d: Date): Date {
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = date.getUTCDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  date.setUTCDate(date.getUTCDate() + offset);
  return date;
}

function parseWeekParam(week: string | undefined): Date {
  if (week && /^\d{4}-\d{2}-\d{2}$/.test(week)) {
    const parsed = new Date(`${week}T00:00:00.000Z`);
    if (!Number.isNaN(parsed.getTime())) {
      return mondayUtcStart(parsed);
    }
  }
  return mondayUtcStart(new Date());
}

function weekQueryParam(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseMonthParam(month: string | undefined): Date {
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    if (m >= 1 && m <= 12) {
      return new Date(Date.UTC(y, m - 1, 1));
    }
  }
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

function monthQueryParam(d: Date): string {
  return d.toISOString().slice(0, 7);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string; view?: string; month?: string }>;
}) {
  const { week, view: viewParam, month } = await searchParams;
  const view: "week" | "month" = viewParam === "month" ? "month" : "week";
  const weekStart = parseWeekParam(week);
  const monthStart = parseMonthParam(month);
  const prevMonth = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1));
  const nextMonth = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1));

  const prevStart = new Date(weekStart);
  prevStart.setUTCDate(prevStart.getUTCDate() - 7);
  const nextStart = new Date(weekStart);
  nextStart.setUTCDate(nextStart.getUTCDate() + 7);

  const weekEndExclusive = new Date(weekStart);
  weekEndExclusive.setUTCDate(weekEndExclusive.getUTCDate() + 7);

  const rangeStart = view === "month" ? monthStart : weekStart;
  const rangeEnd = view === "month" ? nextMonth : weekEndExclusive;

  let rows: Post[] = [];
  let weekRows: WeekPost[] = [];
  let rules: RuleOption[] = [];
  let publishedRows: PublishedPost[] = [];
  let commentHourRows: { hour: number; count: number }[] = [];

  if (isDbConfigured()) {
    const user = await requireUser();
    try {
      commentHourRows = await query<{ hour: number; count: number }>(
        `select extract(hour from created_at at time zone 'UTC')::int as hour, count(*)::int as count from socialapp.dm_queue where user_id=$1 and created_at > now() - interval '30 days' group by 1`,
        [user.id],
      );
    } catch {
      commentHourRows = [];
    }
    try {
      rules = await query<RuleOption>(
        "select id, name, status from socialapp.dm_rules where user_id = $1 order by created_at desc",
        [user.id],
      );
    } catch {
      rules = [];
    }
    const publishedPromise = query<PublishedPost>(
      "select p.id, p.caption, max(t.published_at) as published_at, coalesce(array_agg(t.platform order by t.platform) filter (where t.platform is not null), '{}') as platforms from scheduled_posts p left join post_targets t on t.post_id = p.id where p.user_id = $1 and p.status = 'published' group by p.id order by max(t.published_at) desc nulls last limit 10",
      [user.id],
    ).catch(() => [] as PublishedPost[]);
    try {
      rows = await query<Post>(
        "select p.id, p.caption, p.first_comment, p.scheduled_at, p.status, coalesce(array_agg(t.platform order by t.platform) filter (where t.platform is not null), '{}') as platforms, (select t2.error from post_targets t2 where t2.post_id = p.id and t2.status = 'failed' and t2.error is not null limit 1) as error from scheduled_posts p left join post_targets t on t.post_id = p.id where p.user_id = $1 and p.status <> 'published' group by p.id order by p.scheduled_at nulls last, p.created_at desc limit 50",
        [user.id],
      );
      weekRows = await query<WeekPost>(
        "select p.id, p.caption, p.scheduled_at, p.status, coalesce(array_agg(t.platform order by t.platform) filter (where t.platform is not null), '{}') as platforms from scheduled_posts p left join post_targets t on t.post_id = p.id where p.user_id = $1 and p.scheduled_at >= $2 and p.scheduled_at < $3 group by p.id order by p.scheduled_at limit 200",
        [user.id, rangeStart, rangeEnd],
      );
    } catch {
      rows = [];
      weekRows = [];
    }
    publishedRows = await publishedPromise;
  }

  const bestHoursUtc = topHours(commentHourRows, 3).map((r) => r.hour);

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted">Plan posts for Instagram, Facebook and Threads.</p>
      </div>
      <Composer rules={rules} bestHoursUtc={bestHoursUtc} />
      <div className="mt-8 flex gap-2" role="group" aria-label="Calendar view">
        <Link
          href="/app/calendar?view=week"
          aria-current={view === "week" ? "page" : undefined}
          className={`rounded-full px-4 py-1.5 text-sm ${view === "week" ? "btn-primary font-medium" : "border border-line hover:bg-surface-2"}`}
        >
          Week
        </Link>
        <Link
          href="/app/calendar?view=month"
          aria-current={view === "month" ? "page" : undefined}
          className={`rounded-full px-4 py-1.5 text-sm ${view === "month" ? "btn-primary font-medium" : "border border-line hover:bg-surface-2"}`}
        >
          Month
        </Link>
      </div>
      {view === "month" ? (
        <section className="mt-4" aria-label="Month view">
          <MonthView
            posts={weekRows}
            monthStart={monthStart}
            prevHref={`/app/calendar?view=month&month=${monthQueryParam(prevMonth)}`}
            nextHref={`/app/calendar?view=month&month=${monthQueryParam(nextMonth)}`}
          />
        </section>
      ) : (
        <section className="mt-4" aria-label="Week view">
          <WeekView
            posts={weekRows}
            weekStart={weekStart}
            prevHref={`/app/calendar?week=${weekQueryParam(prevStart)}`}
            nextHref={`/app/calendar?week=${weekQueryParam(nextStart)}`}
          />
        </section>
      )}
      <PostList posts={rows} />
      {publishedRows.length > 0 && (
        <section className="mt-8" aria-labelledby="recently-published-heading">
          <h2 id="recently-published-heading" className="text-lg font-semibold">Recently published</h2>
          <ul className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface">
            {publishedRows.map((post) => (
              <li key={post.id} className="flex min-w-0 flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="min-w-0 break-words text-sm text-ink-2">
                  {post.caption.length > 80 ? `${post.caption.slice(0, 80)}…` : post.caption}
                </p>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <span className="rounded-full border border-ok bg-surface-2 px-3 py-1 text-xs font-medium text-ok">Published</span>
                  {post.platforms.map((platform) => (
                    <span key={platform} className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium capitalize text-ink-2">
                      {platform}
                    </span>
                  ))}
                  <span className="text-xs text-muted" suppressHydrationWarning>
                    {post.published_at ? new Date(post.published_at).toLocaleString() : "Time unknown"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
