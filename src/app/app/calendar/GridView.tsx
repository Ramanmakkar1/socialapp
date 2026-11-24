"use client";

import Link from "next/link";
import { Play, Plus } from "lucide-react";
import LoadFailed, { type LoadError } from "./LoadFailed";
import PostPopover from "./PostPopover";
import { PLATFORM_ICON, STATUS_LABEL, formatDayTime, type AccountNames, type CalendarPost } from "./calendarUtils";
import { useCalendar } from "./useCalendar";
import styles from "./calendar.module.css";

// Grid (gallery) view: one tile per post with a big media preview, like a profile grid.
// Upcoming posts and drafts first (soonest first), then recently published. Tiles open the post popover.
export default function GridView({ posts, composeHref, accounts = {}, loadError }: {
  posts: CalendarPost[];
  composeHref: string;
  accounts?: AccountNames;
  loadError?: LoadError;
}) {
  const { posts: visible, tz, open, openPost, closePost } = useCalendar(posts);
  const order = (p: CalendarPost) => (p.status === "published" ? 1 : 0);
  const time = (p: CalendarPost) => (p.scheduled_at ? new Date(p.scheduled_at).getTime() : Number.POSITIVE_INFINITY);
  const sorted = [...visible].sort((a, b) => order(a) - order(b) || (order(a) === 1 ? time(b) - time(a) : time(a) - time(b)));

  return (
    <section className={styles.viewSection} aria-label="Posts grid">
      {loadError && <LoadFailed {...loadError} className={styles.mb} />}
      {sorted.length === 0 && !loadError ? (
        <div className={styles.gridEmpty}>
          <p>No posts yet. Your scheduled posts, drafts and recent posts show up here as a grid.</p>
          <Link href={composeHref} scroll={false} className={styles.newPostBtn}>
            <Plus width={18} height={18} aria-hidden="true" /> New post
          </Link>
        </div>
      ) : (
        <ul className={styles.postGrid}>
          {sorted.map((post) => {
            const platforms = post.platforms.length ? post.platforms : ["instagram"];
            const TileIcon = PLATFORM_ICON[platforms[0]] ?? PLATFORM_ICON.threads;
            const when = post.scheduled_at && tz ? formatDayTime(post.scheduled_at, tz) : post.scheduled_at ? "" : "No date";
            return (
              <li key={post.id}>
                <button
                  type="button"
                  className={styles.gridTile}
                  aria-haspopup="dialog"
                  aria-label={`${STATUS_LABEL[post.status] ?? post.status} post${when ? `, ${when}` : ""}: ${post.caption.slice(0, 80) || "no caption"}`}
                  onClick={(e) => openPost(post, e.currentTarget)}
                >
                  <span className={`${styles.gridMedia} ${post.thumb ? "" : `${styles.cardTile} ${styles[`tile_${platforms[0]}`] ?? ""}`}`} aria-hidden="true">
                    {post.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element -- user media from arbitrary hosts
                      <img src={post.thumb} alt="" loading="lazy" />
                    ) : (
                      <TileIcon width={28} height={28} />
                    )}
                    {post.thumbIsVideo && <Play className={styles.gridPlay} width={14} height={14} />}
                    <span className={`${styles.gridStatus} ${styles[`status_${post.status}`] ?? ""}`}>{STATUS_LABEL[post.status] ?? post.status}</span>
                  </span>
                  <span className={styles.gridMeta}>
                    <span className={styles.cardIcons} aria-hidden="true">
                      {platforms.slice(0, 4).map((p) => {
                        const Icon = PLATFORM_ICON[p] ?? PLATFORM_ICON.threads;
                        return <Icon key={p} width={13} height={13} className={styles[`ico_${p}`]} />;
                      })}
                    </span>
                    <span className={styles.gridWhen} suppressHydrationWarning>{when}</span>
                  </span>
                  <span className={styles.gridCaption}>{post.caption.trim() || "(no caption)"}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {open && tz && <PostPopover key={open.post.id} post={open.post} anchor={open.anchor} tz={tz} accounts={accounts} onClose={closePost} />}
    </section>
  );
}
