"use client";

import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import styles from "./admin.module.css";

const TITLES: [string, string][] = [
  ["/admin/system", "System"],
  ["/admin/users", "Users"],
  ["/admin/billing", "Billing"],
  ["/admin/posts", "Posts & queue"],
  ["/admin/automations", "Automations"],
  ["/admin/settings", "Settings"],
  ["/admin/audit", "Audit log"],
];

function titleFor(pathname: string): string {
  const hit = TITLES.find(([href]) => pathname === href || pathname.startsWith(`${href}/`));
  return hit ? hit[1] : "Overview";
}

export default function AdminTopbar({ stripeMode }: { stripeMode: "live" | "test" }) {
  const pathname = usePathname() ?? "/admin";
  return (
    <div className={styles.topbar}>
      <h1>{titleFor(pathname)}</h1>
      <label className={styles.search}>
        <Search size={16} aria-hidden="true" />
        <span>Search users, emails, @handles</span>
        <kbd>⌘K</kbd>
      </label>
      <span className={`${styles.envPill} ${stripeMode === "test" ? styles.envPillTest : ""}`}>
        {stripeMode === "test" ? "● Stripe test mode" : "● Live"}
      </span>
    </div>
  );
}
