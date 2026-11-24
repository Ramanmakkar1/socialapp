"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CalendarDays, Copy, ListOrdered, MoreHorizontal, PencilLine, Play, Send } from "lucide-react";
import { shareNow } from "../../calendar/actions";
import { duplicatePost } from "../../calendar/duplicateActions";
import { PLATFORM_ICON } from "../../calendar/calendarUtils";
import styles from "./channel.module.css";

export type ChannelPost = {
  id: string;
  caption: string;
  /** Scheduled time (queue / drafts) or publish time (sent), ISO. */
  at: string | null;
  createdAt: string;
  status: string;
  thumb: string | null;
  isVideo: boolean;
  tags: string[];
  error: string | null;
  /** The time is one of the channel's posting-schedule slots. */
  inQueue: boolean;
};

const EMPTY: Record<string, string> = {
  queue: "Nothing in the queue. Schedule a post or add one to the next free slot.",
  drafts: "No drafts for this channel.",
  sent: "Nothing sent from Poskoo yet.",
};

function dayKey(iso: string, tz: string) {
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: tz }).format(new Date(iso));
}

function ago(iso: string, nowMs: number): string {
  const s = Math.max(0, (nowMs - new Date(iso).getTime()) / 1000);
  if (s < 60) return "a few seconds ago";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

// The channel's posts grouped by day ("Today, October 14" / "Tomorrow, …"), each with its time on
// the left and a card: account, caption, media, tags, then Publish now / edit / more.
export default function ChannelPosts({ posts, tab, loadFailed, reloadHref, account }: {
  posts: ChannelPost[];
  tab: "queue" | "drafts" | "sent";
  loadFailed: boolean;
  reloadHref: string;
  account: { name: string; platform: string; avatar: string | null };
}) {
  const router = useRouter();
  const [tz, setTz] = useState("");
  const [nowMs, setNowMs] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the viewer's time zone is only known after hydration
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setNowMs(Date.now());
  }, []);

  if (loadFailed) {
    return (
      <p className={styles.notice} role="alert">
        We couldn’t load this channel’s posts. They may still exist. <Link href={reloadHref}>Try again</Link>
      </p>
    );
  }
  if (posts.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{EMPTY[tab]}</p>
        <Link href="/app/calendar?compose=1" className={styles.newBtn}>New post</Link>
      </div>
    );
  }
  if (!tz) return <div className={styles.loading} aria-busy="true" />;

  const today = dayKey(new Date(nowMs).toISOString(), tz);
  const tomorrow = dayKey(new Date(nowMs + 86_400_000).toISOString(), tz);
  const groups = new Map<string, ChannelPost[]>();
  for (const p of posts) {
    const k = p.at ? dayKey(p.at, tz) : "none";
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }
  const heading = (k: string) => {
    if (k === "none") return { lead: "No date", rest: "" };
    const date = new Date(`${k}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", timeZone: "UTC" });
    const weekday = new Date(`${k}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
    if (k === today) return { lead: "Today", rest: date };
    if (k === tomorrow) return { lead: "Tomorrow", rest: date };
    return { lead: weekday, rest: date };
  };
  const timeOf = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: tz });
  const Icon = PLATFORM_ICON[account.platform] ?? PLATFORM_ICON.threads;

  function run(id: string, action: () => Promise<{ ok: boolean; error?: string }>, fallback: string) {
    setError(null);
    setBusy(id);
    startTransition(async () => {
      try {
        const r = await action();
        if (!r.ok) setError(r.error ?? fallback);
        else router.refresh();
      } catch {
        setError(fallback);
      } finally {
        setBusy(null);
      }
    });
  }

  return (
    <div className={styles.list}>
      {error && <p className={styles.notice} role="alert">{error}</p>}
      {[...groups.entries()].map(([k, list]) => {
        const h = heading(k);
        return (
          <section key={k} className={styles.day} aria-label={`${h.lead}${h.rest ? `, ${h.rest}` : ""}`}>
            <h2 className={styles.dayTitle}>{h.lead}{h.rest && <span>, {h.rest}</span>}</h2>
            {list.map((p) => (
              <div key={p.id} className={styles.row}>
                <div className={styles.when}>
                  <span className={styles.time}>{p.at ? timeOf(p.at) : "—"}</span>
                  {p.inQueue && tab !== "sent" && <span className={styles.queueMark}><ListOrdered width={13} height={13} aria-hidden="true" /> Queue</span>}
                </div>
                <article className={`${styles.card} ${p.status === "failed" ? styles.cardFailed : ""}`}>
                  <div className={styles.cardBody}>
                    <div className={styles.cardMain}>
                      <p className={styles.cardWho}>
                        <span className={styles.miniAvatar} aria-hidden="true">
                          {account.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element -- channel avatar from the network's CDN
                            <img src={account.avatar} alt="" />
                          ) : (
                            account.name.replace(/^@/, "").slice(0, 1).toUpperCase()
                          )}
                          <span className={`${styles.miniBadge} ${styles[`badge_${account.platform}`] ?? ""}`}><Icon width={8} height={8} /></span>
                        </span>
                        <b>{account.name}</b>
                      </p>
                      <p className={styles.caption}>{p.caption.trim() || "(no caption)"}</p>
                      {p.tags.length > 0 && (
                        <p className={styles.tags}>
                          {p.tags.map((t) => <span key={t} className={styles.tag}>{t}</span>)}
                        </p>
                      )}
                      {p.status === "failed" && (
                        <p className={styles.failed}><AlertCircle width={14} height={14} aria-hidden="true" /> Couldn’t publish{p.error ? `: ${p.error.slice(0, 200)}` : "."}</p>
                      )}
                    </div>
                    {p.thumb && (
                      <span className={styles.media} aria-hidden="true">
                        {/* eslint-disable-next-line @next/next/no-img-element -- user media from arbitrary hosts */}
                        <img src={p.thumb} alt="" loading="lazy" />
                        {p.isVideo && <Play className={styles.play} width={16} height={16} />}
                      </span>
                    )}
                  </div>
                  <footer className={styles.cardFoot}>
                    <span className={styles.created}>{tab === "sent" ? "Published" : "Created"} {ago(tab === "sent" && p.at ? p.at : p.createdAt, nowMs)}</span>
                    <span className={styles.footActions}>
                      {tab !== "sent" && p.status !== "publishing" && (
                        <button type="button" className={styles.footBtn} disabled={busy === p.id} onClick={() => run(p.id, () => shareNow(p.id), "Could not publish this post now.")}>
                          <Send width={15} height={15} aria-hidden="true" /> {busy === p.id ? "Publishing…" : "Publish now"}
                        </button>
                      )}
                      {tab !== "sent" && (
                        <Link href={`/app/calendar?draft=${p.id}`} className={styles.iconBtn} aria-label="Edit post"><PencilLine width={15} height={15} aria-hidden="true" /></Link>
                      )}
                      <details className={styles.menu}>
                        <summary className={styles.iconBtn} aria-label="More actions"><MoreHorizontal width={16} height={16} aria-hidden="true" /></summary>
                        <div className={styles.menuPop}>
                          <button type="button" className={styles.menuItem} onClick={() => run(p.id, () => duplicatePost(p.id), "Could not duplicate this post.")}>
                            <Copy width={15} height={15} aria-hidden="true" /> Duplicate
                          </button>
                          <Link href={`/app/calendar?view=month&channel=${encodeURIComponent(account.platform)}`} className={styles.menuItem}>
                            <CalendarDays width={15} height={15} aria-hidden="true" /> View in calendar
                          </Link>
                        </div>
                      </details>
                    </span>
                  </footer>
                </article>
              </div>
            ))}
          </section>
        );
      })}
    </div>
  );
}
