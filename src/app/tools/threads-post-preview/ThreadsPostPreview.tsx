"use client";

import { useId, useState } from "react";
import { Check, Copy, Heart, MessageCircle, Repeat2, RotateCcw, Send } from "lucide-react";
import { PLATFORM_LIMITS, countChars } from "@/lib/captionLimits";

const MAX = PLATFORM_LIMITS.threads.max ?? 500;
const SAMPLE =
  "We just shipped a faster way to plan your week 🎉\n\nWhat is one small thing you are proud of today?";

const ghostBtn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3";
const kpiLabel = "text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

export default function ThreadsPostPreview() {
  const [text, setText] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const id = useId();

  const count = countChars(text);
  const remaining = MAX - count;
  const over = remaining < 0;
  const near = !over && remaining <= 50;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const lines = text ? text.split("\n").length : 0;
  const used = Math.min(100, (count / MAX) * 100);
  const hex = over ? "var(--poskoo-coral)" : near ? "#f5b700" : "var(--poskoo-green)";

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function reset() {
    setText("");
    setCopied(false);
  }

  return (
    <div className="min-w-0 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        {/* Input */}
        <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={id} className="text-sm font-semibold">Your Threads post</label>
            <button type="button" onClick={reset} disabled={!text} aria-label="Reset Threads post text" className={ghostBtn}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset
            </button>
          </div>

          <textarea
            id={id}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Write or paste your Threads post…"
            aria-describedby={`${id}-status`}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="tabular-nums text-[#3d3450]">
              <strong className="font-semibold text-[var(--poskoo-ink)]">{count.toLocaleString("en-US")}</strong> /{" "}
              {MAX.toLocaleString("en-US")} characters
            </span>
            <span
              id={`${id}-status`}
              aria-live="polite"
              className={`font-semibold tabular-nums ${over || near ? "text-[#b2401a]" : "text-[var(--poskoo-green)]"}`}
            >
              {over
                ? `${Math.abs(remaining).toLocaleString("en-US")} over the limit`
                : `${remaining.toLocaleString("en-US")} characters left`}
            </span>
          </div>

          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--poskoo-line)]"
            role="progressbar"
            aria-label="Threads post length used"
            aria-valuemin={0}
            aria-valuemax={MAX}
            aria-valuenow={Math.min(count, MAX)}
          >
            <div className="h-full rounded-full motion-safe:transition-all" style={{ width: `${used}%`, background: hex }} />
          </div>
          <p className="mt-2 text-xs text-[#5f5873]">
            Threads allows up to {MAX.toLocaleString("en-US")} characters per post. Emoji, spaces and line breaks all count.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className={kpi}>
              <p className={kpiLabel}>Used</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">{Math.round((count / MAX) * 100)}%</p>
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

        {/* Preview + primary action */}
        <aside aria-labelledby={`${id}-prev`} className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <button
            type="button"
            onClick={copy}
            disabled={!text}
            aria-label="Copy Threads post text"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40"
          >
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>

          <h3 id={`${id}-prev`} className="text-sm font-semibold">Mobile preview</h3>
          <div className="mx-auto w-full max-w-[20rem] overflow-hidden rounded-[2rem] border-[6px] border-[var(--poskoo-ink)] bg-[var(--poskoo-card)] p-4 shadow-[var(--poskoo-shadow-float)]">
            <div className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="h-9 w-9 flex-none rounded-full bg-[linear-gradient(135deg,var(--poskoo-violet),var(--poskoo-coral))]" aria-hidden="true" />
                <span className="mt-2 w-0.5 flex-1 rounded-full bg-[var(--poskoo-line)]" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">yourbrand <span className="font-normal text-[#5f5873]">· just now</span></p>
                <p className="mt-1 min-h-24 whitespace-pre-wrap break-words text-sm leading-5">
                  {text || <span className="text-[#5f5873]">Your post appears here</span>}
                </p>
                <div className="mt-3 flex items-center gap-4 text-[#5f5873]">
                  <Heart className="h-4 w-4" aria-hidden="true" />
                  <MessageCircle className="h-4 w-4" aria-hidden="true" />
                  <Repeat2 className="h-4 w-4" aria-hidden="true" />
                  <Send className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
            </div>
            {over && (
              <p className="mt-3 rounded-lg bg-[var(--poskoo-coral)]/12 px-2 py-1.5 text-xs font-medium text-[#8a2f12]">
                Threads will not publish this post until it is {Math.abs(remaining).toLocaleString("en-US")} characters shorter.
              </p>
            )}
          </div>
          <p className="text-center text-xs text-[#5f5873]">
            A simple mockup. The real Threads app may wrap text differently.
          </p>
        </aside>
      </div>
    </div>
  );
}
