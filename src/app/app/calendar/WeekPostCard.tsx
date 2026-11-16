"use client";

import Link from "next/link";
import type { DragEvent, ReactNode } from "react";
import { Clapperboard, CircleDashed, GalleryHorizontalEnd, Image as ImageGlyph, Play, Video } from "lucide-react";
import { TopThumb } from "../TopThumb";
import { PLATFORM_ICON, PLATFORM_LABEL, STATUS_LABEL, formatTime, isMovable, type CalendarPost } from "./calendarUtils";
import { KIND_LABEL, type PostKind } from "./weekGrid";
import styles from "./calendar.module.css";

const KIND_ICON: Partial<Record<PostKind, typeof Video>> = {
  story: CircleDashed, reel: Clapperboard, video: Video, carousel: GalleryHorizontalEnd, image: ImageGlyph,
};

// Compact week-grid card: network icon + time + post-type icon, a 2-line caption and the media
// thumbnail on the right (placeholder when the upload is gone after publishing). Drafts and
// scheduled posts are links into the composer and can be dragged to another slot; published,
// publishing and failed posts open the post popover.
export default function WeekPostCard({ post, tz, editHref, onOpen }: {
  post: CalendarPost;
  tz: string;
  editHref: string;
  onOpen: (post: CalendarPost, el: HTMLElement) => void;
}) {
  const movable = isMovable(post.status);
  const platforms = post.platforms.length ? post.platforms : ["instagram"];
  const NetIcon = PLATFORM_ICON[platforms[0]] ?? PLATFORM_ICON.threads;
  const kind = post.kind ?? (post.thumbIsVideo ? "video" : post.thumb ? "image" : "text");
  const KindIcon = KIND_ICON[kind];
  const hasMedia = kind !== "text" || Boolean(post.thumb);
  const time = post.scheduled_at ? formatTime(post.scheduled_at, tz) : "No time set";
  const status = STATUS_LABEL[post.status] ?? post.status;
  const label = `${status} ${KIND_LABEL[kind].toLowerCase()} post at ${time} on ${platforms.map((p) => PLATFORM_LABEL[p] ?? p).join(", ")}: ${post.caption.slice(0, 80) || "no caption"}${movable ? ". Open in composer" : ""}`;
  const className = [styles.wcard, styles[`wcard_${post.status}`] ?? ""].filter(Boolean).join(" ");

  const body: ReactNode = (
    <>
      <span className={styles.wcMain}>
        <span className={styles.wcTop}>
          <NetIcon width={13} height={13} className={styles[`ico_${platforms[0]}`]} aria-hidden="true" />
          {platforms.length > 1 && <span className={styles.wcMore} aria-hidden="true">+{platforms.length - 1}</span>}
          <span className={styles.wcTime} suppressHydrationWarning>{time}</span>
          {post.status === "failed" && <span className={styles.wcFailDot} aria-hidden="true" />}
          {KindIcon && <KindIcon width={12} height={12} className={styles.wcKind} aria-hidden="true" />}
        </span>
        <span className={styles.wcCaption}>{post.caption.trim() || "(no caption)"}</span>
      </span>
      {hasMedia && (
        <span className={styles.wcThumb} aria-hidden="true">
          {post.thumbIsVideo && !post.thumb ? (
            <span className={styles.wcThumbVideo}><Play width={14} height={14} /></span>
          ) : (
            <>
              <TopThumb src={post.thumb} className={styles.wcThumbImg} />
              {post.thumbIsVideo && <Play className={styles.playIcon} width={12} height={12} />}
            </>
          )}
        </span>
      )}
    </>
  );

  if (movable) {
    return (
      <Link
        href={editHref}
        scroll={false}
        aria-label={label}
        draggable
        onDragStart={(e: DragEvent<HTMLAnchorElement>) => {
          e.dataTransfer.setData("text/plain", post.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        className={`${className} ${styles.chipMovable}`}
      >
        {body}
      </Link>
    );
  }
  return (
    <button type="button" aria-haspopup="dialog" aria-label={label} onClick={(e) => onOpen(post, e.currentTarget)} className={className}>
      {body}
    </button>
  );
}
