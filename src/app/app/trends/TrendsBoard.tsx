"use client";

import { useMemo, useState } from "react";
import { Clapperboard, ExternalLink, Heart, MessageCircle, Percent, TrendingUp } from "lucide-react";
import LocalTime from "@/components/LocalTime";
import PendingButton from "@/components/ui/PendingButton";
import { captionSnippet, compactNumber, filterAndSortTrends, type TrendFilter, type TrendItem, type TrendSort } from "@/lib/trends";
import { makePostLikeThisAction } from "./actions";
import styles from "./trends.module.css";

const FILTERS: { value: TrendFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "reels", label: "Reels" },
  { value: "carousels", label: "Carousels" },
  { value: "posts", label: "Posts" },
];

const TITLES: Record<TrendFilter, string> = {
  all: "Top posts this week",
  reels: "Top Reels this week",
  carousels: "Top carousels this week",
  posts: "Top posts this week",
};

const KIND_LABEL = { reel: "Reel", carousel: "Carousel", post: "Post" } as const;

export default function TrendsBoard({ items, hasWatches }: { items: TrendItem[]; hasWatches: boolean }) {
  const [filter, setFilter] = useState<TrendFilter>("reels");
  const [sort, setSort] = useState<TrendSort>("engagement");
  const shown = useMemo(() => filterAndSortTrends(items, filter, sort).slice(0, 60), [items, filter, sort]);
  const counts = useMemo(() => {
    const c: Record<TrendFilter, number> = { all: items.length, reels: 0, carousels: 0, posts: 0 };
    for (const i of items) c[i.kind === "reel" ? "reels" : i.kind === "carousel" ? "carousels" : "posts"]++;
    return c;
  }, [items]);

  return (
    <section className={styles.card} aria-labelledby="trends-top">
      <div className={styles.cardHead}>
        <h2 id="trends-top" className={styles.h2}>{TITLES[filter]}</h2>
      </div>
      <p className={styles.note}>
        Posted in the last 7 days by the accounts you watch. Engagement = likes + comments; rate = engagement ÷ that account&apos;s followers.
        <b> Rising</b> = at least 2× that account&apos;s usual (median) engagement.
      </p>

      <div className={styles.toolbar}>
        <div className={styles.chips} role="group" aria-label="Filter by format">
          {FILTERS.map((f) => (
            <button key={f.value} type="button" className={styles.chip} aria-pressed={filter === f.value} onClick={() => setFilter(f.value)}>
              {f.label}
              <span className={styles.chipCount}>{counts[f.value]}</span>
            </button>
          ))}
        </div>
        <label className={styles.sortLabel}>
          Sort by
          <select className={styles.select} value={sort} onChange={(e) => setSort(e.target.value as TrendSort)}>
            <option value="engagement">Engagement</option>
            <option value="rate">Engagement rate</option>
            <option value="newest">Newest</option>
          </select>
        </label>
      </div>

      {shown.length === 0 ? (
        <div className={styles.empty} role="status">
          <Clapperboard width={22} height={22} aria-hidden="true" className={styles.emptyIcon} />
          {hasWatches ? (
            <>
              <p><b>Nothing here from the last 7 days yet.</b></p>
              <p>None of your watched accounts posted {filter === "all" ? "anything" : FILTERS.find((f) => f.value === filter)?.label.toLowerCase()} this week, or they haven&apos;t been read yet. Try another filter, add more accounts or refresh.</p>
            </>
          ) : (
            <>
              <p><b>Watch a few accounts to see what&apos;s working this week.</b></p>
              <p>Add Instagram Business or Creator accounts in your niche:</p>
              <ul>
                <li>competitors and creators your audience also follows</li>
                <li>accounts that post weekly trend roundups, like <b>@creators</b> (Instagram&apos;s own account for creators)</li>
              </ul>
              <p>Their top Reels from the last 7 days will be ranked here.</p>
            </>
          )}
        </div>
      ) : (
        <ol className={styles.grid} aria-label={TITLES[filter]}>
          {shown.map((item, index) => (
            <TrendCard key={`${item.username}-${item.id}`} item={item} rank={index + 1} />
          ))}
        </ol>
      )}
    </section>
  );
}

function TrendCard({ item, rank }: { item: TrendItem; rank: number }) {
  const snippet = captionSnippet(item.caption, 120);
  return (
    <li className={styles.item}>
      <div className={styles.thumb}>
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element -- Instagram CDN thumbnails from arbitrary hosts
          <img src={item.image} alt="" loading="lazy" referrerPolicy="no-referrer" />
        ) : (
          <div className={styles.thumbEmpty}><Clapperboard width={28} height={28} aria-hidden="true" /></div>
        )}
        <span className={styles.rank} aria-label={`Rank ${rank}`}>{rank}</span>
        <span className={styles.badges}>
          {item.rising && (
            <span className={styles.rising} title={`${item.vsMedian}× this account's median engagement`}>
              <TrendingUp width={12} height={12} aria-hidden="true" /> Rising {item.vsMedian}×
            </span>
          )}
          <span className={styles.kind}>{KIND_LABEL[item.kind]}</span>
        </span>
      </div>
      <div className={styles.body}>
        <div className={styles.acct}>
          {item.profilePictureUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- Instagram CDN avatar
            <img className={styles.avatar} src={item.profilePictureUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
          ) : (
            <span className={styles.avatar} aria-hidden="true" />
          )}
          <span className={styles.acctName}>@{item.username}</span>
          <span className={styles.when}><LocalTime value={item.postedAt} /></span>
        </div>
        <p className={`${styles.caption} ${snippet ? "" : styles.captionEmpty}`}>{snippet || "No caption"}</p>
        <p className={styles.stats}>
          <span title="Likes"><Heart width={13} height={13} aria-hidden="true" /><b>{item.likes === null ? "hidden" : compactNumber(item.likes)}</b><span className={styles.srOnly}> likes</span></span>
          <span title="Comments"><MessageCircle width={13} height={13} aria-hidden="true" /><b>{compactNumber(item.comments)}</b><span className={styles.srOnly}> comments</span></span>
          {item.rate !== null && (
            <span title="Engagement rate (likes + comments ÷ followers)"><Percent width={13} height={13} aria-hidden="true" /><b>{item.rate.toFixed(item.rate < 10 ? 2 : 1)}%</b><span className={styles.srOnly}> engagement rate</span></span>
          )}
        </p>
        <div className={styles.actions}>
          <form action={makePostLikeThisAction}>
            <input type="hidden" name="mediaId" value={item.id} />
            <input type="hidden" name="watchUser" value={item.username} />
            <PendingButton className={styles.primary}>Make a post like this</PendingButton>
          </form>
          {item.permalink && (
            <a className={styles.ghost} href={item.permalink} target="_blank" rel="noopener noreferrer">
              <ExternalLink width={13} height={13} aria-hidden="true" /> Open on Instagram<span className={styles.srOnly}> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
