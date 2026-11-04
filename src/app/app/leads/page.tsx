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

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ q?: string; email?: string }> }) {
  const { q = '', email = '' } = await searchParams;
  const user = await requireUser();
  const configured = isDbConfigured();

  const search = q.trim().slice(0, 100);
  const onlyWithEmail = email === "1";
  const filterActive = search.length > 0 || onlyWithEmail;

  const conditions = ["c.user_id = $1"];
  const params: string[] = [user.id];
  if (search) {
    conditions.push("(c.username ilike $2 or c.name ilike $2 or c.email ilike $2 or c.phone ilike $2)");
    params.push(`%${escapeLike(search)}%`);
  }
  if (onlyWithEmail) conditions.push("c.email is not null and c.email <> ''");

  const leads = configured ? await query<Lead>(
    `select c.id, c.username, c.name, c.email, c.phone, c.created_at, r.name as rule_name from socialapp.contacts c left join socialapp.dm_rules r on r.id = c.source_rule_id where ${conditions.join(" and ")} order by c.created_at desc limit 200`,
    params
  ) : [];

  const exportParams = new URLSearchParams();
  if (search) exportParams.set("q", search);
  if (onlyWithEmail) exportParams.set("email", "1");
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
          <EmptyState icon={Users} title="No leads yet" text={configured ? "Emails and phones collected by your auto-DMs will show here, exportable to CSV." : "Emails and phones collected by your DMs will show here, exportable to CSV. Lead capture isn't live yet."} phase={1} />
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
