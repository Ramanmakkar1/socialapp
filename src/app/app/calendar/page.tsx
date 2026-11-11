import Link from "next/link";
import { SCHEDULABLE_PLATFORMS } from "@/lib/postingSchedule";
import ScheduleSeeder from "../settings/ScheduleSeeder";
import { CalendarDays, Lightbulb, List, Plus } from "lucide-react";
import CalendarToolbar from "./CalendarToolbar";
import { weekMonthLabel, type AccountNames, type CalendarPost } from "./calendarUtils";
import CalendarEmptyState from "./CalendarEmptyState";
import Composer from "./Composer";
import ComposerDialog from "./ComposerDialog";
import type { ComposerDraftInitial } from "@/lib/composerDraft";
import IdeasBoard from "./IdeasBoard";
import type { Idea } from "./IdeaCard";
import LoadFailed from "./LoadFailed";
import MonthView from "./MonthView";
import PostList, { type Post, type PostFilter } from "./PostList";
import QueueView from "./QueueView";
import WeekView from "./WeekView";
import { requireUser } from "@/lib/auth";
import { scheduledPostsUsage } from "@/lib/planLimits";
import { topHours } from "@/lib/bestTime";
import { isDbConfigured, query } from "@/lib/db";
import { facebookPageStatus, type FacebookSourceAccount } from "@/lib/facebookPublish";
import { IDEA_BY_ID_SQL, IDEAS_LIST_SQL, ideaComposerPrefill, normalizeIdeaStatus, type IdeaRow } from "@/lib/ideas";
import { allPostTags, hasColumn, postMatchesTag } from "@/lib/tagFilter";
import ui from "@/components/ui/ui.module.css";
import styles from "./calendar.module.css";

export const metadata = { title: "Publish" };

type WeekPost = {
  id: string;
  caption: string;
  scheduled_at: Date | string | null;
  status: string;
  platforms: string[];
  tags?: string[];
  media: unknown;
  insights: CalendarPost["insights"];
  fb_post_id: string | null;
  error: string | null;
};

const MONTH_FMT = { month: "long", year: "numeric", timeZone: "UTC" } as const;

// Calendar card data: first media item as the thumbnail, a public link when one can be derived.
function toCalendarPost(row: WeekPost): CalendarPost {
  const first = Array.isArray(row.media) ? (row.media[0] as { url?: unknown; type?: unknown } | undefined) : undefined;
  const url = typeof first?.url === "string" ? first.url : null;
  const isVideo = first?.type === "video" || (url ? /\.(mp4|mov|webm)(\?|$)/i.test(url) : false);
  return {
    id: row.id,
    caption: row.caption ?? "",
    scheduled_at: row.scheduled_at,
    status: row.status,
    platforms: row.platforms,
    thumb: url && !isVideo ? url : null,
    thumbIsVideo: isVideo,
    insights: row.insights ?? null,
    permalink: row.fb_post_id && /^[0-9_]+$/.test(row.fb_post_id) ? `https://www.facebook.com/${row.fb_post_id}` : null,
    error: row.error,
  };
}

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
  searchParams: Promise<{ week?: string; view?: string; month?: string; status?: string; draft?: string; idea?: string; tag?: string; channel?: string }>;
}) {
  const { week, view: viewParam, month, status, draft, idea, tag = "", channel = "" } = await searchParams;
  const initialFilter: PostFilter = status === "scheduled" || status === "draft" || status === "failed" ? status : "all";
  const view: "week" | "month" | "list" | "ideas" = viewParam === "month" ? "month" : viewParam === "list" ? "list" : viewParam === "ideas" ? "ideas" : "week";
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

  // One extra day on each side: the calendar groups posts by the viewer's local day, which can
  // differ from the UTC day near midnight.
  const rangeStart = new Date((view === "month" ? monthGridStart : weekStart).getTime() - 86_400_000);
  const rangeEnd = new Date((view === "month" ? monthRangeEnd : weekEndExclusive).getTime() + 86_400_000);

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
  let initialIdea: { id: string; caption: string; mediaUrls: string[] } | undefined;
  let ideas: Idea[] = [];
  let ideasFailed = false;
  let draftFailed = Boolean(draft);
  let ideaFailed = Boolean(idea) && !draft;
  let draftPublishingSoon = false;
  let facebookReady = false;
  let threadsReady = false;
  let schedulePlatforms: string[] = [];
  let scheduleRowCount = -1; // -1 = unknown (table missing / not read)
  let youtubeReady = false;
  let hasTags = false;
  let accountNames: AccountNames = {};
  const previewAccountNames: AccountNames = {};

  const reloadHref =
    view === "month"
      ? `/app/calendar?view=month&month=${monthQueryParam(monthStart)}`
      : view === "list"
        ? "/app/calendar?view=list"
        : view === "ideas"
          ? "/app/calendar?view=ideas"
          : `/app/calendar?view=week&week=${weekQueryParam(weekStart)}`;

  const queueReloadHref = initialFilter === "all" ? reloadHref : `${reloadHref}&status=${initialFilter}`;

  let scheduledUsage: { used: number; limit: number | null } | null = null;
  if (isDbConfigured()) {
    const user = await requireUser();
    scheduledUsage = await scheduledPostsUsage(user.id).catch(() => null);
    try {
      const columnRows = await query<{ exists: boolean }>(
        "select exists (select 1 from information_schema.columns where table_schema='socialapp' and table_name='scheduled_posts' and column_name='tags') as exists",
      );
      hasTags = hasColumn(columnRows);
    } catch {
      hasTags = false;
    }
    if (draft && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(draft)) {
      try {
        const [row] = await query<DraftRow>(
          `select p.id, p.caption, p.first_comment, ${hasTags ? "p.tags" : "'{}'::text[] as tags"}, p.scheduled_at, p.status, p.media, p.dm_rule_id, p.ig_format,
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
              firstComment: row.first_comment ?? "", tags: Array.isArray(row.tags) ? row.tags : [], mediaUrls: Array.isArray(row.media) ? row.media.map((item) => item?.url).filter((url): url is string => typeof url === "string") : [],
              scheduledAt: row.scheduled_at ? new Date(row.scheduled_at).toISOString() : null,
              dmRuleId: row.dm_rule_id, igFormat: row.ig_format,
              status: row.status,
            };
            draftFailed = false;
          }
        }
      } catch { /* Keep the composer hidden rather than overwrite an unloaded draft. */ }
    }
    if (idea && !draft && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idea)) {
      try {
        const [row] = await query<IdeaRow>(IDEA_BY_ID_SQL, [idea, user.id]);
        if (row) {
          initialIdea = ideaComposerPrefill(row);
          ideaFailed = false;
        }
      } catch { /* Keep the composer hidden rather than overwrite an unloaded idea. */ }
    }
    if (view === "ideas") {
      try {
        const ideaRows = await query<IdeaRow>(IDEAS_LIST_SQL, [user.id]);
        ideas = ideaRows.map((row) => ({
          id: row.id,
          text: row.text,
          media: Array.isArray(row.media)
            ? row.media
                .map((item) => (item && typeof item === "object" && "url" in item ? (item as { url?: unknown }).url : undefined))
                .filter((url): url is string => typeof url === "string" && url !== "")
                .map((url) => ({ url }))
            : [],
          tags: Array.isArray(row.tags) ? row.tags.filter((tag): tag is string => typeof tag === "string") : [],
          status: normalizeIdeaStatus(row.status),
        }));
      } catch {
        ideasFailed = true;
      }
    }
    try {
      const fbRows = await query<FacebookSourceAccount>(
        "select platform, status, auth_type, page_id, page_name, (access_token_enc is not null) as has_token, scopes from socialapp.social_accounts where user_id=$1 and platform in ('instagram','facebook')",
        [user.id],
      );
      facebookReady = facebookPageStatus(fbRows).ready;
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
      scheduleRowCount = schedRows.length;
    } catch {
      schedulePlatforms = [];
    }
    const [rulesRes, upcomingRes, rangeRes, publishedRes] = await Promise.allSettled([
      query<RuleOption>(
        "select id, name, status from socialapp.dm_rules where user_id = $1 order by created_at desc",
        [user.id],
      ),
      query<Post>(
        `select p.id, p.caption, p.first_comment, ${hasTags ? "p.tags," : ""} p.scheduled_at, p.status, coalesce(array_agg(t.platform order by t.platform) filter (where t.platform is not null), '{}') as platforms, (select t2.error from post_targets t2 where t2.post_id = p.id and t2.status = 'failed' and t2.error is not null limit 1) as error from scheduled_posts p left join post_targets t on t.post_id = p.id where p.user_id = $1 and p.status <> 'published' group by p.id order by p.scheduled_at nulls last, p.created_at desc limit 50`,
        [user.id],
      ),
      query<WeekPost>(
        `select p.id, p.caption, ${hasTags ? "p.tags," : ""} p.scheduled_at, p.status, p.media,
           coalesce(array_agg(t.platform order by t.platform) filter (where t.platform is not null), '{}') as platforms,
           (array_agg(t.insights) filter (where t.platform = 'instagram' and t.insights is not null))[1] as insights,
           (array_agg(t.external_post_id) filter (where t.platform = 'facebook' and t.status = 'published'))[1] as fb_post_id,
           (array_agg(t.error) filter (where t.status = 'failed' and t.error is not null))[1] as error
         from scheduled_posts p left join post_targets t on t.post_id = p.id where p.user_id = $1 and p.scheduled_at >= $2 and p.scheduled_at < $3 group by p.id order by p.scheduled_at limit 300`,
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
    try {
      const accRows = await query<{ platform: string; username: string | null; page_name: string | null; status: string }>(
        "select platform, username, page_name, status from socialapp.social_accounts where user_id=$1 and status in ('active','expired') order by (status = 'active') desc, created_at",
        [user.id],
      );
      for (const a of accRows) {
        const name = a.username ? `@${a.username.replace(/^@/, "")}` : (a.page_name ?? a.platform);
        // Composer preview: the account the post would go out as, even if it needs reconnecting.
        if (!previewAccountNames[a.platform]) previewAccountNames[a.platform] = name;
        if (a.status !== "active" || accountNames[a.platform]) continue;
        accountNames[a.platform] = name;
      }
    } catch {
      accountNames = {};
    }
    if (rangeRes.status === "fulfilled") weekRows = rangeRes.value;
    else weekRowsFailed = true;
    if (publishedRes.status === "fulfilled") publishedRows = publishedRes.value;
    else publishedFailed = true;
  }

  const bestHoursUtc = topHours(commentHourRows, 3).map((r) => r.hour);
  const allTags = allPostTags(weekRows);
  const statusFilter = ["scheduled", "draft", "published", "failed"].includes(status ?? "") ? status : "";
  const filteredWeekRows = weekRows.filter(
    (post) =>
      postMatchesTag(post, tag) &&
      (!channel || post.platforms.includes(channel)) &&
      (!statusFilter || post.status === statusFilter),
  );
  const calendarPosts = filteredWeekRows.map(toCalendarPost);
  const channelOptions = [...new Set([...Object.keys(accountNames), ...weekRows.flatMap((p) => p.platforms)])].sort();
  const filterQuery = [channel && `channel=${encodeURIComponent(channel)}`, statusFilter && `status=${statusFilter}`, tag && `tag=${encodeURIComponent(tag)}`].filter(Boolean).map((q) => `&${q}`).join("");
  const weekEndDay = new Date(weekStart.getTime() + 6 * 86_400_000);
  const shortDay = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  const now = new Date();
  const thisWeek = weekQueryParam(mondayUtcStart(now));
  const thisMonth = now.toISOString().slice(0, 7);
  const emptyRange = !rowsFailed && !weekRowsFailed && rows.length === 0 && weekRows.length === 0;

  // First channel connected, no posting schedule yet: seed the default one in the browser's zone.
  const seedSchedule = scheduleRowCount === 0 && Object.keys(accountNames).some((p) => (SCHEDULABLE_PLATFORMS as readonly string[]).includes(p));

  return (
    <div className={styles.calendarPage}>
      <ScheduleSeeder needed={seedSchedule} />
      <header className={styles.pubHeader}>
        <div className={styles.pubTitleWrap}>
          <span className={styles.pubIcon} aria-hidden="true"><CalendarDays width={20} height={20} /></span>
          <div>
            <h1 className={styles.pubTitle}>Publish</h1>
            <p className={styles.pubSub}>Plan, schedule and track posts for Instagram, Facebook, Threads and YouTube.</p>
          </div>
        </div>
        <div className={styles.pubActions}>
          <nav className={styles.viewSwitch} aria-label="Publish view">
            <Link href="/app/calendar?view=list" aria-current={view === "list" ? "page" : undefined} className={`${styles.viewLink} ${view === "list" ? styles.viewLinkActive : ""}`}>
              <List width={16} height={16} aria-hidden="true" /> List
            </Link>
            <Link href="/app/calendar?view=week" aria-current={view === "week" || view === "month" ? "page" : undefined} className={`${styles.viewLink} ${view === "week" || view === "month" ? styles.viewLinkActive : ""}`}>
              <CalendarDays width={16} height={16} aria-hidden="true" /> Calendar
            </Link>
            <Link href="/app/calendar?view=ideas" aria-current={view === "ideas" ? "page" : undefined} className={`${styles.viewLink} ${view === "ideas" ? styles.viewLinkActive : ""}`}>
              <Lightbulb width={16} height={16} aria-hidden="true" /> Ideas
            </Link>
          </nav>
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
      ) : ideaFailed ? (
        <LoadFailed
          message="We couldn’t load this idea. Your saved idea is unchanged."
          reloadHref={reloadHref}
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
        <ComposerDialog title={initialIdea ? "Create post from idea" : initialDraft ? (initialDraft.status === "scheduled" ? "Edit scheduled post" : "Edit draft") : "Create post"}>
          <Composer key={initialIdea ? `idea-${initialIdea.id}` : (initialDraft?.id ?? "new")} rules={rules} bestHoursUtc={bestHoursUtc} initialDraft={initialDraft} initialIdea={initialIdea} facebookReady={facebookReady} threadsReady={threadsReady} schedulePlatforms={schedulePlatforms} youtubeReady={youtubeReady} scheduledUsage={scheduledUsage} accountNames={previewAccountNames} />
        </ComposerDialog>
      )}
      {view === "month" ? (
        <section className={styles.viewSection} aria-label="Month calendar">
          <CalendarToolbar
            view="month"
            label={monthStart.toLocaleDateString("en-US", MONTH_FMT)}
            prevHref={`/app/calendar?view=month&month=${monthQueryParam(prevMonth)}${filterQuery}`}
            nextHref={`/app/calendar?view=month&month=${monthQueryParam(nextMonth)}${filterQuery}`}
            todayHref={`/app/calendar?view=month${filterQuery}`}
            isCurrent={monthQueryParam(monthStart) === thisMonth}
            channels={channelOptions}
            tags={allTags}
          />
          <MonthView
            posts={calendarPosts}
            monthStart={monthStart}
            composeBase={`/app/calendar?view=month&month=${monthQueryParam(monthStart)}&compose=1`}
            accounts={accountNames}
            loadError={
              weekRowsFailed
                ? { message: "We couldn’t load the posts scheduled for this month. They may still exist.", reloadHref }
                : undefined
            }
          />
          {emptyRange && <CalendarEmptyState composeHref={`${reloadHref}&compose=1`} />}
        </section>
      ) : view === "week" ? (
        <section className={styles.viewSection} aria-label="Week calendar">
          <CalendarToolbar
            view="week"
            label={weekMonthLabel(weekStart, weekEndDay)}
            subLabel={`${shortDay(weekStart)} – ${shortDay(weekEndDay)}`}
            prevHref={`/app/calendar?view=week&week=${weekQueryParam(prevStart)}${filterQuery}`}
            nextHref={`/app/calendar?view=week&week=${weekQueryParam(nextStart)}${filterQuery}`}
            todayHref={`/app/calendar?view=week${filterQuery}`}
            isCurrent={weekQueryParam(weekStart) === thisWeek}
            channels={channelOptions}
            tags={allTags}
          />
          <WeekView
            posts={calendarPosts}
            weekStart={weekStart}
            composeBase={`/app/calendar?view=week&week=${weekQueryParam(weekStart)}&compose=1`}
            accounts={accountNames}
            loadError={
              weekRowsFailed
                ? { message: "We couldn’t load the posts scheduled for this week. They may still exist.", reloadHref }
                : undefined
            }
          />
          {emptyRange && <CalendarEmptyState composeHref={`${reloadHref}&compose=1`} />}
        </section>
      ) : null}
      {view === "ideas" && (
        <>
          <IdeasBoard ideas={ideas} loadFailed={ideasFailed} />
          <PostList
            posts={rows.filter((post) => post.status === "draft")}
            initialFilter="draft"
            title="Drafts"
            loadError={
              rowsFailed
                ? { message: "We couldn’t load your drafts. They may still exist.", reloadHref: queueReloadHref }
                : undefined
            }
          />
        </>
      )}
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
