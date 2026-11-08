import Link from "next/link";
import { Heart, MessageCircle, Play } from "lucide-react";
import { relativeDay, type IgMediaItem } from "@/lib/igMedia";
import styles from "./home.module.css";

// "Today's actions": the latest posts/reels with their automation status and one tap to add or view it.
// Remote Instagram CDN images change per request, so plain <img> is used (next/image would need every CDN host).
export default function TodaysActions({
  items,
  username,
  avatarUrl,
  automationOn,
}: {
  items: IgMediaItem[];
  username: string;
  avatarUrl: string | null;
  automationOn: boolean;
}) {
  return (
    <div className={styles.row} role="list" aria-label="Latest posts and reels">
      {items.map((m) => (
        <article key={m.id} className={styles.post} role="listitem">
          <div className={styles.postTop}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className={styles.avatar} width={28} height={28} loading="lazy" />
            ) : (
              <span className={styles.avatar} aria-hidden="true" />
            )}
            <span className={styles.handle}>{username}</span>
          </div>
          <div className={styles.media}>
            {m.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.imageUrl} alt={m.caption ? m.caption.slice(0, 100) : "Instagram post"} loading="lazy" />
            ) : (
              <span className={styles.noMedia}>No preview</span>
            )}
            {m.isReel && (
              <span className={styles.play} aria-hidden="true">
                <span><Play width={20} height={20} fill="currentColor" /></span>
              </span>
            )}
            <span className={`${styles.chip} ${automationOn ? styles.chipOn : styles.chipOff}`}>
              {automationOn ? "Automation on" : "No automation"}
            </span>
          </div>
          <div className={styles.counts}>
            <span aria-label={`${m.likes ?? 0} likes`}><Heart width={15} height={15} aria-hidden="true" />{m.likes ?? 0}</span>
            <span aria-label={`${m.comments ?? 0} comments`}><MessageCircle width={15} height={15} aria-hidden="true" />{m.comments ?? 0}</span>
          </div>
          <p className={styles.caption}>
            <b>{username}</b>
            {m.caption || "No caption"}
          </p>
          <span className={styles.when}>{relativeDay(m.timestamp)}</span>
          {automationOn ? (
            <Link href="/app/auto-dm" className={styles.postBtn}>View automation</Link>
          ) : (
            <Link href="/app/auto-dm" className={`${styles.postBtn} ${styles.postBtnAdd}`}>Add automation</Link>
          )}
        </article>
      ))}
    </div>
  );
}
