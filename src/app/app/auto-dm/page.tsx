import { MessageCircleHeart } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { BtnA, PageHero } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import { query } from "@/lib/db";
import { DM_TEMPLATES } from "@/lib/dmTemplates";
import { AutoDmView, type DbRuleRow, type InstagramAccountOption, type RuleFormDefaults, type RuleStats } from "./RuleForm";
import type { RuleTrigger } from "./actions";
import { DmDeliveryStatus, loadDmDeliveryRows, type DmDeliveryRow } from "./DmDeliveryStatus";
import { RewindPastCommentsButton } from "./RewindPastCommentsButton";
import { isMissingColumnError } from "@/lib/ruleMedia";
import { clickCountSql, uniqueClickCountSql } from "@/lib/links";

export const metadata = { title: "Auto-DM" };

const TRIGGERS: RuleTrigger[] = ["comment", "story_reply", "dm"];

export default async function AutoDmPage({
  searchParams,
}: {
  searchParams: Promise<{ template?: string | string[]; trigger?: string | string[] }>;
}) {
  const user = await requireUser();
  const { template: templateParam, trigger: triggerParam } = await searchParams;
  const triggerRaw = typeof triggerParam === "string" ? triggerParam : triggerParam?.[0];
  const startTrigger = TRIGGERS.find((t) => t === triggerRaw);
  const templateSlug = typeof templateParam === "string" ? templateParam : templateParam?.[0];

  let rules: DbRuleRow[];
  let instagramAccounts: InstagramAccountOption[];
  try {
    [rules, instagramAccounts] = await Promise.all([
      query<DbRuleRow>(
        `select id, name, keywords, match_type, dm_text, link_url, email_gate, follow_gate, status, triggers, social_account_id, media_ids, link_label
         from socialapp.dm_rules where user_id = $1 order by created_at desc`,
        [user.id],
      ).catch(async (error: unknown) => {
        if (!isMissingColumnError(error)) throw error;
        const rows = await query<DbRuleRow>(
          `select id, name, keywords, match_type, dm_text, link_url, email_gate, follow_gate, status, triggers, social_account_id
           from socialapp.dm_rules where user_id = $1 order by created_at desc`,
          [user.id],
        );
        return rows.map((rule) => ({ ...rule, media_ids: [], link_label: null }));
      }),
      query<InstagramAccountOption>(
        `select id, username, status from socialapp.social_accounts
         where user_id = $1 and platform = 'instagram' order by created_at`,
        [user.id],
      ),
    ]);
    try {
      const replyRows = await query<{ id: string; public_reply: string | null }>(
        `select id, public_reply from socialapp.dm_rules where user_id = $1`,
        [user.id],
      );
      const replies = new Map(replyRows.map((r) => [r.id, r.public_reply]));
      rules = rules.map((r) => ({ ...r, public_reply: replies.get(r.id) ?? null }));
    } catch {
      rules = rules.map((r) => ({ ...r, public_reply: null }));
    }
  } catch {
    return (
      <>
        <PageHero icon={<MessageCircleHeart width={20} height={20} />}
          eyebrow="Comment to DM"
          title="Auto-DM"
          lede="Send a DM to everyone who comments a keyword."
        />
        <div role="alert" className={`${ui.card} ${ui.peach} mt-6 p-6`}>
          <h2 className="m-0 text-lg font-semibold">We couldn&apos;t load your Auto-DMs</h2>
          <p className="mt-2 text-sm">
            Please try again in a moment. Your existing rules have not changed.
          </p>
          <BtnA href="/app/auto-dm" size="sm" className="mt-5">
            Retry loading Auto-DMs
          </BtnA>
        </div>
      </>
    );
  }

  let templateDefaults: RuleFormDefaults | undefined;
  let templateNote: string | undefined;

  if (templateSlug) {
    const tpl = DM_TEMPLATES.find((t) => t.slug === templateSlug);
    if (tpl) {
      templateDefaults = {
        name: tpl.title,
        keywords: tpl.keywords,
        dmText: tpl.dmMessage,
        publicReply: tpl.publicReply,
        emailGate: tpl.askEmail,
        followGate: tpl.requireFollow,
        matchType: tpl.matchMode === "any" ? "contains" : tpl.matchMode,
        triggers: tpl.slug === "story-freebie" || tpl.slug === "dm-auto-reply" ? ["story_reply"] : ["comment"],
      };
      if (tpl.slug === "dm-auto-reply") {
        templateNote =
          "This template replies to DMs that contain your keyword. It fires on story replies, which arrive as DMs — put the keyword on your story so people know what to reply with.";
      }
      if (tpl.matchMode === "any") {
        templateNote =
          "This template uses “match any comment” in the library. Saved rules use “contains keyword” instead, because Auto-DMs only support contains or exact match.";
      }
    }
  }

  // Per-rule DMs sent and link clicks for the automations table (unknown = dash).
  let stats: Record<string, RuleStats> = {};
  try {
    const statRows = await query<{ id: string; dms: number; clicks: number; uniqueClicks: number }>(
      `select r.id,
         (select count(*)::int from socialapp.dm_queue q where q.rule_id = r.id and q.status = 'sent') as dms,
         ${clickCountSql("s.rule_id = r.id")} as clicks,
         ${uniqueClickCountSql("s.rule_id = r.id")} as "uniqueClicks"
       from socialapp.dm_rules r where r.user_id = $1`,
      [user.id],
    );
    stats = Object.fromEntries(statRows.map((r) => [r.id, { dms: r.dms, clicks: r.clicks, uniqueClicks: r.uniqueClicks }]));
  } catch {
    stats = {};
  }

  let deliveryRows: DmDeliveryRow[] | null = null;
  let deliveryLoadError = false;
  try {
    deliveryRows = await loadDmDeliveryRows(user.id);
  } catch {
    deliveryLoadError = true;
  }

  return (
    <>
      <AutoDmView
        rules={rules}
        instagramAccounts={instagramAccounts}
        templateDefaults={templateDefaults}
        templateNote={templateNote}
        rewindButton={RewindPastCommentsButton}
        stats={stats}
        startTrigger={templateDefaults ? undefined : startTrigger}
      />
      <DmDeliveryStatus rows={deliveryRows} loadError={deliveryLoadError} asOf={new Date()} />
    </>
  );
}
