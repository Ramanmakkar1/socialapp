"use server";

import { isFeatureReady } from "@/lib/featureReadiness";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { deleteAccountData, disconnectAccounts } from "@/lib/accountData";
import { createApiKey, revokeApiKey } from "@/lib/apiKeys";
import { endSession, requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { defaultSchedulesToSeed, isValidTimeZone, SCHEDULABLE_PLATFORMS } from "@/lib/postingSchedule";
import { disconnectYouTubeChannel } from "@/lib/youtubeAccounts";

const SCHEDULE_PLATFORMS = SCHEDULABLE_PLATFORMS;
const validTimeZone = isValidTimeZone;

// First channel connected and no posting schedule yet: seed Mon-Fri 9:00 / 12:00 / 18:00 in the
// browser's time zone for every connected channel, so "Add to queue" / "Next available" work at once.
// Called from the browser (it knows the zone). Never overwrites: a no-op once any schedule exists.
export async function seedDefaultScheduleAction(timezone: string): Promise<{ seeded: number }> {
  const user = await requireUser();
  if (!isDbConfigured()) return { seeded: 0 };
  try {
    const [connected, existing] = await Promise.all([
      query<{ platform: string }>("select distinct platform from socialapp.social_accounts where user_id=$1 and status='active'", [user.id]),
      query<{ platform: string }>("select platform from socialapp.posting_schedules where user_id=$1", [user.id]),
    ]);
    const seeds = defaultSchedulesToSeed(
      connected.map((r) => r.platform),
      existing.map((r) => r.platform),
      typeof timezone === "string" ? timezone.trim() : "UTC",
    );
    for (const s of seeds) {
      await query(
        `insert into socialapp.posting_schedules (user_id, platform, timezone, days, times)
         values ($1, $2, $3, $4::int[], $5::text[]) on conflict (user_id, platform) do nothing`,
        [user.id, s.platform, s.timezone, s.days, s.times],
      );
    }
    if (seeds.length > 0) {
      revalidatePath("/app/settings");
      revalidatePath("/app/calendar");
    }
    return { seeded: seeds.length };
  } catch (err) {
    console.error("seedDefaultScheduleAction failed for user", user.id, err instanceof Error ? err.message : err);
    return { seeded: 0 };
  }
}

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

// Disconnect YouTube: marks the stored channel disconnected and clears the encrypted refresh token.
export async function disconnectYouTubeAction(): Promise<void> {
  const user = await requireUser();
  if (!isDbConfigured()) return;
  try {
    await disconnectYouTubeChannel(user.id);
  } catch (err) {
    console.error("disconnectYouTubeAction failed for user", user.id, err instanceof Error ? err.message : err);
    redirect("/app/settings?yt=disconnect_error");
  }
  revalidatePath("/app/settings");
  redirect("/app/settings?yt=disconnected");
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
  // AI replies on hold (src/lib/featureReadiness.ts): instructions save, the switch stays off.
  const enabled = isFeatureReady("ai_replies") && formData.get("ai_reply_enabled") === "on";
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

// Per-channel posting schedule (Settings → Channels): days of week x times in the user's timezone.
export async function savePostingSchedule(formData: FormData): Promise<void> {
  const user = await requireUser();
  const rawPlatform = formData.get("platform");
  const platform = typeof rawPlatform === "string" ? rawPlatform.trim() : "";
  const rawTz = formData.get("timezone");
  const timezone = typeof rawTz === "string" && rawTz.trim() !== "" ? rawTz.trim() : "UTC";
  const days = [...new Set(
    formData.getAll("days").map((d) => Number(String(d).trim())).filter((d) => Number.isInteger(d) && d >= 1 && d <= 7),
  )].sort((a, b) => a - b);
  const times = [...new Set(
    formData.getAll("times").map((t) => String(t).trim()).filter((t) => /^\d{2}:\d{2}$/.test(t)),
  )].sort();
  if (!isDbConfigured() || !(SCHEDULE_PLATFORMS as readonly string[]).includes(platform)) return;
  if (!validTimeZone(timezone)) redirect("/app/settings?schedule=error");
  try {
    await query(
      `insert into socialapp.posting_schedules (user_id, platform, timezone, days, times)
       values ($1, $2, $3, $4::int[], $5::text[])
       on conflict (user_id, platform) do update
         set timezone = excluded.timezone, days = excluded.days, times = excluded.times, updated_at = now()`,
      [user.id, platform, timezone, days, times],
    );
  } catch (err) {
    console.error("savePostingSchedule failed for user", user.id, err instanceof Error ? err.message : err);
    redirect("/app/settings?schedule=error");
  }
  revalidatePath("/app/settings");
  redirect("/app/settings?schedule=saved");
}

// Create an API key for the MCP server (Settings → API keys). The full key is
// shown once, in the redirect query string; only its hash is stored.
export async function createApiKeyAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const raw = formData.get("key_name");
  const name = typeof raw === "string" ? raw.trim().slice(0, 60) : "";
  if (!isDbConfigured()) redirect("/app/settings?api_key=error");
  const result = await createApiKey(user.id, name);
  if ("error" in result) redirect("/app/settings?api_key=error");
  revalidatePath("/app/settings");
  redirect(`/app/settings?api_key=created&key=${encodeURIComponent(result.key)}`);
}

// Revoke one of the user's API keys (Settings → API keys).
export async function revokeApiKeyAction(formData: FormData): Promise<void> {
  const user = await requireUser();
  const raw = formData.get("key_id");
  const keyId = typeof raw === "string" ? raw.trim().slice(0, 64) : "";
  if (!isDbConfigured() || !keyId) return;
  const result = await revokeApiKey(user.id, keyId);
  if (!result.ok) redirect("/app/settings?api_key=error");
  revalidatePath("/app/settings");
  redirect("/app/settings?api_key=revoked");
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
  // The home page is public marketing; the confirmation is shown on the login page instead.
  redirect("/login?account=deleted");
}
