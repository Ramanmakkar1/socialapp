"use client";

import { useState, useTransition } from "react";
import { deletePost } from "./actions";
import LoadFailed, { type LoadError } from "./LoadFailed";
import { duplicatePost } from "./duplicateActions";
import { retryPost } from "./retryActions";

export type Post = {
  id: string;
  caption: string;
  first_comment: string | null;
  scheduled_at: Date | string | null;
  status: string;
  platforms: string[];
  error?: string | null;
};

export type PostFilter = "all" | "scheduled" | "draft" | "failed";

const filters: { value: PostFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "draft", label: "Draft" },
  { value: "failed", label: "Failed" },
];

export default function PostList({ posts, loadError, initialFilter = "all" }: { posts: Post[]; loadError?: LoadError; initialFilter?: PostFilter }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PostFilter>(initialFilter);
  const [search, setSearch] = useState("");
  const visiblePosts = posts.filter((post) =>
    (filter === "all" || post.status === filter) &&
    post.caption.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );

  function selectFilter(value: PostFilter) {
    setFilter(value);
    const url = new URL(window.location.href);
    if (value === "all") url.searchParams.delete("status");
    else url.searchParams.set("status", value);
    window.history.replaceState(window.history.state, "", url);
  }

  function clearFilters() {
    selectFilter("all");
    setSearch("");
  }

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
      <h2 id="upcoming-posts-heading" className="text-lg font-semibold">Publishing queue</h2>
      {error && <p role="alert" className="mt-3 text-sm text-brand-2">{error}</p>}
      {loadError ? (
        <LoadFailed message={loadError.message} reloadHref={loadError.reloadHref} className="mt-3" />
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">Counts and search apply to the loaded posts (up to 50).</p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter queue by status">
            {filters.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => selectFilter(value)}
                className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${filter === value ? "border-brand bg-brand text-white" : "border-line bg-surface text-ink hover:bg-surface-2"}`}
              >
                {label} <span className="ml-1">{value === "all" ? posts.length : posts.filter((post) => post.status === value).length}</span>
              </button>
            ))}
          </div>
          <div className="mt-4">
            <label htmlFor="queue-search" className="text-sm font-medium text-ink">Search captions</label>
            <input
              id="queue-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search loaded posts"
              className="mt-1 block min-h-11 w-full max-w-md rounded-xl border border-line bg-surface px-4 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            />
          </div>
          <p className="mt-4 text-sm text-muted" role="status">{visiblePosts.length} {visiblePosts.length === 1 ? "post" : "posts"} shown; scheduled times first, unscheduled posts last</p>
          {visiblePosts.length === 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-5">
              <svg aria-hidden="true" viewBox="0 0 96 80" className="h-20 w-24 shrink-0">
                <rect x="15" y="13" width="60" height="54" rx="12" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="2" />
                <path d="M15 30h60M30 8v10M60 8v10" fill="none" stroke="var(--brand)" strokeWidth="3" strokeLinecap="round" />
                <circle cx="48" cy="47" r="9" fill="none" stroke="var(--brand)" strokeWidth="3" />
                <path d="m55 54 8 8M80 14v8M76 18h8" stroke="var(--brand-2)" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <div>
                <p className="font-medium text-ink">{posts.length === 0 ? "Your queue is empty" : "No posts match your filters"}</p>
                <p className="mt-1 text-sm text-muted">{posts.length === 0 ? "Write your first post above to get started." : "Try another status or caption search."}</p>
                <button type="button" onClick={clearFilters} className="mt-2 min-h-11 rounded-full border border-line px-4 text-sm font-medium text-ink hover:bg-surface-2">Clear filters</button>
              </div>
            </div>
          ) : (
        <div className="mt-3 space-y-3">
          {visiblePosts.map((post) => (
            <article key={post.id} className="min-w-0 rounded-2xl border border-line bg-surface p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className={`rounded-full border bg-surface-2 px-3 py-1 text-xs font-medium ${post.status === "failed" ? "border-brand-2 text-brand-2" : "border-line text-ink-2"}`}>
                  {post.status.replace(/[_-]+/g, " ").replace(/^./, (letter) => letter.toUpperCase())}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {post.status === "failed" && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleRetry(post.id)}
                      className="min-h-11 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-60"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleDuplicate(post.id)}
                    className="min-h-11 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-60"
                  >
                    Duplicate
                  </button>
                  {["draft", "scheduled", "failed"].includes(post.status) && (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(post.id)}
                      className="min-h-11 rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 text-sm text-muted" suppressHydrationWarning>
                {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : "No time set"}
              </p>
              <p className="mt-2 text-sm capitalize text-ink-2">{post.platforms.join(", ")}</p>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm text-ink-2">{post.caption.slice(0, 140)}</p>
              {post.first_comment && (
                <span className="mt-3 inline-block rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-medium text-ink-2">First comment</span>
              )}
              {post.status === "failed" && (
                <p className="mt-3 rounded-xl border border-line bg-surface-2 p-3 text-xs text-brand-2" role="status">
                  Couldn’t publish: {(post.error ?? "Unknown error").slice(0, 200)}
                </p>
              )}
            </article>
          ))}
        </div>
          )}
        </>
      )}
    </section>
  );
}
