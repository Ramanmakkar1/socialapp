import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, LayoutGrid, List, Plus, Settings } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { isExtraNetwork } from "@/lib/networks/tokenNetworks";
import { PLATFORM_ICON, PLATFORM_LABEL } from "../../calendar/calendarUtils";
import ChannelPosts, { type ChannelPost } from "./ChannelPosts";
import styles from "./channel.module.css";

export const metadata = { title: "Channel" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
type Tab = "queue" | "drafts" | "sent";
const TABS: { id: Tab; label: string }[] = [
  { id: "queue", label: "Queue" },
  // "Approvals" joins here once team approvals exist.
  { id: "drafts", label: "Drafts" },
  { id: "sent", label: "Sent" },
];

type Account = { id: string; platform: string; name: string; status: string; avatar: string | null; accountId: string | null };

async function loadAccount(id: string, userId: string): Promise<Account | null> {
  if (id.startsWith("yt-")) {
    const ytId = id.slice(3);
    if (!UUID_RE.test(ytId)) return null;
    const [row] = await query<{ title: string; status: string; avatar_url: string | null }>(
      "select title, status, avatar_url from socialapp.youtube_channels where id=$1 and user_id=$2",
      [ytId, userId],
    );
    return row ? { id, platform: "youtube", name: row.title || "YouTube channel", status: row.status, avatar: row.avatar_url, accountId: null } : null;
  }
  if (!UUID_RE.test(id)) return null;
  const [row] = await query<{ platform: string; username: string | null; page_name: string | null; status: string }>(
    "select platform, username, page_name, status from socialapp.social_accounts where id=$1 and user_id=$2",
    [id, userId],
  );
  if (!row) return null;
  const plain = row.platform === "linkedin" || row.platform === "gbp" || row.platform === "fb_group" || isExtraNetwork(row.platform);
  const name = row.username ? (plain ? row.username : `@${row.username.replace(/^@/, "")}`) : (row.page_name ?? row.platform);
  return { id, platform: row.platform, name, status: row.status, avatar: null, accountId: id };
}

/** "HH:MM" of an instant in a time zone (24h), for matching posting-schedule times. */
function hhmm(at: Date, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone }).format(at);
  } catch {
    return "";
  }
}

// One channel (connected account): Queue / Drafts / Sent, like a per-channel publishing view.
// Posts are matched by post_targets.social_account_id; older targets saved without an account id
// fall back to the platform (the composer targets one account per network today).
export default async function ChannelPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab: Tab = tabParam === "drafts" || tabParam === "sent" ? tabParam : "queue";
  const user = await requireUser();
  if (!isDbConfigured()) notFound();
  const account = await loadAccount(decodeURIComponent(id), user.id).catch(() => null);
  if (!account) notFound();

  const match = `(t.social_account_id = $2::uuid or (t.social_account_id is null and t.platform = $3))`;
  const matchArgs = [user.id, account.accountId, account.platform];
  // YouTube rows have no social_accounts id: match on the platform only ($2 is null then).
  const where = account.accountId ? match : "($2::uuid is null and t.platform = $3)";

  const statusSql = tab === "queue" ? "p.status in ('scheduled','publishing','failed')" : tab === "drafts" ? "p.status = 'draft'" : "p.status = 'published'";
  const orderSql = tab === "sent" ? "max(t.published_at) desc nulls last" : "p.scheduled_at asc nulls last, p.created_at desc";

  let posts: ChannelPost[] = [];
  let counts = { queue: 0, drafts: 0, sent: 0 };
  let week = { sent: 0, planned: 0 };
  let loadFailed = false;
  let schedule: { timezone: string; times: string[] } | null = null;
  try {
    const [rows, countRows, weekRows, schedRows] = await Promise.all([
      query<{ id: string; caption: string | null; scheduled_at: Date | null; published_at: Date | null; created_at: Date; status: string; media: unknown; tags: unknown; error: string | null; external_post_id: string | null }>(
        `select p.id, p.caption, p.scheduled_at, max(t.published_at) as published_at, p.created_at, p.status, p.media, (select to_jsonb(p2)->'tags' from socialapp.scheduled_posts p2 where p2.id = p.id) as tags,
                (array_agg(t.error) filter (where t.status = 'failed' and t.error is not null))[1] as error,
                (array_agg(t.external_post_id) filter (where t.status = 'published'))[1] as external_post_id
           from socialapp.scheduled_posts p join socialapp.post_targets t on t.post_id = p.id
          where p.user_id = $1 and ${where} and ${statusSql}
          group by p.id order by ${orderSql} limit 100`,
        matchArgs,
      ),
      query<{ queue: number; drafts: number; sent: number }>(
        `select count(distinct p.id) filter (where p.status in ('scheduled','publishing','failed'))::int as queue,
                count(distinct p.id) filter (where p.status = 'draft')::int as drafts,
                count(distinct p.id) filter (where p.status = 'published')::int as sent
           from socialapp.scheduled_posts p join socialapp.post_targets t on t.post_id = p.id
          where p.user_id = $1 and ${where}`,
        matchArgs,
      ),
      // This week (Monday 00:00 UTC onward): posts sent vs. posts planned for the channel.
      query<{ sent: number; planned: number }>(
        `select count(distinct p.id) filter (where t.status = 'published')::int as sent,
                count(distinct p.id) filter (where p.status in ('scheduled','publishing','published','failed'))::int as planned
           from socialapp.scheduled_posts p join socialapp.post_targets t on t.post_id = p.id
          where p.user_id = $1 and ${where}
            and coalesce(t.published_at, p.scheduled_at) >= date_trunc('week', now() at time zone 'UTC') at time zone 'UTC'
            and coalesce(t.published_at, p.scheduled_at) < (date_trunc('week', now() at time zone 'UTC') + interval '7 days') at time zone 'UTC'`,
        matchArgs,
      ),
      query<{ timezone: string; times: string[] }>("select timezone, times from socialapp.posting_schedules where user_id=$1 and platform=$2", [user.id, account.platform]).catch(() => []),
    ]);
    counts = countRows[0] ?? counts;
    week = weekRows[0] ?? week;
    schedule = schedRows[0] ?? null;
    posts = rows.map((r) => {
      const first = Array.isArray(r.media) ? (r.media[0] as { url?: unknown; type?: unknown; thumb?: unknown } | undefined) : undefined;
      const url = typeof first?.url === "string" ? first.url : null;
      const poster = typeof first?.thumb === "string" ? first.thumb : null;
      const isVideo = first?.type === "video" || (url ? /\.(mp4|mov|webm)(\?|$)/i.test(url) : false);
      const at = tab === "sent" ? (r.published_at ?? r.scheduled_at) : r.scheduled_at;
      const inQueue = Boolean(schedule && r.scheduled_at && schedule.times.includes(hhmm(new Date(r.scheduled_at), schedule.timezone)));
      return {
        id: r.id,
        caption: r.caption ?? "",
        at: at ? new Date(at).toISOString() : null,
        createdAt: new Date(r.created_at).toISOString(),
        status: r.status,
        thumb: poster ?? (url && !isVideo ? url : null),
        isVideo,
        tags: Array.isArray(r.tags) ? r.tags.filter((t): t is string => typeof t === "string") : [],
        error: r.error,
        inQueue,
      };
    });
  } catch {
    loadFailed = true;
  }

  const Icon = PLATFORM_ICON[account.platform] ?? PLATFORM_ICON.threads;
  const base = `/app/channels/${encodeURIComponent(account.id)}`;
  const calendarHref = `/app/calendar?view=month&channel=${encodeURIComponent(account.platform)}`;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <div className={styles.who}>
          <span className={styles.avatar} aria-hidden="true">
            {account.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element -- channel avatar from the network's CDN
              <img src={account.avatar} alt="" />
            ) : (
              account.name.replace(/^@/, "").slice(0, 1).toUpperCase()
            )}
            <span className={`${styles.badge} ${styles[`badge_${account.platform}`] ?? ""}`}><Icon width={11} height={11} /></span>
          </span>
          <div className={styles.whoText}>
            <h1 className={styles.name}>
              {account.name}
              <Link href="/app/settings" className={styles.gear} aria-label="Channel settings"><Settings width={16} height={16} aria-hidden="true" /></Link>
            </h1>
            <p className={styles.weekStat}>
              <span className={styles.ring} style={{ ["--pct" as string]: `${week.planned ? Math.round((week.sent / week.planned) * 100) : 0}%` }} aria-hidden="true" />
              {week.sent}/{week.planned} {week.planned === 1 ? "post" : "posts"} sent this week
              <span className={styles.net}>· {PLATFORM_LABEL[account.platform] ?? account.platform}</span>
              {account.status !== "active" && <span className={styles.warn}>Needs reconnecting</span>}
            </p>
          </div>
        </div>
        <div className={styles.actions}>
          <nav className={styles.viewSwitch} aria-label="View">
            <Link href={`/app/calendar?view=grid&channel=${encodeURIComponent(account.platform)}`} className={styles.viewLink}><LayoutGrid width={16} height={16} aria-hidden="true" /> Grid</Link>
            <span className={`${styles.viewLink} ${styles.viewLinkActive}`} aria-current="page"><List width={16} height={16} aria-hidden="true" /> List</span>
            <Link href={calendarHref} className={styles.viewLink}><CalendarDays width={16} height={16} aria-hidden="true" /> Calendar</Link>
          </nav>
          <Link href="/app/calendar?compose=1" className={styles.newBtn}><Plus width={17} height={17} aria-hidden="true" /> New post</Link>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Posts">
        {TABS.map((t) => (
          <Link key={t.id} href={t.id === "queue" ? base : `${base}?tab=${t.id}`} aria-current={tab === t.id ? "page" : undefined} className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}>
            {t.label} <span className={styles.tabCount}>{counts[t.id]}</span>
          </Link>
        ))}
      </nav>

      <ChannelPosts
        posts={posts}
        tab={tab}
        loadFailed={loadFailed}
        reloadHref={tab === "queue" ? base : `${base}?tab=${tab}`}
        account={{ name: account.name, platform: account.platform, avatar: account.avatar }}
      />
    </div>
  );
}
