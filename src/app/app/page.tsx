import Link from "next/link";
import { connection } from "next/server";
import { Plus } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { instrumentSans } from "@/lib/fonts";
import { EMPTY_STATS, getDashboardStats, getRecentPosts, getUpcomingPosts } from "@/lib/stats";
import { isDbConfigured, query } from "@/lib/db";
import { fetchIgProfile, type GraphAccount, type IgProfile } from "@/lib/igGraph";
import { fetchRecentMedia, type IgMediaItem } from "@/lib/igMedia";
import { automationSummary, getAutomationRows, getSnapshot, EMPTY_SNAPSHOT, pctChange } from "@/lib/homeStats";
import { filterComments, loadInbox } from "@/lib/inbox";
import TodaysActions from "./TodaysActions";
import ActiveAutomations from "./ActiveAutomations";
import FirstSessionChecklist from "./FirstSessionChecklist";
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

// Count of open, visible comments — same rule as the inbox "Unanswered" filter.
async function unansweredComments(userId: string): Promise<number> {
  if (!isDbConfigured()) return 0;
  try {
    const data = await loadInbox(userId);
    return filterComments(data.comments, "unanswered").length;
  } catch {
    return 0;
  }
}

// Any post row for this user (drafts included) — "created a post" signal.
async function hasAnyPost(userId: string): Promise<boolean> {
  if (!isDbConfigured()) return false;
  try {
    const rows = await query<{ n: boolean }>(
      "select exists(select 1 from socialapp.scheduled_posts where user_id=$1) as n",
      [userId],
    );
    return rows[0]?.n ?? false;
  } catch {
    return false;
  }
}

function Change({ cur, prev }: { cur: number; prev: number }) {
  const p = pctChange(cur, prev);
  if (p === null) return <span className={home.up}>New</span>;
  return <span className={p > 0 ? home.up : p < 0 ? home.down : undefined}>{p > 0 ? "+" : ""}{p}%</span>;
}

function weekCutoff(): number {
  return Date.now() - 7 * 24 * 60 * 60 * 1000;
}

function postLabel(caption: string): string {
  const text = caption.trim();
  if (!text) return "Untitled post";
  return text.length > 48 ? `${text.slice(0, 48).trimEnd()}…` : text;
}

export default async function AppHome() {
  await connection();
  const user = await getCurrentUser();
  const stats = user ? await getDashboardStats(user.id) : EMPTY_STATS;
  const upcoming = user ? await getUpcomingPosts(user.id) : [];
  const [snapshot, automations, account, postCreated, unanswered, recentPosts] = user
    ? await Promise.all([getSnapshot(user.id), getAutomationRows(user.id), igAccount(user.id), hasAnyPost(user.id), unansweredComments(user.id), getRecentPosts(user.id)])
    : [EMPTY_SNAPSHOT, [], null, false, 0, []];
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
  const weekAgo = weekCutoff();
  const weekPosts = recentPosts.filter((post) => {
    if (!post.publishedAt) return false;
    const published = new Date(post.publishedAt).getTime();
    return Number.isFinite(published) && published >= weekAgo;
  });
  const topPost = weekPosts
    .map((post) => ({
      post,
      engagement:
        (post.insights?.likes ?? 0) +
        (post.insights?.comments ?? 0) +
        (post.insights?.saved ?? 0) +
        post.dmsSent +
        post.linkClicks +
        post.leads,
    }))
    .filter((row) => row.engagement > 0)
    .sort((a, b) => b.engagement - a.engagement)[0];
  const weekMetrics = [
    { label: "DMs sent", value: snapshot.dmsSent, prev: snapshot.dmsSentPrev },
    { label: "Link clicks", value: snapshot.linkClicks, prev: snapshot.linkClicksPrev },
    { label: "Leads", value: snapshot.leads, prev: snapshot.leadsPrev },
  ];
  const observations: { text: string; href: string; label: string }[] = [];
  if (stats.hasAccount) {
    if (topPost) {
      observations.push({
        text: `“${postLabel(topPost.post.caption)}” had the most engagement this week (${topPost.engagement.toLocaleString("en-US")} interactions).`,
        href: "/app/analytics?range=7",
        label: "See post analytics",
      });
    } else if (weekPosts.length === 0) {
      observations.push({
        text: "No posts published in the last 7 days. Publish one to start seeing results here.",
        href: "/app/calendar#new",
        label: "Schedule a post",
      });
    }
    if (stats.scheduled > 0) {
      observations.push({
        text: `${stats.scheduled.toLocaleString("en-US")} ${stats.scheduled === 1 ? "post is" : "posts are"} scheduled and waiting to publish.`,
        href: "/app/calendar",
        label: "Open calendar",
      });
    } else if (weekPosts.length > 0) {
      observations.push({
        text: "Nothing is scheduled yet. Plan your next post so your week stays active.",
        href: "/app/calendar#new",
        label: "Schedule a post",
      });
    }
  }
  const weeklyObservations = observations.slice(0, 2);
  const checklistDone = stats.hasAccount && postCreated && stats.hasPost;
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
          <Link href="/app/inbox?filter=unanswered" className={`${home.stat} ${home.quick}`}>
            <div className={home.statLabel}>
              <span className={home.statDot} style={{ background: "var(--poskoo-coral)" }} aria-hidden="true" />
              Unanswered comments
            </div>
            <div className={home.statValue}>{unanswered.toLocaleString("en-US")}</div>
            <div className={home.statFoot}>
              <span>
                {unanswered === 0
                  ? "You're all caught up — no comments waiting for a reply."
                  : "Reply from your inbox before they go cold."}
              </span>
            </div>
          </Link>
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

      <section className={home.section} aria-labelledby="weekly-summary">
        <div className={home.sectionHead}>
          <div>
            <h2 id="weekly-summary" className={home.sectionTitle}>Weekly summary</h2>
            <p className={home.sectionSub}>Last 7 days compared with the 7 days before</p>
          </div>
          <Link href="/app/analytics?range=7" className={uiKit.link}>Open analytics →</Link>
        </div>
        <div className={home.weekCard}>
          {stats.hasAccount ? (
            <div className={home.weekMetrics}>
              {weekMetrics.map((metric) => (
                <div key={metric.label} className={home.weekMetric}>
                  <span className={home.weekMetricLabel}>{metric.label}</span>
                  <span className={home.weekMetricValue}>{metric.value.toLocaleString("en-US")}</span>
                  <span className={home.weekMetricChange}>
                    <Change cur={metric.value} prev={metric.prev} /> vs previous 7 days
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={home.weekEmpty}>
              Connect Instagram to start tracking your weekly results.{" "}
              <Link href="/api/instagram/connect" className={uiKit.link}>Connect Instagram →</Link>
            </p>
          )}
          {weeklyObservations.length > 0 && (
            <ul className={home.weekNotes}>
              {weeklyObservations.map((observation) => (
                <li key={observation.text} className={home.weekNote}>
                  <span>{observation.text}</span>
                  <Link href={observation.href} className={uiKit.link}>{observation.label} →</Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

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
        {checklistDone ? (
          <section className={`${uiKit.card} min-w-0 p-5 sm:p-6`}>
            <h2 className={styles.panelTitle}>Next steps</h2>
            <ul className="mt-3 grid gap-1 text-[.95rem]" style={{ color: "var(--poskoo-ink)" }}>
              <li><Link href="/app/auto-dm" className={uiKit.link}>Create an auto-DM rule</Link></li>
              <li><Link href="/app/calendar#new" className={uiKit.link}>Schedule a post</Link></li>
              <li><Link href="/app/leads" className={uiKit.link}>See your leads</Link></li>
            </ul>
          </section>
        ) : (
          <FirstSessionChecklist
            connected={stats.hasAccount}
            postCreated={postCreated}
            postScheduled={stats.hasPost}
          />
        )}
      </div>
    </div>
  );
}
