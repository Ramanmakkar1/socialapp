// Admin → Automations (read-only, plus "pause rule"): Auto-DM rules across users, dm_queue health
// and send volume. dm_queue has statuses pending / sent / failed / skipped (002_dm_queue.sql); there
// is no "fatal" status, so failures are split by attempts: a failed row with fewer than
// MAX_ATTEMPTS attempts stopped on a fatal error (not retried), one at MAX_ATTEMPTS gave up after retries.
import { query } from "@/lib/db";
import { ADMIN_PAGE_SIZE, pageSlice, pageWindow } from "@/lib/adminPaging";
import { MAX_ATTEMPTS } from "@/lib/sendPolicy";

export const RULE_STATUSES = ["active", "paused"] as const;
export type RuleStatus = (typeof RULE_STATUSES)[number];

export type AdminRuleRow = {
  id: string;
  user_id: string;
  email: string;
  name: string | null;
  status: string;
  keywords: string[] | null;
  triggers: string[] | null;
  ai_replies: boolean | null;
  account: string | null;
  updated_at: Date;
  sent_30d: number;
};

export async function listAdminRules(input: { status: RuleStatus | ""; page: number }): Promise<{ rows: AdminRuleRow[]; hasNext: boolean }> {
  const { limit, offset } = pageWindow(input.page);
  const rows = await query<Omit<AdminRuleRow, "sent_30d">>(
    `select r.id, r.user_id, u.email, r.name, r.status, r.keywords, r.triggers, r.ai_replies,
            coalesce(nullif(a.username, ''), a.page_name) as account, r.updated_at
       from socialapp.dm_rules r
       join socialapp.users u on u.id = r.user_id
       left join socialapp.social_accounts a on a.id = r.social_account_id
      where ($1::text is null or r.status = $1::text)
      order by r.updated_at desc, r.id
      limit $2 offset $3`,
    [input.status || null, limit, offset],
  );
  const page = pageSlice(rows, ADMIN_PAGE_SIZE);
  const ids = page.rows.map((r) => r.id);
  // Sent in the last 30 days, only for this page's rules (dm_queue_status_created_idx).
  const sent = ids.length
    ? await query<{ rule_id: string; n: number }>(
        "select rule_id, count(*)::int as n from socialapp.dm_queue where status = 'sent' and created_at >= now() - interval '30 days' and rule_id = any($1::uuid[]) group by 1",
        [ids],
      )
    : [];
  const byRule = new Map(sent.map((s) => [s.rule_id, s.n]));
  return { rows: page.rows.map((r) => ({ ...r, sent_30d: byRule.get(r.id) ?? 0 })), hasNext: page.hasNext };
}

export type FailureKind = "fatal" | "gave_up" | "skipped";

/** How a finished-but-unsent dm_queue row ended. */
export function failureKind(status: string, attempts: number): FailureKind {
  if (status === "skipped") return "skipped";
  return attempts >= MAX_ATTEMPTS ? "gave_up" : "fatal";
}

export const FAILURE_LABEL: Record<FailureKind, string> = {
  fatal: "fatal (not retried)",
  gave_up: `gave up after ${MAX_ATTEMPTS} tries`,
  skipped: "skipped",
};

export type QueueHealth = {
  pendingDue: number;
  pendingLater: number;
  retrying: number;
  oldestDue: Date | null;
  reasons: { kind: FailureKind; reason: string; n: number; last: Date }[];
  totals: Record<FailureKind, number>;
};

export async function getQueueHealth(): Promise<QueueHealth> {
  const [pending, reasons] = await Promise.all([
    query<{ due: number; later: number; retrying: number; oldest_due: Date | null }>(
      `select count(*) filter (where next_attempt_at <= now())::int as due,
              count(*) filter (where next_attempt_at > now())::int as later,
              count(*) filter (where attempts > 0)::int as retrying,
              min(next_attempt_at) filter (where next_attempt_at <= now()) as oldest_due
         from socialapp.dm_queue where status = 'pending'`,
    ),
    // Long numbers (ids, timestamps) are folded so the same error groups together.
    query<{ status: string; gave_up: boolean; reason: string; n: number; last: Date }>(
      `select status, (attempts >= $1) as gave_up,
              left(regexp_replace(coalesce(nullif(last_error, ''), '(no reason recorded)'), '[0-9]{6,}', '…', 'g'), 160) as reason,
              count(*)::int as n, max(created_at) as last
         from socialapp.dm_queue
        where status in ('failed', 'skipped') and created_at >= now() - interval '30 days'
        group by 1, 2, 3
        order by n desc
        limit 30`,
      [MAX_ATTEMPTS],
    ),
  ]);
  const totals: Record<FailureKind, number> = { fatal: 0, gave_up: 0, skipped: 0 };
  const rows = reasons.map((r) => {
    const kind = failureKind(r.status, r.gave_up ? MAX_ATTEMPTS : 0);
    totals[kind] += r.n;
    return { kind, reason: r.reason, n: r.n, last: r.last };
  });
  const p = pending[0];
  return { pendingDue: p?.due ?? 0, pendingLater: p?.later ?? 0, retrying: p?.retrying ?? 0, oldestDue: p?.oldest_due ?? null, reasons: rows, totals };
}

/** Auto-DMs sent per UTC day, oldest → today (30 values). */
export async function getDmsSentPerDay(now = new Date()): Promise<number[]> {
  const rows = await query<{ d: string; n: number }>(
    "select to_char(date_trunc('day', sent_at at time zone 'UTC'), 'YYYY-MM-DD') as d, count(*)::int as n from socialapp.dm_queue where status = 'sent' and sent_at >= now() - interval '30 days' group by 1",
  );
  return dailySeries(new Map(rows.map((r) => [r.d, r.n])), 30, now);
}

/** `days` values (oldest → today, UTC) from a YYYY-MM-DD → count map; missing days are 0. */
export function dailySeries(map: Map<string, number>, days: number, now = new Date()): number[] {
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const out: number[] = [];
  for (let i = days - 1; i >= 0; i--) out.push(map.get(new Date(today - i * 86_400_000).toISOString().slice(0, 10)) ?? 0);
  return out;
}
