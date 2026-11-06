"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Btn } from "@/components/ui/kit";

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
          <Btn
            key={kind}
            variant="ghost"
            size="sm"
            onClick={() => copy(kind, value)}
          >
            {copied === kind ? (
              <Check className="h-4 w-4 shrink-0 text-[var(--poskoo-green)]" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4 shrink-0 text-[var(--poskoo-muted)]" aria-hidden="true" />
            )}
            {label}
          </Btn>
        ))}
      </div>
      {items.map(({ kind, value }) =>
        fallback === kind ? (
          <span key={`fallback-${kind}`} className="select-all break-all text-xs text-[var(--poskoo-ink)]">
            {value}
          </span>
        ) : null
      )}
      <span role="status" aria-live="polite" aria-atomic="true" className="min-h-[1.25rem] text-xs text-[var(--poskoo-muted)]">
        {copied === "email" && "Email copied"}
        {copied === "phone" && "Phone copied"}
        {fallback === "email" && "Copy failed, select and copy manually"}
        {fallback === "phone" && "Copy failed, select and copy manually"}
      </span>
    </div>
  );
}
