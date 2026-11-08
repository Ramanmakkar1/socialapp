import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import { Check, Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { instrumentSans } from "@/lib/fonts";
import { EMPTY_STATS, getDashboardStats, getUpcomingPosts } from "@/lib/stats";
import { isDbConfigured, query } from "@/lib/db";
import { fetchIgProfile, type GraphAccount, type IgProfile } from "@/lib/igGraph";
import { fetchRecentMedia, type IgMediaItem } from "@/lib/igMedia";
import { automationSummary, getAutomationRows, getSnapshot, EMPTY_SNAPSHOT, pctChange } from "@/lib/homeStats";
import TodaysActions from "./TodaysActions";
import ActiveAutomations from "./ActiveAutomations";
import home from "./home.module.css";
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
async function igAccount(userId: string): Promise<GraphAccount | null> {
  if (!isDbConfigured()) return null;
  try {
    const rows = await query<GraphAccount>(
      "select id, external_id, access_token_enc, auth_type from socialapp.social_accounts where user_id=$1 and platform='instagram' and status='active' order by updated_at desc nulls last limit 1",
      [userId],
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

function Change({ cur, prev }: { cur: number; prev: number }) {
  const p = pctChange(cur, prev);
  if (p === null) return <span className={home.up}>New</span>;
  return <span className={p > 0 ? home.up : p < 0 ? home.down : undefined}>{p > 0 ? "+" : ""}{p}%</span>;
}

export default async function AppHome() {
  await connection();
  const user = await getCurrentUser();
  const stats = user ? await getDashboardStats(user.id) : EMPTY_STATS;
  const upcoming = user ? await getUpcomingPosts(user.id) : [];
  const [snapshot, automations, account] = user
    ? await Promise.all([getSnapshot(user.id), getAutomationRows(user.id), igAccount(user.id)])
    : [EMPTY_SNAPSHOT, [], null];
  let profile: IgProfile | null = null;
  let media: IgMediaItem[] = [];
  let mediaError = false;
  if (account) {
    const [p, m] = await Promise.allSettled([fetchIgProfile(account), fetchRecentMedia(account, 12)]);
    if (p.status === "fulfilled") profile = p.value;
    if (m.status === "fulfilled") media = m.value;
    else mediaError = true;
  }
  const username = profile?.username ? `@${profile.username}` : null;
  const automationOn = automations.some((a) => a.status === "active" && (a.triggers?.length ? a.triggers.includes("comment") : true));
  const activeCount = automations.filter((a) => a.status === "active").length;
  const snapTiles: { label: string; value: number; prev: number | null; dot: string; note?: string }[] = [
    { label: "DMs sent", value: snapshot.dmsSent, prev: snapshot.dmsSentPrev, dot: "var(--poskoo-coral)", note: `Queue: ${snapshot.dmQueue}` },
    { label: "Link clicks", value: snapshot.linkClicks, prev: snapshot.linkClicksPrev, dot: "var(--poskoo-violet)" },
    { label: "Leads collected", value: snapshot.leads, prev: snapshot.leadsPrev, dot: "var(--poskoo-green)" },
    { label: "Total followers", value: profile?.followers ?? 0, prev: null, dot: "var(--poskoo-peach)", note: profile?.mediaCount != null ? `${profile.mediaCount} posts` : undefined },
  ];
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
      <div className={home.welcomeRow}>
        <h1 className={home.welcome}>
          Welcome{username ? <> <em>{username}</em></> : ""}!
        </h1>
        <div className={home.actions}>
          <BtnLink href="/app/auto-dm" variant="lime">
            <Plus width={16} height={16} aria-hidden="true" />
            New automation
          </BtnLink>
          <BtnLink href="/app/calendar#new" variant="line">
            <Plus width={16} height={16} aria-hidden="true" />
            New post
          </BtnLink>
        </div>
      </div>

      {account && (
        <section className={home.section} aria-labelledby="todays-actions">
          <div className={home.sectionHead}>
            <div>
              <h2 id="todays-actions" className={home.sectionTitle}>Today&apos;s actions</h2>
              <p className={home.sectionSub}>
                {automationOn ? "All your recent posts have an automation." : "Add an automation so comments on your posts turn into DMs and leads."}
              </p>
            </div>
            <div className={home.headLinks}>
              <Link href="/app" className={uiKit.link}>Refresh</Link>
              {profile?.username && (
                <a href={`https://www.instagram.com/${encodeURIComponent(profile.username)}/`} target="_blank" rel="noopener noreferrer" className={uiKit.link}>
                  View all →
                </a>
              )}
            </div>
          </div>
          {media.length > 0 ? (
            <TodaysActions items={media} username={profile?.username ?? "instagram"} avatarUrl={profile?.profilePictureUrl ?? null} automationOn={automationOn} />
          ) : (
            <p className={home.notice}>
              {mediaError ? "We couldn't load your posts from Instagram right now. Try Refresh in a minute." : "No posts yet. Your latest posts and reels will show here."}
            </p>
          )}
        </section>
      )}

      {account && (
        <section className={home.section} aria-labelledby="snapshot">
          <div className={home.sectionHead}>
            <div>
              <h2 id="snapshot" className={home.sectionTitle}>Performance snapshot</h2>
              <p className={home.sectionSub}>Last 7 days</p>
            </div>
          </div>
          <div className={home.snap}>
            {snapTiles.map((t) => (
              <div key={t.label} className={home.stat}>
                <div className={home.statLabel}><span className={home.statDot} style={{ background: t.dot }} aria-hidden="true" />{t.label}</div>
                <div className={home.statValue}>{t.value.toLocaleString("en-US")}</div>
                <div className={home.statFoot}>
                  {t.prev !== null && <><Change cur={t.value} prev={t.prev} /><span>vs last 7 days</span></>}
                  {t.note && <span>{t.note}</span>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {account && (
        <section className={home.section} aria-labelledby="active-automations">
          <div className={home.sectionHead}>
            <div>
              <h2 id="active-automations" className={home.sectionTitle}>Active automations ({activeCount})</h2>
              <p className={home.sectionSub}>Running 24/7 to collect contacts</p>
            </div>
            <div className={home.headLinks}>
              <Link href="/app/auto-dm" className={uiKit.link}>View all →</Link>
            </div>
          </div>
          <ActiveAutomations
            rows={automations.map((a) => ({ id: a.id, name: a.name, status: a.status, summary: automationSummary(a), dmsSent: a.dmsSent, clicks: a.clicks }))}
          />
        </section>
      )}

      {!account && (
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
      )}
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
