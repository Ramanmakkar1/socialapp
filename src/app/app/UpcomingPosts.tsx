"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { UpcomingPost } from "@/lib/stats";

function formatBadge(igFormat: string | null, mediaCount: number): string {
  if (igFormat === "story") return "Story";
  if (mediaCount >= 2) return "Carousel";
  if (igFormat === "reel") return "Reel";
  return "Feed";
}

// Flat rows inside the parent card: fixed time column, caption, badges (no nested grey boxes).
const row =
  "grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-4 py-3 transition hover:bg-[var(--poskoo-paper)] sm:grid-cols-[11rem_minmax(0,1fr)_auto]";
const timePill =
  "col-span-2 text-xs font-semibold tabular-nums text-[var(--poskoo-muted)] sm:col-span-1 sm:text-sm sm:text-[var(--poskoo-ink)]";
const badge =
  "rounded-[var(--poskoo-radius-pill)] border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-2.5 py-0.5 text-xs font-semibold text-[var(--poskoo-ink)]";

export default function UpcomingPosts({ posts }: { posts: UpcomingPost[] }) {
  const [timeZone, setTimeZone] = useState("");
  const [whenById, setWhenById] = useState<Record<string, string>>({});

  useEffect(() => {
    // Client-only: avoids SSR UTC vs browser timezone hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- boss-mandated pattern for local times
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    const fmt = new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const next: Record<string, string> = {};
    for (const post of posts) {
      next[post.id] = fmt.format(new Date(post.scheduledAt));
    }
    setWhenById(next);
  }, [posts]);

  return (
    <div>
      <ul className="m-0 list-none divide-y divide-[var(--poskoo-line)] p-0">
        {posts.map((post) => (
          <li key={post.id}>
            <Link href="/app/calendar" className={row}>
              <span className={timePill}>{whenById[post.id] ?? "…"}</span>
              <p className="m-0 min-w-0 truncate text-sm text-[var(--poskoo-ink)]">
                {post.caption.trim() || "Untitled post"}
              </p>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <span className={badge}>{formatBadge(post.igFormat, post.mediaCount)}</span>
                {post.hasRule && (
                  <span
                    className={badge}
                    style={{ background: "var(--poskoo-lime)", borderColor: "var(--poskoo-ink)" }}
                  >
                    Auto-DM on
                  </span>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {timeZone ? (
        <p className="m-0 border-t border-[var(--poskoo-line)] px-4 py-2 text-xs text-[var(--poskoo-muted)]">Times shown in {timeZone}</p>
      ) : null}
    </div>
  );
}
