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
  if (isDbConfigured()) {
    try {
      const rows = await query<{ n: number }>(
        "select count(*)::int as n from socialapp.social_accounts where user_id=$1 and platform='instagram' and status='expired'",
        [user.id]
      );
      needsReconnect = (rows[0]?.n ?? 0) > 0;
    } catch {
      needsReconnect = false;
    }
  }
  return (
    <div className={`app-theme ${instrumentSans.variable} ${styles.shell}`}>
      <aside className={styles.sidebar}>
        <Logo />
        <SidebarNav />
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
          <SidebarNav variant="tabs" />
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
