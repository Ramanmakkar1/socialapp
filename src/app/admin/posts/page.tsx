import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { isDbConfigured } from "@/lib/db";
import { listHref, param, parsePage, pickOne, type SearchParams } from "@/lib/adminPaging";
import { ADMIN_NETWORKS, POST_STATUSES, listAdminPosts, type AdminPostRow } from "@/lib/adminPosts";
import Panel from "../ui/Panel";
import DataTable, { type Column, type Row } from "../ui/DataTable";
import StatusPill from "../ui/StatusPill";
import Pager from "../ui/Pager";
import ActionForm from "../ui/ActionForm";
import { networkLabel } from "../ui/NetworkTag";
import { PostTargets, postStatusTone } from "../ui/PostTargets";
import { ago, fmtDateTime } from "../ui/format";
import { retryPostAdminAction } from "./actions";
import styles from "../admin.module.css";

export const metadata = { title: "Admin posts", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const COLUMNS: Column[] = [
  { key: "post", label: "Post" },
  { key: "status", label: "Status" },
  { key: "targets", label: "Networks · status · error" },
  { key: "when", label: "Scheduled" },
  { key: "updated", label: "Updated", align: "right" },
  { key: "act", label: "" },
];

export default async function AdminPostsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const sp = await searchParams;
  const status = pickOne(param(sp, "status"), POST_STATUSES);
  const network = pickOne(param(sp, "network"), ADMIN_NETWORKS);
  const page = parsePage(param(sp, "page"));

  let result: { rows: AdminPostRow[]; hasNext: boolean } = { rows: [], hasNext: false };
  let failed = false;
  if (isDbConfigured()) {
    try {
      result = await listAdminPosts({ status, network, page });
    } catch (err) {
      console.error("admin posts list failed", err instanceof Error ? err.message : err);
      failed = true;
    }
  }

  const rows: Row[] = result.rows.map((p) => ({
    cells: [
      <div key="p" className={styles.userCell}>
        <div>
          <span className={styles.muted}>{p.caption ? p.caption.slice(0, 90) : "(no caption)"}</span>
          <small>
            <Link href={`/admin/users/${p.user_id}`}>{p.email}</Link>
          </small>
        </div>
      </div>,
      <StatusPill key="s" tone={postStatusTone(p.status)}>
        {p.status}
      </StatusPill>,
      <PostTargets key="t" targets={p.targets} />,
      <span key="w">{fmtDateTime(p.scheduled_at)}</span>,
      <span key="u" title={fmtDateTime(p.updated_at)}>
        {ago(p.updated_at)}
      </span>,
      p.status === "failed" ? (
        <ActionForm
          key="a"
          action={retryPostAdminAction}
          fields={{ postId: p.id }}
          label="Retry"
          busyLabel="Retrying…"
          confirm={`Retry this post for ${p.email}? It goes back in the queue and publishes on the next run.`}
        />
      ) : (
        <span key="a" />
      ),
    ],
  }));

  return (
    <>
      <form method="get" action="/admin/posts" className={styles.filters}>
        <select name="status" defaultValue={status} aria-label="Post status" className={styles.filterSelect}>
          <option value="">All statuses</option>
          {POST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select name="network" defaultValue={network} aria-label="Network" className={styles.filterSelect}>
          <option value="">All networks</option>
          {ADMIN_NETWORKS.map((n) => (
            <option key={n} value={n}>
              {networkLabel(n)}
            </option>
          ))}
        </select>
        <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
          Filter
        </button>
        {(status || network) && (
          <Link href="/admin/posts" className={styles.btn}>
            Clear
          </Link>
        )}
      </form>
      <Panel title="Posts & queue" subtitle="all users, newest activity first" flush>
        {failed ? (
          <p className={styles.empty}>Couldn’t load posts. Check the server logs.</p>
        ) : (
          <>
            <DataTable columns={COLUMNS} rows={rows} empty="No posts match these filters." />
            <Pager page={page} hasNext={result.hasNext} shown={rows.length} href={(n) => listHref("/admin/posts", { status, network, page: n })} />
          </>
        )}
      </Panel>
      <p className={styles.note}>
        Retry uses the same code as the user’s own Retry: the post goes back to “scheduled” (now), failed networks go back to “pending”, and the owner’s monthly plan
        limit still applies. Every retry is written to the audit log.
      </p>
    </>
  );
}
