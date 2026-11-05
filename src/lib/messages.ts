import { getPool, query } from "@/lib/db";
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

type DmEnqueueKind = "gated_link" | "follow_nudge";

/** Serializes gated_link / follow_nudge inserts per contact+rule (webhook concurrency). */
async function enqueueDmIfAllowed(params: {
  userId: string;
  socialAccountId: string;
  ruleId: string;
  contactId: string;
  recipientExternalId: string;
  kind: DmEnqueueKind;
  message: string;
}): Promise<void> {
  const {
    userId,
    socialAccountId,
    ruleId,
    contactId,
    recipientExternalId,
    kind,
    message,
  } = params;
  const client = await getPool().connect();
  try {
    await client.query("begin");
    await client.query(
      "select pg_advisory_xact_lock(hashtext($1::text), hashtext($2::text))",
      [contactId, ruleId],
    );
    if (kind === "gated_link") {
      const dup = await client.query(
        "select 1 as ok from socialapp.dm_queue where contact_id=$1 and rule_id=$2 and kind='gated_link'",
        [contactId, ruleId],
      );
      if (dup.rows.length === 0) {
        await client.query(
          `insert into socialapp.dm_queue (user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message, kind) values ($1,$2,$3,$4,null,$5,$6,'gated_link')`,
          [
            userId,
            socialAccountId,
            ruleId,
            contactId,
            recipientExternalId,
            message,
          ],
        );
      }
    } else {
      const nudges = await client.query<{ n: number }>(
        "select count(*)::int as n from socialapp.dm_queue where contact_id=$1 and rule_id=$2 and kind='follow_nudge'",
        [contactId, ruleId],
      );
      if ((nudges.rows[0]?.n ?? 0) < 2) {
        await client.query(
          `insert into socialapp.dm_queue (user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message, kind) values ($1,$2,$3,$4,null,$5,$6,'follow_nudge')`,
          [
            userId,
            socialAccountId,
            ruleId,
            contactId,
            recipientExternalId,
            message,
          ],
        );
      }
    }
    await client.query("commit");
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

type ContactRuleRow = {
  id: string;
  email: string | null;
  source_rule_id: string | null;
  link_url: string | null;
  email_gate: boolean | null;
  follow_gate: boolean | null;
};

/**
 * A gate prompt that was actually sent to this contact. Only the absence of a
 * sent prompt blocks the gated link and the follow nudge; older pending,
 * failed or skipped prompts for the same contact/account/rule do not.
 */
const OUTSTANDING_GATED_RULES_SQL = `
  select 1 as ok
  from socialapp.dm_queue
  where contact_id = $1
    and rule_id = $2
    and kind = 'comment_reply'
    and social_account_id = $3
    and recipient_external_id = $4
    and status = 'sent'
`;

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
      const email = extractEmail(event.text);
      const phone = extractPhone(event.text);
      const existing = await query<ContactRuleRow>(
        `select c.id, c.email, c.source_rule_id, r.link_url, r.email_gate, r.follow_gate
         from socialapp.contacts c
         left join socialapp.dm_rules r on r.id = c.source_rule_id
           and r.user_id = $1
           and r.status = 'active'
           and (r.social_account_id is null or r.social_account_id = $3)
           and c.social_account_id = $3
         where c.user_id = $1 and c.platform = 'instagram' and c.external_id = $2`,
        [account.user_id, event.senderId, account.id],
      );
      const contactBefore = existing[0];
      const followGate = contactBefore?.follow_gate === true;
      if (email === null && phone === null && !followGate) {
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
      const outstanding = await query(OUTSTANDING_GATED_RULES_SQL, [
        contactBefore.id,
        ruleId,
        account.id,
        event.senderId,
      ]);
      if (outstanding.length === 0) {
        continue;
      }
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
      if (followCheckFailed) {
        hadFailure = true;
      }
      if (emailOk && followOk) {
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
        await enqueueDmIfAllowed({
          userId: account.user_id,
          socialAccountId: account.id,
          ruleId,
          contactId: contactBefore.id,
          recipientExternalId: event.senderId,
          kind: "gated_link",
          message: dmMessage,
        });
      } else if (
        ruleFollowGate &&
        !followOk &&
        emailOk &&
        !followCheckFailed
      ) {
        await enqueueDmIfAllowed({
          userId: account.user_id,
          socialAccountId: account.id,
          ruleId,
          contactId: contactBefore.id,
          recipientExternalId: event.senderId,
          kind: "follow_nudge",
          message:
            "Looks like you're not following yet - follow us and reply 'done' again to get the link.",
        });
      }
    } catch (err) {
      console.error("processMessageEvents event failed", err);
      hadFailure = true;
    }
  }
  if (hadFailure) {
    throw new Error("message event processing incomplete");
  }
  return updated;
}
