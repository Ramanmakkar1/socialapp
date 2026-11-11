// Lead magnets: a free file or link that an auto-DM rule hands out once its email gate
// collects an email. Server only (DB). Tables: lead_magnets, lead_magnet_deliveries,
// dm_rules.lead_magnet_id (migration 034).
//
// How it plugs into the DM pipeline: attaching a magnet to a rule copies the magnet's
// delivery URL into dm_rules.link_url (and keeps it in sync on every magnet save), so the
// existing gate + tracked-link code (messages.ts, comments.ts, links.ts) sends it unchanged.
// When the gated link is queued, recordLeadMagnetDelivery() logs who got which magnet and
// tags the contact.
import { getPool, query } from "@/lib/db";
import type { DeliveryFields } from "@/lib/digitalDelivery";

export type LeadMagnet = {
  id: string;
  title: string;
  description: string;
  cover_url: string | null;
  delivery_type: "file" | "link";
  delivery_url: string;
  created_at: Date;
  updated_at: Date;
};

export type LeadMagnetRow = LeadMagnet & { deliveries: number; leads: number; clicks: number; rules: number };

export type RuleOption = {
  id: string;
  name: string;
  status: string;
  email_gate: boolean;
  lead_magnet_id: string | null;
  product_id: string | null;
};

export const LEAD_MAGNET_TAG_PREFIX = "lead-magnet:";

export function leadMagnetTag(title: string): string {
  return LEAD_MAGNET_TAG_PREFIX + title;
}

const STATS_SQL = `
  select m.id, m.title, m.description, m.cover_url, m.delivery_type, m.delivery_url, m.created_at, m.updated_at,
    (select count(*)::int from socialapp.lead_magnet_deliveries d where d.lead_magnet_id = m.id) as deliveries,
    (select count(*)::int from socialapp.lead_magnet_deliveries d join socialapp.contacts c on c.id = d.contact_id
       where d.lead_magnet_id = m.id and c.email is not null and c.email <> '') as leads,
    (select count(*)::int from socialapp.link_clicks c join socialapp.short_links s on s.code = c.code
       where s.user_id = m.user_id and s.target_url = m.delivery_url) as clicks,
    (select count(*)::int from socialapp.dm_rules r where r.lead_magnet_id = m.id) as rules
  from socialapp.lead_magnets m`;

export async function listLeadMagnets(userId: string): Promise<LeadMagnetRow[]> {
  return query<LeadMagnetRow>(`${STATS_SQL} where m.user_id = $1 order by m.created_at desc`, [userId]);
}

export async function getLeadMagnet(userId: string, id: string): Promise<(LeadMagnetRow & { rule_ids: string[] }) | null> {
  if (!isUuid(id)) return null;
  const rows = await query<LeadMagnetRow>(`${STATS_SQL} where m.user_id = $1 and m.id = $2`, [userId, id]);
  const magnet = rows[0];
  if (!magnet) return null;
  const rules = await query<{ id: string }>(
    "select id from socialapp.dm_rules where user_id=$1 and lead_magnet_id=$2 order by name",
    [userId, id],
  );
  return { ...magnet, rule_ids: rules.map((r) => r.id) };
}

export async function recentDeliveries(userId: string, magnetId: string, limit = 25) {
  return query<{ id: string; created_at: Date; username: string | null; email: string | null; rule_name: string | null }>(
    `select d.id::text, d.created_at, c.username, c.email, r.name as rule_name
     from socialapp.lead_magnet_deliveries d
     join socialapp.contacts c on c.id = d.contact_id
     left join socialapp.dm_rules r on r.id = d.rule_id
     where d.user_id = $1 and d.lead_magnet_id = $2
     order by d.created_at desc limit $3`,
    [userId, magnetId, limit],
  );
}

/** The user's auto-DM rules, for the "deliver with" pickers on lead magnets and products. */
export async function listRuleOptions(userId: string): Promise<RuleOption[]> {
  return query<RuleOption>(
    "select id, name, status, email_gate, lead_magnet_id, product_id from socialapp.dm_rules where user_id=$1 order by name",
    [userId],
  );
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

/**
 * Creates or updates a magnet and points exactly `ruleIds` at it (one transaction).
 * Attached rules get link_url = delivery URL and lose any product they delivered.
 * Returns the magnet id, or null when `id` is not this user's magnet.
 */
export async function saveLeadMagnet(userId: string, id: string | null, values: DeliveryFields, ruleIds: string[]): Promise<string | null> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    let magnetId: string | null;
    if (id) {
      const res = await client.query<{ id: string }>(
        `update socialapp.lead_magnets set title=$3, description=$4, cover_url=$5, delivery_type=$6, delivery_url=$7, updated_at=now()
         where id=$1 and user_id=$2 returning id`,
        [id, userId, values.title, values.description, values.coverUrl, values.deliveryType, values.deliveryUrl],
      );
      magnetId = res.rows[0]?.id ?? null;
    } else {
      const res = await client.query<{ id: string }>(
        `insert into socialapp.lead_magnets (user_id, title, description, cover_url, delivery_type, delivery_url)
         values ($1,$2,$3,$4,$5,$6) returning id`,
        [userId, values.title, values.description, values.coverUrl, values.deliveryType, values.deliveryUrl],
      );
      magnetId = res.rows[0]?.id ?? null;
    }
    if (!magnetId) {
      await client.query("rollback");
      return null;
    }
    await client.query(
      "update socialapp.dm_rules set lead_magnet_id=null, updated_at=now() where user_id=$1 and lead_magnet_id=$2 and not (id = any($3::uuid[]))",
      [userId, magnetId, ruleIds],
    );
    if (ruleIds.length > 0) {
      await client.query(
        "update socialapp.dm_rules set lead_magnet_id=$2, product_id=null, link_url=$3, updated_at=now() where user_id=$1 and id = any($4::uuid[])",
        [userId, magnetId, values.deliveryUrl, ruleIds],
      );
    }
    await client.query("commit");
    return magnetId;
  } catch (err) {
    await client.query("rollback").catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}

export async function deleteLeadMagnet(userId: string, id: string): Promise<boolean> {
  if (!isUuid(id)) return false;
  const rows = await query<{ id: string }>("delete from socialapp.lead_magnets where id=$1 and user_id=$2 returning id", [id, userId]);
  return rows.length > 0;
}

/**
 * After a rule is edited in the auto-DM editor: when its link no longer points at the attached
 * magnet's delivery URL, detach the magnet so new leads are not tagged with a magnet they did
 * not get. Returns true when a magnet was detached.
 */
export async function detachMagnetIfLinkChanged(userId: string, ruleId: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `update socialapp.dm_rules r set lead_magnet_id = null, updated_at = now()
     from socialapp.lead_magnets m
     where r.id = $1 and r.user_id = $2 and m.id = r.lead_magnet_id
       and r.link_url is distinct from m.delivery_url
     returning r.id`,
    [ruleId, userId],
  );
  return rows.length > 0;
}

/**
 * Called by the DM pipeline when a rule's link is queued for a lead (gate unlocked, or a
 * returning lead with a known email). If the rule delivers a lead magnet: records the delivery
 * (once per lead and magnet) and tags the contact 'lead-magnet:<title>'. One statement, best
 * effort: never throws, so the DM itself is never blocked (e.g. before migration 034 runs).
 */
export async function recordLeadMagnetDelivery(userId: string, ruleId: string, contactId: string): Promise<boolean> {
  try {
    const rows = await query<{ delivered: number }>(
      `with m as (
         select lm.id, lm.title from socialapp.dm_rules r
         join socialapp.lead_magnets lm on lm.id = r.lead_magnet_id and lm.user_id = r.user_id
         where r.id = $2 and r.user_id = $1
       ), ins as (
         insert into socialapp.lead_magnet_deliveries (lead_magnet_id, user_id, rule_id, contact_id)
         select m.id, $1, $2, $3 from m
         on conflict (lead_magnet_id, contact_id) do nothing
         returning lead_magnet_id
       ), tag as (
         update socialapp.contacts c set tags = array_append(c.tags, '${LEAD_MAGNET_TAG_PREFIX}' || m.title)
         from m where c.id = $3 and c.user_id = $1 and not (('${LEAD_MAGNET_TAG_PREFIX}' || m.title) = any(c.tags))
         returning c.id
       )
       select (select count(*) from ins)::int as delivered`,
      [userId, ruleId, contactId],
    );
    return (rows[0]?.delivered ?? 0) > 0;
  } catch (err) {
    console.error("recordLeadMagnetDelivery failed for rule", ruleId, err instanceof Error ? err.message : err);
    return false;
  }
}
