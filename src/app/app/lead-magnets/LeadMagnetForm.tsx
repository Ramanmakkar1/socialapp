"use client";

import { useActionState } from "react";
import SubmitButton from "@/components/ui/SubmitButton";
import { BtnLink } from "@/components/ui/kit";
import { DeliveryFields, FormErrors, RulePicker, type FieldDefaults, type RulePick } from "@/components/commerce/DeliveryFields";
import styles from "@/components/commerce/commerce.module.css";
import { saveLeadMagnetAction } from "./actions";

export default function LeadMagnetForm({ id, defaults, rules, selectedRules }: { id: string | null; defaults: FieldDefaults; rules: RulePick[]; selectedRules: string[] }) {
  const [state, action] = useActionState(saveLeadMagnetAction, undefined);
  return (
    <form action={action} className={styles.form}>
      {id ? <input type="hidden" name="id" value={id} /> : null}
      <FormErrors errors={state?.errors} />
      <DeliveryFields
        prefix="magnet"
        defaults={defaults}
        deliveryHelp="Public https link to the file (PDF, Notion, Drive, Dropbox...) or page. Leads get it as a tracked link."
      />
      <RulePicker
        prefix="magnet"
        rules={rules}
        selected={selectedRules}
        legend="Deliver with these auto-DM rules"
        help="When a ticked rule's email gate collects an email, the DM sends this lead magnet and the lead is tagged with it. The rule's link is replaced by this one."
      />
      <div className={styles.actions}>
        <SubmitButton label={id ? "Save changes" : "Create lead magnet"} />
        <BtnLink href="/app/lead-magnets" variant="ghost">Cancel</BtnLink>
      </div>
    </form>
  );
}
