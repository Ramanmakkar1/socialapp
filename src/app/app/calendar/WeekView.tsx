"use client";

import { useEffect, useState, useTransition } from "react";
import type { DragEvent } from "react";
import { useRouter } from "next/navigation";
import { reschedulePost } from "./rescheduleActions";
import RescheduleControl from "./RescheduleControl";
import LoadFailed, { type LoadError } from "./LoadFailed";
import { BtnA } from "@/components/ui/kit";
import styles from "./calendar.module.css";

const TINTS = [styles.dayTint1, styles.dayTint2, styles.dayTint3];

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

function captionPreview(caption: string): string {
  return caption.trim().slice(0, 40);
}

function isMovable(status: string): boolean {
  return status === "scheduled" || status === "draft";
}

export default function WeekView({ posts, weekStart, prevHref, nextHref, loadError }: WeekViewProps) {
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
      <div className={styles.navRow}>
        <div>
          <p className={styles.rangeLabel}>{formatWeekRange(weekStart)}</p>
          <p className={styles.rangeHint}>
            Days and times shown in UTC{tz ? ` (your time zone: ${tz})` : ""}.
            <span className={styles.wideOnly}> Drag a post to another day to move it.</span>
          </p>
        </div>
        <div className={styles.navBtns}>
          <BtnA href={prevHref} variant="ghost" size="sm">
            <span aria-hidden="true">←</span> Previous
          </BtnA>
          <BtnA href={nextHref} variant="ghost" size="sm">
            Next <span aria-hidden="true">→</span>
          </BtnA>
        </div>
      </div>
      {error && (
        <p role="alert" className={styles.errorText}>
          {error}
        </p>
      )}
      {loadError && <LoadFailed {...loadError} className={styles.mb} />}
      <div className={styles.dayGrid}>
        {days.map((day, index) => {
          const key = utcDateKey(day);
          const dayPosts = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          const weekday = day.toLocaleDateString("en-US", {
            weekday: "short",
            timeZone: "UTC",
          });
          const dateLabel = day.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          });

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
              className={[styles.day, TINTS[index % 3], isToday ? styles.dayToday : "", dragOverKey === key ? styles.dayOver : ""].filter(Boolean).join(" ")}
            >
              <p className={styles.dayLabel}>
                {weekday} · {dateLabel}
              </p>
              <div className={styles.dayPosts}>
                {dayPosts.length === 0 ? (
                  loadError ? null : <p className={styles.dash} aria-label="No posts">—</p>
                ) : (
                  dayPosts.map((post) => (
                    <div key={`${post.id}-${utcDateKey(new Date(post.scheduled_at!))}`} className="min-w-0">
                      <span
                        draggable={isMovable(post.status)}
                        onDragStart={
                          isMovable(post.status)
                            ? (e) => {
                                e.dataTransfer.setData("text/plain", post.id);
                                e.dataTransfer.effectAllowed = "move";
                              }
                            : undefined
                        }
                        className={[styles.chip, post.status === "failed" ? styles.chipFailed : "", isMovable(post.status) ? styles.chipMovable : ""].filter(Boolean).join(" ")}
                        title={tz ? `${formatLocal(post.scheduled_at!)} your time — ${post.caption}` : post.caption}
                      >
                        {formatTimeUtc(post.scheduled_at!)} UTC · {captionPreview(post.caption)}
                      </span>
                      {isMovable(post.status) && (
                        <RescheduleControl id={post.id} scheduledAt={post.scheduled_at!} caption={post.caption} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
