import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { isDbConfigured } from "@/lib/db";
import { listHref, param, parsePage, pickOne, type SearchParams } from "@/lib/adminPaging";
import {
  FAILURE_LABEL,
  RULE_STATUSES,
  getDmsSentPerDay,
  getQueueHealth,
  listAdminRules,
  type AdminRuleRow,
  type QueueHealth,
} from "@/lib/adminAutomations";
import KpiCard from "../ui/KpiCard";
import Panel from "../ui/Panel";
import DataTable, { type Column, type Row } from "../ui/DataTable";
import StatusPill from "../ui/StatusPill";
import Pager from "../ui/Pager";
import ActionForm from "../ui/ActionForm";
import { AreaChart } from "../ui/charts";
import { ago, fmtDateTime, num } from "../ui/format";
import { pauseRuleAdminAction } from "./actions";
import styles from "../admin.module.css";

export const metadata = { title: "Admin automations", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const EMPTY_HEALTH: QueueHealth = { pendingDue: 0, pendingLater: 0, retrying: 0, oldestDue: null, reasons: [], totals: { fatal: 0, gave_up: 0, skipped: 0 } };

export default async function AdminAutomationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = pickOne(param(sp, "status"), RULE_STATUSES);
  const page = parsePage(param(sp, "page"));

  let rules: { rows: AdminRuleRow[]; hasNext: boolean } = { rows: [], hasNext: false };
  let health = EMPTY_HEALTH;
  let perDay: number[] = [];
  let failed = false;
  if (isDbConfigured()) {
    try {
      [rules, health, perDay] = await Promise.all([listAdminRules({ status, page }), getQueueHealth(), getDmsSentPerDay()]);
    } catch (err) {
      console.error("admin automations failed", err instanceof Error ? err.message : err);
      failed = true;
    }
  }
  const sent30 = perDay.reduce((a, b) => a + b, 0);

  const ruleCols: Column[] = [
    { key: "rule", label: "Rule" },
    { key: "status", label: "Status" },
    { key: "trigger", label: "Triggers · keywords" },
    { key: "sent", label: "Sent · 30 d", align: "right" },
    { key: "upd", label: "Updated", align: "right" },
    { key: "act", label: "" },
  ];
  const ruleRows: Row[] = rules.rows.map((r) => ({
    cells: [
      <div key="r" className={styles.userCell}>
        <div>
          {r.name || "(unnamed rule)"}
          <small>
            <Link href={`/admin/users/${r.user_id}`}>{r.email}</Link>
            {r.account ? ` · @${r.account}` : ""}
          </small>
        </div>
      </div>,
      <span key="s" className={styles.inlineForm}>
        <StatusPill tone={r.status === "active" ? "ok" : "info"}>{r.status}</StatusPill>
        {r.ai_replies ? <StatusPill tone="info">AI replies</StatusPill> : null}
      </span>,
      <span key="t" className={styles.muted}>
        {(r.triggers ?? []).join(", ") || "—"} · {(r.keywords ?? []).slice(0, 6).join(", ") || "any comment"}
        {(r.keywords?.length ?? 0) > 6 ? ` +${(r.keywords?.length ?? 0) - 6}` : ""}
      </span>,
      num(r.sent_30d),
      <span key="u" title={fmtDateTime(r.updated_at)}>
        {ago(r.updated_at)}
      </span>,
      r.status === "active" ? (
        <ActionForm
          key="a"
          action={pauseRuleAdminAction}
          fields={{ ruleId: r.id }}
          label="Pause"
          busyLabel="Pausing…"
          danger
          confirm={`Pause “${r.name || "this rule"}” for ${r.email}? Its queued DMs wait until the owner turns it back on.`}
        />
      ) : (
        <span key="a" />
      ),
    ],
  }));

  const reasonCols: Column[] = [
    { key: "kind", label: "Outcome" },
    { key: "reason", label: "Reason" },
    { key: "n", label: "DMs", align: "right" },
    { key: "last", label: "Latest", align: "right" },
  ];
  const reasonRows: Row[] = health.reasons.map((r) => ({
    cells: [
      <StatusPill key="k" tone={r.kind === "skipped" ? "info" : "err"}>
        {FAILURE_LABEL[r.kind]}
      </StatusPill>,
      <span key="r" className={styles.errText}>
        {r.reason}
      </span>,
      num(r.n),
      <span key="l" title={fmtDateTime(r.last)}>
        {ago(r.last)}
      </span>,
    ],
  }));

  return (
    <>
      {failed && <p className={styles.settingsMsgErr}>Couldn’t load automation data. Check the server logs.</p>}
      <div className={styles.kpis}>
        <KpiCard label="Pending · due" value={num(health.pendingDue)} />
        <KpiCard label="Pending · later" value={num(health.pendingLater)} />
        <KpiCard label="Retrying" value={num(health.retrying)} />
        <KpiCard label="Fatal · 30 d" value={num(health.totals.fatal)} />
        <KpiCard label="Gave up · 30 d" value={num(health.totals.gave_up)} />
        <KpiCard label="Skipped · 30 d" value={num(health.totals.skipped)} />
      </div>
      {health.oldestDue && (
        <p className={styles.panelSub} role="alert">
          Oldest due DM has waited since {fmtDateTime(health.oldestDue)} ({ago(health.oldestDue)}). If that is more than a few minutes, the send-dms job may not be
          running, or the account is in a DM cooldown.
        </p>
      )}
      <div className={styles.row2}>
        <Panel title="Auto-DMs sent per day" subtitle={`last 30 days · ${num(sent30)} total`}>
          {perDay.length > 0 ? (
            <AreaChart data={perDay} ariaLabel={`Auto-DMs sent per day over the last 30 days, ${sent30} total`} xLabels={["30 days ago", "today"]} />
          ) : (
            <p className={styles.panelSub}>No data.</p>
          )}
        </Panel>
        <Panel title="Why DMs didn't send" subtitle="failed + skipped, last 30 days, by reason" flush>
          <DataTable columns={reasonCols} rows={reasonRows} empty="No failed or skipped DMs in the last 30 days." />
        </Panel>
      </div>
      <form method="get" action="/admin/automations" className={styles.filters}>
        <select name="status" defaultValue={status} aria-label="Rule status" className={styles.filterSelect}>
          <option value="">All rules</option>
          {RULE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
          Filter
        </button>
        {status && (
          <Link href="/admin/automations" className={styles.btn}>
            Clear
          </Link>
        )}
      </form>
      <Panel title="Auto-DM rules" subtitle="all users, recently changed first" flush>
        <DataTable columns={ruleCols} rows={ruleRows} empty="No Auto-DM rules match." />
        <Pager page={page} hasNext={rules.hasNext} shown={ruleRows.length} href={(n) => listHref("/admin/automations", { status, page: n })} />
      </Panel>
      <p className={styles.note}>
        dm_queue has no “fatal” status: a failed DM with fewer than the maximum attempts stopped on an error that is never retried (e.g. the recipient turned off
        messages); one at the maximum gave up after retries. Pausing a rule is audit-logged; only the owner can turn it back on.
      </p>
    </>
  );
}
