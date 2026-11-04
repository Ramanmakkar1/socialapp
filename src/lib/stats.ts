// Server-only dashboard numbers for one user.
import { isDbConfigured, query } from "@/lib/db";

export type DashboardStats = {
  scheduled: number;
  dmsSent: number;
  leads: number;
  linkClicks: number;
  hasAccount: boolean;
};

export const EMPTY_STATS: DashboardStats = { scheduled: 0, dmsSent: 0, leads: 0, linkClicks: 0, hasAccount: false };

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  if (!isDbConfigured()) {
    return EMPTY_STATS;
  }
  const rows = await query<DashboardStats>(
    `select
      (select count(*)::int from socialapp.scheduled_posts where user_id = $1 and status = 'scheduled') as "scheduled",
      (select count(*)::int from socialapp.dm_queue where user_id = $1 and status = 'sent' and sent_at > now() - interval '7 days') as "dmsSent",
      (select count(*)::int from socialapp.contacts where user_id = $1) as "leads",
      (select count(*)::int from socialapp.link_clicks c join socialapp.short_links s on s.code = c.code where s.user_id = $1) as "linkClicks",
      exists(select 1 from socialapp.social_accounts where user_id = $1) as "hasAccount"`,
    [userId]
  );
  return rows[0] ?? EMPTY_STATS;
}
