import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { DM_TEMPLATES } from "@/lib/dmTemplates";
import { AutoDmView, type DbRuleRow, type RuleFormDefaults } from "./RuleForm";
import { RewindPastCommentsButton } from "./RewindPastCommentsButton";

export const metadata = { title: "Auto-DM" };

export default async function AutoDmPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string | string[] }>;
}) {
  const user = await requireUser();
  const { template: templateParam } = await searchParams;
  const templateSlug = typeof templateParam === "string" ? templateParam : templateParam?.[0];

  const rules = await query<DbRuleRow>(
    `select id, name, keywords, match_type, dm_text, link_url, email_gate, follow_gate, status, triggers
     from socialapp.dm_rules where user_id = $1 order by created_at desc`,
    [user.id],
  );

  let templateDefaults: RuleFormDefaults | undefined;
  let templateNote: string | undefined;

  if (templateSlug) {
    const tpl = DM_TEMPLATES.find((t) => t.slug === templateSlug);
    if (tpl) {
      templateDefaults = {
        name: tpl.title,
        keywords: tpl.keywords,
        dmText: tpl.dmMessage,
        emailGate: tpl.askEmail,
        followGate: tpl.requireFollow,
        matchType: tpl.matchMode === "any" ? "contains" : tpl.matchMode,
        triggers: tpl.slug === "story-freebie" ? ["story_reply"] : ["comment"],
      };
      if (tpl.matchMode === "any") {
        templateNote =
          "This template uses “match any comment” in the library. Saved rules use “contains keyword” instead, because automations only support contains or exact match.";
      }
    }
  }

  return (
    <AutoDmView
      rules={rules}
      templateDefaults={templateDefaults}
      templateNote={templateNote}
      rewindButton={RewindPastCommentsButton}
    />
  );
}
