import Link from "next/link";
import { CalendarDays, CalendarRange, List, Plus } from "lucide-react";
import Composer from "./Composer";
import ComposerDialog from "./ComposerDialog";
import type { ComposerDraftInitial } from "@/lib/composerDraft";
import LoadFailed from "./LoadFailed";
import MonthView from "./MonthView";
import PostList, { type Post, type PostFilter } from "./PostList";
import QueueView from "./QueueView";
import WeekView from "./WeekView";
import { requireUser } from "@/lib/auth";
import { topHours } from "@/lib/bestTime";
import { isDbConfigured, query } from "@/lib/db";
import { canPublishToFacebook } from "@/lib/facebookPublish";
import ui from "@/components/ui/ui.module.css";
import styles from "./calendar.module.css";

export const metadata = { title: "Publish" };

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
type DraftRow = Omit<ComposerDraftInitial, "scheduledAt" | "firstComment" | "mediaUrls" | "dmRuleId" | "igFormat"> & {
  status: "draft" | "scheduled";
  scheduled_at: Date | string | null;
  first_comment: string | null;
  media: { url: string }[];
  dm_rule_id: string | null;
  ig_format: "feed" | "story";
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
  searchParams: Promise<{ week?: string; view?: string; month?: string; status?: string; draft?: string }>;
}) {
  const { week, view: viewParam, month, status, draft } = await searchParams;
  const initialFilter: PostFilter = status === "scheduled" || status === "draft" || status === "failed" ? status : "all";
  const view: "week" | "month" | "list" = viewParam === "month" ? "month" : viewParam === "list" ? "list" : "week";
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

  const monthGridStart = mondayUtcStart(monthStart);
  const monthLastDay = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0));
  const monthGridEndSunday = new Date(monthLastDay);
  const monthEndDow = monthGridEndSunday.getUTCDay();
  monthGridEndSunday.setUTCDate(monthGridEndSunday.getUTCDate() + (monthEndDow === 0 ? 0 : 7 - monthEndDow));
  const monthRangeEnd = new Date(monthGridEndSunday);
  monthRangeEnd.setUTCDate(monthRangeEnd.getUTCDate() + 1);

  const rangeStart = view === "month" ? monthGridStart : weekStart;
  const rangeEnd = view === "month" ? monthRangeEnd : weekEndExclusive;

  let rows: Post[] = [];
  let weekRows: WeekPost[] = [];
  let rules: RuleOption[] = [];
  let publishedRows: PublishedPost[] = [];
  let commentHourRows: { hour: number; count: number }[] = [];
  let rulesFailed = false;
  let rowsFailed = false;
  let weekRowsFailed = false;
  let publishedFailed = false;
  let initialDraft: ComposerDraftInitial | undefined;
  let draftFailed = Boolean(draft);
  let draftPublishingSoon = false;
  let facebookReady = false;
  let threadsReady = false;
  let schedulePlatforms: string[] = [];
  let youtubeReady = false;

  const reloadHref =
    view === "month"
      ? `/app/calendar?view=month&month=${monthQueryParam(monthStart)}`
      : view === "list"
        ? "/app/calendar?view=list"
        : `/app/calendar?view=week&week=${weekQueryParam(weekStart)}`;

  const queueReloadHref = initialFilter === "all" ? reloadHref : `${reloadHref}&status=${initialFilter}`;

  if (isDbConfigured()) {
    const user = await requireUser();
    if (draft && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(draft)) {
      try {
        const [row] = await query<DraftRow>(
          `select p.id, p.caption, p.first_comment, p.scheduled_at, p.status, p.media, p.dm_rule_id, p.ig_format,
           coalesce(array_agg(t.platform) filter (where t.platform is not null), '{}') as platforms,
           coalesce(jsonb_object_agg(t.platform, t.caption_override) filter (where t.caption_override is not null), '{}'::jsonb) as overrides
           from scheduled_posts p left join post_targets t on t.post_id = p.id
           where p.id = $1 and p.user_id = $2 and p.status in ('draft','scheduled') group by p.id`,
          [draft, user.id],
        );
        if (row) {
          const dueSoon =
            row.status === "scheduled" &&
            row.scheduled_at !== null &&
            new Date(row.scheduled_at).getTime() <= Date.now() + 2 * 60_000;
          if (dueSoon) {
            // A post about to publish is claimed by the publisher; keep it out of the composer.
            draftPublishingSoon = true;
          } else {
            initialDraft = {
              id: row.id, caption: row.caption, platforms: row.platforms, overrides: row.overrides,
              firstComment: row.first_comment ?? "", mediaUrls: Array.isArray(row.media) ? row.media.map((item) => item?.url).filter((url): url is string => typeof url === "string") : [],
              scheduledAt: row.scheduled_at ? new Date(row.scheduled_at).toISOString() : null,
              dmRuleId: row.dm_rule_id, igFormat: row.ig_format,
              status: row.status,
            };
            draftFailed = false;
          }
        }
      } catch { /* Keep the composer hidden rather than overwrite an unloaded draft. */ }
    }
    try {
      const [fbRow] = await query<{ scopes: string[] | null; auth_type: string | null }>(
        "select scopes, auth_type from socialapp.social_accounts where user_id=$1 and platform='instagram' and auth_type='facebook_login' and status='active' and page_id is not null and access_token_enc is not null limit 1",
        [user.id],
      );
      facebookReady = fbRow ? canPublishToFacebook(fbRow.scopes, fbRow.auth_type) : false;
    } catch {
      facebookReady = false;
    }
    try {
      const rows = await query<{ 1: unknown }>(
        "select 1 from socialapp.social_accounts where user_id=$1 and platform='threads' and status='active' and access_token_enc is not null limit 1",
        [user.id],
      );
      threadsReady = rows.length > 0;
    } catch {
      threadsReady = false;
    }
    try {
      const ytRows = await query<{ 1: unknown }>(
        "select 1 from socialapp.youtube_channels where user_id=$1 and status='active' limit 1",
        [user.id],
      );
      youtubeReady = ytRows.length > 0;
    } catch {
      youtubeReady = false;
    }
    try {
      commentHourRows = await query<{ hour: number; count: number }>(
        `select extract(hour from created_at at time zone 'UTC')::int as hour, count(*)::int as count from socialapp.dm_queue where user_id=$1 and created_at > now() - interval '30 days' group by 1`,
        [user.id],
      );
    } catch {
      commentHourRows = [];
    }
    // Channels that have a usable posting schedule (at least one time) drive the
    // composer's "Add to queue" / "Next available". Missing table = none set.
    try {
      const schedRows = await query<{ platform: string; times: string[] }>(
        "select platform, times from socialapp.posting_schedules where user_id=$1",
        [user.id],
      );
      schedulePlatforms = [...new Set(schedRows.filter((r) => (r.times ?? []).length > 0).map((r) => r.platform))];
    } catch {
      schedulePlatforms = [];
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
    <div className={styles.calendarPage}>
      <header className={styles.pubHeader}>
        <div className={styles.pubTitleWrap}>
          <h1 className={styles.pubTitle}>Publish</h1>
          <p className={styles.pubSub}>Plan, schedule and track posts for Instagram, Facebook, Threads and YouTube.</p>
        </div>
        <div className={styles.pubActions}>
          <div className={styles.viewSwitch} role="group" aria-label="Calendar view">
            <Link href="/app/calendar?view=week" aria-current={view === "week" ? "page" : undefined} className={`${styles.viewLink} ${view === "week" ? styles.viewLinkActive : ""}`}>
              <CalendarRange width={16} height={16} aria-hidden="true" /> Week
            </Link>
            <Link href="/app/calendar?view=month" aria-current={view === "month" ? "page" : undefined} className={`${styles.viewLink} ${view === "month" ? styles.viewLinkActive : ""}`}>
              <CalendarDays width={16} height={16} aria-hidden="true" /> Month
            </Link>
            <Link href="/app/calendar?view=list" aria-current={view === "list" ? "page" : undefined} className={`${styles.viewLink} ${view === "list" ? styles.viewLinkActive : ""}`}>
              <List width={16} height={16} aria-hidden="true" /> List
            </Link>
          </div>
          <Link href={`${reloadHref}&compose=1`} scroll={false} className={styles.newPostBtn}>
            <Plus width={18} height={18} aria-hidden="true" /> New post
          </Link>
        </div>
      </header>
      {draftFailed ? (
        <LoadFailed
          message={draftPublishingSoon ? "This post is about to publish and can no longer be edited." : "We couldn’t load this draft. Your saved post is unchanged."}
          reloadHref={`/app/calendar?draft=${encodeURIComponent(draft ?? "")}#new`}
        />
      ) : rulesFailed ? (
        <section className={styles.viewSection} aria-labelledby="composer-unavailable">
          <h2 id="composer-unavailable" className="sr-only">Composer unavailable</h2>
          <LoadFailed
            message="We couldn’t load your auto-DM rules, so the composer is hidden. Scheduling now could post without the automation you meant to attach."
            reloadHref={reloadHref}
          />
        </section>
      ) : (
        <ComposerDialog title={initialDraft ? (initialDraft.status === "scheduled" ? "Edit scheduled post" : "Edit draft") : "Create post"}>
          <Composer key={initialDraft?.id ?? "new"} rules={rules} bestHoursUtc={bestHoursUtc} initialDraft={initialDraft} facebookReady={facebookReady} threadsReady={threadsReady} schedulePlatforms={schedulePlatforms} youtubeReady={youtubeReady} />
        </ComposerDialog>
      )}
      {view === "month" ? (
        <section className={styles.viewSection} aria-label="Month view">
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
      ) : view === "week" ? (
        <section className={styles.viewSection} aria-label="Week view">
          <WeekView
            posts={weekRows}
            weekStart={weekStart}
            prevHref={`/app/calendar?week=${weekQueryParam(prevStart)}`}
            nextHref={`/app/calendar?week=${weekQueryParam(nextStart)}`}
            composeBase={`/app/calendar?view=week&week=${weekQueryParam(weekStart)}&compose=1`}
            loadError={
              weekRowsFailed
                ? { message: "We couldn’t load the posts scheduled for this week. They may still exist.", reloadHref }
                : undefined
            }
          />
        </section>
      ) : null}
      {view === "list" && (
        <>
      <PostList
        posts={rows}
        initialFilter={initialFilter}
        loadError={
          rowsFailed
            ? { message: "We couldn’t load your scheduled posts and drafts. They may still exist.", reloadHref: queueReloadHref }
            : undefined
        }
      />
      <QueueView posts={rows} />
      {publishedFailed && (
        <section className={styles.published} aria-label="Recently published">
          <h2 className={styles.sectionTitle}>Recently published</h2>
          <LoadFailed
            message="We couldn’t load your publishing history. Your published posts are still there."
            reloadHref={reloadHref}
            className={styles.mt}
          />
        </section>
      )}
      {publishedRows.length > 0 && (
        <section className={styles.published} aria-labelledby="recently-published-heading">
          <h2 id="recently-published-heading" className={styles.sectionTitle}>Recently published</h2>
          <ul className={styles.publishedList}>
            {publishedRows.map((post) => (
              <li key={post.id} className={styles.publishedRow}>
                <p className={styles.publishedCaption}>
                  {post.caption.length > 80 ? `${post.caption.slice(0, 80)}…` : post.caption}
                </p>
                <div className={styles.publishedMeta}>
                  <span className={`${ui.pill} ${styles.pillPublished}`}>Published</span>
                  {post.platforms.map((platform) => (
                    <span key={platform} className={`${ui.pill} ${styles.capitalize}`}>
                      {platform}
                    </span>
                  ))}
                  <span className={styles.publishedTime} suppressHydrationWarning>
                    {post.published_at ? new Date(post.published_at).toLocaleString() : "Time unknown"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
        </>
      )}
    </div>
  );
}
