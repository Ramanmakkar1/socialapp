import Link from "next/link";
import { postThumbUrl } from "@/lib/mediaUpload";
import { Suspense } from "react";
import { BarChart3, Download, Info, Instagram, MessageCircle, TrendingUp, Trophy } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { buildGrowthSeries, getGrowthSnapshots, getPostPerformance, parsePeriod, PERIOD_OPTIONS } from "@/lib/analytics";
import { isDbConfigured, query } from "@/lib/db";
import { getDailyActivity, getDashboardStats, getRecentPosts, getRuleStats } from "@/lib/stats";
import { filterComments, loadInbox } from "@/lib/inbox";
import { DmActivity, DmAudience, DmPerformance } from "./DmAnalytics";
import { BtnLink } from "@/components/ui/kit";
import LocalTime from "@/components/LocalTime";
import ui from "@/components/ui/ui.module.css";
import EmptyState from "../EmptyState";
import AccountInsightsPanel from "../AccountInsights";
import PostPerformanceTable from "./PostPerformanceTable";
import styles from "./analytics.module.css";
import { CommentTimes, DailyBars, GrowthChart } from "./Charts";
import { getCommentTimeCells } from "./commentTimes";

export const metadata = { title: "Analytics" };


function shortCaption(caption: string): string {
  const text = caption.trim();
  if (!text) return "(no caption)";
  return text.length > 60 ? `${text.slice(0, 60).trimEnd()}…` : text;
}

function formatInsightMetric(value: number | null | undefined): string {
  if (value == null) return "—";
  return value.toLocaleString("en-US");
}

const INSIGHTS_SCOPE = "instagram_business_manage_insights";

const TABS = [
  { id: "posts", label: "Posts" },
  { id: "dms", label: "DM performance" },
  { id: "activity", label: "Activity log" },
  { id: "audience", label: "Audience" },
] as const;


function formatPlatforms(platforms: string[]): string {
  return platforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ");
}


export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string; tab?: string; sort?: string; account?: string }> }) {
  const user = await requireUser();
  const { range: rangeParam, tab: tabParam, sort: sortParam, account: accountParam } = await searchParams;
  const tab = TABS.some((t) => t.id === tabParam) ? (tabParam as (typeof TABS)[number]["id"]) : "posts";
  const period = parsePeriod(rangeParam);
  const rangeKey = period.key;
  // Channel switcher: posts and follower growth can be split per connected account
  // (post_targets.social_account_id, account_snapshots.account_id).
  let channels: { id: string; platform: string; username: string | null }[] = [];
  if (isDbConfigured()) {
    try {
      channels = await query<{ id: string; platform: string; username: string | null }>(
        "select id::text, platform, username from socialapp.social_accounts where user_id=$1 and status in ('active','expired') and platform in ('instagram','facebook','threads') order by platform, created_at",
        [user.id],
      );
    } catch {
      channels = [];
    }
  }
  const channel = channels.find((c) => c.id === accountParam) ?? null;
  const accountId = tab === "posts" ? channel?.id ?? null : null;
  const qs = (extra: Record<string, string | null | undefined>) => {
    const q = new URLSearchParams();
    const merged: Record<string, string | null | undefined> = { tab, range: rangeKey, account: channel?.id, ...extra };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    return q.toString();
  };
  const [stats, rules, recentPosts, commentCells, dailyActivity, postPerformance, growthSnapshots] = await Promise.all([
    getDashboardStats(user.id),
    getRuleStats(user.id),
    getRecentPosts(user.id),
    getCommentTimeCells(user.id),
    getDailyActivity(user.id),
    getPostPerformance(user.id, period.range, accountId),
    getGrowthSnapshots(user.id, period.range, accountId),
  ]);
  let igHandle: string | null = null;
  let unanswered: number | null = null;
  const thumbs: Record<string, string> = {};
  if (isDbConfigured()) {
    try {
      const [acc] = await query<{ username: string | null }>(
        "select username from socialapp.social_accounts where user_id=$1 and platform='instagram' order by created_at limit 1",
        [user.id],
      );
      igHandle = acc?.username ?? null;
    } catch {
      igHandle = null;
    }
    if (tab === "posts") {
      try {
        const inbox = await loadInbox(user.id);
        unanswered = filterComments(inbox.comments, "unanswered").length;
      } catch {
        unanswered = null;
      }
    }
    if (postPerformance.length > 0) {
      try {
        const mediaRows = await query<{ id: string; media: unknown }>(
          "select id, media from socialapp.scheduled_posts where user_id=$1 and id = any($2::uuid[])",
          [user.id, postPerformance.map((p) => p.id)],
        );
        for (const row of mediaRows) {
          const thumb = postThumbUrl(row.media);
          if (thumb) thumbs[row.id] = thumb;
        }
      } catch {
        // Thumbnails are optional.
      }
    }
  }
  const growthSeries = buildGrowthSeries(period.lastDay, period.days, growthSnapshots);
  const growthMax = growthSeries.reduce((max, row) => Math.max(max, row.followers), 0);
  const growthStart = growthSeries[0]?.followers ?? 0;
  const growthEnd = growthSeries[growthSeries.length - 1]?.followers ?? 0;
  const hasGrowth = growthMax > 0;

  let missingInsightsScope = false;
  if (isDbConfigured()) {
    try {
      const igAccounts = await query<{ scopes: string[] | null }>(
        `select scopes from socialapp.social_accounts where user_id=$1 and platform='instagram' and status='active'`,
        [user.id]
      );
      missingInsightsScope = igAccounts.some(
        (a) => !Array.isArray(a.scopes) || !a.scopes.includes(INSIGHTS_SCOPE)
      );
    } catch {
      missingInsightsScope = false;
    }
  }


  const hasLikes = postPerformance.some((p) => p.likes != null);
  const sum = (key: "reach" | "likes" | "comments" | "saved") =>
    postPerformance.some((p) => p[key] != null) ? postPerformance.reduce((acc, p) => acc + (p[key] ?? 0), 0) : null;
  const totalReach = sum("reach");
  const totalLikes = sum("likes");
  const totalComments = sum("comments");
  const totalSaved = sum("saved");
  const totalClicks = postPerformance.reduce((acc, p) => acc + p.linkClicks, 0);
  const engRate =
    totalReach && totalLikes != null && totalComments != null
      ? `${(((totalLikes + totalComments + (totalSaved ?? 0)) / totalReach) * 100).toLocaleString("en-US", { maximumFractionDigits: 2 })}%`
      : null;
  const topPost = hasLikes
    ? [...postPerformance].sort((a, b) => (b.likes ?? 0) + (b.comments ?? 0) - ((a.likes ?? 0) + (a.comments ?? 0)))[0]
    : undefined;
  const growthChange = hasGrowth ? growthEnd - growthStart : null;
  const fmt = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("en-US"));
  const summary: { label: string; value: string; tip: string; change?: string }[] = [
    { label: "Followers", value: hasGrowth ? fmt(growthEnd) : "—", change: growthChange == null ? undefined : `${growthChange >= 0 ? "+" : ""}${growthChange.toLocaleString("en-US")}`, tip: "Followers on your connected Instagram accounts from daily snapshots; change over the selected period." },
    { label: "Posts", value: fmt(postPerformance.length), tip: "Posts published through Poskoo in the selected period." },
    { label: "Likes", value: fmt(totalLikes), tip: "Likes on those posts (Instagram insights)." },
    { label: "Comments", value: fmt(totalComments), tip: "Comments on those posts (Instagram insights)." },
    { label: "Eng. rate", value: engRate ?? "—", tip: "(Likes + comments + saves) divided by reach, across those posts." },
    { label: "Reach", value: fmt(totalReach), tip: "Accounts that saw those posts (Instagram insights)." },
    { label: "DMs sent", value: fmt(stats.dmsSent), tip: "Automated DMs sent in the last 7 days." },
    { label: "Leads", value: fmt(stats.leads), tip: "Contacts collected by your Auto-DMs (all time)." },
    { label: "Link clicks", value: fmt(totalClicks), tip: "Clicks on tracked DM links from rules attached to those posts." },
  ];

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.headWho}>
          <span className={styles.headAvatar} aria-hidden="true">
            {(igHandle ?? "P").slice(0, 1).toUpperCase()}
            <span className={styles.headBadge}><Instagram width={10} height={10} /></span>
          </span>
          <div className="min-w-0">
            <h1 className={styles.headTitle}>{igHandle ? `@${igHandle}` : "Insights"}</h1>
            <p className={styles.headSub}>Insights for your posts and auto-DMs</p>
          </div>
        </div>
        <Link href={`/app/analytics/report?range=${rangeKey}`} className={styles.ghostBtn}>
          <Download width={15} height={15} aria-hidden="true" /> Export
        </Link>
      </header>

      <nav className={styles.tabs} aria-label="Analytics sections">
        {TABS.map((t) => (
          <Link key={t.id} href={`/app/analytics?${qs({ tab: t.id })}`} aria-current={tab === t.id ? "page" : undefined} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}>
            {t.label}
          </Link>
        ))}
      </nav>

      {(tab === "posts" || tab === "dms") && (
      <div className={styles.periodRow}>
        <span className={styles.periodLabel}>Period</span>
        <div className={styles.rangePicker} role="group" aria-label="Date range">
          {PERIOD_OPTIONS.map((option) => (
            <Link
              key={option.key}
              href={`/app/analytics?${qs({ range: option.key })}`}
              className={`${styles.rangeOption} ${option.key === rangeKey ? styles.rangeActive : ""}`}
              aria-current={option.key === rangeKey ? "true" : undefined}
            >
              {option.label}
            </Link>
          ))}
        </div>
        {tab === "posts" && channels.length > 1 && (
          <>
            <span className={styles.periodLabel}>Channel</span>
            <div className={styles.rangePicker} role="group" aria-label="Channel">
              <Link
                href={`/app/analytics?${qs({ account: null })}`}
                className={`${styles.rangeOption} ${!channel ? styles.rangeActive : ""}`}
                aria-current={!channel ? "true" : undefined}
              >
                All channels
              </Link>
              {channels.map((c) => (
                <Link
                  key={c.id}
                  href={`/app/analytics?${qs({ account: c.id })}`}
                  className={`${styles.rangeOption} ${channel?.id === c.id ? styles.rangeActive : ""}`}
                  aria-current={channel?.id === c.id ? "true" : undefined}
                >
                  {c.username ? `@${c.username} · ` : ""}{c.platform.charAt(0).toUpperCase() + c.platform.slice(1)}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      )}

      {tab === "dms" ? (
        rules.length > 0 ? (
          <DmPerformance userId={user.id} period={period} rules={rules} sort={sortParam ?? "dms"} />
        ) : (
          <EmptyState icon={BarChart3} title="No Auto-DMs yet" text="Create your first Auto-DM to see results here." art="/landing/card-dm.webp">
            <BtnLink href="/app/auto-dm" size="sm">Create auto-DM rule</BtnLink>
          </EmptyState>
        )
      ) : tab === "activity" ? (
        <DmActivity userId={user.id} />
      ) : tab === "audience" ? (
        <DmAudience userId={user.id} />
      ) : (
        <>
          <section className={styles.takeaways} aria-labelledby="takeaways-heading">
            <h2 id="takeaways-heading" className={styles.blockTitle}>Weekly takeaways</h2>
            <div className={styles.takeGrid}>
              <article className={styles.takeCard}>
                <MessageCircle width={18} height={18} aria-hidden="true" className={styles.takeIcon} />
                <h3>Reply to your comments</h3>
                <p>{unanswered == null ? "We couldn't count your comments right now." : unanswered > 0 ? `You have ${unanswered} unanswered ${unanswered === 1 ? "comment" : "comments"} from the last 30 days.` : "Every comment from the last 30 days is answered."}</p>
                {unanswered ? <Link href="/app/inbox?filter=unanswered" className={styles.inlineLink}>Open Inbox</Link> : null}
              </article>
              <article className={styles.takeCard}>
                <Trophy width={18} height={18} aria-hidden="true" className={styles.takeIcon} />
                <h3>Top post this period</h3>
                {topPost ? (
                  <p>“{shortCaption(topPost.caption)}” got {fmt(topPost.likes)} likes and {fmt(topPost.comments)} comments.</p>
                ) : (
                  <p>No post insights for {period.phrase} yet.</p>
                )}
              </article>
              {growthChange != null && (
                <article className={styles.takeCard}>
                  <TrendingUp width={18} height={18} aria-hidden="true" className={styles.takeIcon} />
                  <h3>Audience growth</h3>
                  <p>{growthChange >= 0 ? `+${growthChange.toLocaleString("en-US")}` : growthChange.toLocaleString("en-US")} followers, {period.phrase} ({growthEnd.toLocaleString("en-US")} now).</p>
                </article>
              )}
            </div>
          </section>

          <section className={styles.block} aria-labelledby="summary-heading">
            <h2 id="summary-heading" className={styles.blockTitle}>All insights <span className={styles.blockSub}>Summary, {period.phrase}{channel ? ` · @${channel.username ?? channel.platform}` : ""}</span></h2>
            <div className={styles.summaryGrid}>
              {summary.map((t) => (
                <div key={t.label} className={styles.kpi}>
                  <p className={styles.kpiLabel}>
                    {t.label}
                    <span className={styles.tip} tabIndex={0} role="img" aria-label={`About ${t.label}: ${t.tip}`} data-tip={t.tip}>
                      <Info width={12} height={12} aria-hidden="true" />
                    </span>
                  </p>
                  <p className={styles.kpiValue}>{t.value}</p>
                  {t.change && <span className={styles.changePill}>{t.change}</span>}
                </div>
              ))}
            </div>
          </section>

          <section className={styles.block} aria-labelledby="perpost-heading">
            <h2 id="perpost-heading" className={styles.blockTitle}>Performance per post</h2>
            {missingInsightsScope && (
              <p className={styles.subtle}>Reconnect Instagram in <Link href="/app/settings" className={ui.link}>Settings</Link> to see reach and likes.</p>
            )}
            {postPerformance.length > 0 ? (
              <PostPerformanceTable rows={postPerformance} thumbs={thumbs} />
            ) : (
              <p className={styles.emptyCopy}>
                No published posts for {period.phrase}. Post something and its reach, impressions and engagement will show up here.
              </p>
            )}
          </section>

      <div className={styles.panel}>
        <h2>Account growth</h2>
        <p className={styles.subtle}>
          Followers {channel ? `on @${channel.username ?? channel.platform}` : "across your connected accounts"}, {period.phrase}
          {hasGrowth ? ` · ${growthEnd.toLocaleString("en-US")} now, ${growthEnd - growthStart >= 0 ? "+" : ""}${(growthEnd - growthStart).toLocaleString("en-US")} in period` : ""}
        </p>
        {hasGrowth ? (
          <GrowthChart series={growthSeries} />
        ) : (
          <p className={styles.emptyCopy}>
            No follower data yet. Snapshots are recorded each day from your connected Instagram accounts.
          </p>
        )}
      </div>
      <Suspense fallback={<div role="status" className={styles.insightsLoading} aria-label="Loading Instagram insights" />}>
        <AccountInsightsPanel userId={user.id} />
      </Suspense>
      <div className={styles.panel}>
        <h2>When your audience comments</h2>
        <p className={styles.subtle}>Last 30 days, with the best times to post</p>
        <CommentTimes cells={commentCells} />
      </div>
      <div className={styles.panel}>
        <h2>Last 14 days</h2>
        <p className={styles.subtle}>DMs sent and new contacts per day</p>
        <DailyBars rows={dailyActivity} emptyHref="/app/auto-dm" />
      </div>
      {recentPosts.length > 0 ? (
        <div className={styles.section}>
          <h2>Recent posts</h2>
          {missingInsightsScope ? (
            <p className={styles.subtle}>
              Reconnect Instagram in{" "}
              <Link href="/app/settings" className={ui.link}>
                Settings
              </Link>{" "}
              to see reach and likes.
            </p>
          ) : null}
          <div className={styles.tableWrap}>
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className={styles.tableHead}>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Post
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Published
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Platforms
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Reach
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Likes
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Comments
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Saves
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Auto-DM rule
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">DMs</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Clicks</th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">Leads</th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr key={post.id} className={styles.tableRow}>
                    <td className="px-4 py-3">{shortCaption(post.caption)}</td>
                    <td className="px-4 py-3 tabular-nums"><LocalTime value={post.publishedAt} style="medium" fallback="—" /></td>
                    <td className="px-4 py-3">{formatPlatforms(post.platforms)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatInsightMetric(post.insights?.reach)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatInsightMetric(post.insights?.likes)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatInsightMetric(post.insights?.comments)}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{formatInsightMetric(post.insights?.saved)}</td>
                    <td className="px-4 py-3">{post.ruleName ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{post.ruleName === null ? "—" : post.dmsSent.toLocaleString("en-US")}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{post.ruleName === null ? "—" : post.linkClicks.toLocaleString("en-US")}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{post.ruleName === null ? "—" : post.leads.toLocaleString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className={`${styles.emptyCopy} ${styles.section}`}>No posts published in the last 30 days.</p>
      )}
        </>
      )}
    </div>
  );
}
