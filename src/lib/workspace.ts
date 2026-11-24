// Team workspaces (migration 054). A workspace is an OWNER user's data: every table stays keyed by
// user_id = the owner. A signed-in user acts inside one workspace at a time:
//   - their own account (role "owner"),
//   - a workspace they were invited to (workspace_members: role "admin" | "member"),
//   - a client workspace they created on the Agency plan (users.created_by_user_id = them; role "owner").
// The chosen workspace is stored on the session (sessions.active_owner_user_id) but membership is
// RE-CHECKED from the database on every request: a revoked member falls back to their own account.
//
// Use requireWorkspaceUser() wherever a page/action reads or writes workspace DATA: it returns a
// CurrentUser whose id is the workspace owner's id, so existing `user.id` queries scope correctly.
// Keep requireUser() (the real person) for personal things: password, e-mail, sessions, their own API
// keys, referrals, deleting their account.
import { cache } from "react";
import { redirect } from "next/navigation";
import { currentSessionId, getCurrentUser, type CurrentUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";

export type WorkspaceRole = "owner" | "admin" | "member";
export type PublishMode = "direct" | "approval";

export type WorkspaceSummary = {
  ownerId: string;
  name: string;
  role: WorkspaceRole;
  /** A client workspace created by an agency user (no login of its own). */
  isClient: boolean;
};

export type WorkspaceContext = {
  /** The real signed-in person. */
  user: CurrentUser;
  /** Whose data the session acts on. */
  ownerId: string;
  owner: { id: string; email: string; name: string | null; workspaceName: string | null };
  role: WorkspaceRole;
  publishMode: PublishMode;
  /** Scheduling / queueing / publishing by this person waits for an owner/admin's approval. */
  needsApproval: boolean;
  isOwnWorkspace: boolean;
  isClient: boolean;
};

const ROLE_RANK: Record<WorkspaceRole, number> = { member: 0, admin: 1, owner: 2 };

/** True when `role` is at least `min` (owner > admin > member). */
export function roleAtLeast(role: WorkspaceRole, min: WorkspaceRole): boolean {
  return ROLE_RANK[role] >= ROLE_RANK[min];
}

/** Display name for a workspace owner row. */
export function workspaceLabel(o: { workspace_name?: string | null; name?: string | null; email?: string | null }): string {
  return (o.workspace_name || o.name || (o.email ? o.email.split("@")[0] : "") || "Workspace").trim();
}

type Membership = { role: WorkspaceRole; publishMode: PublishMode; isClient: boolean };

/**
 * The user's role in `ownerId`'s workspace, or null when they have none. Pure DB check, used on every
 * request and before every switch.
 */
export async function membershipFor(userId: string, ownerId: string): Promise<Membership | null> {
  if (userId === ownerId) return { role: "owner", publishMode: "direct", isClient: false };
  const member = await query<{ role: "admin" | "member"; publish_mode: PublishMode }>(
    "select role, publish_mode from socialapp.workspace_members where owner_user_id=$1 and member_user_id=$2",
    [ownerId, userId],
  );
  if (member[0]) return { role: member[0].role, publishMode: member[0].publish_mode, isClient: false };
  const client = await query<{ id: string }>(
    "select id from socialapp.users where id=$1 and created_by_user_id=$2",
    [ownerId, userId],
  );
  if (client[0]) return { role: "owner", publishMode: "direct", isClient: true };
  return null;
}

async function loadContext(): Promise<WorkspaceContext | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  let ownerId = user.id;
  let m: Membership = { role: "owner", publishMode: "direct", isClient: false };
  if (isDbConfigured()) {
    try {
      const sid = await currentSessionId();
      const rows = sid
        ? await query<{ active_owner_user_id: string | null }>("select active_owner_user_id from socialapp.sessions where id=$1", [sid])
        : [];
      const active = rows[0]?.active_owner_user_id ?? null;
      if (active && active !== user.id) {
        const found = await membershipFor(user.id, active);
        if (found) {
          ownerId = active;
          m = found;
        }
      }
    } catch (err) {
      // Before migration 054 (no active_owner_user_id / workspace tables): everyone is in their own account.
      const code = (err as { code?: unknown })?.code;
      if (code !== "42703" && code !== "42P01") console.error("workspace: context failed", err instanceof Error ? err.message : err);
    }
  }
  let owner: WorkspaceContext["owner"] = { id: user.id, email: user.email, name: user.name, workspaceName: null };
  if (ownerId !== user.id) {
    const o = await query<{ id: string; email: string; name: string | null; workspace_name: string | null }>(
      "select id, email, name, workspace_name from socialapp.users where id=$1",
      [ownerId],
    ).catch(() => []);
    if (o[0]) owner = { id: o[0].id, email: o[0].email, name: o[0].name, workspaceName: o[0].workspace_name };
  } else {
    const o = await query<{ workspace_name: string | null }>("select workspace_name from socialapp.users where id=$1", [user.id]).catch(() => []);
    owner.workspaceName = o[0]?.workspace_name ?? null;
  }
  return {
    user,
    ownerId,
    owner,
    role: m.role,
    publishMode: m.publishMode,
    needsApproval: m.role === "member" && m.publishMode === "approval",
    isOwnWorkspace: ownerId === user.id,
    isClient: m.isClient,
  };
}

/** The current workspace context (memoised per request), or null for guests. Never throws. */
export const getWorkspaceContext = cache(async (): Promise<WorkspaceContext | null> => {
  try {
    return await loadContext();
  } catch {
    return null;
  }
});

/** Workspace context for pages/actions; guests go to /login, too-low roles go back to /app. */
export async function requireWorkspace(min: WorkspaceRole = "member"): Promise<WorkspaceContext> {
  const ctx = await getWorkspaceContext();
  if (!ctx) redirect("/login");
  if (!roleAtLeast(ctx.role, min)) redirect("/app?denied=1");
  return ctx;
}

/**
 * Drop-in for requireUser() on DATA paths: a CurrentUser whose id/email/name are the workspace
 * OWNER's, so `user.id` queries stay inside the workspace. emailVerified is the real person's.
 */
export async function requireWorkspaceUser(min: WorkspaceRole = "member"): Promise<CurrentUser> {
  const ctx = await requireWorkspace(min);
  return asOwnerUser(ctx);
}

/** Same as requireWorkspaceUser() but returns null for guests (no redirect). */
export async function getWorkspaceUser(): Promise<CurrentUser | null> {
  const ctx = await getWorkspaceContext();
  return ctx ? asOwnerUser(ctx) : null;
}

/** For API routes: the owner-scoped user when signed in with at least `min`, else null (no redirect). */
export async function getWorkspaceUserAtLeast(min: WorkspaceRole): Promise<CurrentUser | null> {
  const ctx = await getWorkspaceContext();
  return ctx && roleAtLeast(ctx.role, min) ? asOwnerUser(ctx) : null;
}

/**
 * Billing is always the real person's own subscription and only opens inside their own workspace
 * (members of other workspaces never see the owner's billing). Elsewhere: back to /app with a hint.
 */
export async function requireOwnWorkspaceUser(): Promise<CurrentUser> {
  const ctx = await requireWorkspace("member");
  if (!ctx.isOwnWorkspace) redirect("/app?billing=own");
  return ctx.user;
}

/** API-route variant of requireOwnWorkspaceUser(): null unless signed in AND in their own workspace. */
export async function getOwnWorkspaceUser(): Promise<CurrentUser | null> {
  const ctx = await getWorkspaceContext();
  return ctx && ctx.isOwnWorkspace ? ctx.user : null;
}

export function asOwnerUser(ctx: WorkspaceContext): CurrentUser {
  return { id: ctx.ownerId, email: ctx.owner.email, name: ctx.owner.name, emailVerified: ctx.user.emailVerified };
}

/** Every workspace this person can switch to: their own, invited ones, and client workspaces they made. */
export async function listWorkspaces(user: CurrentUser): Promise<WorkspaceSummary[]> {
  const own: WorkspaceSummary = { ownerId: user.id, name: "My workspace", role: "owner", isClient: false };
  if (!isDbConfigured()) return [own];
  try {
    const me = await query<{ workspace_name: string | null; name: string | null; email: string }>(
      "select workspace_name, name, email from socialapp.users where id=$1",
      [user.id],
    );
    if (me[0]) own.name = workspaceLabel(me[0]);
    const rows = await query<{ owner_id: string; role: WorkspaceRole; is_client: boolean; workspace_name: string | null; name: string | null; email: string }>(
      `select u.id as owner_id, m.role, false as is_client, u.workspace_name, u.name, u.email
         from socialapp.workspace_members m join socialapp.users u on u.id = m.owner_user_id
        where m.member_user_id = $1
       union all
       select u.id, 'owner', true, u.workspace_name, u.name, u.email
         from socialapp.users u where u.created_by_user_id = $1
       order by 4 nulls last, 5`,
      [user.id],
    );
    return [own, ...rows.map((r) => ({ ownerId: r.owner_id, name: workspaceLabel(r), role: r.role, isClient: r.is_client }))];
  } catch {
    return [own];
  }
}

/** Point the current session at `ownerId` after a membership check. Returns false when not allowed. */
export async function switchWorkspace(ownerId: string): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;
  if (!/^[0-9a-f-]{36}$/i.test(ownerId)) return false;
  if (!(await membershipFor(user.id, ownerId))) return false;
  const sid = await currentSessionId();
  if (!sid) return false;
  await query("update socialapp.sessions set active_owner_user_id=$2 where id=$1 and user_id=$3", [
    sid,
    ownerId === user.id ? null : ownerId,
    user.id,
  ]);
  return true;
}
