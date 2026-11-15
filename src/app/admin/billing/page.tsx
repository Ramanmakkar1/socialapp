import { requireAdmin } from "@/lib/admin";
import { isDbConfigured } from "@/lib/db";
import { listHref, param, parsePage, type SearchParams } from "@/lib/adminPaging";
import { getBillingSummary, listProblemCheckouts, listStripeEvents, type BillingSummary, type ProblemCheckout, type StripeEventRow } from "@/lib/adminBilling";
import { PLAN_PRICES, formatUsd } from "@/lib/billingState";
import { featureReadiness, stripeMode } from "@/lib/featureReadiness";
import KpiCard from "../ui/KpiCard";
import Panel from "../ui/Panel";
import DataTable, { type Column, type Row } from "../ui/DataTable";
import StatusPill from "../ui/StatusPill";
import Pager from "../ui/Pager";
import { ago, fmtDateTime, num } from "../ui/format";
import styles from "../admin.module.css";

export const metadata = { title: "Admin billing", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Paged<T> = { rows: T[]; hasNext: boolean };
const EMPTY_SUMMARY: BillingSummary = { mrrCents: 0, paying: 0, trialing: 0, pastDue: 0, canceled: 0, abandoned: 0, byPlan: [], byStatus: [] };

// Read-only. Every number comes from socialapp.billing_subscriptions / stripe_events; prices from billingState.PLAN_PRICES.
export default async function AdminBillingPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const sp = await searchParams;
  const epage = parsePage(param(sp, "epage"));
  const cpage = parsePage(param(sp, "cpage"));

  let summary = EMPTY_SUMMARY;
  let events: Paged<StripeEventRow> = { rows: [], hasNext: false };
  let checkouts: Paged<ProblemCheckout> = { rows: [], hasNext: false };
  let failed = false;
  if (isDbConfigured()) {
    try {
      [summary, events, checkouts] = await Promise.all([getBillingSummary(), listStripeEvents(epage), listProblemCheckouts(cpage)]);
    } catch (err) {
      console.error("admin billing failed", err instanceof Error ? err.message : err);
      failed = true;
    }
  }
  const readiness = featureReadiness("billing", process.env);
  const mode = stripeMode(process.env.STRIPE_SECRET_KEY);

  const planCols: Column[] = [
    { key: "plan", label: "Plan" },
    { key: "price", label: "Price" },
    { key: "paying", label: "Paying", align: "right" },
    { key: "mrr", label: "MRR", align: "right" },
  ];
  const planRows: Row[] = summary.byPlan.map((p) => ({
    cells: [`${p.plan} · ${p.interval === "year" ? "yearly" : "monthly"}`, `${formatUsd(PLAN_PRICES[p.plan][p.interval])} / ${p.interval}`, num(p.paying), formatUsd(p.mrrCents)],
  }));

  const statusCols: Column[] = [
    { key: "status", label: "Status" },
    { key: "n", label: "Customers", align: "right" },
  ];
  const statusRows: Row[] = summary.byStatus.map((s) => ({
    cells: [<StatusPill key="s" tone={s.status === "active" ? "ok" : s.status === "past_due" || s.status === "unpaid" ? "err" : s.status === "trialing" ? "warn" : "info"}>{s.status}</StatusPill>, num(s.n)],
  }));

  const eventCols: Column[] = [
    { key: "type", label: "Event" },
    { key: "id", label: "Stripe id" },
    { key: "at", label: "Received", align: "right" },
  ];
  const eventRows: Row[] = events.rows.map((e) => ({
    cells: [
      <StatusPill key="t" tone={/fail|past_due|dispute/.test(e.type) ? "err" : "info"}>{e.type}</StatusPill>,
      <span key="i" className={styles.mono}>{e.id}</span>,
      <span key="a" title={fmtDateTime(e.received_at)}>{ago(e.received_at)}</span>,
    ],
  }));

  const checkoutCols: Column[] = [
    { key: "user", label: "User" },
    { key: "plan", label: "Plan" },
    { key: "state", label: "State" },
    { key: "started", label: "Started" },
    { key: "upd", label: "Updated", align: "right" },
  ];
  const checkoutRows: Row[] = checkouts.rows.map((c) => ({
    href: `/admin/users/${c.user_id}`,
    cells: [
      c.email,
      c.plan ? `${c.plan}${c.billing_interval ? ` · ${c.billing_interval}` : ""}` : "—",
      <StatusPill key="s" tone={c.status === "past_due" || c.status === "unpaid" ? "err" : "warn"}>
        {!c.started ? "checkout not completed" : c.status === "past_due" && c.past_due_since ? `past_due since ${fmtDateTime(c.past_due_since)}` : (c.status ?? "unknown")}
      </StatusPill>,
      fmtDateTime(c.created_at),
      <span key="u" title={fmtDateTime(c.updated_at)}>{ago(c.updated_at)}</span>,
    ],
  }));

  const pageHref = (over: Record<string, number>) => listHref("/admin/billing", { epage, cpage, ...over });

  return (
    <>
      <p className={styles.panelSub}>
        Stripe {mode === "none" ? "not configured" : `${mode} mode`} · paid plans {readiness.ready ? "on sale" : `not on sale yet (missing: ${readiness.missing.join(", ") || "—"})`}
      </p>
      {failed && <p className={styles.settingsMsgErr}>Couldn’t load billing data. Check the server logs.</p>}
      <div className={styles.kpis}>
        <KpiCard label="MRR" value={formatUsd(summary.mrrCents)} accent={summary.mrrCents > 0} />
        <KpiCard label="Paying" value={num(summary.paying)} />
        <KpiCard label="Trialing" value={num(summary.trialing)} />
        <KpiCard label="Past due / unpaid" value={num(summary.pastDue)} />
        <KpiCard label="Canceled" value={num(summary.canceled)} />
        <KpiCard label="Abandoned" value={num(summary.abandoned)} />
      </div>
      <div className={styles.row3}>
        <Panel title="Revenue by plan" subtitle="active, or past_due inside the 7-day grace; yearly counted as 1/12" flush>
          <DataTable columns={planCols} rows={planRows} empty="No paying subscriptions yet." />
        </Panel>
        <Panel title="Customers by status" subtitle="every billing_subscriptions row" flush>
          <DataTable columns={statusCols} rows={statusRows} empty="Nobody has started a checkout yet." />
        </Panel>
      </div>
      <Panel title="Failed or abandoned checkouts" subtitle="no subscription, incomplete, past_due or unpaid · newest first" flush>
        <DataTable columns={checkoutCols} rows={checkoutRows} empty="No failed or abandoned checkouts." />
        <Pager page={cpage} hasNext={checkouts.hasNext} shown={checkoutRows.length} href={(n) => pageHref({ cpage: n })} />
      </Panel>
      <Panel title="Recent Stripe events" subtitle="webhook deliveries Poskoo processed (billing + creator checkout)" flush>
        <DataTable columns={eventCols} rows={eventRows} empty="No Stripe webhook events received yet." />
        <Pager page={epage} hasNext={events.hasNext} shown={eventRows.length} href={(n) => pageHref({ epage: n })} />
      </Panel>
      <p className={styles.note}>
        Data gaps: stripe_events keeps only the event id, type and time (for idempotency), not the payload or amount, and Checkout Sessions are not stored. An
        “abandoned” checkout is a Stripe customer Poskoo created whose subscription never started or stayed incomplete. Look the customer up in the{" "}
        <a href="https://dashboard.stripe.com/customers" target="_blank" rel="noreferrer">Stripe dashboard</a> for details. MRR excludes trials, coupons and taxes.
      </p>
    </>
  );
}
