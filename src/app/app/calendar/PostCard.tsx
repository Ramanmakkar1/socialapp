"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { AlertCircle, CheckCircle2, Clock3, Loader2, PencilLine, Play } from "lucide-react";
import { PLATFORM_ICON, STATUS_LABEL, formatTime, isMovable, type CalendarPost } from "./calendarUtils";
import styles from "./calendar.module.css";

const STATUS_ICON: Record<string, typeof Clock3> = { scheduled: Clock3, draft: PencilLine, published: CheckCircle2, failed: AlertCircle, publishing: Loader2 };

// One post inside a calendar cell: network icon + time, 2-line caption, thumbnail, status icon.
// Clicking (or Enter/Space) opens the post popover; scheduled posts and drafts can be dragged.
export default function PostCard({ post, tz, compact = false, onOpen }: {
  post: CalendarPost;
  tz: string;
  compact?: boolean;
  onOpen: (post: CalendarPost, el: HTMLElement) => void;
}) {
  const movable = isMovable(post.status);
  const platforms = post.platforms.length ? post.platforms : ["instagram"];
  const StatusIcon = STATUS_ICON[post.status] ?? Clock3;
  const time = post.scheduled_at ? formatTime(post.scheduled_at, tz) : "";
  const label = `${STATUS_LABEL[post.status] ?? post.status} post at ${time} on ${platforms.join(", ")}: ${post.caption.slice(0, 80) || "no caption"}`;

  const open = (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => onOpen(post, e.currentTarget);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={label}
      draggable={movable}
      onDragStart={
        movable
          ? (e) => {
              e.dataTransfer.setData("text/plain", post.id);
              e.dataTransfer.effectAllowed = "move";
            }
          : undefined
      }
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(e);
        }
      }}
      className={[styles.card, compact ? styles.cardCompact : "", styles[`card_${post.status}`] ?? "", movable ? styles.chipMovable : ""].filter(Boolean).join(" ")}
    >
      <div className={styles.cardText}>
        <p className={styles.cardTop}>
          <span className={styles.cardIcons} aria-hidden="true">
            {platforms.slice(0, compact ? 1 : 3).map((p) => {
              const Icon = PLATFORM_ICON[p] ?? PLATFORM_ICON.threads;
              return <Icon key={p} width={13} height={13} className={styles[`ico_${p}`]} />;
            })}
          </span>
          <span className={styles.cardTime} suppressHydrationWarning>{time}</span>
        </p>
        <p className={styles.cardCaption}>{post.caption.trim() || "(no caption)"}</p>
      </div>
      {!compact && post.thumb && (
        <span className={styles.cardThumb} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element -- user media from arbitrary hosts */}
          <img src={post.thumb} alt="" loading="lazy" />
          {post.thumbIsVideo && <Play className={styles.playIcon} width={12} height={12} />}
        </span>
      )}
      <StatusIcon className={`${styles.cardStatus} ${styles[`statusIco_${post.status}`] ?? ""}`} width={14} height={14} aria-hidden="true" />
    </div>
  );
}
