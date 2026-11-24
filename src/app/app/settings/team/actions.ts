"use server";

// Settings → Team (migration 054). Each action re-reads the workspace context; src/lib/team.ts
// re-checks the role for every change, so a hand-crafted form post can't skip the UI's gating.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDbConfigured } from "@/lib/db";
import { inviteMember, isPublishMode, isRole, removeMember, renameWorkspace, resendInvite, revokeInvite, updateMember } from "@/lib/team";
import { requireWorkspace, switchWorkspace } from "@/lib/workspace";

const PAGE = "/app/settings/team";

function back(params: Record<string, string>): never {
  revalidatePath(PAGE);
  redirect(`${PAGE}?${new URLSearchParams(params).toString()}`);
}

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

export async function inviteAction(fd: FormData): Promise<void> {
  if (!isDbConfigured()) back({ error: "Database not configured." });
  const ctx = await requireWorkspace("admin");
  const role = str(fd, "role");
  const mode = str(fd, "publishMode");
  const r = await inviteMember(ctx, str(fd, "email"), isRole(role) ? role : "member", isPublishMode(mode) ? mode : "direct");
  if (!r.ok) back({ error: r.error });
  back({ done: "invited" });
}

export async function resendInviteAction(fd: FormData): Promise<void> {
  const ctx = await requireWorkspace("admin");
  const r = await resendInvite(ctx, str(fd, "inviteId"));
  back(r.ok ? { done: "resent" } : { error: r.error });
}

export async function revokeInviteAction(fd: FormData): Promise<void> {
  const ctx = await requireWorkspace("admin");
  const r = await revokeInvite(ctx, str(fd, "inviteId"));
  back(r.ok ? { done: "revoked" } : { error: r.error });
}

export async function updateMemberAction(fd: FormData): Promise<void> {
  const ctx = await requireWorkspace("admin");
  const role = str(fd, "role");
  const mode = str(fd, "publishMode");
  if (!isRole(role) || !isPublishMode(mode)) back({ error: "Invalid change." });
  const r = await updateMember(ctx, str(fd, "memberId"), role as "admin" | "member", mode as "direct" | "approval");
  back(r.ok ? { done: "updated" } : { error: r.error });
}

export async function removeMemberAction(fd: FormData): Promise<void> {
  const ctx = await requireWorkspace("admin");
  const r = await removeMember(ctx, str(fd, "memberId"));
  back(r.ok ? { done: "removed" } : { error: r.error });
}

export async function renameWorkspaceAction(fd: FormData): Promise<void> {
  const ctx = await requireWorkspace("owner");
  const r = await renameWorkspace(ctx, str(fd, "name"));
  revalidatePath("/app", "layout");
  back(r.ok ? { done: "renamed" } : { error: r.error });
}

/** A member or admin leaves the workspace they are in, then lands back in their own account. */
export async function leaveWorkspaceAction(): Promise<void> {
  const ctx = await requireWorkspace();
  if (ctx.isOwnWorkspace || ctx.isClient) back({ error: "You own this workspace, so you can't leave it." });
  const r = await removeMember(ctx, ctx.user.id);
  if (!r.ok) back({ error: r.error });
  await switchWorkspace(ctx.user.id);
  revalidatePath("/app", "layout");
  redirect("/app");
}
