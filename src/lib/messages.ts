import { buildCommentDmMessage } from "@/lib/commentMessage";
import { getPool, query } from "@/lib/db";
import { accountToken, isFollower } from "@/lib/followCheck";
import { shortLinkFor } from "@/lib/links";
import { matchComment, type MatchableRule } from "@/lib/match";
import {
  extractEmail,
  extractMessageEvents,
  extractPhone,
  type MessageEvent,
} from "@/lib/messageParse";
import { nextAttemptDelayMs } from "@/lib/sendPolicy";

export type { MessageEvent };
export { extractEmail, extractMessageEvents, extractPhone };

export const FOLLOW_NUDGE_MESSAGE =
  "Looks like you're not following yet - follow us and reply 'done' again to get the link.";
export const MAX_FOLLOW_NUDGES = 2;

export function gatedLinkMessage(link: string): string {
  return "Thanks! Here's your link: " + link;
}

/**
 * gated_link   - the unlocked link (at most one per contact + rule, unique index in migration 015)
 * follow_check - the link waiting for a follower check Instagram did not answer; the send
 *                worker re-checks with backoff and then sends the link, a nudge, or gives up
 * follow_nudge - "follow us first" reminder (at most MAX_FOLLOW_NUDGES per contact + rule)
 */
type DmEnqueueKind = "gated_link" | "follow_check" | "follow_nudge" | "story_reply";

/**
 * Idempotent enqueue per contact + rule. Concurrent webhooks are serialized by an advisory
 * lock, and the insert itself is ON CONFLICT DO NOTHING against the unique index, so two
 * deliveries of the same reply can never queue two links (bug h).
 */
async function enqueueGatedDm(params: {
  userId: string;
  socialAccountId: string;
  ruleId: string;
  contactId: string;
  recipientExternalId: string;
  kind: DmEnqueueKind;
  message: string;
}): Promise<boolean> {
  const { userId, socialAccountId, ruleId, contactId, recipientExternalId, kind, message } = params;
  const client = await getPool().connect();
  try {
    await client.query("begin");
    await client.query(
      "select pg_advisory_xact_lock(hashtext($1::text), hashtext($2::text))",
      [contactId, ruleId],
    );
    if (kind === "story_reply") {
      // One automated answer per person and automation per day, however often they reply.
      const recent = await client.query(
        "select 1 as recent from socialapp.dm_queue where kind='story_reply' and contact_id=$1 and rule_id=$2 and created_at > now() - interval '24 hours'",
        [contactId, ruleId],
      );
      if (recent.rows.length > 0) {
        await client.query("commit");
        return false;
      }
    } else if (kind === "follow_nudge") {
      const nudges = await client.query<{ n: number }>(
        "select count(*)::int as n from socialapp.dm_queue where contact_id=$1 and rule_id=$2 and kind='follow_nudge'",
        [contactId, ruleId],
      );
      if ((nudges.rows[0]?.n ?? 0) >= MAX_FOLLOW_NUDGES) {
        await client.query("commit");
        return false;
      }
    } else {
      const dup = await client.query(
        "select 1 as ok from socialapp.dm_queue where contact_id=$1 and rule_id=$2 and (kind='gated_link' or (kind='follow_check' and status='pending'))",
        [contactId, ruleId],
      );
      if (dup.rows.length > 0) {
        await client.query("commit");
        return false;
      }
    }
    const delayMs = kind === "follow_check" ? nextAttemptDelayMs(0) : 0;
    const inserted = await client.query(
      `insert into socialapp.dm_queue (user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message, kind, next_attempt_at)
       values ($1,$2,$3,$4,null,$5,$6,$7, now() + ($8::int * interval '1 millisecond'))
       on conflict do nothing returning id`,
      [userId, socialAccountId, ruleId, contactId, recipientExternalId, message, kind, delayMs],
    );
    await client.query("commit");
    return inserted.rows.length > 0;
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

type PendingGate = {
  rule_id: string;
  link_url: string;
  email_gate: boolean;
  follow_gate: boolean;
};

/**
 * The automation this person is answering: the most recent gate prompt that was actually
 * SENT to them from this account and is not unlocked yet, for a rule that is still active
 * and allowed on this account. Keyed on the prompts we sent, not on the contact's first
 * rule, so the reply unlocks the automation they replied to (bug i) and a returning lead
 * gets a second automation's link (bug k).
 */
const PENDING_GATE_SQL = `
  select q.rule_id, r.link_url, r.email_gate, r.follow_gate
  from socialapp.dm_queue q
  join socialapp.dm_rules r on r.id = q.rule_id
    and r.user_id = q.user_id
    and r.status = 'active'
    and (r.social_account_id is null or r.social_account_id = q.social_account_id)
  where q.contact_id = $1
    and q.social_account_id = $2
    and q.recipient_external_id = $3
    and q.kind in ('comment_reply', 'story_reply')
    and q.status = 'sent'
    and (r.email_gate or r.follow_gate)
    and r.link_url is not null and r.link_url <> ''
    and not exists (
      select 1 from socialapp.dm_queue g
      where g.contact_id = q.contact_id and g.rule_id = q.rule_id
        and (g.kind = 'gated_link' or (g.kind = 'follow_check' and g.status = 'pending'))
    )
  order by q.sent_at desc nulls last, q.created_at desc
  limit 1
`;

async function linkFor(userId: string, ruleId: string, linkUrl: string): Promise<string> {
  try {
    return await shortLinkFor(userId, ruleId, linkUrl);
  } catch {
    return linkUrl;
  }
}

type StoryRuleRow = MatchableRule & {
  dm_text: string;
  link_url: string | null;
  email_gate: boolean;
  follow_gate: boolean;
};

/**
 * Story reply automation: a reply to one of the account's stories that matches an active
 * rule with the "story_reply" trigger gets the rule's DM (gates work like comment rules:
 * the person answers the prompt in the same chat). Returns true when a rule matched.
 */
async function handleStoryReply(account: { id: string; user_id: string }, event: MessageEvent): Promise<boolean> {
  const rules = await query<StoryRuleRow>(
    "select id, keywords, match_type, status, dm_text, link_url, email_gate, follow_gate from socialapp.dm_rules where user_id=$1 and status='active' and (social_account_id is null or social_account_id=$2) and 'story_reply' = any(triggers) order by created_at",
    [account.user_id, account.id],
  );
  const hit = matchComment(event.text, rules);
  if (!hit) return false;
  const rule = hit.rule;
  const contacts = await query<{ id: string; email: string | null }>(
    `insert into socialapp.contacts(user_id, social_account_id, platform, external_id, username, source_rule_id) values ($1,$2,'instagram',$3,$4,$5) on conflict (user_id, platform, external_id) do update set last_seen_at=now(), username=coalesce(excluded.username, socialapp.contacts.username) returning id, email`,
    [account.user_id, account.id, event.senderId, null, rule.id],
  );
  const contact = contacts[0];
  if (!contact) return true;
  const emailGate = rule.email_gate && !contact.email;
  const gated = emailGate || rule.follow_gate;
  const resolvedLink = !gated && rule.link_url ? await linkFor(account.user_id, rule.id, rule.link_url) : null;
  const message = buildCommentDmMessage({
    dmText: rule.dm_text,
    fromUsername: null,
    linkUrl: rule.link_url,
    emailGate,
    followGate: rule.follow_gate,
    resolvedLink,
  });
  await enqueueGatedDm({
    userId: account.user_id,
    socialAccountId: account.id,
    ruleId: rule.id,
    contactId: contact.id,
    recipientExternalId: event.senderId,
    kind: "story_reply",
    message,
  });
  return true;
}

export async function processMessageEvents(
  events: MessageEvent[],
): Promise<number> {
  let updated = 0;
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
      if (event.storyReply && (await handleStoryReply(account, event))) {
        updated += 1;
        continue;
      }
      const email = extractEmail(event.text);
      const phone = extractPhone(event.text);
      const known = await query<{ id: string; email: string | null }>(
        "select id, email from socialapp.contacts where user_id=$1 and platform='instagram' and external_id=$2",
        [account.user_id, event.senderId],
      );
      const contactBefore = known[0];
      const pending = contactBefore
        ? (await query<PendingGate>(PENDING_GATE_SQL, [contactBefore.id, account.id, event.senderId]))[0]
        : undefined;
      if (email === null && phone === null && !pending) {
        continue;
      }
      const rows = await query<{ id: string }>(
        `insert into socialapp.contacts (user_id, social_account_id, platform, external_id, email, phone)
         values ($1, $5, 'instagram', $2, $3, $4)
         on conflict (user_id, platform, external_id) do update
         set email = coalesce(excluded.email, socialapp.contacts.email),
             phone = coalesce(excluded.phone, socialapp.contacts.phone),
             last_seen_at = now()
         returning id`,
        [account.user_id, event.senderId, email, phone, account.id],
      );
      updated += rows.length;
      const contactId = rows[0]?.id ?? contactBefore?.id;
      if (!pending || !contactId) {
        continue;
      }
      const emailOk = !pending.email_gate || Boolean(contactBefore?.email) || email !== null;
      if (!emailOk) {
        // Still waiting for the email the prompt asked for.
        continue;
      }
      const base = {
        userId: account.user_id,
        socialAccountId: account.id,
        ruleId: pending.rule_id,
        contactId,
        recipientExternalId: event.senderId,
      };
      const linkMessage = gatedLinkMessage(await linkFor(account.user_id, pending.rule_id, pending.link_url));
      if (!pending.follow_gate) {
        await enqueueGatedDm({ ...base, kind: "gated_link", message: linkMessage });
        continue;
      }
      const token = await accountToken(account.id);
      const following = token ? await isFollower(event.senderId, token) : null;
      if (following === true) {
        await enqueueGatedDm({ ...base, kind: "gated_link", message: linkMessage });
      } else if (following === false) {
        await enqueueGatedDm({ ...base, kind: "follow_nudge", message: FOLLOW_NUDGE_MESSAGE });
      } else {
        // Instagram did not answer the follower check: keep a durable retry in the queue
        // (backoff, then a clear give-up) instead of dropping it or failing the webhook (bug g).
        console.error("processMessageEvents: follower check unavailable, queued a retry for contact", contactId);
        await enqueueGatedDm({ ...base, kind: "follow_check", message: linkMessage });
      }
    } catch (err) {
      console.error("processMessageEvents event failed", event.mid ?? event.senderId, err instanceof Error ? err.message : err);
      hadFailure = true;
    }
  }
  if (hadFailure) {
    throw new Error("message event processing incomplete");
  }
  return updated;
}
