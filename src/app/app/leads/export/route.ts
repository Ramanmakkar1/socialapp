import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

type Lead = {
  username: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  rule_name: string | null;
  created_at: Date;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function csvField(value: string | null): string {
  let field = value ?? "";
  if (/^[\s\u0000-\u001F]*[=+\-@]/.test(field)) field = `'${field}`;
  return `"${field.replace(/"/g, '""')}"`;
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const url = new URL(request.url);
  const search = (url.searchParams.get("q") ?? "").trim().slice(0, 100);
  const onlyWithEmail = url.searchParams.get("email") === "1";
  const requestedRule = url.searchParams.get("rule") ?? "";
  if (requestedRule) {
    if (!UUID_RE.test(requestedRule)) {
      return new Response("Invalid rule", { status: 400 });
    }
    const ruleRows = await query<{ exists: number }>(
      "select 1 as exists from socialapp.dm_rules where id=$1 and user_id=$2",
      [requestedRule, user.id]
    );
    if (ruleRows.length === 0) {
      return new Response("Invalid rule", { status: 400 });
    }
  }
  const selectedRule = requestedRule;

  const conditions = ["c.user_id = $1"];
  const params: string[] = [user.id];
  if (search) {
    const searchParam = `$${params.length + 1}`;
    conditions.push(`(c.username ilike ${searchParam} or c.name ilike ${searchParam} or c.email ilike ${searchParam} or c.phone ilike ${searchParam})`);
    params.push(`%${escapeLike(search)}%`);
  }
  if (onlyWithEmail) conditions.push("c.email is not null and c.email <> ''");
  if (selectedRule) {
    conditions.push(`c.source_rule_id = $${params.length + 1}`);
    params.push(selectedRule);
  }

  const leads = await query<Lead>(
    `select c.id, c.username, c.name, c.email, c.phone, c.created_at, r.name as rule_name from socialapp.contacts c left join socialapp.dm_rules r on r.id = c.source_rule_id where ${conditions.join(" and ")} order by c.created_at desc, c.id desc limit 10000`,
    params
  );
  const rows = [
    ["username", "name", "email", "phone", "rule", "created_at"],
    ...leads.map((lead) => [lead.username, lead.name, lead.email, lead.phone, lead.rule_name, lead.created_at ? new Date(lead.created_at).toISOString() : null]),
  ];
  const csv = rows.map((row) => row.map(csvField).join(",")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads.csv"',
    },
  });
}
