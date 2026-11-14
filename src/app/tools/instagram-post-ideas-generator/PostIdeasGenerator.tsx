"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, Images, Lightbulb, MessageSquareQuote, RefreshCw, SearchX, Square, Video, type LucideIcon } from "lucide-react";
import {
  FORMATS,
  NICHES,
  ideasToText,
  pickIdeas,
  type Idea,
} from "@/lib/postIdeas";

const FORMAT_LABELS: Record<string, string> = {
  reel: "Reel",
  carousel: "Carousel",
  story: "Story",
  post: "Post",
};
const TIKTOK_FORMAT_LABELS: Record<string, string> = {
  reel: "Video",
  carousel: "Photo carousel",
  story: "Story",
  post: "Photo post",
};
const forPlatform = (text: string, platform: "instagram" | "tiktok") =>
  platform === "tiktok"
    ? text.replace(/\bReels\b/g, "TikTok videos").replace(/\bReel\b/g, "TikTok video")
    : text;
const FORMAT_ICON: Record<string, LucideIcon> = { reel: Video, carousel: Images, story: MessageSquareQuote, post: Square };
const FORMAT_HEX: Record<string, string> = { reel: "#6b4eff", carousel: "#ff8a5b", story: "#1fa971", post: "#c6a700" };

const field = "min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base outline-none focus:border-[var(--poskoo-violet)]";
const ghostBtn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

export default function PostIdeasGenerator({ platform = "instagram" }: { platform?: "instagram" | "tiktok" }) {
  const [nicheId, setNicheId] = useState<string>("creator");
  const [format, setFormat] = useState<string>("all");
  const [seed, setSeed] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nicheSelectId = useId();

  const formatLabels = platform === "tiktok" ? TIKTOK_FORMAT_LABELS : FORMAT_LABELS;

  const ideas = useMemo<Idea[]>(() => {
    const picked = pickIdeas(nicheId, {
      format: format === "all" ? undefined : format,
      count: 6,
      seed,
    });
    if (platform !== "tiktok") return picked;
    return picked.map((idea) => ({
      ...idea,
      title: forPlatform(idea.title, platform),
      hook: forPlatform(idea.hook, platform),
      captionStarter: forPlatform(idea.captionStarter, platform),
    }));
  }, [nicheId, format, seed, platform]);

  const mix = FORMATS.map((f) => ({ f, n: ideas.filter((i) => i.format === f).length }));
  const nicheLabel = NICHES.find((n) => n.id === nicheId)?.label ?? "Creator";
  const deg = (n: number) => (n / Math.max(1, ideas.length)) * 360;
  const donut = mix.filter((m) => m.n > 0).map((m, i, list) => {
    const from = list.slice(0, i).reduce((s, x) => s + deg(x.n), 0);
    return `${FORMAT_HEX[m.f]} ${from}deg ${from + deg(m.n)}deg`;
  }).join(", ");

  async function copy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      if (timer.current) clearTimeout(timer.current);
      setCopied(id);
      timer.current = setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  }

  function ideaText(idea: Idea) {
    return `${idea.title}\nFormat: ${formatLabels[idea.format] ?? idea.format}\nHook: ${idea.hook}\nCaption starter: ${idea.captionStarter}`;
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Controls */}
      <div className="grid gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div className="min-w-0">
          <label htmlFor={nicheSelectId} className="text-sm font-semibold">
            Your niche
          </label>
          <select
            id={nicheSelectId}
            value={nicheId}
            onChange={(e) => setNicheId(e.target.value)}
            className={`${field} mt-2`}
          >
            {NICHES.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-0">
          <span className="text-sm font-semibold">Format</span>
          <div className="mt-2 grid grid-cols-5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1">
            {(["all", ...FORMATS] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                aria-pressed={format === f}
                className={`flex min-h-10 min-w-0 items-center justify-center rounded-lg px-1 text-center text-[13px] font-medium leading-tight ${format === f ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"}`}
              >
                {f === "all" ? "All" : formatLabels[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}>Ideas</p>
          <p aria-live="polite" className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{ideas.length}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Ready to film or design.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Niche</p>
          <p className="mt-1 truncate text-2xl font-bold text-[var(--poskoo-ink)]">{nicheLabel}</p>
          <p className="mt-1 text-xs text-[#3d3450]">{format === "all" ? "All formats" : `${formatLabels[format]}s only`}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Batch</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">#{seed}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Shuffle for a fresh set.</p>
        </div>
        <div className={`${kpi} flex items-center gap-2.5 max-sm:p-3`}>
          <div className="relative h-11 w-11 flex-none rounded-full sm:h-14 sm:w-14" style={{ background: donut ? `conic-gradient(${donut})` : "var(--poskoo-line)" }} aria-hidden="true">
            <span className="absolute inset-[7px] grid sm:inset-[9px] place-items-center rounded-full bg-[var(--poskoo-card)] text-xs font-bold tabular-nums">{ideas.length}</span>
          </div>
          <div className="min-w-0">
            <p className={kpiLabel}>Format mix</p>
            <ul className="mt-1 space-y-0.5 text-xs text-[#3d3450]">
              {mix.filter((m) => m.n > 0).map((m) => (
                <li key={m.f} className="flex items-center gap-1.5"><i className="h-2 w-2 flex-none rounded-full" style={{ background: FORMAT_HEX[m.f] }} /><b className="tabular-nums text-[var(--poskoo-ink)]">{m.n}</b> {formatLabels[m.f].toLowerCase()}</li>
              ))}
              {ideas.length === 0 && <li>—</li>}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Ideas */}
        {ideas.length === 0 ? (
          <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 py-12 text-center text-sm text-[#3d3450]">
            <SearchX className="h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden="true" />
            <p>No ideas for this format in this niche yet.</p>
            <button type="button" className={ghostBtn} onClick={() => setFormat("all")}>Show all formats</button>
          </div>
        ) : (
          <div className="grid min-w-0 gap-3 sm:grid-cols-2">
            {ideas.map((idea, index) => {
              const cardId = `${nicheId}-${format}-${seed}-${index}`;
              const Icon = FORMAT_ICON[idea.format] ?? Lightbulb;
              return (
                <div
                  key={cardId}
                  className="group flex min-w-0 flex-col rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 transition-colors hover:border-[var(--poskoo-violet)]/50"
                  style={{ boxShadow: `inset 3px 0 0 ${FORMAT_HEX[idea.format] ?? "var(--poskoo-violet)"}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold tabular-nums text-[#5f5873]">{String(index + 1).padStart(2, "0")}</span>
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-[var(--poskoo-band)] px-2 py-0.5 text-xs font-semibold text-[#3d3450]">
                      <Icon className="h-3.5 w-3.5" style={{ color: FORMAT_HEX[idea.format] }} aria-hidden="true" />
                      {formatLabels[idea.format] ?? idea.format}
                    </span>
                  </div>
                  <h3 className="mt-1.5 text-base font-semibold leading-snug tracking-normal text-[var(--poskoo-ink)]">
                    {idea.title}
                  </h3>
                  <p className="mt-2 rounded-xl bg-[var(--poskoo-paper)] p-2.5 text-sm text-[#3d3450]">
                    <span className="font-semibold">Hook:</span> {idea.hook}
                  </p>
                  <p className="mt-2 text-sm text-[var(--poskoo-muted)]">
                    <span className="font-semibold text-[#3d3450]">Caption starter:</span>{" "}
                    {idea.captionStarter}
                  </p>
                  <div className="mt-auto flex items-center justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => copy(cardId, ideaText(idea))}
                      aria-label={`${copied === cardId ? "Copied" : "Copy"} idea ${index + 1}`}
                      className={`${ghostBtn} ${copied === cardId ? "!border-[var(--poskoo-green)] bg-[var(--poskoo-green)]/10" : ""}`}
                    >
                      {copied === cardId ? (
                        <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden="true" />
                      ) : (
                        <Copy className="h-4 w-4" aria-hidden="true" />
                      )}
                      {copied === cardId ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40"
          >
            <RefreshCw className="h-5 w-5" aria-hidden="true" />
            New ideas
          </button>
          <div className="grid gap-2">
            <button
              type="button"
              onClick={() => copy("all", ideasToText(ideas))}
              disabled={ideas.length === 0}
              aria-label="Copy all ideas"
              className={ghostBtn}
            >
              {copied === "all" ? (
                <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              {copied === "all" ? "Copied" : "Copy all"}
            </button>
            <Link href="/signup" className="inline-flex min-h-11 items-center justify-center gap-1 text-sm font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
              Schedule this in Poskoo <span aria-hidden="true">→</span>
            </Link>
          </div>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
          <p className="flex items-start gap-1.5 text-xs text-[#3d3450]">
            <Lightbulb className="mt-px h-3.5 w-3.5 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
            <span>Each idea comes with a hook and a caption starter. Copy one, then adapt it to your voice.</span>
          </p>
        </aside>
      </div>
    </div>
  );
}
