"use client";

import type { KeyboardEvent, MouseEvent } from "react";
import { AlertCircle, CheckCircle2, Clock3, Loader2, PencilLine, Play } from "lucide-react";
import { PLATFORM_ICON, STATUS_LABEL, formatDayTime, formatTime, isMovable, type CalendarPost } from "./calendarUtils";
import styles from "./calendar.module.css";

const STATUS_ICON: Record<string, typeof Clock3> = { scheduled: Clock3, draft: PencilLine, published: CheckCircle2, failed: AlertCircle, publishing: Loader2 };

// One post: media tile (thumbnail, or a channel-coloured icon tile when the post has no media),
// network icons + time, 2-line caption, status icon. Used by the week, month and list views.
// Clicking (or Enter/Space) opens the post popover; scheduled posts and drafts can be dragged.
export default function PostCard({ post, tz, compact = false, row = false, onOpen }: {
  post: CalendarPost;
  tz: string;
  /** Month grid: no tile, one-line caption. */
  compact?: boolean;
  /** List view: wide row with a bigger tile, status label and the full local date + time. */
  row?: boolean;
  onOpen: (post: CalendarPost, el: HTMLElement) => void;
}) {
  const movable = isMovable(post.status);
  const platforms = post.platforms.length ? post.platforms : ["instagram"];
  const StatusIcon = STATUS_ICON[post.status] ?? Clock3;
  const time = post.scheduled_at ? (row ? formatDayTime(post.scheduled_at, tz) : formatTime(post.scheduled_at, tz)) : "No time set";
  const statusLabel = STATUS_LABEL[post.status] ?? post.status;
  const label = `${statusLabel} post${post.scheduled_at ? ` at ${time}` : ""} on ${platforms.join(", ")}: ${post.caption.slice(0, 80) || "no caption"}`;
  const TileIcon = PLATFORM_ICON[platforms[0]] ?? PLATFORM_ICON.threads;

  const open = (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => onOpen(post, e.currentTarget);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={label}
      draggable={movable && !row}
      onDragStart={
        movable && !row
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
      className={[styles.card, compact ? styles.cardCompact : "", row ? styles.cardRow : "", styles[`card_${post.status}`] ?? "", movable && !row ? styles.chipMovable : ""].filter(Boolean).join(" ")}
    >
      <div className={styles.cardHead}>
        {!compact && (
          post.thumb ? (
            <span className={styles.cardThumb} aria-hidden="true">
              {/* eslint-disable-next-line @next/next/no-img-element -- user media from arbitrary hosts */}
              <img src={post.thumb} alt="" loading="lazy" />
              {post.thumbIsVideo && <Play className={styles.playIcon} width={12} height={12} />}
            </span>
          ) : (
            <span className={`${styles.cardThumb} ${styles.cardTile} ${styles[`tile_${platforms[0]}`] ?? ""}`} aria-hidden="true">
              <TileIcon width={row ? 20 : 16} height={row ? 20 : 16} />
            </span>
          )
        )}
        <p className={styles.cardTop}>
          <span className={styles.cardIcons} aria-hidden="true">
            {platforms.slice(0, compact ? 1 : 3).map((p) => {
              const Icon = PLATFORM_ICON[p] ?? PLATFORM_ICON.threads;
              return <Icon key={p} width={13} height={13} className={styles[`ico_${p}`]} />;
            })}
          </span>
          <span className={styles.cardTime} suppressHydrationWarning>{time}</span>
          {row && <span className={`${styles.statusTag} ${styles[`status_${post.status}`] ?? ""}`}>{statusLabel}</span>}
        </p>
        {!row && <StatusIcon className={`${styles.cardStatus} ${styles[`statusIco_${post.status}`] ?? ""}`} width={14} height={14} aria-hidden="true" />}
      </div>
      <p className={styles.cardCaption}>{post.caption.trim() || "(no caption)"}</p>
      {row && post.status === "failed" && post.error && <p className={styles.cardError}>Couldn’t publish: {post.error.slice(0, 160)}</p>}
    </div>
  );
}
