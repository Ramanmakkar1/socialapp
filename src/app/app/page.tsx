import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Plus, Check, Calendar } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { instrumentSerif } from "@/lib/fonts";
import { EMPTY_STATS, getDashboardStats, getUpcomingPosts } from "@/lib/stats";
import EmptyState from "./EmptyState";
import UpcomingPosts from "./UpcomingPosts";

export const metadata = { title: "Dashboard" };

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// Dashboard overview with the logged-in user's real numbers.
// Guests see zeros.
export default async function AppHome() {
  await connection();
  const user = await getCurrentUser();
  const stats = user ? await getDashboardStats(user.id) : EMPTY_STATS;
  const upcoming = user ? await getUpcomingPosts(user.id) : [];
  const steps = [
    { done: stats.hasAccount, label: "Connect Instagram", href: "/app/settings" },
    { done: stats.hasRule, label: "Create your first auto-DM rule", href: "/app/auto-dm" },
    { done: stats.hasPost, label: "Schedule your first post", href: "/app/calendar#new" },
  ];
  const doneCount = steps.filter(s => s.done).length;
  const firstIncompleteIndex = steps.findIndex(s => !s.done);
  const tiles: [string, number, string][] = [
    ["Scheduled", stats.scheduled, "var(--poskoo-lilac)"],
    ["DMs sent (7 days)", stats.dmsSent, "var(--poskoo-peach)"],
    ["Leads", stats.leads, "var(--poskoo-mint)"],
    ["Link clicks", stats.linkClicks, "var(--poskoo-pink)"],
  ];
  return (
    <div className={instrumentSerif.variable}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl">
            {greeting()}{" "}
            <em className="font-[family-name:var(--font-instrument-serif)] font-normal italic text-brand">
              creator
            </em>
          </h1>
          <p className="mt-2 text-sm text-muted sm:text-base">Here&apos;s your week.</p>
        </div>
        <Link
          href="/app/calendar#new"
          className="btn-primary inline-flex min-h-11 items-center gap-2 rounded-full px-6 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />New post
        </Link>
      </div>
      {stats.failed > 0 && (
        <div
          role="alert"
          className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[var(--poskoo-radius-card)] border border-line bg-surface p-4 text-sm"
        >
          <span className="text-ink">
            {stats.failed} {stats.failed === 1 ? "post" : "posts"} failed to publish.
          </span>
          <Link
            href="/app/calendar?status=failed"
            className="inline-flex min-h-11 items-center font-medium text-brand hover:underline"
          >
            Review and retry
          </Link>
        </div>
      )}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map(([l, v, bg]) => (
          <div
            key={l}
            className="rounded-[var(--poskoo-radius-card)] border border-line p-5"
            style={{ background: bg }}
          >
            <div className="text-sm text-ink-2">{l}</div>
            <div className="mt-1 break-words text-3xl font-semibold text-ink">{v.toLocaleString("en-US")}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 items-start xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="min-w-0 rounded-[var(--poskoo-radius-card)] border border-line bg-surface p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Up next</h2>
            <Link href="/app/calendar" className="inline-flex min-h-11 items-center text-sm font-medium text-brand hover:underline">
              View calendar
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nothing scheduled yet"
              text="Your next queued posts will show here with local date and time."
            >
              <Link
                href="/app/calendar#new"
                className="btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2 text-sm font-medium"
              >
                Schedule your first post
              </Link>
            </EmptyState>
          ) : (
            <UpcomingPosts posts={upcoming} />
          )}
        </div>
        {doneCount < 3 ? (
          <div className="min-w-0 overflow-hidden rounded-[var(--poskoo-radius-card)] border border-line bg-surface">
            <div className="grid gap-6 p-5 sm:p-6 md:grid-cols-2 md:items-center">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold">Get set up in 3 minutes</h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <Link href="/help/getting-started" className="inline-flex min-h-11 items-center text-brand hover:underline">
                      Help
                    </Link>
                    <span className="text-muted">{doneCount} of 3 done</span>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-line">
                  <div className="h-2 rounded-full bg-brand" style={{ width: `${(doneCount / 3) * 100}%` }} />
                </div>
                <ol className="mt-4 space-y-2">
                  {steps.map((step, index) => (
                    <li key={step.href} className="flex flex-wrap items-center gap-3">
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${step.done ? "bg-brand text-white" : "border border-line text-muted"}`}
                      >
                        {step.done ? (
                          <>
                            <Check className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Completed:</span>
                          </>
                        ) : (
                          index + 1
                        )}
                      </span>
                      <div className="min-w-0 flex-1 text-sm">
                        {step.done ? (
                          <span className="text-muted line-through">{step.label}</span>
                        ) : (
                          <Link
                            href={step.href}
                            className="inline-flex min-h-11 items-center font-medium text-brand hover:underline"
                          >
                            {step.label}
                          </Link>
                        )}
                      </div>
                      {index === firstIncompleteIndex && (
                        <Link
                          href={step.href}
                          className="btn-primary inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium"
                          aria-label={`Start: ${step.label}`}
                        >
                          Start
                        </Link>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
              <div className="min-w-0">
                <Image
                  src="/landing/card-schedule.webp"
                  alt=""
                  width={1024}
                  height={1024}
                  sizes="240px"
                  className="mx-auto h-auto w-full max-w-[240px] object-contain"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="min-w-0 rounded-[var(--poskoo-radius-card)] border border-line bg-surface p-5 sm:p-6">
            <h2 className="font-semibold">Next steps</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-2">
              <li><Link href="/app/auto-dm" className="inline-flex min-h-11 items-center text-brand hover:underline">Create an auto-DM rule</Link></li>
              <li><Link href="/app/calendar#new" className="inline-flex min-h-11 items-center text-brand hover:underline">Schedule a post</Link></li>
              <li><Link href="/app/leads" className="inline-flex min-h-11 items-center text-brand hover:underline">See your leads</Link></li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
