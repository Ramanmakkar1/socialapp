import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { isDbConfigured, query } from "@/lib/db";
import { instrumentSans } from "@/lib/fonts";
import { isIgConfigured } from "@/lib/instagram";
import { isMetaLoginConfigured } from "@/lib/metaLogin";
import { monthlyAutoDmLimit, PLAN_LIMITS, planForUser } from "@/lib/planLimits";
import { isThreadsConfigured } from "@/lib/threadsAuth";
import { isYouTubeConfigured } from "@/lib/youtubeAuth";
import { logoutAction } from "../login/actions";
import PoskooMark from "@/components/PoskooMark";
import { BtnA } from "@/components/ui/kit";
import { AtSign, Check, ChevronsUpDown, Facebook, Instagram, LogOut, Plus, Settings, Youtube } from "lucide-react";
import { getSidebarChannels, type SidebarChannel } from "@/lib/sidebarChannels";
import ConnectChannelDialog, { type ConnectAvailability } from "./ConnectChannelDialog";
import SidebarNav from "./SidebarNav";
import NewAutomationDialog from "./NewAutomationDialog";
import { ShellSkeleton } from "./Skeleton";
import styles from "./shell.module.css";

// Every /app page is per-user: never prerender or cache it at build time.
export const dynamic = "force-dynamic";

// Shared dashboard shell. Guests are sent to /login by requireUser().
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}

function Logo() {
  return (
    <Link href="/app" className={styles.logo} aria-label="Poskoo dashboard home">
      <PoskooMark size={28} />
      poskoo<b>.</b>
    </Link>
  );
}

const CHANNEL_ICON: Record<string, typeof Instagram> = { instagram: Instagram, facebook: Facebook, threads: AtSign, youtube: Youtube };

// Account / workspace menu at the top of the sidebar (native disclosure, no JS needed).
function AccountMenu({ name, email, plan }: { name: string; email: string; plan: string }) {
  return (
    <details className={styles.acctMenu}>
      <summary className={styles.acctBtn} aria-label={`Account menu for ${name}`}>
        <span className={styles.acctAvatar} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
        <span className={styles.acctText}>
          <b>{name}</b>
          <span>{plan} plan</span>
        </span>
        <ChevronsUpDown width={16} height={16} aria-hidden="true" className={styles.acctChevron} />
      </summary>
      <div className={styles.acctPop}>
        <p className={styles.acctLabel}>Workspaces</p>
        <p className={styles.acctWorkspace}>
          <span className={styles.acctAvatarSm} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
          <span className={styles.acctWsName}>{name}’s workspace</span>
          <Check width={16} height={16} aria-label="Current workspace" />
        </p>
        <p className={styles.acctEmail} title={email}>{email}</p>
        <div className={styles.acctSep} />
        <Link href="/app/settings" className={styles.acctItem}><Settings width={16} height={16} aria-hidden="true" /> Settings</Link>
        <form action={logoutAction}>
          <button type="submit" className={styles.acctItem}><LogOut width={16} height={16} aria-hidden="true" /> Sign out</button>
        </form>
      </div>
    </details>
  );
}

// Primary actions: new post (opens the composer) and new automation (trigger picker dialog).
function NewButtons() {
  return (
    <div className={styles.newRow}>
      <Link href="/app/calendar?compose=1" className={styles.newBtn}>
        <Plus width={16} height={16} aria-hidden="true" /> Post
      </Link>
      <NewAutomationDialog label="Automation" className={styles.newAutoBtn} />
    </div>
  );
}

// Buffer-style channel list: avatar initial with network badge, handle, scheduled count.
function Channels({ channels, availability }: { channels: SidebarChannel[]; availability: ConnectAvailability }) {
  return (
    <section className={styles.channels} aria-labelledby="sidebar-channels">
      <p id="sidebar-channels" className={styles.navGroupTitle}>Channels</p>
      <ul className={styles.channelList}>
        {channels.map((c, i) => {
          const Icon = CHANNEL_ICON[c.platform] ?? AtSign;
          const ok = c.status === "active";
          return (
            <li key={`${c.platform}-${i}`}>
              <Link
                href={ok ? `/app/calendar?view=week&channel=${c.platform}` : "/app/settings#accounts-heading"}
                className={styles.channel}
                title={ok ? `${c.name} · ${c.platform}` : `${c.name} needs to be reconnected`}
              >
                <span className={styles.channelAvatar} aria-hidden="true">
                  {c.name.replace(/^@/, "").slice(0, 1).toUpperCase()}
                  <span className={`${styles.channelBadge} ${styles[`badge_${c.platform}`] ?? ""}`}><Icon width={9} height={9} /></span>
                </span>
                <span className={styles.channelName}>{c.name}</span>
                {ok ? (
                  c.scheduled > 0 && <span className={styles.channelCount} aria-label={`${c.scheduled} scheduled`}>{c.scheduled}</span>
                ) : (
                  <span className={styles.channelWarn}>Reconnect</span>
                )}
              </Link>
            </li>
          );
        })}
        <li>
          <ConnectChannelDialog availability={availability} label={channels.length ? "Connect more channels" : "Connect a channel"} />
        </li>
      </ul>
    </section>
  );
}

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  return (
    <div className={styles.meter}>
      <p className={styles.meterTop}>
        <span>{label}</span>
        <span className={styles.meterNum}>{used.toLocaleString("en-US")}/{limit.toLocaleString("en-US")}</span>
      </p>
      <span className={styles.meterBar} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={used}>
        <span style={{ width: `${pct}%` }} className={pct >= 90 ? styles.meterHot : undefined} />
      </span>
    </div>
  );
}

async function AppShell({ children }: { children: ReactNode }) {
  const user = await requireUser();
  let needsReconnect = false;
  let failedPosts = 0;
  let scheduledPosts = 0;
  let dmsThisMonth = 0;
  let scheduledThisMonth = 0;
  if (isDbConfigured()) {
    try {
      const rows = await query<{ expired: number; failed: number; scheduled: number; dms: number; scheduled_month: number }>(
        `select (select count(*)::int from socialapp.social_accounts where user_id=$1 and platform='instagram' and status='expired') as expired,
                (select count(*)::int from socialapp.scheduled_posts where user_id=$1 and status='failed') as failed,
                (select count(*)::int from socialapp.scheduled_posts where user_id=$1 and status='scheduled') as scheduled,
                (select count(*)::int from socialapp.dm_queue where user_id=$1 and status='sent' and kind <> 'manual_reply'
                   and sent_at >= (date_trunc('month', now() at time zone 'UTC') at time zone 'UTC')) as dms,
                (select count(*)::int from socialapp.scheduled_posts where user_id=$1 and status in ('scheduled','publishing','published')
                   and scheduled_at >= (date_trunc('month', now() at time zone 'UTC') at time zone 'UTC')
                   and scheduled_at < ((date_trunc('month', now() at time zone 'UTC') + interval '1 month') at time zone 'UTC')) as scheduled_month`,
        [user.id]
      );
      needsReconnect = (rows[0]?.expired ?? 0) > 0;
      failedPosts = rows[0]?.failed ?? 0;
      scheduledPosts = rows[0]?.scheduled ?? 0;
      dmsThisMonth = rows[0]?.dms ?? 0;
      scheduledThisMonth = rows[0]?.scheduled_month ?? 0;
    } catch {
      needsReconnect = false;
      failedPosts = 0;
    }
  }
  const channels = await getSidebarChannels(user.id);
  const plan = planForUser();
  const limits = PLAN_LIMITS[plan];
  // Same number the send worker enforces (plan + Refer-and-earn bonus).
  const dmLimit = await monthlyAutoDmLimit(user.id).then((r) => r.limit, () => limits.autoDmsPerMonth);
  const metaReady = isMetaLoginConfigured();
  const availability: ConnectAvailability = {
    instagram: metaReady || isIgConfigured(),
    facebook: metaReady,
    threads: isThreadsConfigured(),
    youtube: isYouTubeConfigured(),
  };
  const displayName = user.name?.trim() || user.email.split("@")[0];
  // Same rule as the connect callbacks (planLimits.accountLimitError): anything not disconnected holds a slot.
  const connectedAccounts = channels.filter((c) => c.status !== "disconnected").length;

  return (
    <div className={`app-theme ${instrumentSans.variable} ${styles.shell}`}>
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <Logo />
        </div>
        <AccountMenu name={displayName} email={user.email} plan={plan} />
        <NewButtons />
        <div className={styles.sideScroll}>
          <SidebarNav failedPosts={failedPosts} scheduledPosts={scheduledPosts} />
          <Channels channels={channels} availability={availability} />
        </div>
        <div className={styles.usage} aria-label="Plan usage">
          {limits.scheduledPostsPerMonth !== null && (
            <Meter label="Scheduled this month" used={scheduledThisMonth} limit={limits.scheduledPostsPerMonth} />
          )}
          <Meter label="DMs sent this month" used={dmsThisMonth} limit={dmLimit} />
          <Meter label="Connected accounts" used={connectedAccounts} limit={limits.socialAccounts} />
        </div>
        <SidebarNav variant="footer" failedPosts={failedPosts} showAdmin={isAdmin(user)} />
      </aside>
      <main className="min-w-0 flex-1">
        <div className={styles.topbar}>
          <div className={styles.topbarRow}>
            <Logo />
            <p className={styles.topbarEmail} title={user.email}>{user.email}</p>
            <form action={logoutAction}>
              <button type="submit" className={styles.logoutBtn}>Log out</button>
            </form>
          </div>
          <SidebarNav variant="tabs" failedPosts={failedPosts} scheduledPosts={scheduledPosts} />
        </div>
        {needsReconnect && (
          <div role="alert" className={styles.banner}>
            <span>Instagram access expired or was removed. Posts and auto-DMs are paused until you reconnect.</span>
            <BtnA href="/api/instagram/connect" size="sm">Reconnect Instagram</BtnA>
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}
