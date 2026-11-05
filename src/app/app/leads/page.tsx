import { Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import EmptyState from "../EmptyState";
import LoadFailed from "../calendar/LoadFailed";
import LeadContactActions from "./LeadContactActions";

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

function formatLeadDate(value: Date | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function LeadsContactIllustration() {
  return (
    <svg aria-hidden="true" className="h-11 w-11 shrink-0" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="8" width="36" height="28" rx="8" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="1.5" />
      <circle cx="16" cy="20" r="5" fill="var(--brand)" opacity="0.25" />
      <rect x="24" y="17" width="12" height="3" rx="1.5" fill="var(--brand)" />
      <rect x="24" y="23" width="8" height="3" rx="1.5" fill="var(--ink-2)" opacity="0.35" />
      <path d="M12 32h20" stroke="var(--brand-2)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="32" r="6" fill="var(--brand-2)" opacity="0.2" />
      <path d="M30 32l1.5 1.5L34 31" stroke="var(--brand-2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ q?: string; email?: string; rule?: string; page?: string }> }) {
  const { q = '', email = '', rule = '', page: requestedPage = '' } = await searchParams;
  const user = await requireUser();
  const configured = isDbConfigured();
  const reloadParams = new URLSearchParams();
  for (const [key, value] of Object.entries({ q, email, rule, page: requestedPage })) {
    if (value) reloadParams.set(key, value);
  }
  const reloadQuery = reloadParams.toString();
  const loadFailure = (
    <>
      <h1 className="text-2xl font-semibold">Leads</h1>
      <LoadFailed
        className="mt-6"
        message="Leads could not be loaded. Your saved contacts may still exist. Reload to try again."
        reloadHref={reloadQuery ? `/app/leads?${reloadQuery}` : "/app/leads"}
      />
    </>
  );
  let rules: { id: string; name: string }[];
  try {
    rules = configured ? await query<{ id: string; name: string }>(
      "select id, name from socialapp.dm_rules where user_id=$1 order by name",
      [user.id]
    ) : [];
  } catch {
    return loadFailure;
  }

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

  const pageSize = 50;
  const parsedPage = typeof requestedPage === "string" && /^\d+$/.test(requestedPage) ? Number(requestedPage) : 1;
  const validPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  let countRows: { total: string }[];
  try {
    countRows = configured ? await query<{ total: string }>(
      `select count(*) as total from socialapp.contacts c where ${conditions.join(" and ")}`,
      params
    ) : [];
  } catch {
    return loadFailure;
  }
  const total = Number(countRows[0]?.total ?? 0);
  const page = Math.min(validPage, Math.max(1, Math.ceil(total / pageSize)));
  const offset = (page - 1) * pageSize;
  let leads: Lead[];
  try {
    leads = configured ? await query<Lead>(
      `select c.id, c.username, c.name, c.email, c.phone, c.created_at, r.name as rule_name from socialapp.contacts c left join socialapp.dm_rules r on r.id = c.source_rule_id where ${conditions.join(" and ")} order by c.created_at desc, c.id desc limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, pageSize, offset]
    ) : [];
  } catch {
    return loadFailure;
  }

  const exportParams = new URLSearchParams();
  if (search) exportParams.set("q", search);
  if (onlyWithEmail) exportParams.set("email", "1");
  if (selectedRule) exportParams.set("rule", selectedRule);
  const exportQuery = exportParams.toString();
  const exportHref = exportQuery ? `/app/leads/export?${exportQuery}` : "/app/leads/export";
  const exportCap = 10_000;
  const exportCapped = total > exportCap;
  function pageHref(target: number) {
    const pageParams = new URLSearchParams(exportParams);
    pageParams.set("page", String(target));
    return `/app/leads?${pageParams.toString()}`;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <LeadsContactIllustration />
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold">Leads</h1>
            <p className="text-sm text-muted">{total > 0 ? `${total} leads | ${offset + 1}-${offset + leads.length} shown` : "0 leads"}</p>
          </div>
        </div>
        {leads.length > 0 && (
          <div className="flex max-w-xs flex-col items-end gap-1.5 text-right">
            <a href={exportHref} className="rounded-full border border-line px-4 py-2 text-sm">
              {exportCapped ? "Export latest 10,000" : "Export CSV"}
            </a>
            {exportCapped ? (
              <p className="text-xs text-muted">CSV downloads are limited to the 10,000 newest matching leads. Narrow with search, rule, or email filters.</p>
            ) : null}
          </div>
        )}
      </div>
      <form method="get" className="mt-6 flex flex-wrap items-center gap-3">
        <label htmlFor="leads-search" className="sr-only">Search leads</label>
        <input
          id="leads-search"
          type="search"
          name="q"
          placeholder="Search username, name, email or phone"
          defaultValue={search}
          className="w-full min-w-0 rounded-full border border-line bg-surface px-4 py-2 text-sm sm:w-auto"
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
        <>
          <ul className="mt-6 space-y-3 md:hidden">
            {leads.map((lead) => (
              <li key={lead.id}>
                <article className="rounded-2xl border border-line bg-surface p-4">
                  <p className="break-all font-semibold text-ink">{lead.username ? `@${lead.username}` : "—"}</p>
                  {lead.name ? <p className="mt-1 break-all text-sm text-ink-2">{lead.name}</p> : null}
                  <dl className="mt-3 space-y-2 text-sm">
                    <div>
                      <dt className="text-xs text-muted">Email</dt>
                      <dd className="break-all">{lead.email || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Phone</dt>
                      <dd className="break-all">{lead.phone || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">From rule</dt>
                      <dd className="break-all">{lead.rule_name || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Captured</dt>
                      <dd>{formatLeadDate(lead.created_at)}</dd>
                    </div>
                  </dl>
                  <LeadContactActions email={lead.email} phone={lead.phone} />
                </article>
              </li>
            ))}
          </ul>
          <div className="mt-6 hidden overflow-x-auto rounded-2xl border border-line bg-surface md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-muted"><tr>{["Instagram", "Name", "Email", "Phone", "From rule", "Date"].map((heading) => <th key={heading} scope="col" className="px-4 py-3 font-medium">{heading}</th>)}</tr></thead>
              <tbody>{leads.map((lead) => (
                <tr key={lead.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">{lead.username ? `@${lead.username}` : "—"}</td>
                  <td className="px-4 py-3">{lead.name || "—"}</td>
                  <td className="px-4 py-3">{lead.email || "—"}</td>
                  <td className="px-4 py-3">{lead.phone || "—"}</td>
                  <td className="px-4 py-3">{lead.rule_name || "—"}</td>
                  <td className="px-4 py-3">{formatLeadDate(lead.created_at)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
      {total > pageSize && (
        <nav aria-label="Leads pagination" className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          {page > 1 && <a href={pageHref(page - 1)} className="rounded-full border border-line px-4 py-2">Previous</a>}
          <span className="text-muted">Page {page} of {Math.ceil(total / pageSize)}</span>
          {page < Math.ceil(total / pageSize) && <a href={pageHref(page + 1)} className="rounded-full border border-line px-4 py-2">Next</a>}
        </nav>
      )}
    </>
  );
}
