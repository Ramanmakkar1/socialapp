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

function csvField(value: string | null): string {
  let field = value ?? "";
  if (/^[=+\-@]/.test(field)) field = `'${field}`;
  return `"${field.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const leads = await query<Lead>(
    "select c.id, c.username, c.name, c.email, c.phone, c.created_at, r.name as rule_name from socialapp.contacts c left join socialapp.dm_rules r on r.id = c.source_rule_id where c.user_id = $1 order by c.created_at desc limit 10000",
    [user.id]
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
