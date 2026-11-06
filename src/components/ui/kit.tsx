import Link from "next/link";
import Image from "next/image";
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

/** Page hero for logged-in pages: eyebrow, big heading with an optional serif accent word, lede and art tile. */
export function PageHero({
  eyebrow,
  title,
  accent,
  accentAfter,
  lede,
  art = "/landing/card-schedule.webp",
  artAlt = "",
  action,
}: {
  eyebrow: string;
  title: string;
  /** Serif italic accent shown after the title, e.g. "creator." */
  accent?: string;
  /** Text shown after the serif accent (defaults to "."). */
  accentAfter?: string;
  lede?: string;
  art?: string;
  artAlt?: string;
  action?: ReactNode;
}) {
  return (
    <header className={ui.hero}>
      <div>
        <p className={ui.eyebrow}>{eyebrow}</p>
        <h1 className={ui.title}>
          {title}
          {accent ? (
            <>
              {" "}
              <em>{accent}</em>
              {accentAfter ?? "."}
            </>
          ) : null}
        </h1>
        {lede ? <p className={ui.lede}>{lede}</p> : null}
        {action ? <div style={{ marginTop: 16 }}>{action}</div> : null}
      </div>
      <div className={ui.heroArt}>
        <Image src={art} alt={artAlt} width={900} height={900} sizes="200px" />
      </div>
    </header>
  );
}
