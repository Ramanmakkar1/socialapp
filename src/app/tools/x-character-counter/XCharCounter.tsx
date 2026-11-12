"use client";

import { useId, useState } from "react";
import { Check, Copy } from "lucide-react";
import { countX, X_LIMIT, X_PREMIUM_LIMIT } from "@/lib/xCharCount";
import ui from "@/components/ui/ui.module.css";

const SAMPLE = "A finished post feels better when you know it fits ✨\n\nCheck your links, hashtags and mentions before you publish.";

function CountCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
      <p className="text-xs text-[var(--poskoo-muted)]">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value.toLocaleString("en-US")}</p>
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
  const colour = over
    ? "text-[var(--poskoo-red)]"
    : near
      ? "text-amber-700 dark:text-amber-300"
      : "text-[var(--poskoo-green)]";
  const barColour = over ? "bg-[var(--poskoo-red)]" : near ? "bg-amber-400" : "bg-[var(--poskoo-green)]";

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
    <div className="text-left">
      <div role="group" aria-label="X post limit" className="flex gap-1 rounded-full bg-[var(--poskoo-band)] p-1">
        {[
          { label: "Standard (280)", value: false },
          { label: "Premium (25,000)", value: true },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            aria-pressed={premium === option.value}
            onClick={() => setPremium(option.value)}
            className={`min-h-11 flex-1 rounded-full px-2 py-2 text-sm font-medium motion-safe:transition ${premium === option.value ? ui.inkFill : "text-[var(--poskoo-muted)] hover:text-[var(--poskoo-ink)]"}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">Your post</label>
        <button
          type="button"
          onClick={copy}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-2 text-sm font-medium hover:text-[var(--poskoo-violet)]"
        >
          {copied ? <Check className="h-4 w-4 text-[var(--poskoo-green)]" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
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
        className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
      />

      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span className="tabular-nums text-[var(--poskoo-muted)]">
          <strong className="font-semibold text-[var(--poskoo-ink)]">{count.weighted.toLocaleString("en-US")}</strong>
          {" / "}{limit.toLocaleString("en-US")} weighted characters
        </span>
        <span id={`${id}-status`} aria-live="polite" className={`font-medium tabular-nums ${colour}`}>
          {over
            ? `${Math.abs(remaining).toLocaleString("en-US")} over the limit`
            : `${remaining.toLocaleString("en-US")} characters left`}
        </span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--poskoo-band)]"
        role="progressbar"
        aria-label="X post length used"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(count.weighted, limit)}
      >
        <div
          className={`h-full rounded-full motion-safe:transition-all ${barColour}`}
          style={{ width: `${Math.min(100, (count.weighted / limit) * 100)}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-[var(--poskoo-muted)]">
        Links count as 23. Emoji and CJK characters count as 2. The bar turns amber near the limit and red above it.
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <CountCard label="Weighted characters" value={count.weighted} />
        <CountCard label="Remaining" value={remaining} />
        <CountCard label="URLs" value={count.urls} />
        <CountCard label="Hashtags" value={count.hashtags} />
        <CountCard label="Mentions" value={count.mentions} />
      </div>
    </div>
  );
}
