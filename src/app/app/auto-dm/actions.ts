"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { linkTokenError, validateRule, type DmRule } from "@/lib/rules";
import { RewindError, rewindRule } from "@/lib/rewind";
import { cleanPublicReply } from "@/lib/publicReply";
import { detachMagnetIfLinkChanged } from "@/lib/leadMagnets";
import { fetchRecentMedia, type IgMediaItem } from "@/lib/igMedia";
import type { GraphAccount } from "@/lib/igGraph";
import { isMissingColumnError } from "@/lib/ruleMedia";
import { ANY_COMMENT_KEYWORD, MAX_KEYWORD_CHIPS } from "@/lib/keywordChips";

export type RuleTrigger = "comment" | "story_reply" | "dm";

export type RuleFormInput = {
  name: string;
  keywords: string[];
  matchType: "contains" | "exact";
  dmText: string;
  linkUrl: string;
  emailGate: boolean;
  followGate: boolean;
  triggers: RuleTrigger[];
  /** null = all connected Instagram accounts */
  socialAccountId: string | null;
  publicReply: string;
  mediaIds?: string[];
  linkLabel?: string;
};

export type RuleActionResult = { ok: true } | { ok: false; errors: string[] };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function formToDmRule(input: RuleFormInput, id: string, active: boolean): DmRule {
  const link = input.linkUrl.trim();
  return {
    id,
    name: input.name.trim(),
    keywords: input.keywords,
    matchMode: input.keywords.includes(ANY_COMMENT_KEYWORD) ? "any" : input.matchType,
    triggers: input.triggers,
    replyPublicly: false,
    publicReplies: [],
    dmMessage: input.dmText,
    linkUrl: link || undefined,
    linkLabel: input.linkLabel?.trim() || "Open link",
    askEmail: input.emailGate,
    requireFollow: input.followGate,
    active,
  };
}

const ALLOWED_TRIGGERS: ReadonlySet<RuleTrigger> = new Set(["comment", "story_reply", "dm"]);

function validateFormInput(input: RuleFormInput): string[] {
  const errors: string[] = [];
  const name = input.name.trim();
  if (!input.triggers?.length) {
    errors.push("Choose at least one trigger.");
  } else {
    for (const t of input.triggers) {
      if (!ALLOWED_TRIGGERS.has(t)) {
        errors.push("Invalid trigger.");
        break;
      }
    }
  }
  if (!name) {
    errors.push("Name is required.");
  }
  if (name.length > 80) {
    errors.push("Name must be 80 characters or fewer.");
  }
  if (input.keywords.length > MAX_KEYWORD_CHIPS) {
    errors.push(`Use at most ${MAX_KEYWORD_CHIPS} keywords.`);
  }
  if ((input.mediaIds?.length ?? 0) > 25) {
    errors.push("Choose at most 25 posts or reels.");
  }
  if ((input.linkLabel?.length ?? 0) > 80) {
    errors.push("Link button text must be 80 characters or fewer.");
  }
  if (errors.length > 0) {
    return errors;
  }
  return validateRule(formToDmRule(input, "draft", true));
}

function dbNotReady(): RuleActionResult {
  return { ok: false, errors: ["Database not configured."] };
}

async function resolveSocialAccountId(
  userId: string,
  socialAccountId: string | null,
): Promise<{ id: string | null } | { error: string }> {
  if (socialAccountId === null || socialAccountId === "") {
    return { id: null };
  }
  if (!UUID_RE.test(socialAccountId)) {
    return { error: "Invalid Instagram account." };
  }
  const rows = await query<{ id: string }>(
    `select id from socialapp.social_accounts where id = $1 and user_id = $2 and platform = 'instagram'`,
    [socialAccountId, userId],
  );
  if (!rows[0]) {
    return { error: "This Instagram account isn't connected to your workspace." };
  }
  return { id: socialAccountId };
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
  const errors = validateFormInput(input);
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  let account: Awaited<ReturnType<typeof resolveSocialAccountId>>;
  try {
    account = await resolveSocialAccountId(user.id, input.socialAccountId);
  } catch {
    return { ok: false, errors: ["Could not save automation. Please try again."] };
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
        `insert into socialapp.dm_rules (user_id, social_account_id, name, keywords, match_type, dm_text, link_url, email_gate, follow_gate, triggers, media_ids, link_label, status)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'active') returning id`,
        [
          user.id,
          account.id,
          input.name.trim(),
          input.keywords,
          input.matchType,
          input.dmText,
          link,
          input.emailGate,
          input.followGate,
          input.triggers,
          mediaIds,
          linkLabel,
        ],
      );
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;
      // Pre-021 databases retain the original any-post behaviour.
      rows = await query<{ id: string }>(
        `insert into socialapp.dm_rules (user_id, social_account_id, name, keywords, match_type, dm_text, link_url, email_gate, follow_gate, triggers, status)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active') returning id`,
        [
          user.id,
          account.id,
          input.name.trim(),
          input.keywords,
          input.matchType,
          input.dmText,
          link,
          input.emailGate,
          input.followGate,
          input.triggers,
        ],
      );
    }
    try {
      await query(
        `update socialapp.dm_rules set public_reply=$3 where id=$1 and user_id=$2`,
        [rows[0].id, user.id, cleanPublicReply(input.publicReply)],
      );
    } catch (err) {
      console.error("Could not save public reply for rule", rows[0].id, err);
    }
    revalidatePath("/app/auto-dm");
    return { ok: true };
  } catch {
    return { ok: false, errors: ["Could not save automation."] };
  }
}

export async function updateRule(id: string, input: RuleFormInput): Promise<RuleActionResult> {
  if (!isDbConfigured()) {
    return dbNotReady();
  }
  if (!UUID_RE.test(id)) {
    return { ok: false, errors: ["Invalid automation."] };
  }
  const user = await requireUser();
  const errors = validateFormInput(input);
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  let account: Awaited<ReturnType<typeof resolveSocialAccountId>>;
  try {
    account = await resolveSocialAccountId(user.id, input.socialAccountId);
  } catch {
    return { ok: false, errors: ["Could not save automation. Please try again."] };
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
      return { ok: false, errors: ["Automation not found."] };
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
    return { ok: true };
  } catch {
    return { ok: false, errors: ["Could not update automation."] };
  }
}

export async function toggleRule(id: string): Promise<RuleActionResult> {
  if (!isDbConfigured()) {
    return dbNotReady();
  }
  if (!UUID_RE.test(id)) {
    return { ok: false, errors: ["Invalid automation."] };
  }
  const user = await requireUser();
  try {
    // Going live is validated on the server too: a rule whose message uses {{link}} must have a link.
    const current = await query<{ status: string; dm_text: string; link_url: string | null }>(
      "select status, dm_text, link_url from socialapp.dm_rules where id = $1 and user_id = $2",
      [id, user.id],
    );
    if (!current[0]) {
      return { ok: false, errors: ["Automation not found."] };
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
      return { ok: false, errors: ["Automation not found."] };
    }
    revalidatePath("/app/auto-dm");
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
    return { ok: false, error: "Invalid automation." };
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
    return { ok: false, errors: ["Invalid automation."] };
  }
  const user = await requireUser();
  try {
    const rows = await query<{ id: string }>(
      "delete from socialapp.dm_rules where id = $1 and user_id = $2 returning id",
      [id, user.id],
    );
    if (!rows[0]) {
      return { ok: false, errors: ["Automation not found."] };
    }
    revalidatePath("/app/auto-dm");
    return { ok: true };
  } catch {
    return { ok: false, errors: ["Could not delete automation."] };
  }
}
