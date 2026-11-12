"use client";

import { useId, useState } from "react";
import { AlignLeft, Check, Copy, Eraser, Hash, Heart, ImageIcon, MessageCircle, RotateCcw, Send, Type } from "lucide-react";
import { countChars, extractHashtags, foldCaption } from "@/lib/captionLimits";
import UseInSchedulerLink from "@/components/UseInSchedulerLink";

const SAMPLE =
  "New drop is live ✨\n\nComment GUIDE and we'll DM you the styling guide.\n\nThanks @studio.north!\n\n#fashion #ootd #smallbusiness";

const IG_MAX_CHARS = 2200;
const IG_MAX_HASHTAGS = 30;
// Instagram's feed shows roughly the first 125 characters before "… more".
const FOLD_AT = 125;

const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const ghostBtn =
  "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)] disabled:opacity-40";

function Meter({
  label,
  value,
  max,
  overBy,
  icon: Icon,
}: {
  label: string;
  value: number;
  max: number | null;
  overBy?: number;
  icon: typeof Type;
}) {
  const over = overBy !== undefined ? overBy : max !== null && value > max ? value - max : 0;
  const lv = max === null ? "ok" : over > 0 ? "over" : value >= (max * 0.9) ? "warn" : "ok";
  const pct = max === null ? 0 : Math.min(100, (value / max) * 100);
  const textColor = lv === "over" ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-ink)]";
  const barColor = lv === "over" ? "bg-[var(--poskoo-coral)]" : lv === "warn" ? "bg-[#f5b700]" : "bg-[var(--poskoo-green)]";
  return (
    <div className={kpi}>
      <p className={kpiLabel}><Icon className="h-3 w-3" aria-hidden="true" />{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${textColor}`}>
        {value.toLocaleString("en-US")}
        {max !== null && <span className="text-base font-medium text-[#5f5873]"> / {max.toLocaleString("en-US")}</span>}
      </p>
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
  const baseId = useId();

  const chars = countChars(text);
  const hashtags = extractHashtags(text);
  const overBy = chars > IG_MAX_CHARS ? chars - IG_MAX_CHARS : 0;
  // Derived only from the text: paragraphs, blank lines kept, and the feed fold.
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim()).length;
  const blankLines = text.split("\n").filter((l, i, all) => !l.trim() && i > 0 && i < all.length - 1).length;
  const fold = foldCaption(text, FOLD_AT);

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
    <div className="min-w-0 space-y-5 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-5">
          {/* Input */}
          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label htmlFor={inputId} className="inline-flex items-center gap-2 text-sm font-semibold">
                <AlignLeft className="h-4 w-4 text-[var(--poskoo-violet)]" aria-hidden="true" />
                Your caption
              </label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setText(SAMPLE)} disabled={text === SAMPLE} className={ghostBtn}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />Sample
                </button>
                <button type="button" onClick={() => setText("")} disabled={!text} className={ghostBtn}>
                  <Eraser className="h-4 w-4" aria-hidden="true" />Clear
                </button>
              </div>
            </div>
            <textarea
              id={inputId}
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder="Paste or type your caption…"
              className="mt-3 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)] focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)]/30"
            />
            <p className="mt-2 text-sm text-[var(--poskoo-muted)]">
              Blank lines and spacing are preserved exactly as you type them. Copy the result, then paste it into Instagram or your scheduler.
            </p>
          </div>

          {/* Summary */}
          <div role="region" aria-labelledby={`${baseId}-sum`} className="min-w-0">
            <h3 id={`${baseId}-sum`} className="text-lg font-semibold">Caption check</h3>
            <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <Meter label="Characters" value={chars} max={IG_MAX_CHARS} overBy={overBy} icon={Type} />
              <Meter label="Hashtags" value={hashtags.length} max={IG_MAX_HASHTAGS} icon={Hash} />
              <div className={kpi}>
                <p className={kpiLabel}><AlignLeft className="h-3 w-3" aria-hidden="true" />Paragraphs</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{paragraphs}</p>
                <p className="mt-1 text-xs text-[#3d3450]">{blankLines} blank {blankLines === 1 ? "line" : "lines"} kept.</p>
              </div>
              <div className={kpi}>
                <p className={kpiLabel}>Before “more”</p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{countChars(fold.preview)}<span className="text-base font-medium text-[#5f5873]"> chars</span></p>
                <p className="mt-1 text-xs text-[#3d3450]">{text ? (fold.folded ? "The rest sits behind “… more”." : "Whole caption shows in feed.") : "Type a caption to check."}</p>
              </div>
            </div>
            {overBy > 0 && (
              <p role="status" className="mt-3 rounded-xl border border-[var(--poskoo-coral)]/40 bg-[var(--poskoo-coral)]/10 p-3 text-sm font-medium text-[var(--poskoo-coral)]">
                {overBy.toLocaleString("en-US")} characters over the Instagram limit.
              </p>
            )}
            {hashtags.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Hashtags found">
                {hashtags.map((tag, i) => (
                  <li key={`${tag}-${i}`} className="rounded-md bg-[var(--poskoo-band)] px-2 py-0.5 text-xs font-semibold text-[var(--poskoo-violet)]">{tag}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] p-4">
            <p className="text-sm font-semibold">Take it to the scheduler</p>
            <p className="mt-1 text-sm text-[var(--poskoo-muted)]">
              Copy your finished caption, then continue to sign up and paste it into your first scheduled post.
            </p>
            <UseInSchedulerLink text={text} className="mt-3" />
          </div>
        </div>

        {/* Primary action + live preview */}
        <aside aria-labelledby={`${baseId}-prev`} className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <button
            type="button"
            onClick={copy}
            disabled={!text}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)] disabled:opacity-40"
          >
            {copied ? (
              <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" />
            ) : (
              <Copy className="h-5 w-5" aria-hidden="true" />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>

          <div>
            <h3 id={`${baseId}-prev`} className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold">
              Live preview
              <span className={`text-xs font-medium tabular-nums ${overBy > 0 ? "text-[var(--poskoo-coral)]" : "text-[#5f5873]"}`}>{chars.toLocaleString("en-US")} chars</span>
            </h3>
            <div className="overflow-hidden rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)]">
              <div className="flex items-center gap-2 p-3">
                <span className="h-8 w-8 rounded-full bg-[linear-gradient(135deg,var(--poskoo-violet),var(--poskoo-coral))]" />
                <span className="text-sm font-semibold">yourbrand</span>
              </div>
              <div className="grid aspect-[16/7] place-items-center lg:aspect-[4/3] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--poskoo-violet)_25%,transparent),color-mix(in_srgb,var(--poskoo-coral)_25%,transparent))]" aria-hidden="true">
                <ImageIcon className="h-8 w-8 text-white/80" />
              </div>
              <div className="flex gap-3 px-3 pt-2.5 text-[var(--poskoo-ink)]" aria-hidden="true">
                <Heart className="h-5 w-5" /><MessageCircle className="h-5 w-5" /><Send className="h-5 w-5" />
              </div>
              <p className="max-h-80 overflow-y-auto whitespace-pre-wrap break-words p-3 pt-2 text-sm leading-5" aria-live="polite">
                <span className="font-semibold">yourbrand</span>{" "}
                {text || <span className="text-[var(--poskoo-muted)]">Your caption appears here</span>}
              </p>
            </div>
            <p className="mt-2 text-xs text-[var(--poskoo-muted)]">
              The preview shows your caption exactly as typed, including empty lines and trailing spaces.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
