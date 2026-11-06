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

type MonthViewPost = {
  id: string;
  caption: string;
  scheduled_at: Date | string | null;
  status: string;
  platforms: string[];
};

type MonthViewProps = {
  posts: MonthViewPost[];
  monthStart: Date;
  prevHref: string;
  nextHref: string;
  loadError?: LoadError;
};

const MAX_CHIPS = 3;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function utcDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
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
  return caption.trim().slice(0, 30);
}

function chipColor(status: string): string {
  switch (status) {
    case "failed":
      return styles.chipFailed;
    case "published":
      return styles.chipPublished;
    case "draft":
      return styles.chipDraft;
    default:
      return "";
  }
}

function isMovable(status: string): boolean {
  return status === "scheduled" || status === "draft";
}

export default function MonthView({ posts, monthStart, prevHref, nextHref, loadError }: MonthViewProps) {
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
  const month = monthStart.getUTCMonth();
  const byDay = new Map<string, MonthViewPost[]>();

  for (const post of posts) {
    if (!post.scheduled_at) continue;
    const key = utcDateKey(new Date(post.scheduled_at));
    const list = byDay.get(key);
    if (list) list.push(post);
    else byDay.set(key, [post]);
  }

  // Grid starts on the Monday on/before the 1st and ends on the Sunday on/after the last day.
  const gridStart = new Date(monthStart);
  const startDow = gridStart.getUTCDay();
  gridStart.setUTCDate(gridStart.getUTCDate() - (startDow === 0 ? 6 : startDow - 1));

  const monthEnd = new Date(Date.UTC(monthStart.getUTCFullYear(), month + 1, 0));
  const gridEnd = new Date(monthEnd);
  const endDow = gridEnd.getUTCDay();
  gridEnd.setUTCDate(gridEnd.getUTCDate() + (endDow === 0 ? 0 : 7 - endDow));

  const days: Date[] = [];
  for (let d = new Date(gridStart); d <= gridEnd; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(new Date(d));
  }

  const monthLabel = monthStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  function handleDrop(e: DragEvent<HTMLDivElement>, key: string, current: MonthViewPost[]) {
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
          <p className={styles.rangeLabel}>{monthLabel}</p>
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
      <div>
        <div className={styles.dayGrid}>
          {WEEKDAYS.map((name) => (
            <p key={name} className={styles.weekdayHead}>
              {name}
            </p>
          ))}
          {days.map((day, index) => {
            const key = utcDateKey(day);
            const dayPosts = byDay.get(key) ?? [];
            const inMonth = day.getUTCMonth() === month;
            const isToday = key === todayKey;
            const extra = dayPosts.length - MAX_CHIPS;

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
                className={[styles.day, styles.dayCompact, TINTS[index % 3], isToday ? styles.dayToday : "", inMonth ? "" : styles.dayOut, dragOverKey === key ? styles.dayOver : ""].filter(Boolean).join(" ")}
              >
                <p className={`${styles.dayLabel} ${inMonth ? styles.dayLabelIn : ""}`}>
                  <span className={styles.phoneOnly}>{day.toLocaleDateString("en-US", { weekday: "short", month: "short", timeZone: "UTC" })} </span>{day.getUTCDate()}
                </p>
                <div className={styles.dayPosts}>
                  {dayPosts.slice(0, MAX_CHIPS).map((post) => (
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
                        className={[styles.chip, chipColor(post.status), isMovable(post.status) ? styles.chipMovable : ""].filter(Boolean).join(" ")}
                        title={tz ? `${formatLocal(post.scheduled_at!)} your time — ${post.caption}` : post.caption}
                      >
                        {formatTimeUtc(post.scheduled_at!)} UTC · {captionPreview(post.caption)}
                      </span>
                      {isMovable(post.status) && (
                        <RescheduleControl id={post.id} scheduledAt={post.scheduled_at!} caption={post.caption} />
                      )}
                    </div>
                  ))}
                  {extra > 0 ? <p className={styles.more}>+{extra} more</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
