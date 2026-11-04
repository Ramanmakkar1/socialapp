import Composer from "./Composer";
import PostList, { type Post } from "./PostList";
import WeekView from "./WeekView";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";

export const metadata = { title: "Calendar" };

type WeekPost = {
  id: string;
  caption: string;
  scheduled_at: Date | string | null;
  status: string;
  platforms: string[];
};

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

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const { week } = await searchParams;
  const weekStart = parseWeekParam(week);

  const prevStart = new Date(weekStart);
  prevStart.setUTCDate(prevStart.getUTCDate() - 7);
  const nextStart = new Date(weekStart);
  nextStart.setUTCDate(nextStart.getUTCDate() + 7);

  const weekEndExclusive = new Date(weekStart);
  weekEndExclusive.setUTCDate(weekEndExclusive.getUTCDate() + 7);

  let rows: Post[] = [];
  let weekRows: WeekPost[] = [];

  if (isDbConfigured()) {
    const user = await requireUser();
    try {
      rows = await query<Post>(
        "select p.id, p.caption, p.scheduled_at, p.status, coalesce(array_agg(t.platform order by t.platform) filter (where t.platform is not null), '{}') as platforms, (select t2.error from post_targets t2 where t2.post_id = p.id and t2.status = 'failed' and t2.error is not null limit 1) as error from scheduled_posts p left join post_targets t on t.post_id = p.id where p.user_id = $1 and p.status <> 'published' group by p.id order by p.scheduled_at nulls last, p.created_at desc limit 50",
        [user.id],
      );
      weekRows = await query<WeekPost>(
        "select p.id, p.caption, p.scheduled_at, p.status, coalesce(array_agg(t.platform order by t.platform) filter (where t.platform is not null), '{}') as platforms from scheduled_posts p left join post_targets t on t.post_id = p.id where p.user_id = $1 and p.scheduled_at >= $2 and p.scheduled_at < $3 group by p.id order by p.scheduled_at limit 200",
        [user.id, weekStart, weekEndExclusive],
      );
    } catch {
      rows = [];
      weekRows = [];
    }
  }

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <p className="text-sm text-muted">Plan posts for Instagram, Facebook and Threads.</p>
      </div>
      <Composer />
      <section className="mt-8" aria-label="Week view">
        <WeekView
          posts={weekRows}
          weekStart={weekStart}
          prevHref={`/app/calendar?week=${weekQueryParam(prevStart)}`}
          nextHref={`/app/calendar?week=${weekQueryParam(nextStart)}`}
        />
      </section>
      <PostList posts={rows} />
    </>
  );
}
