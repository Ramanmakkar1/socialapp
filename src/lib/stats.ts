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

export type RecentPost = {
  id: string;
  caption: string;
  publishedAt: string | null;
  platforms: string[];
  ruleName: string | null;
};

export async function getRecentPosts(userId: string): Promise<RecentPost[]> {
  if (!isDbConfigured()) {
    return [];
  }
  try {
    return await query<RecentPost>(
      `select p.id, p.caption,
        to_json(max(t.published_at)) #>> '{}' as "publishedAt",
        array_agg(distinct t.platform) as "platforms",
        r.name as "ruleName"
      from socialapp.scheduled_posts p
      join socialapp.post_targets t on t.post_id = p.id
      left join socialapp.dm_rules r on r.id = p.dm_rule_id
      where p.user_id = $1
        and t.status = 'published'
        and t.published_at > now() - interval '30 days'
      group by p.id, r.name
      order by max(t.published_at) desc
      limit 20`,
      [userId]
    );
  } catch {
    return [];
  }
}

export type ActivityCell = { dow: number; block: number; count: number };

// Comment times (auto-DM queue rows) in the last 30 days, grouped by ISO weekday (1=Mon..7=Sun) and 3-hour UTC block (0..7).
export async function getCommentActivity(userId: string): Promise<ActivityCell[]> {
  if (!isDbConfigured()) {
    return [];
  }
  try {
    return await query<ActivityCell>(
      `select extract(isodow from created_at at time zone 'UTC')::int as dow,
        (extract(hour from created_at at time zone 'UTC')::int / 3) as block,
        count(*)::int as count
      from socialapp.dm_queue
      where user_id = $1 and created_at > now() - interval '30 days'
      group by 1, 2`,
      [userId]
    );
  } catch {
    return [];
  }
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
