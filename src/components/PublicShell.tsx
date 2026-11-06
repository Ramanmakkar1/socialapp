import type { CSSProperties, ReactNode } from "react";
import { instrumentSans, instrumentSerif } from "@/lib/fonts";
import landing from "@/app/landing.module.css";
import s from "./site.module.css";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

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
export default function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${landing.landing} ${s.shell} ${instrumentSans.variable} ${instrumentSerif.variable}`}
      style={tokenBridge}
    >
      <div className="wrap">
        <SiteHeader />
      </div>
      <main className={`wrap ${s.main}`}>{children}</main>
      <div className="wrap">
        <SiteFooter />
      </div>
    </div>
  );
}
