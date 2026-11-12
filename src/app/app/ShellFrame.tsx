"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { CalendarDays, Inbox, LayoutDashboard, Menu, MessageCircleHeart, MoreHorizontal, Plus, X } from "lucide-react";
import { isActive, pageTitle } from "./SidebarNav";
import styles from "./shell.module.css";

const TABS = [
  { href: "/app", icon: LayoutDashboard, label: "Home" },
  { href: "/app/calendar", icon: CalendarDays, label: "Calendar" },
  { href: "/app/inbox", icon: Inbox, label: "Inbox" },
  { href: "/app/auto-dm", icon: MessageCircleHeart, label: "Auto-DM" },
];

const DRAWER_ID = "app-sidebar";
const DESKTOP = "(min-width: 900px)";

// Shell chrome around every dashboard page. Desktop (>= 900px): the sidebar sits on the left.
// Mobile: a compact top bar + bottom tab bar, and the same sidebar becomes an off-canvas drawer
// (backdrop, focus kept inside, closes on Escape / backdrop / link click / route change).
export default function ShellFrame({
  sidebar,
  logo,
  initial,
  failedPosts = 0,
  children,
}: {
  sidebar: ReactNode;
  logo: ReactNode;
  initial: string;
  failedPosts?: number;
  children: ReactNode;
}) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [seenPath, setSeenPath] = useState(pathname);
  const asideRef = useRef<HTMLElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  // Route change closes the drawer.
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    if (open) setOpen(false);
  }

  const close = useCallback(() => setOpen(false), []);

  function openDrawer(e: MouseEvent<HTMLElement>) {
    openerRef.current = e.currentTarget;
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    const aside = asideRef.current;
    const focusables = () =>
      aside ? [...aside.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), summary, input, select, textarea, [tabindex]:not([tabindex='-1'])")].filter((el) => el.offsetParent !== null) : [];
    // Focus the drawer itself (not the close button) so no focus ring flashes on open.
    aside?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      // A modal <dialog> opened from inside the drawer handles its own Escape.
      if (document.querySelector("dialog[open]")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      } else if (e.key === "Tab") {
        const list = focusables();
        if (list.length === 0) return;
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    const mq = window.matchMedia(DESKTOP);
    const onMq = () => { if (mq.matches) setOpen(false); };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    const opener = openerRef.current;
    return () => {
      root.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      if (opener && document.contains(opener)) opener.focus({ preventScroll: true });
    };
  }, [open]);

  // A link inside the drawer closes it, even when it points at the current page.
  function onAsideClick(e: MouseEvent<HTMLElement>) {
    if (open && (e.target as HTMLElement).closest("a[href]")) setOpen(false);
  }

  const title = pageTitle(pathname);

  return (
    <>
      <aside
        ref={asideRef}
        id={DRAWER_ID}
        className={styles.sidebar}
        data-open={open ? "true" : undefined}
        aria-label="Main menu"
        tabIndex={open ? -1 : undefined}
        onClick={onAsideClick}
      >
        <button type="button" className={styles.drawerClose} onClick={close} aria-label="Close menu">
          <X width={20} height={20} aria-hidden="true" />
        </button>
        {sidebar}
      </aside>
      {open && <div className={styles.backdrop} onClick={close} aria-hidden="true" />}
      <main className={`min-w-0 flex-1 ${styles.main}`} inert={open || undefined}>
        <header className={styles.topbar}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={openDrawer}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls={DRAWER_ID}
          >
            <Menu width={22} height={22} aria-hidden="true" />
          </button>
          {logo}
          <p className={styles.topbarTitle}>{title}</p>
          <Link href="/app/calendar?compose=1" className={styles.topbarNew}>
            <Plus width={16} height={16} aria-hidden="true" /> New
          </Link>
          <Link href="/app/settings" className={styles.topbarAvatar} aria-label="Account settings">
            {initial}
          </Link>
        </header>
        {children}
      </main>
      <nav className={styles.bottomBar} aria-label="Main" inert={open || undefined}>
        {TABS.map(({ href, icon: Icon, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link key={href} href={href} aria-current={active ? "page" : undefined} className={`${styles.bottomTab} ${active ? styles.bottomTabActive : ""}`}>
              <span className={styles.bottomIcon}>
                <Icon width={20} height={20} aria-hidden="true" />
                {href === "/app/calendar" && failedPosts > 0 && (
                  <span className={styles.bottomDot} aria-hidden="true" />
                )}
              </span>
              {label}
              {href === "/app/calendar" && failedPosts > 0 && (
                <span className="sr-only">, {failedPosts} failed {failedPosts === 1 ? "post" : "posts"}</span>
              )}
            </Link>
          );
        })}
        <button type="button" className={styles.bottomTab} onClick={openDrawer} aria-expanded={open} aria-controls={DRAWER_ID}>
          <span className={styles.bottomIcon}><MoreHorizontal width={20} height={20} aria-hidden="true" /></span>
          More
        </button>
      </nav>
    </>
  );
}
