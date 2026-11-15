"use client";

import { useActionState } from "react";
import styles from "../admin.module.css";

export type AdminActionState = { ok: boolean; message: string } | null;
export type AdminAction = (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;

/**
 * One admin button backed by a server action. `fields` become hidden inputs (the server action
 * validates them again); `confirm` asks before submitting. The result message shows next to it.
 */
export default function ActionForm({
  action,
  fields,
  label,
  busyLabel,
  confirm,
  danger,
}: {
  action: AdminAction;
  fields: Record<string, string>;
  label: string;
  busyLabel?: string;
  confirm?: string;
  danger?: boolean;
}) {
  const [state, run, pending] = useActionState(action, null);
  return (
    <form
      action={run}
      className={styles.inlineForm}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <button type="submit" className={`${styles.btn} ${styles.btnSm} ${danger ? styles.btnDanger : ""}`} disabled={pending}>
        {pending ? (busyLabel ?? "Working…") : label}
      </button>
      {state && (
        <span role={state.ok ? "status" : "alert"} className={state.ok ? styles.actionMsgOk : styles.actionMsgErr}>
          {state.message}
        </span>
      )}
    </form>
  );
}
