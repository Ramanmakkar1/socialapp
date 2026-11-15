import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { isDbConfigured } from "@/lib/db";
import { listHref, param, parsePage, type SearchParams } from "@/lib/adminPaging";
import {
  ENV_GROUPS,
  envPresence,
  getJobHealth,
  getMigrationStatus,
  getTokenHealth,
  jobState,
  listBrokenAccounts,
  type BrokenAccount,
  type JobHealth,
  type JobState,
  type MigrationStatus,
  type TokenHealthRow,
} from "@/lib/adminSystem";
import { FEATURE_IDS, featureReadiness } from "@/lib/featureReadiness";
import { runtimeEnv } from "@/lib/featureReadinessNow";
import { isGoogleConfigured } from "@/lib/googleAuth";
import { isIgConfigured } from "@/lib/instagram";
import { isMetaLoginConfigured } from "@/lib/metaLogin";
import { networkAvailability } from "@/lib/networks/registry";
import { isThreadsConfigured } from "@/lib/threadsAuth";
import { isYouTubeConfigured } from "@/lib/youtubeAuth";
import Panel from "../ui/Panel";
import DataTable, { type Column, type Row } from "../ui/DataTable";
import StatusPill, { type StatusTone } from "../ui/StatusPill";
import Pager from "../ui/Pager";
import NetworkTag, { networkLabel } from "../ui/NetworkTag";
import { ago, fmtDateTime, num } from "../ui/format";
import styles from "../admin.module.css";

export const metadata = { title: "Admin system", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const STATE_TONE: Record<JobState, StatusTone> = { ok: "ok", warn: "warn", err: "err", unknown: "info" };
const STATE_LABEL: Record<JobState, string> = { ok: "OK", warn: "Behind", err: "Not running?", unknown: "No data yet" };
const MIGRATIONS_PER_PAGE = 15;

function jobRows(h: JobHealth): Row[] {
  const jobs: { name: string; state: JobState; last: Date | null; lastLabel: string; detail: string }[] = [
    {
      name: "publish-posts",
      state: jobState(h.overdueScheduled + h.stuckPublishing, h.lastPublished),
      last: h.lastPublished,
      lastLabel: "last post published",
      detail: `${num(h.overdueScheduled)} scheduled post(s) over 10 min late · ${num(h.stuckPublishing)} stuck in “publishing” over 30 min`,
    },
    {
      name: "send-dms",
      state: jobState(h.overdueDms, h.lastDmSent),
      last: h.lastDmSent,
      lastLabel: "last DM sent (7 days)",
      detail: `${num(h.overdueDms)} due DM(s) waiting over 15 min (accounts in a DM cooldown also wait)`,
    },
    {
      name: "refresh-tokens",
      state: h.tokensPastExpiry > 0 ? "err" : h.tokensExpiring3d > 0 ? "warn" : "ok",
      last: null,
      lastLabel: "no run record",
      detail: `${num(h.tokensPastExpiry)} active token(s) past expiry · ${num(h.tokensExpiring3d)} expiring within 3 days (the job refreshes 10 days ahead)`,
    },
    {
      name: "refresh-insights",
      state: !h.lastInsights ? "unknown" : Date.now() - new Date(h.lastInsights).getTime() > 36 * 3_600_000 ? "warn" : "ok",
      last: h.lastInsights,
      lastLabel: "last insights written",
      detail: "post insights are refreshed at most every 6 hours per post",
    },
  ];
  return jobs.map((j) => ({
    cells: [
      <span key="n" className={styles.mono}>
        /api/jobs/{j.name}
      </span>,
      <StatusPill key="s" tone={STATE_TONE[j.state]}>
        {STATE_LABEL[j.state]}
      </StatusPill>,
      <span key="l" title={fmtDateTime(j.last)}>
        {j.last ? `${ago(j.last)} · ${j.lastLabel}` : j.lastLabel}
      </span>,
      <span key="d" className={styles.muted}>
        {j.detail}
      </span>,
    ],
  }));
}

export default async function AdminSystemPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const sp = await searchParams;
  const apage = parsePage(param(sp, "apage"));
  const mpage = parsePage(param(sp, "mpage"));

  let jobs: JobHealth | null = null;
  let tokens: TokenHealthRow[] = [];
  let broken: { rows: BrokenAccount[]; hasNext: boolean } = { rows: [], hasNext: false };
  let migrations: MigrationStatus | null = null;
  let failed = false;
  if (isDbConfigured()) {
    try {
      [jobs, tokens, broken, migrations] = await Promise.all([getJobHealth(), getTokenHealth(), listBrokenAccounts(apage), getMigrationStatus()]);
    } catch (err) {
      console.error("admin system failed", err instanceof Error ? err.message : err);
      failed = true;
    }
  }
  const env = await runtimeEnv();
  const pageHref = (over: Record<string, number>) => listHref("/admin/system", { apage, mpage, ...over });

  const jobCols: Column[] = [
    { key: "job", label: "Job" },
    { key: "state", label: "Health" },
    { key: "last", label: "Last activity" },
    { key: "detail", label: "Evidence" },
  ];

  const tokenCols: Column[] = [
    { key: "net", label: "Network" },
    { key: "active", label: "Active", align: "right" },
    { key: "expired", label: "Expired", align: "right" },
    { key: "past", label: "Past expiry", align: "right" },
    { key: "soon", label: "Expiring · 7 d", align: "right" },
    { key: "failed", label: "Failed posts · 7 d", align: "right" },
    { key: "disc", label: "Disconnected", align: "right" },
  ];
  const tokenRows: Row[] = tokens.map((t) => ({
    cells: [<NetworkTag key="n" platform={t.platform} />, num(t.active), num(t.expired), num(t.past_expiry), num(t.expiring_7d), num(t.failed_7d), num(t.disconnected)],
  }));

  const brokenCols: Column[] = [
    { key: "acct", label: "Account" },
    { key: "user", label: "User" },
    { key: "status", label: "Status" },
    { key: "exp", label: "Token expiry", align: "right" },
  ];
  const brokenRows: Row[] = broken.rows.map((a) => ({
    href: `/admin/users/${a.user_id}`,
    cells: [
      <NetworkTag key="n" platform={a.platform} handle={a.name} />,
      a.email,
      <StatusPill key="s" tone="err">
        {a.status === "active" ? "token past expiry" : a.status}
      </StatusPill>,
      <span key="e">{a.token_expires_at ? `${fmtDateTime(a.token_expires_at)} (${ago(a.token_expires_at)})` : "—"}</span>,
    ],
  }));

  const integrations: { name: string; on: boolean }[] = [
    { name: "Instagram (Instagram login)", on: isIgConfigured() },
    { name: "Instagram + Facebook (Meta login)", on: isMetaLoginConfigured() },
    { name: "Threads", on: isThreadsConfigured() },
    { name: "YouTube", on: isYouTubeConfigured() },
    { name: "Google sign-in", on: isGoogleConfigured() },
    ...Object.entries(networkAvailability()).map(([id, on]) => ({ name: networkLabel(id), on })),
  ];

  const migrationsPage = migrations ? migrations.applied.slice((mpage - 1) * MIGRATIONS_PER_PAGE, mpage * MIGRATIONS_PER_PAGE) : [];
  const migrationsHasNext = migrations ? migrations.applied.length > mpage * MIGRATIONS_PER_PAGE : false;

  return (
    <>
      {failed && <p className={styles.settingsMsgErr}>Couldn’t load some system data. Check the server logs.</p>}

      <Panel title="Jobs" subtitle="cron routes, judged from the data they write" flush>
        {jobs ? <DataTable columns={jobCols} rows={jobRows(jobs)} /> : <p className={styles.empty}>No database connection.</p>}
        {jobs && (
          <div className={styles.panelBody}>
            <p className={styles.note}>
              Gap: the /api/jobs routes don’t record their runs (there is no job-run table), so “last run” is the last thing each job produced. Last Meta webhook:{" "}
              {jobs.lastMetaWebhook ? `${ago(jobs.lastMetaWebhook)} (${fmtDateTime(jobs.lastMetaWebhook)})` : "none received"}.
            </p>
          </div>
        )}
      </Panel>

      <div className={styles.row3}>
        <Panel title="Channel token health" subtitle="by network · failed posts are post targets in the last 7 days" flush>
          <DataTable columns={tokenCols} rows={tokenRows} empty="No channels connected yet." />
        </Panel>
        <Panel title="Accounts needing a reconnect" subtitle="expired, or active with the token past expiry" flush>
          <DataTable columns={brokenCols} rows={brokenRows} empty="Every connected account has a valid token." />
          <Pager page={apage} hasNext={broken.hasNext} shown={brokenRows.length} href={(n) => pageHref({ apage: n })} />
        </Panel>
      </div>

      <div className={styles.row3}>
        <Panel title="Integrations" subtitle="configured on this server (keys present), names only">
          <ul className={styles.att}>
            {integrations.map((i) => (
              <li key={i.name}>
                <StatusPill tone={i.on ? "ok" : "info"}>{i.on ? "configured" : "off"}</StatusPill>
                {i.name}
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Features" subtitle="src/lib/featureReadiness.ts · what is still missing, by name">
          <ul className={styles.att}>
            {FEATURE_IDS.map((id) => {
              const r = featureReadiness(id, env);
              return (
                <li key={id}>
                  <StatusPill tone={r.ready ? "ok" : "warn"}>{r.ready ? (r.source === "forced_ready" ? "forced on" : "on") : "off"}</StatusPill>
                  <span>
                    <b>{id}</b>
                    {r.missing.length > 0 && <span className={styles.muted}> · missing {r.missing.join(", ")}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>

      <Panel title="Environment" subtitle="set / not set only, never values">
        <div className={styles.row3}>
          {ENV_GROUPS.map((g) => (
            <div key={g.title}>
              <p className={styles.settingsLabel}>{g.title}</p>
              <ul className={styles.att}>
                {envPresence(g.names, process.env).map((v) => (
                  <li key={v.name}>
                    <StatusPill tone={v.set ? "ok" : "info"}>{v.set ? "set" : "not set"}</StatusPill>
                    <span className={styles.mono}>{v.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="Database migrations"
        subtitle="db/migrations vs socialapp.schema_migrations"
        actions={
          migrations ? (
            <StatusPill tone={migrations.pending.length > 0 ? "err" : migrations.filesAvailable ? "ok" : "info"}>
              {migrations.filesAvailable ? (migrations.pending.length > 0 ? `${migrations.pending.length} pending` : "up to date") : "files not bundled"}
            </StatusPill>
          ) : undefined
        }
        flush
      >
        {migrations ? (
          <>
            <div className={styles.panelBody}>
              <div className={styles.settingsStack}>
                <p className={styles.settingsText}>
                  {num(migrations.applied.length)} applied.{" "}
                  {migrations.filesAvailable
                    ? migrations.pending.length > 0
                      ? `Pending (run npm run db:migrate): ${migrations.pending.join(", ")}.`
                      : "No pending migrations."
                    : "The migration files aren't in this build, so pending ones can't be listed."}
                  {migrations.unknown.length > 0 && ` Applied but not in this build (renamed or from another branch): ${migrations.unknown.join(", ")}.`}
                </p>
              </div>
            </div>
            <DataTable
              columns={[
                { key: "name", label: "Migration" },
                { key: "at", label: "Applied", align: "right" },
              ]}
              rows={migrationsPage.map((m) => ({ cells: [<span key="n" className={styles.mono}>{m.name}</span>, fmtDateTime(m.applied_at)] }))}
              empty="No migrations recorded."
            />
            <Pager page={mpage} hasNext={migrationsHasNext} shown={migrationsPage.length} href={(n) => pageHref({ mpage: n })} />
          </>
        ) : (
          <p className={styles.empty}>No database connection.</p>
        )}
      </Panel>
      <p className={styles.muted}>
        Webhook and job errors are only in the server logs. <Link href="/admin">Back to overview</Link>
      </p>
    </>
  );
}
