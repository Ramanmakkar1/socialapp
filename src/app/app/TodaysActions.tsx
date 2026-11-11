import Link from "next/link";
import { Heart, MessageCircle, MoreHorizontal, Play } from "lucide-react";
import { relativeDay, type IgMediaItem } from "@/lib/igMedia";
import styles from "./home.module.css";

export type ActionItem = IgMediaItem & { hasRule: boolean };

// "Today's actions": the latest posts/reels as phone-style cards, each saying whether an automation
// answers its comments, with one tap to view or add it.
// Remote Instagram CDN images change per request, so plain <img> is used (next/image would need every CDN host).
export default function TodaysActions({ items, username, avatarUrl }: { items: ActionItem[]; username: string; avatarUrl: string | null }) {
  return (
    <ul className={styles.row} aria-label="Latest posts and reels">
      {items.map((m) => (
        <li key={m.id} className={styles.post}>
          <div className={styles.postTop}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className={styles.avatar} width={28} height={28} loading="lazy" />
            ) : (
              <span className={styles.avatar} aria-hidden="true">{username.slice(0, 1).toUpperCase()}</span>
            )}
            <span className={styles.handle}>{username}</span>
            {m.permalink ? (
              <a href={m.permalink} target="_blank" rel="noopener noreferrer" className={styles.more} aria-label="Open on Instagram">
                <MoreHorizontal width={18} height={18} aria-hidden="true" />
              </a>
            ) : (
              <span className={styles.more} aria-hidden="true"><MoreHorizontal width={18} height={18} /></span>
            )}
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
            <span className={`${styles.chip} ${m.hasRule ? styles.chipOn : styles.chipOff}`}>
              {m.hasRule ? "Automation on" : "No automation"}
            </span>
          </div>
          <div className={styles.counts}>
            <span><Heart width={16} height={16} aria-hidden="true" />{m.likes ?? "–"}<span className="sr-only"> likes</span></span>
            <span><MessageCircle width={16} height={16} aria-hidden="true" />{m.comments ?? "–"}<span className="sr-only"> comments</span></span>
          </div>
          <p className={styles.caption}>
            <b>{username}</b>
            {m.caption || "No caption"}
          </p>
          <span className={styles.when}>{relativeDay(m.timestamp)}</span>
          <Link href="/app/auto-dm" className={`${styles.postBtn} ${m.hasRule ? "" : styles.postBtnAdd}`}>
            {m.hasRule ? "View automation" : "Add automation"}
          </Link>
        </li>
      ))}
    </ul>
  );
}
