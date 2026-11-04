"use client";

import { useEffect, useState, useTransition } from "react";
import type { DragEvent } from "react";
import { useRouter } from "next/navigation";
import { reschedulePost } from "./rescheduleActions";
import LoadFailed, { type LoadError } from "./LoadFailed";

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
      return "text-brand-2";
    case "published":
      return "text-ok";
    case "draft":
      return "text-muted";
    default:
      return "text-ink-2";
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

  const navClass =
    "rounded-full border border-line px-3 py-1.5 text-sm hover:bg-surface-2";

  function handleDrop(e: DragEvent<HTMLDivElement>, key: string, current: MonthViewPost[]) {
    e.preventDefault();
    setDragOverKey(null);
    const id = e.dataTransfer.getData("text/plain");
    if (!id || isPending) return;
    if (current.some((p) => p.id === id)) return;
    setError(null);
    startTransition(async () => {
      const res = await reschedulePost(id, key);
      if (!res.ok) {
        setError(res.error ?? "Could not move post.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-ink">{monthLabel}</p>
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
      <div className="overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-7 gap-2">
          {WEEKDAYS.map((name) => (
            <p key={name} className="px-1 text-xs font-medium text-muted">
              {name}
            </p>
          ))}
          {days.map((day) => {
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
                className={`min-h-24 rounded-2xl border p-2 ${isToday ? "border-brand" : "border-line"} ${inMonth ? "" : "opacity-60"} ${
                  dragOverKey === key ? "bg-surface-2 ring-1 ring-line" : "bg-surface"
                }`}
              >
                <p className={`text-xs ${inMonth ? "text-ink" : "text-muted"}`}>
                  {day.getUTCDate()}
                </p>
                <div className="mt-1 space-y-1">
                  {dayPosts.slice(0, MAX_CHIPS).map((post) => (
                    <span
                      key={post.id}
                      draggable={isMovable(post.status)}
                      onDragStart={
                        isMovable(post.status)
                          ? (e) => {
                              e.dataTransfer.setData("text/plain", post.id);
                              e.dataTransfer.effectAllowed = "move";
                            }
                          : undefined
                      }
                      className={`block truncate rounded-lg bg-surface-2 px-2 py-1 text-xs ${chipColor(post.status)} ${
                        isMovable(post.status) ? "sm:cursor-grab" : ""
                      }`}
                      title={tz ? `${formatLocal(post.scheduled_at!)} your time — ${post.caption}` : post.caption}
                    >
                      {formatTimeUtc(post.scheduled_at!)} UTC · {captionPreview(post.caption)}
                    </span>
                  ))}
                  {extra > 0 ? <p className="px-1 text-xs text-muted">+{extra} more</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
