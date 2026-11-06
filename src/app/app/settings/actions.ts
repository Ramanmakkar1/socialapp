"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { disconnectAccounts } from "@/lib/accountData";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";

// Disconnect: wipes the stored Instagram token right away (history and rules stay).
export async function disconnectAccountAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const raw = formData.get("account_id");
  const accountId = typeof raw === "string" ? raw.trim().slice(0, 64) : "";
  if (!isDbConfigured() || !accountId) return;
  try {
    const owned = await query<{ id: string }>(
      "select id from socialapp.social_accounts where id::text=$1 and user_id=$2",
      [accountId, user.id]
    );
    if (owned.length === 0) return;
    await disconnectAccounts([owned[0].id]);
  } catch (err) {
    console.error("disconnectAccountAction failed for account", accountId, err instanceof Error ? err.message : err);
    redirect("/app/settings?ig=disconnect_error");
  }
  revalidatePath("/app/settings");
  redirect("/app/settings?ig=disconnected");
}

export async function saveBrandVoice(formData: FormData): Promise<void> {
  const user = await requireUser();
  const raw = formData.get("brand_voice");
  const trimmed = typeof raw === "string" ? raw.trim().slice(0, 500) : "";
  const value = trimmed === "" ? null : trimmed;
  if (!isDbConfigured()) return;
  try {
    await query("update socialapp.users set brand_voice=$2 where id=$1", [user.id, value]);
  } catch (err) {
    console.error("saveBrandVoice failed for user", user.id, err instanceof Error ? err.message : err);
    redirect("/app/settings?voice=error");
  }
  revalidatePath("/app/settings");
  redirect("/app/settings?voice=saved");
}
