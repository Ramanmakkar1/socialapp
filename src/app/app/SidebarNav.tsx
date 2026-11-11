"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
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
      { href: "/app/auto-dm", icon: MessageCircleHeart, label: "Automations" },
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

// The Admin link only appears for super-admins (see lib/admin.ts).
function getFooter(showAdmin: boolean): NavItem[] {
  return showAdmin ? [...baseFooter, { href: "/admin", icon: Shield, label: "Admin" }] : baseFooter;
}

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function Item({ item, pathname, failedPosts, scheduledPosts = 0, tabs }: { item: NavItem; pathname: string; failedPosts: number; scheduledPosts?: number; tabs: boolean }) {
  const { href, icon: Icon, label, badge } = item;
  const active = isActive(pathname, href);
  const showBadge = href === "/app/calendar" && failedPosts > 0;
  const showCount = href === "/app/calendar" && !showBadge && scheduledPosts > 0;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${tabs ? styles.tab : styles.navItem} ${active ? (tabs ? styles.tabActive : styles.navItemActive) : ""}`}
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

// variant "sidebar" = grouped vertical list in the aside; "tabs" = horizontal scrollable pill bar for mobile;
// "footer" = Settings + Review guide at the bottom of the sidebar.
export default function SidebarNav({
  variant = "sidebar",
  failedPosts = 0,
  scheduledPosts = 0,
  showAdmin = false,
}: {
  variant?: "sidebar" | "tabs" | "footer";
  failedPosts?: number;
  scheduledPosts?: number;
  showAdmin?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const footer = getFooter(showAdmin);
  const flat = [...groups.flatMap((g) => g.items), ...footer];
  if (variant === "tabs") {
    return (
      <TabsScroller pathname={pathname}>
        {flat.map((item) => (
          <Item key={item.href} item={item} pathname={pathname} failedPosts={failedPosts} scheduledPosts={scheduledPosts} tabs />
        ))}
      </TabsScroller>
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
            <Item key={item.href} item={item} pathname={pathname} failedPosts={failedPosts} scheduledPosts={scheduledPosts} tabs={false} />
          ))}
        </div>
      ))}
    </nav>
  );
}

// Mobile tab bar: fades the edge that has more tabs behind it (so it reads as scrollable)
// and keeps the active tab in view.
function TabsScroller({ pathname, children }: { pathname: string; children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      el.dataset.moreLeft = el.scrollLeft > 4 ? "1" : "0";
      el.dataset.moreRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 4 ? "1" : "0";
    };
    const active = el.querySelector<HTMLElement>("[aria-current='page']");
    if (active) {
      const offset = active.getBoundingClientRect().left - el.getBoundingClientRect().left + el.scrollLeft;
      el.scrollLeft = Math.max(0, offset - el.clientWidth / 2 + active.offsetWidth / 2);
    }
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);
  return (
    <nav ref={ref} aria-label="Dashboard" className={styles.tabs} data-more-right="1">
      {children}
    </nav>
  );
}
