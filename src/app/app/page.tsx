import Link from "next/link";
import { Plus, Instagram } from "lucide-react";
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
      {stats.hasAccount ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Next steps</h2>
          <ul className="mt-3 space-y-2 text-sm text-ink-2">
            <li><Link href="/app/auto-dm" className="text-brand hover:underline">Create an auto-DM rule</Link></li>
            <li><Link href="/app/calendar#new" className="text-brand hover:underline">Schedule a post</Link></li>
            <li><Link href="/app/leads" className="text-brand hover:underline">See your leads</Link></li>
          </ul>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <Instagram className="mx-auto h-8 w-8 text-brand" />
          <h2 className="mt-3 font-semibold">Connect your first account</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-2">Connect Instagram to schedule posts and turn comments into DMs and leads.</p>
          <Link href="/app/settings" className="btn-primary mt-5 inline-block rounded-full px-5 py-2 text-sm font-medium">Connect Instagram</Link>
        </div>
      )}
    </>
  );
}
