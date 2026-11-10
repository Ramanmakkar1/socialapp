"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "../admin.module.css";

export type Tab = { href: string; label: string };

// Underline tabs; the active tab gets a coral 2px underline.
export default function Tabs({ tabs }: { tabs: Tab[] }) {
  const pathname = usePathname() ?? "";
  return (
    <nav className={styles.tabs} aria-label="Sections">
      {tabs.map((t) => {
        const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
        return (
          <Link key={t.href} href={t.href} className={`${styles.tab} ${active ? styles.tabActive : ""}`}>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
