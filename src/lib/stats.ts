// Server-only dashboard numbers for one user.
import { isDbConfigured, query } from "@/lib/db";

export type DashboardStats = {
  scheduled: number;
  failed: number;
  dmsSent: number;
  leads: number;
  linkClicks: number;
  hasAccount: boolean;
  hasRule: boolean;
  hasPost: boolean;
};

export const EMPTY_STATS: DashboardStats = { scheduled: 0, failed: 0, dmsSent: 0, leads: 0, linkClicks: 0, hasAccount: false, hasRule: false, hasPost: false };

export type RuleStats = {
  id: string;
  name: string;
  status: string;
  dmsSent: number;
  dmsFailed: number;
  leads: number;
  clicks: number;
};

export async function getRuleStats(userId: string): Promise<RuleStats[]> {
  if (!isDbConfigured()) {
    return [];
  }
  return query<RuleStats>(
    `select r.id, r.name, r.status,
      (select count(*)::int from socialapp.dm_queue q where q.rule_id = r.id and q.status = 'sent') as "dmsSent",
      (select count(*)::int from socialapp.dm_queue q where q.rule_id = r.id and q.status = 'failed') as "dmsFailed",
      (select count(*)::int from socialapp.contacts c where c.source_rule_id = r.id) as "leads",
      (select coalesce(sum(s.clicks), 0)::int from socialapp.short_links s where s.rule_id = r.id) as "clicks"
    from socialapp.dm_rules r
    where r.user_id = $1
    order by r.created_at desc
    limit 100`,
    [userId]
  );
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  if (!isDbConfigured()) {
    return EMPTY_STATS;
  }
  const rows = await query<DashboardStats>(
    `select
      (select count(*)::int from socialapp.scheduled_posts where user_id = $1 and status = 'scheduled') as "scheduled",
      (select count(*)::int from socialapp.scheduled_posts where user_id = $1 and status = 'failed') as "failed",
      (select count(*)::int from socialapp.dm_queue where user_id = $1 and status = 'sent' and sent_at > now() - interval '7 days') as "dmsSent",
      (select count(*)::int from socialapp.contacts where user_id = $1) as "leads",
      (select count(*)::int from socialapp.link_clicks c join socialapp.short_links s on s.code = c.code where s.user_id = $1) as "linkClicks",
      exists(select 1 from socialapp.social_accounts where user_id = $1) as "hasAccount",
      exists(select 1 from socialapp.dm_rules where user_id = $1) as "hasRule",
      exists(select 1 from socialapp.scheduled_posts where user_id = $1 and status in ('scheduled','published')) as "hasPost"`,
    [userId]
  );
  return rows[0] ?? EMPTY_STATS;
}
