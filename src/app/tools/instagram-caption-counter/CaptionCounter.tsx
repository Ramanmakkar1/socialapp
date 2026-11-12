"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, AtSign, Check, CheckCircle2, Copy, Hash, Scissors, Smartphone, Type } from "lucide-react";
import { PLATFORMS, PLATFORM_LIMITS, analyzeCaption, type Platform } from "@/lib/captionLimits";
import { writeCaptionHandoff } from "@/lib/captionHandoff";

const SAMPLE =
  "New drop is live ✨ Comment GUIDE and we'll DM you the full styling guide.\nThanks @studio.north for the shoot!\n\n#fashion #ootd #smallbusiness";

type Level = "ok" | "warn" | "over";

function level(value: number, max: number | null): Level {
  if (max === null) return "ok";
  if (value > max) return "over";
  if (value >= max * 0.9) return "warn";
  return "ok";
}

const TEXT: Record<Level, string> = { ok: "text-[var(--poskoo-green)]", warn: "text-[#c4410f]", over: "text-[#c4410f]" };
const BAR: Record<Level, string> = { ok: "bg-[var(--poskoo-green)]", warn: "bg-[var(--poskoo-coral)]", over: "bg-[var(--poskoo-coral)]" };

const kpi = "grid min-w-0 content-start gap-1 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const ghostBtn = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)] disabled:opacity-40";

function Meter({ label, value, max, icon: Icon }: { label: string; value: number; max: number | null; icon: typeof Type }) {
  const lv = level(value, max);
  const pct = max === null ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className={kpi}>
      <p className={kpiLabel}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums ${max === null ? "text-[var(--poskoo-ink)]" : TEXT[lv]}`}>
        {value.toLocaleString("en-US")}
        {max !== null && <span className="text-base font-medium text-[#5f5873]"> / {max.toLocaleString("en-US")}</span>}
      </p>
      {max !== null ? (
        <>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-band)]"
            role="progressbar"
            aria-label={`${label} used`}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-valuenow={Math.min(value, max)}
          >
            <div className={`h-full rounded-full transition-all ${BAR[lv]}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="!mt-1.5 text-xs text-[#3d3450]">
            {value > max ? `${(value - max).toLocaleString("en-US")} over` : `${(max - value).toLocaleString("en-US")} left`}
          </p>
        </>
      ) : (
        <p className="!mt-2 text-xs text-[var(--poskoo-muted)]">No published limit</p>
      )}
    </div>
  );
}

function Chips({ items, empty, icon: Icon }: { items: string[]; empty: string; icon: typeof Hash }) {
  if (items.length === 0)
    return (
      <p className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--poskoo-line)] px-3 py-4 text-xs text-[var(--poskoo-muted)]">
        <Icon className="h-4 w-4 text-[var(--poskoo-violet)]" aria-hidden="true" />{empty}
      </p>
    );
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <li key={`${t}-${i}`} className="max-w-full truncate rounded-lg bg-[var(--poskoo-band)] px-2 py-0.5 text-xs font-semibold text-[#5236e0]">
          {t}
        </li>
      ))}
    </ul>
  );
}

export default function CaptionCounter() {
  const [text, setText] = useState(SAMPLE);
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [copied, setCopied] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  const router = useRouter();
  const id = useId();
  const limit = PLATFORM_LIMITS[platform];
  const a = analyzeCaption(text, platform);

  const warnings: string[] = [];
  if (a.overBy > 0) warnings.push(`${a.overBy.toLocaleString("en-US")} characters over the ${limit.label} limit.`);
  if (a.overHashtags > 0) warnings.push(`${a.overHashtags} hashtags over the limit of ${limit.hashtags}.`);
  if (a.overMentions > 0) warnings.push(`${a.overMentions} mentions over the limit of ${limit.mentions}.`);

  // Simple derived stats from the caption text itself.
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const lines = text ? text.split("\n").length : 0;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function previewCaption() {
    if (platform !== "instagram") return;
    const result = writeCaptionHandoff(text);
    if (result.ok) {
      router.push("/tools/instagram-post-preview?from=caption-counter");
      return;
    }
    setStorageFailed(true);
  }

  return (
    <div className="grid min-w-0 gap-5 text-left lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
      {/* Phone: the column dissolves so the actions can sit right after the summary. */}
      <div className="min-w-0 max-lg:contents lg:space-y-5">
      {/* Input */}
      <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-1">
        <div role="tablist" aria-label="Platform" className="grid grid-cols-3 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              type="button"
              role="tab"
              aria-selected={platform === p}
              onClick={() => setPlatform(p)}
              className={`min-h-10 rounded-lg px-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)] ${platform === p ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"}`}
            >
              {PLATFORM_LIMITS[p].label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
          <label htmlFor={id} className="text-sm font-semibold">Your caption</label>
          <span className="text-xs tabular-nums text-[#5f5873]">
            {words.toLocaleString("en-US")} {words === 1 ? "word" : "words"} · {lines} {lines === 1 ? "line" : "lines"}
          </span>
        </div>
        <textarea
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Paste or type your caption…"
          className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)] focus:ring-2 focus:ring-[var(--poskoo-violet)]/25"
        />
      </div>

      {/* Summary */}
      <div role="region" aria-labelledby={`${id}-sum`} className="min-w-0 max-lg:order-2">
        <h3 id={`${id}-sum`} className="flex items-center gap-2 text-lg font-semibold">
          <Type className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden="true" />Caption check · {limit.label}
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <Meter label="Characters" value={a.chars} max={limit.max} icon={Type} />
          <Meter label="Hashtags" value={a.hashtags.length} max={limit.hashtags} icon={Hash} />
          <Meter label="Mentions" value={a.mentions.length} max={limit.mentions} icon={AtSign} />
          <div className={kpi}>
            <p className={kpiLabel}><Scissors className="h-3.5 w-3.5" aria-hidden="true" />Feed fold</p>
            <p className={`mt-1 text-2xl font-bold ${a.folded ? "text-[#c4410f]" : "text-[var(--poskoo-ink)]"}`}>
              {limit.foldAt === null ? "—" : a.folded ? "Cut" : "Fits"}
            </p>
            <p className="mt-1 text-xs text-[#3d3450]">
              {limit.foldAt === null ? "No fold estimate for this platform." : `About ${limit.foldAt} characters show before "more".`}
            </p>
          </div>
        </div>
        <div aria-live="polite" className="mt-3">
          {warnings.length > 0 ? (
            <div className="flex items-start gap-2 rounded-xl border border-[var(--poskoo-coral)]/40 bg-[var(--poskoo-coral)]/10 p-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-coral)]" aria-hidden="true" />
              <ul className="space-y-1 text-sm font-medium text-[#a8410f]">
                {warnings.map((w) => <li key={w}>{w}</li>)}
              </ul>
            </div>
          ) : (
            <p className="flex items-center gap-2 rounded-xl border border-[var(--poskoo-green)]/30 bg-[var(--poskoo-mint)]/40 p-3 text-sm font-medium text-[#146b43]">
              <CheckCircle2 className="h-4 w-4 flex-none text-[var(--poskoo-green)]" aria-hidden="true" />
              Within the {limit.label} limits.
            </p>
          )}
        </div>
      </div>

        {/* Results */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] max-lg:order-4">
          <div className="grid gap-0 sm:grid-cols-2">
            <div className="min-w-0 border-b border-[var(--poskoo-line)] p-4 sm:border-r sm:border-b-0">
              <h3 className="!mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">
                Hashtags
                <span className="rounded-md bg-[var(--poskoo-paper)] px-1.5 tabular-nums text-[var(--poskoo-ink)]">{a.hashtags.length}</span>
              </h3>
              <Chips items={a.hashtags} empty="No hashtags yet" icon={Hash} />
            </div>
            <div className="min-w-0 p-4">
              <h3 className="!mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">
                Mentions
                <span className="rounded-md bg-[var(--poskoo-paper)] px-1.5 tabular-nums text-[var(--poskoo-ink)]">{a.mentions.length}</span>
              </h3>
              <Chips items={a.mentions} empty="No mentions yet" icon={AtSign} />
            </div>
          </div>
          <div className="flex items-start gap-2 border-t border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3 text-xs text-[#3d3450]">
            <Scissors className="mt-px h-3.5 w-3.5 flex-none" aria-hidden="true" />
            <span>
              {limit.foldAt !== null
                ? a.folded
                  ? `Feed fold: part of this caption sits behind "more". Put the hook in the first line.`
                  : `Feed fold: the whole caption fits before "more".`
                : `Feed fold: ${limit.label} has no fold estimate here.`}
            </span>
          </div>
        </div>
      </div>

        {/* Actions + feed preview */}
        <aside aria-labelledby={`${id}-prev`} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-3 lg:sticky lg:top-24">
          <button
            type="button"
            onClick={copy}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)]"
          >
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Caption copied to clipboard" : ""}</span>
          {platform === "instagram" && (
            <button type="button" onClick={previewCaption} disabled={storageFailed} className={`${ghostBtn} w-full`}>
              <Smartphone className="h-4 w-4" aria-hidden="true" /> Preview this caption
            </button>
          )}
          {storageFailed && (
            <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-violet)]/10 p-3 text-sm">
              <p className="font-medium text-[var(--poskoo-ink)]">Storage is unavailable in this tab.</p>
              <p className="!mt-1 text-xs text-[#3d3450]">
                Copy your caption below, then open the feed preview and paste it in.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={copy} className={ghostBtn}>
                  Copy caption
                </button>
                <Link
                  href="/tools/instagram-post-preview?from=caption-counter"
                  className="inline-flex min-h-11 items-center rounded-xl px-2 text-sm font-medium text-[var(--poskoo-violet)] underline underline-offset-2"
                >
                  Open post preview
                </Link>
              </div>
            </div>
          )}

          <div>
            <h3 id={`${id}-prev`} className="flex items-center justify-between text-sm font-semibold">
              Feed preview
              <span className={`text-xs font-medium ${a.folded ? "text-[#c4410f]" : "text-[#5f5873]"}`}>{a.folded ? "Truncated" : "Fully visible"}</span>
            </h3>
            <div className="mt-2 overflow-hidden rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)]">
              <div className="flex items-center gap-2 p-3">
                <span className="h-8 w-8 rounded-full bg-[conic-gradient(var(--poskoo-violet),var(--poskoo-pink),var(--poskoo-peach),var(--poskoo-violet))] p-[2px]" aria-hidden="true">
                  <span className="block h-full w-full rounded-full border-2 border-white bg-[var(--poskoo-band)]" />
                </span>
                <span className="text-sm font-semibold">yourbrand</span>
              </div>
              <div className="aspect-[4/3] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--poskoo-violet)_25%,transparent),color-mix(in_srgb,var(--poskoo-coral)_25%,transparent))]" />
              <p className="whitespace-pre-wrap break-words p-3 text-sm leading-5">
                <span className="font-semibold">yourbrand</span>{" "}
                {a.foldPreview || <span className="text-[var(--poskoo-muted)]">Your caption appears here</span>}
                {a.folded && <span className="text-[var(--poskoo-muted)]">… more</span>}
              </p>
            </div>
            <p className="!mt-2 text-xs text-[var(--poskoo-muted)]">
              {limit.foldAt !== null
                ? `The feed shows about the first ${limit.foldAt} characters or two lines, then "more". The exact cut varies by device.`
                : `${limit.label} preview shows the full text here.`}
            </p>
          </div>
        </aside>
    </div>
  );
}
