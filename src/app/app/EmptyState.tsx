import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import styles from "./empty-state.module.css";

/**
 * Designed empty state: landing illustration, short heading, one line of help and one next action.
 * `art` defaults to the square leads card; pass a wide /illustrations/*.webp with artWidth/artHeight.
 */
export default function EmptyState({
  icon: Icon,
  title,
  text,
  children,
  art = "/landing/card-leads.webp",
  artAlt = "",
  artWidth = 1024,
  artHeight = 1024,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  text: string;
  children?: ReactNode;
  art?: string;
  artAlt?: string;
  artWidth?: number;
  artHeight?: number;
  className?: string;
}) {
  const wide = artWidth > artHeight;
  return (
    <div className={[styles.empty, className].filter(Boolean).join(" ")}>
      <div className={`${styles.art} ${wide ? styles.artWide : ""}`}>
        <Image
          src={art}
          alt={artAlt}
          width={artWidth}
          height={artHeight}
          loading="lazy"
          sizes={wide ? "(max-width: 480px) 80vw, 340px" : "220px"}
        />
        {Icon ? (
          <span aria-hidden="true" className={styles.icon}>
            <Icon aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>{text}</p>
      {children ? <div className={styles.actions}>{children}</div> : null}
    </div>
  );
}
