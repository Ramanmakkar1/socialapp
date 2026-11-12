import { Magnet } from "lucide-react";
import { PageHero } from "@/components/ui/kit";
import { requireUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { listRuleOptions, type RuleOption } from "@/lib/leadMagnets";
import LeadMagnetForm from "../LeadMagnetForm";
import { rulePicks } from "../rulePicks";

export const metadata = { title: "Create lead magnet" };

export default async function NewLeadMagnetPage() {
  const user = await requireUser();
  let rules: RuleOption[] = [];
  try {
    rules = isDbConfigured() ? await listRuleOptions(user.id) : [];
  } catch (err) {
    console.error("rule options load failed", err instanceof Error ? err.message : err);
  }
  return (
    <>
      <PageHero icon={<Magnet width={20} height={20} />} eyebrow="Lead magnets" title="Create a lead" accent="magnet" lede="A free resource your auto-DMs send once someone shares their email." />
      <LeadMagnetForm
        id={null}
        defaults={{ title: "", description: "", cover_url: null, delivery_type: "file", delivery_url: "" }}
        rules={rulePicks(rules, {})}
        selectedRules={[]}
      />
    </>
  );
}
