import Link from "next/link";
import { Plus, Check } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { EMPTY_STATS, getDashboardStats } from "@/lib/stats";

export const metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Dashboard overview with the logged-in user's real numbers.
// Guests see zeros.
export default async function AppHome() {
  const user = await getCurrentUser();
  const stats = user ? await getDashboardStats(user.id) : EMPTY_STATS;
  const steps = [
    { done: stats.hasAccount, label: "Connect Instagram", href: "/app/settings" },
    { done: stats.hasRule, label: "Create your first auto-DM rule", href: "/app/auto-dm" },
    { done: stats.hasPost, label: "Schedule your first post", href: "/app/calendar#new" },
  ];
  const doneCount = steps.filter(s => s.done).length;
  const firstIncompleteIndex = steps.findIndex(s => !s.done);
  const tiles: [string, number][] = [
    ["Scheduled", stats.scheduled],
    ["DMs sent (7 days)", stats.dmsSent],
    ["Leads", stats.leads],
    ["Link clicks", stats.linkClicks],
  ];
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">{greeting()}</h1><p className="text-sm text-muted">Here&apos;s your week.</p></div>
        <Link href="/app/calendar#new" className="btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium"><Plus className="h-4 w-4" />New post</Link>
      </div>
      {stats.failed > 0 && (
        <div role="alert" className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-2 bg-surface p-4 text-sm"><span className="text-ink">{stats.failed} {stats.failed === 1 ? "post" : "posts"} failed to publish.</span><Link href="/app/calendar" className="font-medium text-brand hover:underline">Review and retry</Link></div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-line bg-surface p-5"><div className="text-sm text-muted">{l}</div><div className="mt-1 text-3xl font-semibold">{v.toLocaleString("en-US")}</div></div>
        ))}
      </div>
      {doneCount < 3 ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Get set up in 3 minutes</h2>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <Link href="/help/getting-started" className="text-brand hover:underline">
                Help
              </Link>
              <span className="text-muted">{doneCount} of 3 done</span>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-line">
            <div className="h-2 rounded-full bg-brand" style={{ width: `${(doneCount / 3) * 100}%` }} />
          </div>
          <ol className="mt-4 space-y-3">
            {steps.map((step, index) => (
              <li key={step.href} className="flex flex-wrap items-center gap-3">
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${step.done ? "bg-brand text-white" : "border border-line text-muted"}`}>
                  {step.done ? <><Check className="h-4 w-4" aria-hidden="true" /><span className="sr-only">Completed:</span></> : index + 1}
                </span>
                <div className="min-w-0 flex-1 text-sm">
                  {step.done ? (
                    <span className="text-muted line-through">{step.label}</span>
                  ) : (
                    <Link href={step.href} className="font-medium text-brand hover:underline">{step.label}</Link>
                  )}
                </div>
                {index === firstIncompleteIndex && (
                  <Link href={step.href} className="btn-primary rounded-full px-3 py-1 text-xs" aria-label={`Start: ${step.label}`}>Start</Link>
                )}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Next steps</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            <li><Link href="/app/auto-dm" className="text-brand hover:underline">Create an auto-DM rule</Link></li>
            <li><Link href="/app/calendar#new" className="text-brand hover:underline">Schedule a post</Link></li>
            <li><Link href="/app/leads" className="text-brand hover:underline">See your leads</Link></li>
          </ul>
        </div>
      )}
    </>
  );
}
