"use client";

import { useEffect, useState } from "react";
import styles from "../admin.module.css";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  // When set, the admin must type this exact text (e.g. the user's email) before confirming.
  requireText?: string;
  // Server action for the form; receives FormData with a `confirm` field.
  action?: (formData: FormData) => void;
  onClose: () => void;
};

// Destructive-action dialog: the admin types a confirmation string to enable the button.
// The keyed body remounts on open, so the typed value resets without a setState-in-effect.
export default function ConfirmDialog(props: ConfirmDialogProps) {
  return <DialogBody key={props.open ? "open" : "closed"} {...props} />;
}

function DialogBody({ open, title, message, confirmLabel = "Confirm", requireText, action, onClose }: ConfirmDialogProps) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const blocked = requireText ? typed.trim() !== requireText : false;

  return (
    <div className={styles.overlay} role="presentation" onMouseDown={onClose}>
      <div className={styles.dialog} role="dialog" aria-modal="true" aria-label={title} onMouseDown={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <form
          action={action}
          onSubmit={(e) => {
            if (blocked) e.preventDefault();
          }}
        >
          {requireText && (
            <input
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={`Type ${requireText} to confirm`}
              aria-label="Type to confirm"
              name="confirm"
            />
          )}
          <div className={styles.dialogActions}>
            <button type="button" className={styles.btn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnDanger}`} disabled={blocked}>
              {confirmLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
