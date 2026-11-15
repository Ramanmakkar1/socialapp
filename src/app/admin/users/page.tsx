import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { isDbConfigured } from "@/lib/db";
import { listHref, param, parsePage, type SearchParams } from "@/lib/adminPaging";
import { effectivePlan, listAdminUsers, type AdminUserRow } from "@/lib/adminUsers";
import Panel from "../ui/Panel";
import DataTable, { type Column, type Row } from "../ui/DataTable";
import StatusPill from "../ui/StatusPill";
import Pager from "../ui/Pager";
import { ago, fmtDate, num } from "../ui/format";
import styles from "../admin.module.css";

export const metadata = { title: "Admin users", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const COLUMNS: Column[] = [
  { key: "user", label: "User" },
  { key: "plan", label: "Plan" },
  { key: "joined", label: "Signed up" },
  { key: "channels", label: "Channels", align: "right" },
  { key: "posts", label: "Posts · month", align: "right" },
  { key: "dms", label: "DMs · month", align: "right" },
  { key: "seen", label: "Last sign-in", align: "right" },
];

function PlanCell({ u }: { u: AdminUserRow }) {
  const { plan, viaAdmin } = effectivePlan(u);
  const tone = plan === "Free" ? "info" : plan === "Pro" ? "ok" : "warn";
  return (
    <span className={styles.inlineForm}>
      <StatusPill tone={tone}>{viaAdmin ? `${plan} · admin` : plan}</StatusPill>
      {u.status && u.status !== "active" && <StatusPill tone={u.status === "past_due" || u.status === "unpaid" ? "err" : "info"}>{u.status}</StatusPill>}
    </span>
  );
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = param(sp, "q");
  const page = parsePage(param(sp, "page"));

  let result: { rows: AdminUserRow[]; hasNext: boolean } = { rows: [], hasNext: false };
  let failed = false;
  if (isDbConfigured()) {
    try {
      result = await listAdminUsers({ q, page });
    } catch (err) {
      console.error("admin users list failed", err instanceof Error ? err.message : err);
      failed = true;
    }
  }

  const rows: Row[] = result.rows.map((u) => ({
    href: `/admin/users/${u.id}`,
    cells: [
      <div key="u" className={styles.userCell}>
        <span className={styles.avatar}>{(u.name || u.email)[0]?.toUpperCase()}</span>
        <div>
          {u.name || u.email.split("@")[0]}
          <small>
            {u.email}
            {u.verified ? "" : " · unverified"}
          </small>
        </div>
      </div>,
      <PlanCell key="p" u={u} />,
      <span key="j">{fmtDate(u.created_at)}</span>,
      num(u.channels),
      num(u.posts_month),
      num(u.dms_month),
      <span key="s" title={u.last_sign_in ? new Date(u.last_sign_in).toISOString() : undefined}>{ago(u.last_sign_in)}</span>,
    ],
  }));

  return (
    <>
      <form method="get" action="/admin/users" className={styles.filters} role="search">
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Email, name or @handle"
          aria-label="Search users by email, name or channel handle"
          className={styles.filterInput}
        />
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
          Search
        </button>
        {q && (
          <Link href="/admin/users" className={styles.btn}>
            Clear
          </Link>
        )}
      </form>
      <Panel
        title={q ? `Users matching “${q}”` : "All users"}
        subtitle="newest first · posts = scheduled/published this UTC month (the plan meter) · DMs = sent this UTC month"
        flush
      >
        {failed ? (
          <p className={styles.empty}>Couldn’t load users. Check the server logs.</p>
        ) : (
          <>
            <DataTable columns={COLUMNS} rows={rows} empty={q ? "No user matches that search." : "No users yet."} />
            <Pager page={page} hasNext={result.hasNext} shown={rows.length} href={(p) => listHref("/admin/users", { q, page: p })} />
          </>
        )}
      </Panel>
      <p className={styles.note}>
        “Last sign-in” is the newest session (there is no last-seen tracking). Search matches email, name, any connected channel’s username / Page name and YouTube channel
        title.
      </p>
    </>
  );
}
