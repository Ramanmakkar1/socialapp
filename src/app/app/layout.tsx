import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { instrumentSans } from "@/lib/fonts";
import { logoutAction } from "../login/actions";
import PoskooMark from "@/components/PoskooMark";
import { BtnA } from "@/components/ui/kit";
import { AtSign, Facebook, Instagram, Plus, Youtube } from "lucide-react";
import { getSidebarChannels, type SidebarChannel } from "@/lib/sidebarChannels";
import SidebarNav from "./SidebarNav";
import styles from "./shell.module.css";

// Every /app page is per-user: never prerender or cache it at build time.
export const dynamic = "force-dynamic";

// Shared dashboard shell. Guests are sent to /login by requireUser().
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<p role="status" className={styles.loading}>Loading dashboard…</p>}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}

function Logo() {
  return (
    <Link href="/" className={styles.logo}>
      <PoskooMark size={30} />
      poskoo<b>.</b>
    </Link>
  );
}

const CHANNEL_ICON: Record<string, typeof Instagram> = { instagram: Instagram, facebook: Facebook, threads: AtSign, youtube: Youtube };

// "+ New" menu at the top of the sidebar (no JS: a native disclosure).
function NewMenu() {
  return (
    <details className={styles.newMenu}>
      <summary className={styles.newBtn}>
        <Plus width={18} height={18} aria-hidden="true" /> New
      </summary>
      <div className={styles.newList}>
        <Link href="/app/calendar?compose=1" className={styles.newItem}>
          <b>Post</b>
          <span>Schedule to Instagram, Facebook, Threads, YouTube</span>
        </Link>
        <Link href="/app/auto-dm" className={styles.newItem}>
          <b>Auto-DM automation</b>
          <span>Reply to a comment keyword with a DM</span>
        </Link>
      </div>
    </details>
  );
}

// Buffer-style channel list: avatar initial, platform badge, scheduled count.
function Channels({ channels }: { channels: SidebarChannel[] }) {
  return (
    <section className={styles.channels} aria-labelledby="sidebar-channels">
      <p id="sidebar-channels" className={styles.navGroupTitle}>Channels</p>
      <ul className={styles.channelList}>
        {channels.map((c, i) => {
          const Icon = CHANNEL_ICON[c.platform] ?? AtSign;
          const ok = c.status === "active";
          return (
            <li key={`${c.platform}-${i}`}>
              <Link href={ok ? "/app/calendar" : "/app/settings#accounts-heading"} className={styles.channel} title={ok ? `${c.name} · ${c.platform}` : `${c.name} needs to be reconnected`}>
                <span className={styles.channelAvatar} aria-hidden="true">
                  {c.name.replace(/^@/, "").slice(0, 1).toUpperCase()}
                  <span className={`${styles.channelBadge} ${styles[`badge_${c.platform}`] ?? ""}`}><Icon width={10} height={10} /></span>
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
          <Link href="/app/settings#accounts-heading" className={`${styles.channel} ${styles.channelAdd}`}>
            <span className={styles.channelAvatar} aria-hidden="true"><Plus width={14} height={14} /></span>
            <span className={styles.channelName}>{channels.length ? "Connect more channels" : "Connect a channel"}</span>
          </Link>
        </li>
      </ul>
    </section>
  );
}

async function AppShell({ children }: { children: ReactNode }) {
  const user = await requireUser();
  let needsReconnect = false;
  let failedPosts = 0;
  if (isDbConfigured()) {
    try {
      const rows = await query<{ expired: number; failed: number }>(
        "select (select count(*)::int from socialapp.social_accounts where user_id=$1 and platform='instagram' and status='expired') as expired, (select count(*)::int from socialapp.scheduled_posts where user_id=$1 and status='failed') as failed",
        [user.id]
      );
      needsReconnect = (rows[0]?.expired ?? 0) > 0;
      failedPosts = rows[0]?.failed ?? 0;
    } catch {
      needsReconnect = false;
      failedPosts = 0;
    }
  }
  const channels = await getSidebarChannels(user.id);
  return (
    <div className={`app-theme ${instrumentSans.variable} ${styles.shell}`}>
      <aside className={styles.sidebar}>
        <Logo />
        <NewMenu />
        <div className={styles.sideScroll}>
          <SidebarNav failedPosts={failedPosts} />
          <Channels channels={channels} />
        </div>
        <SidebarNav variant="footer" failedPosts={failedPosts} />
        <div className={styles.userBox}>
          <p className={styles.userEmail} title={user.email}>{user.email}</p>
          <form action={logoutAction}>
            <button type="submit" className={styles.logoutBtn}>Log out</button>
          </form>
        </div>
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
          <SidebarNav variant="tabs" failedPosts={failedPosts} />
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
