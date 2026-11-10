"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  Users,
  CreditCard,
  CalendarDays,
  MessageCircleHeart,
  Settings,
  ScrollText,
} from "lucide-react";
import PoskooMark from "@/components/PoskooMark";
import { logoutAction } from "../login/actions";
import styles from "./admin.module.css";

type NavItem = { href: string; icon: typeof LayoutDashboard; label: string };

const groups: { title: string; items: NavItem[] }[] = [
  { title: "Monitor", items: [{ href: "/admin", icon: LayoutDashboard, label: "Overview" }, { href: "/admin/system", icon: Activity, label: "System" }] },
  {
    title: "Customers",
    items: [
      { href: "/admin/users", icon: Users, label: "Users" },
      { href: "/admin/billing", icon: CreditCard, label: "Billing" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/posts", icon: CalendarDays, label: "Posts & queue" },
      { href: "/admin/automations", icon: MessageCircleHeart, label: "Automations" },
    ],
  },
  {
    title: "Control",
    items: [
      { href: "/admin/settings", icon: Settings, label: "Settings" },
      { href: "/admin/audit", icon: ScrollText, label: "Audit log" },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname() ?? "/admin";
  return (
    <aside className={styles.sidebar}>
      <Link href="/admin" className={styles.logo}>
        <PoskooMark size={28} />
        poskoo<b>.</b>
        <span className={styles.adminPill}>Admin</span>
      </Link>
      <div className={styles.sideScroll}>
        {groups.map((g) => (
          <div key={g.title} className={styles.navGroup}>
            <p className={styles.navGroupTitle}>{g.title}</p>
            {g.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                >
                  <Icon width={18} height={18} aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </div>
      <div className={styles.sideFoot}>
        <span title={email}>{email}</span>
        <Link href="/app" className={styles.footLink}>
          ← Back to app
        </Link>
        <form action={logoutAction}>
          <button type="submit" className={styles.footLink} style={{ background: "none", border: "none", cursor: "pointer", font: "inherit", color: "inherit" }}>
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
