import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { isDbConfigured } from "@/lib/db";
import { listHref, param, parsePage, type SearchParams } from "@/lib/adminPaging";
import { KNOWN_AUDIT_ACTIONS, auditFilterOptions, detailsText, listAudit, type AuditRow } from "@/lib/adminAuditLog";
import Panel from "../ui/Panel";
import DataTable, { type Column, type Row } from "../ui/DataTable";
import StatusPill from "../ui/StatusPill";
import Pager from "../ui/Pager";
import { fmtDateTime } from "../ui/format";
import styles from "../admin.module.css";

export const metadata = { title: "Admin audit log", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const COLUMNS: Column[] = [
  { key: "when", label: "When" },
  { key: "admin", label: "Admin" },
  { key: "action", label: "Action" },
  { key: "target", label: "Target" },
  { key: "details", label: "Details" },
];

export default async function AdminAuditPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const sp = await searchParams;
  const page = parsePage(param(sp, "page"));
  let options: { actions: string[]; admins: string[] } = { actions: [...KNOWN_AUDIT_ACTIONS], admins: [] };
  let result: { rows: AuditRow[]; hasNext: boolean } = { rows: [], hasNext: false };
  let failed = false;
  if (isDbConfigured()) {
    try {
      options = await auditFilterOptions();
    } catch {
      // keep the known actions
    }
  }
  // Only values the filter offers are used (anything else means "no filter").
  const action = options.actions.includes(param(sp, "action")) ? param(sp, "action") : "";
  const admin = options.admins.includes(param(sp, "admin")) ? param(sp, "admin") : "";
  const target = param(sp, "target").slice(0, 100);
  if (isDbConfigured()) {
    try {
      result = await listAudit({ action, admin, target, page });
    } catch (err) {
      console.error("admin audit list failed", err instanceof Error ? err.message : err);
      failed = true;
    }
  }

  const rows: Row[] = result.rows.map((a) => ({
    cells: [
      <span key="w">{fmtDateTime(a.created_at)}</span>,
      a.admin_email,
      <StatusPill key="a" tone={a.action.endsWith(".remove") || a.action.endsWith(".pause") ? "warn" : "info"}>
        {a.action}
      </StatusPill>,
      a.target_user_id ? (
        <Link key="t" href={`/admin/users/${a.target_user_id}`}>
          {a.target_email ?? a.target_user_id}
        </Link>
      ) : (
        <span key="t" className={styles.muted}>
          {a.target_email ?? "—"}
        </span>
      ),
      <span key="d" className={styles.mono}>
        {detailsText(a.details)}
      </span>,
    ],
  }));

  return (
    <>
      <form method="get" action="/admin/audit" className={styles.filters}>
        <select name="action" defaultValue={action} aria-label="Action" className={styles.filterSelect}>
          <option value="">All actions</option>
          {options.actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <select name="admin" defaultValue={admin} aria-label="Admin" className={styles.filterSelect}>
          <option value="">All admins</option>
          {options.admins.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <input type="search" name="target" defaultValue={target} placeholder="Target email" aria-label="Target user's email" className={styles.filterInput} />
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
          Filter
        </button>
        {(action || admin || target) && (
          <Link href="/admin/audit" className={styles.btn}>
            Clear
          </Link>
        )}
      </form>
      <Panel title="Audit log" subtitle="every admin action, newest first" flush>
        {failed ? (
          <p className={styles.empty}>Couldn’t load the audit log. Check the server logs.</p>
        ) : (
          <>
            <DataTable columns={COLUMNS} rows={rows} empty={action || admin || target ? "No entries match these filters." : "No admin actions recorded yet."} />
            <Pager page={page} hasNext={result.hasNext} shown={rows.length} href={(n) => listHref("/admin/audit", { action, admin, target, page: n })} />
          </>
        )}
      </Panel>
    </>
  );
}
