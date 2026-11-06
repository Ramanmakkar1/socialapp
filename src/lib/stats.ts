// Server-only dashboard numbers for one user.
import { isDbConfigured, query } from "@/lib/db";
import type { MediaInsights } from "@/lib/insights";

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
  dmsSent: number;
  linkClicks: number;
  leads: number;
  insights: MediaInsights | null;
};

export async function getRecentPosts(userId: string): Promise<RecentPost[]> {
  if (!isDbConfigured()) {
    return [];
  }
  try {
    return await query<RecentPost>(
      `with rp as (
      select p.id, p.caption,
        to_json(max(t.published_at)) #>> '{}' as "publishedAt",
        array_agg(distinct t.platform) as "platforms",
        r.name as "ruleName", p.dm_rule_id as rule_id,
        max(t.published_at) as published_ts
      from socialapp.scheduled_posts p
      join socialapp.post_targets t on t.post_id = p.id
      left join socialapp.dm_rules r on r.id = p.dm_rule_id
      where p.user_id = $1
        and t.status = 'published'
        and t.published_at > now() - interval '30 days'
      group by p.id, r.name, p.dm_rule_id
      )
      select rp.id, rp.caption, rp."publishedAt", rp.platforms, rp."ruleName",
        coalesce((select count(*)::int from socialapp.dm_queue q
          where q.user_id = $1 and q.rule_id = rp.rule_id and q.status = 'sent'
            and q.created_at >= rp.published_ts), 0) as "dmsSent",
        coalesce((select count(*)::int from socialapp.link_clicks c
          join socialapp.short_links s on s.code = c.code
          where s.user_id = $1 and s.rule_id = rp.rule_id
            and c.clicked_at >= rp.published_ts), 0) as "linkClicks",
        coalesce((select count(*)::int from socialapp.contacts ct
          where ct.user_id = $1 and ct.source_rule_id = rp.rule_id and ct.email is not null
            and ct.created_at >= rp.published_ts), 0) as "leads",
        (select t2.insights from socialapp.post_targets t2
          where t2.post_id = rp.id and t2.platform = 'instagram' and t2.status = 'published'
          limit 1) as insights
      from rp
      order by rp.published_ts desc
      limit 20`,
      [userId]
    );
  } catch {
    return [];
  }
}

export type UpcomingPost = {
  id: string;
  caption: string;
  scheduledAt: string;
  igFormat: string | null;
  hasRule: boolean;
  mediaCount: number;
};

function upcomingDisplayFormat(igFormat: string | null, mediaCount: number, media: unknown): string | null {
  if (igFormat === "story") return "story";
  if (mediaCount >= 2) return igFormat;
  if (mediaCount === 1 && Array.isArray(media) && (media[0] as { type?: string } | undefined)?.type === "video") {
    return "reel";
  }
  return igFormat;
}

export async function getUpcomingPosts(userId: string, take = 5): Promise<UpcomingPost[]> {
  if (!isDbConfigured()) {
    return [];
  }
  try {
    const rows = await query<UpcomingPost & { media: unknown }>(
      `select p.id, p.caption,
        to_json(p.scheduled_at) #>> '{}' as "scheduledAt",
        p.ig_format as "igFormat",
        (p.dm_rule_id is not null) as "hasRule",
        coalesce(jsonb_array_length(p.media), 0) as "mediaCount",
        p.media
      from socialapp.scheduled_posts p
      where p.user_id = $1
        and p.status = 'scheduled'
        and p.scheduled_at > now()
      order by p.scheduled_at asc
      limit $2`,
      [userId, take],
    );
    return rows.map(({ media, ...post }) => ({
      ...post,
      igFormat: upcomingDisplayFormat(post.igFormat, post.mediaCount, media),
    }));
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

export type DailyActivityRow = { day: string; dms: number; leads: number };

export async function getDailyActivity(userId: string): Promise<DailyActivityRow[]> {
  if (!isDbConfigured()) {
    return [];
  }
  try {
    return await query<DailyActivityRow>(
      `with days as (
        select generate_series(
          (now() at time zone 'UTC')::date - 13,
          (now() at time zone 'UTC')::date,
          interval '1 day'
        )::date as day
      )
      select to_char(d.day, 'YYYY-MM-DD') as day,
        (select count(*)::int from socialapp.dm_queue q
          where q.user_id = $1 and q.status = 'sent'
            and (q.sent_at at time zone 'UTC')::date = d.day) as dms,
        (select count(*)::int from socialapp.contacts c
          where c.user_id = $1 and c.email is not null
            and (c.created_at at time zone 'UTC')::date = d.day) as leads
      from days d
      order by d.day`,
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
      exists(select 1 from socialapp.social_accounts where user_id = $1 and platform = 'instagram' and status = 'active') as "hasAccount",
      exists(select 1 from socialapp.dm_rules where user_id = $1) as "hasRule",
      exists(select 1 from socialapp.scheduled_posts where user_id = $1 and status in ('scheduled','publishing','published')) as "hasPost"`,
    [userId]
  );
  return rows[0] ?? EMPTY_STATS;
}
