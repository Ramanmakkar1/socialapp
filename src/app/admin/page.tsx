import Link from "next/link";
import { getBillingSummary } from "@/lib/adminBilling";
import { requireAdmin } from "@/lib/admin";
import { isDbConfigured, query } from "@/lib/db";
import KpiCard from "./ui/KpiCard";
import Panel from "./ui/Panel";
import DataTable, { type Column, type Row } from "./ui/DataTable";
import StatusPill, { type StatusTone } from "./ui/StatusPill";
import PlatformBadge, { type PlatformId } from "./ui/PlatformBadge";
import Button from "./ui/Button";
import { AreaChart, StackedBars, type DayStatus } from "./ui/charts";
import styles from "./admin.module.css";
import { formatBytes } from "@/lib/mediaLimits";
import { mediaDirSize, mediaDiskSpace, mediaStorageDir, minFreeBytes } from "@/lib/mediaStorage";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };

// Plan → monthly price (USD). Used for MRR when a users.plan column exists.
const PLAN_PRICE: Record<string, number> = { free: 0, pro: 19, agency: 49 };
const PLAN_COLOR: Record<string, string> = { free: "var(--poskoo-lilac)", pro: "var(--poskoo-coral)", agency: "var(--poskoo-violet)" };

type Attention = { tone: StatusTone; label: string; text: string; href: string };
type Signup = { id: string; name: string; email: string; plan: string; channels: PlatformId[]; joined: string };
type Overview = {
  totalUsers: number;
  newUsers30: number;
  paidUsers: number;
  mrr: number | null;
  channels: number;
  postsPublished30: number;
  signupsPerDay: number[];
  postsByDay: DayStatus[];
  dmsSentPerDay: number[];
  planMix: { name: string; count: number; color: string }[];
  attention: Attention[];
  recentSignups: Signup[];
  hasPlanColumn: boolean;
};

const EMPTY: Overview = {
  totalUsers: 0,
  newUsers30: 0,
  paidUsers: 0,
  mrr: null,
  channels: 0,
  postsPublished30: 0,
  signupsPerDay: [],
  postsByDay: [],
  dmsSentPerDay: [],
  planMix: [],
  attention: [],
  recentSignups: [],
  hasPlanColumn: false,
};

// Builds a 30-day series (oldest → today) from a day→value map.
function series30(map: Map<string, number>): number[] {
  const out: number[] = [];
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i--) {
    const day = new Date(d);
    day.setUTCDate(d.getUTCDate() - i);
    const key = day.toISOString().slice(0, 10);
    out.push(map.get(key) ?? 0);
  }
  return out;
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function getOverview(): Promise<Overview> {
  if (!isDbConfigured()) return EMPTY;
  const data: Overview = { ...EMPTY, signupsPerDay: [], postsByDay: [], dmsSentPerDay: [] };
  try {
    const hasPlan = (
      await query<{ exists: boolean }>(
        "select exists(select 1 from information_schema.columns where table_schema='socialapp' and table_name='users' and column_name='plan') as exists"
      )
    )[0]?.exists ?? false;
    data.hasPlanColumn = hasPlan;

    const [users, newUsers, channels, published, signups, posts, dms, planRows, attentionRows, recent] =
      await Promise.all([
        query<{ n: number }>("select count(*)::int as n from socialapp.users"),
        query<{ n: number }>("select count(*)::int as n from socialapp.users where created_at >= now() - interval '30 days'"),
        query<{ n: number }>(
          "select (select count(*)::int from socialapp.social_accounts where status='active') + (select count(*)::int from socialapp.youtube_channels where status='active') as n"
        ),
        query<{ n: number }>(
          "select count(*)::int as n from socialapp.scheduled_posts where status='published' and updated_at >= now() - interval '30 days'"
        ),
        query<{ d: string; n: number }>(
          "select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as d, count(*)::int as n from socialapp.users where created_at >= now() - interval '30 days' group by 1"
        ),
        query<{ d: string; status: string; n: number }>(
          "select to_char(date_trunc('day', updated_at), 'YYYY-MM-DD') as d, status, count(*)::int as n from socialapp.scheduled_posts where updated_at >= now() - interval '30 days' and status in ('published','scheduled','failed') group by 1,2"
        ),
        query<{ d: string; n: number }>(
          "select to_char(date_trunc('day', created_at), 'YYYY-MM-DD') as d, count(*)::int as n from socialapp.dm_queue where status='sent' and created_at >= now() - interval '30 days' group by 1"
        ),
        hasPlan
          ? query<{ plan: string; n: number }>("select plan, count(*)::int as n from socialapp.users group by 1")
          : Promise.resolve([] as { plan: string; n: number }[]),
        query<{ failed: number; expiring: number; webhook: number }>(
          `select
            (select count(*)::int from socialapp.scheduled_posts where status='failed' and updated_at >= now() - interval '1 day') as failed,
            (select count(*)::int from socialapp.social_accounts where platform='instagram' and status='active' and token_expires_at is not null and token_expires_at < now() + interval '7 days') as expiring,
            (select count(*)::int from socialapp.events where type ilike '%error%' and received_at >= now() - interval '1 hour') as webhook`
        ),
        query<{ id: string; name: string | null; email: string; plan: string | null; joined: string }>(
          hasPlan
            ? "select id, name, email, coalesce(plan, 'free') as plan, to_char(created_at, 'YYYY-MM-DD HH24:MI') as joined from socialapp.users order by created_at desc limit 10"
            : "select id, name, email, 'free' as plan, to_char(created_at, 'YYYY-MM-DD HH24:MI') as joined from socialapp.users order by created_at desc limit 10"
        ),
      ]);

    data.totalUsers = users[0]?.n ?? 0;
    data.newUsers30 = newUsers[0]?.n ?? 0;
    data.channels = channels[0]?.n ?? 0;
    data.postsPublished30 = published[0]?.n ?? 0;

    const signupMap = new Map(signups.map((r) => [r.d, r.n]));
    data.signupsPerDay = series30(signupMap);

    const postMap = new Map<string, DayStatus>();
    for (let i = 29; i >= 0; i--) {
      const day = new Date();
      day.setUTCHours(0, 0, 0, 0);
      day.setUTCDate(day.getUTCDate() - i);
      postMap.set(dayKey(day), { published: 0, scheduled: 0, failed: 0 });
    }
    for (const r of posts) {
      const slot = postMap.get(r.d);
      if (!slot) continue;
      if (r.status === "published") slot.published += r.n;
      else if (r.status === "scheduled") slot.scheduled += r.n;
      else slot.failed += r.n;
    }
    data.postsByDay = [...postMap.values()];

    const dmMap = new Map(dms.map((r) => [r.d, r.n]));
    data.dmsSentPerDay = series30(dmMap);

    // Plan mix + paid users + MRR.
    if (hasPlan) {
      const counts: Record<string, number> = {};
      for (const r of planRows) counts[r.plan] = (counts[r.plan] ?? 0) + r.n;
      data.paidUsers = (counts["pro"] ?? 0) + (counts["agency"] ?? 0);
      data.mrr = (counts["pro"] ?? 0) * PLAN_PRICE.pro + (counts["agency"] ?? 0) * PLAN_PRICE.agency;
      const order = ["free", "pro", "agency"];
      data.planMix = order
        .filter((p) => (counts[p] ?? 0) > 0)
        .map((p) => ({ name: p[0].toUpperCase() + p.slice(1), count: counts[p], color: PLAN_COLOR[p] }));
      if (data.planMix.length === 0) data.planMix = [{ name: "Free", count: data.totalUsers, color: PLAN_COLOR.free }];
    } else {
      // No users.plan column: plans live in billing_subscriptions, so take MRR
      // and paying users from the same summary /admin/billing uses.
      try {
        const billing = await getBillingSummary();
        data.paidUsers = billing.paying;
        data.mrr = Math.round(billing.mrrCents) / 100;
      } catch {
        data.paidUsers = 0;
        data.mrr = null;
      }
      data.planMix = data.totalUsers > 0 ? [{ name: "Free", count: data.totalUsers, color: PLAN_COLOR.free }] : [];
    }

    const a = attentionRows[0] ?? { failed: 0, expiring: 0, webhook: 0 };
    if (a.failed > 0) data.attention.push({ tone: "err", label: "Failed", text: `${a.failed} post${a.failed === 1 ? "" : "s"} failed to publish in the last day`, href: "/admin/posts" });
    if (a.expiring > 0) data.attention.push({ tone: "warn", label: "Expiring", text: `${a.expiring} Instagram login${a.expiring === 1 ? "" : "s"} expire within 7 days`, href: "/admin/users" });
    if (a.webhook > 0) data.attention.push({ tone: "warn", label: "Webhook", text: `${a.webhook} webhook error${a.webhook === 1 ? "" : "s"} in the last hour`, href: "/admin/system" });

    // Channels per recent user (one grouped query).
    const chanRows = await query<{ user_id: string; platform: string }>(
      "select user_id::text as user_id, platform from socialapp.social_accounts where status='active' and user_id in (select id from socialapp.users order by created_at desc limit 10)"
    );
    const chanByUser = new Map<string, PlatformId[]>();
    for (const r of chanRows) {
      const list = chanByUser.get(r.user_id) ?? [];
      if (PLATFORM_IDS.has(r.platform as PlatformId)) list.push(r.platform as PlatformId);
      chanByUser.set(r.user_id, list);
    }
    data.recentSignups = recent.map((r) => ({
      id: r.id,
      name: r.name || r.email.split("@")[0],
      email: r.email,
      plan: r.plan ?? "free",
      channels: chanByUser.get(r.id) ?? [],
      joined: r.joined,
    }));
  } catch {
    return EMPTY;
  }
  return data;
}

const PLATFORM_IDS = new Set<PlatformId>(["instagram", "facebook", "threads", "youtube", "tiktok"]);

function relativeTime(iso: string): string {
  const then = new Date(iso.replace(" ", "T") + "Z").getTime();
  if (Number.isNaN(then)) return iso;
  const diff = Date.now() - then;
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hrs = Math.round(min / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} d ago`;
}

function PlanMix({ mix, total }: { mix: Overview["planMix"]; total: number }) {
  if (mix.length === 0) return <p className={styles.panelSub}>No users yet.</p>;
  return (
    <div className={styles.mixRow}>
      {mix.map((m) => (
        <div key={m.name} className={styles.mixItem}>
          <b>{m.name}</b>
          <span className={styles.mixCount}>{m.count.toLocaleString("en-US")}</span>
          <div className={styles.mixTrack}>
            <i className={styles.mixFill} style={{ width: total > 0 ? `${Math.max(1.5, (m.count / total) * 100)}%` : "0%", background: m.color }} />
          </div>
        </div>
      ))}
    </div>
  );
}

type ChannelInterest = { notify: { channel: string; n: number }[]; requests: { channel: string; note: string | null; email: string; at: string }[] };

/** "Notify me" counts per channel + the latest "Request a channel" entries (migration 047). */
async function getChannelInterest(): Promise<ChannelInterest> {
  if (!isDbConfigured()) return { notify: [], requests: [] };
  try {
    const [notify, requests] = await Promise.all([
      query<{ channel: string; n: number }>(
        "select channel, count(*)::int as n from socialapp.channel_requests where kind='notify' and notified_at is null group by 1 order by 2 desc limit 12",
      ),
      query<{ channel: string; note: string | null; email: string; at: string }>(
        `select r.channel, r.note, u.email, to_char(r.created_at, 'YYYY-MM-DD HH24:MI') as at
         from socialapp.channel_requests r join socialapp.users u on u.id = r.user_id
         where r.kind='request' order by r.created_at desc limit 10`,
      ),
    ]);
    return { notify, requests };
  } catch {
    return { notify: [], requests: [] };
  }
}

export default async function AdminOverviewPage() {
  // The layout checks too, but pages render in parallel with layouts: guard the data here as well.
  await requireAdmin();
  const [data, mediaSize, mediaDisk, interest] = await Promise.all([getOverview(), mediaDirSize(), mediaDiskSpace(), getChannelInterest()]);
  const mediaLow = mediaDisk !== null && mediaDisk.freeBytes < minFreeBytes() * 2;
  const mrrText = data.mrr === null ? "Not set up" : `$${data.mrr.toLocaleString("en-US")}`;
  const signupTotal = data.signupsPerDay.reduce((a, b) => a + b, 0);

  const signupCols: Column[] = [
    { key: "user", label: "User" },
    { key: "plan", label: "Plan" },
    { key: "channels", label: "Channels" },
    { key: "joined", label: "Joined", align: "right" },
  ];
  const signupRows: Row[] = data.recentSignups.map((u) => ({
    href: `/admin/users/${u.id}`,
    cells: [
      <div key="u" className={styles.userCell}>
        <span className={styles.avatar}>{u.name[0]?.toUpperCase()}</span>
        <div>
          {u.name}
          <small>{u.email}</small>
        </div>
      </div>,
      <StatusPill key="p" tone={u.plan === "free" ? "info" : u.plan === "pro" ? "ok" : "warn"}>{u.plan[0].toUpperCase() + u.plan.slice(1)}</StatusPill>,
      <div key="c">{u.channels.map((c, i) => <PlatformBadge key={i} platform={c} />)}</div>,
      <span key="j" title={u.joined}>{relativeTime(u.joined)}</span>,
    ],
  }));

  return (
    <>
      <p className={styles.panelSub} role={mediaLow ? "alert" : undefined}>
        Media storage ({mediaStorageDir()}): {formatBytes(mediaSize.bytes)} in {mediaSize.files.toLocaleString("en-US")} files ·{" "}
        {mediaDisk ? `${formatBytes(mediaDisk.freeBytes)} free of ${formatBytes(mediaDisk.totalBytes)}` : "free space unknown"}
        {mediaLow ? ` · LOW: uploads stop below ${formatBytes(minFreeBytes())} free` : ""}
      </p>
      <div className={styles.kpis}>
        <KpiCard label="Users" value={data.totalUsers.toLocaleString("en-US")} delta={data.newUsers30 > 0 ? `${data.newUsers30} new` : undefined} deltaDir="up" />
        <KpiCard label="New · 30 d" value={data.newUsers30.toLocaleString("en-US")} />
        <KpiCard label="Paid users" value={data.paidUsers.toLocaleString("en-US")} />
        <KpiCard label="MRR" value={mrrText} accent={data.mrr !== null} />
        <KpiCard label="Channels" value={data.channels.toLocaleString("en-US")} />
        <KpiCard label="Posts · 30 d" value={data.postsPublished30.toLocaleString("en-US")} />
      </div>

      <div className={styles.row2}>
        <Panel title="Signups per day" subtitle="last 30 days">
          {data.signupsPerDay.length > 0 ? (
            <AreaChart data={data.signupsPerDay} ariaLabel={`Signups per day over the last 30 days, ${signupTotal} total`} xLabels={["30 days ago", "today"]} />
          ) : (
            <p className={styles.panelSub}>No signups in the last 30 days.</p>
          )}
        </Panel>
        <Panel title="Plan mix" subtitle="all users">
          <PlanMix mix={data.planMix} total={data.totalUsers} />
        </Panel>
      </div>

      <div className={styles.row3}>
        <Panel title="Posts by status" subtitle="published · scheduled · failed, last 30 days">
          {data.postsByDay.length > 0 ? (
            <StackedBars data={data.postsByDay} ariaLabel="Posts by status per day over the last 30 days" />
          ) : (
            <p className={styles.panelSub}>No posts in the last 30 days.</p>
          )}
        </Panel>
        <Panel title="Auto-DMs sent per day" subtitle="last 30 days">
          {data.dmsSentPerDay.length > 0 ? (
            <AreaChart data={data.dmsSentPerDay} ariaLabel={`Auto-DMs sent per day over the last 30 days, ${data.dmsSentPerDay.reduce((a, b) => a + b, 0)} total`} xLabels={["30 days ago", "today"]} />
          ) : (
            <p className={styles.panelSub}>No auto-DMs sent in the last 30 days.</p>
          )}
        </Panel>
      </div>

      <div className={styles.row3}>
        <Panel title="Needs attention" subtitle={`${data.attention.length} item${data.attention.length === 1 ? "" : "s"}`}>
          {data.attention.length === 0 ? (
            <p className={styles.panelSub}>All clear — nothing needs attention right now.</p>
          ) : (
            <ul className={styles.att}>
              {data.attention.map((a, i) => (
                <li key={i}>
                  <StatusPill tone={a.tone}>{a.label}</StatusPill>
                  {a.text}
                  <Link href={a.href}>Open →</Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Recent signups" subtitle="last 10" actions={<Button size="sm" href="/admin/users">All users</Button>} flush>
          <DataTable
            columns={signupCols}
            rows={signupRows}
            empty="No signups yet."
            emptyAction={<Button size="sm" href="/admin/users">View users</Button>}
          />
        </Panel>
      </div>

      <div className={styles.row2}>
        <Panel title="Waiting for channels" subtitle="“Notify me when it's ready” in the Connect dialog">
          {interest.notify.length === 0 ? (
            <p className={styles.panelSub}>Nobody is waiting on a channel yet.</p>
          ) : (
            <ul className={styles.att}>
              {interest.notify.map((r) => (
                <li key={r.channel}>
                  <StatusPill tone="info">{String(r.n)}</StatusPill>
                  {r.channel}
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Channel requests" subtitle="latest 10 from “Can't find it?”">
          {interest.requests.length === 0 ? (
            <p className={styles.panelSub}>No channel requests yet.</p>
          ) : (
            <ul className={styles.att}>
              {interest.requests.map((r, i) => (
                <li key={i}>
                  <StatusPill tone="warn">{r.channel}</StatusPill>
                  <span>{r.note ?? "(no note)"} · {r.email}</span>
                  <span title={r.at}>{relativeTime(r.at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
