"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { INSTAGRAM_TAKEN_PATH, PICK_COOKIE, decodePick, isInstagramTakenByOther, saveFacebookLoginAccount } from "@/lib/metaAccounts";
import { MetaApiError, fetchPagesWithInstagram } from "@/lib/metaLogin";
import { accountLimitError } from "@/lib/planLimits";
import { requireWorkspaceUser } from "@/lib/workspace";

// Connects the Instagram account the user picked (re-reads the Page list with the stored user token,
// so the Page token never passes through the browser).
export async function connectPickedAccountAction(formData: FormData): Promise<void> {
  const user = await requireWorkspaceUser("admin");
  const raw = formData.get("ig_user_id");
  const igUserId = typeof raw === "string" ? raw.trim().slice(0, 64) : "";
  const store = await cookies();
  const pick = decodePick(store.get(PICK_COOKIE)?.value, user.id);
  if (!pick) redirect("/app/settings?ig=pick_expired");
  let result: "connected" | "connected_no_webhooks" | "error" | "expired_code" | "limit" | "taken" = "error";
  try {
    const pages = await fetchPagesWithInstagram(pick.userToken);
    const page = pages.find((p) => p.igUserId === igUserId);
    if (page && (await isInstagramTakenByOther(user.id, page.igUserId))) {
      result = "taken";
    } else if (page && (await accountLimitError(user.id, { kind: "social", platform: "instagram", externalId: page.igUserId }))) {
      result = "limit";
    } else if (page) {
      const saved = await saveFacebookLoginAccount(user.id, page, pick.scopes, pick.metaUserId);
      result = saved.taken ? "taken" : saved.subscribed ? "connected" : "connected_no_webhooks";
    }
  } catch (err) {
    result = err instanceof MetaApiError && err.tokenInvalid ? "expired_code" : "error";
  }
  store.delete(PICK_COOKIE);
  // Owned by another Poskoo user: the Connect dialog's "already connected to another Poskoo account" message.
  if (result === "taken") redirect(INSTAGRAM_TAKEN_PATH);
  redirect(`/app/settings?ig=${result}`);
}
