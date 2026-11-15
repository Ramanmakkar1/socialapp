// Server-only: creating an Auto-DM rule (comment / story reply / DM keyword → DM). Shared by the
// Auto-DM page (src/app/app/auto-dm/actions.ts) and the MCP create_dm_rule tool, so both validate
// with the same rules (src/lib/rules.ts validateRule) and write the same row.
import { query } from "@/lib/db";
import { validateRule, type DmRule } from "@/lib/rules";
import { cleanPublicReply } from "@/lib/publicReply";
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

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function formToDmRule(input: RuleFormInput, id: string, active: boolean): DmRule {
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

export function validateFormInput(input: RuleFormInput): string[] {
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


export async function resolveSocialAccountId(
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

/**
 * Validates and inserts one rule for `userId`. `status` is 'active' from the Auto-DM page; the MCP
 * tool creates rules 'paused' unless the API key may publish, so the owner switches them on.
 */
export async function createDmRuleForUser(
  userId: string,
  input: RuleFormInput,
  status: "active" | "paused" = "active",
): Promise<{ ok: true; id: string } | { ok: false; errors: string[] }> {
  const errors = validateFormInput(input);
  if (errors.length > 0) {
    return { ok: false, errors };
  }
  let account: Awaited<ReturnType<typeof resolveSocialAccountId>>;
  try {
    account = await resolveSocialAccountId(userId, input.socialAccountId);
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
        `insert into socialapp.dm_rules (user_id, social_account_id, name, keywords, match_type, dm_text, link_url, email_gate, follow_gate, triggers, media_ids, link_label, status)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) returning id`,
        [
          userId,
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
          status,
        ],
      );
    } catch (error) {
      if (!isMissingColumnError(error)) throw error;
      // Pre-021 databases retain the original any-post behaviour.
      rows = await query<{ id: string }>(
        `insert into socialapp.dm_rules (user_id, social_account_id, name, keywords, match_type, dm_text, link_url, email_gate, follow_gate, triggers, status)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) returning id`,
        [
          userId,
          account.id,
          input.name.trim(),
          input.keywords,
          input.matchType,
          input.dmText,
          link,
          input.emailGate,
          input.followGate,
          input.triggers,
          status,
        ],
      );
    }
    try {
      await query(
        `update socialapp.dm_rules set public_reply=$3 where id=$1 and user_id=$2`,
        [rows[0].id, userId, cleanPublicReply(input.publicReply)],
      );
    } catch (err) {
      console.error("Could not save public reply for rule", rows[0].id, err);
    }
    return { ok: true, id: rows[0].id };
  } catch {
    return { ok: false, errors: ["Could not save the Auto-DM."] };
  }
}
