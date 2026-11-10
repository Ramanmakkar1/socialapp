"use client";

import { useId, useState } from "react";
import { Check, Copy, Heart, MessageCircle, Repeat2, RotateCcw, Send } from "lucide-react";
import { PLATFORM_LIMITS, countChars } from "@/lib/captionLimits";

const MAX = PLATFORM_LIMITS.threads.max ?? 500;
const SAMPLE =
  "We just shipped a faster way to plan your week 🎉\n\nWhat is one small thing you are proud of today?";

export default function ThreadsPostPreview() {
  const [text, setText] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const id = useId();

  const count = countChars(text);
  const remaining = MAX - count;
  const over = remaining < 0;
  const near = !over && remaining <= 50;

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
    <div className="text-left">
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={id} className="text-sm font-medium">
              Your Threads post
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copy}
                aria-label="Copy Threads post text"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-1 text-xs font-medium hover:text-[var(--poskoo-violet)]"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[var(--poskoo-green)]" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </button>
              <button
                type="button"
                onClick={reset}
                aria-label="Reset Threads post text"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-1 text-xs font-medium hover:text-[var(--poskoo-violet)]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>

          <textarea
            id={id}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Write or paste your Threads post…"
            aria-describedby={`${id}-status`}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
          />

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="tabular-nums text-[#3d3450]">
              <strong className="font-semibold text-[var(--poskoo-ink)]">{count.toLocaleString("en-US")}</strong> /{" "}
              {MAX.toLocaleString("en-US")} characters
            </span>
            <span
              id={`${id}-status`}
              aria-live="polite"
              className={`font-medium tabular-nums ${
                over ? "text-[var(--poskoo-coral)]" : near ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-green)]"
              }`}
            >
              {over
                ? `${Math.abs(remaining).toLocaleString("en-US")} over the limit`
                : `${remaining.toLocaleString("en-US")} characters left`}
            </span>
          </div>

          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-band)]"
            role="progressbar"
            aria-label="Threads post length used"
            aria-valuemin={0}
            aria-valuemax={MAX}
            aria-valuenow={Math.min(count, MAX)}
          >
            <div
              className={`h-full rounded-full transition-all ${over ? "bg-[var(--poskoo-coral)]" : "bg-[var(--poskoo-green)]"}`}
              style={{ width: `${Math.min(100, (count / MAX) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-[var(--poskoo-muted)]">
            Threads allows up to {MAX.toLocaleString("en-US")} characters per post. Emoji, spaces and line breaks all count.
          </p>
        </div>

        <div className="min-w-0">
          <h3 className="mb-2 text-sm font-medium">Mobile preview</h3>
          <div className="mx-auto w-full max-w-[20rem] overflow-hidden rounded-[2rem] border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-9 w-9 rounded-full bg-[linear-gradient(135deg,var(--poskoo-violet),var(--poskoo-coral))]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">yourbrand</p>
                <p className="text-xs text-[var(--poskoo-muted)]">just now</p>
              </div>
            </div>
            <p className="mt-3 min-h-24 whitespace-pre-wrap break-words text-sm leading-5">
              {text || <span className="text-[var(--poskoo-muted)]">Your post appears here</span>}
            </p>
            <div className="mt-3 flex items-center gap-4 text-[var(--poskoo-muted)]">
              <Heart className="h-4 w-4" aria-hidden="true" />
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              <Repeat2 className="h-4 w-4" aria-hidden="true" />
              <Send className="h-4 w-4" aria-hidden="true" />
            </div>
          </div>
          <p className="mt-2 text-center text-xs text-[var(--poskoo-muted)]">
            A simple mockup. The real Threads app may wrap text differently.
          </p>
        </div>
      </div>
    </div>
  );
}
