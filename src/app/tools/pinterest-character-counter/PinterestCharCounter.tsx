"use client";

import { useId, useState } from "react";
import { Check, Copy, Eraser, Type } from "lucide-react";
import t from "@/components/tools/tools.module.css";

type Field = { id: string; label: string; limit: number; sample: string };

const FIELDS: Field[] = [
  { id: "title", label: "Pin title", limit: 100, sample: "20 easy dinner ideas the whole family will actually love" },
  { id: "description", label: "Pin description", limit: 500, sample: "Save this for later: 20 easy dinner ideas the whole family will love. Weeknight meals under 30 minutes, with a full grocery list for each one. #dinnerideas #mealprep #easyrecipes" },
  { id: "alt", label: "Image alt text", limit: 500, sample: "A plate of pasta with tomato sauce and basil on a wooden table" },
  { id: "board", label: "Board name", limit: 50, sample: "Easy weeknight dinners" },
  { id: "boardDesc", label: "Board description", limit: 500, sample: "Quick and simple dinner ideas for busy weeknights, with grocery lists." },
  { id: "about", label: "Profile About", limit: 500, sample: "Sharing easy recipes, meal plans and kitchen tips for busy families." },
];

function countChars(text: string): number {
  return typeof Intl !== "undefined" && "Segmenter" in Intl
    ? Array.from(new Intl.Segmenter("en", { granularity: "grapheme" }).segment(text)).length
    : Array.from(text).length;
}

const ghostBtn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className={kpi}>
      <p className={kpiLabel}><Type className="h-3 w-3" aria-hidden="true" />{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{value.toLocaleString("en-US")}</p>
    </div>
  );
}

export default function PinterestCharCounter() {
  const [fieldId, setFieldId] = useState(FIELDS[0].id);
  const [texts, setTexts] = useState<Record<string, string>>(() =>
    Object.fromEntries(FIELDS.map((f) => [f.id, f.sample])),
  );
  const [copied, setCopied] = useState(false);
  const id = useId();

  const field = FIELDS.find((f) => f.id === fieldId) ?? FIELDS[0];
  const text = texts[field.id] ?? "";
  const { count, remaining, over } = (() => {
    const count = countChars(text);
    return { count, remaining: field.limit - count, over: count > field.limit };
  })();
  const near = !over && count >= field.limit - 20;
  const colour = over ? "text-[var(--poskoo-red)]" : near ? "text-[#8a5a00]" : "text-[var(--poskoo-green)]";
  const hex = over ? "var(--poskoo-red)" : near ? "#f5b700" : "var(--poskoo-green)";
  const used = Math.min(100, (count / field.limit) * 100);
  const verdict = !text ? "Empty" : over ? "Too long" : near ? "Almost full" : "Fits";
  const preview = text.slice(0, 50);

  function selectField(next: Field) {
    setFieldId(next.id);
    setCopied(false);
  }

  function setText(value: string) {
    setTexts((prev) => ({ ...prev, [field.id]: value }));
  }

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
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold">What are you writing?</span>
            <button type="button" className={ghostBtn} onClick={() => setText("")} disabled={!text}>
              <Eraser className="h-4 w-4" aria-hidden="true" />Clear
            </button>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Choose a Pinterest field">
            {FIELDS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={f.id === field.id}
                className={`${t.filter} text-sm`}
                onClick={() => selectField(f)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <textarea
            id={id}
            aria-describedby={`${id}-status`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={9}
            placeholder={`Write or paste your ${field.label.toLowerCase()}…`}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
          />

          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="tabular-nums text-[#5f5873]">
              <strong className="font-semibold text-[var(--poskoo-ink)]">{count.toLocaleString("en-US")}</strong>
              {" / "}{field.limit.toLocaleString("en-US")} characters
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
            aria-label={`${field.label} length used`}
            aria-valuemin={0}
            aria-valuemax={field.limit}
            aria-valuenow={Math.min(count, field.limit)}
          >
            <div className="h-full rounded-full motion-safe:transition-all" style={{ width: `${used}%`, background: hex }} />
          </div>
          {field.id === "description" && text ? (
            <p className="mt-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-sm text-[#3d3450]">
              <span className="font-semibold text-[var(--poskoo-ink)]">Feed preview:</span>{" "}
              {preview}{text.length > 50 && "…"}
              <span className="block text-xs text-[#5f5873]">Feeds often show only the opening line, so put your best words first.</span>
            </p>
          ) : null}
          <p className="mt-2 text-xs text-[#5f5873]">
            Characters are counted as graphemes, so most emoji count as 1. The bar turns red when you pass the {field.label.toLowerCase()} limit.
          </p>
        </div>

        <aside aria-label="Pinterest length result" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
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
              <p className="text-xs text-[#3d3450] tabular-nums">{Math.round((count / field.limit) * 100)}% of the {field.label.toLowerCase()} limit</p>
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
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <CountCard label="Characters" value={count} />
        <CountCard label="Remaining" value={Math.max(0, remaining)} />
      </div>
    </div>
  );
}
