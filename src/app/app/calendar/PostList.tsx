"use client";

import { useState, useTransition } from "react";
import { deletePost } from "./actions";
import { duplicatePost } from "./duplicateActions";
import { retryPost } from "./retryActions";

export type Post = {
  id: string;
  caption: string;
  scheduled_at: Date | string | null;
  status: string;
  platforms: string[];
  error?: string | null;
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

  function handleDuplicate(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await duplicatePost(id);
        if (!result.ok) setError(result.error ?? "Could not duplicate post.");
      } catch {
        setError("Could not duplicate post.");
      }
    });
  }

  function handleRetry(id: string) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await retryPost(id);
        if (!result.ok) setError(result.error ?? "Could not retry post.");
      } catch {
        setError("Could not retry post.");
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
                <span className={`rounded-full border bg-surface-2 px-3 py-1 text-xs font-medium ${post.status === "failed" ? "border-brand-2 text-brand-2" : "border-line text-ink-2"}`}>
                  {post.status === "draft" ? "Draft" : post.status === "failed" ? "Failed" : "Scheduled"}
                </span>
                <div className="flex items-center gap-2">
                  {post.status === "failed" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleRetry(post.id)}
                      className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-60"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDuplicate(post.id)}
                    className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-60"
                  >
                    Duplicate
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDelete(post.id)}
                    className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted" suppressHydrationWarning>
                {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : "No time set"}
              </p>
              <p className="mt-2 text-sm capitalize text-ink-2">{post.platforms.join(", ")}</p>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm text-ink-2">{post.caption.slice(0, 140)}</p>
              {post.status === "failed" && (
                <p className="mt-3 rounded-xl border border-line bg-surface-2 p-3 text-xs text-brand-2" role="status">
                  Couldn’t publish: {(post.error ?? "Unknown error").slice(0, 200)}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
