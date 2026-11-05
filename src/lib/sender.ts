// Server only: sends queued DMs through the official Instagram API.
import type pg from "pg";
import { decryptToken } from "@/lib/crypto";
import { getPool } from "@/lib/db";
import {
  MAX_ATTEMPTS,
  classifyMetaError,
  isTokenError,
  messagingWindowError,
  nextAttemptDelayMs,
  remainingBudget,
} from "@/lib/sendPolicy";

const GRAPH_BASE = "https://graph.instagram.com/v21.0";
const SEND_TIMEOUT_MS = 15_000;
const RATE_LIMIT_PAUSE_MS = 15 * 60 * 1000;
/** Max pending rows considered per account per run (must exclude paused rules in SQL). */
export const DUE_ROW_LIMIT = 500;

type AccountRow = { id: string; external_id: string; access_token_enc: string | null };
type QueueRow = {
  id: string;
  user_id: string;
  rule_id: string | null;
  comment_id: string | null;
  recipient_external_id: string;
  message: string;
  attempts: number;
  kind: string;
  created_at?: Date | null;
};

export type SendResult = { sent: number; retried: number; failed: number; skipped: number };

type SendOutcome =
  | { ok: true }
  | { ok: false; kind: "retry" | "fatal" | "rate_limited" | "token"; error: string };

export type GateDmResult =
  | { action: "send" }
  | { action: "wait" }
  | { action: "skip"; error: string };

function cleanError(message: string, token: string): string {
  const safe = token ? message.split(token).join("[redacted]") : message;
  return safe.slice(0, 500);
}

function metaMessage(body: unknown, fallback: string): string {
  if (typeof body === "object" && body !== null) {
    const err = (body as { error?: unknown }).error;
    if (typeof err === "object" && err !== null) {
      const msg = (err as { message?: unknown }).message;
      if (typeof msg === "string") return msg;
    }
  }
  return fallback;
}

/** Revalidate queue row against dm_rules immediately before send. */
export async function gateDmSendByRule(
  client: pg.PoolClient,
  row: Pick<QueueRow, "rule_id" | "user_id">,
  socialAccountId: string
): Promise<GateDmResult> {
  if (!row.rule_id) {
    return { action: "skip", error: "Automation rule is missing" };
  }
  const ruleRes = await client.query<{
    status: string;
    user_id: string;
    social_account_id: string | null;
  }>("select status, user_id, social_account_id from socialapp.dm_rules where id=$1", [row.rule_id]);
  const rule = ruleRes.rows[0];
  if (!rule) {
    return { action: "skip", error: "Automation rule was deleted" };
  }
  if (rule.user_id !== row.user_id) {
    return { action: "skip", error: "Automation rule does not belong to this user" };
  }
  if (rule.social_account_id && rule.social_account_id !== socialAccountId) {
    return { action: "skip", error: "Automation rule is scoped to a different Instagram account" };
  }
  if (rule.status === "paused") {
    return { action: "wait" };
  }
  if (rule.status !== "active") {
    return { action: "skip", error: "Automation rule is not active" };
  }
  return { action: "send" };
}

async function sendPrivateReply(
  igUserId: string,
  token: string,
  row: QueueRow
): Promise<SendOutcome> {
  try {
    const res = await fetch(`${GRAPH_BASE}/${encodeURIComponent(igUserId)}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: row.comment_id
          ? { comment_id: row.comment_id }
          : { id: row.recipient_external_id },
        message: { text: row.message },
      }),
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
    });
    if (res.ok) return { ok: true };
    const text = await res.text().catch(() => "");
    let body: unknown = text;
    try {
      body = JSON.parse(text);
    } catch {
      // keep the raw text
    }
    return {
      ok: false,
      kind: isTokenError(res.status, body) ? "token" : classifyMetaError(res.status, body),
      error: cleanError(`HTTP ${res.status}: ${metaMessage(body, text)}`, token),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      kind: classifyMetaError(0, null),
      error: cleanError(`network: ${message}`, token),
    };
  }
}

export async function sendDueDms(limit = 50): Promise<SendResult> {
  const result: SendResult = { sent: 0, retried: 0, failed: 0, skipped: 0 };
  const pool = getPool();
  const accounts = await pool.query<AccountRow>(
    "select id, external_id, access_token_enc from socialapp.social_accounts where platform='instagram' and status='active' order by created_at"
  );

  let left = Math.max(0, Math.floor(limit));
  for (const account of accounts.rows) {
    if (left <= 0) break;
    if (!account.access_token_enc) continue;
    let token: string;
    try {
      token = decryptToken(account.access_token_enc);
    } catch {
      console.error("sendDueDms: cannot decrypt token for account", account.id);
      continue;
    }

    const client = await pool.connect();
    try {
      await client.query("begin");
      const lockRes = await client.query(
        "select id from socialapp.social_accounts where id=$1 and status='active' for update skip locked",
        [account.id]
      );
      if (!lockRes.rows.length) {
        await client.query("commit");
        continue;
      }
      const sentRes = await client.query<{ n: number }>(
        "select count(*)::int as n from socialapp.dm_queue where social_account_id=$1 and status='sent' and sent_at > now() - interval '1 hour'",
        [account.id]
      );
      const budget = Math.min(remainingBudget(sentRes.rows[0]?.n ?? 0), left);
      if (budget <= 0) {
        await client.query("commit");
        continue;
      }
      const dueLimit = Math.min(DUE_ROW_LIMIT, budget);
      const due = await client.query<QueueRow>(
        `select q.id, q.user_id, q.rule_id, q.comment_id, q.recipient_external_id, q.message, q.attempts, q.kind, q.created_at
         from socialapp.dm_queue q
         where q.social_account_id=$1 and q.status='pending' and q.next_attempt_at <= now()
         and exists (
           select 1 from socialapp.social_accounts a
           where a.id = q.social_account_id
             and (a.dm_cooldown_until is null or a.dm_cooldown_until <= now())
         )
         and not exists (
           select 1 from socialapp.dm_rules r
           where r.id = q.rule_id
             and r.user_id = q.user_id
             and (r.social_account_id is null or r.social_account_id = q.social_account_id)
             and r.status = 'paused'
         )
         order by q.created_at
         limit $2
         for update of q skip locked`,
        [account.id, dueLimit]
      );

      for (const row of due.rows) {
        if (left <= 0) break;
        const gate = await gateDmSendByRule(client, row, account.id);
        if (gate.action === "wait") {
          continue;
        }
        if (gate.action === "skip") {
          await client.query(
            "update socialapp.dm_queue set status='skipped', last_error=$2 where id=$1",
            [row.id, gate.error]
          );
          result.skipped += 1;
          left -= 1;
          continue;
        }
        const windowError = messagingWindowError(row);
        if (windowError) {
          await client.query(
            "update socialapp.dm_queue set status='skipped', last_error=$2 where id=$1",
            [row.id, windowError]
          );
          result.skipped += 1;
          continue;
        }

        const outcome = await sendPrivateReply(account.external_id, token, row);
        left -= 1;
        if (outcome.ok) {
          await client.query(
            "update socialapp.dm_queue set status='sent', sent_at=now(), attempts=attempts+1, last_error=null where id=$1",
            [row.id]
          );
          result.sent += 1;
          continue;
        }
        if (outcome.kind === "token") {
          // Token expired or revoked: keep the DM pending, flag the account so the app asks to reconnect.
          await client.query(
            "update socialapp.dm_queue set last_error=$2 where id=$1",
            [row.id, "Instagram access expired. Reconnect Instagram in Settings."]
          );
          await client.query(
            "update socialapp.social_accounts set status='expired', updated_at=now() where id=$1 and status='active'",
            [account.id]
          );
          result.retried += 1;
          break;
        }
        if (outcome.kind === "rate_limited") {
          await client.query(
            "update socialapp.social_accounts set dm_cooldown_until=now() + ($2::int * interval '1 millisecond') where id=$1",
            [account.id, RATE_LIMIT_PAUSE_MS]
          );
          await client.query(
            "update socialapp.dm_queue set last_error=$2, next_attempt_at=now() + ($3::int * interval '1 millisecond') where id=$1",
            [row.id, outcome.error, RATE_LIMIT_PAUSE_MS]
          );
          result.retried += 1;
          break;
        }
        const attempts = row.attempts + 1;
        if (outcome.kind === "fatal" || attempts >= MAX_ATTEMPTS) {
          await client.query(
            "update socialapp.dm_queue set status='failed', attempts=$2, last_error=$3 where id=$1",
            [row.id, attempts, outcome.error]
          );
          result.failed += 1;
        } else {
          await client.query(
            "update socialapp.dm_queue set attempts=$2, last_error=$3, next_attempt_at=now() + ($4::int * interval '1 millisecond') where id=$1",
            [row.id, attempts, outcome.error, nextAttemptDelayMs(row.attempts)]
          );
          result.retried += 1;
        }
      }
      await client.query("commit");
    } catch (err) {
      await client.query("rollback").catch(() => {});
      const message = err instanceof Error ? err.message : String(err);
      console.error("sendDueDms: account", account.id, cleanError(message, token));
    } finally {
      client.release();
    }
  }
  return result;
}
