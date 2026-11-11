import { requireUser } from "@/lib/auth";
import { hourBars, topHours } from "@/lib/bestTime";
import { buildGrowthSeries, getGrowthSnapshots, getPostPerformance, parsePeriod, PERIOD_OPTIONS } from "@/lib/analytics";
import { isDbConfigured, query } from "@/lib/db";
import { getCommentActivity } from "@/lib/stats";
import { BRAND } from "@/lib/brand";
import LocalTime from "@/components/LocalTime";
import PrintButton from "./PrintButton";
import styles from "./report.module.css";

export const metadata = { title: "Analytics report" };

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BLOCK_LABELS = ["12a", "3a", "6a", "9a", "12p", "3p", "6p", "9p"];

function blockRange(block: number): string {
  return `${BLOCK_LABELS[block]}–${BLOCK_LABELS[(block + 1) % 8]}`;
}

function shortDayUtc(day: string): string {
  const d = new Date(`${day}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function shortCaption(caption: string): string {
  const text = caption.trim();
  if (!text) return "(no caption)";
  return text.length > 60 ? `${text.slice(0, 60).trimEnd()}…` : text;
}

function formatMetric(value: number | null): string {
  return value == null ? "—" : value.toLocaleString("en-US");
}

function formatPlatforms(platforms: string[]): string {
  return platforms.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(", ");
}

export default async function AnalyticsReportPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const user = await requireUser();
  const { range: rangeParam } = await searchParams;
  const period = parsePeriod(rangeParam);

  const [postPerformance, growthSnapshots, activity] = await Promise.all([
    getPostPerformance(user.id, period.range),
    getGrowthSnapshots(user.id, period.range),
    getCommentActivity(user.id),
  ]);

  const growthSeries = buildGrowthSeries(period.lastDay, period.days, growthSnapshots);
  const growthMax = growthSeries.reduce((max, row) => Math.max(max, row.followers), 0);
  const growthStart = growthSeries[0]?.followers ?? 0;
  const growthEnd = growthSeries[growthSeries.length - 1]?.followers ?? 0;

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

  const generatedAt = new Date();

  return (
    <div className={styles.report}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{BRAND.name} · Analytics report</p>
          <h1 className={styles.title}>Post performance, {period.phrase}</h1>
          <p className={styles.meta}>
            {user.email} · Generated {generatedAt.toLocaleDateString("en-US", { dateStyle: "medium" })}
          </p>
        </div>
        <PrintButton />
      </header>

      <section className={styles.section}>
        <h2 className={styles.h2}>Account growth</h2>
        {growthMax > 0 ? (
          <>
            <p className={styles.summary}>
              {growthEnd.toLocaleString("en-US")} followers now ·{" "}
              {growthEnd - growthStart >= 0 ? "+" : ""}
              {(growthEnd - growthStart).toLocaleString("en-US")} over {period.phrase}.
            </p>
            <ul className={styles.growthList}>
              {growthSeries.map((row) => (
                <li key={row.day} className={styles.growthRow}>
                  <span className={styles.growthDay}>{shortDayUtc(row.day)}</span>
                  <span className={styles.growthTrack}>
                    <span
                      className={styles.growthFill}
                      style={{ width: growthMax > 0 ? `${(row.followers / growthMax) * 100}%` : "0%" }}
                    />
                  </span>
                  <span className={styles.growthValue}>{row.followers.toLocaleString("en-US")}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className={styles.summary}>No follower snapshots in this period yet.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Post performance</h2>
        {postPerformance.length > 0 ? (
          <div className={styles.tableWrap}>
            <table className={styles.reportTable}>
              <thead>
                <tr>
                  <th scope="col">Post</th>
                  <th scope="col">Published</th>
                  <th scope="col">Platforms</th>
                  <th scope="col" className={styles.num}>Reach</th>
                  <th scope="col" className={styles.num}>Views</th>
                  <th scope="col" className={styles.num}>Likes</th>
                  <th scope="col" className={styles.num}>Comments</th>
                  <th scope="col" className={styles.num}>Saves</th>
                  <th scope="col" className={styles.num}>Link clicks</th>
                </tr>
              </thead>
              <tbody>
                {postPerformance.map((row) => (
                  <tr key={row.id}>
                    <td>{shortCaption(row.caption)}</td>
                    <td className={styles.num}>
                      <LocalTime value={row.publishedAt} style="medium" fallback="—" />
                    </td>
                    <td>{formatPlatforms(row.platforms)}</td>
                    <td className={styles.num}>{formatMetric(row.reach)}</td>
                    <td className={styles.num}>{formatMetric(row.impressions)}</td>
                    <td className={styles.num}>{formatMetric(row.likes)}</td>
                    <td className={styles.num}>{formatMetric(row.comments)}</td>
                    <td className={styles.num}>{formatMetric(row.saved)}</td>
                    <td className={styles.num}>{row.linkClicks.toLocaleString("en-US")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className={styles.summary}>No published posts for {period.phrase}.</p>
        )}
      </section>

      <section className={styles.section}>
        <h2 className={styles.h2}>Best time to post</h2>
        {bestTimes.length > 0 ? (
          <p className={styles.summary}>
            Your audience commented most at:{" "}
            {bestTimes.map((slot, i) => (
              <span key={slot.hour}>
                {i > 0 ? ", " : ""}
                {slot.label} ({slot.count.toLocaleString("en-US")})
              </span>
            ))}
            .
          </p>
        ) : (
          <p className={styles.summary}>Not enough comments yet to suggest a best time.</p>
        )}
        {activityTotal > 0 ? (
          <>
            <div className={styles.heatmapWrap}>
              <table className={styles.heatmap}>
                <thead>
                  <tr>
                    <th scope="col" className={styles.axisLabel}>Day</th>
                    {BLOCK_LABELS.map((label) => (
                      <th key={label} scope="col" className={styles.axisLabel}>{label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activityGrid.map((row, day) => (
                    <tr key={DAY_LABELS[day]}>
                      <th scope="row" className={styles.axisLabel}>{DAY_LABELS[day]}</th>
                      {row.map((count, block) => (
                        <td key={block} className="p-0">
                          <div
                            role="img"
                            aria-label={`${DAY_LABELS[day]} ${blockRange(block)}: ${count} comment${count === 1 ? "" : "s"}`}
                            className={styles.heatCell}
                            style={{ opacity: count === 0 ? 0.06 : 0.1 + (0.9 * count) / activityMax }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.summary}>
              <strong>Best time to post:</strong> {DAY_LABELS[activityBest.day]} {blockRange(activityBest.block)} UTC
            </p>
          </>
        ) : null}
        {maxHourCount > 0 ? (
          <div className={styles.hourChart} role="img" aria-label="Comment volume by hour UTC">
            {hourBarCounts.map((count, hour) => (
              <div
                key={hour}
                title={`${String(hour).padStart(2, "0")}:00 – ${count} comment${count === 1 ? "" : "s"}`}
                className={styles.hourBar}
                style={{ height: `${maxHourCount > 0 ? (count / maxHourCount) * 100 : 0}%` }}
              />
            ))}
          </div>
        ) : null}
      </section>

      <footer className={styles.footer}>
        <p>
          {BRAND.name} · {BRAND.url} · Times in UTC · Ranges: {PERIOD_OPTIONS.map((o) => o.label).join(" / ")}
        </p>
      </footer>
    </div>
  );
}
