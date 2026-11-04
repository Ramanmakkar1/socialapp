import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { requireUser } from "@/lib/auth";
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
