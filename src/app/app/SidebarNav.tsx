"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, MessageCircleHeart, LayoutTemplate, Inbox, Users, BarChart3, Settings, BookOpenCheck } from "lucide-react";
import styles from "./shell.module.css";

const nav = [
  { href: "/app", icon: LayoutDashboard, label: "Overview" },
  { href: "/app/calendar", icon: CalendarDays, label: "Calendar" },
  { href: "/app/auto-dm", icon: MessageCircleHeart, label: "Auto-DM" },
  { href: "/app/templates", icon: LayoutTemplate, label: "Templates" },
  { href: "/app/inbox", icon: Inbox, label: "Inbox" },
  { href: "/app/leads", icon: Users, label: "Leads" },
  { href: "/app/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/app/settings", icon: Settings, label: "Settings" },
  { href: "/app/review-guide", icon: BookOpenCheck, label: "Review guide" },
];

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// variant "sidebar" = vertical list in the aside; "tabs" = horizontal scrollable pill bar for mobile.
export default function SidebarNav({ variant = "sidebar", failedPosts = 0 }: { variant?: "sidebar" | "tabs"; failedPosts?: number }) {
  const pathname = usePathname() ?? "";
  const tabs = variant === "tabs";
  return (
    <nav aria-label="Dashboard" className={tabs ? styles.tabs : styles.nav}>
      {nav.map(({ href, icon: Icon, label }) => {
        const active = isActive(pathname, href);
        const showBadge = href === "/app/calendar" && failedPosts > 0;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`${tabs ? styles.tab : styles.navItem} ${active ? (tabs ? styles.tabActive : styles.navItemActive) : ""}`}
          >
            <Icon width={17} height={17} aria-hidden="true" />
            {label}
            {showBadge && (
              <span
                className={styles.navBadge}
                aria-label={`${failedPosts} failed ${failedPosts === 1 ? "post" : "posts"}`}
              >
                {failedPosts > 99 ? "99+" : failedPosts}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
