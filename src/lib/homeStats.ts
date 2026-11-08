// Server only: the home "Performance snapshot" - last 7 days vs the 7 days before.
import { isDbConfigured, query } from "@/lib/db";

export type Snapshot = {
  dmsSent: number;
  dmsSentPrev: number;
  dmQueue: number;
  linkClicks: number;
  linkClicksPrev: number;
  leads: number;
  leadsPrev: number;
};

export const EMPTY_SNAPSHOT: Snapshot = { dmsSent: 0, dmsSentPrev: 0, dmQueue: 0, linkClicks: 0, linkClicksPrev: 0, leads: 0, leadsPrev: 0 };

/** Percent change from prev to cur, rounded; null when there is nothing to compare against. */
export function pctChange(cur: number, prev: number): number | null {
  if (!prev) return cur ? null : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

export type AutomationSummaryRow = {
  id: string;
  name: string;
  status: string;
  keywords: string[];
  triggers: string[];
  dmText: string;
  dmsSent: number;
  clicks: number;
};

/** One line like: "Comments · contains 'LINK' +2 more · DM: 'Hey, thanks…'" */
export function automationSummary(r: Pick<AutomationSummaryRow, "keywords" | "triggers" | "dmText">): string {
  const on = (r.triggers?.length ? r.triggers : ["comment"]).map((t) => (t === "story_reply" ? "Story replies" : t === "dm" ? "DMs" : "Comments")).join(" + ");
  const kw = r.keywords?.length ? `contains '${r.keywords[0]}'${r.keywords.length > 1 ? ` +${r.keywords.length - 1} more` : ""}` : "any comment";
  const dm = r.dmText.length > 48 ? `${r.dmText.slice(0, 48).trimEnd()}…` : r.dmText;
  return `${on} · ${kw} · DM: '${dm}'`;
}

export async function getAutomationRows(userId: string): Promise<AutomationSummaryRow[]> {
  if (!isDbConfigured()) return [];
  try {
    return await query<AutomationSummaryRow>(
      `select r.id, r.name, r.status, r.keywords, r.triggers, r.dm_text as "dmText",
        (select count(*)::int from socialapp.dm_queue q where q.rule_id = r.id and q.status = 'sent') as "dmsSent",
        (select coalesce(sum(s.clicks), 0)::int from socialapp.short_links s where s.rule_id = r.id) as "clicks"
      from socialapp.dm_rules r
      where r.user_id = $1
      order by (r.status = 'active') desc, r.created_at desc
      limit 20`,
      [userId],
    );
  } catch {
    return [];
  }
}

export async function getSnapshot(userId: string): Promise<Snapshot> {
  if (!isDbConfigured()) return EMPTY_SNAPSHOT;
  try {
    const rows = await query<Snapshot>(
      `select
        (select count(*)::int from socialapp.dm_queue where user_id = $1 and status = 'sent' and sent_at > now() - interval '7 days') as "dmsSent",
        (select count(*)::int from socialapp.dm_queue where user_id = $1 and status = 'sent' and sent_at > now() - interval '14 days' and sent_at <= now() - interval '7 days') as "dmsSentPrev",
        (select count(*)::int from socialapp.dm_queue where user_id = $1 and status = 'pending') as "dmQueue",
        (select count(*)::int from socialapp.link_clicks c join socialapp.short_links s on s.code = c.code
           where s.user_id = $1 and c.clicked_at > now() - interval '7 days') as "linkClicks",
        (select count(*)::int from socialapp.link_clicks c join socialapp.short_links s on s.code = c.code
           where s.user_id = $1 and c.clicked_at > now() - interval '14 days' and c.clicked_at <= now() - interval '7 days') as "linkClicksPrev",
        (select count(*)::int from socialapp.contacts where user_id = $1 and created_at > now() - interval '7 days') as "leads",
        (select count(*)::int from socialapp.contacts where user_id = $1 and created_at > now() - interval '14 days' and created_at <= now() - interval '7 days') as "leadsPrev"`,
      [userId],
    );
    return rows[0] ?? EMPTY_SNAPSHOT;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}
