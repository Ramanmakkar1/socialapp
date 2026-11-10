"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { GraphError, graphCall, likeComment, replyToCommentPublicly, sendDirectMessage, userAccount } from "@/lib/igGraph";
import { guardedDmSend } from "@/lib/dmCooldown";
import {
  DM_WINDOW_MS,
  PRIVATE_REPLY_WINDOW_MS,
  commentReceivedAt,
  lastInboundMessageAt,
  markCommentDone,
  markCommentLiked,
  toggleCommentDone,
  toggleCommentHidden,
  withinWindow,
} from "@/lib/inbox";

function field(formData: FormData, key: string, max = 1000): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

function back(params: Record<string, string>): never {
  redirect(`/app/inbox?${new URLSearchParams(params).toString()}`);
}

function failMessage(err: unknown): string {
  if (err instanceof GraphError) return err.message;
  return "Instagram didn't accept the reply. Please try again.";
}

// Public reply under a comment (instagram_business_manage_comments).
export async function replyToCommentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const accountId = field(formData, "account_id", 64);
  const commentId = field(formData, "comment_id", 64);
  const message = field(formData, "message", 2200);
  if (!isDbConfigured() || !accountId || !commentId || !message) back({ error: "Write a reply first." });
  const account = await userAccount(user.id, accountId);
  if (!account) back({ error: "Reconnect Instagram in Settings to reply." });
  const comment = await commentReceivedAt(account.external_id, commentId);
  if (!comment) back({ error: "We couldn't find that comment." });
  let error = "";
  try {
    await replyToCommentPublicly(account, commentId, message);
  } catch (err) {
    error = failMessage(err);
  }
  if (!error) {
    try {
      // A public reply answers the comment: it leaves the "unanswered" list.
      await markCommentDone(user.id, account.id, commentId);
    } catch (err) {
      console.error("replyToCommentAction: reply sent but not marked done", commentId, err instanceof Error ? err.message : err);
    }
  }
  back(error ? { error } : { ok: "comment" });
}

// One private DM reply to a comment (allowed within 7 days of the comment).
export async function privateReplyAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const accountId = field(formData, "account_id", 64);
  const commentId = field(formData, "comment_id", 64);
  const message = field(formData, "message", 1000);
  if (!isDbConfigured() || !accountId || !commentId || !message) back({ error: "Write a message first." });
  const account = await userAccount(user.id, accountId);
  if (!account) back({ error: "Reconnect Instagram in Settings to send DMs." });
  const comment = await commentReceivedAt(account.external_id, commentId);
  if (!comment || !withinWindow(comment.at, PRIVATE_REPLY_WINDOW_MS)) {
    back({ error: "Instagram only allows a private reply within 7 days of the comment." });
  }
  // Claim the comment first so an auto-DM and a manual reply can never both go out.
  const claimed = await query<{ id: string }>(
    `insert into socialapp.dm_queue (user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message, status, kind)
     values ($1,$2,null,null,$3,$4,$5,'skipped','manual_reply') on conflict (comment_id) do nothing returning id`,
    [user.id, account.id, commentId, comment.fromId, message]
  );
  const rowId = claimed[0]?.id;
  if (!rowId) back({ error: "This comment already got a private reply." });
  const sent = await guardedDmSend(account, async () => {
    await graphCall(account, `${encodeURIComponent(account.external_id)}/messages`, {
      method: "POST",
      body: { recipient: { comment_id: commentId }, message: { text: message } },
    });
  });
  try {
    if (sent.ok) {
      await query("update socialapp.dm_queue set status='sent', sent_at=now(), attempts=1 where id=$1", [rowId]);
      await markCommentDone(user.id, account.id, commentId);
    } else if (sent.rateLimited) {
      // Not sent: release the claim so the private reply can be tried again after the cooldown.
      await query("delete from socialapp.dm_queue where id=$1 and status='skipped' and kind='manual_reply'", [rowId]);
    } else {
      await query("update socialapp.dm_queue set status='failed', attempts=1, last_error=$2 where id=$1", [rowId, sent.error]);
    }
  } catch (err) {
    console.error("privateReplyAction: could not record reply", rowId, err instanceof Error ? err.message : err);
  }
  back(sent.ok ? { ok: "private" } : { error: sent.error });
}

// Reply inside a DM thread (instagram_business_manage_messages), only within 24 h of their last message.
export async function replyInThreadAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const accountId = field(formData, "account_id", 64);
  const senderId = field(formData, "sender_id", 64);
  const message = field(formData, "message", 1000);
  const thread = `${accountId}:${senderId}`;
  if (!isDbConfigured() || !accountId || !senderId || !message) back({ thread, error: "Write a message first." });
  const account = await userAccount(user.id, accountId);
  if (!account) back({ thread, error: "Reconnect Instagram in Settings to send DMs." });
  const last = await lastInboundMessageAt(account.external_id, senderId);
  if (!withinWindow(last, DM_WINDOW_MS)) {
    back({ thread, error: "Instagram only allows replies within 24 hours of this person's last message." });
  }
  const sent = await guardedDmSend(account, () => sendDirectMessage(account, senderId, message));
  if (!sent.ok) back({ thread, error: sent.error });
  try {
    // Recording is separate from sending: a DB hiccup must not tell the user an already-sent DM failed.
    await query(
      `insert into socialapp.dm_queue (user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message, status, kind, attempts, sent_at)
       values ($1,$2,null,null,null,$3,$4,'sent','manual_reply',1,now())`,
      [user.id, account.id, senderId, message]
    );
  } catch (err) {
    console.error("replyInThreadAction: sent but not recorded, account", account.id, err instanceof Error ? err.message : err);
  }
  back({ thread, ok: "dm" });
}

// Hide / unhide a comment in the inbox (local only; Instagram has no hide-comment endpoint).
export async function hideCommentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const accountId = field(formData, "account_id", 64);
  const commentId = field(formData, "comment_id", 64);
  if (!isDbConfigured() || !accountId || !commentId) back({ error: "We couldn't find that comment." });
  try {
    await toggleCommentHidden(user.id, accountId, commentId);
  } catch {
    back({ error: "We couldn't update the comment. Please try again." });
  }
  back({ filter: field(formData, "filter", 16) });
}

// Like the comment on Instagram (instagram_business_manage_comments, the same permission as replies).
export async function likeCommentAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const accountId = field(formData, "account_id", 64);
  const commentId = field(formData, "comment_id", 64);
  if (!isDbConfigured() || !accountId || !commentId) back({ error: "We couldn't find that comment." });
  const account = await userAccount(user.id, accountId);
  if (!account) back({ error: "Reconnect Instagram in Settings to like comments." });
  let error = "";
  try {
    await likeComment(account, commentId);
    await markCommentLiked(user.id, account.id, commentId);
  } catch (err) {
    error = failMessage(err);
  }
  const filter = field(formData, "filter", 16);
  back(error ? { filter, error } : { filter, ok: "liked" });
}

// Mark a comment done (answered) / reopen it.
export async function toggleDoneAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const accountId = field(formData, "account_id", 64);
  const commentId = field(formData, "comment_id", 64);
  if (!isDbConfigured() || !accountId || !commentId) back({ error: "We couldn't find that comment." });
  try {
    await toggleCommentDone(user.id, accountId, commentId);
  } catch {
    back({ error: "We couldn't update the comment. Please try again." });
  }
  back({ filter: field(formData, "filter", 16) });
}
