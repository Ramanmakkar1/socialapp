"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";
import { validateRule, type DmRule } from "@/lib/rules";

export type RuleFormInput = {
  name: string;
  keywords: string[];
  matchType: "contains" | "exact";
  dmText: string;
  linkUrl: string;
  emailGate: boolean;
  followGate: boolean;
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
    triggers: ["comment"],
    replyPublicly: false,
    publicReplies: [],
    dmMessage: input.dmText,
    linkUrl: link || undefined,
    askEmail: input.emailGate,
    requireFollow: input.followGate,
    active,
  };
}

function validateFormInput(input: RuleFormInput): string[] {
  const errors: string[] = [];
  const name = input.name.trim();
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

export async function createRule(input: RuleFormInput): Promise<RuleActionResult> {
  if (!isDbConfigured()) {
    return dbNotReady();
  }
  const user = await requireUser();
  const errors = validateFormInput(input);
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  const link = input.linkUrl.trim() || null;
  try {
    await query(
      `insert into socialapp.dm_rules (user_id, name, keywords, match_type, dm_text, link_url, email_gate, follow_gate, status)
       values ($1, $2, $3, $4, $5, $6, $7, $8, 'active')`,
      [
        user.id,
        input.name.trim(),
        input.keywords,
        input.matchType,
        input.dmText,
        link,
        input.emailGate,
        input.followGate,
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
  const link = input.linkUrl.trim() || null;
  try {
    const rows = await query<{ id: string }>(
      `update socialapp.dm_rules set name=$2, keywords=$3, match_type=$4, dm_text=$5, link_url=$6, email_gate=$7, follow_gate=$8, updated_at=now()
       where id=$1 and user_id=$9 returning id`,
      [
        id,
        input.name.trim(),
        input.keywords,
        input.matchType,
        input.dmText,
        link,
        input.emailGate,
        input.followGate,
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
