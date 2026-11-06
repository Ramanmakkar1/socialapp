import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { DM_TEMPLATES } from "@/lib/dmTemplates";
import { AutoDmView, type DbRuleRow, type InstagramAccountOption, type RuleFormDefaults } from "./RuleForm";
import { DmDeliveryStatus, loadDmDeliveryRows, type DmDeliveryRow } from "./DmDeliveryStatus";
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

  let rules: DbRuleRow[];
  let instagramAccounts: InstagramAccountOption[];
  try {
    [rules, instagramAccounts] = await Promise.all([
      query<DbRuleRow>(
        `select id, name, keywords, match_type, dm_text, link_url, email_gate, follow_gate, status, triggers, social_account_id
         from socialapp.dm_rules where user_id = $1 order by created_at desc`,
        [user.id],
      ),
      query<InstagramAccountOption>(
        `select id, username, status from socialapp.social_accounts
         where user_id = $1 and platform = 'instagram' order by created_at`,
        [user.id],
      ),
    ]);
  } catch {
    return (
      <section aria-labelledby="auto-dm-heading">
        <h1 id="auto-dm-heading" className="m-0 text-3xl font-semibold text-[var(--poskoo-ink)]" style={{ letterSpacing: "var(--poskoo-type-heading-ls)" }}>Auto-DM</h1>
        <div role="alert" className="mt-6 rounded-[var(--poskoo-radius-card)] border border-[var(--poskoo-line)] bg-[var(--poskoo-peach)] p-6 shadow-[var(--poskoo-shadow-card)]">
          <h2 className="m-0 text-lg font-semibold">We couldn&apos;t load your automations</h2>
          <p className="mt-2 text-sm text-[var(--poskoo-ink)]">
            Please try again in a moment. Your existing rules have not changed.
          </p>
          <a href="/app/auto-dm" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[var(--poskoo-ink)] px-5 py-2.5 text-sm font-semibold text-white">
            Retry loading automations
          </a>
        </div>
      </section>
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
      />
      <DmDeliveryStatus rows={deliveryRows} loadError={deliveryLoadError} asOf={new Date()} />
    </>
  );
}
