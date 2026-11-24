"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { INVITE_COOKIE } from "@/lib/inviteCookie";
import { acceptInvite } from "@/lib/team";
import { switchWorkspace } from "@/lib/workspace";

/** Accept a team invite as the signed-in person, then open that workspace. */
export async function acceptInviteAction(fd: FormData): Promise<void> {
  const token = typeof fd.get("token") === "string" ? String(fd.get("token")) : "";
  const user = await getCurrentUser();
  if (!user) redirect(`/invite/${encodeURIComponent(token)}`);
  const r = await acceptInvite(token, user);
  (await cookies()).delete(INVITE_COOKIE);
  if (!r.ok) redirect(`/invite/${encodeURIComponent(token)}?error=${encodeURIComponent(r.error)}`);
  await switchWorkspace(r.ownerId);
  redirect("/app?joined=1");
}
