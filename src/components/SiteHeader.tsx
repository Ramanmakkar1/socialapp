import Link from "next/link";
import { Zap } from "lucide-react";
import { BRAND } from "@/lib/brand";

const NAV_LINKS = [
  { href: "/instagram-scheduler", label: "Scheduler" },
  { href: "/instagram-auto-dm", label: "Auto DM" },
  { href: "/tools", label: "Free tools" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/help", label: "Help" },
];

const navLinkClass =
  "inline-flex min-h-11 items-center rounded-full px-2.5 text-sm font-medium text-ink-2 transition hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:px-3";

const accountCtaClass =
  "btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand sm:px-4";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-4">
        <Link href="/" className="flex shrink-0 items-center gap-1.5 font-semibold sm:gap-2">
          <span className="btn-primary grid h-8 w-8 place-items-center rounded-lg">
            <Zap className="h-4 w-4" />
          </span>
          {BRAND.name}
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={navLinkClass}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link href="/login" className={navLinkClass}>
            Log in
          </Link>
          <Link href="/signup" className={accountCtaClass}>
            Start free
          </Link>
        </div>
      </div>
      <nav aria-label="Main mobile" className="flex gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-line bg-surface px-3 text-xs font-medium text-ink-2"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
