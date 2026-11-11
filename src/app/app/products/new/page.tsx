import { PageHero } from "@/components/ui/kit";
import { requireUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { listRuleOptions, type RuleOption } from "@/lib/leadMagnets";
import { rulePicks } from "../../lead-magnets/rulePicks";
import ProductForm from "../ProductForm";

export const metadata = { title: "Create product" };

export default async function NewProductPage() {
  const user = await requireUser();
  let rules: RuleOption[] = [];
  try {
    rules = isDbConfigured() ? await listRuleOptions(user.id) : [];
  } catch (err) {
    console.error("rule options load failed", err instanceof Error ? err.message : err);
  }
  return (
    <>
      <PageHero eyebrow="Products" title="Create a" accent="product" lede="A digital product your followers can buy with a card. You get paid through Stripe." art="/landing/card-dm.webp" />
      <ProductForm
        id={null}
        defaults={{ title: "", description: "", cover_url: null, delivery_type: "file", delivery_url: "", price: "", currency: "usd", active: true }}
        rules={rulePicks(rules, {})}
        selectedRules={[]}
      />
    </>
  );
}
