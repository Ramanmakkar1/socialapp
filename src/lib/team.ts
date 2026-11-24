// Team workspaces (migration 054): members, invites, client workspaces and post approvals.
// Callers pass a WorkspaceContext from src/lib/workspace.ts; every query here is scoped to
// ctx.ownerId and re-checks the caller's role, so a request can never reach another workspace.
// Behaviour follows TryPost's approvals (github.com/trypostit/trypost, AGPL-3.0; reimplemented).
import { randomBytes } from "node:crypto";
import type { CurrentUser } from "@/lib/auth";
import { getPool, isDbConfigured, query } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { inBackground } from "@/lib/emailNotify";
import { absoluteUrl, approvalDecidedEmail, approvalRequestedEmail, teamInviteEmail } from "@/lib/emailTemplates";
import { hashToken, normalizeEmail } from "@/lib/password";
import { planFeatureGatingEnabled } from "@/lib/planFeatures";
import { planForUser, type PlanName } from "@/lib/planLimits";
import { roleAtLeast, workspaceLabel, type PublishMode, type WorkspaceContext } from "@/lib/workspace";

export type TeamRole = "admin" | "member";
export type TeamResult = { ok: true } | { ok: false; error: string };

/** Seats per plan (members besides the owner) and client workspaces an agency may create. */
export const TEAM_LIMITS: Record<PlanName, { members: number; clientWorkspaces: number }> = {
  Free: { members: 0, clientWorkspaces: 0 },
  Pro: { members: 2, clientWorkspaces: 0 },
  Agency: { members: 10, clientWorkspaces: 25 },
};

export const INVITE_TTL_DAYS = 7;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Team limits for a workspace owner. Same rollout as plan features: unenforced while gating is off. */
export async function teamLimitsFor(ownerId: string): Promise<{ plan: PlanName; members: number; clientWorkspaces: number; enforced: boolean }> {
  const plan = await planForUser(ownerId);
  if (!planFeatureGatingEnabled()) return { plan, ...TEAM_LIMITS.Agency, enforced: false };
  return { plan, ...TEAM_LIMITS[plan], enforced: true };
}

export function isRole(v: unknown): v is TeamRole {
  return v === "admin" || v === "member";
}
export function isPublishMode(v: unknown): v is PublishMode {
  return v === "direct" || v === "approval";
}

export type TeamMember = { userId: string; email: string; name: string | null; role: TeamRole; publishMode: PublishMode; createdAt: Date };
export type TeamInvite = { id: string; email: string; role: TeamRole; publishMode: PublishMode; expiresAt: Date; createdAt: Date };

export async function listTeam(ownerId: string): Promise<{ members: TeamMember[]; invites: TeamInvite[] }> {
  if (!isDbConfigured()) return { members: [], invites: [] };
  const [members, invites] = await Promise.all([
    query<{ user_id: string; email: string; name: string | null; role: TeamRole; publish_mode: PublishMode; created_at: Date }>(
      `select u.id as user_id, u.email, u.name, m.role, m.publish_mode, m.created_at
         from socialapp.workspace_members m join socialapp.users u on u.id = m.member_user_id
        where m.owner_user_id = $1 order by m.created_at`,
      [ownerId],
    ),
    query<{ id: string; email: string; role: TeamRole; publish_mode: PublishMode; expires_at: Date; created_at: Date }>(
      `select id, email, role, publish_mode, expires_at, created_at from socialapp.workspace_invites
        where owner_user_id = $1 and accepted_at is null and expires_at > now() order by created_at desc`,
      [ownerId],
    ),
  ]);
  return {
    members: members.map((m) => ({ userId: m.user_id, email: m.email, name: m.name, role: m.role, publishMode: m.publish_mode, createdAt: m.created_at })),
    invites: invites.map((i) => ({ id: i.id, email: i.email, role: i.role, publishMode: i.publish_mode, expiresAt: i.expires_at, createdAt: i.created_at })),
  };
}

function inviterName(ctx: WorkspaceContext): string {
  return ctx.user.name?.trim() || ctx.user.email.split("@")[0];
}
function workspaceName(ctx: WorkspaceContext): string {
  return workspaceLabel({ workspace_name: ctx.owner.workspaceName, name: ctx.owner.name, email: ctx.owner.email });
}

function sendInviteEmail(ctx: WorkspaceContext, email: string, role: TeamRole, mode: PublishMode, token: string): void {
  const mail = teamInviteEmail({
    inviter: inviterName(ctx),
    workspace: workspaceName(ctx),
    role,
    needsApproval: mode === "approval",
    acceptUrl: absoluteUrl(`/invite/${token}`),
  });
  inBackground("team_invite", () => sendEmail({ to: email, subject: mail.subject, html: mail.html, text: mail.text, tag: "team_invite" }));
}

/** Owner/admin invites `email`. Returns the raw token (used only for the e-mail link). */
export async function inviteMember(
  ctx: WorkspaceContext,
  rawEmail: string,
  role: TeamRole,
  mode: PublishMode,
): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  if (!roleAtLeast(ctx.role, "admin")) return { ok: false, error: "Only owners and admins can invite people." };
  if (!isRole(role) || !isPublishMode(mode)) return { ok: false, error: "Pick a role and how they publish." };
  const email = normalizeEmail(rawEmail ?? "");
  if (!EMAIL_RE.test(email) || email.length > 254) return { ok: false, error: "Enter a valid email address." };
  if (email === normalizeEmail(ctx.owner.email)) return { ok: false, error: "That's the workspace owner." };
  const limits = await teamLimitsFor(ctx.ownerId);
  if (limits.members <= 0) return { ok: false, error: `Team members are part of the Pro and Agency plans. Upgrade in Settings > Plan & billing.` };
  const [{ used }] = await query<{ used: number }>(
    `select (select count(*) from socialapp.workspace_members where owner_user_id=$1)
          + (select count(*) from socialapp.workspace_invites where owner_user_id=$1 and accepted_at is null and expires_at > now() and email <> $2) as used`,
    [ctx.ownerId, email],
  );
  if (Number(used) >= limits.members) {
    return { ok: false, error: `Your ${limits.plan} plan includes ${limits.members} team ${limits.members === 1 ? "seat" : "seats"}. Remove someone or upgrade for more.` };
  }
  const already = await query(
    `select 1 from socialapp.workspace_members m join socialapp.users u on u.id = m.member_user_id where m.owner_user_id=$1 and u.email=$2`,
    [ctx.ownerId, email],
  );
  if (already.length) return { ok: false, error: "They're already on your team." };
  const token = randomBytes(24).toString("base64url");
  // One open invite per address: a new invite replaces the old one (and its link).
  await query("delete from socialapp.workspace_invites where owner_user_id=$1 and email=$2 and accepted_at is null", [ctx.ownerId, email]);
  await query(
    `insert into socialapp.workspace_invites (owner_user_id, invited_by_user_id, email, role, publish_mode, token_hash, expires_at)
     values ($1, $2, $3, $4, $5, $6, now() + ($7 || ' days')::interval)`,
    [ctx.ownerId, ctx.user.id, email, role, mode, hashToken(token), String(INVITE_TTL_DAYS)],
  );
  sendInviteEmail(ctx, email, role, mode, token);
  return { ok: true, token };
}

/** Re-sends an open invite with a fresh link (the old link stops working). */
export async function resendInvite(ctx: WorkspaceContext, inviteId: string): Promise<{ ok: true; token: string } | { ok: false; error: string }> {
  if (!roleAtLeast(ctx.role, "admin")) return { ok: false, error: "Only owners and admins can manage invites." };
  if (!UUID_RE.test(inviteId)) return { ok: false, error: "Invite not found." };
  const token = randomBytes(24).toString("base64url");
  const rows = await query<{ email: string; role: TeamRole; publish_mode: PublishMode }>(
    `update socialapp.workspace_invites set token_hash=$3, expires_at=now() + ($4 || ' days')::interval
      where id=$1 and owner_user_id=$2 and accepted_at is null returning email, role, publish_mode`,
    [inviteId, ctx.ownerId, hashToken(token), String(INVITE_TTL_DAYS)],
  );
  if (!rows[0]) return { ok: false, error: "Invite not found." };
  sendInviteEmail(ctx, rows[0].email, rows[0].role, rows[0].publish_mode, token);
  return { ok: true, token };
}

export async function revokeInvite(ctx: WorkspaceContext, inviteId: string): Promise<TeamResult> {
  if (!roleAtLeast(ctx.role, "admin")) return { ok: false, error: "Only owners and admins can manage invites." };
  if (!UUID_RE.test(inviteId)) return { ok: false, error: "Invite not found." };
  await query("delete from socialapp.workspace_invites where id=$1 and owner_user_id=$2 and accepted_at is null", [inviteId, ctx.ownerId]);
  return { ok: true };
}

export type InvitePreview = { ok: true; inviteId: string; ownerId: string; workspace: string; email: string; role: TeamRole; publishMode: PublishMode } | { ok: false; error: string };

/** Looks up an open invite by its raw token (for the accept page). */
export async function previewInvite(token: string): Promise<InvitePreview> {
  if (!token || token.length > 100 || !isDbConfigured()) return { ok: false, error: "This invite link isn't valid." };
  const rows = await query<{ id: string; owner_user_id: string; email: string; role: TeamRole; publish_mode: PublishMode; expired: boolean; accepted: boolean; workspace_name: string | null; name: string | null; owner_email: string }>(
    `select i.id, i.owner_user_id, i.email, i.role, i.publish_mode, i.expires_at <= now() as expired, i.accepted_at is not null as accepted,
            u.workspace_name, u.name, u.email as owner_email
       from socialapp.workspace_invites i join socialapp.users u on u.id = i.owner_user_id where i.token_hash=$1`,
    [hashToken(token)],
  );
  const r = rows[0];
  if (!r) return { ok: false, error: "This invite link isn't valid. Ask for a new one." };
  if (r.accepted) return { ok: false, error: "This invite was already accepted." };
  if (r.expired) return { ok: false, error: "This invite has expired. Ask for a new one." };
  return { ok: true, inviteId: r.id, ownerId: r.owner_user_id, workspace: workspaceLabel({ workspace_name: r.workspace_name, name: r.name, email: r.owner_email }), email: r.email, role: r.role, publishMode: r.publish_mode };
}

/** The signed-in `user` accepts the invite. The invite must have been sent to their email. */
export async function acceptInvite(token: string, user: CurrentUser): Promise<{ ok: true; ownerId: string } | { ok: false; error: string }> {
  const inv = await previewInvite(token);
  if (!inv.ok) return inv;
  if (normalizeEmail(user.email) !== normalizeEmail(inv.email)) {
    return { ok: false, error: `This invite was sent to ${inv.email}. Log in with that email to accept it.` };
  }
  if (inv.ownerId === user.id) return { ok: false, error: "You already own this workspace." };
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const claimed = await client.query(
      "update socialapp.workspace_invites set accepted_at=now() where id=$1 and accepted_at is null and expires_at > now() returning id",
      [inv.inviteId],
    );
    if (!claimed.rowCount) {
      await client.query("rollback");
      return { ok: false, error: "This invite was already used." };
    }
    await client.query(
      `insert into socialapp.workspace_members (owner_user_id, member_user_id, role, publish_mode) values ($1, $2, $3, $4)
       on conflict (owner_user_id, member_user_id) do update set role = excluded.role, publish_mode = excluded.publish_mode`,
      [inv.ownerId, user.id, inv.role, inv.publishMode],
    );
    await client.query("commit");
  } catch (err) {
    await client.query("rollback").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
  return { ok: true, ownerId: inv.ownerId };
}

export async function updateMember(ctx: WorkspaceContext, memberId: string, role: TeamRole, mode: PublishMode): Promise<TeamResult> {
  if (!roleAtLeast(ctx.role, "admin")) return { ok: false, error: "Only owners and admins can change roles." };
  if (!UUID_RE.test(memberId) || !isRole(role) || !isPublishMode(mode)) return { ok: false, error: "Invalid change." };
  const rows = await query(
    "update socialapp.workspace_members set role=$3, publish_mode=$4 where owner_user_id=$1 and member_user_id=$2 returning 1",
    [ctx.ownerId, memberId, role, role === "admin" ? "direct" : mode],
  );
  return rows.length ? { ok: true } : { ok: false, error: "Member not found." };
}

/** Owner/admin removes a member, or a member leaves (memberId = themselves). The owner can't be removed. */
export async function removeMember(ctx: WorkspaceContext, memberId: string): Promise<TeamResult> {
  if (!UUID_RE.test(memberId)) return { ok: false, error: "Member not found." };
  if (memberId === ctx.ownerId) return { ok: false, error: "The owner can't be removed." };
  const self = memberId === ctx.user.id;
  if (!self && !roleAtLeast(ctx.role, "admin")) return { ok: false, error: "Only owners and admins can remove people." };
  await query("delete from socialapp.workspace_members where owner_user_id=$1 and member_user_id=$2", [ctx.ownerId, memberId]);
  // Their pending approval requests go back to drafts (the owner keeps the content).
  await query(
    "update socialapp.scheduled_posts set status='draft', approval_note='Requester left the team' where user_id=$1 and requested_by_user_id=$2 and status='pending_approval'",
    [ctx.ownerId, memberId],
  );
  return { ok: true };
}

/** Agency plan: a new login-less workspace owned by `creator` (their plan pays for it). */
export async function createClientWorkspace(creator: CurrentUser, rawName: string): Promise<{ ok: true; ownerId: string } | { ok: false; error: string }> {
  const name = (rawName ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
  if (name.length < 2) return { ok: false, error: "Give the workspace a name (e.g. the client's brand)." };
  const limits = await teamLimitsFor(creator.id);
  if (limits.clientWorkspaces <= 0) return { ok: false, error: "Client workspaces are part of the Agency plan. Upgrade in Settings > Plan & billing." };
  const [{ n }] = await query<{ n: number }>("select count(*)::int as n from socialapp.users where created_by_user_id=$1", [creator.id]);
  if (n >= limits.clientWorkspaces) return { ok: false, error: `Your plan includes ${limits.clientWorkspaces} client workspaces.` };
  // A synthetic, undeliverable address keeps users.email unique and makes the row impossible to log in to
  // (no password, no Google account).
  const email = `client-${randomBytes(9).toString("hex")}@workspaces.poskoo.invalid`;
  const rows = await query<{ id: string }>(
    "insert into socialapp.users (email, name, workspace_name, created_by_user_id) values ($1, $2, $2, $3) returning id",
    [email, name, creator.id],
  );
  return { ok: true, ownerId: rows[0].id };
}

export async function renameWorkspace(ctx: WorkspaceContext, rawName: string): Promise<TeamResult> {
  if (ctx.role !== "owner") return { ok: false, error: "Only the owner can rename the workspace." };
  const name = (rawName ?? "").trim().replace(/\s+/g, " ").slice(0, 60);
  await query("update socialapp.users set workspace_name=$2 where id=$1", [ctx.ownerId, name || null]);
  return { ok: true };
}

// ---- Approvals ---------------------------------------------------------------------------------

/** Error for a schedule-changing action by a member whose posts need approval, else null. */
export function approvalBlock(ctx: WorkspaceContext): string | null {
  return ctx.needsApproval
    ? "Your posts need approval in this workspace. Save the post and choose Send for approval; an owner or admin schedules it."
    : null;
}

export type PendingPost = { id: string; caption: string; scheduledAt: Date | null; requestedMode: "schedule" | "queue" | null; requestedBy: string | null; requestedByEmail: string | null; platforms: string[]; updatedAt: Date };

export async function listPendingApprovals(ownerId: string): Promise<PendingPost[]> {
  if (!isDbConfigured()) return [];
  const rows = await query<{ id: string; caption: string; scheduled_at: Date | null; requested_mode: "schedule" | "queue" | null; requested_by_user_id: string | null; email: string | null; platforms: string[] | null; updated_at: Date }>(
    `select p.id, p.caption, p.scheduled_at, p.requested_mode, p.requested_by_user_id, u.email,
            (select array_agg(distinct t.platform) from socialapp.post_targets t where t.post_id = p.id) as platforms, p.updated_at
       from socialapp.scheduled_posts p left join socialapp.users u on u.id = p.requested_by_user_id
      where p.user_id = $1 and p.status = 'pending_approval' order by p.scheduled_at nulls last, p.updated_at`,
    [ownerId],
  ).catch(() => []);
  return rows.map((r) => ({ id: r.id, caption: r.caption, scheduledAt: r.scheduled_at, requestedMode: r.requested_mode, requestedBy: r.requested_by_user_id, requestedByEmail: r.email, platforms: r.platforms ?? [], updatedAt: r.updated_at }));
}

export async function countPendingApprovals(ownerId: string): Promise<number> {
  if (!isDbConfigured()) return 0;
  const rows = await query<{ n: number }>("select count(*)::int as n from socialapp.scheduled_posts where user_id=$1 and status='pending_approval'", [ownerId]).catch(() => [{ n: 0 }]);
  return rows[0]?.n ?? 0;
}

async function notifyDecision(ctx: WorkspaceContext, postId: string, approved: boolean, note: string | null): Promise<void> {
  const rows = await query<{ email: string; name: string | null; caption: string }>(
    `select u.email, u.name, p.caption from socialapp.scheduled_posts p join socialapp.users u on u.id = p.requested_by_user_id where p.id=$1 and p.user_id=$2`,
    [postId, ctx.ownerId],
  );
  const r = rows[0];
  if (!r || r.email === ctx.user.email) return;
  const mail = approvalDecidedEmail({ name: r.name, approved, reviewer: inviterName(ctx), workspace: workspaceName(ctx), caption: r.caption, note });
  await sendEmail({ to: r.email, subject: mail.subject, html: mail.html, text: mail.text, tag: approved ? "approval_approved" : "approval_rejected" });
}

/** E-mails the owner and admins (except the requester) that a post is waiting. Fire-and-forget. */
export function notifyApprovalRequested(ctx: WorkspaceContext, postId: string): void {
  inBackground("approval_requested", async () => {
    const [post] = await query<{ caption: string; scheduled_at: Date | null }>(
      "select caption, scheduled_at from socialapp.scheduled_posts where id=$1 and user_id=$2",
      [postId, ctx.ownerId],
    );
    if (!post) return;
    const recipients = await query<{ email: string; name: string | null }>(
      `select email, name from socialapp.users where id=$1 and email not like '%@workspaces.poskoo.invalid'
       union select u.email, u.name from socialapp.workspace_members m join socialapp.users u on u.id = m.member_user_id
        where m.owner_user_id=$1 and m.role='admin' and u.id <> $2`,
      [ctx.ownerId, ctx.user.id],
    );
    for (const r of recipients) {
      const mail = approvalRequestedEmail({ name: r.name, requester: inviterName(ctx), workspace: workspaceName(ctx), caption: post.caption, scheduledFor: post.scheduled_at });
      await sendEmail({ to: r.email, subject: mail.subject, html: mail.html, text: mail.text, tag: "approval_requested" });
    }
  });
}

/**
 * Owner/admin approves a pending post: it becomes 'scheduled' at its requested time (or `newTime`).
 * A requested time in the past (or under a minute away) needs a new time: error code "time_passed".
 */
export async function approvePost(ctx: WorkspaceContext, postId: string, newTime?: Date | null): Promise<TeamResult & { code?: "time_passed" }> {
  if (!roleAtLeast(ctx.role, "admin")) return { ok: false, error: "Only owners and admins can approve posts." };
  if (!UUID_RE.test(postId)) return { ok: false, error: "Post not found." };
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const locked = await client.query<{ scheduled_at: Date | null }>(
      "select scheduled_at from socialapp.scheduled_posts where id=$1 and user_id=$2 and status='pending_approval' for update",
      [postId, ctx.ownerId],
    );
    if (!locked.rows[0]) {
      await client.query("rollback");
      return { ok: false, error: "This post isn't waiting for approval any more." };
    }
    const when = newTime ?? (locked.rows[0].scheduled_at ? new Date(locked.rows[0].scheduled_at) : null);
    if (!when || Number.isNaN(when.getTime()) || when.getTime() < Date.now() + 60_000) {
      await client.query("rollback");
      return { ok: false, code: "time_passed", error: "The requested time has passed. Pick a new time to approve it." };
    }
    await client.query(
      `update socialapp.scheduled_posts set status='scheduled', scheduled_at=$3, reviewed_by_user_id=$4, reviewed_at=now(), approval_note=null, updated_at=now()
        where id=$1 and user_id=$2`,
      [postId, ctx.ownerId, when, ctx.user.id],
    );
    await client.query("commit");
  } catch (err) {
    await client.query("rollback").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
  inBackground("approval_approved", () => notifyDecision(ctx, postId, true, null));
  return { ok: true };
}

/** Owner/admin sends a pending post back to drafts with an optional note. */
export async function rejectPost(ctx: WorkspaceContext, postId: string, rawNote?: string | null): Promise<TeamResult> {
  if (!roleAtLeast(ctx.role, "admin")) return { ok: false, error: "Only owners and admins can reject posts." };
  if (!UUID_RE.test(postId)) return { ok: false, error: "Post not found." };
  const note = (rawNote ?? "").trim().slice(0, 500) || null;
  const rows = await query(
    `update socialapp.scheduled_posts set status='draft', approval_note=$3, reviewed_by_user_id=$4, reviewed_at=now(), updated_at=now()
      where id=$1 and user_id=$2 and status='pending_approval' returning 1`,
    [postId, ctx.ownerId, note, ctx.user.id],
  );
  if (!rows.length) return { ok: false, error: "This post isn't waiting for approval any more." };
  inBackground("approval_rejected", () => notifyDecision(ctx, postId, false, note));
  return { ok: true };
}

/** The requester (or an owner/admin) withdraws a pending request: back to draft. */
export async function withdrawApproval(ctx: WorkspaceContext, postId: string): Promise<TeamResult> {
  if (!UUID_RE.test(postId)) return { ok: false, error: "Post not found." };
  const rows = await query(
    `update socialapp.scheduled_posts set status='draft', updated_at=now()
      where id=$1 and user_id=$2 and status='pending_approval' and (requested_by_user_id=$3 or $4) returning 1`,
    [postId, ctx.ownerId, ctx.user.id, roleAtLeast(ctx.role, "admin")],
  );
  return rows.length ? { ok: true } : { ok: false, error: "This post isn't waiting for approval any more." };
}
