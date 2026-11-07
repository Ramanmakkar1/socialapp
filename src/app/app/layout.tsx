import { Suspense, type ReactNode } from "react";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { instrumentSans } from "@/lib/fonts";
import { logoutAction } from "../login/actions";
import PoskooMark from "@/components/PoskooMark";
import { BtnA } from "@/components/ui/kit";
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
  return (
    <div className={`app-theme ${instrumentSans.variable} ${styles.shell}`}>
      <aside className={styles.sidebar}>
        <Logo />
        <SidebarNav failedPosts={failedPosts} />
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
