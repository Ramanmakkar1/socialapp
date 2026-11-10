// Server only: comment list + DM threads built from stored Meta webhook events and sent DMs.
import { extractCommentEvents } from "@/lib/comments";
import { query } from "@/lib/db";
import { extractTimedMessageEvents } from "@/lib/inboxTime";
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
  hidden: boolean;
  done: boolean;
  liked: boolean;
};

export type ThreadMessage = { direction: "in" | "out"; text: string; at: Date; ai?: boolean };

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
      comments.push({ ...c, accountId: acc.id, receivedAt: ev.received_at, dmStatus: null, hidden: false, done: false, liked: false });
    }
  }
  for (const ev of [...events].reverse()) {
    for (const m of extractTimedMessageEvents(ev.payload, ev.received_at)) {
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
      t.messages.push({ direction: "in", text: m.text, at: m.eventAt ?? ev.received_at });
      if (m.eventAt && (!t.lastInboundAt || m.eventAt > t.lastInboundAt)) t.lastInboundAt = m.eventAt;
    }
  }

  const accountIds = accounts.map((a) => a.id);
  if (accountIds.length > 0) {
    const sent = await query<{ social_account_id: string; recipient_external_id: string; comment_id: string | null; message: string; status: string; sent_at: Date | null; created_at: Date; kind: string }>(
      `select social_account_id, recipient_external_id, comment_id, message, status, sent_at, created_at, kind from socialapp.dm_queue
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
      t.messages.push({ direction: "out", text: s.message, at, ai: s.kind === "ai_reply" });
    }
    for (const c of comments) c.dmStatus = dmByComment.get(c.commentId) ?? null;

    try {
      const statusRows = await query<{ comment_id: string; hidden: boolean; done: boolean; liked: boolean }>(
        "select comment_id, hidden, done, liked from socialapp.comment_status where user_id=$1",
        [userId]
      );
      const statusByComment = new Map(statusRows.map((s) => [s.comment_id, s]));
      for (const c of comments) {
        const s = statusByComment.get(c.commentId);
        if (s) {
          c.hidden = s.hidden;
          c.done = s.done;
          c.liked = s.liked;
        }
      }
    } catch {
      // comment_status table missing (migration not applied yet): all comments stay visible and open.
    }

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

// Inbox filters: "all" hides hidden comments, "unanswered" keeps only open ones, "hidden" shows only hidden.
export type InboxFilter = "all" | "unanswered" | "hidden";

export function filterComments(comments: InboxComment[], filter: InboxFilter): InboxComment[] {
  if (filter === "hidden") return comments.filter((c) => c.hidden);
  if (filter === "unanswered") return comments.filter((c) => !c.hidden && !c.done);
  return comments.filter((c) => !c.hidden);
}

// Unanswered (not done, not hidden) first, then newest first.
export function sortInboxComments(a: InboxComment, b: InboxComment): number {
  const aOpen = a.done || a.hidden ? 1 : 0;
  const bOpen = b.done || b.hidden ? 1 : 0;
  if (aOpen !== bOpen) return aOpen - bOpen;
  return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
}

export type PostGroup = {
  mediaId: string | null;
  accountId: string;
  username: string | null;
  latestAt: Date;
  unanswered: number;
  comments: InboxComment[];
};

// Group comments by the post they belong to; posts with unanswered comments first, then newest first.
export function groupCommentsByPost(comments: InboxComment[], accounts: InboxAccount[]): PostGroup[] {
  const byAccount = new Map(accounts.map((a) => [a.id, a]));
  const groups = new Map<string, PostGroup>();
  for (const c of comments) {
    const key = `${c.accountId}:${c.mediaId ?? "none"}`;
    let g = groups.get(key);
    if (!g) {
      g = {
        mediaId: c.mediaId,
        accountId: c.accountId,
        username: byAccount.get(c.accountId)?.username ?? null,
        latestAt: c.receivedAt,
        unanswered: 0,
        comments: [],
      };
      groups.set(key, g);
    }
    g.comments.push(c);
    if (new Date(c.receivedAt).getTime() > new Date(g.latestAt).getTime()) g.latestAt = c.receivedAt;
    if (!c.done && !c.hidden) g.unanswered += 1;
  }
  const list = [...groups.values()];
  for (const g of list) g.comments.sort(sortInboxComments);
  list.sort(
    (a, b) =>
      b.unanswered - a.unanswered ||
      new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime()
  );
  return list;
}

// Inbox status writes (migration 028).
async function upsertCommentStatus(
  userId: string,
  accountId: string,
  commentId: string,
  setClause: string,
  params: unknown[]
): Promise<void> {
  await query(
    `insert into socialapp.comment_status (user_id, social_account_id, comment_id)
     values ($1,$2,$3)
     on conflict (user_id, comment_id) do update set ${setClause}, updated_at=now()`,
    [userId, accountId, commentId, ...params]
  );
}

export async function toggleCommentHidden(userId: string, accountId: string, commentId: string): Promise<void> {
  await upsertCommentStatus(userId, accountId, commentId, "hidden = not socialapp.comment_status.hidden", []);
}

export async function toggleCommentDone(userId: string, accountId: string, commentId: string): Promise<void> {
  await upsertCommentStatus(userId, accountId, commentId, "done = not socialapp.comment_status.done", []);
}

export async function markCommentDone(userId: string, accountId: string, commentId: string): Promise<void> {
  await upsertCommentStatus(userId, accountId, commentId, "done = true", []);
}

export async function markCommentLiked(userId: string, accountId: string, commentId: string): Promise<void> {
  await upsertCommentStatus(userId, accountId, commentId, "liked = true", []);
}

// Time of the latest message this person sent to the account (for the 24-hour rule).
export async function lastInboundMessageAt(accountExternalId: string, senderId: string): Promise<Date | null> {
  const rows = await query<EventRow>(
    `select payload, received_at from socialapp.events
     where source='meta' and received_at > now() - interval '2 days'
       and exists (
         select 1 from jsonb_array_elements(case when jsonb_typeof(payload->'entry')='array' then payload->'entry' else '[]'::jsonb end) e,
           jsonb_array_elements(case when jsonb_typeof(e->'messaging')='array' then e->'messaging' else '[]'::jsonb end) m
         where e->>'id' = $1 and m->'sender'->>'id' = $2 and m ? 'message'
       )
     order by received_at asc`,
    [accountExternalId, senderId]
  );
  let latest: Date | null = null;
  for (const row of rows) {
    for (const m of extractTimedMessageEvents(row.payload, row.received_at)) {
      if (m.accountExternalId !== accountExternalId || m.senderId !== senderId) continue;
      if (m.eventAt && (!latest || m.eventAt > latest)) latest = m.eventAt;
    }
  }
  return latest;
}

// The person's earlier messages to this account (for AI reply context), oldest first.
export async function recentInboundMessages(
  accountExternalId: string,
  senderId: string,
  limit = 10
): Promise<{ text: string; at: Date; mid: string | null }[]> {
  const rows = await query<EventRow>(
    `select payload, received_at from socialapp.events
     where source='meta' and received_at > now() - interval '2 days'
       and exists (
         select 1 from jsonb_array_elements(case when jsonb_typeof(payload->'entry')='array' then payload->'entry' else '[]'::jsonb end) e,
           jsonb_array_elements(case when jsonb_typeof(e->'messaging')='array' then e->'messaging' else '[]'::jsonb end) m
         where e->>'id' = $1 and m->'sender'->>'id' = $2 and m ? 'message'
       )
     order by received_at desc limit 50`,
    [accountExternalId, senderId]
  );
  const out: { text: string; at: Date; mid: string | null }[] = [];
  const seenMids = new Set<string>();
  for (const row of rows) {
    for (const m of extractTimedMessageEvents(row.payload, row.received_at)) {
      if (m.accountExternalId !== accountExternalId || m.senderId !== senderId) continue;
      if (!m.text.trim()) continue;
      if (m.mid !== null) {
        if (seenMids.has(m.mid)) continue;
        seenMids.add(m.mid);
      }
      out.push({ text: m.text, at: m.eventAt ?? row.received_at, mid: m.mid });
    }
  }
  out.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  return out.slice(-limit);
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
