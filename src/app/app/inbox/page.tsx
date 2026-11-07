import Link from "next/link";
import { Inbox, MessageCircle, MessagesSquare } from "lucide-react";
import LocalTime from "@/components/LocalTime";
import { requireUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { DM_WINDOW_MS, PRIVATE_REPLY_WINDOW_MS, loadInbox, withinWindow, type Thread } from "@/lib/inbox";
import { BtnLink, PageHero } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import EmptyState from "../EmptyState";
import { privateReplyAction, replyToCommentAction } from "./actions";
import ReplySubmitButton from "./ReplySubmitButton";
import ThreadReplyComposer from "./ThreadReplyComposer";
import styles from "./inbox.module.css";

export const metadata = { title: "Inbox" };

const OK_TEXT: Record<string, string> = {
  comment: "Reply posted under the comment.",
  private: "Private reply sent.",
  dm: "Message sent.",
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
  searchParams: Promise<{ tab?: string | string[]; thread?: string | string[]; ok?: string | string[]; error?: string | string[] }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const threadKey = one(sp.thread);
  const tab = threadKey ? "messages" : one(sp.tab) === "messages" ? "messages" : "comments";
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
  const usernames = new Map(data.accounts.map((a) => [a.id, a.username]));
  const openThread: Thread | undefined = data.threads.find((t) => `${t.accountId}:${t.senderId}` === threadKey);

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
          <ul className="mt-6 grid gap-4">
            {data.comments.map((c) => {
              const canPrivate = !c.dmStatus && withinWindow(c.receivedAt, PRIVATE_REPLY_WINDOW_MS);
              return (
                <li key={c.commentId} className={styles.commentCard}>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-semibold text-[var(--poskoo-ink)]">@{c.fromUsername ?? "instagram user"}</span>
                    <span className={styles.meta}>
                      on @{usernames.get(c.accountId) ?? "your account"} · <LocalTime value={c.receivedAt} style="medium" />
                    </span>
                  </div>
                  <p className={styles.commentText}>{c.text}</p>
                  <p className={`mt-2 flex flex-wrap items-center gap-2 text-xs ${styles.meta}`}>
                    <span className={statusPillClass(c.dmStatus)}>
                      {c.dmStatus
                        ? STATUS_TEXT[c.dmStatus] ?? `Auto-DM ${c.dmStatus}`
                        : "No auto-DM rule matched"}
                    </span>
                    <Link href="/app/auto-dm" className={ui.link}>Comment rules</Link>
                  </p>
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
            })}
          </ul>
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
