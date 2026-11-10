"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, MessageCircleHeart, LayoutTemplate, Inbox, Users, BarChart3, Settings, BookOpenCheck, History, Link2 } from "lucide-react";
import styles from "./shell.module.css";

type NavItem = { href: string; icon: typeof LayoutDashboard; label: string };

// Grouped like a scheduling suite: publish, engage, create, analyze.
const groups: { title: string | null; items: NavItem[] }[] = [
  { title: null, items: [{ href: "/app", icon: LayoutDashboard, label: "Home" }] },
  { title: "Publish", items: [{ href: "/app/calendar", icon: CalendarDays, label: "Calendar" }] },
  {
    title: "Engage",
    items: [
      { href: "/app/auto-dm", icon: MessageCircleHeart, label: "Auto-DM" },
      { href: "/app/inbox", icon: Inbox, label: "Inbox" },
      { href: "/app/contacts", icon: Users, label: "Contacts" },
      { href: "/app/rewind", icon: History, label: "Rewind" },
    ],
  },
  { title: "Create", items: [{ href: "/app/templates", icon: LayoutTemplate, label: "Templates" }, { href: "/app/bio", icon: Link2, label: "Link in bio" }] },
  { title: "Analyze", items: [{ href: "/app/analytics", icon: BarChart3, label: "Analytics" }] },
];

const footer: NavItem[] = [
  { href: "/app/settings", icon: Settings, label: "Settings" },
  { href: "/app/review-guide", icon: BookOpenCheck, label: "Review guide" },
];

const flat: NavItem[] = [...groups.flatMap((g) => g.items), ...footer];

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Item({ item, pathname, failedPosts, tabs }: { item: NavItem; pathname: string; failedPosts: number; tabs: boolean }) {
  const { href, icon: Icon, label } = item;
  const active = isActive(pathname, href);
  const showBadge = href === "/app/calendar" && failedPosts > 0;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${tabs ? styles.tab : styles.navItem} ${active ? (tabs ? styles.tabActive : styles.navItemActive) : ""}`}
    >
      <Icon width={17} height={17} aria-hidden="true" />
      {label}
      {showBadge && (
        <span className={styles.navBadge} aria-label={`${failedPosts} failed ${failedPosts === 1 ? "post" : "posts"}`}>
          {failedPosts > 99 ? "99+" : failedPosts}
        </span>
      )}
    </Link>
  );
}

// variant "sidebar" = grouped vertical list in the aside; "tabs" = horizontal scrollable pill bar for mobile;
// "footer" = Settings + Review guide at the bottom of the sidebar.
export default function SidebarNav({ variant = "sidebar", failedPosts = 0 }: { variant?: "sidebar" | "tabs" | "footer"; failedPosts?: number }) {
  const pathname = usePathname() ?? "";
  if (variant === "tabs") {
    return (
      <nav aria-label="Dashboard" className={styles.tabs}>
        {flat.map((item) => (
          <Item key={item.href} item={item} pathname={pathname} failedPosts={failedPosts} tabs />
        ))}
      </nav>
    );
  }
  if (variant === "footer") {
    return (
      <nav aria-label="Account" className={styles.footNav}>
        {footer.map((item) => (
          <Item key={item.href} item={item} pathname={pathname} failedPosts={failedPosts} tabs={false} />
        ))}
      </nav>
    );
  }
  return (
    <nav aria-label="Dashboard" className={styles.nav}>
      {groups.map((g) => (
        <div key={g.title ?? "top"} className={styles.navGroup}>
          {g.title && <p className={styles.navGroupTitle}>{g.title}</p>}
          {g.items.map((item) => (
            <Item key={item.href} item={item} pathname={pathname} failedPosts={failedPosts} tabs={false} />
          ))}
        </div>
      ))}
    </nav>
  );
}
