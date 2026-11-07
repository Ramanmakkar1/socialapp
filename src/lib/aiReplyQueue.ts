// Server-only: queues an AI-written reply to an incoming Instagram DM when the account has
// AI replies switched on. Never throws, so a failed AI reply can't make the webhook fail.
import { generateAiDmReply, shouldAiReply, type AiReplySettings, type ChatTurn } from "@/lib/aiReply";
import { query } from "@/lib/db";

export async function maybeQueueAiReply(params: {
  userId: string;
  socialAccountId: string;
  accountExternalId: string;
  contactId: string;
  senderId: string;
  text: string;
  hasPendingGate: boolean;
}): Promise<boolean> {
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

    if (
      !shouldAiReply({
        settings,
        text: params.text,
        lastInboundAt: new Date(),
        aiRepliesLast24h,
        hasPendingGate: params.hasPendingGate,
      })
    ) {
      return false;
    }

    const sent = await query<{ message: string; at: Date }>(
      "select message, coalesce(sent_at, created_at) as at from socialapp.dm_queue where contact_id=$1 and status='sent' order by at desc limit 10",
      [params.contactId],
    );
    const history: ChatTurn[] = sent
      .slice()
      .reverse()
      .map((r) => ({ direction: "out" as const, text: r.message }));
    history.push({ direction: "in", text: params.text });

    // Meta expects the webhook to answer fast, so keep the AI call short.
    const res = await generateAiDmReply(settings, history, { timeoutMs: 8000 });
    if (!res.ok) {
      console.error("ai reply skipped", res.error);
      return false;
    }

    await query(
      `insert into socialapp.dm_queue (user_id, social_account_id, rule_id, contact_id, comment_id, recipient_external_id, message, kind, next_attempt_at)
       values ($1, $2, null, $3, null, $4, $5, 'ai_reply', now())`,
      [params.userId, params.socialAccountId, params.contactId, params.senderId, res.reply],
    );
    return true;
  } catch (err) {
    console.error("maybeQueueAiReply failed", err instanceof Error ? err.message : String(err));
    return false;
  }
}
