"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/ui/SubmitButton";
import { BtnLink } from "@/components/ui/kit";
import ui from "@/components/ui/ui.module.css";
import { DeliveryFields, FormErrors, RulePicker, type FieldDefaults, type RulePick } from "@/components/commerce/DeliveryFields";
import styles from "@/components/commerce/commerce.module.css";
import { SUPPORTED_CURRENCIES } from "@/lib/money";
import { saveProductAction } from "./actions";

export type ProductDefaults = FieldDefaults & { price: string; currency: string; active: boolean };

/** `upi`: the seller is paid by Direct UPI (India), so the price is always in INR. */
export default function ProductForm({ id, defaults, rules, selectedRules, upi = false }: { id: string | null; defaults: ProductDefaults; rules: RulePick[]; selectedRules: string[]; upi?: boolean }) {
  const [state, action] = useActionState(saveProductAction, undefined);
  return (
    <form action={action} className={styles.form}>
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <FormErrors errors={state?.errors} />
      <DeliveryFields
        prefix="product"
        defaults={defaults}
        deliveryHelp="Buyers see this on the thank-you page right after paying. Use a public https link (Drive, Dropbox, Notion, course page...)."
      />
      <div className={styles.formRow}>
        <div className={ui.field}>
          <label htmlFor="product-price" className={ui.label}>Price</label>
          <input id="product-price" name="price" inputMode="decimal" required placeholder="19.00" defaultValue={defaults.price} pattern="[0-9]+([.][0-9]{1,2})?" className={ui.input} />
        </div>
        <div className={ui.field}>
          <label htmlFor="product-currency" className={ui.label}>Currency</label>
          {upi ? (
            <select id="product-currency" name="currency" defaultValue="inr" className={ui.input} aria-describedby="product-currency-hint">
              <option value="inr">INR (₹)</option>
            </select>
          ) : (
            <select id="product-currency" name="currency" defaultValue={defaults.currency} className={ui.input}>
              {SUPPORTED_CURRENCIES.map((c) => <option key={c} value={c}>{c.toUpperCase()}</option>)}
            </select>
          )}
          {upi ? <span id="product-currency-hint" className={ui.hint}>UPI payments are always in rupees.</span> : null}
        </div>
      </div>
      <label className={ui.checkRow}>
        <input type="checkbox" name="active" defaultChecked={defaults.active} /> Active (the buy link accepts payments)
      </label>
      <RulePicker
        prefix="product"
        rules={rules}
        selected={selectedRules}
        legend="Send the buy link with these auto-DM rules"
        help="Ticked rules send this product's buy link instead of their current link."
      />
      <div className={styles.actions}>
        <SubmitButton label={id ? "Save changes" : "Create product"} />
        <BtnLink href="/app/products" variant="ghost">Cancel</BtnLink>
      </div>
    </form>
  );
}
