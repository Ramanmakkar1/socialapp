"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { PICK_COOKIE, decodePick, saveFacebookLoginAccount } from "@/lib/metaAccounts";
import { MetaApiError, fetchPagesWithInstagram } from "@/lib/metaLogin";

// Connects the Instagram account the user picked (re-reads the Page list with the stored user token,
// so the Page token never passes through the browser).
export async function connectPickedAccountAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const raw = formData.get("ig_user_id");
  const igUserId = typeof raw === "string" ? raw.trim().slice(0, 64) : "";
  const store = await cookies();
  const pick = decodePick(store.get(PICK_COOKIE)?.value, user.id);
  if (!pick) redirect("/app/settings?ig=pick_expired");
  let result: "connected" | "connected_no_webhooks" | "error" | "expired_code" = "error";
  try {
    const pages = await fetchPagesWithInstagram(pick.userToken);
    const page = pages.find((p) => p.igUserId === igUserId);
    if (page) {
      const { subscribed } = await saveFacebookLoginAccount(user.id, page, pick.scopes, pick.metaUserId);
      result = subscribed ? "connected" : "connected_no_webhooks";
    }
  } catch (err) {
    result = err instanceof MetaApiError && err.tokenInvalid ? "expired_code" : "error";
  }
  store.delete(PICK_COOKIE);
  redirect(`/app/settings?ig=${result}`);
}
