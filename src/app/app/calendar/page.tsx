import Link from "next/link";
import Composer from "./Composer";
import LoadFailed from "./LoadFailed";
import MonthView from "./MonthView";
import PostList, { type Post, type PostFilter } from "./PostList";
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
  searchParams: Promise<{ week?: string; view?: string; month?: string; status?: string }>;
}) {
  const { week, view: viewParam, month, status } = await searchParams;
  const initialFilter: PostFilter = status === "scheduled" || status === "draft" || status === "failed" ? status : "all";
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
  let rulesFailed = false;
  let rowsFailed = false;
  let weekRowsFailed = false;
  let publishedFailed = false;

  const reloadHref =
    view === "month"
      ? `/app/calendar?view=month&month=${monthQueryParam(monthStart)}`
      : `/app/calendar?view=week&week=${weekQueryParam(weekStart)}`;

  const queueReloadHref = initialFilter === "all" ? reloadHref : `${reloadHref}&status=${initialFilter}`;

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
    const [rulesRes, upcomingRes, rangeRes, publishedRes] = await Promise.allSettled([
      query<RuleOption>(
        "select id, name, status from socialapp.dm_rules where user_id = $1 order by created_at desc",
        [user.id],
      ),
      query<Post>(
        "select p.id, p.caption, p.first_comment, p.scheduled_at, p.status, coalesce(array_agg(t.platform order by t.platform) filter (where t.platform is not null), '{}') as platforms, (select t2.error from post_targets t2 where t2.post_id = p.id and t2.status = 'failed' and t2.error is not null limit 1) as error from scheduled_posts p left join post_targets t on t.post_id = p.id where p.user_id = $1 and p.status <> 'published' group by p.id order by p.scheduled_at nulls last, p.created_at desc limit 50",
        [user.id],
      ),
      query<WeekPost>(
        "select p.id, p.caption, p.scheduled_at, p.status, coalesce(array_agg(t.platform order by t.platform) filter (where t.platform is not null), '{}') as platforms from scheduled_posts p left join post_targets t on t.post_id = p.id where p.user_id = $1 and p.scheduled_at >= $2 and p.scheduled_at < $3 group by p.id order by p.scheduled_at limit 200",
        [user.id, rangeStart, rangeEnd],
      ),
      query<PublishedPost>(
        "select p.id, p.caption, max(t.published_at) as published_at, coalesce(array_agg(t.platform order by t.platform) filter (where t.platform is not null), '{}') as platforms from scheduled_posts p left join post_targets t on t.post_id = p.id where p.user_id = $1 and p.status = 'published' group by p.id order by max(t.published_at) desc nulls last limit 10",
        [user.id],
      ),
    ]);
    if (rulesRes.status === "fulfilled") rules = rulesRes.value;
    else rulesFailed = true;
    if (upcomingRes.status === "fulfilled") rows = upcomingRes.value;
    else rowsFailed = true;
    if (rangeRes.status === "fulfilled") weekRows = rangeRes.value;
    else weekRowsFailed = true;
    if (publishedRes.status === "fulfilled") publishedRows = publishedRes.value;
    else publishedFailed = true;
  }

  const bestHoursUtc = topHours(commentHourRows, 3).map((r) => r.hour);

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted">Plan and schedule Instagram posts. Facebook and Threads are coming soon.</p>
      </div>
      {rulesFailed ? (
        <section className="mt-6" aria-labelledby="composer-unavailable">
          <h2 id="composer-unavailable" className="sr-only">Composer unavailable</h2>
          <LoadFailed
            message="We couldn’t load your auto-DM rules, so the composer is hidden. Scheduling now could post without the automation you meant to attach."
            reloadHref={reloadHref}
          />
        </section>
      ) : (
        <Composer rules={rules} bestHoursUtc={bestHoursUtc} />
      )}
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
            loadError={
              weekRowsFailed
                ? { message: "We couldn’t load the posts scheduled for this month. They may still exist.", reloadHref }
                : undefined
            }
          />
        </section>
      ) : (
        <section className="mt-4" aria-label="Week view">
          <WeekView
            posts={weekRows}
            weekStart={weekStart}
            prevHref={`/app/calendar?week=${weekQueryParam(prevStart)}`}
            nextHref={`/app/calendar?week=${weekQueryParam(nextStart)}`}
            loadError={
              weekRowsFailed
                ? { message: "We couldn’t load the posts scheduled for this week. They may still exist.", reloadHref }
                : undefined
            }
          />
        </section>
      )}
      <PostList
        posts={rows}
        initialFilter={initialFilter}
        loadError={
          rowsFailed
            ? { message: "We couldn’t load your scheduled posts and drafts. They may still exist.", reloadHref: queueReloadHref }
            : undefined
        }
      />
      {publishedFailed && (
        <section className="mt-8" aria-label="Recently published">
          <h2 className="text-lg font-semibold">Recently published</h2>
          <LoadFailed
            message="We couldn’t load your publishing history. Your published posts are still there."
            reloadHref={reloadHref}
            className="mt-3"
          />
        </section>
      )}
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
