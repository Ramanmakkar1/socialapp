import { query } from "@/lib/db";
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
      const rows = await query<{ id: string }>(
        `update socialapp.contacts set email = coalesce($3, email), phone = coalesce($4, phone), last_seen_at = now() where user_id=$1 and platform='instagram' and external_id=$2 returning id`,
        [account.user_id, event.senderId, email, phone],
      );
      if (rows.length > 0) {
        updated += rows.length;
      }
    } catch (err) {
      console.error("processMessageEvents event failed", err);
    }
  }
  return updated;
}
