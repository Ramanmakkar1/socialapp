import { Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import EmptyState from "../EmptyState";

export const metadata = { title: "Leads" };
export const dynamic = "force-dynamic";

type Lead = {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: Date;
  rule_name: string | null;
};

export default async function LeadsPage() {
  const user = await requireUser();
  const configured = isDbConfigured();
  const leads = configured ? await query<Lead>(
    "select c.id, c.username, c.name, c.email, c.phone, c.created_at, r.name as rule_name from socialapp.contacts c left join socialapp.dm_rules r on r.id = c.source_rule_id where c.user_id = $1 order by c.created_at desc limit 200",
    [user.id]
  ) : [];

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Leads</h1><p className="text-sm text-muted">{leads.length ? `${leads.length} leads` : "Emails and phones collected by your DMs."}</p></div>
        {leads.length > 0 && <a href="/app/leads/export" className="rounded-full border border-line px-4 py-2 text-sm">Export CSV</a>}
      </div>
      {leads.length === 0 ? (
        <EmptyState icon={Users} title="No leads yet" text={configured ? "Emails and phones collected by your auto-DMs will show here, exportable to CSV." : "Emails and phones collected by your DMs will show here, exportable to CSV. Lead capture isn't live yet."} phase={1} />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted"><tr>{["Instagram", "Name", "Email", "Phone", "From rule", "Date"].map((heading) => <th key={heading} scope="col" className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead>
            <tbody>{leads.map((lead) => (
              <tr key={lead.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{lead.username ? `@${lead.username}` : "—"}</td>
                <td className="px-4 py-3">{lead.name || "—"}</td>
                <td className="px-4 py-3">{lead.email || "—"}</td>
                <td className="px-4 py-3">{lead.phone || "—"}</td>
                <td className="px-4 py-3">{lead.rule_name || "—"}</td>
                <td className="px-4 py-3">{lead.created_at ? new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </>
  );
}
