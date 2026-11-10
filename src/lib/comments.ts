import { buildCommentDmMessage } from "@/lib/commentMessage";
import { query } from "@/lib/db";
import { shortLinkFor } from "@/lib/links";
import { matchComment, type MatchableRule } from "@/lib/match";
import { isMissingColumnError, ruleMatchesMedia } from "@/lib/ruleMedia";

export type CommentEvent = {
  accountExternalId: string;
  commentId: string;
  text: string;
  fromId: string;
  fromUsername: string | null;
  mediaId: string | null;
  /** When the person wrote the comment (ISO). Replayed comments keep their original time (bug j). */
  createdAt?: string | null;
};

/** ISO time from a Graph/webhook timestamp: ISO string, or unix seconds / milliseconds. */
export function commentTime(raw: unknown): string | null {
  let ms: number | null = null;
  if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
    ms = raw < 1e12 ? raw * 1000 : raw;
  } else if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = /^\d+$/.test(raw.trim()) ? Number(raw.trim()) * 1000 : Date.parse(raw);
    ms = Number.isFinite(parsed) ? parsed : null;
  }
  if (ms === null) return null;
  // Never in the future (clock skew): that would stretch Instagram's 7-day reply window.
  return new Date(Math.min(ms, Date.now())).toISOString();
}

type DmRuleRow = MatchableRule & {
  dm_text: string;
  link_url: string | null;
  email_gate: boolean;
  follow_gate: boolean;
  media_ids?: string[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function matchRule(text: string, rules: DmRuleRow[]): string | null {
  const hit = matchComment(text, rules);
  return hit ? hit.rule.id : null;
}

export function extractCommentEvents(body: unknown): CommentEvent[] {
  const out: CommentEvent[] = [];
  try {
    if (!isRecord(body) || !Array.isArray(body.entry)) {
      return out;
    }
    for (const entry of body.entry) {
      if (!isRecord(entry) || !Array.isArray(entry.changes)) {
        continue;
      }
      if (entry.id === undefined || entry.id === null) {
        continue;
      }
      const accountExternalId = String(entry.id);
      const entryTime = commentTime(entry.time);
      for (const change of entry.changes) {
        if (!isRecord(change) || change.field !== "comments") {
          continue;
        }
        const value = change.value;
        if (!isRecord(value) || !isRecord(value.from)) {
          continue;
        }
        const from = value.from;
        if (from.id === undefined || from.id === null) {
          continue;
        }
        if (typeof value.text !== "string") {
          continue;
        }
        if (value.id === undefined || value.id === null) {
          continue;
        }
        const commentId = String(value.id);
        const fromId = String(from.id);
        const text = value.text;
        let fromUsername: string | null = null;
        if (typeof from.username === "string" && from.username) {
          fromUsername = from.username;
        }
        let mediaId: string | null = null;
        if (isRecord(value.media) && value.media.id != null) {
          mediaId = String(value.media.id);
        }
        out.push({
          accountExternalId,
          commentId,
          text,
          fromId,
          fromUsername,
          mediaId,
          createdAt: commentTime(value.timestamp) ?? commentTime(value.created_time) ?? entryTime,
        });
      }
    }
  } catch {
    // never throw on malformed webhook payloads
  }
  return out;
}

export type ReplayScope = {
  userId: string;
  ruleId: string;
};

async function loadCommentRules(ruleSql: string, ruleParams: string[]): Promise<DmRuleRow[]> {
  const scopedSql = ruleSql.replace(
    "follow_gate from socialapp.dm_rules",
    "follow_gate, media_ids from socialapp.dm_rules",
  );
  try {
    return await query<DmRuleRow>(scopedSql, ruleParams);
  } catch (error) {
    if (!isMissingColumnError(error)) throw error;
    // Older databases run in any-post mode until migration 021 is applied.
    const rows = await query<DmRuleRow>(ruleSql, ruleParams);
    return rows.map((rule) => ({ ...rule, media_ids: [] }));
  }
}

export async function processCommentEvents(
  events: CommentEvent[],
  scope?: ReplayScope,
): Promise<number> {
  let inserted = 0;
  let hadFailure = false;
  for (const event of events) {
    try {
      const accounts = await query<{ id: string; user_id: string }>(
        "select id, user_id from socialapp.social_accounts where platform='instagram' and external_id=$1 and status='active'",
        [event.accountExternalId],
      );
      const account = accounts[0];
      if (!account) {
        continue;
      }
      if (scope && account.user_id !== scope.userId) {
        continue;
      }
      if (event.fromId === event.accountExternalId) {
        continue;
      }
      let ruleSql =
        "select id, keywords, match_type, status, dm_text, link_url, email_gate, follow_gate from socialapp.dm_rules where user_id=$1 and status='active' and (social_account_id is null or social_account_id=$2) and 'comment' = any(triggers)";
      const ruleParams: string[] = [account.user_id, account.id];
      if (scope) {
        ruleSql += " and id=$3";
        ruleParams.push(scope.ruleId);
      }
      ruleSql += " order by created_at";
      const loadedRules = await loadCommentRules(ruleSql, ruleParams);
      const rules = loadedRules.filter((rule) => ruleMatchesMedia(rule, event.mediaId));
      const ruleId = matchRule(event.text, rules);
      if (!ruleId) {
        continue;
      }
      const rule = rules.find((r) => r.id === ruleId);
      if (!rule) {
        continue;
      }
      const contacts = await query<{ id: string; email: string | null }>(
        `insert into socialapp.contacts(user_id, social_account_id, platform, external_id, username, source_rule_id) values ($1,$2,'instagram',$3,$4,$5) on conflict (user_id, platform, external_id) do update set last_seen_at=now(), username=coalesce(excluded.username, socialapp.contacts.username) returning id, email`,
        [
          account.user_id,
          account.id,
          event.fromId,
          event.fromUsername,
          ruleId,
        ],
      );
      const contactId = contacts[0]?.id;
      if (!contactId) {
        continue;
      }
      // A returning lead whose email we already have is not asked again for an email-only gate.
      const knownEmail = Boolean(contacts[0]?.email);
      const emailGate = rule.email_gate && !knownEmail;
      const gated = emailGate || rule.follow_gate;
      let resolvedLink: string | null = null;
      if (!gated && rule.link_url) {
        resolvedLink = rule.link_url;
        try {
          resolvedLink = await shortLinkFor(
            account.user_id,
            rule.id,
            rule.link_url,
          );
        } catch {
          /* use raw link_url */
        }
      }
      const message = buildCommentDmMessage({
        dmText: rule.dm_text,
        fromUsername: event.fromUsername,
        linkUrl: rule.link_url,
        emailGate,
        followGate: rule.follow_gate,
        resolvedLink,
      });
      const rows = await query<{ id: string }>(
        `insert into socialapp.dm_queue (user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message, created_at, kind) values ($1,$2,$3,$4,$5,$6,$7, coalesce($8::timestamptz, now()), $9) on conflict (comment_id) do nothing returning id`,
        [
          account.user_id,
          account.id,
          ruleId,
          contactId,
          event.commentId,
          event.fromId,
          message,
          event.createdAt ?? null,
          // 'comment_link': the gate was skipped (known email), so this reply already carries
          // the link and must not count as an open gate prompt later.
          rule.email_gate && !emailGate && !rule.follow_gate ? "comment_link" : "comment_reply",
        ],
      );
      if (rows.length > 0) {
        inserted += 1;
      }
    } catch (err) {
      console.error("processCommentEvents event failed", event.commentId, err instanceof Error ? err.message : err);
      hadFailure = true;
    }
  }
  if (hadFailure) {
    throw new Error("comment event processing incomplete");
  }
  return inserted;
}
