import Link from "next/link";
import { Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import EmptyState from "../EmptyState";
import LoadFailed from "../calendar/LoadFailed";
import ExportLeadsLink from "./ExportLeadsLink";
import LeadContactActions from "./LeadContactActions";
import LocalTime from "@/components/LocalTime";
import { BtnLink, PageHero } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import styles from "./leads.module.css";

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
      <PageHero
        eyebrow="Captured leads"
        title="Leads"
        lede="Emails and phone numbers your auto-DMs collect, ready to export."
        art="/landing/card-leads.webp"
        artAlt=""
      />
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
  const selectedRuleName = selectedRule ? rules.find((item) => item.id === selectedRule)?.name : undefined;
  const filterActive = search.length > 0 || onlyWithEmail || selectedRule.length > 0;
  const leadsWithoutRuleParams = new URLSearchParams();
  if (search) leadsWithoutRuleParams.set("q", search);
  if (onlyWithEmail) leadsWithoutRuleParams.set("email", "1");
  const showAllLeadsHref = leadsWithoutRuleParams.toString()
    ? `/app/leads?${leadsWithoutRuleParams.toString()}`
    : "/app/leads";

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
      <PageHero
        eyebrow="Captured leads"
        title="Leads"
        lede={total > 0 ? `${total} ${total === 1 ? "lead" : "leads"} · showing ${offset + 1}-${offset + leads.length}` : "Emails and phone numbers your auto-DMs collect, ready to export."}
        art="/landing/card-leads.webp"
        artAlt=""
        action={leads.length > 0 ? (
          <div className="flex flex-col items-start gap-2">
            <ExportLeadsLink href={exportHref}>
              {exportCapped ? "Export latest 10,000" : "Export CSV"}
            </ExportLeadsLink>
            {exportCapped ? (
              <p className={`${ui.hint} m-0 max-w-xs`}>
                CSV downloads are limited to the 10,000 newest matching leads. Narrow with search, rule, or email filters.
              </p>
            ) : null}
          </div>
        ) : undefined}
      />
      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div className={ui.field} style={{ minWidth: "min(100%, 260px)" }}>
          <label htmlFor="leads-search" className={ui.label}>Search</label>
          <input
            id="leads-search"
            type="search"
            name="q"
            placeholder="Username, name, email or phone"
            defaultValue={search}
            className={ui.input}
          />
        </div>
        <div className={ui.field}>
          <label htmlFor="leads-rule" className={ui.label}>From rule</label>
          <select id="leads-rule" name="rule" defaultValue={selectedRule} className={ui.input}>
            <option value="">All rules</option>
            {rules.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <label htmlFor="leads-email" className={ui.checkRow}>
          <input id="leads-email" type="checkbox" name="email" value="1" defaultChecked={onlyWithEmail} />
          Only with email
        </label>
        <button type="submit" className={`${ui.btn} ${ui.btnDark} ${ui.sm}`}>Search</button>
        {filterActive && !selectedRuleName && <Link href="/app/leads" className={`${ui.hint} underline`}>Clear</Link>}
      </form>
      {selectedRuleName ? (
        <div className={`${ui.card} ${ui.band} mt-4 flex flex-wrap items-center gap-4 p-4`}>
          <div className="min-w-0 flex-1">
            <p className={`${ui.eyebrow} m-0`}>Campaign</p>
            <p className="m-0 truncate font-semibold text-[var(--poskoo-ink)]">{selectedRuleName}</p>
          </div>
          <div className="flex w-full flex-wrap gap-x-4 gap-y-2 sm:w-auto sm:justify-end">
            <Link href="/app/auto-dm" className={ui.link}>Manage automations</Link>
            <Link href={showAllLeadsHref} className={ui.link}>Show all leads</Link>
          </div>
        </div>
      ) : null}
      {leads.length === 0 ? (
        selectedRuleName ? (
          <div className={`${ui.card} ${ui.mint} mt-6 p-5 text-[.95rem]`}>
            <p className="m-0 text-[var(--poskoo-ink)]">
              No leads captured for <strong>{selectedRuleName}</strong>
              {search || onlyWithEmail ? " with your current filters" : " yet"}.
            </p>
            <p className="mt-2 text-[var(--poskoo-muted)]">
              Turn on email capture or run the automation on Instagram comments — contacts appear here as people complete your DM flow.
            </p>
            <Link href="/app/auto-dm" className={`${ui.link} mt-3 inline-flex min-h-[44px] items-center`}>
              Back to this automation
            </Link>
          </div>
        ) : filterActive ? (
          <p className={`${ui.hint} mt-6`}>No leads match your search.</p>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={Users}
              title="No leads yet"
              text={configured ? "Emails and phones collected by your auto-DMs will show here, exportable to CSV." : "Connect Instagram in Settings to start collecting leads."}
              art="/illustrations/empty-leads.webp"
              artWidth={1536}
              artHeight={1024}
            >
              <BtnLink href={configured ? "/app/auto-dm" : "/app/settings"} size="sm">
                {configured ? "Create an auto-DM rule" : "Go to Settings"}
              </BtnLink>
            </EmptyState>
          </div>
        )
      ) : (
        <>
          <ul className={`mt-6 grid gap-4 md:hidden`}>
            {leads.map((lead) => (
              <li key={lead.id}>
                <article className={`${ui.card} p-4`}>
                  <p className={`m-0 break-all font-semibold text-[var(--poskoo-ink)]`}>{lead.username ? `@${lead.username}` : "—"}</p>
                  {lead.name ? <p className="mt-1 break-all text-sm text-[var(--poskoo-muted)]">{lead.name}</p> : null}
                  <dl className={`mt-3 grid gap-2 text-sm ${styles.mobileDl}`}>
                    <div>
                      <dt className={`text-xs ${ui.hint}`}>Email</dt>
                      <dd className="m-0 break-all">{lead.email || "—"}</dd>
                    </div>
                    <div>
                      <dt className={`text-xs ${ui.hint}`}>Phone</dt>
                      <dd className="m-0 break-all">{lead.phone || "—"}</dd>
                    </div>
                    <div>
                      <dt className={`text-xs ${ui.hint}`}>From rule</dt>
                      <dd className="m-0 break-all">{lead.rule_name || "—"}</dd>
                    </div>
                    <div>
                      <dt className={`text-xs ${ui.hint}`}>Captured</dt>
                      <dd className="m-0"><LocalTime value={lead.created_at} style="medium" fallback="-" /></dd>
                    </div>
                  </dl>
                  <LeadContactActions email={lead.email} phone={lead.phone} />
                </article>
              </li>
            ))}
          </ul>
          <div className={`mt-6 hidden md:block ${ui.tableWrap}`}>
            <table className={ui.table}>
              <thead>
                <tr>{["Instagram", "Name", "Email", "Phone", "From rule", "Date"].map((heading) => <th key={heading} scope="col" className={ui.th}>{heading}</th>)}</tr>
              </thead>
              <tbody>{leads.map((lead) => (
                <tr key={lead.id} className={ui.tr}>
                  <td className={ui.td}>{lead.username ? `@${lead.username}` : "—"}</td>
                  <td className={ui.td}>{lead.name || "—"}</td>
                  <td className={ui.td}>{lead.email || "—"}</td>
                  <td className={ui.td}>{lead.phone || "—"}</td>
                  <td className={ui.td}>{lead.rule_name || "—"}</td>
                  <td className={ui.td}><LocalTime value={lead.created_at} style="medium" fallback="-" /></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
      {total > pageSize && (
        <nav aria-label="Leads pagination" className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          {page > 1 && <Link href={pageHref(page - 1)} className={`${ui.btn} ${ui.btnGhost} ${ui.sm}`}>Previous</Link>}
          <span className={ui.hint}>Page {page} of {Math.ceil(total / pageSize)}</span>
          {page < Math.ceil(total / pageSize) && <Link href={pageHref(page + 1)} className={`${ui.btn} ${ui.btnGhost} ${ui.sm}`}>Next</Link>}
        </nav>
      )}
    </>
  );
}
