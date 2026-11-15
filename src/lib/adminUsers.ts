// Admin → Users: the searchable user list and the per-user detail view. Read-only queries; the
// only mutating admin action (resend verification) is in src/app/admin/users/actions.ts.
//
// What does NOT exist in the schema (so the pages show what there is and say so):
//   - no "last active" column: the newest session (sessions.created_at) = last sign-in;
//   - no plan override and no disabled/suspended flag: the plan comes only from Stripe
//     (billing_subscriptions) or the admin allow-list (src/lib/planLimits.ts planForUser).
import { query } from "@/lib/db";
import { isAdminEmail } from "@/lib/admin";
import { ADMIN_PAGE_SIZE, containsPattern, pageSlice, pageWindow } from "@/lib/adminPaging";
import { planFromBilling, type BillingRow } from "@/lib/billingState";
import { utcMonthRange } from "@/lib/planLimits";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string | null;
  created_at: Date;
  verified: boolean;
  plan: BillingRow["plan"];
  status: string | null;
  past_due_since: Date | null;
  channels: number;
  posts_month: number;
  dms_month: number;
  last_sign_in: Date | null;
};

/**
 * The plan a user effectively has, with the same rules as planForUser(): verified allow-listed
 * admins get Agency; everyone else gets planFromBilling (paid while active/trialing or in the
 * past_due grace period).
 */
export function effectivePlan(u: { email: string; verified: boolean } & BillingRow, now = new Date()): { plan: "Free" | "Pro" | "Agency"; viaAdmin: boolean } {
  if (u.verified && isAdminEmail(u.email)) return { plan: "Agency", viaAdmin: true };
  return { plan: planFromBilling(u, now), viaAdmin: false };
}

// The page of users is picked first (newest first, using the search), then the per-user counts
// run only for those ≤26 ids. Counts use: social_accounts(user_id) [051], youtube_channels(user_id),
// scheduled_posts(user_id, scheduled_at), dm_queue(user_id, sent_at) where sent, sessions(user_id).
export const ADMIN_USERS_SQL = `
  with page as (
    select u.id, u.email, u.name, u.created_at, u.email_verified_at
      from socialapp.users u
     where $1::text is null
        or u.email ilike $1 or u.name ilike $1
        or exists (select 1 from socialapp.social_accounts sa where sa.user_id = u.id and (sa.username ilike $1 or sa.page_name ilike $1))
        or exists (select 1 from socialapp.youtube_channels y where y.user_id = u.id and y.title ilike $1)
     order by u.created_at desc, u.id
     limit $2 offset $3
  )
  select p.id, p.email, p.name, p.created_at, (p.email_verified_at is not null) as verified,
         b.plan, b.status, b.past_due_since,
         (select count(*)::int from socialapp.social_accounts sa where sa.user_id = p.id and sa.status <> 'disconnected')
           + (select count(*)::int from socialapp.youtube_channels y where y.user_id = p.id and y.status <> 'disconnected') as channels,
         (select count(*)::int from socialapp.scheduled_posts sp
           where sp.user_id = p.id and sp.status in ('scheduled','publishing','published') and sp.scheduled_at >= $4 and sp.scheduled_at < $5) as posts_month,
         (select count(*)::int from socialapp.dm_queue q where q.user_id = p.id and q.status = 'sent' and q.sent_at >= $4 and q.sent_at < $5) as dms_month,
         (select max(s.created_at) from socialapp.sessions s where s.user_id = p.id) as last_sign_in
    from page p
    left join socialapp.billing_subscriptions b on b.user_id = p.id
   order by p.created_at desc, p.id`;

export async function listAdminUsers(input: { q: string; page: number; now?: Date }): Promise<{ rows: AdminUserRow[]; hasNext: boolean }> {
  const { limit, offset } = pageWindow(input.page);
  const { start, end } = utcMonthRange(input.now ?? new Date());
  const rows = await query<AdminUserRow>(ADMIN_USERS_SQL, [containsPattern(input.q), limit, offset, start.toISOString(), end.toISOString()]);
  return pageSlice(rows, ADMIN_PAGE_SIZE);
}

export type AdminUserDetail = {
  id: string;
  email: string;
  name: string | null;
  created_at: Date;
  email_verified_at: Date | null;
  google: boolean;
  has_password: boolean;
  referred: boolean;
};

export type AdminChannel = {
  id: string;
  kind: "social" | "youtube";
  platform: string;
  name: string | null;
  status: string;
  auth_type: string | null;
  token_expires_at: Date | null;
  dm_cooldown_until: Date | null;
  created_at: Date;
  updated_at: Date | null;
};

export type AdminBilling = {
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  plan: BillingRow["plan"];
  billing_interval: string | null;
  status: string | null;
  current_period_end: Date | null;
  cancel_at_period_end: boolean;
  cancel_at: Date | null;
  past_due_since: Date | null;
  updated_at: Date;
};

export async function getAdminUser(id: string): Promise<AdminUserDetail | null> {
  const rows = await query<AdminUserDetail>(
    `select id, email, name, created_at, email_verified_at, (google_sub is not null) as google,
            (password_hash is not null) as has_password, (referred_by_user_id is not null) as referred
       from socialapp.users where id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function getAdminUserChannels(id: string): Promise<AdminChannel[]> {
  return query<AdminChannel>(
    `select id, 'social' as kind, platform, coalesce(nullif(username, ''), page_name) as name, status, auth_type,
            token_expires_at, dm_cooldown_until, created_at, updated_at
       from socialapp.social_accounts where user_id = $1
     union all
     select id, 'youtube' as kind, 'youtube' as platform, title as name, status, null, null, null, created_at, updated_at
       from socialapp.youtube_channels where user_id = $1
     order by created_at`,
    [id],
  );
}

export async function getAdminUserBilling(id: string): Promise<AdminBilling | null> {
  const rows = await query<AdminBilling>(
    `select stripe_customer_id, stripe_subscription_id, plan, billing_interval, status, current_period_end,
            cancel_at_period_end, cancel_at, past_due_since, updated_at
       from socialapp.billing_subscriptions where user_id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export type AdminUserUsage = {
  ai: { kind: string; n: number }[];
  dmsSent: number;
  postsScheduled: number;
  liveSessions: number;
  lastSignIn: Date | null;
};

/** This UTC month's AI requests by kind, DMs sent, posts counted toward the plan, and sessions. */
export async function getAdminUserUsage(id: string, now = new Date()): Promise<AdminUserUsage> {
  const { start, end } = utcMonthRange(now);
  const [ai, counts] = await Promise.all([
    query<{ kind: string; n: number }>(
      "select kind, count(*)::int as n from socialapp.ai_requests where user_id = $1 and created_at >= $2 and created_at < $3 group by 1 order by 2 desc",
      [id, start.toISOString(), end.toISOString()],
    ),
    query<{ dms: number; posts: number; live: number; last_sign_in: Date | null }>(
      `select
         (select count(*)::int from socialapp.dm_queue where user_id = $1 and status = 'sent' and sent_at >= $2 and sent_at < $3) as dms,
         (select count(*)::int from socialapp.scheduled_posts where user_id = $1 and status in ('scheduled','publishing','published') and scheduled_at >= $2 and scheduled_at < $3) as posts,
         (select count(*)::int from socialapp.sessions where user_id = $1 and expires_at > now()) as live,
         (select max(created_at) from socialapp.sessions where user_id = $1) as last_sign_in`,
      [id, start.toISOString(), end.toISOString()],
    ),
  ]);
  const c = counts[0];
  return { ai, dmsSent: c?.dms ?? 0, postsScheduled: c?.posts ?? 0, liveSessions: c?.live ?? 0, lastSignIn: c?.last_sign_in ?? null };
}

export type AdminAuditEntry = { id: string; admin_email: string; action: string; details: Record<string, unknown> | null; created_at: Date };

/** The latest admin actions taken on this user (admin_audit_target_idx). */
export async function getAdminUserAudit(id: string, limit = 10): Promise<AdminAuditEntry[]> {
  return query<AdminAuditEntry>(
    "select id::text, admin_email, action, details, created_at from socialapp.admin_audit where target_user_id = $1 order by created_at desc limit $2",
    [id, limit],
  );
}
