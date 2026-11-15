import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin";
import { isDbConfigured } from "@/lib/db";
import { isUuid, listHref, param, parsePage, type SearchParams } from "@/lib/adminPaging";
import { listAdminPosts } from "@/lib/adminPosts";
import {
  effectivePlan,
  getAdminUser,
  getAdminUserAudit,
  getAdminUserBilling,
  getAdminUserChannels,
  getAdminUserUsage,
} from "@/lib/adminUsers";
import { AI_REQUESTS_PER_MONTH } from "@/lib/aiQuota";
import { graceEndsAt } from "@/lib/billingState";
import { PLAN_LIMITS, monthlyAutoDmLimit } from "@/lib/planLimits";
import Panel from "../../ui/Panel";
import DataTable, { type Column, type Row } from "../../ui/DataTable";
import StatusPill, { type StatusTone } from "../../ui/StatusPill";
import Pager from "../../ui/Pager";
import NetworkTag from "../../ui/NetworkTag";
import ActionForm from "../../ui/ActionForm";
import { PostTargets, postStatusTone } from "../../ui/PostTargets";
import { ago, fmtDate, fmtDateTime, num } from "../../ui/format";
import { resendVerificationAdminAction } from "../actions";
import styles from "../../admin.module.css";

export const metadata = { title: "Admin user", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const POSTS_PER_PAGE = 10;

function isPast(d: Date | null): boolean {
  return d !== null && new Date(d).getTime() < Date.now();
}

function channelTone(status: string, expires: Date | null): StatusTone {
  if (status === "active") return isPast(expires) ? "err" : "ok";
  if (status === "expired") return "err";
  return "info";
}

export default async function AdminUserPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  if (!isUuid(id) || !isDbConfigured()) notFound();
  const page = parsePage(param(await searchParams, "page"));

  const user = await getAdminUser(id);
  if (!user) notFound();

  const [channels, billing, usage, posts, audit, dmLimit] = await Promise.all([
    getAdminUserChannels(id),
    getAdminUserBilling(id),
    getAdminUserUsage(id),
    listAdminPosts({ userId: id, page, pageSize: POSTS_PER_PAGE }),
    getAdminUserAudit(id),
    monthlyAutoDmLimit(id).catch(() => null),
  ]);

  const verified = user.email_verified_at !== null;
  const plan = effectivePlan({ email: user.email, verified, plan: billing?.plan ?? null, status: billing?.status ?? null, past_due_since: billing?.past_due_since ?? null });
  const limits = PLAN_LIMITS[plan.plan];
  const aiTotal = usage.ai.reduce((a, r) => a + r.n, 0);
  const grace = billing?.status === "past_due" ? graceEndsAt(billing.past_due_since) : null;

  const channelCols: Column[] = [
    { key: "net", label: "Network" },
    { key: "status", label: "Status" },
    { key: "auth", label: "Login" },
    { key: "exp", label: "Token expires" },
    { key: "since", label: "Connected", align: "right" },
  ];
  const channelRows: Row[] = channels.map((c) => ({
    cells: [
      <NetworkTag key="n" platform={c.platform} handle={c.name} />,
      <StatusPill key="s" tone={channelTone(c.status, c.token_expires_at)}>
        {c.status === "active" && isPast(c.token_expires_at) ? "token past expiry" : c.status}
      </StatusPill>,
      <span key="a" className={styles.muted}>
        {c.auth_type ?? (c.kind === "youtube" ? "google" : "—")}
        {c.dm_cooldown_until && !isPast(c.dm_cooldown_until) ? ` · DM cooldown until ${fmtDateTime(c.dm_cooldown_until)}` : ""}
      </span>,
      <span key="e">{c.token_expires_at ? `${fmtDate(c.token_expires_at)} (${ago(c.token_expires_at)})` : "—"}</span>,
      <span key="c">{fmtDate(c.created_at)}</span>,
    ],
  }));

  const postCols: Column[] = [
    { key: "post", label: "Post" },
    { key: "status", label: "Status" },
    { key: "targets", label: "Targets" },
    { key: "when", label: "Scheduled", align: "right" },
  ];
  const postRows: Row[] = posts.rows.map((p) => ({
    cells: [
      <span key="c" className={styles.muted}>
        {p.caption ? p.caption.slice(0, 90) : "(no caption)"}
      </span>,
      <StatusPill key="s" tone={postStatusTone(p.status)}>
        {p.status}
      </StatusPill>,
      <PostTargets key="t" targets={p.targets} />,
      <span key="w">{fmtDateTime(p.scheduled_at)}</span>,
    ],
  }));

  return (
    <>
      <p className={styles.muted}>
        <Link href="/admin/users">← All users</Link>
      </p>
      <div className={styles.row3}>
        <Panel title={user.name || user.email.split("@")[0]} subtitle={user.email}>
          <div className={styles.settingsStack}>
            <dl className={styles.kv}>
              <dt>Signed up</dt>
              <dd>{fmtDateTime(user.created_at)}</dd>
              <dt>Email</dt>
              <dd>{verified ? `verified ${fmtDate(user.email_verified_at)}` : "not verified"}</dd>
              <dt>Sign-in</dt>
              <dd>{[user.google ? "Google" : null, user.has_password ? "password" : null].filter(Boolean).join(" + ") || "—"}</dd>
              <dt>Sessions</dt>
              <dd>
                {num(usage.liveSessions)} live · last sign-in {ago(usage.lastSignIn)}
              </dd>
              <dt>Referred</dt>
              <dd>{user.referred ? "yes" : "no"}</dd>
              <dt>User id</dt>
              <dd className={styles.mono}>{user.id}</dd>
            </dl>
            {!verified && (
              <ActionForm
                action={resendVerificationAdminAction}
                fields={{ userId: user.id }}
                label="Resend verification email"
                busyLabel="Sending…"
                confirm={`Send a new verification code to ${user.email}?`}
              />
            )}
            <p className={styles.note}>
              Not available: plan override, disabling an account and impersonation. The codebase has no support for them (plans come only from Stripe or the admin
              allow-list; there is no disabled flag), so they are not offered here.
            </p>
          </div>
        </Panel>
        <Panel
          title="Plan & usage"
          subtitle="this UTC month"
          actions={<StatusPill tone={plan.plan === "Free" ? "info" : "ok"}>{plan.viaAdmin ? `${plan.plan} · admin` : plan.plan}</StatusPill>}
        >
          <dl className={styles.kv}>
            <dt>Subscription</dt>
            <dd>
              {billing ? (
                <>
                  {billing.plan ?? "no plan"} {billing.billing_interval ? `/ ${billing.billing_interval}` : ""} · {billing.status ?? (billing.stripe_subscription_id ? "unknown status" : "checkout never completed")}
                  {billing.cancel_at_period_end || billing.cancel_at ? ` · cancels ${fmtDate(billing.cancel_at ?? billing.current_period_end)}` : ""}
                  {grace ? ` · grace ends ${fmtDateTime(grace)}` : ""}
                </>
              ) : (
                "none (Free)"
              )}
            </dd>
            {billing && (
              <>
                <dt>Period ends</dt>
                <dd>{fmtDateTime(billing.current_period_end)}</dd>
                <dt>Stripe customer</dt>
                <dd className={styles.mono}>{billing.stripe_customer_id}</dd>
                <dt>Updated</dt>
                <dd>{fmtDateTime(billing.updated_at)}</dd>
              </>
            )}
            <dt>Channels</dt>
            <dd>
              {num(channels.filter((c) => c.status !== "disconnected").length)} / {limits.socialAccounts}
            </dd>
            <dt>Posts</dt>
            <dd>
              {num(usage.postsScheduled)} / {limits.scheduledPostsPerMonth === null ? "unlimited" : limits.scheduledPostsPerMonth}
            </dd>
            <dt>Auto-DMs sent</dt>
            <dd>
              {num(usage.dmsSent)} / {dmLimit ? `${num(dmLimit.limit)}${dmLimit.bonus ? ` (incl. ${num(dmLimit.bonus)} referral bonus)` : ""}` : num(limits.autoDmsPerMonth)}
            </dd>
            <dt>AI requests</dt>
            <dd>
              {num(aiTotal)} / {AI_REQUESTS_PER_MONTH}
              {usage.ai.length > 0 && <span className={styles.muted}> · {usage.ai.map((r) => `${r.kind} ${r.n}`).join(", ")}</span>}
            </dd>
          </dl>
        </Panel>
      </div>

      <Panel title="Channels" subtitle={`${channels.length} total, including disconnected`} flush>
        <DataTable columns={channelCols} rows={channelRows} empty="No channels connected." />
      </Panel>

      <Panel title="Posts" subtitle="newest activity first, with each network's status and error" flush>
        <DataTable columns={postCols} rows={postRows} empty="No posts yet." />
        <Pager page={page} hasNext={posts.hasNext} shown={postRows.length} href={(p) => listHref(`/admin/users/${user.id}`, { page: p })} />
      </Panel>

      <Panel title="Admin actions on this user" subtitle="latest 10" actions={<Link href={listHref("/admin/audit", { target: user.email })}>Full audit log →</Link>}>
        {audit.length === 0 ? (
          <p className={styles.panelSub}>No admin actions recorded for this user.</p>
        ) : (
          <ul className={styles.att}>
            {audit.map((a) => (
              <li key={a.id}>
                <StatusPill tone="info">{a.action}</StatusPill>
                <span>
                  {a.admin_email === admin.email ? "you" : a.admin_email} · {fmtDateTime(a.created_at)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
