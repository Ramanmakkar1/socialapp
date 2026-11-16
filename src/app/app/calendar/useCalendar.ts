"use client";

import { useCallback, useEffect, useOptimistic, useState, useTransition } from "react";
import type { DragEvent } from "react";
import { useSearchParams } from "next/navigation";
import { reschedulePost, reschedulePostAt } from "./rescheduleActions";
import { movedToLocalDay, withMovedPost, type CalendarPost } from "./calendarUtils";
import { movedToSlot, slotId } from "./weekGrid";
import { isValidTimeZone } from "@/lib/postingSchedule";

// Shared state for the week and month calendars: browser time zone, drag-and-drop
// rescheduling (through the guarded reschedulePost action) and the open post popover.
// A dropped post moves at once (optimistic); the action's revalidatePath brings the saved state, and a
// failed move snaps back when the transition ends.
export function useCalendar(serverPosts: CalendarPost[]) {
  const [isPending, startTransition] = useTransition();
  const [posts, movePost] = useOptimistic(serverPosts, (cur, move: { id: string; at: string }) => withMovedPost(cur, move.id, move.at));
  const [error, setError] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [browserTz, setTz] = useState("");
  // ?tz= (toolbar time zone picker) overrides the browser zone once that is known.
  const tzParam = useSearchParams()?.get("tz") ?? "";
  const tz = browserTz && tzParam && isValidTimeZone(tzParam) ? tzParam : browserTz;
  const [open, setOpen] = useState<{ post: CalendarPost; anchor: HTMLElement } | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Read the browser time zone after hydration (server renders UTC).
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const openPost = useCallback((post: CalendarPost, anchor: HTMLElement) => {
    setOpen((cur) => (cur?.post.id === post.id ? null : { post, anchor }));
  }, []);
  const closePost = useCallback(() => setOpen(null), []);

  // Month grid: drop on a day (keeps the time). Week grid: pass `hour` to drop on a day + hour slot (keeps the minutes).
  function dropProps(key: string, current: CalendarPost[], hour?: number) {
    const overKey = hour === undefined ? key : slotId(key, hour);
    return {
      onDragOver: (e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        if (dragOverKey !== overKey) setDragOverKey(overKey);
      },
      onDragLeave: () => {
        if (dragOverKey === overKey) setDragOverKey(null);
      },
      onDrop: (e: DragEvent<HTMLElement>) => {
        e.preventDefault();
        setDragOverKey(null);
        const id = e.dataTransfer.getData("text/plain");
        if (!id || isPending) return;
        if (current.some((p) => p.id === id)) return;
        const post = posts.find((p) => p.id === id);
        if (!post?.scheduled_at) return;
        const at = hour === undefined ? movedToLocalDay(post.scheduled_at, key, tz) : movedToSlot(post.scheduled_at, key, hour, tz);
        setError(null);
        setOpen(null);
        startTransition(async () => {
          movePost({ id, at });
          try {
            const res = hour === undefined ? await reschedulePost(id, at.slice(0, 10)) : await reschedulePostAt(id, at);
            if (!res.ok) setError(res.error ?? "Could not move post.");
          } catch {
            setError("Could not move post. Please try again.");
          }
        });
      },
    };
  }

  return { posts, tz, error, isPending, dragOverKey, dropProps, open, openPost, closePost };
}
