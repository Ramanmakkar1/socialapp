"use client";

import { useEffect, useLayoutEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BarChart3, ExternalLink, Maximize2, MoreVertical, PencilLine, Play, X } from "lucide-react";
import { deletePost } from "./actions";
import { duplicatePost } from "./duplicateActions";
import { retryPost } from "./retryActions";
import RescheduleControl from "./RescheduleControl";
import { PLATFORM_ICON, PLATFORM_LABEL, STATUS_LABEL, engagementRateOf, formatDateTime, isMovable, type AccountNames, type CalendarPost } from "./calendarUtils";
import styles from "./calendar.module.css";

type Props = {
  post: CalendarPost;
  anchor: HTMLElement;
  tz: string;
  accounts: AccountNames;
  onClose: () => void;
};

function fmt(n: number | null | undefined): string {
  return n == null ? "–" : n.toLocaleString("en-US");
}

// Floating card for one calendar post (Buffer-style): opens next to the clicked card,
// closes on Escape / click outside and gives focus back to the card.
export default function PostPopover({ post, anchor, tz, accounts, onClose }: Props) {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const titleId = `pp-${post.id}`;

  useLayoutEffect(() => {
    const place = () => {
      const el = ref.current;
      if (!el || window.innerWidth < 640) {
        setPos(null);
        return;
      }
      const r = anchor.getBoundingClientRect();
      const w = Math.min(360, window.innerWidth - 24); // offsetWidth is the sheet width before the first placement
      const h = el.offsetHeight;
      let left = r.right + 8;
      if (left + w > window.innerWidth - 12) left = Math.max(12, r.left - w - 8);
      const top = Math.min(Math.max(12, r.top), Math.max(12, window.innerHeight - h - 12));
      setPos({ top, left });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [anchor, expanded, menuOpen]);

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        anchor.focus();
      }
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (ref.current?.contains(t) || anchor.contains(t)) return;
      onClose();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [anchor, onClose]);

  function run(label: string, fn: () => Promise<{ ok: boolean; error?: string }>, closeAfter = false) {
    setMsg(null);
    setMenuOpen(false);
    startTransition(async () => {
      try {
        const res = await fn();
        if (!res.ok) {
          setMsg(res.error ?? `Could not ${label}.`);
          return;
        }
        router.refresh();
        if (closeAfter) onClose();
        else setMsg(label === "duplicate" ? "Duplicated as a draft." : "Done.");
      } catch {
        setMsg(`Could not ${label}. Please try again.`);
      }
    });
  }

  const platforms = post.platforms.length ? post.platforms : ["instagram"];
  const main = platforms[0];
  const Icon = PLATFORM_ICON[main] ?? PLATFORM_ICON.threads;
  const handle = accounts[main] ?? PLATFORM_LABEL[main] ?? main;
  const editable = isMovable(post.status);
  const editHref = `/app/calendar?draft=${post.id}`;
  const caption = post.caption.trim() || "(no caption)";
  const long = caption.length > 160;
  const published = post.status === "published";
  const rate = engagementRateOf(post.insights);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={styles.popover}
      style={pos ? { top: pos.top, left: pos.left } : undefined}
      data-sheet={pos ? undefined : "true"}
    >
      <div className={styles.popHead}>
        <p id={titleId} className={styles.popTitle} suppressHydrationWarning>
          {post.scheduled_at ? formatDateTime(post.scheduled_at, tz) : "No time set"}
          <span className={`${styles.statusTag} ${styles[`status_${post.status}`] ?? ""}`}>{STATUS_LABEL[post.status] ?? post.status}</span>
        </p>
        <div className={styles.popIcons}>
          {editable && (
            <Link href={editHref} scroll={false} className={styles.iconBtn} aria-label="Edit in composer" title="Edit in composer">
              <PencilLine width={16} height={16} aria-hidden="true" />
            </Link>
          )}
          <Link href={published ? "/app/analytics" : `/app/calendar?view=list${post.status === "failed" ? "&status=failed" : ""}`} className={styles.iconBtn} aria-label="Post details" title="Post details">
            <Maximize2 width={16} height={16} aria-hidden="true" />
          </Link>
          <button type="button" className={styles.iconBtn} onClick={() => { onClose(); anchor.focus(); }} aria-label="Close">
            <X width={16} height={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={styles.popBody}>
        <div className={styles.popMain}>
          <p className={styles.popAccount}>
            <span className={styles.avatarSm} aria-hidden="true">
              {handle.replace(/^@/, "").slice(0, 1).toUpperCase()}
              <span className={`${styles.netBadge} ${styles[`net_${main}`] ?? ""}`}><Icon width={9} height={9} /></span>
            </span>
            <span className={styles.popHandle}>{handle}</span>
            {platforms.length > 1 && <span className={styles.popMore}>+{platforms.length - 1}</span>}
          </p>
          <p className={styles.popCaption}>
            {long && !expanded ? `${caption.slice(0, 160)}… ` : `${caption} `}
            {long && (
              <button type="button" className={styles.linkBtn} onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
                {expanded ? "see less" : "see more"}
              </button>
            )}
          </p>
        </div>
        {post.thumb && (
          <span className={styles.popThumb}>
            {/* eslint-disable-next-line @next/next/no-img-element -- user media from arbitrary hosts */}
            <img src={post.thumb} alt="" loading="lazy" />
            {post.thumbIsVideo && <Play className={styles.playIcon} width={18} height={18} aria-hidden="true" />}
          </span>
        )}
      </div>

      {post.status === "failed" && post.error && (
        <p className={styles.popError} role="status">Couldn’t publish: {post.error.slice(0, 180)}</p>
      )}

      {published && (
        <div className={styles.popMetrics}>
          <dl>
            <div><dt>Likes</dt><dd>{fmt(post.insights?.likes)}</dd></div>
            <div><dt>Comments</dt><dd>{fmt(post.insights?.comments)}</dd></div>
            <div><dt>Eng. rate</dt><dd>{rate == null ? "–" : `${rate}%`}</dd></div>
            <div><dt>Reach</dt><dd>{fmt(post.insights?.reach)}</dd></div>
          </dl>
          <Link href="/app/analytics" className={styles.iconBtn} aria-label="Open analytics" title="Open analytics">
            <BarChart3 width={16} height={16} aria-hidden="true" />
          </Link>
        </div>
      )}

      {editable && post.scheduled_at && (
        <RescheduleControl key={tz} id={post.id} scheduledAt={post.scheduled_at} caption={post.caption} tz={tz} onMoved={onClose} />
      )}

      {msg && <p role="status" className={styles.popMsg}>{msg}</p>}

      <div className={styles.popFoot}>
        {post.permalink ? (
          <a href={post.permalink} target="_blank" rel="noopener noreferrer" className={styles.popPrimary}>
            Go to post <ExternalLink width={14} height={14} aria-hidden="true" />
          </a>
        ) : editable ? (
          <Link href={editHref} scroll={false} className={styles.popPrimary}>
            {post.status === "draft" ? "Edit draft" : "Edit post"}
          </Link>
        ) : post.status === "failed" ? (
          <button type="button" className={styles.popPrimary} disabled={pending} onClick={() => run("retry", () => retryPost(post.id), true)}>
            Retry now
          </button>
        ) : (
          <span />
        )}
        <div className={styles.menuWrap}>
          <button
            type="button"
            className={styles.iconBtn}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="More actions"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreVertical width={16} height={16} aria-hidden="true" />
          </button>
          {menuOpen && (
            <div role="menu" className={styles.menu} onKeyDown={(e) => { if (e.key === "Escape") { e.stopPropagation(); setMenuOpen(false); } }}>
              {editable && <Link role="menuitem" href={editHref} scroll={false} className={styles.menuItem}>Post details</Link>}
              <button role="menuitem" type="button" className={styles.menuItem} disabled={pending} onClick={() => run("duplicate", () => duplicatePost(post.id))}>Duplicate post</button>
              <button
                role="menuitem"
                type="button"
                className={styles.menuItem}
                onClick={() => {
                  const link = post.permalink ?? `${window.location.origin}${editable ? editHref : published ? "/app/analytics" : "/app/calendar?view=list"}`;
                  navigator.clipboard?.writeText(link).then(() => setMsg("Link copied."), () => setMsg("Could not copy the link."));
                  setMenuOpen(false);
                }}
              >
                Copy link
              </button>
              {post.status === "failed" && (
                <button role="menuitem" type="button" className={styles.menuItem} disabled={pending} onClick={() => run("retry", () => retryPost(post.id), true)}>Retry</button>
              )}
              {["draft", "scheduled", "failed"].includes(post.status) && (
                <button
                  role="menuitem"
                  type="button"
                  className={`${styles.menuItem} ${styles.menuDanger}`}
                  disabled={pending}
                  onClick={() => {
                    if (!window.confirm("Delete this post?")) return;
                    run("delete", () => deletePost(post.id), true);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
