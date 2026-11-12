"use client";

import { useId, useState } from "react";
import { AlignLeft, Check, Copy, Eraser, Hash, Type } from "lucide-react";
import { countLinkedIn, LINKEDIN_LIMITS, type LinkedInField } from "@/lib/linkedinCharCount";

const SAMPLE = "Your opening lines decide whether someone keeps reading.\n\nPut the useful idea first, then add the detail your network needs.";

const FIELD_OPTIONS: { value: Exclude<LinkedInField, "article_headline">; label: string }[] = [
  { value: "post", label: "Post" },
  { value: "comment", label: "Comment" },
  { value: "headline", label: "Headline" },
  { value: "about", label: "About" },
];

const ghostBtn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

function CountCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Type }) {
  return (
    <div className={kpi}>
      <p className={kpiLabel}><Icon className="h-3 w-3" aria-hidden="true" />{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{value.toLocaleString("en-US")}</p>
    </div>
  );
}

export default function LinkedInCharCounter() {
  const [text, setText] = useState(SAMPLE);
  const [field, setField] = useState<(typeof FIELD_OPTIONS)[number]["value"]>("post");
  const [copied, setCopied] = useState(false);
  const id = useId();
  const count = countLinkedIn(text);
  const limit = LINKEDIN_LIMITS[field];
  const remaining = limit - count.chars;
  const over = count.overLimit[field];
  const near = !over && count.chars >= limit - 20;
  const colour = over ? "text-[var(--poskoo-red)]" : near ? "text-[#8a5a00]" : "text-[var(--poskoo-green)]";
  const hex = over ? "var(--poskoo-red)" : near ? "#f5b700" : "var(--poskoo-green)";
  const used = Math.min(100, (count.chars / limit) * 100);
  const verdict = !text ? "Empty" : over ? "Too long" : near ? "Almost full" : "Fits";
  const preview = [...text].slice(0, count.seeMoreCut).join("");
  const fieldLabel = FIELD_OPTIONS.find((option) => option.value === field)?.label ?? "Post";

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <label htmlFor={`${id}-field`} className="text-sm font-semibold">Field type</label>
          <select
            id={`${id}-field`}
            value={field}
            onChange={(event) => setField(event.target.value as (typeof FIELD_OPTIONS)[number]["value"])}
            className="mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium text-[var(--poskoo-ink)] outline-none focus:border-[var(--poskoo-violet)]"
          >
            {FIELD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label} ({LINKEDIN_LIMITS[option.value].toLocaleString("en-US")})</option>
            ))}
          </select>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={id} className="text-sm font-semibold">Your LinkedIn {fieldLabel.toLowerCase()}</label>
            <button type="button" className={ghostBtn} onClick={() => setText("")} disabled={!text}>
              <Eraser className="h-4 w-4" aria-hidden="true" />Clear
            </button>
          </div>
          <textarea
            id={id}
            aria-describedby={`${id}-status`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={9}
            placeholder={`Write or paste your LinkedIn ${fieldLabel.toLowerCase()}…`}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
          />

          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="tabular-nums text-[#5f5873]">
              <strong className="font-semibold text-[var(--poskoo-ink)]">{count.chars.toLocaleString("en-US")}</strong>
              {" / "}{limit.toLocaleString("en-US")} characters
            </span>
            <span id={`${id}-status`} aria-live="polite" className={`font-semibold tabular-nums ${colour}`}>
              {over
                ? `${Math.abs(remaining).toLocaleString("en-US")} over the limit`
                : `${remaining.toLocaleString("en-US")} characters left`}
            </span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--poskoo-line)]"
            role="progressbar"
            aria-label={`LinkedIn ${fieldLabel.toLowerCase()} length used`}
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-valuenow={Math.min(count.chars, limit)}
          >
            <div className="h-full rounded-full motion-safe:transition-all" style={{ width: `${used}%`, background: hex }} />
          </div>
          <p className="mt-2 text-xs text-[#5f5873]">
            Characters are counted by code point, so an emoji such as 😀 counts as 1. The bar turns red above the selected limit.
          </p>
        </div>

        <aside aria-label="LinkedIn length result" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 flex-none rounded-full" style={{ background: `conic-gradient(${hex} ${used * 3.6}deg, var(--poskoo-line) 0deg)` }} aria-hidden="true">
              <span className="absolute inset-[10px] grid place-items-center rounded-full bg-[var(--poskoo-card)] text-center">
                <span>
                  <b className={`block text-xl leading-none tabular-nums ${colour}`}>{remaining.toLocaleString("en-US")}</b>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#5f5873]">left</span>
                </span>
              </span>
            </div>
            <div className="min-w-0">
              <p className={kpiLabel}>Status</p>
              <p className="text-2xl font-bold text-[var(--poskoo-ink)]">{verdict}</p>
              <p className="text-xs text-[#3d3450] tabular-nums">{Math.round((count.chars / limit) * 100)}% of the {fieldLabel} limit</p>
            </div>
          </div>
          <button
            type="button"
            onClick={copy}
            disabled={!text}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40"
          >
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>

          <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-sm">
            <p className="font-semibold text-[var(--poskoo-ink)]">Preview before See more</p>
            {text ? (
              <p className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed">
                {preview}
                {count.seeMoreCut < count.chars && <span className="font-medium text-[var(--poskoo-violet)]">… See more</span>}
              </p>
            ) : (
              <p className="mt-2 rounded-lg border border-dashed border-[var(--poskoo-line)] p-3 text-center text-xs text-[#5f5873]">Start typing to preview your post.</p>
            )}
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CountCard label="Characters" value={count.chars} icon={Type} />
        <CountCard label="Words" value={count.words} icon={Hash} />
        <CountCard label="Lines" value={count.lines} icon={AlignLeft} />
        <CountCard label="Remaining" value={remaining} icon={Type} />
      </div>
    </div>
  );
}
