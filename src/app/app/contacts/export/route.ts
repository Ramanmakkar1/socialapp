
import { isDbConfigured, query } from "@/lib/db";
import { buildContactQuery, isValidRuleId, parseContactFilters } from "@/lib/contactsQuery";
import { leadsCsv, type LeadRow } from "@/lib/leadsCsv";
import { getWorkspaceUser } from "@/lib/workspace";

export async function GET(request: Request) {
  const user = await getWorkspaceUser();
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!isDbConfigured()) return new Response("Contacts are not available right now.", { status: 503 });
  try {
    return await exportContacts(request, user.id);
  } catch (err) {
    console.error("contacts export failed for user", user.id, err instanceof Error ? err.message : err);
    return new Response("Could not export contacts. Please try again.", { status: 500 });
  }
}

async function exportContacts(request: Request, userId: string): Promise<Response> {
  const url = new URL(request.url);
  const filters = parseContactFilters(Object.fromEntries(url.searchParams));
  if (filters.rule && !isValidRuleId(filters.rule)) {
    return new Response("Invalid Auto-DM", { status: 400 });
  }
  const { where, params } = buildContactQuery(userId, filters);
  const contacts = await query<LeadRow & { last_seen_at: Date }>(
    `select c.id, c.username, c.name, c.email, c.phone, c.created_at, c.last_seen_at, r.name as rule_name from socialapp.contacts c left join socialapp.dm_rules r on r.id = c.source_rule_id where ${where} order by c.last_seen_at desc, c.id desc limit 10000`,
    params
  );
  const csv = leadsCsv(contacts, url.searchParams.get("tz"));
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="contacts.csv"',
      "Cache-Control": "no-store",
    },
  });
}
