"use client";

import { useId, useState } from "react";
import { Check, Copy } from "lucide-react";
import { PLATFORMS, PLATFORM_LIMITS, analyzeCaption, type Platform } from "@/lib/captionLimits";

const SAMPLE =
  "New drop is live ✨ Comment GUIDE and we'll DM you the full styling guide.\nThanks @studio.north for the shoot!\n\n#fashion #ootd #smallbusiness";

type Level = "ok" | "warn" | "over";

function level(value: number, max: number | null): Level {
  if (max === null) return "ok";
  if (value > max) return "over";
  if (value >= max * 0.9) return "warn";
  return "ok";
}

const TEXT: Record<Level, string> = { ok: "text-ok", warn: "text-warn", over: "text-brand-2" };
const BAR: Record<Level, string> = { ok: "bg-ok", warn: "bg-warn", over: "bg-brand-2" };

function Meter({ label, value, max }: { label: string; value: number; max: number | null }) {
  const lv = level(value, max);
  const pct = max === null ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="rounded-xl border border-line bg-bg p-3">
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-ink-2">{label}</span>
        <span className={`font-semibold tabular-nums ${TEXT[lv]}`}>
          {value.toLocaleString("en-US")}
          {max !== null && <span className="font-normal text-muted"> / {max.toLocaleString("en-US")}</span>}
        </span>
      </div>
      {max !== null ? (
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-label={`${label} used`}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={Math.min(value, max)}
        >
          <div className={`h-full rounded-full transition-all ${BAR[lv]}`} style={{ width: `${pct}%` }} />
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted">No published limit</p>
      )}
    </div>
  );
}

function Chips({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-xs text-muted">{empty}</p>;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {items.map((t, i) => (
        <li key={`${t}-${i}`} className="max-w-full truncate rounded-full border border-line bg-surface-2 px-2.5 py-0.5 text-xs text-ink-2">
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
  const id = useId();
  const limit = PLATFORM_LIMITS[platform];
  const a = analyzeCaption(text, platform);

  const warnings: string[] = [];
  if (a.overBy > 0) warnings.push(`${a.overBy.toLocaleString("en-US")} characters over the ${limit.label} limit.`);
  if (a.overHashtags > 0) warnings.push(`${a.overHashtags} hashtags over the limit of ${limit.hashtags}.`);
  if (a.overMentions > 0) warnings.push(`${a.overMentions} mentions over the limit of ${limit.mentions}.`);

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
    <div className="glow rounded-3xl border border-line bg-surface p-4 text-left sm:p-6">
      <div role="tablist" aria-label="Platform" className="flex gap-1 rounded-full bg-surface-2 p-1">
        {PLATFORMS.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={platform === p}
            onClick={() => setPlatform(p)}
            className={`flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition ${platform === p ? "btn-primary" : "text-ink-2 hover:text-ink"}`}
          >
            {PLATFORM_LIMITS[p].label}
          </button>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor={id} className="text-sm font-medium">Your caption</label>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-3 py-1 text-xs font-medium hover:text-brand"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-ok" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <textarea
            id={id}
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={9}
            placeholder="Paste or type your caption…"
            className="mt-2 w-full resize-y rounded-xl border border-line bg-bg p-3 text-base leading-6 outline-none focus:border-brand"
          />
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Meter label="Characters" value={a.chars} max={limit.max} />
            <Meter label="Hashtags" value={a.hashtags.length} max={limit.hashtags} />
            <Meter label="Mentions" value={a.mentions.length} max={limit.mentions} />
          </div>
          <div aria-live="polite" className="mt-3">
            {warnings.length > 0 ? (
              <ul className="space-y-1 text-sm font-medium text-brand-2">
                {warnings.map((w) => <li key={w}>{w}</li>)}
              </ul>
            ) : (
              <p className="text-sm text-ok">Within the {limit.label} limits.</p>
            )}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Hashtags</h3>
              <Chips items={a.hashtags} empty="No hashtags yet" />
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Mentions</h3>
              <Chips items={a.mentions} empty="No mentions yet" />
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <h3 className="mb-2 text-sm font-medium">Feed preview</h3>
          <div className="overflow-hidden rounded-2xl border border-line bg-bg">
            <div className="flex items-center gap-2 p-3">
              <span className="h-8 w-8 rounded-full bg-[linear-gradient(135deg,var(--brand),var(--brand-2))]" />
              <span className="text-sm font-semibold">yourbrand</span>
            </div>
            <div className="aspect-[4/3] bg-[linear-gradient(135deg,color-mix(in_srgb,var(--brand)_25%,transparent),color-mix(in_srgb,var(--brand-2)_25%,transparent))]" />
            <p className="whitespace-pre-wrap break-words p-3 text-sm leading-5">
              <span className="font-semibold">yourbrand</span>{" "}
              {a.foldPreview || <span className="text-muted">Your caption appears here</span>}
              {a.folded && <span className="text-muted">… more</span>}
            </p>
          </div>
          <p className="mt-2 text-xs text-muted">
            {limit.foldAt !== null
              ? `The feed shows about the first ${limit.foldAt} characters or two lines, then "more". The exact cut varies by device.`
              : `${limit.label} preview shows the full text here.`}
          </p>
        </div>
      </div>
    </div>
  );
}
