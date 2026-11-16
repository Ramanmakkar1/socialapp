// Server only: sends queued DMs through the official Instagram API.
import type pg from "pg";
import { decryptToken } from "@/lib/crypto";
import { getPool, query } from "@/lib/db";
import { isFollower } from "@/lib/followCheck";
import { recordLeadMagnetDelivery } from "@/lib/leadMagnets";
import { FOLLOW_NUDGE_MESSAGE } from "@/lib/messages";
import { hasUnresolvedLinkToken } from "@/lib/rules";
import { autoDmLimitMessage, monthlyAutoDmLimit } from "@/lib/planLimits";
import { inBackground, notifyDmLimitReached } from "@/lib/emailNotify";
import { isFeatureReady } from "@/lib/featureReadiness";
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
/** Namespace for the per-Instagram-account session advisory lock in sendDueDms. */
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

/**
 * Delivery model (no DM is ever sent inside a database transaction):
 *  1. A session advisory lock per Instagram account serializes runs for that account (released on
 *     unlock, or by Postgres when the connection dies).
 *  2. Due rows are claimed in a short transaction: they stay 'pending' but get a lease
 *     (next_attempt_at = now() + DM_LEASE_MS), so no other run picks them up meanwhile.
 *  3. Each row is sent to Instagram outside any transaction and its result is written straight
 *     away in its own statement, so a later error, timeout or crash never rolls back a DM that was
 *     already delivered (the old single transaction did, and those DMs went out again).
 *  4. Claimed rows that were never attempted are released at the end of the run. A row whose
 *     result could not be recorded (crash, DB error) keeps its lease and becomes due again once the
 *     lease expires; rows already marked 'sent' are never picked up again.
 */
export const DM_LEASE_MS = 10 * 60 * 1000;
/** Upper bound on fair-share rounds per run (each round re-offers unused budget). */
const MAX_FAIR_ROUNDS = 4;

type RunState = {
  result: SendResult;
  /** Automated DMs sent this UTC month per user (plan limit), counted once per run. */
  monthlyByUser: Map<string, number>;
  /** Monthly limit per user (plan + referral bonus), read once per run through the pool. */
  limitByUser: Map<string, Awaited<ReturnType<typeof monthlyAutoDmLimit>>>;
  /** Users whose monthly-limit e-mail was already triggered this run. */
  limitNotified: Set<string>;
};

type AccountOutcome = {
  /** How much of the run's budget this account used (sends + rule skips, as before). */
  used: number;
  claimed: number;
  dueLimit: number;
  /** The share (not the hourly limit or the 500-row cap) limited how many rows were claimed. */
  shareBound: boolean;
  /** Stopped early (token expired / rate limited): no more rows this run. */
  stopped: boolean;
};

/** One account's turn: claim up to `share` due rows, send them, record each result. */
async function sendForAccount(pool: pg.Pool, account: AccountRow, token: string, share: number, run: RunState): Promise<AccountOutcome> {
  const out: AccountOutcome = { used: 0, claimed: 0, dueLimit: 0, shareBound: false, stopped: false };
  let left = share;
  const client = await pool.connect();
  let locked = false;
  let broken: Error | undefined;
  // Claimed rows not yet handled; released (lease cleared) when the run stops early.
  const unhandled = new Set<string>();
  try {
    const advLock = await client.query<{ locked: boolean }>(
      "select pg_try_advisory_lock(hashtext($1::text), hashtext($2::text)) as locked",
      [DM_SEND_ADVISORY_NS, account.id]
    );
    if (advLock.rows[0]?.locked !== true) return out;
    locked = true;

    // --- 1. Claim (short transaction) ---
    let due: QueueRow[] = [];
    await client.query("begin");
    try {
      const freshRes = await client.query<{ status: string; dm_cooldown_until: Date | null }>(
        "select status, dm_cooldown_until from socialapp.social_accounts where id=$1",
        [account.id]
      );
      const fresh = freshRes.rows[0];
      const cooling = fresh?.dm_cooldown_until != null && fresh.dm_cooldown_until.getTime() > Date.now();
      const lockRes =
        fresh && fresh.status === "active" && !cooling
          ? await client.query(
              "select id from socialapp.social_accounts where id=$1 and status='active' for update skip locked",
              [account.id]
            )
          : { rows: [] };
      if (lockRes.rows.length) {
        const sentRes = await client.query<{ n: number }>(
          "select count(*)::int as n from socialapp.dm_queue where social_account_id=$1 and status='sent' and sent_at > now() - interval '1 hour'",
          [account.id]
        );
        const budget = Math.min(remainingBudget(sentRes.rows[0]?.n ?? 0), left);
          out.shareBound = left <= remainingBudget(sentRes.rows[0]?.n ?? 0) && left <= DUE_ROW_LIMIT;
        if (budget > 0) {
          const dueLimit = Math.min(DUE_ROW_LIMIT, budget);
          const dueRes = await client.query<QueueRow>(
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
          due = dueRes.rows;
          out.claimed = due.length;
          out.dueLimit = dueLimit;
          if (due.length) {
            await client.query(
              "update socialapp.dm_queue set next_attempt_at=now() + ($2::int * interval '1 millisecond') where id = any($1::uuid[]) and status='pending'",
              [due.map((r) => r.id), DM_LEASE_MS]
            );
          }
        }
      }
      await client.query("commit");
    } catch (err) {
      await client.query("rollback").catch(() => {});
      throw err;
    }
    for (const row of due) unhandled.add(row.id);

    // --- 2. Send each claimed row; every result is written immediately (autocommit) ---
    for (const row of due) {
      if (left <= 0) break;
      unhandled.delete(row.id);
      const gate = await gateDmSendByRule(client, row, account.id);
      if (gate.action === "wait") {
        // Rule paused since the claim: give the lease back so it waits like any paused row.
        await client.query("update socialapp.dm_queue set next_attempt_at=now() where id=$1 and status='pending'", [row.id]);
        continue;
      }
      if (gate.action === "skip") {
        await client.query(
          "update socialapp.dm_queue set status='skipped', last_error=$2 where id=$1",
          [row.id, gate.error]
        );
        run.result.skipped += 1;
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
        run.result.failed += 1;
        continue;
      }
      const automated = row.kind !== "manual_reply";
      if (automated) {
        let used = run.monthlyByUser.get(row.user_id);
        if (used === undefined) {
          const usedRes = await client.query<{ n: number }>(
            `select count(*)::int as n from socialapp.dm_queue
             where user_id=$1 and status='sent' and kind <> 'manual_reply'
               and sent_at >= (date_trunc('month', now() at time zone 'UTC') at time zone 'UTC')`,
            [row.user_id]
          );
          used = usedRes.rows[0]?.n ?? 0;
          run.monthlyByUser.set(row.user_id, used);
        }
        let limits = run.limitByUser.get(row.user_id);
        if (!limits) {
          limits = await monthlyAutoDmLimit(row.user_id);
          run.limitByUser.set(row.user_id, limits);
        }
        if (used >= limits.limit) {
          await client.query(
            "update socialapp.dm_queue set status='skipped', last_error=$2 where id=$1",
            [row.id, autoDmLimitMessage(limits.limit, limits.plan)]
          );
          run.result.skipped += 1;
          if (!run.limitNotified.has(row.user_id)) {
            // Tell the user once a month that auto-DMs stopped (never blocks or fails the send loop).
            run.limitNotified.add(row.user_id);
            const l = limits;
            inBackground("dm_limit", () =>
              notifyDmLimitReached(row.user_id, { limit: l.limit, plan: l.plan, canUpgrade: l.plan !== "Agency" && isFeatureReady("billing") }),
            );
          }
          continue;
        }
      }
      let windowError: string | null;
      try {
        windowError = row.comment_id
          ? messagingWindowError(row)
          : await inboundDmWindowError(account.external_id, row.recipient_external_id);
      } catch (err) {
        // Keep this DM pending and carry on.
        console.error("sendDueDms: window check failed, will retry row", row.id, err instanceof Error ? err.message : err);
        await client.query(
          "update socialapp.dm_queue set last_error=$2, next_attempt_at=now() + interval '1 minute' where id=$1",
          [row.id, "Could not check Instagram's messaging window; will retry"]
        );
        run.result.retried += 1;
        continue;
      }
      if (windowError) {
        await client.query(
          "update socialapp.dm_queue set status='skipped', last_error=$2 where id=$1",
          [row.id, windowError]
        );
        run.result.skipped += 1;
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
            run.result.failed += 1;
          } else {
            await client.query(
              "update socialapp.dm_queue set attempts=$2, last_error=$3, next_attempt_at=now() + ($4::int * interval '1 millisecond') where id=$1",
              [row.id, attempts, "Instagram did not answer the follower check; retrying", nextAttemptDelayMs(row.attempts)]
            );
            run.result.retried += 1;
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

      // Outside any transaction. If recording the result below fails, the row keeps its lease
      // and is only retried after DM_LEASE_MS.
      const outcome = await sendPrivateReply(graphBaseFor(account.auth_type), account.external_id, token, sendRow);
      left -= 1;
      if (outcome.ok) {
        await client.query(
          "update socialapp.dm_queue set status='sent', sent_at=now(), attempts=attempts+1, last_error=null where id=$1",
          [row.id]
        );
        if (automated) run.monthlyByUser.set(row.user_id, (run.monthlyByUser.get(row.user_id) ?? 0) + 1);
        run.result.sent += 1;
        // Follow-ups are best effort: a failure here never touches the 'sent' row above.
        try {
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
        } catch (err) {
          console.error("sendDueDms: post-send bookkeeping failed for row", row.id, err instanceof Error ? err.message : err);
        }
        continue;
      }
      if (outcome.kind === "token") {
        // Token expired or revoked: keep the DM pending (lease released), flag the account so the app asks to reconnect.
        await client.query(
          "update socialapp.dm_queue set last_error=$2, next_attempt_at=now() where id=$1",
          [row.id, "Instagram access expired. Reconnect Instagram in Settings."]
        );
        await client.query(
          "update socialapp.social_accounts set status='expired', updated_at=now() where id=$1 and status='active'",
          [account.id]
        );
        run.result.retried += 1;
        out.stopped = true;
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
        run.result.retried += 1;
        out.stopped = true;
        break;
      }
      const attempts = row.attempts + 1;
      if (outcome.kind === "fatal" || attempts >= MAX_ATTEMPTS) {
        await client.query(
          "update socialapp.dm_queue set status='failed', attempts=$2, last_error=$3 where id=$1",
          [row.id, attempts, outcome.error]
        );
        run.result.failed += 1;
      } else {
        await client.query(
          "update socialapp.dm_queue set attempts=$2, last_error=$3, next_attempt_at=now() + ($4::int * interval '1 millisecond') where id=$1",
          [row.id, attempts, outcome.error, nextAttemptDelayMs(row.attempts)]
        );
        run.result.retried += 1;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("sendDueDms: account", account.id, cleanError(message, token));
  } finally {
    // Rows claimed but never attempted (early stop or error): give the lease back right away.
    if (unhandled.size) {
      await client
        .query("update socialapp.dm_queue set next_attempt_at=now() where id = any($1::uuid[]) and status='pending'", [[...unhandled]])
        .catch(() => {});
    }
    if (locked) {
      await client
        .query("select pg_advisory_unlock(hashtext($1::text), hashtext($2::text))", [DM_SEND_ADVISORY_NS, account.id])
        .catch((err: unknown) => {
          // Drop the connection instead of returning it to the pool with the lock still held.
          broken = err instanceof Error ? err : new Error(String(err));
        });
    }
    client.release(broken);
    out.used = share - left;
  }
  return out;
}

/**
 * Sends due DMs with a global ceiling of `limit` per run, shared fairly between Instagram accounts:
 * each account with due rows gets an equal share of what is left (ceil(left / accounts left)), and
 * whatever an account does not use goes to the accounts after it and, in later rounds, to the
 * accounts that still have more due. One busy account can no longer starve the others (it used to
 * be one budget spent oldest-account-first). The hourly per-account limit still applies on top.
 */
export async function sendDueDms(limit = 50): Promise<SendResult> {
  const run: RunState = { result: { sent: 0, retried: 0, failed: 0, skipped: 0 }, monthlyByUser: new Map(), limitByUser: new Map(), limitNotified: new Set() };
  const pool = getPool();
  const accounts = await pool.query<AccountRow>(
    `select id, external_id, access_token_enc, auth_type from socialapp.social_accounts
     where platform='instagram' and status='active'
       and exists (select 1 from socialapp.dm_queue q where q.social_account_id = social_accounts.id and q.status='pending' and q.next_attempt_at <= now())
     order by created_at`
  );

  let round: { account: AccountRow; token: string }[] = [];
  for (const account of accounts.rows) {
    if (!account.access_token_enc) continue;
    try {
      round.push({ account, token: decryptToken(account.access_token_enc) });
    } catch {
      console.error("sendDueDms: cannot decrypt token for account", account.id);
    }
  }

  let left = Math.max(0, Math.floor(limit));
  for (let pass = 0; pass < MAX_FAIR_ROUNDS && left > 0 && round.length > 0; pass++) {
    const more: typeof round = [];
    for (let i = 0; i < round.length && left > 0; i++) {
      const share = Math.ceil(left / (round.length - i));
      const out = await sendForAccount(pool, round[i].account, round[i].token, share, run);
      left -= out.used;
      // Claimed a full share and was not stopped: it probably has more due for a later round.
      if (!out.stopped && out.shareBound && out.claimed > 0 && out.claimed >= out.dueLimit) more.push(round[i]);
    }
    round = more;
  }
  return run.result;
}
