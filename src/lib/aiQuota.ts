// Per-user limits for user-started AI actions (caption ideas, DM message ideas):
// a short burst limit per minute (in memory, src/lib/rateLimit.ts) and a monthly quota (DB, migration 039).
// No plan gating here on purpose (owner decision pending).
import { query } from "@/lib/db";
import { utcMonthRange } from "@/lib/planLimits";
import { rateLimit } from "@/lib/rateLimit";

export const AI_REQUESTS_PER_MINUTE = 10;
export const AI_REQUESTS_PER_MONTH = 300;

export type AiKind = "caption_ideas" | "dm_ideas";
export type AiQuotaResult = { ok: true } | { ok: false; error: string };

export function aiBurstMessage(retryAfterMs: number): string {
  const seconds = Math.max(1, Math.ceil(retryAfterMs / 1000));
  return `You're asking the AI very fast. Please wait ${seconds} second${seconds === 1 ? "" : "s"} and try again.`;
}

export function aiMonthlyMessage(limit: number): string {
  return `You've used all ${limit} AI suggestions for this month. They reset on the 1st (UTC). You can still write and schedule posts as usual.`;
}

function isMissingTable(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "42P01";
}

/**
 * Checks both limits and records the request when allowed. The monthly check and the insert are one
 * statement, so parallel clicks cannot go far past the quota.
 */
export async function consumeAiRequest(userId: string, kind: AiKind, now = new Date()): Promise<AiQuotaResult> {
  const burst = rateLimit(`ai:${userId}`, AI_REQUESTS_PER_MINUTE, 60_000, now.getTime());
  if (!burst.ok) return { ok: false, error: aiBurstMessage(burst.retryAfterMs) };
  const { start } = utcMonthRange(now);
  try {
    const rows = await query<{ id: string }>(
      `insert into socialapp.ai_requests (user_id, kind)
       select $1, $2
        where (select count(*) from socialapp.ai_requests where user_id=$1 and created_at >= $3) < $4
       returning id`,
      [userId, kind, start.toISOString(), AI_REQUESTS_PER_MONTH],
    );
    return rows[0] ? { ok: true } : { ok: false, error: aiMonthlyMessage(AI_REQUESTS_PER_MONTH) };
  } catch (err) {
    if (isMissingTable(err)) {
      console.error("ai quota: socialapp.ai_requests missing (run db:migrate); allowing request");
      return { ok: true };
    }
    throw err;
  }
}
