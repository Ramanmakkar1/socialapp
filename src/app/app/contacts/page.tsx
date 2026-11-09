import Link from "next/link";
import { Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { buildContactQuery, parseContactFilters } from "@/lib/contactsQuery";
import EmptyState from "../EmptyState";
import LoadFailed from "../calendar/LoadFailed";
import ExportLeadsLink from "../leads/ExportLeadsLink";
import LeadContactActions from "../leads/LeadContactActions";
import LocalTime from "@/components/LocalTime";
import { BtnLink, PageHero } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import styles from "./contacts.module.css";

export const metadata = {
  title: "Contacts",
  description:
    "Every contact your auto-DMs capture: username, email, phone, source automation and last interaction. Search, filter and export to CSV.",
};

type Contact = {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: Date;
  last_seen_at: Date;
  tags: string[];
  rule_name: string | null;
};

function initialsFor(contact: Contact): string {
  const source = contact.name?.trim() || contact.username?.trim() || "";
  if (!source) return "?";
  const parts = source.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "?";
}

export default async function ContactsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const rawParams = await searchParams;
  const user = await requireUser();
  const configured = isDbConfigured();
  const filters = parseContactFilters(rawParams);
  const requestedPage = typeof rawParams.page === "string" ? rawParams.page : Array.isArray(rawParams.page) ? rawParams.page[0] : "";
  const reloadParams = new URLSearchParams();
  if (filters.search) reloadParams.set("q", filters.search);
  if (filters.onlyWithEmail) reloadParams.set("email", "1");
  if (filters.rule) reloadParams.set("rule", filters.rule);
  if (requestedPage) reloadParams.set("page", requestedPage);
  const reloadQuery = reloadParams.toString();
  const loadFailure = (
    <>
      <PageHero
        eyebrow="Captured from your auto-DMs"
        title="Contacts"
        lede="Everyone your auto-DMs talk to, with the emails and phones they share."
        art="/landing/card-leads.webp"
        artAlt=""
      />
      <LoadFailed
        className="mt-6"
        message="Contacts could not be loaded. Your saved contacts may still exist. Reload to try again."
        reloadHref={reloadQuery ? `/app/contacts?${reloadQuery}` : "/app/contacts"}
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

  const selectedRule = rules.some((item) => item.id === filters.rule) ? filters.rule : "";
  const selectedRuleName = selectedRule ? rules.find((item) => item.id === selectedRule)?.name : undefined;
  const pageFilters = { ...filters, rule: selectedRule };
  const filterActive = filters.search.length > 0 || filters.onlyWithEmail || selectedRule.length > 0;
  const leadsWithoutRuleParams = new URLSearchParams();
  if (filters.search) leadsWithoutRuleParams.set("q", filters.search);
  if (filters.onlyWithEmail) leadsWithoutRuleParams.set("email", "1");
  const showAllContactsHref = leadsWithoutRuleParams.toString()
    ? `/app/contacts?${leadsWithoutRuleParams.toString()}`
    : "/app/contacts";

  const { where, params } = buildContactQuery(user.id, pageFilters);

  const pageSize = 50;
  const parsedPage = typeof requestedPage === "string" && /^\d+$/.test(requestedPage) ? Number(requestedPage) : 1;
  const validPage = Number.isSafeInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  let countRows: { total: string; with_email: string; active_today: string }[];
  try {
    countRows = configured ? await query<{ total: string; with_email: string; active_today: string }>(
      `select count(*) as total, count(*) filter (where c.email is not null and c.email <> '') as with_email, count(*) filter (where c.last_seen_at >= now() - interval '24 hours') as active_today from socialapp.contacts c where ${where}`,
      params
    ) : [];
  } catch {
    return loadFailure;
  }
  const total = Number(countRows[0]?.total ?? 0);
  const withEmail = Number(countRows[0]?.with_email ?? 0);
  const activeToday = Number(countRows[0]?.active_today ?? 0);
  const page = Math.min(validPage, Math.max(1, Math.ceil(total / pageSize)));
  const offset = (page - 1) * pageSize;
  let contacts: Contact[];
  try {
    contacts = configured ? await query<Contact>(
      `select c.id, c.username, c.name, c.email, c.phone, c.created_at, c.last_seen_at, c.tags, r.name as rule_name from socialapp.contacts c left join socialapp.dm_rules r on r.id = c.source_rule_id where ${where} order by c.last_seen_at desc, c.id desc limit $${params.length + 1} offset $${params.length + 2}`,
      [...params, pageSize, offset]
    ) : [];
  } catch {
    return loadFailure;
  }

  const exportParams = new URLSearchParams();
  if (filters.search) exportParams.set("q", filters.search);
  if (filters.onlyWithEmail) exportParams.set("email", "1");
  if (selectedRule) exportParams.set("rule", selectedRule);
  const exportQuery = exportParams.toString();
  const exportHref = exportQuery ? `/app/contacts/export?${exportQuery}` : "/app/contacts/export";
  const exportCap = 10_000;
  const exportCapped = total > exportCap;
  function pageHref(target: number) {
    const pageParams = new URLSearchParams(exportParams);
    pageParams.set("page", String(target));
    return `/app/contacts?${pageParams.toString()}`;
  }

  return (
    <>
      <PageHero
        eyebrow="Captured from your auto-DMs"
        title="Contacts"
        lede={total > 0 ? `${total} ${total === 1 ? "contact" : "contacts"} · showing ${offset + 1}-${offset + contacts.length}` : "0 contacts"}
        art="/landing/card-leads.webp"
        artAlt=""
        action={contacts.length > 0 ? (
          <div className="flex flex-col items-start gap-2">
            <ExportLeadsLink href={exportHref}>
              {exportCapped ? "Export latest 10,000" : "Export CSV"}
            </ExportLeadsLink>
            {exportCapped ? (
              <p className={`${ui.hint} m-0 max-w-xs`}>
                CSV downloads are limited to the 10,000 newest matching contacts. Narrow with search, automation, or email filters.
              </p>
            ) : null}
          </div>
        ) : undefined}
      />
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <div className={`${ui.card} p-4`}>
          <p className={`${ui.hint} m-0`}>Total contacts</p>
          <p className="m-0 text-2xl font-bold text-[var(--poskoo-ink)]">{total}</p>
        </div>
        <div className={`${ui.card} p-4`}>
          <p className={`${ui.hint} m-0`}>With email</p>
          <p className="m-0 text-2xl font-bold text-[var(--poskoo-ink)]">{withEmail}</p>
        </div>
        <div className={`${ui.card} p-4`}>
          <p className={`${ui.hint} m-0`}>Active today</p>
          <p className="m-0 text-2xl font-bold text-[var(--poskoo-ink)]">{activeToday}</p>
        </div>
      </div>
      <form method="get" className="mt-6 flex flex-wrap items-end gap-3">
        <div className={ui.field} style={{ minWidth: "min(100%, 260px)" }}>
          <label htmlFor="contacts-search" className={ui.label}>Search</label>
          <input
            id="contacts-search"
            type="search"
            name="q"
            placeholder="Username, name, email or phone"
            defaultValue={filters.search}
            className={ui.input}
          />
        </div>
        <div className={ui.field}>
          <label htmlFor="contacts-rule" className={ui.label}>From automation</label>
          <select id="contacts-rule" name="rule" defaultValue={selectedRule} className={ui.input}>
            <option value="">All automations</option>
            {rules.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <label htmlFor="contacts-email" className={ui.checkRow}>
          <input id="contacts-email" type="checkbox" name="email" value="1" defaultChecked={filters.onlyWithEmail} />
          Only with email
        </label>
        <button type="submit" className={`${ui.btn} ${ui.btnDark} ${ui.sm}`}>Search</button>
        {filterActive && <Link href="/app/contacts" className={`${ui.hint} underline`}>Clear</Link>}
      </form>
      {selectedRuleName ? (
        <div className={`${ui.card} ${ui.band} mt-4 flex flex-wrap items-center gap-4 p-4`}>
          <div className="min-w-0 flex-1">
            <p className={`${ui.eyebrow} m-0`}>Automation</p>
            <p className="m-0 truncate font-semibold text-[var(--poskoo-ink)]">{selectedRuleName}</p>
          </div>
          <div className="flex w-full flex-wrap gap-x-4 gap-y-2 sm:w-auto sm:justify-end">
            <Link href="/app/auto-dm" className={ui.link}>Manage automations</Link>
            <Link href={showAllContactsHref} className={ui.link}>Show all contacts</Link>
          </div>
        </div>
      ) : null}
      {contacts.length === 0 ? (
        selectedRuleName ? (
          <div className={`${ui.card} ${ui.mint} mt-6 p-5 text-[.95rem]`}>
            <p className="m-0 text-[var(--poskoo-ink)]">
              No contacts captured for <strong>{selectedRuleName}</strong>
              {filters.search || filters.onlyWithEmail ? " with your current filters" : " yet"}.
            </p>
            <p className="mt-2 text-[var(--poskoo-muted)]">
              Turn on email capture or run the automation on Instagram comments — contacts appear here as people complete your DM flow.
            </p>
            <Link href="/app/auto-dm" className={`${ui.link} mt-3 inline-flex min-h-[44px] items-center`}>
              Back to this automation
            </Link>
          </div>
        ) : filterActive ? (
          <p className={`${ui.hint} mt-6`}>No contacts match your search.</p>
        ) : (
          <div className="mt-6">
            <EmptyState
              icon={Users}
              title="No contacts yet"
              text={configured ? "People your auto-DMs talk to will show here, exportable to CSV." : "Connect Instagram in Settings to start collecting contacts."}
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
            {contacts.map((contact) => (
              <li key={contact.id}>
                <article className={`${ui.card} p-4`}>
                  <div className="flex items-center gap-3">
                    <span className={styles.avatar} aria-hidden="true">{initialsFor(contact)}</span>
                    <p className={`m-0 break-all font-semibold text-[var(--poskoo-ink)]`}>{contact.username ? `@${contact.username}` : "—"}</p>
                  </div>
                  {contact.name ? <p className="mt-1 break-all text-sm text-[var(--poskoo-muted)]">{contact.name}</p> : null}
                  <dl className={`mt-3 grid gap-2 text-sm ${styles.mobileDl}`}>
                    <div>
                      <dt className={`text-xs ${ui.hint}`}>Email</dt>
                      <dd className="m-0 break-all">{contact.email || "—"}</dd>
                    </div>
                    <div>
                      <dt className={`text-xs ${ui.hint}`}>Phone</dt>
                      <dd className="m-0 break-all">{contact.phone || "—"}</dd>
                    </div>
                    <div>
                      <dt className={`text-xs ${ui.hint}`}>From automation</dt>
                      <dd className="m-0 break-all">{contact.rule_name || "—"}</dd>
                    </div>
                    <div>
                      <dt className={`text-xs ${ui.hint}`}>Last interaction</dt>
                      <dd className="m-0"><LocalTime value={contact.last_seen_at} style="medium" fallback="-" /></dd>
                    </div>
                    {contact.tags.length > 0 ? (
                      <div>
                        <dt className={`text-xs ${ui.hint}`}>Tags</dt>
                        <dd className="m-0 break-all">{contact.tags.join(", ")}</dd>
                      </div>
                    ) : null}
                  </dl>
                  <LeadContactActions email={contact.email} phone={contact.phone} />
                </article>
              </li>
            ))}
          </ul>
          <div className={`mt-6 hidden md:block ${ui.tableWrap}`}>
            <table className={ui.table}>
              <thead>
                <tr>{["Contact", "Email", "From automation", "Last interaction", "Tags"].map((heading) => <th key={heading} scope="col" className={ui.th}>{heading}</th>)}</tr>
              </thead>
              <tbody>{contacts.map((contact) => (
                <tr key={contact.id} className={ui.tr}>
                  <td className={ui.td}>
                    <span className="flex items-center gap-3">
                      <span className={styles.avatar} aria-hidden="true">{initialsFor(contact)}</span>
                      <span className="min-w-0">
                        <span className="block break-all font-semibold text-[var(--poskoo-ink)]">{contact.username ? `@${contact.username}` : "—"}</span>
                        {contact.name ? <span className="block break-all text-xs text-[var(--poskoo-muted)]">{contact.name}</span> : null}
                      </span>
                    </span>
                  </td>
                  <td className={ui.td}>{contact.email || "—"}</td>
                  <td className={ui.td}>{contact.rule_name || "—"}</td>
                  <td className={ui.td}><LocalTime value={contact.last_seen_at} style="medium" fallback="-" /></td>
                  <td className={ui.td}>{contact.tags.length > 0 ? contact.tags.join(", ") : "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </>
      )}
      {total > pageSize && (
        <nav aria-label="Contacts pagination" className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          {page > 1 && <Link href={pageHref(page - 1)} className={`${ui.btn} ${ui.btnGhost} ${ui.sm}`}>Previous</Link>}
          <span className={ui.hint}>Page {page} of {Math.ceil(total / pageSize)}</span>
          {page < Math.ceil(total / pageSize) && <Link href={pageHref(page + 1)} className={`${ui.btn} ${ui.btnGhost} ${ui.sm}`}>Next</Link>}
        </nav>
      )}
    </>
  );
}
