"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteAccountData, disconnectAccounts } from "@/lib/accountData";
import { endSession, requireUser } from "@/lib/auth";
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

export async function saveAiReplySettings(formData: FormData): Promise<void> {
  const user = await requireUser();
  const rawId = formData.get("account_id");
  const accountId = typeof rawId === "string" ? rawId.trim().slice(0, 64) : "";
  const enabled = formData.get("ai_reply_enabled") === "on";
  const rawInstructions = formData.get("ai_reply_instructions");
  const instructions = typeof rawInstructions === "string" ? rawInstructions.trim().slice(0, 1500) : "";
  const rawLink = formData.get("ai_booking_link");
  const link = typeof rawLink === "string" ? rawLink.trim() : "";
  if (!isDbConfigured() || !accountId) return;
  if (link !== "") {
    let valid = false;
    try {
      valid = new URL(link).protocol === "https:";
    } catch {
      valid = false;
    }
    if (!valid) redirect("/app/settings?ai_reply=error");
  }
  try {
    await query(
      "update socialapp.social_accounts set ai_reply_enabled=$3, ai_reply_instructions=$4, ai_booking_link=$5 where id=$2 and user_id=$1 and platform='instagram'",
      [user.id, accountId, enabled, instructions === "" ? null : instructions, link === "" ? null : link]
    );
  } catch (err) {
    console.error("saveAiReplySettings failed for account", accountId, err instanceof Error ? err.message : err);
    redirect("/app/settings?ai_reply=error");
  }
  revalidatePath("/app/settings");
  redirect("/app/settings?ai_reply=saved");
}

// Self-serve account deletion: wipes every table row that belongs to the user, then the user row itself
// (sessions, dm_rules, contacts, scheduled_posts, dm_queue and short_links cascade off it).
export async function deleteMyAccountAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  if (formData.get("confirm") !== "DELETE") redirect("/app/settings?account=confirm_needed#danger-heading");
  if (!isDbConfigured()) redirect("/app/settings?account=delete_error#danger-heading");
  const reviewer = process.env.REVIEWER_EMAIL;
  if (reviewer && reviewer.trim().toLowerCase() === user.email.trim().toLowerCase()) {
    redirect("/app/settings?account=reviewer_locked#danger-heading");
  }
  try {
    const accs = await query<{ id: string }>("select id from socialapp.social_accounts where user_id=$1", [user.id]);
    await deleteAccountData(accs.map((a) => a.id));
    await query("delete from socialapp.events where user_id=$1", [user.id]);
    await query("delete from socialapp.users where id=$1", [user.id]);
  } catch (err) {
    console.error("deleteMyAccountAction failed", err instanceof Error ? err.message : err);
    redirect("/app/settings?account=delete_error#danger-heading");
  }
  try {
    await endSession();
  } catch {
    // The session row is already gone via cascade; we only need the cookie removed.
  }
  redirect("/?account=deleted");
}
