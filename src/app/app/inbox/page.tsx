import Link from "next/link";
import { Inbox, MessageCircle, MessagesSquare } from "lucide-react";
import LocalTime from "@/components/LocalTime";
import { requireUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { DM_WINDOW_MS, PRIVATE_REPLY_WINDOW_MS, loadInbox, withinWindow, type Thread } from "@/lib/inbox";
import { privateReplyAction, replyToCommentAction } from "./actions";
import ReplySubmitButton from "./ReplySubmitButton";
import ThreadReplyComposer from "./ThreadReplyComposer";

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

const inputCls =
  "min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none";

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
      <div>
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <p className="text-sm text-muted">Comments on your posts and Instagram DMs, in one place. Auto-DM rules answer most of them for you.</p>
      </div>
      {ok && <p className="mt-4 rounded-xl border border-ok px-4 py-2 text-sm text-ok">{ok}</p>}
      {error && <p className="mt-4 rounded-xl border border-warn px-4 py-2 text-sm text-warn">{error}</p>}
      {loadFailed ? (
        <p className="mt-4 rounded-xl border border-warn px-4 py-2 text-sm text-warn">
          We couldn&apos;t load your inbox right now.{" "}
          <Link href={inboxRetryHref(tab, threadKey)} className="font-medium text-brand hover:underline">
            Retry
          </Link>
        </p>
      ) : (
        <>
      <div className="mt-6 flex gap-2 text-sm" role="tablist">
        <Link href="/app/inbox" role="tab" aria-selected={tab === "comments"} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${tab === "comments" ? "border-brand font-medium text-brand" : "border-line text-ink-2"}`}>
          <MessageCircle className="h-4 w-4" /> Comments ({data.comments.length})
        </Link>
        <Link href="/app/inbox?tab=messages" role="tab" aria-selected={tab === "messages"} className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 ${tab === "messages" ? "border-brand font-medium text-brand" : "border-line text-ink-2"}`}>
          <MessagesSquare className="h-4 w-4" /> Messages ({data.threads.length})
        </Link>
      </div>

      {data.accounts.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-surface p-10 text-center">
          <Inbox className="mx-auto h-8 w-8 text-brand" />
          <h2 className="mt-3 font-semibold">Connect Instagram to see comments and DMs</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-ink-2">New comments and messages show up here as soon as they arrive.</p>
          <Link href="/app/settings" className="btn-primary mt-4 inline-block">Connect Instagram</Link>
        </div>
      ) : tab === "comments" ? (
        data.comments.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No comments in the last 30 days yet. They appear here as soon as someone comments on your posts.</p>
        ) : (
          <ul className="mt-6 space-y-3">
            {data.comments.map((c) => {
              const canPrivate = !c.dmStatus && withinWindow(c.receivedAt, PRIVATE_REPLY_WINDOW_MS);
              return (
                <li key={c.commentId} className="rounded-2xl border border-line bg-surface p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium">@{c.fromUsername ?? "instagram user"}</span>
                    <span className="text-muted">on @{usernames.get(c.accountId) ?? "your account"} · <LocalTime value={c.receivedAt} style="medium" /></span>
                  </div>
                  <p className="mt-2 break-words text-ink">{c.text}</p>
                  <p className="mt-2 text-xs text-muted">
                    {c.dmStatus === "sent" ? "Private reply sent" : c.dmStatus === "pending" ? "Auto-DM queued" : c.dmStatus ? `Auto-DM ${c.dmStatus}` : "No auto-DM rule matched"}
                    {" · "}
                    <Link href="/app/auto-dm" className="text-brand hover:underline">Comment rules</Link>
                  </p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-brand">Reply</summary>
                    <form action={replyToCommentAction} className="mt-2 flex flex-wrap gap-2">
                      <input type="hidden" name="account_id" value={c.accountId} />
                      <input type="hidden" name="comment_id" value={c.commentId} />
                      <label className="sr-only" htmlFor={`pub-${c.commentId}`}>Public reply</label>
                      <input id={`pub-${c.commentId}`} name="message" required maxLength={2200} placeholder="Reply publicly under the comment…" className={inputCls} />
                      <ReplySubmitButton label="Post reply" />
                    </form>
                    {canPrivate ? (
                      <form action={privateReplyAction} className="mt-2 flex flex-wrap gap-2">
                        <input type="hidden" name="account_id" value={c.accountId} />
                        <input type="hidden" name="comment_id" value={c.commentId} />
                        <label className="sr-only" htmlFor={`dm-${c.commentId}`}>Private reply</label>
                        <input id={`dm-${c.commentId}`} name="message" required maxLength={1000} placeholder="Send one private DM reply…" className={inputCls} />
                        <ReplySubmitButton label="Send DM" />
                      </form>
                    ) : (
                      <p className="mt-2 text-xs text-muted">Private DM reply: Instagram allows one per comment, within 7 days.</p>
                    )}
                  </details>
                </li>
              );
            })}
          </ul>
        )
      ) : openThread ? (
        <div className="mt-6 rounded-2xl border border-line bg-surface p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">@{openThread.username ?? "instagram user"}</h2>
            <Link href="/app/inbox?tab=messages" className="text-sm text-brand hover:underline">All messages</Link>
          </div>
          <ul className="mt-4 space-y-2">
            {openThread.messages.map((m, i) => (
              <li key={i} className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.direction === "out" ? "bg-brand text-white" : "bg-surface-2 text-ink"}`}>
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`mt-1 text-[11px] ${m.direction === "out" ? "text-white/80" : "text-muted"}`}><LocalTime value={m.at} style="medium" /></p>
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
            <p className="mt-4 text-sm text-muted">Instagram only allows replies within 24 hours of this person&apos;s last message. You can reply again once they message you.</p>
          )}
        </div>
      ) : data.threads.length === 0 ? (
        <p className="mt-6 text-sm text-muted">No DMs in the last 30 days yet. Messages people send your Instagram account show up here.</p>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface">
          {data.threads.map((t) => (
            <li key={`${t.accountId}:${t.senderId}`}>
              <Link href={`/app/inbox?thread=${encodeURIComponent(`${t.accountId}:${t.senderId}`)}`} className="flex items-center justify-between gap-3 p-4 hover:bg-surface-2">
                <div className="min-w-0">
                  <p className="font-medium">@{t.username ?? "instagram user"}</p>
                  <p className="truncate text-sm text-muted">{t.lastText}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-muted">
                  <p><LocalTime value={t.lastAt} style="medium" /></p>
                  {withinWindow(t.lastInboundAt, DM_WINDOW_MS) && <p className="text-ok">Can reply</p>}
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
