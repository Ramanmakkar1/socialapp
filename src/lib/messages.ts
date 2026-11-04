import { query } from "@/lib/db";
import { shortLinkFor } from "@/lib/links";
import {
  extractEmail,
  extractMessageEvents,
  extractPhone,
  type MessageEvent,
} from "@/lib/messageParse";

export type { MessageEvent };
export { extractEmail, extractMessageEvents, extractPhone };

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
      if (email === null && phone === null) {
        continue;
      }
      const existing = await query<{
        id: string;
        email: string | null;
        source_rule_id: string | null;
      }>(
        "select id, email, source_rule_id from socialapp.contacts where user_id=$1 and platform='instagram' and external_id=$2",
        [account.user_id, event.senderId],
      );
      const contactBefore = existing[0];
      const rows = await query<{ id: string }>(
        `update socialapp.contacts set email = coalesce($3, email), phone = coalesce($4, phone), last_seen_at = now() where user_id=$1 and platform='instagram' and external_id=$2 returning id`,
        [account.user_id, event.senderId, email, phone],
      );
      if (rows.length > 0) {
        updated += rows.length;
      }
      if (
        email !== null &&
        contactBefore &&
        !contactBefore.email &&
        contactBefore.source_rule_id
      ) {
        const rules = await query<{
          id: string;
          link_url: string | null;
          email_gate: boolean;
        }>(
          "select id, link_url, email_gate from socialapp.dm_rules where id=$1 and user_id=$2",
          [contactBefore.source_rule_id, account.user_id],
        );
        const rule = rules[0];
        if (rule?.email_gate && rule.link_url) {
          const dup = await query<{ ok: number }>(
            "select 1 as ok from socialapp.dm_queue where contact_id=$1 and rule_id=$2 and kind='gated_link'",
            [contactBefore.id, rule.id],
          );
          if (dup.length === 0) {
            let link = rule.link_url;
            try {
              link = await shortLinkFor(account.user_id, rule.id, rule.link_url);
            } catch {
              /* use raw link_url */
            }
            const dmMessage = "Thanks! Here's your link: " + link;
            await query(
              `insert into socialapp.dm_queue (user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message, kind) values ($1,$2,$3,$4,null,$5,$6,'gated_link')`,
              [
                account.user_id,
                account.id,
                rule.id,
                contactBefore.id,
                event.senderId,
                dmMessage,
              ],
            );
          }
        }
      }
    } catch (err) {
      console.error("processMessageEvents event failed", err);
    }
  }
  return updated;
}
