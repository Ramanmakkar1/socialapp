"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, MessageCircleHeart, Inbox, Users, BarChart3, Settings, BookOpenCheck } from "lucide-react";

const nav = [
  { href: "/app", icon: LayoutDashboard, label: "Overview" },
  { href: "/app/calendar", icon: CalendarDays, label: "Calendar" },
  { href: "/app/auto-dm", icon: MessageCircleHeart, label: "Auto-DM" },
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

// variant "sidebar" = vertical list in the aside; "tabs" = horizontal scrollable bar for mobile.
export default function SidebarNav({ variant = "sidebar" }: { variant?: "sidebar" | "tabs" }) {
  const pathname = usePathname() ?? "";
  const tabs = variant === "tabs";
  return (
    <nav aria-label="Dashboard" className={tabs ? "flex gap-1 overflow-x-auto px-4 py-2 text-sm" : "space-y-1 text-sm"}>
      {nav.map(({ href, icon: Icon, label }) => {
        const active = isActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 ${tabs ? "shrink-0 whitespace-nowrap" : ""} ${active ? "bg-surface-2 font-medium" : "text-ink-2 hover:bg-surface-2"}`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
