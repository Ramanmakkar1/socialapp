import Link from "next/link";
import { Suspense } from "react";
import { BarChart3 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { hourBars, topHours } from "@/lib/bestTime";
import { buildGrowthSeries, getGrowthSnapshots, getPostPerformance, parseRangeDays, RANGE_OPTIONS } from "@/lib/analytics";
import { isDbConfigured, query } from "@/lib/db";
import { getCommentActivity, getDailyActivity, getDashboardStats, getRecentPosts, getRuleStats } from "@/lib/stats";
import { BtnLink, PageHero } from "@/components/ui/kit";
import LocalTime from "@/components/LocalTime";
import ui from "@/components/ui/ui.module.css";
import EmptyState from "../EmptyState";
import AccountInsightsPanel from "../AccountInsights";
import PostPerformanceTable from "./PostPerformanceTable";
import styles from "./analytics.module.css";

export const metadata = { title: "Analytics" };

function clickRate(clicks: number, dmsSent: number): string {
  if (dmsSent === 0) return "—";
  return `${((clicks / dmsSent) * 100).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
}

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

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BLOCK_LABELS = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"];
const statColors = [styles.lilac, styles.peach, styles.mint, styles.pink];

function blockRange(block: number): string {
  return `${BLOCK_LABELS[block]}–${BLOCK_LABELS[(block + 1) % 8]}`;
}

function formatPlatforms(platforms: string[]): string {
  return platforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ");
}

function shortDayUtc(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const user = await requireUser();
  const { range: rangeParam } = await searchParams;
  const rangeDays = parseRangeDays(rangeParam);
  const [stats, rules, recentPosts, activity, dailyActivity, postPerformance, growthSnapshots] = await Promise.all([
    getDashboardStats(user.id),
    getRuleStats(user.id),
    getRecentPosts(user.id),
    getCommentActivity(user.id),
    getDailyActivity(user.id),
    getPostPerformance(user.id, rangeDays),
    getGrowthSnapshots(user.id, rangeDays),
  ]);
  const todayUtc = new Date().toISOString().slice(0, 10);
  const growthSeries = buildGrowthSeries(todayUtc, rangeDays, growthSnapshots);
  const growthMax = growthSeries.reduce((max, row) => Math.max(max, row.followers), 0);
  const growthStart = growthSeries[0]?.followers ?? 0;
  const growthEnd = growthSeries[growthSeries.length - 1]?.followers ?? 0;
  const hasGrowth = growthMax > 0;

  let commentHourRows: { hour: number; count: number }[] = [];
  if (isDbConfigured()) {
    try {
      commentHourRows = await query<{ hour: number; count: number }>(
        `select extract(hour from created_at at time zone 'UTC')::int as hour, count(*)::int as count from socialapp.dm_queue where user_id=$1 and created_at > now() - interval '30 days' group by 1`,
        [user.id]
      );
    } catch {
      commentHourRows = [];
    }
  }
  const bestTimes = topHours(commentHourRows, 3);
  const hourBarCounts = hourBars(commentHourRows);
  const maxHourCount = Math.max(...hourBarCounts, 0);

  // 7 rows (Mon..Sun) x 8 columns (3-hour UTC blocks).
  const activityGrid: number[][] = DAY_LABELS.map(() => BLOCK_LABELS.map(() => 0));
  for (const cell of activity) {
    if (cell.dow >= 1 && cell.dow <= 7 && cell.block >= 0 && cell.block <= 7) {
      activityGrid[cell.dow - 1][cell.block] += cell.count;
    }
  }
  let activityTotal = 0;
  let activityMax = 0;
  let activityBest = { day: 0, block: 0 };
  activityGrid.forEach((row, day) =>
    row.forEach((count, block) => {
      activityTotal += count;
      if (count > activityMax) {
        activityMax = count;
        activityBest = { day, block };
      }
    })
  );

  const dailyMax = dailyActivity.reduce((max, row) => Math.max(max, row.dms, row.leads), 0);
  const hasDailyActivity = dailyMax > 0;

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

  const tiles: [string, number][] = [
    ["Scheduled", stats.scheduled],
    ["DMs sent (7 days)", stats.dmsSent],
    ["Leads", stats.leads],
    ["Link clicks", stats.linkClicks],
  ];

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Your results"
        title="Analytics"
        lede="See how your posts and DMs perform."
        art="/illustrations/analytics.webp"
        artAlt=""
        artWidth={1536}
        artHeight={1024}
      />
      <div className={styles.statGrid}>
        {tiles.map(([l, v], index) => (
          <div key={l} className={`${styles.statCard} ${statColors[index]}`}>
            <div className={styles.statLabel}>{l}</div>
            <div className={styles.statValue}>{v.toLocaleString("en-US")}</div>
          </div>
        ))}
      </div>
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <h2>Post performance</h2>
            <p className={styles.subtle}>Reach, impressions and engagement per post, last {rangeDays} days.</p>
          </div>
          <div className={styles.rangePicker} role="group" aria-label="Date range">
            {RANGE_OPTIONS.map((days) => (
              <Link
                key={days}
                href={`/app/analytics?range=${days}`}
                className={`${styles.rangeOption} ${days === rangeDays ? styles.rangeActive : ""}`}
                aria-current={days === rangeDays ? "true" : undefined}
              >
                {days} days
              </Link>
            ))}
          </div>
        </div>
        {postPerformance.length > 0 ? (
          <PostPerformanceTable rows={postPerformance} />
        ) : (
          <p className={`${styles.emptyCopy} ${styles.tableWrap}`}>
            No published posts in the last {rangeDays} days. Post something and its reach, impressions and engagement will show up here.
          </p>
        )}
      </div>
      <div className={`${styles.panel} ${styles.mintPanel}`}>
        <h2>Account growth</h2>
        <p className={styles.subtle}>
          Followers across your connected accounts, last {rangeDays} days (UTC)
          {hasGrowth ? ` · ${growthEnd.toLocaleString("en-US")} now, ${growthEnd - growthStart >= 0 ? "+" : ""}${(growthEnd - growthStart).toLocaleString("en-US")} in period` : ""}
        </p>
        {hasGrowth ? (
          <ul className={styles.dailyList}>
            {growthSeries.map((row) => (
              <li key={row.day} className="flex items-start gap-2 sm:gap-3">
                <span className={styles.dayLabel}>{shortDayUtc(row.day)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className={styles.track}>
                      <div
                        className={`${styles.fill} ${styles.violetFill}`}
                        style={{ width: growthMax > 0 ? `${(row.followers / growthMax) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className={styles.chartValue}>{row.followers.toLocaleString("en-US")}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.emptyCopy}>
            No follower data yet. Snapshots are recorded each day from your connected Instagram accounts.
          </p>
        )}
      </div>
      <div className={styles.reportBar}>
        <p>
          Want to share these numbers? The <strong>printable report</strong> packs everything on this page into one clean page.
        </p>
        <BtnLink href={`/app/analytics/report?range=${rangeDays}`} size="sm">
          Open printable report
        </BtnLink>
      </div>
      <Suspense fallback={<div role="status" className={styles.insightsLoading} aria-label="Loading Instagram insights" />}>
        <AccountInsightsPanel userId={user.id} />
      </Suspense>
      <div className={`${styles.panel} ${styles.lilacPanel}`}>
        <h2>When your audience comments</h2>
        <p className={styles.subtle}>Last 30 days, times in UTC</p>
        {activityTotal > 0 ? (
          <>
            <div className={styles.heatmapWrap}>
              <table className="border-separate border-spacing-1 text-xs">
                <thead>
                  <tr>
                    <th scope="col" className="sr-only">
                      Day
                    </th>
                    {BLOCK_LABELS.map((label) => (
                        <th key={label} scope="col" className={styles.axisLabel}>
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activityGrid.map((row, day) => (
                    <tr key={DAY_LABELS[day]}>
                      <th scope="row" className={styles.axisLabel}>
                        {DAY_LABELS[day]}
                      </th>
                      {row.map((count, block) => {
                        const text = `${DAY_LABELS[day]} ${blockRange(block)}: ${count.toLocaleString("en-US")} comment${count === 1 ? "" : "s"}`;
                        return (
                          <td key={block} className="p-0">
                            <div
                              title={text}
                              aria-label={text}
                              role="img"
                              className={styles.heatCell}
                              style={{ opacity: count === 0 ? 0.06 : 0.1 + (0.9 * count) / activityMax }}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.note}>
              <strong>Best time to post:</strong> {DAY_LABELS[activityBest.day]}{" "}
              {blockRange(activityBest.block)} UTC
            </p>
          </>
        ) : (
          <p className={styles.emptyCopy}>
            No comments yet. Once your auto-DM rules start getting comments, your best posting times show up here.
          </p>
        )}
      </div>
      <div className={`${styles.panel} ${styles.peachPanel}`}>
        <h2>Last 14 days</h2>
        <p className={styles.subtle}>DMs sent and leads captured per day (UTC)</p>
        {hasDailyActivity ? (
          <>
            <div className={styles.legend}>
              <span className="inline-flex items-center gap-1.5">
                <span className={`${styles.legendSwatch} ${styles.violetSwatch}`} aria-hidden />
                DMs sent
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className={`${styles.legendSwatch} ${styles.coralSwatch}`} aria-hidden />
                Contacts
              </span>
            </div>
            <ul className={styles.dailyList}>
              {dailyActivity.map((row) => (
                <li key={row.day} className="flex items-start gap-2 sm:gap-3">
                  <span className={styles.dayLabel}>{shortDayUtc(row.day)}</span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className={styles.track}>
                        <div
                          className={`${styles.fill} ${styles.violetFill}`}
                          style={{ width: dailyMax > 0 ? `${(row.dms / dailyMax) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className={styles.chartValue}>{row.dms.toLocaleString("en-US")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`${styles.track} ${styles.smallTrack}`}>
                        <div
                          className={`${styles.fill} ${styles.coralFill}`}
                          style={{ width: dailyMax > 0 ? `${(row.leads / dailyMax) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className={styles.chartValue}>{row.leads.toLocaleString("en-US")}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.emptyCopy}>No activity in the last 14 days yet.</p>
        )}
      </div>
      <div className={`${styles.panel} ${styles.mintPanel}`}>
        <h2>Best time to post</h2>
        <p className={styles.subtle}>
          Hours (UTC) when people commented on your posts in the last 30 days.
        </p>
        {bestTimes.length > 0 ? (
          <>
            <div className={styles.pills}>
              {bestTimes.map((slot) => (
                <span
                  key={slot.hour}
                  className={styles.pill}
                >
                  {slot.label}
                  <span>({slot.count.toLocaleString("en-US")})</span>
                </span>
              ))}
            </div>
            <div className={styles.hourChart} role="img" aria-label="Comment volume by hour UTC">
              {hourBarCounts.map((count, hour) => {
                const heightPct = maxHourCount > 0 ? (count / maxHourCount) * 100 : 0;
                return (
                  <div
                    key={hour}
                    title={`${String(hour).padStart(2, "0")}:00 – ${count.toLocaleString("en-US")} comment${count === 1 ? "" : "s"}`}
                    className={styles.hourBar}
                    style={{ height: `${heightPct}%` }}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <p className={styles.emptyCopy}>
            Not enough comments yet. This fills in once your auto-DM rules start getting comments.
          </p>
        )}
      </div>
      {rules.length > 0 ? (
        <div className={styles.section}>
          <h2>Auto-DM rules</h2>
          <div className={styles.tableWrap}>
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className={styles.tableHead}>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Rule
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    DMs sent
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Failed
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Contacts
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Link clicks
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Click rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className={styles.tableRow}>
                    <td className="px-4 py-3">
                      <Link href="/app/auto-dm" className={ui.link}>
                        {rule.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`${styles.status} ${rule.status === "active" ? styles.activeStatus : ""}`}
                      >
                        {rule.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{rule.dmsSent.toLocaleString("en-US")}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{rule.dmsFailed.toLocaleString("en-US")}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{rule.leads.toLocaleString("en-US")}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{rule.clicks.toLocaleString("en-US")}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{clickRate(rule.clicks, rule.dmsSent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          text="Create your first auto-DM rule to see results here."
          art="/landing/card-dm.webp"
        >
          <BtnLink href="/app/auto-dm" size="sm">Create auto-DM rule</BtnLink>
        </EmptyState>
      )}
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
    </div>
  );
}
