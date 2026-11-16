"use client";

import { useId, useRef, useState } from "react";
import { Check, Copy, Eye, Type, X } from "lucide-react";
import { FONT_STYLES } from "@/lib/igFonts";

const PLATFORM_LIMITS = {
  instagram: { limit: 150, label: "Instagram bio" },
  x: { limit: 160, label: "X bio" },
  facebook: { limit: 101, label: "Facebook intro" },
} as const;
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

export default function FontTool({
  platform = "instagram",
  bioLimit,
}: { platform?: keyof typeof PLATFORM_LIMITS | string; bioLimit?: number } = {}) {
  const platformConfig = PLATFORM_LIMITS[platform as keyof typeof PLATFORM_LIMITS];
  const limit = bioLimit ?? platformConfig?.limit ?? PLATFORM_LIMITS.instagram.limit;
  const label = platformConfig?.label ?? `${platform} bio`;
  const [text, setText] = useState("Your bio here");
  const [copied, setCopied] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState(FONT_STYLES[0].id);
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

  const preview = FONT_STYLES.find((s) => s.id === previewId) ?? FONT_STYLES[0];
  const styled = preview.map(text);
  const chars = Array.from(text).length;
  const lines = text ? text.split("\n").length : 0;
  const styledLen = styled.length; // UTF-16 length, which is what most counters (and the bio box) measure
  const over = styledLen > limit;

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Input */}
      <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
        <div className="flex items-center justify-between gap-2">
          <label htmlFor={inputId} className="flex items-center gap-1.5 text-sm font-semibold">
            <Type className="h-4 w-4 text-[var(--poskoo-violet)]" aria-hidden="true" />
            Your text
          </label>
          <button
            type="button"
            onClick={() => setText("")}
            disabled={!text}
            className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-medium text-[var(--poskoo-violet)] hover:bg-[var(--poskoo-band)] disabled:opacity-40"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Clear
          </button>
        </div>
        <textarea id={inputId} value={text} onChange={(e) => setText(e.target.value)} rows={3}
          className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}>Font styles</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{FONT_STYLES.length}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Unicode styles, copy and paste.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Characters</p>
          <p aria-live="polite" className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{chars}</p>
          <p className="mt-1 text-xs text-[#3d3450]">{lines} {lines === 1 ? "line" : "lines"} of plain text.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>{preview.label} length</p>
          <p className={`mt-0.5 text-xl font-bold tabular-nums ${over ? "text-[var(--poskoo-red)]" : "text-[var(--poskoo-ink)]"}`}>
            {styledLen}
            <span className="text-base font-medium text-[#5f5873]"> / {limit}</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
            <i className="block h-full rounded-full" style={{ width: `${Math.min(100, (styledLen / limit) * 100)}%`, background: over ? "var(--poskoo-red)" : "var(--poskoo-violet)" }} />
          </div>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>{label} fit</p>
          <p className={`mt-0.5 text-xl font-bold ${over ? "text-[var(--poskoo-red)]" : "text-[var(--poskoo-green)]"}`}>{!text ? "—" : over ? "Too long" : "Fits"}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Styled letters can count as 2 characters.</p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Styles */}
        {!text ? (
          <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-[var(--poskoo-line)] px-4 py-12 text-center text-sm text-[#3d3450]">
            <Type className="h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden="true" />
            <p>Type something above to see it in every font.</p>
          </div>
        ) : (
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {FONT_STYLES.map((style) => {
              const on = style.id === preview.id;
              return (
                <div key={style.id}
                  className={`flex min-w-0 flex-col gap-3 rounded-2xl border p-3.5 transition-colors ${on ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-band)]/60" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)]"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-[#5f5873]">{style.label}</h2>
                    <button type="button" onClick={() => setPreviewId(style.id)} aria-pressed={on} aria-label={`Preview ${style.label} in ${label}`}
                      className={`inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium ${on ? "text-[var(--poskoo-violet)]" : "text-[#5f5873] hover:bg-[var(--poskoo-band)]"}`}>
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      {on ? "Previewing" : "Preview"}
                    </button>
                  </div>
                  <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-lg leading-snug text-[var(--poskoo-ink)]">{style.map(text)}</p>
                  <button type="button" onClick={() => copy(style.id, style.map(text))} disabled={!text}
                    aria-label={`${copied === style.id ? "Copied" : "Copy"} ${style.label}`}
                    className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition disabled:opacity-50 ${copied === style.id ? "border-[var(--poskoo-green)] bg-[var(--poskoo-green)]/10" : "border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] hover:border-[var(--poskoo-ink)]"}`}>
                    {copied === style.id ? <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied === style.id ? "Copied" : "Copy"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Bio preview + primary copy */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <p className="text-sm font-semibold">{label} preview <span className="font-normal text-[#5f5873]">· {preview.label}</span></p>
          <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-sm" aria-hidden="true">
            <div className="flex items-center gap-3">
              <span className="h-12 w-12 flex-none rounded-full bg-[conic-gradient(var(--poskoo-violet),var(--poskoo-pink),var(--poskoo-peach),var(--poskoo-violet))] p-[2px]">
                <span className="block h-full w-full rounded-full border-2 border-white bg-[var(--poskoo-band)]" />
              </span>
              <div className="grid flex-1 grid-cols-3 gap-2">
                {[0, 1, 2].map((n) => (
                  <span key={n} className="space-y-1">
                    <i className="mx-auto block h-2.5 w-6 rounded bg-[var(--poskoo-line)]" />
                    <i className="mx-auto block h-1.5 w-10 rounded bg-[var(--poskoo-line)]/70" />
                  </span>
                ))}
              </div>
            </div>
            <p className="mt-2 text-xs font-semibold">your_account</p>
            {text ? (
              <p className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap break-words leading-snug">{styled}</p>
            ) : (
              <p className="mt-1 rounded-lg border border-dashed border-[var(--poskoo-line)] p-2 text-center text-xs text-[#5f5873]">Your styled bio shows here.</p>
            )}
          </div>
          <button type="button" onClick={() => copy(`aside-${preview.id}`, styled)} disabled={!text}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] disabled:opacity-40 disabled:hover:translate-y-0">
            {copied === `aside-${preview.id}` ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied === `aside-${preview.id}` ? "Copied" : `Copy ${preview.label.toLowerCase()}`}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
          <p className="text-xs text-[#5f5873]">Some screen readers read styled letters one by one. Keep key info in plain text.</p>
        </aside>
      </div>
    </div>
  );
}
