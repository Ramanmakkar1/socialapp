// Server-only: queues an AI-written reply to an incoming Instagram DM when the account has
// AI replies switched on. Never throws, so a failed AI reply can't make the webhook fail.
import { generateAiDmReply, shouldAiReply, type AiReplySettings, type ChatTurn } from "@/lib/aiReply";
import { getPool, query } from "@/lib/db";
import { isFeatureReadyNow } from "@/lib/featureReadinessNow";
import { recentInboundMessages } from "@/lib/inbox";

export async function maybeQueueAiReply(params: {
  userId: string;
  socialAccountId: string;
  accountExternalId: string;
  contactId: string;
  senderId: string;
  text: string;
  hasPendingGate: boolean;
}): Promise<boolean> {
  // Empty text or an echo of our own outgoing message: never answer.
  if (!params.text?.trim() || params.senderId === params.accountExternalId) return false;
  // AI replies are on hold until switched on (src/lib/featureReadiness.ts "ai_replies").
  if (!(await isFeatureReadyNow("ai_replies"))) return false;
  try {
    const rows = await query<{
      ai_reply_enabled: boolean;
      ai_reply_instructions: string | null;
      ai_booking_link: string | null;
      brand_voice: string | null;
    }>(
      "select a.ai_reply_enabled, a.ai_reply_instructions, a.ai_booking_link, u.brand_voice from socialapp.social_accounts a join socialapp.users u on u.id=a.user_id where a.id=$1 and a.user_id=$2 and a.status='active'",
      [params.socialAccountId, params.userId],
    );
    const row = rows[0];
    if (!row || !row.ai_reply_enabled) return false;

    const settings: AiReplySettings = {
      enabled: true,
      instructions: row.ai_reply_instructions,
      bookingLink: row.ai_booking_link,
      brandVoice: row.brand_voice,
    };

    const counted = await query<{ n: number }>(
      "select count(*)::int as n from socialapp.dm_queue where contact_id=$1 and kind='ai_reply' and created_at > now() - interval '24 hours'",
      [params.contactId],
    );
    const aiRepliesLast24h = Number(counted[0]?.n ?? 0);

    const human = await query<{ at: Date | null }>(
      "select max(coalesce(sent_at, created_at)) as at from socialapp.dm_queue where social_account_id=$1 and recipient_external_id=$2 and kind='manual_reply' and status='sent'",
      [params.socialAccountId, params.senderId],
    );

    if (
      !shouldAiReply({
        settings,
        text: params.text,
        lastInboundAt: new Date(),
        aiRepliesLast24h,
        hasPendingGate: params.hasPendingGate,
        lastHumanReplyAt: human[0]?.at ? new Date(human[0].at) : null,
      })
    ) {
      return false;
    }

    const sent = await query<{ message: string; at: Date }>(
      "select message, coalesce(sent_at, created_at) as at from socialapp.dm_queue where contact_id=$1 and status='sent' order by at desc limit 10",
      [params.contactId],
    );
    let inbound: { direction: "in"; text: string; at: Date }[] = [];
    try {
      inbound = (await recentInboundMessages(params.accountExternalId, params.senderId, 10)).map((m) => ({
        direction: "in" as const,
        text: m.text,
        at: m.at,
      }));
    } catch {
      // If the inbound lookup fails, the AI reply still works from our sent replies only.
      inbound = [];
    }
    const merged: { direction: "in" | "out"; text: string; at: Date }[] = [
      ...sent.map((r) => ({ direction: "out" as const, text: r.message, at: r.at })),
      ...inbound,
    ];
    merged.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
    const history: ChatTurn[] = merged.map((m) => ({ direction: m.direction, text: m.text }));
    const last = history[history.length - 1];
    if (!last || last.direction !== "in" || last.text.trim() !== params.text.trim()) {
      history.push({ direction: "in", text: params.text });
    }

    let known: { email: string | null; phone: string | null } | undefined;
    try {
      const contactRows = await query<{ email: string | null; phone: string | null }>(
        "select email, phone from socialapp.contacts where id=$1 and user_id=$2",
        [params.contactId, params.userId],
      );
      const contactRow = contactRows[0];
      known = { email: contactRow?.email ?? null, phone: contactRow?.phone ?? null };
    } catch {
      // If this query fails, carry on without known.
    }

    // Meta expects the webhook to answer fast, so keep the AI call short.
    const res = await generateAiDmReply(settings, history, { timeoutMs: 8000, known });
    if (!res.ok) {
      console.error("ai reply skipped", res.error);
      return false;
    }

    // Meta can deliver the same webhook twice: lock per contact and skip if an AI reply was just queued.
    const client = await getPool().connect();
    try {
      await client.query("begin");
      await client.query("select pg_advisory_xact_lock(hashtext($1::text), hashtext('ai_reply'))", [params.contactId]);
      const recent = await client.query(
        "select 1 from socialapp.dm_queue where contact_id=$1 and kind='ai_reply' and created_at > now() - interval '30 seconds' limit 1",
        [params.contactId],
      );
      let inserted = false;
      if (recent.rows.length === 0) {
        await client.query(
          `insert into socialapp.dm_queue (user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message, kind, next_attempt_at)
           values ($1, $2, null, $3, null, $4, $5, 'ai_reply', now())`,
          [params.userId, params.socialAccountId, params.contactId, params.senderId, res.reply],
        );
        inserted = true;
      }
      await client.query("commit");
      return inserted;
    } catch (err) {
      await client.query("rollback").catch(() => undefined);
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("maybeQueueAiReply failed", err instanceof Error ? err.message : String(err));
    return false;
  }
}
