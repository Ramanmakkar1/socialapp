import { Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import EmptyState from "../EmptyState";

export const metadata = { title: "Leads" };

type Lead = {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: Date;
  rule_name: string | null;
};

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ q?: string; email?: string; rule?: string }> }) {
  const { q = '', email = '', rule = '' } = await searchParams;
  const user = await requireUser();
  const configured = isDbConfigured();
  const rules = configured ? await query<{ id: string; name: string }>(
    "select id, name from socialapp.dm_rules where user_id=$1 order by name",
    [user.id]
  ) : [];

  const search = q.trim().slice(0, 100);
  const onlyWithEmail = email === "1";
  const selectedRule = rules.some((item) => item.id === rule) ? rule : "";
  const filterActive = search.length > 0 || onlyWithEmail || selectedRule.length > 0;

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

  const leads = configured ? await query<Lead>(
    `select c.id, c.username, c.name, c.email, c.phone, c.created_at, r.name as rule_name from socialapp.contacts c left join socialapp.dm_rules r on r.id = c.source_rule_id where ${conditions.join(" and ")} order by c.created_at desc limit 200`,
    params
  ) : [];

  const exportParams = new URLSearchParams();
  if (search) exportParams.set("q", search);
  if (onlyWithEmail) exportParams.set("email", "1");
  if (selectedRule) exportParams.set("rule", selectedRule);
  const exportQuery = exportParams.toString();
  const exportHref = exportQuery ? `/app/leads/export?${exportQuery}` : "/app/leads/export";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Leads</h1><p className="text-sm text-muted">{leads.length ? `${leads.length} leads` : "Emails and phones collected by your DMs."}</p></div>
        {leads.length > 0 && <a href={exportHref} className="rounded-full border border-line px-4 py-2 text-sm">Export CSV</a>}
      </div>
      <form method="get" className="mt-6 flex flex-wrap items-center gap-3">
        <label htmlFor="leads-search" className="sr-only">Search leads</label>
        <input
          id="leads-search"
          type="search"
          name="q"
          placeholder="Search username, name, email or phone"
          defaultValue={search}
          className="rounded-full border border-line bg-surface px-4 py-2 text-sm"
        />
        <label htmlFor="leads-rule" className="sr-only">From rule</label>
        <select id="leads-rule" name="rule" defaultValue={selectedRule} className="rounded-full border border-line bg-surface px-4 py-2 text-sm">
          <option value="">All rules</option>
          {rules.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <label htmlFor="leads-email" className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
          <input id="leads-email" type="checkbox" name="email" value="1" defaultChecked={onlyWithEmail} />
          Only with email
        </label>
        <button type="submit" className="btn-primary rounded-full px-4 py-2 text-sm">Search</button>
        {filterActive && <a href="/app/leads" className="text-sm text-muted underline">Clear</a>}
      </form>
      {leads.length === 0 ? (
        filterActive ? (
          <p className="mt-6 text-sm text-muted">No leads match your search.</p>
        ) : (
          <EmptyState icon={Users} title="No leads yet" text={configured ? "Emails and phones collected by your auto-DMs will show here, exportable to CSV." : "Connect Instagram in Settings to start collecting leads."} />
        )
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-line bg-surface">
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
