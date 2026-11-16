"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { linkTokenError } from "@/lib/rules";
import { createDmRuleForUser, emailCapturePlanError, resolveSocialAccountId, UUID_RE, validateFormInput, type RuleFormInput } from "@/lib/dmRuleCreate";
import { RewindError, rewindRule } from "@/lib/rewind";
import { cleanPublicReply } from "@/lib/publicReply";
import { detachMagnetIfLinkChanged } from "@/lib/leadMagnets";
import { fetchRecentMedia, type IgMediaItem } from "@/lib/igMedia";
import type { GraphAccount } from "@/lib/igGraph";
import { isMissingColumnError } from "@/lib/ruleMedia";

export type { RuleFormInput, RuleTrigger } from "@/lib/dmRuleCreate";

export type RuleActionResult = { ok: true } | { ok: false; errors: string[] };

function dbNotReady(): RuleActionResult {
  return { ok: false, errors: ["Database not configured."] };
}

export type RecentMediaResult =
  | { ok: true; media: IgMediaItem[] }
  | { ok: false; error: string };

export async function listRecentMedia(socialAccountId: string): Promise<RecentMediaResult> {
  if (!isDbConfigured()) return { ok: false, error: "Database not configured." };
  if (!UUID_RE.test(socialAccountId)) return { ok: false, error: "Choose a connected Instagram account." };
  const user = await requireUser();
  try {
    const accounts = await query<GraphAccount>(
      `select id, external_id, access_token_enc, auth_type from socialapp.social_accounts
       where id=$1 and user_id=$2 and platform='instagram' and status='active'`,
      [socialAccountId, user.id],
    );
    if (!accounts[0]) return { ok: false, error: "Reconnect Instagram to choose a post or reel." };
    return { ok: true, media: await fetchRecentMedia(accounts[0], 25) };
  } catch {
    return { ok: false, error: "Could not load recent posts. Please try again." };
  }
}

export async function createRule(input: RuleFormInput): Promise<RuleActionResult> {
  if (!isDbConfigured()) {
    return dbNotReady();
  }
  const user = await requireUser();
  const result = await createDmRuleForUser(user.id, input, "active");
  if (!result.ok) return result;
  revalidatePath("/app/auto-dm");
  revalidatePath("/app"); // Home lists automations too
  return { ok: true };
}

export async function updateRule(id: string, input: RuleFormInput): Promise<RuleActionResult> {
  if (!isDbConfigured()) {
    return dbNotReady();
  }
  if (!UUID_RE.test(id)) {
    return { ok: false, errors: ["Invalid Auto-DM."] };
  }
  const user = await requireUser();
  const errors = validateFormInput(input);
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  const planError = await emailCapturePlanError(user.id, input);
  if (planError) return { ok: false, errors: [planError] };
  let account: Awaited<ReturnType<typeof resolveSocialAccountId>>;
  try {
    account = await resolveSocialAccountId(user.id, input.socialAccountId);
  } catch {
    return { ok: false, errors: ["Could not save the Auto-DM. Please try again."] };
  }
  if ("error" in account) {
    return { ok: false, errors: [account.error] };
  }
  const link = input.linkUrl.trim() || null;
  const mediaIds = input.mediaIds ?? [];
  const linkLabel = input.linkLabel?.trim() || "Open link";
  try {
    let rows: { id: string }[];
    try {
      rows = await query<{ id: string }>(
        `update socialapp.dm_rules set name=$2, keywords=$3, match_type=$4, dm_text=$5, link_url=$6, email_gate=$7, follow_gate=$8, triggers=$9, social_account_id=$10, media_ids=$11, link_label=$12, updated_at=now()
         where id=$1 and user_id=$13 returning id`,
        [
          id,
          input.name.trim(),
          input.keywords,
          input.matchType,
          input.dmText,
          link,
          input.emailGate,
          input.followGate,
          input.triggers,
          account.id,
          mediaIds,
          linkLabel,
          user.id,
        ],
      );
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;
      rows = await query<{ id: string }>(
        `update socialapp.dm_rules set name=$2, keywords=$3, match_type=$4, dm_text=$5, link_url=$6, email_gate=$7, follow_gate=$8, triggers=$9, social_account_id=$10, updated_at=now()
         where id=$1 and user_id=$11 returning id`,
        [
          id,
          input.name.trim(),
          input.keywords,
          input.matchType,
          input.dmText,
          link,
          input.emailGate,
          input.followGate,
          input.triggers,
          account.id,
          user.id,
        ],
      );
    }
    if (!rows[0]) {
      return { ok: false, errors: ["Auto-DM not found."] };
    }
    try {
      // Link edited away from the attached lead magnet: stop tagging leads with that magnet.
      await detachMagnetIfLinkChanged(user.id, id);
    } catch (err) {
      console.error("Could not check lead magnet link for rule", id, err instanceof Error ? err.message : err);
    }
    try {
      await query(
        `update socialapp.dm_rules set public_reply=$3 where id=$1 and user_id=$2`,
        [id, user.id, cleanPublicReply(input.publicReply)],
      );
    } catch (err) {
      console.error("Could not save public reply for rule", id, err);
    }
    revalidatePath("/app/auto-dm");
    revalidatePath("/app"); // Home lists automations too
    return { ok: true };
  } catch {
    return { ok: false, errors: ["Could not update the Auto-DM."] };
  }
}

export async function toggleRule(id: string): Promise<RuleActionResult> {
  if (!isDbConfigured()) {
    return dbNotReady();
  }
  if (!UUID_RE.test(id)) {
    return { ok: false, errors: ["Invalid Auto-DM."] };
  }
  const user = await requireUser();
  try {
    // Going live is validated on the server too: a rule whose message uses {{link}} must have a link.
    const current = await query<{ status: string; dm_text: string; link_url: string | null }>(
      "select status, dm_text, link_url from socialapp.dm_rules where id = $1 and user_id = $2",
      [id, user.id],
    );
    if (!current[0]) {
      return { ok: false, errors: ["Auto-DM not found."] };
    }
    if (current[0].status !== "active") {
      const linkError = linkTokenError(current[0].dm_text ?? "", current[0].link_url);
      if (linkError) return { ok: false, errors: [linkError] };
    }
    const rows = await query<{ id: string }>(
      `update socialapp.dm_rules set status = case when status = 'active' then 'paused' else 'active' end, updated_at = now()
       where id = $1 and user_id = $2 returning id`,
      [id, user.id],
    );
    if (!rows[0]) {
      return { ok: false, errors: ["Auto-DM not found."] };
    }
    revalidatePath("/app/auto-dm");
    revalidatePath("/app"); // Home lists automations too
    return { ok: true };
  } catch {
    return { ok: false, errors: ["Could not update status."] };
  }
}

export async function rewindRuleAction(
  id: string,
): Promise<{ ok: true; queued: number; scanned: number; failures: number } | { ok: false; error: string }> {
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured." };
  }
  if (!UUID_RE.test(id)) {
    return { ok: false, error: "Invalid Auto-DM." };
  }
  const user = await requireUser();
  try {
    const result = await rewindRule(user.id, id);
    try {
      await query(
        "insert into socialapp.rewind_runs (user_id, rule_id, scanned, queued, failures) values ($1,$2,$3,$4,$5)",
        [user.id, id, result.scanned, result.queued, result.failures],
      );
    } catch (recordErr) {
      // The DMs are already queued; a failed history record should not fail the scan.
      console.error("rewind run record failed for rule", id, recordErr instanceof Error ? recordErr.message : recordErr);
    }
    revalidatePath("/app/auto-dm");
    revalidatePath("/app"); // Home lists automations too
    revalidatePath("/app/rewind");
    return { ok: true, queued: result.queued, scanned: result.scanned, failures: result.failures };
  } catch (err) {
    if (err instanceof RewindError) return { ok: false, error: err.message };
    console.error("rewindRuleAction failed for rule", id, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not scan past comments. Please try again." };
  }
}

export async function deleteRule(id: string): Promise<RuleActionResult> {
  if (!isDbConfigured()) {
    return dbNotReady();
  }
  if (!UUID_RE.test(id)) {
    return { ok: false, errors: ["Invalid Auto-DM."] };
  }
  const user = await requireUser();
  try {
    const rows = await query<{ id: string }>(
      "delete from socialapp.dm_rules where id = $1 and user_id = $2 returning id",
      [id, user.id],
    );
    if (!rows[0]) {
      return { ok: false, errors: ["Auto-DM not found."] };
    }
    revalidatePath("/app/auto-dm");
    revalidatePath("/app"); // Home lists automations too
    return { ok: true };
  } catch {
    return { ok: false, errors: ["Could not delete the Auto-DM."] };
  }
}
