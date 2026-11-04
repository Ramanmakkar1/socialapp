// Server only: comment list + DM threads built from stored Meta webhook events and sent DMs.
import { extractCommentEvents } from "@/lib/comments";
import { query } from "@/lib/db";
import { extractMessageEvents } from "@/lib/messageParse";
import { COMMENT_REPLY_WINDOW_MS, DM_WINDOW_MS } from "@/lib/sendPolicy";

// Instagram allows a normal DM reply only within 24 h of the person's last message,
// and one private reply to a comment within 7 days of the comment.
export { DM_WINDOW_MS };
export const PRIVATE_REPLY_WINDOW_MS = COMMENT_REPLY_WINDOW_MS;

export function withinWindow(lastInbound: Date | string | null | undefined, windowMs: number, now = Date.now()): boolean {
  if (!lastInbound) return false;
  const t = new Date(lastInbound).getTime();
  return Number.isFinite(t) && now - t >= -60_000 && now - t < windowMs;
}

export type InboxAccount = { id: string; external_id: string; username: string | null };

export type InboxComment = {
  accountId: string;
  commentId: string;
  text: string;
  fromId: string;
  fromUsername: string | null;
  mediaId: string | null;
  receivedAt: Date;
  dmStatus: string | null;
};

export type ThreadMessage = { direction: "in" | "out"; text: string; at: Date };

export type Thread = {
  accountId: string;
  senderId: string;
  username: string | null;
  lastInboundAt: Date | null;
  lastAt: Date;
  lastText: string;
  messages: ThreadMessage[];
};

type EventRow = { payload: unknown; received_at: Date };

async function recentEvents(externalIds: string[]): Promise<EventRow[]> {
  if (externalIds.length === 0) return [];
  return query<EventRow>(
    `select payload, received_at from socialapp.events
     where source='meta' and received_at > now() - interval '30 days'
       and exists (select 1 from jsonb_array_elements(case when jsonb_typeof(payload->'entry')='array' then payload->'entry' else '[]'::jsonb end) e where e->>'id' = any($1::text[]))
     order by received_at desc
     limit 500`,
    [externalIds]
  );
}

export async function instagramAccounts(userId: string): Promise<InboxAccount[]> {
  return query<InboxAccount>(
    "select id, external_id, username from socialapp.social_accounts where user_id=$1 and platform='instagram' and status in ('active','expired') order by created_at",
    [userId]
  );
}

export async function loadInbox(userId: string): Promise<{ accounts: InboxAccount[]; comments: InboxComment[]; threads: Thread[] }> {
  const accounts = await instagramAccounts(userId);
  const byExternal = new Map(accounts.map((a) => [a.external_id, a]));
  const events = await recentEvents(accounts.map((a) => a.external_id));

  const comments: InboxComment[] = [];
  const seenComments = new Set<string>();
  const seenMessages = new Set<string>();
  const threads = new Map<string, Thread>();
  const threadKey = (accountId: string, senderId: string) => `${accountId}:${senderId}`;

  for (const ev of events) {
    for (const c of extractCommentEvents(ev.payload)) {
      const acc = byExternal.get(c.accountExternalId);
      if (!acc || c.fromId === acc.external_id || seenComments.has(c.commentId)) continue;
      seenComments.add(c.commentId);
      comments.push({ ...c, accountId: acc.id, receivedAt: ev.received_at, dmStatus: null });
    }
  }
  for (const ev of [...events].reverse()) {
    for (const m of extractMessageEvents(ev.payload)) {
      const acc = byExternal.get(m.accountExternalId);
      if (!acc) continue;
      if (m.mid !== null) {
        const messageKey = JSON.stringify([acc.id, m.senderId, m.mid]);
        if (seenMessages.has(messageKey)) continue;
        seenMessages.add(messageKey);
      }
      const key = threadKey(acc.id, m.senderId);
      let t = threads.get(key);
      if (!t) {
        t = { accountId: acc.id, senderId: m.senderId, username: null, lastInboundAt: null, lastAt: ev.received_at, lastText: m.text, messages: [] };
        threads.set(key, t);
      }
      t.messages.push({ direction: "in", text: m.text, at: ev.received_at });
      if (!t.lastInboundAt || ev.received_at > t.lastInboundAt) t.lastInboundAt = ev.received_at;
    }
  }

  const accountIds = accounts.map((a) => a.id);
  if (accountIds.length > 0) {
    const sent = await query<{ social_account_id: string; recipient_external_id: string; comment_id: string | null; message: string; status: string; sent_at: Date | null; created_at: Date }>(
      `select social_account_id, recipient_external_id, comment_id, message, status, sent_at, created_at from socialapp.dm_queue
       where user_id=$1 and social_account_id = any($2::uuid[]) and created_at > now() - interval '30 days'
       order by created_at desc limit 500`,
      [userId, accountIds]
    );
    const dmByComment = new Map<string, string>();
    for (const s of sent) {
      if (s.comment_id) dmByComment.set(s.comment_id, s.status);
      if (s.status !== "sent") continue;
      const key = threadKey(s.social_account_id, s.recipient_external_id);
      const at = s.sent_at ?? s.created_at;
      let t = threads.get(key);
      if (!t) {
        t = { accountId: s.social_account_id, senderId: s.recipient_external_id, username: null, lastInboundAt: null, lastAt: at, lastText: s.message, messages: [] };
        threads.set(key, t);
      }
      t.messages.push({ direction: "out", text: s.message, at });
    }
    for (const c of comments) c.dmStatus = dmByComment.get(c.commentId) ?? null;

    const senderIds = [...new Set([...threads.values()].map((t) => t.senderId))];
    if (senderIds.length > 0) {
      const contacts = await query<{ external_id: string; username: string | null }>(
        "select external_id, username from socialapp.contacts where user_id=$1 and platform='instagram' and external_id = any($2::text[])",
        [userId, senderIds]
      );
      const names = new Map(contacts.map((c) => [c.external_id, c.username]));
      for (const t of threads.values()) t.username = names.get(t.senderId) ?? null;
    }
  }

  const threadList = [...threads.values()].map((t) => {
    t.messages.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    const last = t.messages[t.messages.length - 1];
    return { ...t, lastAt: last?.at ?? t.lastAt, lastText: last?.text ?? t.lastText };
  });
  threadList.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());
  return { accounts, comments: comments.slice(0, 100), threads: threadList };
}

// Time of the latest message this person sent to the account (for the 24-hour rule).
export async function lastInboundMessageAt(accountExternalId: string, senderId: string): Promise<Date | null> {
  const rows = await query<{ received_at: Date }>(
    `select received_at from socialapp.events
     where source='meta' and received_at > now() - interval '2 days'
       and exists (
         select 1 from jsonb_array_elements(case when jsonb_typeof(payload->'entry')='array' then payload->'entry' else '[]'::jsonb end) e,
           jsonb_array_elements(case when jsonb_typeof(e->'messaging')='array' then e->'messaging' else '[]'::jsonb end) m
         where e->>'id' = $1 and m->'sender'->>'id' = $2 and m ? 'message' and coalesce((m->'message'->>'is_echo')::boolean, false) = false
       )
     order by received_at desc limit 1`,
    [accountExternalId, senderId]
  );
  return rows[0]?.received_at ?? null;
}

// Time the comment webhook arrived (for the 7-day private-reply rule), plus the commenter's id.
export async function commentReceivedAt(accountExternalId: string, commentId: string): Promise<{ at: Date; fromId: string } | null> {
  const rows = await query<{ payload: unknown; received_at: Date }>(
    `select payload, received_at from socialapp.events
     where source='meta' and received_at > now() - interval '8 days'
       and exists (
         select 1 from jsonb_array_elements(case when jsonb_typeof(payload->'entry')='array' then payload->'entry' else '[]'::jsonb end) e,
           jsonb_array_elements(case when jsonb_typeof(e->'changes')='array' then e->'changes' else '[]'::jsonb end) c
         where e->>'id' = $1 and c->>'field' = 'comments' and c->'value'->>'id' = $2
       )
     order by received_at asc limit 1`,
    [accountExternalId, commentId]
  );
  const row = rows[0];
  if (!row) return null;
  const hit = extractCommentEvents(row.payload).find((c) => c.commentId === commentId);
  return hit ? { at: row.received_at, fromId: hit.fromId } : null;
}
