import Link from "next/link";
import { connection } from "next/server";
import { AlertTriangle, ArrowRight, Heart, Inbox, Link2, MessageCircle, Plus, RefreshCw, Send, Trophy, UserPlus, Users } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { instrumentSans } from "@/lib/fonts";
import { EMPTY_STATS, getDashboardStats, getRecentPosts, getUpcomingPosts, type RecentPost } from "@/lib/stats";
import { isDbConfigured, query } from "@/lib/db";
import { fetchIgProfile, type GraphAccount, type IgProfile } from "@/lib/igGraph";
import { fetchRecentMedia, type IgMediaItem } from "@/lib/igMedia";
import { automationSummary, getAutomationRows, getSnapshot, EMPTY_SNAPSHOT, pctChange } from "@/lib/homeStats";
import { filterComments, loadInbox } from "@/lib/inbox";
import { ruleMatchesMedia } from "@/lib/ruleMedia";
import TodaysActions from "./TodaysActions";
import ActiveAutomations from "./ActiveAutomations";
import FirstSessionChecklist from "./FirstSessionChecklist";
import home from "./home.module.css";
import { BtnLink } from "@/components/ui/kit";
import EmptyState from "./EmptyState";
import UpcomingPosts from "./UpcomingPosts";

export const metadata = { title: "Dashboard" };

type IgRow = GraphAccount & { username: string | null };

async function igAccount(userId: string): Promise<IgRow | null> {
  if (!isDbConfigured()) return null;
  try {
    const rows = await query<IgRow>(
      "select id, external_id, access_token_enc, auth_type, username from socialapp.social_accounts where user_id=$1 and platform='instagram' and status='active' order by updated_at desc nulls last limit 1",
      [userId],
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

// Handle for the greeting even when the Graph profile call fails.
async function anyHandle(userId: string): Promise<string | null> {
  if (!isDbConfigured()) return null;
  try {
    const rows = await query<{ username: string | null }>(
      "select username from socialapp.social_accounts where user_id=$1 and platform='instagram' and username is not null order by updated_at desc nulls last limit 1",
      [userId],
    );
    return rows[0]?.username ?? null;
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
    const rows = await query<{ n: boolean }>("select exists(select 1 from socialapp.scheduled_posts where user_id=$1) as n", [userId]);
    return rows[0]?.n ?? false;
  } catch {
    return false;
  }
}

// Followers now and 7 days ago from the daily account snapshots (null when not tracked).
async function followerTrend(userId: string): Promise<{ now: number | null; prev: number | null }> {
  if (!isDbConfigured()) return { now: null, prev: null };
  try {
    const rows = await query<{ now: number | null; prev: number | null }>(
      `select (select followers::int from socialapp.account_snapshots where user_id=$1 order by taken_at desc limit 1) as now,
              (select followers::int from socialapp.account_snapshots where user_id=$1 and taken_at <= now() - interval '7 days' order by taken_at desc limit 1) as prev`,
      [userId],
    );
    return rows[0] ?? { now: null, prev: null };
  } catch {
    return { now: null, prev: null };
  }
}

// Active comment rules with their post scope, to tell per post whether an automation covers it.
async function commentRuleScopes(userId: string): Promise<{ media_ids: string[] }[]> {
  if (!isDbConfigured()) return [];
  try {
    return await query<{ media_ids: string[] }>(
      "select coalesce(media_ids, '{}') as media_ids from socialapp.dm_rules where user_id=$1 and status='active' and (triggers is null or cardinality(triggers)=0 or 'comment' = any(triggers))",
      [userId],
    );
  } catch {
    return [];
  }
}

async function postThumbs(ids: string[]): Promise<Map<string, string>> {
  if (!isDbConfigured() || ids.length === 0) return new Map();
  try {
    const rows = await query<{ id: string; thumb: string | null }>(
      "select id, media->0->>'url' as thumb from socialapp.scheduled_posts where id = any($1::uuid[])",
      [ids],
    );
    return new Map(rows.filter((r) => r.thumb && /^https:\/\//.test(r.thumb)).map((r) => [r.id, r.thumb as string]));
  } catch {
    return new Map();
  }
}

function Change({ cur, prev }: { cur: number; prev: number | null }) {
  if (prev === null) return null;
  const p = pctChange(cur, prev);
  if (p === null) return null;
  return (
    <span className={`${home.delta} ${p > 0 ? home.deltaUp : p < 0 ? home.deltaDown : ""}`}>
      {p > 0 ? "+" : ""}{p}%
    </span>
  );
}

function engagementOf(post: RecentPost): number {
  return (post.insights?.likes ?? 0) + (post.insights?.comments ?? 0) + (post.insights?.saved ?? 0) + post.dmsSent + post.linkClicks + post.leads;
}

function shortCaption(caption: string, max = 70): string {
  const text = caption.trim();
  if (!text) return "Untitled post";
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
}

const n = (v: number | null | undefined) => (v == null ? "–" : v.toLocaleString("en-US"));

export default async function AppHome() {
  await connection();
  const user = await getCurrentUser();
  const stats = user ? await getDashboardStats(user.id) : EMPTY_STATS;
  const upcoming = user ? await getUpcomingPosts(user.id) : [];
  const [snapshot, automations, account, postCreated, unanswered, recentPosts, followers, scopes, dbHandle] = user
    ? await Promise.all([
        getSnapshot(user.id),
        getAutomationRows(user.id),
        igAccount(user.id),
        hasAnyPost(user.id),
        unansweredComments(user.id),
        getRecentPosts(user.id),
        followerTrend(user.id),
        commentRuleScopes(user.id),
        anyHandle(user.id),
      ])
    : [EMPTY_SNAPSHOT, [], null, false, 0, [], { now: null, prev: null }, [], null];
  let profile: IgProfile | null = null;
  let media: IgMediaItem[] = [];
  let mediaError = false;
  if (account) {
    const [p, m] = await Promise.allSettled([fetchIgProfile(account), fetchRecentMedia(account, 12)]);
    if (p.status === "fulfilled") profile = p.value;
    if (m.status === "fulfilled") media = m.value;
    else mediaError = true;
  }
  const handle = profile?.username ?? account?.username ?? dbHandle;
  const activeCount = automations.filter((a) => a.status === "active").length;
  const covered = (mediaId: string) => scopes.some((rule) => ruleMatchesMedia(rule, mediaId));

  const followerNow = profile?.followers ?? followers.now;
  const tiles: { label: string; icon: typeof Send; value: number | null; prev: number | null; note?: string }[] = [
    { label: "DMs sent", icon: Send, value: snapshot.dmsSent, prev: snapshot.dmsSentPrev, note: `Queue: ${snapshot.dmQueue.toLocaleString("en-US")}` },
    { label: "Link clicks", icon: Link2, value: snapshot.linkClicks, prev: snapshot.linkClicksPrev },
    { label: "Leads collected", icon: UserPlus, value: snapshot.leads, prev: snapshot.leadsPrev },
    { label: "Total followers", icon: Users, value: followerNow, prev: profile ? null : followers.prev, note: followerNow == null ? "Not tracked yet" : undefined },
  ];

  const top = recentPosts
    .map((post) => ({ post, engagement: engagementOf(post) }))
    .filter((row) => row.engagement > 0)
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, 5);
  const thumbs = await postThumbs(top.map((t) => t.post.id));
  const checklistDone = stats.hasAccount && postCreated && stats.hasPost;

  return (
    <div className={`${instrumentSans.variable} ${home.page}`}>
      <header className={home.welcomeRow}>
        <div>
          <h1 className={home.welcome}>Welcome{handle ? <> <span>@{handle}</span></> : ""}!</h1>
          <p className={home.welcomeSub}>Here&apos;s what your posts and automations did for you this week.</p>
        </div>
        <div className={home.actions}>
          <BtnLink href="/app/calendar?compose=1" variant="ghost" size="sm">
            <Plus width={16} height={16} aria-hidden="true" /> New post
          </BtnLink>
          <BtnLink href="/app/auto-dm" variant="lime" size="sm">
            <Plus width={16} height={16} aria-hidden="true" /> New automation
          </BtnLink>
        </div>
      </header>

      {stats.failed > 0 && (
        <div role="alert" className={home.alert}>
          <AlertTriangle width={18} height={18} aria-hidden="true" />
          <span>{stats.failed} {stats.failed === 1 ? "post" : "posts"} failed to publish.</span>
          <Link href="/app/calendar?view=list&status=failed">Review and retry</Link>
        </div>
      )}

      {!checklistDone && (
        <FirstSessionChecklist connected={stats.hasAccount} postCreated={postCreated} postScheduled={stats.hasPost} />
      )}

      <section className={home.section} aria-labelledby="todays-actions">
        <div className={home.sectionHead}>
          <div>
            <h2 id="todays-actions" className={home.sectionTitle}>Today&apos;s actions</h2>
            <p className={home.sectionSub}>Your latest posts and reels, and whether an automation answers their comments.</p>
          </div>
          <div className={home.headLinks}>
            <Link href="/app/inbox?filter=unanswered" className={home.pillLink}>
              <Inbox width={14} height={14} aria-hidden="true" />
              {unanswered.toLocaleString("en-US")} unanswered {unanswered === 1 ? "comment" : "comments"}
            </Link>
            <Link href="/app" className={home.textLink}><RefreshCw width={14} height={14} aria-hidden="true" /> Refresh</Link>
            {profile?.username && (
              <a href={`https://www.instagram.com/${encodeURIComponent(profile.username)}/`} target="_blank" rel="noopener noreferrer" className={home.textLink}>
                View all <ArrowRight width={14} height={14} aria-hidden="true" />
              </a>
            )}
          </div>
        </div>
        {media.length > 0 ? (
          <TodaysActions
            items={media.map((m) => ({ ...m, hasRule: covered(m.id) }))}
            username={profile?.username ?? handle ?? "instagram"}
            avatarUrl={profile?.profilePictureUrl ?? null}
          />
        ) : (
          <div className={home.emptyCard}>
            {account ? (
              <p>{mediaError ? "We couldn't load your posts from Instagram right now. Try Refresh in a minute." : "No posts yet. Your latest posts and reels will show here."}</p>
            ) : stats.hasAccount ? (
              <p>Instagram needs you to reconnect before your latest posts can load. <Link href="/api/instagram/connect">Reconnect Instagram</Link></p>
            ) : (
              <p>Connect Instagram to see your latest posts here. <Link href="/api/instagram/connect">Connect Instagram</Link></p>
            )}
          </div>
        )}
      </section>

      <section className={home.section} aria-labelledby="snapshot">
        <div className={home.sectionHead}>
          <div>
            <h2 id="snapshot" className={home.sectionTitle}>Performance snapshot <span className={home.dim}>· Last 7 days</span></h2>
          </div>
          <Link href="/app/analytics?range=7" className={home.textLink}>Open analytics <ArrowRight width={14} height={14} aria-hidden="true" /></Link>
        </div>
        <div className={home.snap}>
          {tiles.map((t) => (
            <div key={t.label} className={home.stat}>
              <div className={home.statLabel}>
                <span className={home.statIcon} aria-hidden="true"><t.icon width={15} height={15} /></span>
                {t.label}
              </div>
              <div className={home.statRow}>
                <span className={home.statValue}>{n(t.value)}</span>
                {t.value != null && <Change cur={t.value} prev={t.prev} />}
              </div>
              <div className={home.statFoot}>
                {t.prev !== null && t.value != null && pctChange(t.value, t.prev) !== null && <span>vs previous 7 days</span>}
                {t.note && <span>{t.note}</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className={home.split}>
        <section className={home.section} aria-labelledby="active-automations">
          <div className={home.sectionHead}>
            <div>
              <h2 id="active-automations" className={home.sectionTitle}>Active automations ({activeCount})</h2>
              <p className={home.sectionSub}>Running 24/7 to turn comments into DMs and contacts</p>
            </div>
            <Link href="/app/auto-dm" className={home.textLink}>View all <ArrowRight width={14} height={14} aria-hidden="true" /></Link>
          </div>
          <ActiveAutomations
            rows={automations.map((a) => ({ id: a.id, name: a.name, status: a.status, summary: automationSummary(a), dmsSent: a.dmsSent, clicks: a.clicks, uniqueClicks: a.uniqueClicks, triggers: a.triggers ?? [] }))}
          />
        </section>

        <section className={home.section} aria-labelledby="top-performers">
          <div className={home.sectionHead}>
            <div>
              <h2 id="top-performers" className={home.sectionTitle}>Top performers</h2>
              <p className={home.sectionSub}>Last 30 days, by likes, comments, saves, DMs, clicks and leads</p>
            </div>
          </div>
          <div className={home.card}>
            {top.length === 0 ? (
              <p className={home.empty}>Published posts with engagement will be ranked here.</p>
            ) : (
              <ol className={home.topList}>
                {top.map(({ post, engagement }, i) => {
                  const thumb = thumbs.get(post.id);
                  return (
                    <li key={post.id} className={home.topItem}>
                      <span className={home.rank} aria-hidden="true">{i === 0 ? <Trophy width={14} height={14} /> : i + 1}</span>
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element -- user media from arbitrary hosts
                        <img src={thumb} alt="" className={home.topThumb} loading="lazy" />
                      ) : (
                        <span className={home.topThumb} aria-hidden="true" />
                      )}
                      <div className={home.topText}>
                        <p className={home.topCaption}>{shortCaption(post.caption)}</p>
                        <p className={home.topMeta}>
                          <span><Heart width={12} height={12} aria-hidden="true" /> {n(post.insights?.likes)}</span>
                          <span><MessageCircle width={12} height={12} aria-hidden="true" /> {n(post.insights?.comments)}</span>
                          <span><Send width={12} height={12} aria-hidden="true" /> {post.dmsSent}</span>
                          <span><Link2 width={12} height={12} aria-hidden="true" /> {post.linkClicks}</span>
                        </p>
                      </div>
                      <span className={home.topScore} aria-label={`${engagement} interactions`}>{engagement.toLocaleString("en-US")}</span>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </section>
      </div>

      <section className={home.section} aria-labelledby="up-next">
        <div className={home.sectionHead}>
          <h2 id="up-next" className={home.sectionTitle}>Up next</h2>
          <Link href="/app/calendar" className={home.textLink}>View calendar <ArrowRight width={14} height={14} aria-hidden="true" /></Link>
        </div>
        <div className={`${home.card} ${home.cardPad}`}>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="Nothing scheduled yet"
              text="Your next queued posts will show here with local date and time."
              art="/illustrations/empty-calendar.webp"
              artWidth={1536}
              artHeight={1024}
            >
              <BtnLink href="/app/calendar?compose=1" size="sm">Schedule your first post</BtnLink>
            </EmptyState>
          ) : (
            <UpcomingPosts posts={upcoming} />
          )}
        </div>
      </section>
    </div>
  );
}
