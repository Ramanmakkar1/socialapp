"use client";

import { useId, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { FONT_STYLES } from "@/lib/igFonts";

export default function FontTool() {
  const [text, setText] = useState("Your bio here");
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputId = useId();

  async function copy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      if (timer.current) clearTimeout(timer.current);
      setCopied(id);
      timer.current = setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="text-left">
      <label htmlFor={inputId} className="text-sm font-medium">Your text</label>
      <textarea id={inputId} value={text} onChange={(e) => setText(e.target.value)} rows={4}
        className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]" />
      <div className="mt-5 divide-y divide-[var(--poskoo-line)] rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)]">
        {FONT_STYLES.map((style) => (
          <div key={style.id} className="flex items-center justify-between gap-4 p-3">
            <div className="min-w-0">
              <h2 className="text-sm font-medium">{style.label}</h2>
              <p className="mt-1 whitespace-pre-wrap break-words text-[#3d3450]">{style.map(text)}</p>
            </div>
            <button type="button" onClick={() => copy(style.id, style.map(text))} disabled={!text}
              aria-label={`${copied === style.id ? "Copied" : "Copy"} ${style.label}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-1 text-xs font-medium hover:text-[var(--poskoo-violet)] disabled:opacity-50">
              {copied === style.id ? <Check className="h-3.5 w-3.5 text-[var(--poskoo-green)]" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === style.id ? "Copied" : "Copy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
