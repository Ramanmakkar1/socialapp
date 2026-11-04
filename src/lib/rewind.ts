import { decryptToken } from "@/lib/crypto";
import { processCommentEvents, type CommentEvent } from "@/lib/comments";
import { query } from "@/lib/db";

const GRAPH_BASE = "https://graph.instagram.com/v21.0";
const FETCH_TIMEOUT_MS = 15_000;
const MEDIA_LIMIT = 25;
const COMMENTS_LIMIT = 50;
const WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

type RuleRow = {
  id: string;
  social_account_id: string | null;
};

type AccountRow = {
  id: string;
  external_id: string;
  access_token_enc: string | null;
};

type GraphMediaList = {
  data?: { id?: string; timestamp?: string }[];
};

type GraphCommentList = {
  data?: {
    id?: string;
    text?: string;
    timestamp?: string;
    from?: { id?: string; username?: string };
  }[];
};

function isWithinWindow(isoTimestamp: string | undefined, sinceMs: number): boolean {
  if (!isoTimestamp) return false;
  const t = Date.parse(isoTimestamp);
  if (Number.isNaN(t)) return false;
  return t >= sinceMs;
}

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  const text = await res.text().catch(() => "");
  if (!res.ok) {
    throw new Error(text.slice(0, 200) || `Graph API ${res.status}`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error("Invalid Graph API response");
  }
}

async function collectCommentsForAccount(
  externalId: string,
  token: string,
  sinceMs: number,
): Promise<CommentEvent[]> {
  const events: CommentEvent[] = [];
  const mediaUrl = `${GRAPH_BASE}/${encodeURIComponent(externalId)}/media?fields=id,timestamp&limit=${MEDIA_LIMIT}`;
  let mediaBody: GraphMediaList;
  try {
    mediaBody = await fetchJson<GraphMediaList>(mediaUrl, token);
  } catch {
    return events;
  }
  const mediaItems = (mediaBody.data ?? []).filter((m) => m.id && isWithinWindow(m.timestamp, sinceMs));
  const mediaSlice = mediaItems.slice(0, MEDIA_LIMIT);

  for (const media of mediaSlice) {
    const mediaId = media.id as string;
    const commentsUrl = `${GRAPH_BASE}/${encodeURIComponent(mediaId)}/comments?fields=id,text,timestamp,from&limit=${COMMENTS_LIMIT}`;
    try {
      const commentsBody = await fetchJson<GraphCommentList>(commentsUrl, token);
      for (const c of commentsBody.data ?? []) {
        if (!c.id || !c.from?.id) continue;
        if (!isWithinWindow(c.timestamp, sinceMs)) continue;
        events.push({
          accountExternalId: externalId,
          commentId: String(c.id),
          text: c.text ?? "",
          fromId: String(c.from.id),
          fromUsername: c.from.username ?? null,
          mediaId,
        });
      }
    } catch {
      continue;
    }
  }
  return events;
}

export async function rewindRule(
  userId: string,
  ruleId: string,
): Promise<{ queued: number; scanned: number }> {
  const rules = await query<RuleRow>(
    "select id, social_account_id from socialapp.dm_rules where id=$1 and user_id=$2 and status='active'",
    [ruleId, userId],
  );
  if (!rules[0]) {
    throw new Error("Rule not found or paused");
  }
  const rule = rules[0];

  let accountSql =
    "select id, external_id, access_token_enc from socialapp.social_accounts where user_id=$1 and platform='instagram' and status='active'";
  const accountParams: string[] = [userId];
  if (rule.social_account_id) {
    accountSql += " and id=$2";
    accountParams.push(rule.social_account_id);
  }
  const accounts = await query<AccountRow>(accountSql, accountParams);

  const sinceMs = Date.now() - WINDOW_MS;
  const allEvents: CommentEvent[] = [];

  for (const account of accounts) {
    if (!account.access_token_enc) {
      continue;
    }
    let token: string;
    try {
      token = decryptToken(account.access_token_enc);
    } catch {
      continue;
    }
    const events = await collectCommentsForAccount(account.external_id, token, sinceMs);
    allEvents.push(...events);
  }

  const queued = await processCommentEvents(allEvents);
  return { queued, scanned: allEvents.length };
}
