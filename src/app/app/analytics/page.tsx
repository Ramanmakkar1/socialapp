import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { hourBars, topHours } from "@/lib/bestTime";
import { isDbConfigured, query } from "@/lib/db";
import { getCommentActivity, getDailyActivity, getDashboardStats, getRecentPosts, getRuleStats } from "@/lib/stats";
import EmptyState from "../EmptyState";

export const metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

function clickRate(clicks: number, dmsSent: number): string {
  if (dmsSent === 0) return "—";
  return `${((clicks / dmsSent) * 100).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
}

function shortCaption(caption: string): string {
  const text = caption.trim();
  if (!text) return "(no caption)";
  return text.length > 60 ? `${text.slice(0, 60).trimEnd()}…` : text;
}

function formatPublished(value: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BLOCK_LABELS = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"];

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

export default async function AnalyticsPage() {
  const user = await requireUser();
  const [stats, rules, recentPosts, activity, dailyActivity] = await Promise.all([
    getDashboardStats(user.id),
    getRuleStats(user.id),
    getRecentPosts(user.id),
    getCommentActivity(user.id),
    getDailyActivity(user.id),
  ]);

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

  const tiles: [string, number][] = [
    ["Scheduled", stats.scheduled],
    ["DMs sent (7 days)", stats.dmsSent],
    ["Leads", stats.leads],
    ["Link clicks", stats.linkClicks],
  ];

  return (
    <>
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-sm text-muted">See how your posts and DMs perform.</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-line bg-surface p-5">
            <div className="text-sm text-muted">{l}</div>
            <div className="mt-1 text-3xl font-semibold">{v.toLocaleString("en-US")}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-lg font-semibold">When your audience comments</h2>
        <p className="mt-1 text-sm text-muted">Last 30 days, times in UTC</p>
        {activityTotal > 0 ? (
          <>
            <div className="mt-4 overflow-x-auto">
              <table className="border-separate border-spacing-1 text-xs">
                <thead>
                  <tr>
                    <th scope="col" className="sr-only">
                      Day
                    </th>
                    {BLOCK_LABELS.map((label) => (
                      <th key={label} scope="col" className="px-1 text-center font-medium text-muted">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activityGrid.map((row, day) => (
                    <tr key={DAY_LABELS[day]}>
                      <th scope="row" className="pr-2 text-left font-medium text-muted">
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
                              className="h-7 w-9 rounded-md bg-brand"
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
            <p className="mt-4 text-sm">
              <span className="font-medium">Best time to post:</span> {DAY_LABELS[activityBest.day]}{" "}
              {blockRange(activityBest.block)} UTC
            </p>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">
            No comments yet. Once your auto-DM rules start getting comments, your best posting times show up here.
          </p>
        )}
      </div>
      <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-lg font-semibold">Last 14 days</h2>
        <p className="mt-1 text-sm text-muted">DMs sent and leads captured per day (UTC)</p>
        {hasDailyActivity ? (
          <>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-4 shrink-0 rounded-sm bg-brand" aria-hidden />
                DMs sent
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-4 shrink-0 rounded-sm bg-brand-2" aria-hidden />
                Leads
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {dailyActivity.map((row) => (
                <li key={row.day} className="flex items-start gap-2 sm:gap-3">
                  <span className="w-11 shrink-0 pt-0.5 text-sm text-muted sm:w-12">{shortDayUtc(row.day)}</span>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex h-3 min-w-0 flex-1 rounded bg-bg">
                        <div
                          className="h-full min-w-0 rounded bg-brand"
                          style={{ width: dailyMax > 0 ? `${(row.dms / dailyMax) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-sm tabular-nums">{row.dms.toLocaleString("en-US")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-2 min-w-0 flex-1 rounded bg-bg">
                        <div
                          className="h-full min-w-0 rounded bg-brand-2"
                          style={{ width: dailyMax > 0 ? `${(row.leads / dailyMax) * 100}%` : "0%" }}
                        />
                      </div>
                      <span className="w-8 shrink-0 text-right text-sm tabular-nums">{row.leads.toLocaleString("en-US")}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">No activity in the last 14 days yet.</p>
        )}
      </div>
      <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
        <h2 className="text-lg font-semibold">Best time to post</h2>
        <p className="mt-1 text-sm text-muted">
          Hours (UTC) when people commented on your posts in the last 30 days.
        </p>
        {bestTimes.length > 0 ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2">
              {bestTimes.map((slot) => (
                <span
                  key={slot.hour}
                  className="inline-flex items-center rounded-full border border-line bg-bg px-3 py-1 text-sm font-medium"
                >
                  {slot.label}
                  <span className="ml-1.5 text-muted tabular-nums">({slot.count.toLocaleString("en-US")})</span>
                </span>
              ))}
            </div>
            <div className="mt-5 flex h-24 items-end gap-1" role="img" aria-label="Comment volume by hour UTC">
              {hourBarCounts.map((count, hour) => {
                const heightPct = maxHourCount > 0 ? (count / maxHourCount) * 100 : 0;
                return (
                  <div
                    key={hour}
                    title={`${String(hour).padStart(2, "0")}:00 – ${count.toLocaleString("en-US")} comment${count === 1 ? "" : "s"}`}
                    className="min-h-0 flex-1 rounded-sm bg-brand"
                    style={{ height: `${heightPct}%` }}
                  />
                );
              })}
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Not enough comments yet. This fills in once your auto-DM rules start getting comments.
          </p>
        )}
      </div>
      {rules.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Auto-DM rules</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
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
                    Leads
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
                  <tr key={rule.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">
                      <Link href="/app/auto-dm" className="font-medium text-brand hover:underline">
                        {rule.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full border border-line px-2 py-0.5 text-xs font-medium ${
                          rule.status === "active" ? "text-brand" : "text-muted"
                        }`}
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
        <>
          <EmptyState
            icon={BarChart3}
            title="No analytics yet"
            text="Create your first auto-DM rule to see results here."
            phase={3}
          />
          <div className="mt-4 text-center">
            <Link href="/app/auto-dm" className="btn-primary inline-block rounded-full px-5 py-2 text-sm font-medium">
              Create auto-DM rule
            </Link>
          </div>
        </>
      )}
      {recentPosts.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-lg font-semibold">Recent posts</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-line bg-surface">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-muted">
                  <th scope="col" className="px-4 py-3 font-medium">
                    Post
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Published
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Platforms
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Auto-DM rule
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentPosts.map((post) => (
                  <tr key={post.id} className="border-b border-line last:border-b-0">
                    <td className="px-4 py-3">{shortCaption(post.caption)}</td>
                    <td className="px-4 py-3 tabular-nums">{formatPublished(post.publishedAt)}</td>
                    <td className="px-4 py-3">{formatPlatforms(post.platforms)}</td>
                    <td className="px-4 py-3">{post.ruleName ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <p className="mt-8 text-sm text-muted">No posts published in the last 30 days.</p>
      )}
    </>
  );
}
