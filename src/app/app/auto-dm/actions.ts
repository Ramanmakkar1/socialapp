"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { validateRule, type DmRule } from "@/lib/rules";
import { rewindRule } from "@/lib/rewind";

export type RuleTrigger = "comment" | "story_reply";

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
    matchMode: input.matchType,
    triggers: input.triggers,
    replyPublicly: false,
    publicReplies: [],
    dmMessage: input.dmText,
    linkUrl: link || undefined,
    askEmail: input.emailGate,
    requireFollow: input.followGate,
    active,
  };
}

const ALLOWED_TRIGGERS: ReadonlySet<RuleTrigger> = new Set(["comment", "story_reply"]);

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
  if (input.keywords.length > 10) {
    errors.push("Use at most 10 keywords.");
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

export async function createRule(input: RuleFormInput): Promise<RuleActionResult> {
  if (!isDbConfigured()) {
    return dbNotReady();
  }
  const user = await requireUser();
  const errors = validateFormInput(input);
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  const account = await resolveSocialAccountId(user.id, input.socialAccountId);
  if ("error" in account) {
    return { ok: false, errors: [account.error] };
  }
  const link = input.linkUrl.trim() || null;
  try {
    await query(
      `insert into socialapp.dm_rules (user_id, social_account_id, name, keywords, match_type, dm_text, link_url, email_gate, follow_gate, triggers, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'active')`,
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
  const account = await resolveSocialAccountId(user.id, input.socialAccountId);
  if ("error" in account) {
    return { ok: false, errors: [account.error] };
  }
  const link = input.linkUrl.trim() || null;
  try {
    const rows = await query<{ id: string }>(
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
    if (!rows[0]) {
      return { ok: false, errors: ["Automation not found."] };
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
    revalidatePath("/app/auto-dm");
    return { ok: true, queued: result.queued, scanned: result.scanned, failures: result.failures };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not scan past comments.";
    return { ok: false, error: message };
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
