import { query } from "@/lib/db";
import { shortLinkFor } from "@/lib/links";
import { matchComment, type MatchableRule } from "@/lib/match";

export type CommentEvent = {
  accountExternalId: string;
  commentId: string;
  text: string;
  fromId: string;
  fromUsername: string | null;
  mediaId: string | null;
};

type DmRuleRow = MatchableRule & {
  dm_text: string;
  link_url: string | null;
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
        });
      }
    }
  } catch {
    // never throw on malformed webhook payloads
  }
  return out;
}

export async function processCommentEvents(
  events: CommentEvent[],
): Promise<number> {
  let inserted = 0;
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
      if (event.fromId === event.accountExternalId) {
        continue;
      }
      const rules = await query<DmRuleRow>(
        "select id, keywords, match_type, status, dm_text, link_url from socialapp.dm_rules where user_id=$1 and status='active' and (social_account_id is null or social_account_id=$2) order by created_at",
        [account.user_id, account.id],
      );
      const ruleId = matchRule(event.text, rules);
      if (!ruleId) {
        continue;
      }
      const rule = rules.find((r) => r.id === ruleId);
      if (!rule) {
        continue;
      }
      const contacts = await query<{ id: string }>(
        `insert into socialapp.contacts(user_id, social_account_id, platform, external_id, username, source_rule_id) values ($1,$2,'instagram',$3,$4,$5) on conflict (user_id, platform, external_id) do update set last_seen_at=now(), username=coalesce(excluded.username, socialapp.contacts.username) returning id`,
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
      let message = rule.dm_text;
      if (rule.link_url) {
        let link = rule.link_url;
        try {
          link = await shortLinkFor(account.user_id, rule.id, rule.link_url);
        } catch {
          /* use raw link_url */
        }
        message += "\n" + link;
      }
      const rows = await query<{ id: string }>(
        `insert into socialapp.dm_queue (user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message) values ($1,$2,$3,$4,$5,$6,$7) on conflict (comment_id) do nothing returning id`,
        [
          account.user_id,
          account.id,
          ruleId,
          contactId,
          event.commentId,
          event.fromId,
          message,
        ],
      );
      if (rows.length > 0) {
        inserted += 1;
      }
    } catch (err) {
      console.error("processCommentEvents event failed", err);
    }
  }
  return inserted;
}
