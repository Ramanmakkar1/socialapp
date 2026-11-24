import PendingButton from "@/components/ui/PendingButton";
import { postThumbUrl } from "@/lib/mediaUpload";
import Link from "next/link";
import { Check, EyeOff, Heart, Image as ImageIcon, Inbox, Instagram, LayoutGrid, List, MessageCircle, MessagesSquare } from "lucide-react";
import LocalTime from "@/components/LocalTime";

import { isDbConfigured, query } from "@/lib/db";
import {
  DM_WINDOW_MS,
  PRIVATE_REPLY_WINDOW_MS,
  filterComments,
  groupCommentsByPost,
  loadInbox,
  withinWindow,
  type InboxComment,
  type InboxFilter,
  type PostGroup,
  type Thread,
} from "@/lib/inbox";
import { BtnLink } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import EmptyState from "../EmptyState";
import { hideCommentAction, likeCommentAction, privateReplyAction, replyToCommentAction, toggleDoneAction } from "./actions";
import CommentReplyBox from "./CommentReplyBox";
import { postKeyFor } from "./returnTo";
import ReplySubmitButton from "./ReplySubmitButton";
import ThreadReplyComposer from "./ThreadReplyComposer";
import styles from "./inbox.module.css";
import { requireWorkspaceUser } from "@/lib/workspace";

export const metadata = { title: "Inbox" };

const OK_TEXT: Record<string, string> = {
  comment: "Reply posted under the comment.",
  private: "Private reply sent.",
  dm: "Message sent.",
  liked: "You liked the comment.",
};

function one(v: string | string[] | undefined): string {
  return typeof v === "string" ? v : "";
}

function inboxRetryHref(tab: string, threadKey: string): string {
  if (threadKey) return `/app/inbox?thread=${encodeURIComponent(threadKey)}`;
  if (tab === "messages") return "/app/inbox?tab=messages";
  return "/app/inbox";
}

function statusPillClass(dmStatus: string | null): string {
  if (dmStatus === "sent") return `${styles.statusPill} ${styles.statusSent}`;
  if (dmStatus === "pending") return `${styles.statusPill} ${styles.statusQueued}`;
  if (dmStatus) return `${styles.statusPill} ${styles.statusFailed}`;
  return styles.statusPill;
}

type PostInfo = { caption: string; thumb: string | null; at: Date | null };

const AVATAR_TINTS = ["#e8e1ff", "#ffe4d1", "#d8f3e4", "#ffdcee", "#dbeafe", "#fdf1c7"];

function tintFor(name: string): string {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_TINTS[h % AVATAR_TINTS.length];
}

function relTime(at: Date | string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(at).getTime()) / 1000));
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function groupKey(g: PostGroup): string {
  return postKeyFor(g.accountId, g.mediaId);
}

// Hidden fields that bring the user back to the same filter, layout and post after an action.
function ReturnFields({ ret }: { ret: Record<string, string> }) {
  return (
    <>
      {Object.entries(ret).map(([k, v]) => (v ? <input key={k} type="hidden" name={`return_${k}`} value={v} /> : null))}
    </>
  );
}

// Posts this app published, keyed by Instagram media id, so the inbox can show their caption and image.
async function postInfoByMedia(userId: string, mediaIds: string[]): Promise<Map<string, PostInfo>> {
  const out = new Map<string, PostInfo>();
  if (mediaIds.length === 0) return out;
  try {
    const rows = await query<{ external_post_id: string; caption: string | null; media: unknown; published_at: Date | null }>(
      `select t.external_post_id, p.caption, p.media, t.published_at
         from socialapp.post_targets t join socialapp.scheduled_posts p on p.id = t.post_id
        where p.user_id = $1 and t.platform = 'instagram' and t.external_post_id = any($2::text[])`,
      [userId, mediaIds],
    );
    for (const r of rows) {
      const url = postThumbUrl(r.media);
      out.set(r.external_post_id, { caption: r.caption ?? "", thumb: url, at: r.published_at });
    }
  } catch {
    // Unknown posts just show as "Instagram post".
  }
  return out;
}

const STATUS_TEXT: Record<string, string> = {
  sent: "Private reply sent",
  pending: "Auto-DM queued",
};

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[]; thread?: string | string[]; ok?: string | string[]; error?: string | string[]; filter?: string | string[]; view?: string | string[]; post?: string | string[] }>;
}) {
  const user = await requireWorkspaceUser();
  const sp = await searchParams;
  const threadKey = one(sp.thread);
  const tab = threadKey ? "messages" : one(sp.tab) === "messages" ? "messages" : "comments";
  const rawFilter = one(sp.filter);
  const filter: InboxFilter = rawFilter === "unanswered" || rawFilter === "hidden" ? rawFilter : "all";
  const ok = OK_TEXT[one(sp.ok)];
  const error = one(sp.error).slice(0, 300);

  let data: Awaited<ReturnType<typeof loadInbox>> = { accounts: [], comments: [], threads: [] };
  let loadFailed = false;
  if (isDbConfigured()) {
    try {
      data = await loadInbox(user.id);
    } catch {
      loadFailed = true;
    }
  }
  const openThread: Thread | undefined = data.threads.find((t) => `${t.accountId}:${t.senderId}` === threadKey);
  const counts = {
    all: data.comments.filter((c) => !c.hidden).length,
    unanswered: data.comments.filter((c) => !c.hidden && !c.done).length,
    hidden: data.comments.filter((c) => c.hidden).length,
  };
  const groups = groupCommentsByPost(filterComments(data.comments, filter), data.accounts);
  const view = one(sp.view) === "list" ? "list" : "post";
  const postInfo = await postInfoByMedia(user.id, [...new Set(data.comments.map((c) => c.mediaId).filter((m): m is string => Boolean(m)))]);
  const selectedKey = one(sp.post);
  const selected = groups.find((g) => groupKey(g) === selectedKey) ?? groups[0];
  const account = data.accounts[0];
  const handle = account?.username ?? null;
  const hrefWith = (params: Record<string, string>) => {
    const q = new URLSearchParams();
    if (filter !== "all") q.set("filter", filter);
    for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
    const str = q.toString();
    return str ? `/app/inbox?${str}` : "/app/inbox";
  };

  return (
    <>
      <header className={styles.pageHead}>
        <div className={styles.headWho}>
          <span className={styles.headAvatar} aria-hidden="true">
            {(handle ?? "I").slice(0, 1).toUpperCase()}
            <span className={styles.headBadge}><Instagram width={10} height={10} /></span>
          </span>
          <div className="min-w-0">
            <h1 className={styles.pageTitle}>
              {handle ? `@${handle}` : "Inbox"}
              {counts.unanswered > 0 && <span className={styles.unansweredBadge}>{counts.unanswered} unanswered</span>}
            </h1>
            <p className={styles.pageSub}>Comments on your posts and Instagram DMs. Auto-DM rules answer most of them for you.</p>
          </div>
        </div>
        {tab === "comments" && data.comments.length > 0 && (
          <nav className={styles.viewToggle} aria-label="Comment layout">
            <Link href={hrefWith({})} aria-current={view === "post" ? "page" : undefined} className={`${styles.viewBtn} ${view === "post" ? styles.viewBtnActive : ""}`}>
              <LayoutGrid width={15} height={15} aria-hidden="true" /> By post
            </Link>
            <Link href={hrefWith({ view: "list" })} aria-current={view === "list" ? "page" : undefined} className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`}>
              <List width={15} height={15} aria-hidden="true" /> List
            </Link>
          </nav>
        )}
      </header>
      {ok && <p className={ui.notice} role="status">{ok}</p>}
      {error && <p className={`${ui.notice} ${ui.noticeWarn}`}>{error}</p>}
      {loadFailed ? (
        <p className={`${ui.notice} ${ui.noticeWarn}`}>
          We couldn&apos;t load your inbox right now.{" "}
          <Link href={inboxRetryHref(tab, threadKey)} className={ui.link}>
            Retry
          </Link>
        </p>
      ) : (
        <>
      <nav className={styles.tabs} aria-label="Inbox sections">
        <Link href="/app/inbox" aria-current={tab === "comments" ? "page" : undefined} className={`${styles.tab} ${tab === "comments" ? styles.tabActive : ""}`}>
          <MessageCircle width={16} height={16} aria-hidden="true" /> Comments <span className={styles.tabCount}>{data.comments.length}</span>
        </Link>
        <Link href="/app/inbox?tab=messages" aria-current={tab === "messages" ? "page" : undefined} className={`${styles.tab} ${tab === "messages" ? styles.tabActive : ""}`}>
          <MessagesSquare width={16} height={16} aria-hidden="true" /> Messages <span className={styles.tabCount}>{data.threads.length}</span>
        </Link>
      </nav>

      {data.accounts.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Inbox}
            title="Connect Instagram to see comments and DMs"
            text="New comments and messages show up here as soon as they arrive."
            art="/illustrations/connect-account.webp"
            artWidth={1536}
            artHeight={1024}
          >
            <BtnLink href="/app/settings" size="sm">Connect Instagram</BtnLink>
          </EmptyState>
        </div>
      ) : tab === "comments" ? (
        data.comments.length === 0 ? (
          <EmptyState
            icon={MessageCircle}
            title="No comments yet"
            text="No comments in the last 30 days yet. They appear here as soon as someone comments on your posts."
            art="/illustrations/empty-inbox.webp"
            artWidth={1536}
            artHeight={1024}
          >
            <BtnLink href="/app/auto-dm" size="sm" variant="line">Set up a comment rule</BtnLink>
          </EmptyState>
        ) : (
          <>
            <div className={styles.filterTabs} role="tablist" aria-label="Comment filters">
              <Link href={view === "list" ? "/app/inbox?view=list" : "/app/inbox"} role="tab" aria-selected={filter === "all"} className={`${styles.filterTab} ${filter === "all" ? styles.filterTabActive : ""}`}>
                All ({counts.all})
              </Link>
              <Link href={`/app/inbox?filter=unanswered${view === "list" ? "&view=list" : ""}`} role="tab" aria-selected={filter === "unanswered"} className={`${styles.filterTab} ${filter === "unanswered" ? styles.filterTabActive : ""}`}>
                Unanswered ({counts.unanswered})
              </Link>
              <Link href={`/app/inbox?filter=hidden${view === "list" ? "&view=list" : ""}`} role="tab" aria-selected={filter === "hidden"} className={`${styles.filterTab} ${filter === "hidden" ? styles.filterTabActive : ""}`}>
                Hidden ({counts.hidden})
              </Link>
            </div>
            {groups.length === 0 ? (
              <p className={`${ui.notice} mt-4`}>
                {filter === "hidden"
                  ? "No hidden comments. Use Hide on a comment to park it out of the way."
                  : "Nothing unanswered — every comment is answered or hidden."}
              </p>
            ) : view === "post" && selected ? (
              <div className={styles.byPost}>
                <ul className={styles.postGrid} aria-label="Posts with comments">
                  {groups.map((g) => {
                    const info = g.mediaId ? postInfo.get(g.mediaId) : undefined;
                    const key = groupKey(g);
                    const active = key === groupKey(selected);
                    return (
                      <li key={key}>
                        <Link
                          href={hrefWith({ post: key })}
                          scroll={false}
                          aria-current={active ? "true" : undefined}
                          aria-label={`${info?.caption ? info.caption.slice(0, 60) : "Instagram post"}: ${g.comments.length} comments, ${g.unanswered} unanswered`}
                          className={`${styles.postTile} ${active ? styles.postTileActive : ""}`}
                        >
                          {info?.thumb ? (
                            // eslint-disable-next-line @next/next/no-img-element -- user media from arbitrary hosts
                            <img src={info.thumb} alt="" loading="lazy" />
                          ) : (
                            <span className={styles.postTileText}>{info?.caption ? info.caption.slice(0, 70) : <ImageIcon width={20} height={20} aria-hidden="true" />}</span>
                          )}
                          {g.unanswered > 0 && <span className={styles.tileCount}>{g.unanswered}</span>}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                <SelectedPost group={selected} info={selected.mediaId ? postInfo.get(selected.mediaId) : undefined} filter={filter} />
              </div>
            ) : (
              <div className="mt-4 grid gap-5">
                {groups.map((g) => (
                  <section key={`${g.accountId}:${g.mediaId ?? "none"}`} className={styles.postGroup} aria-label={`Comments on a post by @${g.username ?? "your account"}`}>
                    <header className={styles.postHeader}>
                      <span className={styles.postTitle}>
                        <ImageIcon width={16} height={16} aria-hidden="true" />
                        Post · @{g.username ?? "your account"}
                      </span>
                      <span className={styles.meta}>
                        {g.comments.length} {g.comments.length === 1 ? "comment" : "comments"}
                        {g.unanswered > 0 ? ` · ${g.unanswered} unanswered` : " · all answered"} · <LocalTime value={g.latestAt} style="medium" />
                      </span>
                    </header>
                    <ul className="mt-3 grid gap-3">
                      {g.comments.map((c) => (
                        <CommentCard key={c.commentId} c={c} filter={filter} />
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </>
        )
      ) : openThread ? (
        <div className={`${styles.commentCard} mt-6`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="m-0 text-lg font-semibold text-[var(--poskoo-ink)]">@{openThread.username ?? "instagram user"}</h2>
            <Link href="/app/inbox?tab=messages" className={ui.link}>All messages</Link>
          </div>
          <ul className="mt-4 grid gap-2">
            {openThread.messages.map((m, i) => (
              <li key={i} className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] text-sm ${m.direction === "out" ? styles.bubbleOut : styles.bubbleIn}`}>
                  <p className="m-0 whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`mt-1 text-[11px] ${m.direction === "out" ? styles.bubbleOutTime : styles.meta}`}>
                    {m.direction === "out" && m.ai && (
                      <span
                        className="mr-1.5 inline-block rounded-full bg-[var(--poskoo-band)] px-1.5 py-0.5 text-xs font-semibold text-[var(--poskoo-violet)]"
                        aria-label="Sent by AI reply"
                      >
                        AI
                      </span>
                    )}
                    <LocalTime value={m.at} style="medium" />
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {withinWindow(openThread.lastInboundAt, DM_WINDOW_MS) ? (
            <ThreadReplyComposer
              key={JSON.stringify([user.id, openThread.accountId, openThread.senderId])}
              userId={user.id}
              accountId={openThread.accountId}
              senderId={openThread.senderId}
              sent={one(sp.ok) === "dm" && !error}
            />
          ) : (
            <p className={`mt-4 text-sm ${styles.meta}`}>Instagram only allows replies within 24 hours of this person&apos;s last message. You can reply again once they message you.</p>
          )}
        </div>
      ) : data.threads.length === 0 ? (
        <EmptyState
          icon={MessagesSquare}
          title="No messages yet"
          text="No DMs in the last 30 days yet. Messages people send your Instagram account show up here."
          art="/illustrations/empty-inbox.webp"
          artWidth={1536}
          artHeight={1024}
        />
      ) : (
        <ul className={`${styles.threadList} mt-6`}>
          {data.threads.map((t) => (
            <li key={`${t.accountId}:${t.senderId}`}>
              <Link href={`/app/inbox?thread=${encodeURIComponent(`${t.accountId}:${t.senderId}`)}`} className={styles.threadRow}>
                <div className="min-w-0">
                  <p className={styles.threadName}>@{t.username ?? "instagram user"}</p>
                  <p className={styles.threadPreview}>{t.lastText}</p>
                </div>
                <div className={`shrink-0 text-right text-xs ${styles.meta}`}>
                  <p className="m-0"><LocalTime value={t.lastAt} style="medium" /></p>
                  {withinWindow(t.lastInboundAt, DM_WINDOW_MS) && <p className={`m-0 ${styles.canReply}`}>Can reply</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
        </>
      )}
    </>
  );
}

function CommentCard({ c, filter }: { c: InboxComment; filter: InboxFilter }) {
  const ret = { filter: filter === "all" ? "" : filter, view: "list" };
  const canPrivate = !c.dmStatus && withinWindow(c.receivedAt, PRIVATE_REPLY_WINDOW_MS);
  const who = `@${c.fromUsername ?? "instagram user"}`;
  return (
    <li className={styles.commentCard}>
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-semibold text-[var(--poskoo-ink)]">{who}</span>
        <span className={styles.meta}>
          <LocalTime value={c.receivedAt} style="medium" />
        </span>
      </div>
      <p className={styles.commentText}>{c.text}</p>
      <p className={`mt-2 flex flex-wrap items-center gap-2 text-xs ${styles.meta}`}>
        <span className={statusPillClass(c.dmStatus)}>
          {c.dmStatus
            ? STATUS_TEXT[c.dmStatus] ?? `Auto-DM ${c.dmStatus}`
            : "No auto-DM rule matched"}
        </span>
        {c.done && <span className={`${styles.statusPill} ${styles.statusSent}`}>Done</span>}
        {c.liked && <span className={styles.statusPill}>Liked</span>}
        <Link href="/app/auto-dm" className={ui.link}>Comment rules</Link>
      </p>
      <div className={styles.actionRow}>
        <form action={likeCommentAction}>
          <input type="hidden" name="account_id" value={c.accountId} />
          <input type="hidden" name="comment_id" value={c.commentId} />
          <ReturnFields ret={ret} />
          <PendingButton disabled={c.liked} className={styles.actionBtn} aria-label={c.liked ? `Comment by ${who} is liked` : `Like the comment by ${who}`}>
            <Heart width={14} height={14} aria-hidden="true" />
            {c.liked ? "Liked" : "Like"}
          </PendingButton>
        </form>
        <form action={toggleDoneAction}>
          <input type="hidden" name="account_id" value={c.accountId} />
          <input type="hidden" name="comment_id" value={c.commentId} />
          <ReturnFields ret={ret} />
          <PendingButton className={styles.actionBtn} aria-pressed={c.done} aria-label={c.done ? `Reopen the comment by ${who}` : `Mark the comment by ${who} done`}>
            <Check width={14} height={14} aria-hidden="true" />
            {c.done ? "Done" : "Mark done"}
          </PendingButton>
        </form>
        <form action={hideCommentAction}>
          <input type="hidden" name="account_id" value={c.accountId} />
          <input type="hidden" name="comment_id" value={c.commentId} />
          <ReturnFields ret={ret} />
          <PendingButton className={styles.actionBtn} aria-pressed={c.hidden} aria-label={c.hidden ? `Show the comment by ${who} again` : `Hide the comment by ${who}`}>
            <EyeOff width={14} height={14} aria-hidden="true" />
            {c.hidden ? "Show" : "Hide"}
          </PendingButton>
        </form>
      </div>
      <details className="mt-3">
        <summary className={styles.replyToggle}>Reply</summary>
        <form action={replyToCommentAction} className="mt-2 flex flex-wrap gap-2">
          <input type="hidden" name="account_id" value={c.accountId} />
          <input type="hidden" name="comment_id" value={c.commentId} />
          <ReturnFields ret={ret} />
          <label className="sr-only" htmlFor={`pub-${c.commentId}`}>Public reply</label>
          <input id={`pub-${c.commentId}`} name="message" required maxLength={2200} placeholder="Reply publicly under the comment…" className={ui.input} />
          <ReplySubmitButton label="Post reply" />
        </form>
        {canPrivate ? (
          <form action={privateReplyAction} className="mt-2 flex flex-wrap gap-2">
            <input type="hidden" name="account_id" value={c.accountId} />
            <input type="hidden" name="comment_id" value={c.commentId} />
            <ReturnFields ret={ret} />
            <label className="sr-only" htmlFor={`dm-${c.commentId}`}>Private reply</label>
            <input id={`dm-${c.commentId}`} name="message" required maxLength={1000} placeholder="Send one private DM reply…" className={ui.input} />
            <ReplySubmitButton label="Send DM" />
          </form>
        ) : (
          <p className={`mt-2 text-xs ${styles.meta}`}>Private DM reply: Instagram allows one per comment, within 7 days.</p>
        )}
      </details>
    </li>
  );
}

function SelectedPost({ group, info, filter }: { group: PostGroup; info: PostInfo | undefined; filter: InboxFilter }) {
  const handle = group.username;
  return (
    <section className={styles.threadPane} aria-labelledby="selected-post-heading">
      <article className={styles.selPost}>
        <p className={styles.selMeta}>
          <span className={styles.selNet} aria-hidden="true"><Instagram width={12} height={12} /></span>
          <b>@{handle ?? "your account"}</b>
          {info?.at && <span className={styles.meta}> · <LocalTime value={info.at} style="medium" /></span>}
        </p>
        <h2 id="selected-post-heading" className="sr-only">Selected post</h2>
        <div className={styles.selBody}>
          {info?.thumb && (
            // eslint-disable-next-line @next/next/no-img-element -- user media from arbitrary hosts
            <img src={info.thumb} alt="Post media" className={styles.selMedia} loading="lazy" />
          )}
          <p className={styles.selCaption}>{info?.caption || (info ? "(no caption)" : "A post on Instagram (not published through Poskoo).")}</p>
        </div>
      </article>
      <p className={styles.threadCount}>
        <b>{group.comments.length} {group.comments.length === 1 ? "comment" : "comments"}</b>
        <span aria-hidden="true"> | </span>
        <span>{group.unanswered} unanswered</span>
      </p>
      <ul className={styles.commentThread}>
        {group.comments.map((c) => (
          <ThreadComment key={c.commentId} c={c} filter={filter} />
        ))}
      </ul>
    </section>
  );
}

function ThreadComment({ c, filter }: { c: InboxComment; filter: InboxFilter }) {
  const name = c.fromUsername ?? "instagram user";
  const who = `@${name}`;
  const ret = { filter: filter === "all" ? "" : filter, post: postKeyFor(c.accountId, c.mediaId) };
  const canPrivate = !c.dmStatus && withinWindow(c.receivedAt, PRIVATE_REPLY_WINDOW_MS);
  return (
    <li className={`${styles.tComment} ${c.done ? styles.tCommentDone : ""}`}>
      <span className={styles.tAvatar} style={{ background: tintFor(name) }} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
      <div className={styles.tMain}>
        <p className={styles.tHead}>
          <b>{who}</b>
          <span className={styles.meta} title={new Date(c.receivedAt).toISOString()}>{relTime(c.receivedAt)}</span>
          {c.done && <span className={`${styles.statusPill} ${styles.statusSent}`}>Done</span>}
          {c.dmStatus && <span className={statusPillClass(c.dmStatus)}>{STATUS_TEXT[c.dmStatus] ?? `Auto-DM ${c.dmStatus}`}</span>}
          {c.liked && <span className={styles.statusPill}>Liked</span>}
        </p>
        <p className={styles.tText}>{c.text}</p>
        <div className={styles.tActions}>
          <form action={likeCommentAction}>
            <input type="hidden" name="account_id" value={c.accountId} />
            <input type="hidden" name="comment_id" value={c.commentId} />
            <ReturnFields ret={ret} />
            <PendingButton disabled={c.liked} className={styles.linkAction} aria-label={c.liked ? `Comment by ${who} is liked` : `Like the comment by ${who}`}>
              <Heart width={13} height={13} aria-hidden="true" /> {c.liked ? "Liked" : "Like"}
            </PendingButton>
          </form>
          <form action={hideCommentAction}>
            <input type="hidden" name="account_id" value={c.accountId} />
            <input type="hidden" name="comment_id" value={c.commentId} />
            <ReturnFields ret={ret} />
            <PendingButton className={styles.linkAction} aria-pressed={c.hidden} aria-label={c.hidden ? `Show the comment by ${who} again` : `Hide the comment by ${who}`}>
              <EyeOff width={13} height={13} aria-hidden="true" /> {c.hidden ? "Show" : "Hide"}
            </PendingButton>
          </form>
        </div>
        <div className={styles.replyRow}>
          <CommentReplyBox action={replyToCommentAction} accountId={c.accountId} commentId={c.commentId} handle={c.fromUsername} returnTo={ret} />
          <form action={toggleDoneAction} className={styles.doneForm}>
            <input type="hidden" name="account_id" value={c.accountId} />
            <input type="hidden" name="comment_id" value={c.commentId} />
            <ReturnFields ret={ret} />
            <PendingButton className={`${styles.doneBtn} ${c.done ? styles.doneBtnOn : ""}`} aria-pressed={c.done} aria-label={c.done ? `Reopen the comment by ${who}` : `Mark the comment by ${who} done`} title={c.done ? "Reopen" : "Mark as done"}>
              <Check width={18} height={18} aria-hidden="true" />
            </PendingButton>
          </form>
        </div>
        {canPrivate ? (
          <details className={styles.privateReply}>
            <summary className={styles.replyToggle}>Send a private DM instead</summary>
            <form action={privateReplyAction} className="mt-2 flex flex-wrap gap-2">
              <input type="hidden" name="account_id" value={c.accountId} />
              <input type="hidden" name="comment_id" value={c.commentId} />
              <ReturnFields ret={ret} />
              <label className="sr-only" htmlFor={`tdm-${c.commentId}`}>Private reply</label>
              <input id={`tdm-${c.commentId}`} name="message" required maxLength={1000} placeholder="Send one private DM reply…" className={ui.input} />
              <ReplySubmitButton label="Send DM" />
            </form>
          </details>
        ) : (
          <p className={`mt-2 text-xs ${styles.meta}`}>Private DM reply: Instagram allows one per comment, within 7 days.</p>
        )}
      </div>
    </li>
  );
}
