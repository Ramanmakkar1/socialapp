// Admin → System: job health, channel token health, integration env status and DB migrations.
//
// There is no job-run log table: the cron routes (/api/jobs/*) don't record their runs. Job health
// is read from what each job writes: published posts and overdue scheduled ones (publish-posts),
// sent and overdue DMs (send-dms), tokens past or near expiry (refresh-tokens refreshes anything
// expiring within 10 days) and post insights timestamps (refresh-insights).
// Env status reports names and set/unset only, never values.
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { query } from "@/lib/db";
import { ADMIN_PAGE_SIZE, pageSlice, pageWindow } from "@/lib/adminPaging";

export type JobHealth = {
  lastPublished: Date | null;
  overdueScheduled: number;
  stuckPublishing: number;
  lastDmSent: Date | null;
  overdueDms: number;
  tokensPastExpiry: number;
  tokensExpiring3d: number;
  lastInsights: Date | null;
  lastMetaWebhook: Date | null;
};

// Every subquery is an index range or an index-ordered LIMIT 1:
// scheduled_posts (status, scheduled_at) / (updated_at desc) [051], dm_queue (status, created_at) /
// (status, next_attempt_at), post_targets (insights_at) [051], events (source, received_at desc).
export const JOB_HEALTH_SQL = `
  select
    (select updated_at from socialapp.scheduled_posts where status = 'published' order by updated_at desc limit 1) as "lastPublished",
    (select count(*)::int from socialapp.scheduled_posts where status = 'scheduled' and scheduled_at < now() - interval '10 minutes') as "overdueScheduled",
    (select count(*)::int from socialapp.scheduled_posts where status = 'publishing' and updated_at < now() - interval '30 minutes') as "stuckPublishing",
    (select max(sent_at) from socialapp.dm_queue where status = 'sent' and created_at >= now() - interval '7 days') as "lastDmSent",
    (select count(*)::int from socialapp.dm_queue where status = 'pending' and next_attempt_at < now() - interval '15 minutes') as "overdueDms",
    (select count(*)::int from socialapp.social_accounts where status = 'active' and token_expires_at < now()) as "tokensPastExpiry",
    (select count(*)::int from socialapp.social_accounts where status = 'active' and token_expires_at >= now() and token_expires_at < now() + interval '3 days') as "tokensExpiring3d",
    (select insights_at from socialapp.post_targets where insights_at is not null order by insights_at desc limit 1) as "lastInsights",
    (select received_at from socialapp.events where source = 'meta' order by received_at desc limit 1) as "lastMetaWebhook"`;

export async function getJobHealth(): Promise<JobHealth> {
  const rows = await query<JobHealth>(JOB_HEALTH_SQL);
  return rows[0];
}

export type JobState = "ok" | "warn" | "err" | "unknown";

/** A job looks healthy when nothing it should have handled is overdue; "unknown" when there's nothing to judge by. */
export function jobState(overdue: number, lastActivity: Date | null): JobState {
  if (overdue > 0) return overdue >= 5 ? "err" : "warn";
  return lastActivity ? "ok" : "unknown";
}

export type TokenHealthRow = { platform: string; active: number; expired: number; disconnected: number; past_expiry: number; expiring_7d: number; failed_7d: number };

/** Per network: account statuses, tokens past/near expiry, and failed post targets in the last 7 days. */
export async function getTokenHealth(): Promise<TokenHealthRow[]> {
  const [accounts, youtube, failures] = await Promise.all([
    query<Omit<TokenHealthRow, "failed_7d">>(
      `select platform,
              count(*) filter (where status = 'active')::int as active,
              count(*) filter (where status = 'expired')::int as expired,
              count(*) filter (where status = 'disconnected')::int as disconnected,
              count(*) filter (where status = 'active' and token_expires_at < now())::int as past_expiry,
              count(*) filter (where status = 'active' and token_expires_at >= now() and token_expires_at < now() + interval '7 days')::int as expiring_7d
         from socialapp.social_accounts group by platform`,
    ),
    query<{ active: number; disconnected: number }>(
      "select count(*) filter (where status = 'active')::int as active, count(*) filter (where status = 'disconnected')::int as disconnected from socialapp.youtube_channels",
    ),
    query<{ platform: string; n: number }>(
      `select t.platform, count(*)::int as n
         from socialapp.scheduled_posts p join socialapp.post_targets t on t.post_id = p.id
        where p.updated_at >= now() - interval '7 days' and t.status = 'failed'
        group by 1`,
    ),
  ]);
  return mergeTokenHealth(accounts, youtube[0] ?? { active: 0, disconnected: 0 }, failures);
}

export function mergeTokenHealth(
  accounts: Omit<TokenHealthRow, "failed_7d">[],
  youtube: { active: number; disconnected: number },
  failures: { platform: string; n: number }[],
): TokenHealthRow[] {
  const map = new Map<string, TokenHealthRow>();
  for (const a of accounts) map.set(a.platform, { ...a, failed_7d: 0 });
  if (youtube.active + youtube.disconnected > 0) {
    map.set("youtube", { platform: "youtube", active: youtube.active, expired: 0, disconnected: youtube.disconnected, past_expiry: 0, expiring_7d: 0, failed_7d: 0 });
  }
  for (const f of failures) {
    const row = map.get(f.platform) ?? { platform: f.platform, active: 0, expired: 0, disconnected: 0, past_expiry: 0, expiring_7d: 0, failed_7d: 0 };
    row.failed_7d = f.n;
    map.set(f.platform, row);
  }
  const score = (r: TokenHealthRow) => r.expired + r.past_expiry + r.failed_7d;
  return [...map.values()].sort((a, b) => score(b) - score(a) || a.platform.localeCompare(b.platform));
}

export type BrokenAccount = { id: string; user_id: string; email: string; platform: string; name: string | null; status: string; token_expires_at: Date | null; updated_at: Date };

/** Accounts that need a reconnect: expired, or active with a token already past its expiry. */
export async function listBrokenAccounts(page: number): Promise<{ rows: BrokenAccount[]; hasNext: boolean }> {
  const { limit, offset } = pageWindow(page);
  const rows = await query<BrokenAccount>(
    `select a.id, a.user_id, u.email, a.platform, coalesce(nullif(a.username, ''), a.page_name) as name, a.status, a.token_expires_at, a.updated_at
       from socialapp.social_accounts a join socialapp.users u on u.id = a.user_id
      where a.status = 'expired' or (a.status = 'active' and a.token_expires_at < now())
      order by a.updated_at desc, a.id
      limit $1 offset $2`,
    [limit, offset],
  );
  return pageSlice(rows, ADMIN_PAGE_SIZE);
}

// ---- Env status (names only) -------------------------------------------------------------------

export const ENV_GROUPS: { title: string; names: string[] }[] = [
  { title: "Core", names: ["DATABASE_URL", "TOKEN_ENCRYPTION_KEY", "CRON_SECRET", "NEXT_PUBLIC_SITE_URL", "ADMIN_EMAILS", "MEDIA_URL_SECRET", "REMINDER_LINK_SECRET"] },
  { title: "Email", names: ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS", "EMAIL_FROM"] },
  { title: "Stripe", names: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_BILLING_WEBHOOK_SECRET", "STRIPE_BILLING_LIVE_PRICES", "STRIPE_PORTAL_CONFIGURATION_ID"] },
  { title: "AI", names: ["ANTHROPIC_API_KEY", "AI_REPLIES_ENABLED", "AI_MODEL", "AI_QUALITY_MODEL"] },
  { title: "Google sign-in", names: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
  { title: "Meta", names: ["META_APP_ID", "META_APP_SECRET", "META_LOGIN_CONFIG_ID", "META_WEBHOOK_VERIFY_TOKEN", "INSTAGRAM_APP_ID", "INSTAGRAM_APP_SECRET", "THREADS_APP_ID", "THREADS_APP_SECRET"] },
];

/** Which env vars are set (non-blank). Returns names and booleans only. */
export function envPresence(names: string[], env: Record<string, string | undefined>): { name: string; set: boolean }[] {
  return names.map((name) => ({ name, set: Boolean(env[name]?.trim()) }));
}

// ---- Migrations ----------------------------------------------------------------------------------

export type MigrationStatus = { applied: { name: string; applied_at: Date | null }[]; pending: string[]; unknown: string[]; filesAvailable: boolean };

/**
 * Files in db/migrations vs rows in socialapp.schema_migrations. pending = file not applied;
 * unknown = applied but no such file (renamed or from another branch).
 */
export function compareMigrations(files: string[] | null, applied: { name: string; applied_at: Date | null }[]): MigrationStatus {
  const done = new Set(applied.map((a) => a.name));
  if (!files) return { applied, pending: [], unknown: [], filesAvailable: false };
  const onDisk = new Set(files);
  return {
    applied,
    pending: files.filter((f) => !done.has(f)).sort(),
    unknown: applied.map((a) => a.name).filter((n) => !onDisk.has(n)).sort(),
    filesAvailable: true,
  };
}

/** Migration file names shipped with the app (next.config.ts traces db/migrations into the build), or null. */
// The files are traced explicitly (outputFileTracingIncludes), so the dynamic readdir is ignored by the tracer.
export async function migrationFiles(dir = join(/*turbopackIgnore: true*/ process.cwd(), "db", "migrations")): Promise<string[] | null> {
  try {
    return (await readdir(/*turbopackIgnore: true*/ dir)).filter((f) => f.endsWith(".sql")).sort();
  } catch {
    return null;
  }
}

export async function getMigrationStatus(): Promise<MigrationStatus> {
  const [files, applied] = await Promise.all([
    migrationFiles(),
    query<{ name: string; applied_at: Date | null }>("select name, applied_at from socialapp.schema_migrations order by applied_at desc nulls last, name desc"),
  ]);
  return compareMigrations(files, applied);
}
