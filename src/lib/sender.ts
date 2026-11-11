// Server only: sends queued DMs through the official Instagram API.
import type pg from "pg";
import { decryptToken } from "@/lib/crypto";
import { getPool, query } from "@/lib/db";
import { isFollower } from "@/lib/followCheck";
import { recordLeadMagnetDelivery } from "@/lib/leadMagnets";
import { FOLLOW_NUDGE_MESSAGE } from "@/lib/messages";
import { hasUnresolvedLinkToken } from "@/lib/rules";
import { autoDmLimitMessage, monthlyAutoDmLimit } from "@/lib/planLimits";
import { DM_WINDOW_MS, lastInboundMessageAt, withinWindow } from "@/lib/inbox";
import {
  MAX_ATTEMPTS,
  classifyMetaError,
  isTokenError,
  messagingWindowError,
  nextAttemptDelayMs,
  remainingBudget,
} from "@/lib/sendPolicy";
import { graphBaseFor } from "@/lib/graphHost";
import { choosePublicReply, sendPublicCommentReply, shouldPublicReply } from "@/lib/publicReply";

const SEND_TIMEOUT_MS = 15_000;
const RATE_LIMIT_PAUSE_MS = 15 * 60 * 1000;
/** Namespace for pg_try_advisory_xact_lock per Instagram account in sendDueDms. */
const DM_SEND_ADVISORY_NS = "socialapp:ig_dm_send";
/** Max pending rows considered per account per run (must exclude paused rules in SQL). */
export const DUE_ROW_LIMIT = 500;

type AccountRow = { id: string; external_id: string; access_token_enc: string | null; auth_type?: string | null };
type QueueRow = {
  id: string;
  user_id: string;
  rule_id: string | null;
  contact_id?: string | null;
  comment_id: string | null;
  recipient_external_id: string;
  message: string;
  attempts: number;
  kind: string;
  created_at?: Date | null;
};

export const FOLLOW_CHECK_GAVE_UP =
  "Gave up: Instagram did not answer the follower check after several tries, so the link was not sent. The person can reply again to retry.";

export const UNRESOLVED_LINK_ERROR =
  "Not sent: the message still contained {{link}} because the automation has no link. Add an https link to the automation; new comments will then get it.";

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

/** 24 h rule for normal DMs: keyed off the person's last inbound message, not queue age. */
async function inboundDmWindowError(
  accountExternalId: string,
  recipientExternalId: string,
  now = Date.now()
): Promise<string | null> {
  const lastInbound = await lastInboundMessageAt(accountExternalId, recipientExternalId);
  if (withinWindow(lastInbound, DM_WINDOW_MS, now)) return null;
  if (!lastInbound) {
    return "No inbound message on record; outside Instagram's 24-hour messaging window";
  }
  return "Outside Instagram's 24-hour messaging window";
}

/**
 * Instagram messaging: POST {ig-user-id}/messages. A comment reply goes to {comment_id} (one private
 * reply per comment, within 7 days); every other DM goes to the person's IGSID (24 h window).
 * Facebook-login accounts use graph.facebook.com with the Page token.
 */
export async function sendPrivateReply(
  base: string,
  igUserId: string,
  token: string,
  row: QueueRow
): Promise<SendOutcome> {
  try {
    const res = await fetch(`${base}/${encodeURIComponent(igUserId)}/messages`, {
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
    "select id, external_id, access_token_enc, auth_type from socialapp.social_accounts where platform='instagram' and status='active' order by created_at"
  );

  let left = Math.max(0, Math.floor(limit));
  // Automated DMs sent this UTC month per user (plan limit), counted once per run.
  const monthlyByUser = new Map<string, number>();
  // Monthly limit per user (plan + referral bonus), read once per run through the pool,
  // outside the per-account transaction so a read error can never abort it.
  const limitByUser = new Map<string, Awaited<ReturnType<typeof monthlyAutoDmLimit>>>();
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
      const advLock = await client.query<{ locked: boolean }>(
        "select pg_try_advisory_xact_lock(hashtext($1::text), hashtext($2::text)) as locked",
        [DM_SEND_ADVISORY_NS, account.id]
      );
      if (advLock.rows[0]?.locked !== true) {
        await client.query("commit");
        continue;
      }
      const freshRes = await client.query<{ status: string; dm_cooldown_until: Date | null }>(
        "select status, dm_cooldown_until from socialapp.social_accounts where id=$1",
        [account.id]
      );
      const fresh = freshRes.rows[0];
      if (!fresh || fresh.status !== "active") {
        await client.query("commit");
        continue;
      }
      if (fresh.dm_cooldown_until != null && fresh.dm_cooldown_until.getTime() > Date.now()) {
        await client.query("commit");
        continue;
      }
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
        `select q.id, q.user_id, q.rule_id, q.contact_id, q.comment_id, q.recipient_external_id, q.message, q.attempts, q.kind, q.created_at
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
        if (hasUnresolvedLinkToken(row.message)) {
          // Never send a literal {{link}}: fail the item with a reason the user can act on.
          await client.query(
            "update socialapp.dm_queue set status='failed', last_error=$2 where id=$1",
            [row.id, UNRESOLVED_LINK_ERROR]
          );
          console.error("sendDueDms: unresolved {{link}} in queue row", row.id);
          result.failed += 1;
          continue;
        }
        const automated = row.kind !== "manual_reply";
        if (automated) {
          let used = monthlyByUser.get(row.user_id);
          if (used === undefined) {
            const usedRes = await client.query<{ n: number }>(
              `select count(*)::int as n from socialapp.dm_queue
               where user_id=$1 and status='sent' and kind <> 'manual_reply'
                 and sent_at >= (date_trunc('month', now() at time zone 'UTC') at time zone 'UTC')`,
              [row.user_id]
            );
            used = usedRes.rows[0]?.n ?? 0;
            monthlyByUser.set(row.user_id, used);
          }
          let limits = limitByUser.get(row.user_id);
          if (!limits) {
            limits = await monthlyAutoDmLimit(row.user_id);
            limitByUser.set(row.user_id, limits);
          }
          if (used >= limits.limit) {
            await client.query(
              "update socialapp.dm_queue set status='skipped', last_error=$2 where id=$1",
              [row.id, autoDmLimitMessage(limits.limit, limits.plan)]
            );
            result.skipped += 1;
            continue;
          }
        }
        let windowError: string | null;
        try {
          windowError = row.comment_id
            ? messagingWindowError(row)
            : await inboundDmWindowError(account.external_id, row.recipient_external_id);
        } catch (err) {
          // Keep this DM pending and carry on: never roll back DMs this run already sent.
          console.error("sendDueDms: window check failed, will retry row", row.id, err instanceof Error ? err.message : err);
          await client.query(
            "update socialapp.dm_queue set last_error=$2, next_attempt_at=now() + interval '1 minute' where id=$1",
            [row.id, "Could not check Instagram's messaging window; will retry"]
          );
          result.retried += 1;
          continue;
        }
        if (windowError) {
          await client.query(
            "update socialapp.dm_queue set status='skipped', last_error=$2 where id=$1",
            [row.id, windowError]
          );
          result.skipped += 1;
          continue;
        }

        let sendRow = row;
        if (row.kind === "follow_check") {
          // Durable follower re-check for a gated link (queued when Instagram did not answer).
          const following = await isFollower(row.recipient_external_id, token, account.auth_type);
          if (following === null) {
            const attempts = row.attempts + 1;
            if (attempts >= MAX_ATTEMPTS) {
              await client.query(
                "update socialapp.dm_queue set status='failed', attempts=$2, last_error=$3 where id=$1",
                [row.id, attempts, FOLLOW_CHECK_GAVE_UP]
              );
              console.error("sendDueDms: follower check gave up for row", row.id);
              result.failed += 1;
            } else {
              await client.query(
                "update socialapp.dm_queue set attempts=$2, last_error=$3, next_attempt_at=now() + ($4::int * interval '1 millisecond') where id=$1",
                [row.id, attempts, "Instagram did not answer the follower check; retrying", nextAttemptDelayMs(row.attempts)]
              );
              result.retried += 1;
            }
            continue;
          }
          if (following === false) {
            await client.query(
              "update socialapp.dm_queue set kind='follow_nudge', message=$2 where id=$1",
              [row.id, FOLLOW_NUDGE_MESSAGE]
            );
            sendRow = { ...row, kind: "follow_nudge", message: FOLLOW_NUDGE_MESSAGE };
          }
        }

        const outcome = await sendPrivateReply(graphBaseFor(account.auth_type), account.external_id, token, sendRow);
        left -= 1;
        if (outcome.ok) {
          await client.query(
            "update socialapp.dm_queue set status='sent', sent_at=now(), attempts=attempts+1, last_error=null where id=$1",
            [row.id]
          );
          if (automated) monthlyByUser.set(row.user_id, (monthlyByUser.get(row.user_id) ?? 0) + 1);
          if (sendRow.kind === "follow_check") {
            await client.query("update socialapp.dm_queue set kind='gated_link' where id=$1 and kind='follow_check'", [row.id]);
            // The follower-gated link finally went out: log the lead-magnet delivery the webhook
            // path could not (it only records when the link is queued straight away). Best effort, never throws.
            if (row.rule_id && row.contact_id) await recordLeadMagnetDelivery(row.user_id, row.rule_id, row.contact_id);
          }
          if (shouldPublicReply(sendRow)) {
            try {
              const r = await query<{ public_reply: string | null }>("select public_reply from socialapp.dm_rules where id=$1 and user_id=$2", [row.rule_id, row.user_id]);
              const text = choosePublicReply(r[0]?.public_reply);
              if (text) {
                const pr = await sendPublicCommentReply(graphBaseFor(account.auth_type), row.comment_id!, token, text);
                if (!pr.ok) console.error("public comment reply failed for row", row.id, pr.error);
              }
            } catch (err) {
              console.error("public reply lookup failed (run db:migrate?)", err instanceof Error ? err.message : err);
            }
          }
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
