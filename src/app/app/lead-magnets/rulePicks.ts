import type { RulePick } from "@/components/commerce/DeliveryFields";
import type { RuleOption } from "@/lib/leadMagnets";

/** Rule options for the pickers, with a note when a rule already delivers something else. */
export function rulePicks(rules: RuleOption[], current: { magnetId?: string; productId?: string }): RulePick[] {
  return rules.map((r) => ({
    id: r.id,
    name: r.name,
    status: r.status,
    email_gate: r.email_gate,
    note:
      r.lead_magnet_id && r.lead_magnet_id !== current.magnetId
        ? "sends another lead magnet"
        : r.product_id && r.product_id !== current.productId
          ? "sends a product"
          : null,
  }));
}
