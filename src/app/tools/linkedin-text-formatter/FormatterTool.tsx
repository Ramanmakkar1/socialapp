"use client";

import { useId, useRef, useState } from "react";
import { Check, Copy, Eraser, Globe2, MessageSquare, Repeat2, ThumbsUp } from "lucide-react";
import { FONT_STYLES } from "@/lib/igFonts";

const LINKEDIN_STYLE_IDS = new Set(["bold", "italic", "bold-italic", "sans-bold", "monospace"]);
const LINKEDIN_POST_LIMIT = 3000;

const ghostBtn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3";
const kpiLabel = "text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

function bulletList(text: string) {
  return text.split("\n").map((line) => line.trim() ? `• ${line}` : line).join("\n");
}

export default function FormatterTool() {
  const [text, setText] = useState("Your LinkedIn post here");
  const [copied, setCopied] = useState<string | null>(null);
  const [active, setActive] = useState("bold");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputId = useId();
  const characterCount = Array.from(text).length;
  const styles = FONT_STYLES.filter((style) => LINKEDIN_STYLE_IDS.has(style.id));
  const outputs = [
    ...styles.map((style) => ({ id: style.id, label: style.label, value: style.map(text) })),
    { id: "bullet-list", label: "Bullet list", value: bulletList(text) },
  ];
  const current = outputs.find((o) => o.id === active) ?? outputs[0];
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split("\n").length : 0;
  const over = characterCount > LINKEDIN_POST_LIMIT;
  const used = Math.min(100, (characterCount / LINKEDIN_POST_LIMIT) * 100);

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
    <div className="min-w-0 space-y-5 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0 space-y-5">
          {/* Input */}
          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
            <div className="flex items-center justify-between gap-4">
              <label htmlFor={inputId} className="text-sm font-semibold">Your text</label>
              <button type="button" className={ghostBtn} onClick={() => setText("")} disabled={!text}>
                <Eraser className="h-4 w-4" aria-hidden="true" />Clear
              </button>
            </div>
            <textarea id={inputId} value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="Type or paste your LinkedIn post…"
              className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]" />
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
              <div className="h-full rounded-full motion-safe:transition-all" style={{ width: `${used}%`, background: over ? "var(--poskoo-red)" : "var(--poskoo-violet)" }} />
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className={kpi}>
                <p className={kpiLabel}>Characters</p>
                <p aria-live="polite" className={`mt-0.5 text-lg font-bold tabular-nums ${over ? "text-[var(--poskoo-red)]" : "text-[var(--poskoo-ink)]"}`}>
                  {characterCount.toLocaleString("en-US")} <span className="text-xs font-medium text-[#5f5873]">/ 3,000</span>
                </p>
              </div>
              <div className={kpi}>
                <p className={kpiLabel}>Words</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums">{words.toLocaleString("en-US")}</p>
              </div>
              <div className={kpi}>
                <p className={kpiLabel}>Lines</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums">{lines.toLocaleString("en-US")}</p>
              </div>
            </div>
          </div>

          {/* Outputs */}
          {!text ? (
            <p className="rounded-2xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-6 text-center text-sm text-[#5f5873]">
              Type some text above to see it in every LinkedIn-safe style.
            </p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2" aria-label="Formatted versions">
              {outputs.map((output) => {
                const on = output.id === current.id;
                return (
                  <li key={output.id} className={`flex min-w-0 flex-col rounded-2xl border bg-[var(--poskoo-card)] p-3 transition ${on ? "border-[var(--poskoo-violet)] shadow-[0_0_0_3px_var(--poskoo-band)]" : "border-[var(--poskoo-line)]"}`}>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">{output.label}</h3>
                      <button type="button" onClick={() => copy(output.id, output.value)} disabled={!text}
                        aria-label={`${copied === output.id ? "Copied" : "Copy"} ${output.label}`}
                        className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-medium disabled:opacity-50 ${copied === output.id ? "border-[var(--poskoo-green)] bg-[var(--poskoo-green)]/10" : "border-[var(--poskoo-line)] hover:border-[var(--poskoo-ink)]"}`}>
                        {copied === output.id ? <Check className="h-3.5 w-3.5 text-[var(--poskoo-green)]" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                        {copied === output.id ? "Copied" : "Copy"}
                      </button>
                    </div>
                    <p className="mt-2 line-clamp-4 whitespace-pre-wrap break-words text-[#3d3450]">{output.value}</p>
                    <button type="button" aria-pressed={on} onClick={() => setActive(output.id)}
                      className={`mt-auto pt-2 text-left text-xs font-semibold ${on ? "text-[var(--poskoo-violet)]" : "text-[#5f5873] hover:text-[var(--poskoo-ink)]"}`}>
                      {on ? "Showing in preview" : "Preview this style"}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Preview + primary action */}
        <aside aria-label="LinkedIn preview" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <button type="button" disabled={!text} onClick={() => copy(`main:${current.id}`, current.value)}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] disabled:opacity-40">
            {copied === `main:${current.id}` ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied === `main:${current.id}` ? "Copied" : `Copy ${current.label.toLowerCase()}`}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
          <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 flex-none rounded-full bg-[linear-gradient(135deg,var(--poskoo-violet),var(--poskoo-mint))]" aria-hidden="true" />
              <span className="min-w-0 text-xs leading-tight">
                <b className="block text-[var(--poskoo-ink)]">Your Name</b>
                <span className="inline-flex items-center gap-1 text-[#5f5873]">Now · <Globe2 className="h-3 w-3" aria-hidden="true" /></span>
              </span>
            </div>
            {text ? (
              <p className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed">{current.value}</p>
            ) : (
              <p className="mt-2 rounded-lg border border-dashed border-[var(--poskoo-line)] p-3 text-center text-xs text-[#5f5873]">Your formatted post appears here.</p>
            )}
            <div className="mt-3 flex justify-between border-t border-[var(--poskoo-line)] pt-2 text-xs text-[#5f5873]" aria-hidden="true">
              <span className="inline-flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" />Like</span>
              <span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />Comment</span>
              <span className="inline-flex items-center gap-1"><Repeat2 className="h-3.5 w-3.5" />Repost</span>
            </div>
          </div>
          <p className="text-xs text-[#5f5873]">A simple mockup. Styled Unicode letters may not be read aloud by screen readers, so use them for a few words, not whole posts.</p>
        </aside>
      </div>
    </div>
  );
}
