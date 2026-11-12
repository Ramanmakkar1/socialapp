"use client";

import { useId, useState } from "react";
import { AtSign, Check, Copy, Eraser, Hash, Type } from "lucide-react";
import { countTikTokCaption, TIKTOK_CAPTION_LIMIT, TIKTOK_PREVIEW_CHARS } from "@/lib/tiktokCaptionCount";

const SAMPLE = "Your next TikTok starts with a strong opening ✨ Put the hook first, then add context and your call to action. #ContentCreator #TikTokTips @yourhandle";

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

function ChipGroup({ label, items, icon: Icon }: { label: string; items: string[]; icon: typeof Hash }) {
  return (
    <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
      <p className={kpiLabel}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label} ({items.length})</p>
      {items.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label={label}>
          {items.map((item) => (
            <li key={item} className="max-w-full break-all rounded-full bg-[var(--poskoo-band)] px-3 py-1.5 text-sm font-medium text-[var(--poskoo-ink)]">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-[#5f5873]">No {label.toLowerCase()} yet.</p>
      )}
    </div>
  );
}

export default function TikTokCaptionCounter() {
  const [text, setText] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const id = useId();
  const count = countTikTokCaption(text);
  const near = !count.over && count.remaining <= 200;
  const colour = count.over ? "text-[var(--poskoo-red)]" : near ? "text-[#8a5a00]" : "text-[var(--poskoo-green)]";
  const hex = count.over ? "var(--poskoo-red)" : near ? "#f5b700" : "var(--poskoo-green)";
  const used = Math.min(100, (count.chars / TIKTOK_CAPTION_LIMIT) * 100);
  const verdict = !text ? "Empty" : count.over ? "Too long" : near ? "Almost full" : "Fits";

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
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={id} className="text-sm font-semibold">Your TikTok caption</label>
            <button type="button" className={ghostBtn} onClick={() => setText("")} disabled={!text}>
              <Eraser className="h-4 w-4" aria-hidden="true" />Clear
            </button>
          </div>
          <textarea
            id={id}
            aria-describedby={`${id}-status`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={10}
            placeholder="Write or paste your TikTok caption…"
            className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
          />

          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="tabular-nums text-[#5f5873]">
              <strong className="font-semibold text-[var(--poskoo-ink)]">{count.chars.toLocaleString("en-US")}</strong>
              {" / "}{TIKTOK_CAPTION_LIMIT.toLocaleString("en-US")} characters
            </span>
            <span id={`${id}-status`} aria-live="polite" className={`font-semibold tabular-nums ${colour}`}>
              {count.over
                ? `${Math.abs(count.remaining).toLocaleString("en-US")} over the limit`
                : `${count.remaining.toLocaleString("en-US")} characters left`}
            </span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--poskoo-line)]"
            role="progressbar"
            aria-label="TikTok caption length used"
            aria-valuemin={0}
            aria-valuemax={TIKTOK_CAPTION_LIMIT}
            aria-valuenow={Math.min(count.chars, TIKTOK_CAPTION_LIMIT)}
          >
            <div className="h-full rounded-full motion-safe:transition-all" style={{ width: `${used}%`, background: hex }} />
          </div>
          <p className="mt-2 text-xs text-[#5f5873]">
            Emoji count by code point. Hashtags, mentions, spaces and line breaks count toward the 4,000-character limit.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <ChipGroup label="Hashtags" items={count.hashtags} icon={Hash} />
            <ChipGroup label="Mentions" items={count.mentions} icon={AtSign} />
          </div>
        </div>

        <aside aria-label="TikTok caption preview" className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className={kpiLabel}>Status</p>
              <p className="text-2xl font-bold text-[var(--poskoo-ink)]">{verdict}</p>
            </div>
            <p className="text-right text-xs tabular-nums text-[#5f5873]">{Math.round((count.chars / TIKTOK_CAPTION_LIMIT) * 100)}% used</p>
          </div>

          <div className="mx-auto max-w-[280px] rounded-[2rem] border-[6px] border-[var(--poskoo-ink)] bg-[#101014] p-3 text-white shadow-[0_16px_40px_rgba(25,18,43,0.18)]">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/30" aria-hidden="true" />
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">TikTok feed preview</p>
            <div className="mt-5 flex items-center gap-2">
              <span className="h-9 w-9 flex-none rounded-full bg-[linear-gradient(135deg,var(--poskoo-violet),var(--poskoo-pink))]" aria-hidden="true" />
              <span className="text-sm font-bold">@yourhandle</span>
            </div>
            {text ? (
              <p className="mt-3 min-h-20 whitespace-pre-wrap break-words text-sm leading-5">
                {count.preview}{count.chars > TIKTOK_PREVIEW_CHARS ? <span className="font-semibold text-white/70">... more</span> : null}
              </p>
            ) : (
              <p className="mt-3 min-h-20 rounded-lg border border-dashed border-white/25 p-3 text-center text-xs text-white/60">Start typing to preview your caption.</p>
            )}
            <p className="mt-5 text-xs text-white/60">Shown before more · approximately 100 characters</p>
          </div>

          <button
            type="button"
            onClick={copy}
            disabled={!text}
            className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40"
          >
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy caption"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <CountCard label="Characters" value={count.chars} icon={Type} />
        <CountCard label="Remaining" value={count.remaining} icon={Type} />
        <CountCard label="Hashtags" value={count.hashtags.length} icon={Hash} />
        <CountCard label="Mentions" value={count.mentions.length} icon={AtSign} />
      </div>
    </div>
  );
}
