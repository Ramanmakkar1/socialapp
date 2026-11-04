import { query } from "@/lib/db";
import { accountToken, isFollower } from "@/lib/followCheck";
import { shortLinkFor } from "@/lib/links";
import {
  extractEmail,
  extractMessageEvents,
  extractPhone,
  type MessageEvent,
} from "@/lib/messageParse";

export type { MessageEvent };
export { extractEmail, extractMessageEvents, extractPhone };

type ContactRuleRow = {
  id: string;
  email: string | null;
  source_rule_id: string | null;
  link_url: string | null;
  email_gate: boolean | null;
  follow_gate: boolean | null;
};

export async function processMessageEvents(
  events: MessageEvent[],
): Promise<number> {
  let updated = 0;
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
      const email = extractEmail(event.text);
      const phone = extractPhone(event.text);
      const existing = await query<ContactRuleRow>(
        `select c.id, c.email, c.source_rule_id, r.link_url, r.email_gate, r.follow_gate
         from socialapp.contacts c
         left join socialapp.dm_rules r on r.id = c.source_rule_id and r.user_id = $1
         where c.user_id = $1 and c.platform = 'instagram' and c.external_id = $2`,
        [account.user_id, event.senderId],
      );
      const contactBefore = existing[0];
      const followGate = contactBefore?.follow_gate === true;
      if (email === null && phone === null && !followGate) {
        continue;
      }
      const rows = await query<{ id: string }>(
        `update socialapp.contacts set email = coalesce($3, email), phone = coalesce($4, phone), last_seen_at = now() where user_id=$1 and platform='instagram' and external_id=$2 returning id`,
        [account.user_id, event.senderId, email, phone],
      );
      if (rows.length > 0) {
        updated += rows.length;
      }
      if (!contactBefore?.source_rule_id || !contactBefore.link_url) {
        continue;
      }
      const emailGate = contactBefore.email_gate === true;
      const ruleFollowGate = contactBefore.follow_gate === true;
      if (!emailGate && !ruleFollowGate) {
        continue;
      }
      const ruleId = contactBefore.source_rule_id;
      const emailOk =
        !emailGate || Boolean(contactBefore.email) || email !== null;
      let followOk = true;
      let followCheckFailed = false;
      if (ruleFollowGate) {
        const token = await accountToken(account.id);
        if (!token) {
          console.error(
            "processMessageEvents: no token for follow check",
            account.id,
          );
          followOk = false;
          followCheckFailed = true;
        } else {
          const following = await isFollower(event.senderId, token);
          if (following === null) {
            console.error(
              "processMessageEvents: is_user_follow_business check failed",
              event.senderId,
            );
            followOk = false;
            followCheckFailed = true;
          } else {
            followOk = following;
          }
        }
      }
      if (emailOk && followOk) {
        const dup = await query<{ ok: number }>(
          "select 1 as ok from socialapp.dm_queue where contact_id=$1 and rule_id=$2 and kind='gated_link'",
          [contactBefore.id, ruleId],
        );
        if (dup.length === 0) {
          let link = contactBefore.link_url;
          try {
            link = await shortLinkFor(
              account.user_id,
              ruleId,
              contactBefore.link_url,
            );
          } catch {
            /* use raw link_url */
          }
          const dmMessage = "Thanks! Here's your link: " + link;
          await query(
            `insert into socialapp.dm_queue (user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message, kind) values ($1,$2,$3,$4,null,$5,$6,'gated_link')`,
            [
              account.user_id,
              account.id,
              ruleId,
              contactBefore.id,
              event.senderId,
              dmMessage,
            ],
          );
        }
      } else if (
        ruleFollowGate &&
        !followOk &&
        emailOk &&
        !followCheckFailed
      ) {
        const nudges = await query<{ n: number }>(
          "select count(*)::int as n from socialapp.dm_queue where contact_id=$1 and rule_id=$2 and kind='follow_nudge'",
          [contactBefore.id, ruleId],
        );
        if ((nudges[0]?.n ?? 0) < 2) {
          await query(
            `insert into socialapp.dm_queue (user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message, kind) values ($1,$2,$3,$4,null,$5,$6,'follow_nudge')`,
            [
              account.user_id,
              account.id,
              ruleId,
              contactBefore.id,
              event.senderId,
              "Looks like you're not following yet - follow us and reply 'done' again to get the link.",
            ],
          );
        }
      }
    } catch (err) {
      console.error("processMessageEvents event failed", err);
    }
  }
  return updated;
}
