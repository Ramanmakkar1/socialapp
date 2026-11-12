"use client";

import { useId, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { FONT_STYLES } from "@/lib/igFonts";

const LINKEDIN_STYLE_IDS = new Set(["bold", "italic", "bold-italic", "sans-bold", "monospace"]);
const LINKEDIN_POST_LIMIT = 3000;

function bulletList(text: string) {
  return text.split("\n").map((line) => line.trim() ? `• ${line}` : line).join("\n");
}

export default function FormatterTool() {
  const [text, setText] = useState("Your LinkedIn post here");
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputId = useId();
  const characterCount = Array.from(text).length;
  const styles = FONT_STYLES.filter((style) => LINKEDIN_STYLE_IDS.has(style.id));
  const outputs = [
    ...styles.map((style) => ({ id: style.id, label: style.label, value: style.map(text) })),
    { id: "bullet-list", label: "Bullet list", value: bulletList(text) },
  ];

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
      <div className="flex items-center justify-between gap-4">
        <label htmlFor={inputId} className="text-sm font-medium">Your text</label>
        <span
          aria-live="polite"
          className={`text-sm tabular-nums ${characterCount > LINKEDIN_POST_LIMIT ? "font-semibold text-[var(--poskoo-coral)]" : "text-[var(--poskoo-muted)]"}`}
        >
          {characterCount.toLocaleString("en-US")} / 3,000
        </span>
      </div>
      <textarea id={inputId} value={text} onChange={(e) => setText(e.target.value)} rows={4}
        className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]" />
      <div className="mt-5 divide-y divide-[var(--poskoo-line)] rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)]">
        {outputs.map((output) => (
          <div key={output.id} className="flex items-center justify-between gap-4 p-3">
            <div className="min-w-0">
              <h3 className="text-sm font-medium">{output.label}</h3>
              <p className="mt-1 whitespace-pre-wrap break-words text-[#3d3450]">{output.value}</p>
            </div>
            <button type="button" onClick={() => copy(output.id, output.value)} disabled={!text}
              aria-label={`${copied === output.id ? "Copied" : "Copy"} ${output.label}`}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-1 text-xs font-medium hover:text-[var(--poskoo-violet)] disabled:opacity-50">
              {copied === output.id ? <Check className="h-3.5 w-3.5 text-[var(--poskoo-green)]" /> : <Copy className="h-3.5 w-3.5" />}
              {copied === output.id ? "Copied" : "Copy"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
