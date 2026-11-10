"use client";

import { useState, useTransition } from "react";
import { deletePost } from "./actions";
import LoadFailed, { type LoadError } from "./LoadFailed";
import { duplicatePost } from "./duplicateActions";
import { retryPost } from "./retryActions";
import EmptyState from "../EmptyState";
import { Btn, BtnA, BtnLink } from "@/components/ui/kit";
import { allPostTags, postMatchesTag } from "@/lib/tagFilter";
import ui from "@/components/ui/ui.module.css";
import styles from "./calendar.module.css";

export type Post = {
  id: string;
  caption: string;
  first_comment: string | null;
  scheduled_at: Date | string | null;
  status: string;
  platforms: string[];
  tags?: string[];
  error?: string | null;
};

export type PostFilter = "all" | "scheduled" | "draft" | "failed";

const filters: { value: PostFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "draft", label: "Draft" },
  { value: "failed", label: "Failed" },
];

export default function PostList({ posts, loadError, initialFilter = "all", title = "Publishing queue" }: { posts: Post[]; loadError?: LoadError; initialFilter?: PostFilter; title?: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<PostFilter>(initialFilter);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const allTags = allPostTags(posts);
  const visiblePosts = posts.filter((post) =>
    (filter === "all" || post.status === filter) &&
    postMatchesTag(post, tag) &&
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
    setTag("");
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
    <section className={styles.queue} aria-labelledby="upcoming-posts-heading">
      <h2 id="upcoming-posts-heading" className={styles.sectionTitle}>{title}</h2>
      {error && <p role="alert" className={`${styles.errorText} ${styles.mt}`}>{error}</p>}
      {loadError ? (
        <LoadFailed message={loadError.message} reloadHref={loadError.reloadHref} className={styles.mt} />
      ) : (
        <>
          <p className={styles.queueHint}>Counts and search apply to the loaded posts (up to 50).</p>
          <div className={styles.filters} role="group" aria-label="Filter queue by status">
            {filters.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => selectFilter(value)}
                className={`${styles.filterBtn} ${filter === value ? styles.filterBtnActive : ""}`}
              >
                {label} <span>{value === "all" ? posts.length : posts.filter((post) => post.status === value).length}</span>
              </button>
            ))}
          </div>
          <div className={`${ui.field} ${styles.search}`}>
            <label htmlFor="queue-search" className={ui.label}>Search captions</label>
            <input
              id="queue-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search loaded posts"
              className={ui.input}
            />
          </div>
          {allTags.length > 0 && (
            <div className={`${ui.field} ${styles.search}`}>
              <label htmlFor="queue-tag-filter" className={ui.label}>Filter by tag</label>
              <select id="queue-tag-filter" value={tag} onChange={(event) => setTag(event.target.value)} className={ui.input}>
                <option value="">All tags</option>
                {allTags.map((availableTag) => (
                  <option key={availableTag} value={availableTag}>{availableTag}</option>
                ))}
              </select>
            </div>
          )}
          <p className={styles.count} role="status">{visiblePosts.length} {visiblePosts.length === 1 ? "post" : "posts"} shown; scheduled times first, unscheduled posts last</p>
          {visiblePosts.length === 0 ? (
            posts.length === 0 ? (
              <EmptyState
                title="Your queue is empty"
                text="Write your first post above to get started."
                art="/illustrations/empty-calendar.webp"
                artWidth={1536}
                artHeight={1024}
              >
                <BtnA href="#new" size="sm">Write a post</BtnA>
              </EmptyState>
            ) : (
              <EmptyState
                title="No posts match your filters"
                text="Try another status or caption search."
                art="/illustrations/empty-calendar.webp"
                artWidth={1536}
                artHeight={1024}
              >
                <Btn variant="line" size="sm" onClick={clearFilters}>Clear filters</Btn>
              </EmptyState>
            )
          ) : (
            <div className={styles.postList}>
              {visiblePosts.map((post) => (
                <article key={post.id} className={styles.postCard}>
                  <div className={styles.postTop}>
                    <span className={`${ui.pill} ${post.status === "failed" ? styles.statusFailed : ""}`}>
                      {post.status.replace(/[_-]+/g, " ").replace(/^./, (letter) => letter.toUpperCase())}
                    </span>
                    <div className={styles.postActions}>
                      {(post.status === "draft" || post.status === "scheduled") && (
                        <BtnLink href={`/app/calendar?draft=${post.id}#new`} variant="ghost" size="sm">
                          {post.status === "draft" ? "Edit draft" : "Edit"}
                        </BtnLink>
                      )}
                      {post.status === "failed" && (
                        <Btn variant="ghost" size="sm" disabled={isPending} onClick={() => handleRetry(post.id)}>
                          Retry
                        </Btn>
                      )}
                      <Btn variant="ghost" size="sm" disabled={isPending} onClick={() => handleDuplicate(post.id)}>
                        Duplicate
                      </Btn>
                      {["draft", "scheduled", "failed"].includes(post.status) && (
                        <Btn variant="ghost" size="sm" disabled={isPending} onClick={() => handleDelete(post.id)}>
                          Delete
                        </Btn>
                      )}
                    </div>
                  </div>
                  <p className={styles.postMeta} suppressHydrationWarning>
                    {post.scheduled_at ? new Date(post.scheduled_at).toLocaleString() : "No time set"}
                  </p>
                  <p className={styles.postPlatforms}>{post.platforms.join(", ")}</p>
                  {(post.tags ?? []).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Post tags">
                      {post.tags?.map((postTag) => <span key={postTag} className={ui.pill}>{postTag}</span>)}
                    </div>
                  )}
                  <p className={styles.postCaption}>{post.caption.slice(0, 140)}</p>
                  {post.first_comment && (
                    <span className={`${ui.pill} ${styles.mt}`}>First comment</span>
                  )}
                  {post.status === "failed" && (
                    <p className={styles.postError} role="status">
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
