// Server only: per-account Instagram DM cooldown (social_accounts.dm_cooldown_until, migration 013).
// The send queue (sender.ts) and manual Inbox replies both respect and set it, so a rate limit
// from Instagram pauses every DM from that account, survives restarts and is shared by all instances.
import { query } from "@/lib/db";
import { GraphError, type GraphAccount } from "@/lib/igGraph";

export const DM_RATE_LIMIT_PAUSE_MS = 15 * 60 * 1000;

export async function dmCooldownUntil(accountId: string): Promise<Date | null> {
  const rows = await query<{ dm_cooldown_until: Date | string | null }>(
    "select dm_cooldown_until from socialapp.social_accounts where id=$1",
    [accountId],
  );
  const raw = rows[0]?.dm_cooldown_until;
  if (!raw) return null;
  const until = new Date(raw);
  return Number.isNaN(until.getTime()) || until.getTime() <= Date.now() ? null : until;
}

/** Persists the cooldown (never shortens an existing, longer one). */
export async function startDmCooldown(accountId: string, ms = DM_RATE_LIMIT_PAUSE_MS): Promise<void> {
  await query(
    `update socialapp.social_accounts
     set dm_cooldown_until = greatest(coalesce(dm_cooldown_until, now()), now() + ($2::int * interval '1 millisecond'))
     where id=$1`,
    [accountId, ms],
  );
}

export function cooldownMessage(until: Date, now = Date.now()): string {
  const minutes = Math.max(1, Math.ceil((until.getTime() - now) / 60_000));
  return `Instagram asked us to slow down for this account. DMs pause for about ${minutes} more minute${minutes === 1 ? "" : "s"}; your message was not sent.`;
}

export type GuardedSendResult = { ok: true } | { ok: false; error: string; rateLimited?: boolean };

/**
 * Runs one manual DM send for an account: refuses while the account is cooling down, and
 * persists a cooldown when Instagram answers with a rate limit (bug f).
 */
export async function guardedDmSend(account: GraphAccount, send: () => Promise<void>): Promise<GuardedSendResult> {
  const until = await dmCooldownUntil(account.id);
  if (until) return { ok: false, error: cooldownMessage(until), rateLimited: true };
  try {
    await send();
    return { ok: true };
  } catch (err) {
    if (err instanceof GraphError && err.kind === "rate_limited") {
      try {
        await startDmCooldown(account.id);
      } catch (dbErr) {
        console.error("dm cooldown could not be saved for account", account.id, dbErr instanceof Error ? dbErr.message : dbErr);
      }
      return { ok: false, error: cooldownMessage(new Date(Date.now() + DM_RATE_LIMIT_PAUSE_MS)), rateLimited: true };
    }
    if (err instanceof GraphError) return { ok: false, error: err.message };
    console.error("manual DM send failed for account", account.id, err instanceof Error ? err.message : err);
    return { ok: false, error: "Instagram didn't accept the reply. Please try again." };
  }
}
