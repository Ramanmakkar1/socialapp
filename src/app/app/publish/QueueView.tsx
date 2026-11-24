"use client";

import { useMemo, useState, useTransition } from "react";
import { GripVertical } from "lucide-react";
import { reorderQueue, shareNow } from "./actions";
import { type Post } from "./PostList";
import EmptyState from "../EmptyState";
import { Btn, BtnLink } from "@/components/ui/kit";
import PostCard from "./PostCard";
import { PLATFORM_LABEL, type CalendarPost } from "./calendarUtils";
import styles from "./calendar.module.css";

type ChannelFilter = "all" | string;

// The publishing queue in publish order, per channel: drag to reorder, "Share now" publishes at once.
export default function QueueView({ posts, tz, composeHref, onOpen }: {
  posts: Post[];
  tz: string;
  composeHref: string;
  onOpen: (post: CalendarPost, el: HTMLElement) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<ChannelFilter>("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  // Only channels that actually have queued posts get a tab.
  const channels = useMemo(
    () => [...new Set(posts.filter((p) => p.status === "draft" || p.status === "scheduled").flatMap((p) => p.platforms))].sort(),
    [posts],
  );

  const queuePosts = useMemo(
    () =>
      posts
        .filter((p) => p.status === "draft" || p.status === "scheduled")
        .filter((p) => channel === "all" || p.platforms.includes(channel))
        .sort((a, b) => {
          const at = a.scheduled_at ? new Date(a.scheduled_at).getTime() : Number.POSITIVE_INFINITY;
          const bt = b.scheduled_at ? new Date(b.scheduled_at).getTime() : Number.POSITIVE_INFINITY;
          return at - bt;
        }),
    [posts, channel],
  );

  function handleShare(id: string) {
    setError(null);
    setSharingId(id);
    startTransition(async () => {
      try {
        const result = await shareNow(id);
        if (!result.ok) setError(result.error ?? "Could not share this post now.");
      } catch {
        setError("Could not share this post now.");
      }
    });
  }

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      setOverId(null);
      return;
    }
    const ids = queuePosts.map((p) => p.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from === -1 || to === -1) {
      setDragId(null);
      setOverId(null);
      return;
    }
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    setDragId(null);
    setOverId(null);
    setError(null);
    startTransition(async () => {
      try {
        const result = await reorderQueue(ids);
        if (!result.ok) setError(result.error ?? "Could not reorder the queue.");
      } catch {
        setError("Could not reorder the queue.");
      }
    });
  }

  const channelTabs: { value: ChannelFilter; label: string }[] = [
    { value: "all", label: "All channels" },
    ...channels.map((c) => ({ value: c, label: PLATFORM_LABEL[c] ?? c })),
  ];

  return (
    <div>
      <p className={`${styles.queueHint} ${styles.mt}`}>
        Drag posts to change the publish order. “Share now” publishes a post immediately.
      </p>
      {error && (
        <p role="alert" className={`${styles.errorText} ${styles.mt}`}>
          {error}
        </p>
      )}
      {channels.length > 1 && (
        <div className={styles.filters} role="group" aria-label="Filter queue by channel">
          {channelTabs.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              aria-pressed={channel === value}
              onClick={() => setChannel(value)}
              className={`${styles.filterBtn} ${channel === value ? styles.filterBtnActive : ""}`}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      {queuePosts.length === 0 ? (
        <EmptyState
          title="Nothing in the queue yet"
          text="Use “Add to queue” in the composer to line up your next posts."
          art="/illustrations/empty-calendar.webp"
          artWidth={1536}
          artHeight={1024}
        >
          <BtnLink href={composeHref} scroll={false} size="sm">
            Write a post
          </BtnLink>
        </EmptyState>
      ) : !tz ? null : (
        <ol className={styles.queueList}>
          {queuePosts.map((post) => {
            const isOver = overId === post.id && dragId !== null && dragId !== post.id;
            return (
              <li
                key={post.id}
                draggable
                onDragStart={() => setDragId(post.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragId && post.id !== dragId) setOverId(post.id);
                }}
                onDragLeave={() => setOverId((cur) => (cur === post.id ? null : cur))}
                onDrop={() => handleDrop(post.id)}
                onDragEnd={() => {
                  setDragId(null);
                  setOverId(null);
                }}
                className={`${styles.queueRow} ${isOver ? styles.queueRowOver : ""}`}
              >
                <GripVertical className={styles.queueGrip} width={16} height={16} aria-hidden />
                <PostCard post={post} tz={tz} row onOpen={onOpen} />
                <div className={styles.queueActions}>
                  {post.status === "scheduled" && (
                    <Btn variant="ghost" size="sm" disabled={isPending} onClick={() => handleShare(post.id)}>
                      {isPending && sharingId === post.id ? "Sharing…" : "Share now"}
                    </Btn>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
