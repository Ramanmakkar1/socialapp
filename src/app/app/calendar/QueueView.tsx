"use client";

import { useMemo, useState, useTransition } from "react";
import { GripVertical } from "lucide-react";
import { reorderQueue, shareNow } from "./actions";
import { PLATFORMS, type PlatformId } from "@/lib/platforms";
import { type Post } from "./PostList";
import EmptyState from "../EmptyState";
import { Btn, BtnA } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import styles from "./calendar.module.css";

const CHANNELS: PlatformId[] = ["instagram", "facebook", "threads"];

type ChannelFilter = "all" | PlatformId;

// The publishing queue, viewable per channel: drag to reorder the publish order,
// "Share now" publishes a post immediately.
export default function QueueView({ posts }: { posts: Post[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<ChannelFilter>("all");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

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
    ...CHANNELS.map((c) => ({ value: c as ChannelFilter, label: PLATFORMS[c].label })),
  ];

  return (
    <section className={styles.queue} aria-labelledby="queue-view-heading">
      <h2 id="queue-view-heading" className={styles.sectionTitle}>Queue</h2>
      <p className={styles.queueHint}>
        Drag posts to change the publish order. “Share now” publishes a post immediately.
      </p>
      {error && (
        <p role="alert" className={`${styles.errorText} ${styles.mt}`}>
          {error}
        </p>
      )}
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
      {queuePosts.length === 0 ? (
        <EmptyState
          title="Nothing in the queue yet"
          text="Use “Add to queue” in the composer to line up your next posts."
          art="/illustrations/empty-calendar.webp"
          artWidth={1536}
          artHeight={1024}
        >
          <BtnA href="#new" size="sm">
            Write a post
          </BtnA>
        </EmptyState>
      ) : (
        <div className={styles.postList}>
          {queuePosts.map((post) => {
            const isOver = overId === post.id && dragId !== null && dragId !== post.id;
            return (
              <article
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
                className={`${styles.postCard} ${isOver ? "ring-2 ring-[var(--poskoo-violet)]" : ""}`}
                style={{ cursor: "grab" }}
              >
                <div className={styles.postTop}>
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-[var(--poskoo-muted)]" aria-hidden />
                    <span className={`${ui.pill} ${post.status === "draft" ? styles.chipDraft : ""}`}>
                      {post.status === "draft" ? "Draft" : "Scheduled"}
                    </span>
                  </div>
                  <div className={styles.postActions}>
                    <Btn variant="ghost" size="sm" disabled={isPending} onClick={() => handleShare(post.id)}>
                      Share now
                    </Btn>
                  </div>
                </div>
                <p className={styles.postMeta} suppressHydrationWarning>
                  {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : "No time set"}
                </p>
                <p className={styles.postPlatforms}>{post.platforms.join(", ")}</p>
                <p className={styles.postCaption}>{post.caption.slice(0, 140)}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
