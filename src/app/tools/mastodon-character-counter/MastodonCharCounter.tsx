"use client";

import { useId, useState } from "react";
import { Check, Copy, Eraser, Type } from "lucide-react";
import { MASTODON_DEFAULT_MAX, countMastodon } from "@/lib/mastodonCharCount";

const SAMPLE = "A clear idea gives people a reason to join the conversation ✨\n\nWrite your opening, add the useful detail, then check your post before publishing. #Mastodon";

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

export default function MastodonCharCounter() {
  const [text, setText] = useState(SAMPLE);
  const [maxText, setMaxText] = useState(String(MASTODON_DEFAULT_MAX));
  const [copied, setCopied] = useState(false);
  const id = useId();
  const parsedMax = Number.parseInt(maxText, 10);
  const max = Number.isFinite(parsedMax) && parsedMax > 0 ? parsedMax : MASTODON_DEFAULT_MAX;
  const { count, remaining, over, links, mentions } = countMastodon(text, max);
  const near = !over && count >= max - 20;
  const colour = over ? "text-[var(--poskoo-red)]" : near ? "text-[#8a5a00]" : "text-[var(--poskoo-green)]";
  const hex = over ? "var(--poskoo-red)" : near ? "#f5b700" : "var(--poskoo-green)";
  const used = Math.min(100, (count / max) * 100);
  const verdict = !text ? "Empty" : over ? "Too long" : near ? "Almost full" : "Fits";

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
            <label htmlFor={id} className="text-sm font-semibold">Your Mastodon post</label>
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
            placeholder="Write or paste your Mastodon post…"
            className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
          />

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label htmlFor={`${id}-max`} className="text-sm font-semibold">Your server&apos;s limit</label>
            <input
              id={`${id}-max`}
              type="number"
              inputMode="numeric"
              min={1}
              value={maxText}
              onChange={(event) => setMaxText(event.target.value)}
              className="min-h-10 w-24 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm tabular-nums outline-none focus:border-[var(--poskoo-violet)]"
            />
            <span className="text-xs text-[#5f5873]">Default 500. Some servers allow more.</span>
          </div>

          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="tabular-nums text-[#5f5873]">
              <strong className="font-semibold text-[var(--poskoo-ink)]">{count.toLocaleString("en-US")}</strong>
              {" / "}{max.toLocaleString("en-US")} characters
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
            aria-label="Mastodon post length used"
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={Math.min(count, max)}
          >
            <div className="h-full rounded-full motion-safe:transition-all" style={{ width: `${used}%`, background: hex }} />
          </div>
          <p className="mt-2 text-xs text-[#5f5873]">
            Every http(s) link counts as 23 characters. A remote mention like @user@server counts only as @user. The bar turns red when you pass your server&apos;s limit.
          </p>
        </div>

        <aside aria-label="Mastodon length result" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
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
              <p className="text-xs text-[#3d3450] tabular-nums">{Math.round((count / max) * 100)}% of the post limit</p>
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CountCard label="Characters" value={count} />
        <CountCard label="Remaining" value={remaining} />
        <CountCard label="Links" value={links} />
        <CountCard label="Mentions" value={mentions} />
      </div>
    </div>
  );
}
