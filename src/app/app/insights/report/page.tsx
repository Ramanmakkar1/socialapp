
import { buildGrowthSeries, getGrowthSnapshots, getPostPerformance, parsePeriod, PERIOD_OPTIONS } from "@/lib/analytics";
import { CommentTimes, GrowthChart } from "../Charts";
import { getCommentTimeCells } from "../commentTimes";
import { BRAND } from "@/lib/brand";
import LocalTime from "@/components/LocalTime";
import PrintButton from "./PrintButton";
import styles from "./report.module.css";
import { requireWorkspaceUser } from "@/lib/workspace";

export const metadata = { title: "Analytics report" };




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
  const user = await requireWorkspaceUser();
  const { range: rangeParam } = await searchParams;
  const period = parsePeriod(rangeParam);

  const [postPerformance, growthSnapshots, commentCells] = await Promise.all([
    getPostPerformance(user.id, period.range),
    getGrowthSnapshots(user.id, period.range),
    getCommentTimeCells(user.id),
  ]);

  const growthSeries = buildGrowthSeries(period.lastDay, period.days, growthSnapshots);
  const growthMax = growthSeries.reduce((max, row) => Math.max(max, row.followers), 0);
  const growthStart = growthSeries[0]?.followers ?? 0;
  const growthEnd = growthSeries[growthSeries.length - 1]?.followers ?? 0;

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
              {(growthEnd - growthStart).toLocaleString("en-US")} over {period.phrase}
            </p>
            <GrowthChart series={growthSeries} />
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
        <p className={styles.summary}>When your audience commented over the last 30 days.</p>
        <CommentTimes cells={commentCells} />
      </section>

      <footer className={styles.footer}>
        <p>
          {BRAND.name} · {BRAND.url} · Times in your browser time zone · Ranges: {PERIOD_OPTIONS.map((o) => o.label).join(" / ")}
        </p>
      </footer>
    </div>
  );
}
