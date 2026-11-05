"use client";

import { useEffect, useState, useTransition } from "react";
import type { DragEvent } from "react";
import { useRouter } from "next/navigation";
import { reschedulePost } from "./rescheduleActions";
import RescheduleControl from "./RescheduleControl";
import LoadFailed, { type LoadError } from "./LoadFailed";

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

  const navClass =
    "rounded-full border border-line px-3 py-1.5 text-sm hover:bg-surface-2";

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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">{formatWeekRange(weekStart)}</p>
          <p className="text-xs text-muted">
            Days and times shown in UTC{tz ? ` (your time zone: ${tz})` : ""}.
            <span className="hidden sm:inline"> Drag a post to another day to move it.</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={prevHref} className={navClass}>
            ← Previous
          </a>
          <a href={nextHref} className={navClass}>
            Next →
          </a>
        </div>
      </div>
      {error && (
        <p role="alert" className="mb-3 text-sm text-brand-2">
          {error}
        </p>
      )}
      {loadError && <LoadFailed {...loadError} className="mb-3" />}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
        {days.map((day) => {
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
              className={`min-h-28 min-w-0 rounded-2xl border p-3 ${isToday ? "border-brand" : "border-line"} ${
                dragOverKey === key ? "bg-surface-2 ring-1 ring-line" : "bg-surface"
              }`}
            >
              <p className="text-xs text-muted">
                {weekday} · {dateLabel}
              </p>
              <div className="mt-2 space-y-1">
                {dayPosts.length === 0 ? (
                  loadError ? null : <p className="text-xs text-muted">—</p>
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
                        className={`block truncate rounded-lg bg-surface-2 px-2 py-1 text-xs ${
                          post.status === "failed" ? "text-brand-2" : "text-ink-2"
                        } ${isMovable(post.status) ? "sm:cursor-grab" : ""}`}
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
