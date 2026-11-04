"use client";

import { useState, useTransition } from "react";
import { deletePost } from "./actions";

export type Post = {
  id: string;
  caption: string;
  scheduled_at: Date | string | null;
  status: string;
  platforms: string[];
};

export default function PostList({ posts }: { posts: Post[] }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete(id: string) {
    if (!window.confirm("Delete this post?")) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await deletePost(id);
        if (!result.ok) setError(result.error ?? "Could not delete post.");
      } catch {
        setError("Could not delete post.");
      }
    });
  }

  return (
    <section className="mt-8" aria-labelledby="upcoming-posts-heading">
      <h2 id="upcoming-posts-heading" className="text-lg font-semibold">Upcoming &amp; drafts</h2>
      {error && <p role="alert" className="mt-3 text-sm text-brand-2">{error}</p>}
      {posts.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Nothing scheduled yet. Write your first post above.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.id} className="min-w-0 rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-ink-2">
                  {post.status === "draft" ? "Draft" : post.status === "failed" ? "Failed" : "Scheduled"}
                </span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleDelete(post.id)}
                  className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
              <p className="mt-3 text-sm text-muted" suppressHydrationWarning>
                {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : "No time set"}
              </p>
              <p className="mt-2 text-sm capitalize text-ink-2">{post.platforms.join(", ")}</p>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm text-ink-2">{post.caption.slice(0, 140)}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
