"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { LayoutDashboard, CalendarDays, MessageCircleHeart, LayoutTemplate, Inbox, Users, BarChart3, Settings, BookOpenCheck, History, Link2, Shield, LifeBuoy, Package, Receipt, Magnet, Gift, Clapperboard, Flame, Lightbulb, MoreHorizontal, ChevronDown, Images } from "lucide-react";
import styles from "./shell.module.css";

type NavItem = { href: string; icon: typeof LayoutDashboard; label: string; badge?: string };

// TryPost-style: a short list of the main jobs (Create, Publish, Insights, Inbox, Automations),
// then everything else behind a compact "More" group so the channel list stays near the top.
const primary: NavItem[] = [
  { href: "/app", icon: LayoutDashboard, label: "Home" },
  { href: "/app/create", icon: Lightbulb, label: "Create" },
  { href: "/app/publish", icon: CalendarDays, label: "Publish" },
  { href: "/app/insights", icon: BarChart3, label: "Insights" },
  { href: "/app/inbox", icon: Inbox, label: "Inbox" },
  { href: "/app/auto-dm", icon: MessageCircleHeart, label: "Automations" },
];

const more: NavItem[] = [
  { href: "/app/contacts", icon: Users, label: "Contacts" },
  { href: "/app/rewind", icon: History, label: "Rewind" },
  { href: "/app/media", icon: Images, label: "Media library", badge: "New" },
  { href: "/app/content", icon: Clapperboard, label: "Posts & Reels" },
  { href: "/app/templates", icon: LayoutTemplate, label: "Templates" },
  { href: "/app/bio", icon: Link2, label: "Link in bio" },
  { href: "/app/trends", icon: Flame, label: "Trends", badge: "New" },
  { href: "/app/products", icon: Package, label: "Products" },
  { href: "/app/orders", icon: Receipt, label: "Orders" },
  { href: "/app/lead-magnets", icon: Magnet, label: "Lead magnet", badge: "New" },
  { href: "/app/referrals", icon: Gift, label: "Refer and earn" },
];

/** Kept for callers that list every destination (mobile titles). */
const groups: { title: string | null; items: NavItem[] }[] = [
  { title: null, items: primary },
  { title: "More", items: more },
];

const baseFooter: NavItem[] = [
  { href: "/app/settings", icon: Settings, label: "Settings" },
  { href: "/app/review-guide", icon: BookOpenCheck, label: "Review guide" },
  { href: "/help/getting-started", icon: LifeBuoy, label: "Help" },
];

const TITLES: [string, string][] = [
  ...groups.flatMap((g) => g.items.filter((i) => !i.href.includes("?")).map((i): [string, string] => [i.href, i.label])),
  ["/app/channels", "Channel"],
  ...baseFooter.map((i): [string, string] => [i.href, i.label]),
  ["/app/auto-dm/activity", "Auto-DM activity"],
  ["/app/insights/report", "Analytics report"],
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

// Workspace members (src/lib/workspace.ts) can't open these: settings, products and orders are owner/admin only.
const MEMBER_HIDDEN = new Set(["/app/settings", "/app/products", "/app/orders"]);

// The Admin link only appears for super-admins (see lib/admin.ts).
function getFooter(showAdmin: boolean): NavItem[] {
  return showAdmin ? [...baseFooter, { href: "/admin", icon: Shield, label: "Admin" }] : baseFooter;
}

export function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Create = the ideas board (/app/create) and templates; Publish = the rest of the calendar + channel pages. */
function isItemActive(pathname: string, view: string | null, href: string): boolean {
  if (href === "/app/create") return isActive(pathname, "/app/create") || isActive(pathname, "/app/templates");
  if (href === "/app/publish") return isActive(pathname, "/app/publish") || isActive(pathname, "/app/channels");
  if (href === "/app/templates") return false; // highlighted as "Create"
  return isActive(pathname, href);
}

function Item({ item, pathname, view = null, failedPosts, scheduledPosts = 0, pendingOrders = 0 }: { item: NavItem; pathname: string; view?: string | null; failedPosts: number; scheduledPosts?: number; pendingOrders?: number }) {
  const { href, icon: Icon, label, badge } = item;
  const active = isItemActive(pathname, view, href);
  const showBadge = href === "/app/publish" && failedPosts > 0;
  const showCount = href === "/app/publish" && !showBadge && scheduledPosts > 0;
  // UPI payments waiting for the seller to confirm (Direct UPI, sellers in India).
  const showOrders = href === "/app/orders" && pendingOrders > 0;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
    >
      <Icon width={17} height={17} aria-hidden="true" />
      <span className={styles.navLabel}>{label}</span>
      {badge && <span className={`${styles.newPill} ${styles.navLabel}`}>{badge}</span>}
      {showBadge && (
        <span className={styles.navBadge} aria-label={`${failedPosts} failed ${failedPosts === 1 ? "post" : "posts"}`}>
          {failedPosts > 99 ? "99+" : failedPosts}
        </span>
      )}
      {showOrders && (
        <span className={styles.navBadge} aria-label={`${pendingOrders} ${pendingOrders === 1 ? "payment" : "payments"} to confirm`}>
          {pendingOrders > 99 ? "99+" : pendingOrders}
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
  pendingOrders = 0,
  showAdmin = false,
  isMember = false,
}: {
  variant?: "sidebar" | "footer";
  failedPosts?: number;
  scheduledPosts?: number;
  pendingOrders?: number;
  showAdmin?: boolean;
  /** A workspace member (not owner/admin): hide owner/admin-only destinations. */
  isMember?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const view = useSearchParams()?.get("view") ?? null;
  const footer = getFooter(showAdmin).filter((i) => !isMember || !MEMBER_HIDDEN.has(i.href));
  const moreItems = more.filter((i) => !isMember || !MEMBER_HIDDEN.has(i.href));
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
  const moreOpen = more.some((i) => isActive(pathname, i.href));
  return (
    <nav ref={navRef} aria-label="Dashboard" className={styles.nav}>
      <div className={styles.navGroup}>
        {primary.map((item) => (
          <Item key={item.href} item={item} pathname={pathname} view={view} failedPosts={failedPosts} scheduledPosts={scheduledPosts} pendingOrders={pendingOrders} />
        ))}
      </div>
      <details className={styles.moreGroup} open={moreOpen || undefined}>
        <summary className={styles.navItem}>
          <MoreHorizontal width={17} height={17} aria-hidden="true" />
          <span className={styles.navLabel}>More</span>
          {pendingOrders > 0 && <span className={styles.navBadge} aria-label={`${pendingOrders} ${pendingOrders === 1 ? "payment" : "payments"} to confirm`}>{pendingOrders > 99 ? "99+" : pendingOrders}</span>}
          <ChevronDown width={14} height={14} aria-hidden="true" className={`${styles.moreChevron} ${styles.navLabel}`} />
        </summary>
        <div className={styles.moreBody}>
          {moreItems.map((item) => (
            <Item key={item.href} item={item} pathname={pathname} view={view} failedPosts={failedPosts} pendingOrders={pendingOrders} />
          ))}
        </div>
      </details>
    </nav>
  );
}
