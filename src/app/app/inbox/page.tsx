import Link from "next/link";
import { Check, EyeOff, Heart, Image as ImageIcon, Inbox, MessageCircle, MessagesSquare } from "lucide-react";
import LocalTime from "@/components/LocalTime";
import { requireUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import {
  DM_WINDOW_MS,
  PRIVATE_REPLY_WINDOW_MS,
  filterComments,
  groupCommentsByPost,
  loadInbox,
  withinWindow,
  type InboxComment,
  type InboxFilter,
  type Thread,
} from "@/lib/inbox";
import { BtnLink, PageHero } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import EmptyState from "../EmptyState";
import { hideCommentAction, likeCommentAction, privateReplyAction, replyToCommentAction, toggleDoneAction } from "./actions";
import ReplySubmitButton from "./ReplySubmitButton";
import ThreadReplyComposer from "./ThreadReplyComposer";
import styles from "./inbox.module.css";

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

const STATUS_TEXT: Record<string, string> = {
  sent: "Private reply sent",
  pending: "Auto-DM queued",
};

export default async function InboxPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string | string[]; thread?: string | string[]; ok?: string | string[]; error?: string | string[]; filter?: string | string[] }>;
}) {
  const user = await requireUser();
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

  return (
    <>
      <PageHero
        eyebrow="Comments and DMs"
        title="Inbox"
        lede="Comments on your posts and Instagram DMs, in one place. Auto-DM rules answer most of them for you."
        art="/landing/card-dm.webp"
        artAlt="A creator replying to Instagram comments and messages"
      />
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
      <div className={`${styles.tabs} mt-6`} role="tablist">
        <Link href="/app/inbox" role="tab" aria-selected={tab === "comments"} className={`${styles.tab} ${tab === "comments" ? styles.tabActive : ""}`}>
          <MessageCircle width={16} height={16} aria-hidden="true" /> Comments ({data.comments.length})
        </Link>
        <Link href="/app/inbox?tab=messages" role="tab" aria-selected={tab === "messages"} className={`${styles.tab} ${tab === "messages" ? styles.tabActive : ""}`}>
          <MessagesSquare width={16} height={16} aria-hidden="true" /> Messages ({data.threads.length})
        </Link>
      </div>

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
              <Link href="/app/inbox" role="tab" aria-selected={filter === "all"} className={`${styles.filterTab} ${filter === "all" ? styles.filterTabActive : ""}`}>
                All ({counts.all})
              </Link>
              <Link href="/app/inbox?filter=unanswered" role="tab" aria-selected={filter === "unanswered"} className={`${styles.filterTab} ${filter === "unanswered" ? styles.filterTabActive : ""}`}>
                Unanswered ({counts.unanswered})
              </Link>
              <Link href="/app/inbox?filter=hidden" role="tab" aria-selected={filter === "hidden"} className={`${styles.filterTab} ${filter === "hidden" ? styles.filterTabActive : ""}`}>
                Hidden ({counts.hidden})
              </Link>
            </div>
            {groups.length === 0 ? (
              <p className={`${ui.notice} mt-4`}>
                {filter === "hidden"
                  ? "No hidden comments. Use Hide on a comment to park it out of the way."
                  : "Nothing unanswered — every comment is answered or hidden."}
              </p>
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
          <input type="hidden" name="filter" value={filter} />
          <button type="submit" disabled={c.liked} className={styles.actionBtn} aria-label={c.liked ? `Comment by ${who} is liked` : `Like the comment by ${who}`}>
            <Heart width={14} height={14} aria-hidden="true" />
            {c.liked ? "Liked" : "Like"}
          </button>
        </form>
        <form action={toggleDoneAction}>
          <input type="hidden" name="account_id" value={c.accountId} />
          <input type="hidden" name="comment_id" value={c.commentId} />
          <input type="hidden" name="filter" value={filter} />
          <button type="submit" className={styles.actionBtn} aria-pressed={c.done} aria-label={c.done ? `Reopen the comment by ${who}` : `Mark the comment by ${who} done`}>
            <Check width={14} height={14} aria-hidden="true" />
            {c.done ? "Done" : "Mark done"}
          </button>
        </form>
        <form action={hideCommentAction}>
          <input type="hidden" name="account_id" value={c.accountId} />
          <input type="hidden" name="comment_id" value={c.commentId} />
          <input type="hidden" name="filter" value={filter} />
          <button type="submit" className={styles.actionBtn} aria-pressed={c.hidden} aria-label={c.hidden ? `Show the comment by ${who} again` : `Hide the comment by ${who}`}>
            <EyeOff width={14} height={14} aria-hidden="true" />
            {c.hidden ? "Show" : "Hide"}
          </button>
        </form>
      </div>
      <details className="mt-3">
        <summary className={styles.replyToggle}>Reply</summary>
        <form action={replyToCommentAction} className="mt-2 flex flex-wrap gap-2">
          <input type="hidden" name="account_id" value={c.accountId} />
          <input type="hidden" name="comment_id" value={c.commentId} />
          <label className="sr-only" htmlFor={`pub-${c.commentId}`}>Public reply</label>
          <input id={`pub-${c.commentId}`} name="message" required maxLength={2200} placeholder="Reply publicly under the comment…" className={ui.input} />
          <ReplySubmitButton label="Post reply" />
        </form>
        {canPrivate ? (
          <form action={privateReplyAction} className="mt-2 flex flex-wrap gap-2">
            <input type="hidden" name="account_id" value={c.accountId} />
            <input type="hidden" name="comment_id" value={c.commentId} />
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
