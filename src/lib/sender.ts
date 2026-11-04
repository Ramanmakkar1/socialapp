// Server only: sends queued DMs through the official Instagram API.
import { decryptToken } from "@/lib/crypto";
import { getPool } from "@/lib/db";
import {
  MAX_ATTEMPTS,
  classifyMetaError,
  nextAttemptDelayMs,
  remainingBudget,
} from "@/lib/sendPolicy";

const GRAPH_BASE = "https://graph.instagram.com/v21.0";
const SEND_TIMEOUT_MS = 15_000;
const RATE_LIMIT_PAUSE_MS = 15 * 60 * 1000;

type AccountRow = { id: string; external_id: string; access_token_enc: string | null };
type QueueRow = {
  id: string;
  comment_id: string | null;
  recipient_external_id: string;
  message: string;
  attempts: number;
  kind: string;
};

export type SendResult = { sent: number; retried: number; failed: number };

type SendOutcome =
  | { ok: true }
  | { ok: false; kind: "retry" | "fatal" | "rate_limited"; error: string };

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
      kind: classifyMetaError(res.status, body),
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
  const result: SendResult = { sent: 0, retried: 0, failed: 0 };
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
      const sentRes = await client.query<{ n: number }>(
        "select count(*)::int as n from socialapp.dm_queue where social_account_id=$1 and status='sent' and sent_at > now() - interval '1 hour'",
        [account.id]
      );
      const budget = Math.min(remainingBudget(sentRes.rows[0]?.n ?? 0), left);
      if (budget <= 0) {
        await client.query("commit");
        continue;
      }
      const due = await client.query<QueueRow>(
        `select id, comment_id, recipient_external_id, message, attempts, kind from socialapp.dm_queue
         where social_account_id=$1 and status='pending' and next_attempt_at <= now()
         order by created_at limit $2 for update skip locked`,
        [account.id, budget]
      );

      for (const row of due.rows) {
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
        if (outcome.kind === "rate_limited") {
          // Meta throttled this account: wait, keep the attempt count, stop this account for now.
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
