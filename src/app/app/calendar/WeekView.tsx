"use client";

import { useEffect, useState, useTransition } from "react";
import type { DragEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, ChevronLeft, ChevronRight, Facebook, Instagram, Plus, Youtube } from "lucide-react";
import { reschedulePost } from "./rescheduleActions";
import RescheduleControl from "./RescheduleControl";
import LoadFailed, { type LoadError } from "./LoadFailed";
import styles from "./calendar.module.css";

const PLATFORM_ICON: Record<string, typeof Instagram> = { instagram: Instagram, facebook: Facebook, threads: AtSign, youtube: Youtube };

type WeekViewPost = {
  id: string;
  caption: string;
  scheduled_at: Date | string | null;
  status: string;
  platforms: string[];
};

type WeekViewProps = {
  posts: WeekViewPost[];
  weekStart: Date;
  prevHref: string;
  nextHref: string;
  /** "/app/calendar?view=week&week=...&compose=1"; "&day=YYYY-MM-DD" is added per day. */
  composeBase?: string;
  todayHref?: string;
  loadError?: LoadError;
};

function utcDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt(weekStart)} – ${fmt(weekEnd)}`;
}

function formatTimeUtc(at: Date | string): string {
  const d = typeof at === "string" ? new Date(at) : at;
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatLocal(at: Date | string): string {
  const d = typeof at === "string" ? new Date(at) : at;
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatLocalTime(at: Date | string): string {
  return new Date(at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function captionPreview(caption: string): string {
  const t = caption.trim();
  return t.length > 90 ? `${t.slice(0, 90)}…` : t || "(no caption)";
}

const STATUS_LABEL: Record<string, string> = { draft: "Draft", failed: "Failed", published: "Published", publishing: "Publishing" };

function isMovable(status: string): boolean {
  return status === "scheduled" || status === "draft";
}

export default function WeekView({ posts, weekStart, prevHref, nextHref, composeBase, todayHref = "/app/calendar?view=week", loadError }: WeekViewProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [tz, setTz] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Read the browser time zone after hydration, matching Composer.
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);
  const todayKey = utcDateKey(new Date());
  const byDay = new Map<string, WeekViewPost[]>();

  for (const post of posts) {
    if (!post.scheduled_at) continue;
    const key = utcDateKey(new Date(post.scheduled_at));
    const list = byDay.get(key);
    if (list) list.push(post);
    else byDay.set(key, [post]);
  }

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setUTCDate(d.getUTCDate() + i);
    days.push(d);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>, key: string, current: WeekViewPost[]) {
    e.preventDefault();
    setDragOverKey(null);
    const id = e.dataTransfer.getData("text/plain");
    if (!id || isPending) return;
    if (current.some((p) => p.id === id)) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await reschedulePost(id, key);
        if (!res.ok) {
          setError(res.error ?? "Could not move post.");
          return;
        }
        router.refresh();
      } catch {
        setError("Could not move post. Please try again.");
      }
    });
  }

  return (
    <div>
      <div className={styles.toolbar}>
        <div className={styles.toolbarNav}>
          <Link href={todayHref} className={styles.todayBtn}>Today</Link>
          <Link href={prevHref} className={styles.arrowBtn} aria-label="Previous week"><ChevronLeft width={18} height={18} aria-hidden="true" /></Link>
          <Link href={nextHref} className={styles.arrowBtn} aria-label="Next week"><ChevronRight width={18} height={18} aria-hidden="true" /></Link>
          <p className={styles.rangeLabel}>{formatWeekRange(weekStart)}</p>
        </div>
        <p className={styles.rangeHint}>
          {tz ? <span className={styles.tzChip}>{tz}</span> : null}
          <span className={styles.wideOnly}>Days in UTC · drag a post to another day to move it</span>
        </p>
      </div>
      {error && (
        <p role="alert" className={styles.errorText}>
          {error}
        </p>
      )}
      {loadError && <LoadFailed {...loadError} className={styles.mb} />}
      <div className={styles.weekGrid}>
        {days.map((day) => {
          const key = utcDateKey(day);
          const dayPosts = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          const weekday = day.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
          const dateNum = day.getUTCDate();
          const isPast = key < todayKey;
          return (
            <div
              key={key}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverKey !== key) setDragOverKey(key);
              }}
              onDragLeave={() => {
                if (dragOverKey === key) setDragOverKey(null);
              }}
              onDrop={(e) => handleDrop(e, key, dayPosts)}
              className={[styles.weekCol, isToday ? styles.weekColToday : "", isPast ? styles.weekColPast : "", dragOverKey === key ? styles.weekColOver : ""].filter(Boolean).join(" ")}
            >
              <div className={styles.weekHead}>
                <span className={styles.weekDay}>{weekday}</span>
                <span className={`${styles.weekNum} ${isToday ? styles.weekNumToday : ""}`}>{dateNum}</span>
                {dayPosts.length > 0 && <span className={styles.weekCount}>{dayPosts.length}</span>}
              </div>
              <div className={styles.weekPosts}>
                {dayPosts.map((post) => {
                  const movable = isMovable(post.status);
                  return (
                    <div key={`${post.id}-${key}`} className="min-w-0">
                      <div
                        draggable={movable}
                        onDragStart={
                          movable
                            ? (e) => {
                                e.dataTransfer.setData("text/plain", post.id);
                                e.dataTransfer.effectAllowed = "move";
                              }
                            : undefined
                        }
                        className={[styles.postTile, post.status === "failed" ? styles.postTileFailed : "", post.status === "draft" ? styles.postTileDraft : "", post.status === "published" ? styles.postTilePublished : "", movable ? styles.chipMovable : ""].filter(Boolean).join(" ")}
                        title={tz ? `${formatLocal(post.scheduled_at!)} your time — ${post.caption}` : post.caption}
                      >
                        <div className={styles.postTileTop}>
                          <span className={styles.postTileIcons}>
                            {(post.platforms.length ? post.platforms : ["instagram"]).map((p) => {
                              const Icon = PLATFORM_ICON[p] ?? AtSign;
                              return <Icon key={p} width={13} height={13} aria-label={p} className={styles[`ico_${p}`]} />;
                            })}
                          </span>
                          <span className={styles.postTileTime} suppressHydrationWarning>
                            {tz ? formatLocalTime(post.scheduled_at!) : `${formatTimeUtc(post.scheduled_at!)} UTC`}
                          </span>
                        </div>
                        <p className={styles.postTileCaption}>{captionPreview(post.caption)}</p>
                        {STATUS_LABEL[post.status] && <span className={styles.postTileStatus}>{STATUS_LABEL[post.status]}</span>}
                      </div>
                      {movable && <RescheduleControl id={post.id} scheduledAt={post.scheduled_at!} caption={post.caption} />}
                    </div>
                  );
                })}
                {composeBase && !isPast && (
                  <Link href={`${composeBase}&day=${key}`} scroll={false} className={`${styles.addSlot} ${dayPosts.length ? "" : styles.addSlotEmpty}`} aria-label={`New post on ${weekday} ${dateNum}`}>
                    <Plus width={16} height={16} aria-hidden="true" />
                    <span>{dayPosts.length ? "Add" : "New post"}</span>
                  </Link>
                )}
                {!composeBase && dayPosts.length === 0 && !loadError && <p className={styles.dash} aria-label="No posts">—</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
