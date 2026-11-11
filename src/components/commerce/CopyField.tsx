"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import ui from "@/components/ui/ui.module.css";
import styles from "./commerce.module.css";

/** Read-only link with a Copy button (falls back to selecting the text). */
export default function CopyField({ id, label, value }: { id: string; label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.getElementById(id) as HTMLInputElement | null;
      input?.select();
    }
  }
  return (
    <div className={ui.field}>
      <label htmlFor={id} className={ui.label}>{label}</label>
      <div className={styles.copyRow}>
        <input id={id} className={ui.input} value={value} readOnly onFocus={(e) => e.currentTarget.select()} />
        <button type="button" onClick={copy} className={`${ui.btn} ${ui.btnDark} ${ui.sm}`}>
          {copied ? <Check aria-hidden="true" size={16} /> : <Copy aria-hidden="true" size={16} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <span className="sr-only" aria-live="polite">{copied ? "Link copied" : ""}</span>
    </div>
  );
}
