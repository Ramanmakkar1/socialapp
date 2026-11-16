"use client";

import { useId, useMemo, useState } from "react";
import { AlertTriangle, Check, CheckCircle2, Copy, PenLine, Type } from "lucide-react";
import { PLATFORM_LIMITS, countChars } from "@/lib/captionLimits";
import { countLines, formatForInstagram, hasCollapsedSpacing, type BlankLineStyle } from "@/lib/lineBreaks";

const SAMPLE =
  "New drop is live ✨\n\nComment GUIDE and we'll DM you the styling guide.\n\nThanks for the support!\n\n#fashion #smallbusiness";

const igMax = PLATFORM_LIMITS.instagram.max;

const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

const STYLES: { value: BlankLineStyle; label: string }[] = [
  { value: "invisible", label: "Invisible (Braille blank)" },
  { value: "dot", label: "Dot (.)" },
];

export default function LineBreakTool() {
  const [text, setText] = useState(SAMPLE);
  const [blankLine, setBlankLine] = useState<BlankLineStyle>("invisible");
  const [copied, setCopied] = useState(false);
  const inputId = useId();
  const styleId = useId();

  const formatted = useMemo(() => formatForInstagram(text, { blankLine }), [text, blankLine]);
  const chars = countChars(formatted);
  const overBy = igMax !== null && chars > igMax ? chars - igMax : 0;
  const needsFix = hasCollapsedSpacing(text);
  const lines = countLines(formatted);
  // Blank lines in the draft that the formatter fills with the chosen character.
  const blanks = formatted ? text.replace(/\r\n?/g, "\n").split("\n").filter((l) => l.replace(/ +$/g, "") === "").length : 0;
  const pct = igMax ? Math.min(100, (chars / igMax) * 100) : 0;

  async function copy() {
    if (!formatted) return;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}><Type className="h-3 w-3" aria-hidden="true" />Characters (formatted)</p>
          <p className={`mt-0.5 text-xl font-bold tabular-nums ${overBy > 0 ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-ink)]"}`}>
            {chars.toLocaleString("en-US")}
            {igMax !== null && <span className="text-base font-medium text-[#5f5873]"> / {igMax.toLocaleString("en-US")}</span>}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
            <i className="block h-full rounded-full" style={{ width: `${pct}%`, background: overBy > 0 ? "var(--poskoo-coral)" : "var(--poskoo-green)" }} />
          </div>
          {overBy > 0 && (
            <p className="mt-1.5 text-xs font-medium text-[var(--poskoo-coral)]">
              {overBy.toLocaleString("en-US")} characters over the Instagram limit.
            </p>
          )}
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Lines</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{lines}</p>
          <p className="mt-1 text-xs text-[#3d3450]">In the formatted caption.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Blank lines kept</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{blanks}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Filled with {blankLine === "dot" ? "a dot" : "an invisible blank"}.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Spacing</p>
          <p className={`mt-0.5 text-xl font-bold ${needsFix ? "text-[#a8410f]" : "text-[var(--poskoo-ink)]"}`}>{!text.trim() ? "—" : needsFix ? "Fixed" : "Clean"}</p>
          <p className="mt-1 text-xs text-[#3d3450]">{needsFix ? "Draft would collapse; output won't." : "Nothing would collapse."}</p>
        </div>
      </div>
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Input */}
        <div className="min-w-0 space-y-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <fieldset className="min-w-0 border-0 p-0">
            <legend id={styleId} className="text-sm font-semibold">
              Blank line style
            </legend>
            <div className="mt-2 grid grid-cols-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1" role="radiogroup" aria-labelledby={styleId}>
              {STYLES.map((s) => (
                <label key={s.value} className={`flex min-h-10 cursor-pointer items-center justify-center rounded-lg px-2 text-center text-[13px] font-medium leading-tight has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--poskoo-violet)] ${blankLine === s.value ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"}`}>
                  <input
                    type="radio"
                    name="blankLine"
                    checked={blankLine === s.value}
                    onChange={() => setBlankLine(s.value)}
                    className="sr-only"
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="min-w-0">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor={inputId} className="text-sm font-semibold">
                Your caption
              </label>
              <button type="button" onClick={() => setText(text ? "" : SAMPLE)} className="min-h-10 rounded-lg px-2 text-sm font-medium text-[var(--poskoo-violet)] hover:bg-[var(--poskoo-band)]">
                {text ? "Clear" : "Load sample"}
              </button>
            </div>
            <textarea
              id={inputId}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={9}
              placeholder="Paste or type your caption with blank lines…"
              className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
            />
          </div>

          {needsFix ? (
            <p className="flex items-start gap-2 rounded-xl border border-[var(--poskoo-coral)]/30 bg-[var(--poskoo-coral)]/10 p-3 text-sm text-[#a8410f]">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
              <span>This caption has blank lines or trailing spaces that Instagram may collapse. Copy the formatted output into Instagram.</span>
            </p>
          ) : text.trim() ? (
            <p className="flex items-center gap-2 rounded-xl border border-[var(--poskoo-green)]/30 bg-[var(--poskoo-green)]/10 p-3 text-sm text-[#146b43]">
              <CheckCircle2 className="h-4 w-4 flex-none" aria-hidden="true" />
              No collapsing spacing found.
            </p>
          ) : null}
        </div>

        {/* Action + preview */}
        <aside aria-labelledby={`${inputId}-prev`} className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <button
            type="button"
            onClick={copy}
            disabled={!formatted}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] disabled:opacity-40"
          >
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Formatted caption copied to clipboard" : ""}</span>

          <h3 id={`${inputId}-prev`} className="text-sm font-semibold tracking-normal">Instagram preview</h3>
          <div className="overflow-hidden rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)]">
            <div className="flex items-center gap-2 p-3">
              <span className="h-8 w-8 rounded-full bg-[conic-gradient(var(--poskoo-violet),var(--poskoo-pink),var(--poskoo-peach),var(--poskoo-violet))] p-[2px]" aria-hidden="true"><span className="block h-full w-full rounded-full border-2 border-white bg-[var(--poskoo-band)]" /></span>
              <span className="text-sm font-semibold">yourbrand</span>
            </div>
            <div className="aspect-[4/3] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--poskoo-violet)_25%,transparent),color-mix(in_srgb,var(--poskoo-coral)_25%,transparent))]" />
            {formatted ? (
              <p className="max-h-72 overflow-y-auto whitespace-pre-wrap break-words p-3 text-sm leading-5" aria-live="polite">
                <span className="font-semibold">yourbrand</span> {formatted}
              </p>
            ) : (
              <div className="m-3 grid place-items-center gap-1.5 rounded-lg border border-dashed border-[var(--poskoo-line)] p-4 text-center text-xs text-[#5f5873]" aria-live="polite">
                <PenLine className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden="true" />
                Your formatted caption appears here
              </div>
            )}
          </div>
          <p className="text-xs text-[var(--poskoo-muted)]">
            Paste the copied text into the Instagram caption field. Blank lines use an invisible character or a dot so
            spacing stays visible in the app.
          </p>
        </aside>
      </div>

    </div>
  );
}
