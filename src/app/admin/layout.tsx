import type { ReactNode } from "react";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { instrumentSans } from "@/lib/fonts";
import AdminSidebar from "./AdminSidebar";
import AdminTopbar from "./AdminTopbar";
import styles from "./admin.module.css";

// The admin area is private: never indexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Every /admin page is per-admin: never prerender or cache it at build time.
export const dynamic = "force-dynamic";

// Super-admin shell. requireAdmin() 404s guests and non-admins before anything renders.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
  const stripeMode: "live" | "test" = stripeKey.startsWith("sk_test") ? "test" : "live";
  return (
    <div className={`${styles.shell} ${instrumentSans.variable}`}>
      <AdminSidebar email={admin.email} />
      <main className={styles.main}>
        <AdminTopbar stripeMode={stripeMode} />
        <div className={styles.wrap}>{children}</div>
      </main>
    </div>
  );
}
