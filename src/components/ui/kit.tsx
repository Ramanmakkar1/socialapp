import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import ui from "./ui.module.css";

type BtnVariant = "dark" | "line" | "ghost" | "lime";
const VARIANT: Record<BtnVariant, string> = {
  dark: ui.btnDark,
  line: ui.btnLine,
  ghost: ui.btnGhost,
  lime: ui.btnLime,
};

function classes(variant: BtnVariant, size: "md" | "sm", extra?: string) {
  return [ui.btn, VARIANT[variant], size === "sm" ? ui.sm : "", extra].filter(Boolean).join(" ");
}

/** Pill button rendered as <button>. */
export function Btn({
  variant = "dark",
  size = "md",
  className,
  type = "button",
  ...rest
}: ComponentProps<"button"> & { variant?: BtnVariant; size?: "sm" | "md" }) {
  return <button {...rest} type={type} className={classes(variant, size, className)} />;
}

/** Pill button rendered as a Next.js <Link>. */
export function BtnLink({
  variant = "dark",
  size = "md",
  className,
  ...rest
}: ComponentProps<typeof Link> & { variant?: BtnVariant; size?: "sm" | "md" }) {
  return <Link {...rest} className={classes(variant, size, className)} />;
}

/**
 * Pill button rendered as a plain <a>. Use it for route handlers, file downloads,
 * /api/* redirects (OAuth) and external URLs: next/link would prefetch or RSC-fetch them.
 */
export function BtnA({
  variant = "dark",
  size = "md",
  className,
  ...rest
}: ComponentProps<"a"> & { variant?: BtnVariant; size?: "sm" | "md" }) {
  return <a {...rest} className={classes(variant, size, className)} />;
}

/** Rounded card in the landing surface style. */
export function Card({
  tone,
  className,
  children,
}: {
  tone?: "band" | "lilac" | "peach" | "pink" | "mint";
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={[ui.card, tone ? ui[tone] : "", className].filter(Boolean).join(" ")}>{children}</div>
  );
}

/**
 * Compact page header for logged-in pages: icon tile + title + one-line subtitle + right-side actions
 * (same shape as the Calendar and Auto-DM headers). The landing art now lives in empty states only;
 * `art`/`eyebrow` are accepted for backwards compatibility but not rendered as a big hero.
 */
export function PageHero({
  eyebrow,
  title,
  accent,
  lede,
  icon,
  action,
}: {
  eyebrow?: string;
  title: string;
  /** Extra title word(s), e.g. "billing" in "Plan & billing". */
  accent?: string;
  /** Deprecated: kept for callers; headings no longer end with a period. */
  accentAfter?: string;
  lede?: ReactNode;
  /** Icon shown in the tile; defaults to a generic page icon. */
  icon?: ReactNode;
  /** Deprecated: landing art moved to empty states. */
  art?: string;
  artAlt?: string;
  artWidth?: number;
  artHeight?: number;
  action?: ReactNode;
}) {
  const text = accent ? `${title} ${accent}` : title;
  return (
    <header className={ui.hero}>
      <div className={ui.heroMain}>
        <span className={ui.heroIcon} aria-hidden="true">
          {icon ?? <LayoutGrid width={20} height={20} />}
        </span>
        <div className={ui.heroText}>
          <h1 className={ui.title}>{text.replace(/\.$/, "")}</h1>
          {lede ? <p className={ui.lede}>{lede}</p> : eyebrow ? <p className={ui.lede}>{eyebrow}</p> : null}
        </div>
      </div>
      {action ? <div className={ui.heroActions}>{action}</div> : null}
    </header>
  );
}
