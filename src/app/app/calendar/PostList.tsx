"use client";

import { useState } from "react";
import LoadFailed, { type LoadError } from "./LoadFailed";
import EmptyState from "../EmptyState";
import { Btn, BtnLink } from "@/components/ui/kit";
import { allPostTags, postMatchesTag } from "@/lib/tagFilter";
import PostCard from "./PostCard";
import PostPopover from "./PostPopover";
import QueueView from "./QueueView";
import { dayKeyLabel, zonedParts, type AccountNames, type CalendarPost } from "./calendarUtils";
import { useCalendar } from "./useCalendar";
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
  error_kind?: string | null;
  error_raw?: string | null;
  error_platform?: string | null;
  retry_at?: Date | string | null;
  warning?: string | null;
  thumb?: string | null;
  thumbIsVideo?: boolean;
};

export type PostFilter = "all" | "scheduled" | "draft" | "failed";

const filters: { value: PostFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "scheduled", label: "Scheduled" },
  { value: "draft", label: "Draft" },
  { value: "failed", label: "Failed" },
];

type Group = { key: string; label: string; posts: Post[] };

// Posts grouped by the viewer's local day ("Sun, Nov 8"), unscheduled drafts last.
function groupPosts(posts: Post[], tz: string): Group[] {
  const byDay = new Map<string, Post[]>();
  const undated: Post[] = [];
  const sorted = [...posts].sort((a, b) => (a.scheduled_at ? new Date(a.scheduled_at).getTime() : Infinity) - (b.scheduled_at ? new Date(b.scheduled_at).getTime() : Infinity));
  for (const post of sorted) {
    if (!post.scheduled_at) {
      undated.push(post);
      continue;
    }
    const key = zonedParts(post.scheduled_at, tz).key;
    byDay.set(key, [...(byDay.get(key) ?? []), post]);
  }
  const groups: Group[] = [...byDay].map(([key, list]) => ({ key, label: dayKeyLabel(key), posts: list }));
  if (undated.length) groups.push({ key: "undated", label: "No date set", posts: undated });
  return groups;
}

// List view: the same post cards as the calendar, grouped by day. Open a card for edit / duplicate /
// reschedule / retry / delete (the calendar popover). "Queue order" is a separate tab for drag-to-reorder.
export default function PostList({
  posts,
  loadError,
  initialFilter = "all",
  title = "Posts",
  published = [],
  showQueueTab = false,
  composeHref = "/app/calendar?view=list&compose=1",
  accounts = {},
  showStatusFilters = true,
}: {
  posts: Post[];
  loadError?: LoadError;
  initialFilter?: PostFilter;
  title?: string;
  /** Recently published posts, shown as their own group under the list. */
  published?: CalendarPost[];
  showQueueTab?: boolean;
  composeHref?: string;
  accounts?: AccountNames;
  showStatusFilters?: boolean;
}) {
  const [tab, setTab] = useState<"posts" | "queue">("posts");
  const [filter, setFilter] = useState<PostFilter>(initialFilter);
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const { tz, open, openPost, closePost } = useCalendar([...posts, ...published] as CalendarPost[]);
  const allTags = allPostTags(posts);
  const visiblePosts = posts.filter((post) =>
    (filter === "all" || post.status === filter) &&
    postMatchesTag(post, tag) &&
    post.caption.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  );
  const todayKey = tz ? zonedParts(new Date(), tz).key : "";

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

  const headingId = `${title.toLowerCase().replace(/\W+/g, "-")}-heading`;

  return (
    <section className={styles.queue} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.sectionTitle}>{title}</h2>
      {showQueueTab && (
        <div className={styles.listTabs} role="tablist" aria-label="List view">
          <button type="button" role="tab" aria-selected={tab === "posts"} className={styles.listTab} onClick={() => setTab("posts")}>By day</button>
          <button type="button" role="tab" aria-selected={tab === "queue"} className={styles.listTab} onClick={() => setTab("queue")}>Queue order</button>
        </div>
      )}
      {tab === "queue" ? (
        <QueueView posts={posts} tz={tz} composeHref={composeHref} onOpen={openPost} />
      ) : loadError ? (
        <LoadFailed message={loadError.message} reloadHref={loadError.reloadHref} className={styles.mt} />
      ) : (
        <>
          <div className={styles.listControls}>
            {showStatusFilters && <div className={styles.filters} role="group" aria-label="Filter posts by status">
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
            </div>}
            <div className={`${ui.field} ${styles.search}`}>
              <label htmlFor={`${headingId}-search`} className="sr-only">Search captions</label>
              <input
                id={`${headingId}-search`}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search captions"
                className={ui.input}
              />
            </div>
            {allTags.length > 0 && (
              <div className={`${ui.field} ${styles.search}`}>
                <label htmlFor={`${headingId}-tag`} className="sr-only">Filter by tag</label>
                <select id={`${headingId}-tag`} value={tag} onChange={(event) => setTag(event.target.value)} className={ui.input}>
                  <option value="">All tags</option>
                  {allTags.map((availableTag) => (
                    <option key={availableTag} value={availableTag}>{availableTag}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <p className={styles.count} role="status">
            {visiblePosts.length} {visiblePosts.length === 1 ? "post" : "posts"}
            {tz ? ` · times in ${tz.replace(/_/g, " ")}` : ""}
          </p>
          {visiblePosts.length === 0 ? (
            posts.length === 0 ? (
              <EmptyState
                title="Nothing planned yet"
                text="Write a post and it shows up here, grouped by day."
                art="/illustrations/empty-calendar.webp"
                artWidth={1536}
                artHeight={1024}
              >
                <BtnLink href={composeHref} scroll={false} size="sm">Write a post</BtnLink>
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
          ) : !tz ? (
            <p className={styles.count} role="status" aria-busy="true">Loading posts…</p>
          ) : (
            <ol className={styles.dayGroups}>
              {groupPosts(visiblePosts, tz).map((group) => (
                <li key={group.key}>
                  <h3 className={styles.dayGroupHead}>
                    {group.label}
                    {group.key === todayKey && <span className={styles.todayTag}>Today</span>}
                    <span className={styles.dayGroupCount}>{group.posts.length} {group.posts.length === 1 ? "post" : "posts"}</span>
                  </h3>
                  <div className={styles.dayGroupList}>
                    {group.posts.map((post) => <PostCard key={post.id} post={post} tz={tz} row onOpen={openPost} />)}
                  </div>
                </li>
              ))}
            </ol>
          )}
          {published.length > 0 && tz && (
            <section className={styles.published} aria-labelledby={`${headingId}-published`}>
              <h3 id={`${headingId}-published`} className={styles.dayGroupHead}>Recently published</h3>
              <div className={styles.dayGroupList}>
                {published.map((post) => <PostCard key={post.id} post={post} tz={tz} row onOpen={openPost} />)}
              </div>
            </section>
          )}
        </>
      )}
      {open && <PostPopover key={open.post.id} post={open.post} anchor={open.anchor} tz={tz} accounts={accounts} onClose={closePost} />}
    </section>
  );
}
