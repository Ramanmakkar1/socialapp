import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Check, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { instrumentSans } from "@/lib/fonts";
import { EMPTY_STATS, getDashboardStats, getUpcomingPosts } from "@/lib/stats";
import { BtnA, BtnLink } from "@/components/ui/kit";
import uiKit from "@/components/ui/ui.module.css";
import EmptyState from "./EmptyState";
import UpcomingPosts from "./UpcomingPosts";
import styles from "./dashboard.module.css";

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
    { done: stats.hasAccount, label: "Connect Instagram", href: "/api/instagram/connect" },
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
    <div className={`${instrumentSans.variable} ${styles.page}`}>
      <div className={styles.head}>
        <div>
          <p className={uiKit.eyebrow}>Your week</p>
          <h1>
            {greeting()}, <em>creator.</em>
          </h1>
          <p className={styles.lede}>Here&apos;s what your Instagram automation did for you.</p>
          {!stats.hasAccount && (
            <BtnA href="/api/instagram/connect">Connect Instagram</BtnA>
          )}
        </div>
        <BtnLink href="/app/calendar#new">
          <Plus width={16} height={16} aria-hidden="true" />
          New post
        </BtnLink>
      </div>
      {stats.failed > 0 && (
        <div role="alert" className={`${uiKit.notice} ${uiKit.noticeWarn}`}>
          <span>
            {stats.failed} {stats.failed === 1 ? "post" : "posts"} failed to publish.{" "}
          </span>
          <Link href="/app/calendar?status=failed" className={uiKit.link}>
            Review and retry
          </Link>
        </div>
      )}
      <div className={styles.tiles}>
        {tiles.map(([l, v, bg]) => (
          <div key={l} className={styles.tile} style={{ background: bg }}>
            <div className={styles.tileLabel}>{l}</div>
            <div className={styles.tileValue}>{v.toLocaleString("en-US")}</div>
          </div>
        ))}
      </div>
      <div className={styles.panels}>
        <section className={`${uiKit.card} min-w-0 p-5 sm:p-6`}>
          <div className={styles.panelHead}>
            <h2 className={styles.panelTitle}>Up next</h2>
            <Link href="/app/calendar" className={uiKit.link}>View calendar</Link>
          </div>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="Nothing scheduled yet"
              text="Your next queued posts will show here with local date and time."
              art="/illustrations/empty-calendar.webp"
              artWidth={1536}
              artHeight={1024}
            >
              <BtnLink href="/app/calendar#new" size="sm">Schedule your first post</BtnLink>
            </EmptyState>
          ) : (
            <UpcomingPosts posts={upcoming} />
          )}
        </section>
        {doneCount < 3 ? (
          <section className={`${uiKit.card} ${uiKit.band} min-w-0`}>
            <div className={styles.checklist}>
              <div className="min-w-0">
                <div className={styles.panelHead}>
                  <h2 className={styles.panelTitle}>Get set up in 3 minutes</h2>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <Link href="/help/getting-started" className={uiKit.link}>Help</Link>
                  <span className="text-sm" style={{ color: "var(--poskoo-muted)" }}>{doneCount} of 3 done</span>
                </div>
                <div className={styles.progress} role="progressbar" aria-valuemin={0} aria-valuemax={3} aria-valuenow={doneCount} aria-label="Setup progress">
                  <div className={styles.progressFill} style={{ width: `${(doneCount / 3) * 100}%` }} />
                </div>
                <ol className={styles.steps}>
                  {steps.map((step, index) => (
                    <li key={step.href} className={styles.step}>
                      <span
                        className={`${styles.stepDot} ${step.done ? styles.stepDotDone : ""}`}
                        aria-hidden="true"
                      >
                        {step.done ? <Check width={14} height={14} /> : index + 1}
                      </span>
                      <span className="sr-only">{step.done ? "Completed: " : ""}</span>
                      <div className={`${styles.stepLabel} ${step.done ? styles.stepLabelDone : ""}`}>
                        {step.done ? (
                          step.label
                        ) : (
                          <Link href={step.href} className={uiKit.link}>{step.label}</Link>
                        )}
                      </div>
                      {index === firstIncompleteIndex && (
                        <BtnLink href={step.href} size="sm" aria-label={`Start: ${step.label}`}>
                          Start
                        </BtnLink>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
              <div className={`${styles.checklistArt} min-w-0`}>
                {stats.hasAccount ? (
                  <Image
                    src="/landing/card-schedule.webp"
                    alt=""
                    width={1024}
                    height={1024}
                    sizes="200px"
                    className="h-auto w-full max-w-[200px] object-contain"
                  />
                ) : (
                  <Image
                    src="/illustrations/connect-account.webp"
                    alt=""
                    width={1536}
                    height={1024}
                    sizes="(max-width: 720px) 260px, 200px"
                    className="h-auto w-full max-w-[260px] object-contain"
                  />
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className={`${uiKit.card} min-w-0 p-5 sm:p-6`}>
            <h2 className={styles.panelTitle}>Next steps</h2>
            <ul className="mt-3 grid gap-1 text-[.95rem]" style={{ color: "var(--poskoo-ink)" }}>
              <li><Link href="/app/auto-dm" className={uiKit.link}>Create an auto-DM rule</Link></li>
              <li><Link href="/app/calendar#new" className={uiKit.link}>Schedule a post</Link></li>
              <li><Link href="/app/leads" className={uiKit.link}>See your leads</Link></li>
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
