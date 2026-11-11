import { Suspense } from "react";
import Link from "next/link";
import { Film } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import type { IgProfile } from "@/lib/igGraph";
import { relativeDay, type IgMediaItem } from "@/lib/igMedia";
import { cachedIgProfile, cachedRecentMedia } from "@/lib/igCached";
import { ruleMatchesMedia } from "@/lib/ruleMedia";
import TodaysActions from "../TodaysActions";
import RefreshInstagramButton from "../RefreshInstagramButton";
import { CardRowSkeleton, TableSkeleton } from "../Skeleton";
import styles from "./content.module.css";

export const metadata = { title: "Posts & Reels" };

type Account = { id: string; external_id: string; access_token_enc: string | null; auth_type: string | null; username: string | null };

// "My content → Posts & Reels": the connected Instagram account's latest media (Graph /media, same
// call as Home's "Today's actions"), with whether an active comment automation covers each post.
// Views, DM clicks and CTR per post are not stored, so they show a dash.
export default async function ContentPage() {
  const user = await requireUser();
  let account: Account | null = null;
  let scopes: { media_ids: string[] }[] = [];
  if (isDbConfigured()) {
    try {
      [account] = await query<Account>(
        "select id, external_id, access_token_enc, auth_type, username from socialapp.social_accounts where user_id=$1 and platform='instagram' and status='active' order by updated_at desc nulls last limit 1",
        [user.id],
      );
    } catch {
      account = null;
    }
    try {
      scopes = await query<{ media_ids: string[] }>(
        "select coalesce(media_ids, '{}') as media_ids from socialapp.dm_rules where user_id=$1 and status='active' and (triggers is null or cardinality(triggers)=0 or 'comment' = any(triggers))",
        [user.id],
      );
    } catch {
      scopes = [];
    }
  }
  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <span className={styles.headIcon} aria-hidden="true"><Film width={20} height={20} /></span>
        <div className={styles.headText}>
          <h1 className={styles.h1}>Posts &amp; Reels</h1>
          <p className={styles.sub}>Your latest Instagram posts and reels, and which ones an Auto-DM answers.</p>
        </div>
        {account && <RefreshInstagramButton className={styles.ghost} />}
      </header>
      <Suspense
        fallback={
          <div className={styles.section} role="status" aria-label="Loading posts from Instagram">
            <CardRowSkeleton count={4} h={360} />
            <TableSkeleton rows={5} thumb />
          </div>
        }
      >
        <ContentFeed account={account} scopes={scopes} />
      </Suspense>
    </div>
  );
}

// Instagram media list: streamed behind Suspense so the page header renders without waiting for Meta.
async function ContentFeed({ account, scopes }: { account: Account | null; scopes: { media_ids: string[] }[] }) {
  let media: IgMediaItem[] = [];
  let profile: IgProfile | null = null;
  let failed = false;
  if (account) {
    const [p, m] = await Promise.allSettled([cachedIgProfile(account), cachedRecentMedia(account, 25)]);
    if (p.status === "fulfilled") profile = p.value;
    if (m.status === "fulfilled") media = m.value;
    else failed = true;
  }
  const covered = (id: string) => scopes.some((rule) => ruleMatchesMedia(rule, id));
  const username = profile?.username ?? account?.username ?? "instagram";
  const items = media.map((m) => ({ ...m, hasRule: covered(m.id) }));

  return (
    <>

      {!account ? (
        <div className={styles.empty}>
          <p><b>Connect Instagram to see your posts</b></p>
          <p>Once a professional Instagram account is connected, its latest posts and reels show up here.</p>
          <Link href="/app/settings#accounts-heading" className={styles.primary}>Connect Instagram</Link>
        </div>
      ) : failed ? (
        <div className={styles.empty} role="alert">
          <p><b>We couldn’t load your posts from Instagram</b></p>
          <p>Instagram didn’t answer or the connection needs to be renewed. Try Refresh, or reconnect the account in Settings.</p>
        </div>
      ) : (
        <>
          <section aria-labelledby="recent-posts" className={styles.section}>
            <h2 id="recent-posts" className={styles.h2}>Recent posts</h2>
            {items.length ? (
              <TodaysActions items={items.slice(0, 8)} username={username} avatarUrl={profile?.profilePictureUrl ?? null} />
            ) : (
              <p className={styles.muted}>No posts or reels on this account yet.</p>
            )}
          </section>

          {items.length > 0 && (
            <section aria-labelledby="all-content" className={styles.section}>
              <h2 id="all-content" className={styles.h2}>All content <span className={styles.count}>{items.length}</span></h2>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th scope="col">Content</th>
                      <th scope="col">Status</th>
                      <th scope="col" className={styles.num}>Views</th>
                      <th scope="col" className={styles.num}>Likes</th>
                      <th scope="col" className={styles.num}>Comments</th>
                      <th scope="col" className={styles.num}>DM clicks</th>
                      <th scope="col" className={styles.num}>CTR</th>
                      <th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <div className={styles.contentCell}>
                            {m.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element -- Instagram CDN URLs change per request
                              <img src={m.imageUrl} alt="" className={styles.thumb} loading="lazy" width={44} height={44} />
                            ) : (
                              <span className={styles.thumb} aria-hidden="true" />
                            )}
                            <span className={styles.captionCell}>
                              <span className={styles.caption}>{m.caption || "No caption"}</span>
                              <span className={styles.meta}>{m.isReel ? "Reel" : m.mediaType === "CAROUSEL_ALBUM" ? "Carousel" : "Post"} · {relativeDay(m.timestamp)}</span>
                            </span>
                          </div>
                        </td>
                        <td><span className={`${styles.pill} ${m.hasRule ? styles.pillLive : ""}`}>{m.hasRule ? "Live" : "No Auto-DM"}</span></td>
                        <td className={styles.num}>–</td>
                        <td className={styles.num}>{m.likes ?? "–"}</td>
                        <td className={styles.num}>{m.comments ?? "–"}</td>
                        <td className={styles.num}>–</td>
                        <td className={styles.num}>–</td>
                        <td className={styles.actions}>
                          <Link href="/app/auto-dm" className={styles.ghost}>{m.hasRule ? "View Auto-DM" : "Add Auto-DM"}</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className={styles.muted}>Views, DM clicks and CTR per post are not tracked yet, so they show a dash.</p>
            </section>
          )}
        </>
      )}
    </>
  );
}
