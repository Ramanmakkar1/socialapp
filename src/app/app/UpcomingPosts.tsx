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

const row =
  "flex min-h-11 flex-col gap-2 rounded-[var(--poskoo-radius-md)] border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] p-3 transition hover:border-[var(--poskoo-violet)] max-[390px]:flex-col min-[391px]:flex-row min-[391px]:items-center min-[391px]:gap-3";
const timePill =
  "inline-flex w-fit shrink-0 items-center rounded-[var(--poskoo-radius-pill)] border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-1 text-xs font-semibold tabular-nums text-[var(--poskoo-ink)]";
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
    <div className="mt-4">
      <ul className="space-y-3">
        {posts.map((post) => (
          <li key={post.id}>
            <Link href="/app/calendar" className={row}>
              <span className={timePill}>{whenById[post.id] ?? "…"}</span>
              <p className="min-w-0 flex-1 truncate text-sm text-[var(--poskoo-ink)]">
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
        <p className="mt-3 text-xs text-[var(--poskoo-muted)]">Times shown in {timeZone}</p>
      ) : null}
    </div>
  );
}
