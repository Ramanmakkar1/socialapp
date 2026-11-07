import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { instrumentSans, instrumentSerif } from "@/lib/fonts";
import landing from "@/app/landing.module.css";
import s from "./site.module.css";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { BRAND } from "@/lib/brand";
import { breadcrumbJsonLd, ldJson } from "@/lib/tool-schema";

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
}: {
  children: ReactNode;
  breadcrumbs?: { name: string; path: string }[];
}) {
  // Home is always first; the prop never includes it.
  const crumbs =
    breadcrumbs && breadcrumbs.length > 0 ? [{ name: "Home", path: "/" }, ...breadcrumbs] : null;
  return (
    <div
      className={`${landing.landing} ${s.shell} ${instrumentSans.variable} ${instrumentSerif.variable}`}
      style={tokenBridge}
    >
      <div className="wrap">
        <SiteHeader />
      </div>
      <main className={`wrap ${s.main}`}>
        {crumbs && (
          <nav aria-label="Breadcrumb" className={s.crumbs}>
            {crumbs.map((c, i) => (
              <span key={c.path + c.name}>
                {i > 0 && <span aria-hidden="true"> / </span>}
                {i === crumbs.length - 1 ? (
                  <span aria-current="page">{c.name}</span>
                ) : (
                  <Link href={c.path}>{c.name}</Link>
                )}
              </span>
            ))}
          </nav>
        )}
        {children}
      </main>
      <div className="wrap">
        <SiteFooter />
      </div>
      {crumbs && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: ldJson(
              breadcrumbJsonLd(
                crumbs.map((c) => ({ name: c.name, url: BRAND.url + (c.path === "/" ? "/" : c.path) }))
              )
            ),
          }}
        />
      )}
    </div>
  );
}
