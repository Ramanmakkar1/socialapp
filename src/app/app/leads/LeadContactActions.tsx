"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Kind = "email" | "phone";

type Props = {
  email?: string | null;
  phone?: string | null;
};

export default function LeadContactActions({ email, phone }: Props) {
  const [copied, setCopied] = useState<Kind | null>(null);
  const [fallback, setFallback] = useState<Kind | null>(null);

  const items: { kind: Kind; value: string; label: string }[] = [];
  const trimmedEmail = email?.trim();
  const trimmedPhone = phone?.trim();
  if (trimmedEmail) items.push({ kind: "email", value: trimmedEmail, label: "Copy email" });
  if (trimmedPhone) items.push({ kind: "phone", value: trimmedPhone, label: "Copy phone" });

  if (items.length === 0) return null;

  async function copy(kind: Kind, value: string) {
    setFallback(null);
    setCopied(null);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        setCopied(kind);
        window.setTimeout(() => setCopied((current) => (current === kind ? null : current)), 2000);
        return;
      }
    } catch {
      // manual fallback below
    }
    setFallback(kind);
  }

  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-2">
        {items.map(({ kind, value, label }) => (
          <button
            key={kind}
            type="button"
            onClick={() => copy(kind, value)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-ink hover:bg-surface-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {copied === kind ? (
              <Check className="h-4 w-4 shrink-0 text-ok" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4 shrink-0 text-ink-2" aria-hidden="true" />
            )}
            {label}
          </button>
        ))}
      </div>
      {items.map(({ kind, value }) =>
        fallback === kind ? (
          <span key={`fallback-${kind}`} className="select-all break-all text-xs text-ink-2">
            {value}
          </span>
        ) : null
      )}
      <span role="status" aria-live="polite" aria-atomic="true" className="min-h-[1.25rem] text-xs text-ink-2">
        {copied === "email" && "Email copied"}
        {copied === "phone" && "Phone copied"}
        {fallback === "email" && "Copy failed, select and copy manually"}
        {fallback === "phone" && "Copy failed, select and copy manually"}
      </span>
    </div>
  );
}
