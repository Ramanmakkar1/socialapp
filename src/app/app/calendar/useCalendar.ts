"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import type { DragEvent } from "react";
import { useRouter } from "next/navigation";
import { reschedulePost } from "./rescheduleActions";
import { utcDateForLocalDay, type CalendarPost } from "./calendarUtils";

// Shared state for the week and month calendars: browser time zone, drag-and-drop
// rescheduling (through the guarded reschedulePost action) and the open post popover.
export function useCalendar(posts: CalendarPost[]) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [tz, setTz] = useState("");
  const [open, setOpen] = useState<{ post: CalendarPost; anchor: HTMLElement } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Read the browser time zone after hydration (server renders UTC).
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const openPost = useCallback((post: CalendarPost, anchor: HTMLElement) => {
    setOpen((cur) => (cur?.post.id === post.id ? null : { post, anchor }));
  }, []);
  const closePost = useCallback(() => setOpen(null), []);

  function dropProps(key: string, current: CalendarPost[]) {
    return {
      onDragOver: (e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        if (dragOverKey !== key) setDragOverKey(key);
      },
      onDragLeave: () => {
        if (dragOverKey === key) setDragOverKey(null);
      },
      onDrop: (e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        setDragOverKey(null);
        const id = e.dataTransfer.getData("text/plain");
        if (!id || isPending) return;
        if (current.some((p) => p.id === id)) return;
        const post = posts.find((p) => p.id === id);
        if (!post?.scheduled_at) return;
        const utcDay = utcDateForLocalDay(post.scheduled_at, key, tz);
        setError(null);
        setOpen(null);
        startTransition(async () => {
          try {
            const res = await reschedulePost(id, utcDay);
            if (!res.ok) {
              setError(res.error ?? "Could not move post.");
              return;
            }
            router.refresh();
          } catch {
            setError("Could not move post. Please try again.");
          }
        });
      },
    };
  }

  return { tz, error, isPending, dragOverKey, dropProps, open, openPost, closePost };
}
