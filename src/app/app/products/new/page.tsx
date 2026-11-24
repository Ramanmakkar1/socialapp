import { Package } from "lucide-react";
import { PageHero } from "@/components/ui/kit";

import { isDbConfigured } from "@/lib/db";
import { listRuleOptions, type RuleOption } from "@/lib/leadMagnets";
import { payoutRoute } from "@/lib/upi";
import { getSellerPayout } from "@/lib/upiOrders";
import { rulePicks } from "../../lead-magnets/rulePicks";
import ProductForm from "../ProductForm";
import { requireWorkspaceUser } from "@/lib/workspace";

export const metadata = { title: "Create product" };

export default async function NewProductPage() {
  const user = await requireWorkspaceUser("admin");
  let rules: RuleOption[] = [];
  let upi = false;
  try {
    rules = isDbConfigured() ? await listRuleOptions(user.id) : [];
    upi = isDbConfigured() && payoutRoute((await getSellerPayout(user.id))?.country) === "upi";
  } catch (err) {
    console.error("rule options load failed", err instanceof Error ? err.message : err);
  }
  return (
    <>
      <PageHero icon={<Package width={20} height={20} />} eyebrow="Products" title="Create a" accent="product" lede={upi ? "A digital product your followers can buy by UPI. They pay your UPI ID directly and you confirm each payment." : "A digital product your followers can buy with a card. You get paid through Stripe."} />
      <ProductForm
        id={null}
        defaults={{ title: "", description: "", cover_url: null, delivery_type: "file", delivery_url: "", price: "", currency: upi ? "inr" : "usd", active: true }}
        rules={rulePicks(rules, {})}
        selectedRules={[]}
        upi={upi}
      />
    </>
  );
}
