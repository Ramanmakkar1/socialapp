"use client";

import { useId, useState } from "react";
import { Check, Copy } from "lucide-react";
import { countChars, extractHashtags } from "@/lib/captionLimits";
import UseInSchedulerLink from "@/components/UseInSchedulerLink";

const SAMPLE =
  "New drop is live ✨\n\nComment GUIDE and we'll DM you the styling guide.\n\nThanks @studio.north!\n\n#fashion #ootd #smallbusiness";

const IG_MAX_CHARS = 2200;
const IG_MAX_HASHTAGS = 30;

function Meter({
  label,
  value,
  max,
  overBy,
}: {
  label: string;
  value: number;
  max: number | null;
  overBy?: number;
}) {
  const over = overBy !== undefined ? overBy : max !== null && value > max ? value - max : 0;
  const lv = max === null ? "ok" : over > 0 ? "over" : value >= (max * 0.9) ? "warn" : "ok";
  const pct = max === null ? 0 : Math.min(100, (value / max) * 100);
  const textColor = lv === "over" ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-green)]";
  const barColor = lv === "over" ? "bg-[var(--poskoo-coral)]" : "bg-[var(--poskoo-green)]";
  return (
    <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-[#3d3450]">{label}</span>
        <span className={`font-semibold tabular-nums ${textColor}`}>
          {value.toLocaleString("en-US")}
          {max !== null && <span className="font-normal text-[var(--poskoo-muted)]"> / {max.toLocaleString("en-US")}</span>}
        </span>
      </div>
      {max !== null ? (
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-band)]"
          role="progressbar"
          aria-label={`${label} used`}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={Math.min(value, max)}
        >
          <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
        </div>
      ) : (
        <p className="mt-2 text-xs text-[var(--poskoo-muted)]">No published limit</p>
      )}
    </div>
  );
}

export default function CaptionFormatter() {
  const [text, setText] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const inputId = useId();

  const chars = countChars(text);
  const hashtags = extractHashtags(text);
  const overBy = chars > IG_MAX_CHARS ? chars - IG_MAX_CHARS : 0;

  async function copy() {
    if (!text) return;
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
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={inputId} className="text-sm font-medium">Your caption</label>
            <button
              type="button"
              onClick={copy}
              disabled={!text}
              className="inline-flex items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-1 text-xs font-medium disabled:opacity-50 hover:text-[var(--poskoo-violet)]"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-[var(--poskoo-green)]" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <textarea
            id={inputId}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            placeholder="Paste or type your caption…"
            className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
          />
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Meter label="Characters" value={chars} max={IG_MAX_CHARS} overBy={overBy} />
            <Meter label="Hashtags" value={hashtags.length} max={IG_MAX_HASHTAGS} />
          </div>
          {overBy > 0 && (
            <p className="mt-3 text-sm font-medium text-[var(--poskoo-coral)]">
              {overBy.toLocaleString("en-US")} characters over the Instagram limit.
            </p>
          )}
          <p className="mt-3 text-sm text-[var(--poskoo-muted)]">
            Blank lines and spacing are preserved exactly as you type them. Copy the result, then paste it into Instagram or your scheduler.
          </p>
          <div className="mt-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] p-4">
            <p className="text-sm font-semibold">Take it to the scheduler</p>
            <p className="mt-1 text-sm text-[var(--poskoo-muted)]">
              Copy your finished caption, then continue to sign up and paste it into your first scheduled post.
            </p>
            <UseInSchedulerLink text={text} className="mt-3" />
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="mb-2 text-sm font-medium">Live preview</h3>
          </div>
          <div className="overflow-hidden rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)]">
            <div className="flex items-center gap-2 p-3">
              <span className="h-8 w-8 rounded-full bg-[linear-gradient(135deg,var(--poskoo-violet),var(--poskoo-coral))]" />
              <span className="text-sm font-semibold">yourbrand</span>
            </div>
            <div className="aspect-[4/3] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--poskoo-violet)_25%,transparent),color-mix(in_srgb,var(--poskoo-coral)_25%,transparent))]" />
            <p className="whitespace-pre-wrap break-words p-3 text-sm leading-5" aria-live="polite">
              <span className="font-semibold">yourbrand</span>{" "}
              {text || <span className="text-[var(--poskoo-muted)]">Your caption appears here</span>}
            </p>
          </div>
          <p className="mt-2 text-xs text-[var(--poskoo-muted)]">
            The preview shows your caption exactly as typed, including empty lines and trailing spaces.
          </p>
        </div>
      </div>
    </div>
  );
}
