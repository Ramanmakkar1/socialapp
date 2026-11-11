// Shared form fields for lead magnets and products: title, description, cover, delivery, rules.
import Link from "next/link";
import ui from "@/components/ui/ui.module.css";
import styles from "./commerce.module.css";

export type FieldDefaults = {
  title: string;
  description: string;
  cover_url: string | null;
  delivery_type: "file" | "link";
  delivery_url: string;
};

export type RulePick = { id: string; name: string; status: string; email_gate: boolean; note: string | null };

export function DeliveryFields({ prefix, defaults, deliveryHelp }: { prefix: string; defaults: FieldDefaults; deliveryHelp: string }) {
  return (
    <>
      <div className={ui.field}>
        <label htmlFor={`${prefix}-title`} className={ui.label}>Title</label>
        <input id={`${prefix}-title`} name="title" required maxLength={120} defaultValue={defaults.title} className={ui.input} />
      </div>
      <div className={ui.field}>
        <label htmlFor={`${prefix}-description`} className={ui.label}>Description</label>
        <textarea id={`${prefix}-description`} name="description" rows={4} maxLength={2000} defaultValue={defaults.description} className={ui.input} />
      </div>
      <div className={ui.field}>
        <label htmlFor={`${prefix}-cover`} className={ui.label}>Cover image URL <span className={ui.hint}>(optional)</span></label>
        <input id={`${prefix}-cover`} name="cover_url" type="url" inputMode="url" placeholder="https://..." defaultValue={defaults.cover_url ?? ""} className={ui.input} />
      </div>
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Delivery</legend>
        <div className={styles.radioRow}>
          <label className={ui.checkRow}>
            <input type="radio" name="delivery_type" value="file" defaultChecked={defaults.delivery_type === "file"} /> File download
          </label>
          <label className={ui.checkRow}>
            <input type="radio" name="delivery_type" value="link" defaultChecked={defaults.delivery_type !== "file"} /> Link
          </label>
        </div>
      </fieldset>
      <div className={ui.field}>
        <label htmlFor={`${prefix}-delivery`} className={ui.label}>Download URL or link</label>
        <input
          id={`${prefix}-delivery`}
          name="delivery_url"
          type="url"
          inputMode="url"
          required
          placeholder="https://..."
          defaultValue={defaults.delivery_url}
          aria-describedby={`${prefix}-delivery-help`}
          className={ui.input}
        />
        <span id={`${prefix}-delivery-help`} className={ui.hint}>{deliveryHelp}</span>
      </div>
    </>
  );
}

export function RulePicker({ prefix, rules, selected, legend, help }: { prefix: string; rules: RulePick[]; selected: string[]; legend: string; help: string }) {
  return (
    <fieldset className={styles.fieldset} aria-describedby={`${prefix}-rules-help`}>
      <legend className={styles.legend}>{legend}</legend>
      <span id={`${prefix}-rules-help`} className={ui.hint}>{help}</span>
      {rules.length === 0 ? (
        <p className={ui.hint}>
          No auto-DM rules yet. <Link href="/app/auto-dm" className={ui.link}>Create a rule</Link>, then come back to attach it.
        </p>
      ) : (
        <div className={styles.ruleList}>
          {rules.map((rule) => (
            <label key={rule.id} className={ui.checkRow}>
              <input type="checkbox" name="rule_ids" value={rule.id} defaultChecked={selected.includes(rule.id)} />
              <span>
                {rule.name}
                <span className={ui.hint}>
                  {" "}· {rule.status === "active" ? "active" : "paused"}
                  {rule.email_gate ? " · asks for email" : ""}
                  {rule.note ? ` · ${rule.note}` : ""}
                </span>
              </span>
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}

export function FormErrors({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) return null;
  return (
    <div role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>
      <ul className="m-0 list-disc pl-5">{errors.map((e) => <li key={e}>{e}</li>)}</ul>
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className={`${ui.card} ${styles.stat}`}>
      <p className={styles.statLabel}>{label}</p>
      <p className={styles.statValue}>{value}</p>
    </div>
  );
}
