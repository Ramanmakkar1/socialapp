"use client";

import { useId, useState } from "react";
import { AtSign, Check, Copy, Eraser, Hash, Link2, Type } from "lucide-react";
import { countX, X_LIMIT, X_PREMIUM_LIMIT } from "@/lib/xCharCount";

const SAMPLE = "A finished post feels better when you know it fits ✨\n\nCheck your links, hashtags and mentions before you publish.";

const ghostBtn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

function CountCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Hash }) {
  return (
    <div className={kpi}>
      <p className={kpiLabel}><Icon className="h-3 w-3" aria-hidden="true" />{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{value.toLocaleString("en-US")}</p>
    </div>
  );
}

export default function XCharCounter() {
  const [text, setText] = useState(SAMPLE);
  const [premium, setPremium] = useState(false);
  const [copied, setCopied] = useState(false);
  const id = useId();
  const count = countX(text);
  const limit = premium ? X_PREMIUM_LIMIT : X_LIMIT;
  const remaining = limit - count.weighted;
  const over = remaining < 0;
  const near = !over && count.weighted >= limit - 20;
  const colour = over ? "text-[var(--poskoo-red)]" : near ? "text-[#8a5a00]" : "text-[var(--poskoo-green)]";
  const hex = over ? "var(--poskoo-red)" : near ? "#f5b700" : "var(--poskoo-green)";
  const used = Math.min(100, (count.weighted / limit) * 100);
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
        {/* Input */}
        <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div role="group" aria-label="X post limit" className="grid grid-cols-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1">
            {[
              { label: "Standard (280)", value: false },
              { label: "Premium (25,000)", value: true },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                aria-pressed={premium === option.value}
                onClick={() => setPremium(option.value)}
                className={`min-h-10 rounded-lg px-2 text-sm font-medium motion-safe:transition ${premium === option.value ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={id} className="text-sm font-semibold">Your post</label>
            <button type="button" className={ghostBtn} onClick={() => setText("")} disabled={!text}>
              <Eraser className="h-4 w-4" aria-hidden="true" />Clear
            </button>
          </div>
          <textarea
            id={id}
            aria-label="Your post"
            aria-describedby={`${id}-status`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={9}
            placeholder="Write or paste your X post…"
            className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
          />

          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="tabular-nums text-[#5f5873]">
              <strong className="font-semibold text-[var(--poskoo-ink)]">{count.weighted.toLocaleString("en-US")}</strong>
              {" / "}{limit.toLocaleString("en-US")} weighted characters
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
            aria-label="X post length used"
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-valuenow={Math.min(count.weighted, limit)}
          >
            <div className="h-full rounded-full motion-safe:transition-all" style={{ width: `${used}%`, background: hex }} />
          </div>
          <p className="mt-2 text-xs text-[#5f5873]">
            Links count as 23. Emoji and CJK characters count as 2. The bar turns amber near the limit and red above it.
          </p>
        </div>

        {/* Result */}
        <aside aria-label="Post length result" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
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
              <p className="text-xs text-[#3d3450] tabular-nums">{Math.round((count.weighted / limit) * 100)}% of the {premium ? "Premium" : "standard"} limit</p>
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
            <div className="flex items-center gap-2">
              <span className="h-8 w-8 flex-none rounded-full bg-[linear-gradient(135deg,var(--poskoo-violet),var(--poskoo-pink))]" aria-hidden="true" />
              <span className="min-w-0 truncate text-xs"><b className="text-[var(--poskoo-ink)]">Your name</b> <span className="text-[#5f5873]">@yourhandle · now</span></span>
            </div>
            {text ? (
              <p className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed">{text}</p>
            ) : (
              <p className="mt-2 rounded-lg border border-dashed border-[var(--poskoo-line)] p-3 text-center text-xs text-[#5f5873]">Start typing to preview your post.</p>
            )}
          </div>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <CountCard label="Weighted characters" value={count.weighted} icon={Type} />
        <CountCard label="Remaining" value={remaining} icon={Type} />
        <CountCard label="URLs" value={count.urls} icon={Link2} />
        <CountCard label="Hashtags" value={count.hashtags} icon={Hash} />
        <CountCard label="Mentions" value={count.mentions} icon={AtSign} />
      </div>
    </div>
  );
}
