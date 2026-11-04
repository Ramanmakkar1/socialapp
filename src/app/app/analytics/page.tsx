import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { hourBars, topHours } from "@/lib/bestTime";
import { isDbConfigured, query } from "@/lib/db";
import { getDashboardStats, getRuleStats } from "@/lib/stats";
import EmptyState from "../EmptyState";

export const metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

function clickRate(clicks: number, dmsSent: number): string {
  if (dmsSent === 0) return "—";
  return `${((clicks / dmsSent) * 100).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
}

export default async function AnalyticsPage() {
  const user = await requireUser();
  const [stats, rules] = await Promise.all([getDashboardStats(user.id), getRuleStats(user.id)]);

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
    </>
  );
}
