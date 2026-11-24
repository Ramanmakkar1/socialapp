"use server";

// Workspace switcher + client workspaces (migration 054). switchWorkspace() re-checks membership.
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClientWorkspace } from "@/lib/team";
import { requireWorkspace, switchWorkspace } from "@/lib/workspace";

export async function switchWorkspaceAction(fd: FormData): Promise<void> {
  const ownerId = typeof fd.get("ownerId") === "string" ? String(fd.get("ownerId")) : "";
  await requireWorkspace();
  const ok = await switchWorkspace(ownerId);
  revalidatePath("/app", "layout");
  redirect(ok ? "/app" : "/app?denied=1");
}

/** Agency plan: create a client workspace owned by the signed-in person and open it. */
export async function createClientWorkspaceAction(fd: FormData): Promise<void> {
  const ctx = await requireWorkspace();
  const r = await createClientWorkspace(ctx.user, typeof fd.get("name") === "string" ? String(fd.get("name")) : "");
  if (!r.ok) redirect(`/app?workspace_error=${encodeURIComponent(r.error)}`);
  await switchWorkspace(r.ownerId);
  revalidatePath("/app", "layout");
  redirect("/app?workspace=created");
}
