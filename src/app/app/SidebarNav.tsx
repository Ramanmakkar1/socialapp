"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { LayoutDashboard, CalendarDays, MessageCircleHeart, LayoutTemplate, Inbox, Users, BarChart3, Settings, BookOpenCheck, History, Link2, Shield, LifeBuoy, Package, Receipt, Magnet, Gift, Clapperboard } from "lucide-react";
import styles from "./shell.module.css";

type NavItem = { href: string; icon: typeof LayoutDashboard; label: string; badge?: string };

// Grouped like a scheduling suite: publish, engage, create, analyze.
const groups: { title: string | null; items: NavItem[] }[] = [
  { title: null, items: [{ href: "/app", icon: LayoutDashboard, label: "Home" }] },
  { title: "Publish", items: [{ href: "/app/calendar", icon: CalendarDays, label: "Calendar" }] },
  {
    title: "Engage",
    items: [
      { href: "/app/inbox", icon: Inbox, label: "Inbox" },
      { href: "/app/auto-dm", icon: MessageCircleHeart, label: "Auto-DM" },
      { href: "/app/contacts", icon: Users, label: "Contacts" },
      { href: "/app/rewind", icon: History, label: "Rewind" },
    ],
  },
  { title: "Create", items: [{ href: "/app/content", icon: Clapperboard, label: "Posts & Reels" }, { href: "/app/templates", icon: LayoutTemplate, label: "Templates" }, { href: "/app/bio", icon: Link2, label: "Link in bio" }] },
  { title: "Analyze", items: [{ href: "/app/analytics", icon: BarChart3, label: "Analytics" }] },
  {
    title: "Grow",
    items: [
      { href: "/app/products", icon: Package, label: "Products" },
      { href: "/app/orders", icon: Receipt, label: "Orders" },
      { href: "/app/lead-magnets", icon: Magnet, label: "Lead magnet", badge: "New" },
      { href: "/app/referrals", icon: Gift, label: "Refer and earn" },
    ],
  },
];

const baseFooter: NavItem[] = [
  { href: "/app/settings", icon: Settings, label: "Settings" },
  { href: "/app/review-guide", icon: BookOpenCheck, label: "Review guide" },
  { href: "/help/getting-started", icon: LifeBuoy, label: "Help" },
];

const TITLES: [string, string][] = [
  ...groups.flatMap((g) => g.items.map((i): [string, string] => [i.href, i.label])),
  ...baseFooter.map((i): [string, string] => [i.href, i.label]),
  ["/app/auto-dm/activity", "Auto-DM activity"],
  ["/app/analytics/report", "Analytics report"],
  ["/app/leads", "Leads"],
  ["/app/settings/instagram", "Instagram settings"],
];

/** Short page name for the mobile top bar ("Home", "Calendar", ...); the longest matching href wins. */
export function pageTitle(pathname: string): string {
  let best: [string, string] | null = null;
  for (const entry of TITLES) {
    if (isActive(pathname, entry[0]) && (!best || entry[0].length > best[0].length)) best = entry;
  }
  return best?.[1] ?? "Dashboard";
}

// The Admin link only appears for super-admins (see lib/admin.ts).
function getFooter(showAdmin: boolean): NavItem[] {
  return showAdmin ? [...baseFooter, { href: "/admin", icon: Shield, label: "Admin" }] : baseFooter;
}

export function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Item({ item, pathname, failedPosts, scheduledPosts = 0 }: { item: NavItem; pathname: string; failedPosts: number; scheduledPosts?: number }) {
  const { href, icon: Icon, label, badge } = item;
  const active = isActive(pathname, href);
  const showBadge = href === "/app/calendar" && failedPosts > 0;
  const showCount = href === "/app/calendar" && !showBadge && scheduledPosts > 0;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
    >
      <Icon width={17} height={17} aria-hidden="true" />
      {label}
      {badge && <span className={styles.newPill}>{badge}</span>}
      {showBadge && (
        <span className={styles.navBadge} aria-label={`${failedPosts} failed ${failedPosts === 1 ? "post" : "posts"}`}>
          {failedPosts > 99 ? "99+" : failedPosts}
        </span>
      )}
      {showCount && (
        <span className={styles.navCount} aria-label={`${scheduledPosts} scheduled`}>
          {scheduledPosts > 99 ? "99+" : scheduledPosts}
        </span>
      )}
    </Link>
  );
}

// variant "sidebar" = grouped vertical list in the aside (also the mobile drawer);
// "footer" = Settings + Review guide at the bottom of the sidebar.
export default function SidebarNav({
  variant = "sidebar",
  failedPosts = 0,
  scheduledPosts = 0,
  showAdmin = false,
}: {
  variant?: "sidebar" | "footer";
  failedPosts?: number;
  scheduledPosts?: number;
  showAdmin?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const footer = getFooter(showAdmin);
  const navRef = useRef<HTMLElement>(null);

  // Keep the active item visible inside the scrolling sidebar (only that container scrolls, never the page).
  useEffect(() => {
    const nav = navRef.current;
    const active = nav?.querySelector<HTMLElement>("[aria-current=page]");
    const box = nav?.parentElement;
    if (!active || !box || box.scrollHeight <= box.clientHeight) return;
    const top = active.offsetTop - box.offsetTop;
    if (top < box.scrollTop || top + active.offsetHeight > box.scrollTop + box.clientHeight) {
      box.scrollTop = Math.max(0, top - box.clientHeight / 2);
    }
  }, [pathname]);
  if (variant === "footer") {
    return (
      <nav aria-label="Account" className={styles.footNav}>
        {footer.map((item) => (
          <Item key={item.href} item={item} pathname={pathname} failedPosts={failedPosts} />
        ))}
      </nav>
    );
  }
  return (
    <nav ref={navRef} aria-label="Dashboard" className={styles.nav}>
      {groups.map((g) => (
        <div key={g.title ?? "top"} className={styles.navGroup}>
          {g.title && <p className={styles.navGroupTitle}>{g.title}</p>}
          {g.items.map((item) => (
            <Item key={item.href} item={item} pathname={pathname} failedPosts={failedPosts} scheduledPosts={scheduledPosts} />
          ))}
        </div>
      ))}
    </nav>
  );
}
