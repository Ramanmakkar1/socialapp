import type { CSSProperties, ReactNode } from "react";
import { instrumentSans, instrumentSerif } from "@/lib/fonts";
import landing from "@/app/landing.module.css";
import s from "./site.module.css";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import Breadcrumbs from "./Breadcrumbs";

// Existing components style themselves with the generic token names
// (--surface, --brand, …). Inside the landing wrapper we bridge those names to
// the Poskoo palette so every child inherits the brand colours. No new colours —
// same values as globals.css maps them to in .app-theme.
const tokenBridge = {
  "--bg": "var(--poskoo-paper)",
  "--surface": "var(--poskoo-card)",
  "--surface-2": "var(--poskoo-band)",
  "--ink-2": "#3d3450",
  "--brand": "var(--poskoo-violet)",
  "--brand-2": "var(--poskoo-coral)",
  "--ok": "var(--poskoo-green)",
  "--warn": "var(--poskoo-coral)",
} as CSSProperties;

/**
 * Shared chrome for every public page: the landing's header and footer, the
 * landing wrapper (paper background, Instrument fonts, pill buttons) and a
 * centered main column. Pages render their sections inside.
 */
export default function PublicShell({
  children,
  breadcrumbs,
  className,
}: {
  children: ReactNode;
  /** Extra class on the root, e.g. s.sched for the platform scheduler pages. */
  className?: string;
  breadcrumbs?: { name: string; path: string }[];
}) {
  // Home is always first; the prop never includes it.
  const crumbs =
    breadcrumbs && breadcrumbs.length > 0 ? [{ name: "Home", path: "/" }, ...breadcrumbs] : null;
  return (
    <div
      className={`${landing.landing} ${s.shell} ${instrumentSans.variable} ${instrumentSerif.variable}${className ? ` ${className}` : ""}`}
      style={tokenBridge}
    >
      <div className="wrap">
        <SiteHeader />
      </div>
      <main className={`wrap ${s.main}`}>
        {crumbs && (
          <Breadcrumbs items={crumbs.map((c) => ({ name: c.name, href: c.path }))} />
        )}
        <ul className={s.trustStrip} aria-label="Poskoo trust highlights">
          {[
            "Official platform APIs",
            "No passwords",
            "$0 Free plan",
            "No credit card",
          ].map((item) => (
            <li key={item}>
              <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
                <path
                  d="M5 10.4l3.1 3L15 6.6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        {children}
      </main>
      <div className="wrap">
        <SiteFooter />
      </div>
    </div>
  );
}
