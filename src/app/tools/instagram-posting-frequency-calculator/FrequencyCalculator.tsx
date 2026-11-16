"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { CalendarDays, Check, Clock, Copy, Images, Layers, MessageSquareQuote, Square, Video, type LucideIcon } from "lucide-react";

type FormatKey = "reels" | "carousel" | "feed" | "story";

type Format = { key: FormatKey; label: string; minutes: number; hint: string };

// Rough planning estimates for one finished piece, including caption.
const FORMATS: Format[] = [
  { key: "reels", label: "Reels", minutes: 45, hint: "script, film, edit" },
  { key: "carousel", label: "Carousels", minutes: 30, hint: "design slides + caption" },
  { key: "feed", label: "Feed posts", minutes: 20, hint: "photo + caption" },
  { key: "story", label: "Stories", minutes: 10, hint: "quick frames" },
];

const ICON: Record<FormatKey, LucideIcon> = { reels: Video, carousel: Images, feed: Square, story: MessageSquareQuote };
const HEX: Record<FormatKey, string> = { reels: "#6b4eff", carousel: "#ff8a5b", feed: "#1fa971", story: "#c6a700" };
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

const HOURS_MIN = 1;
const HOURS_MAX = 12;

export default function FrequencyCalculator() {
  const uid = useId();
  const [hours, setHours] = useState(4);
  const [selected, setSelected] = useState<Record<FormatKey, boolean>>({
    reels: true,
    carousel: false,
    feed: true,
    story: false,
  });

  const [copied, setCopied] = useState(false);
  const active = FORMATS.filter((f) => selected[f.key]);

  const result = useMemo(() => {
    if (active.length === 0) return null;
    const totalMinutes = hours * 60;
    const slowest = Math.max(...active.map((f) => f.minutes));
    const fastest = Math.min(...active.map((f) => f.minutes));
    const minPosts = Math.floor(totalMinutes / slowest);
    const maxPosts = Math.floor(totalMinutes / fastest);
    // Sample plan: split the weekly budget evenly across the chosen formats.
    const share = totalMinutes / active.length;
    const sample = active.map((f) => ({ ...f, posts: Math.floor(share / f.minutes) }));
    const sampleTotal = sample.reduce((sum, f) => sum + f.posts, 0);
    return { minPosts, maxPosts, sample, sampleTotal };
  }, [active, hours]);

  function toggle(key: FormatKey) {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const usedMinutes = result ? result.sample.reduce((sum, f) => sum + f.posts * f.minutes, 0) : 0;
  const rangeText = result ? (result.minPosts === result.maxPosts ? `${result.minPosts}` : `${result.minPosts}–${result.maxPosts}`) : "—";

  async function copyPlan() {
    if (!result) return;
    const text = [
      `Weekly posting plan (${hours} h per week)`,
      `Range: ${rangeText} posts / week`,
      `Sample week (${result.sampleTotal} posts): ${result.sample.map((f) => `${f.posts} ${f.label.toLowerCase()}`).join(", ")}`,
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}><CalendarDays className="h-3 w-3" aria-hidden="true" />Posts / week</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{rangeText}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Slowest to fastest format.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Sample week</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{result ? result.sampleTotal : "—"}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Budget split evenly across formats.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><Clock className="h-3 w-3" aria-hidden="true" />Time used</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{usedMinutes}<span className="text-base font-medium text-[#5f5873]"> / {hours * 60} min</span></p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
            <i className="block h-full rounded-full bg-[var(--poskoo-violet)]" style={{ width: `${Math.min(100, (usedMinutes / (hours * 60)) * 100)}%` }} />
          </div>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Formats</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{active.length}<span className="text-base font-medium text-[#5f5873]"> / {FORMATS.length}</span></p>
          <p className="mt-1 truncate text-xs text-[#3d3450]">{active.length ? active.map((f) => f.label).join(", ") : "None selected"}</p>
        </div>
      </div>
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Inputs */}
        <div className="min-w-0 space-y-5 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div>
            <label htmlFor={`${uid}-hours`} className="flex items-center justify-between gap-2 text-sm font-semibold">
              <span>Weekly time budget: <strong className="tabular-nums">{hours} h</strong> per week</span>
              <span className="rounded-md bg-[var(--poskoo-band)] px-1.5 tabular-nums text-[var(--poskoo-violet)]" aria-hidden="true">{hours * 60} min</span>
            </label>
            <input
              id={`${uid}-hours`}
              type="range"
              min={HOURS_MIN}
              max={HOURS_MAX}
              step={1}
              value={hours}
              aria-valuetext={`${hours} hours per week`}
              onChange={(e) => setHours(Number(e.target.value))}
              className="mt-2 min-h-11 w-full accent-[var(--poskoo-violet)]"
            />
            <div className="flex justify-between text-xs text-[var(--poskoo-muted)]">
              <span>{HOURS_MIN} h</span>
              <span>{HOURS_MAX} h</span>
            </div>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold">Content formats you make</legend>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FORMATS.map((f) => {
                const Icon = ICON[f.key];
                return (
                  <label
                    key={f.key}
                    className={`flex min-h-14 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--poskoo-violet)] ${
                      selected[f.key]
                        ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-band)]"
                        : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] hover:border-[var(--poskoo-violet)]"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected[f.key]}
                      onChange={() => toggle(f.key)}
                      className="h-[18px] w-[18px] flex-none accent-[var(--poskoo-violet)]"
                    />
                    <Icon className="h-5 w-5 flex-none" style={{ color: HEX[f.key] }} aria-hidden="true" />
                    <span className="min-w-0">
                      <span className="font-medium">{f.label}</span>
                      <span className="block text-xs text-[var(--poskoo-muted)]">
                        ~{f.minutes} min each · {f.hint}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Result */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 text-center" aria-live="polite">
            {result === null ? (
              <div className="grid place-items-center gap-2 rounded-lg border border-dashed border-[var(--poskoo-line)] p-4">
                <Layers className="h-7 w-7 text-[var(--poskoo-violet)]" aria-hidden="true" />
                <p className="text-sm text-[#3d3450]">Your weekly posting range</p>
                <p className="text-lg font-semibold tracking-tight">
                  Pick at least one content format
                </p>
                <p className="text-sm text-[var(--poskoo-muted)]">
                  The range appears here as soon as you choose a format above.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-[#3d3450]">A realistic weekly posting range for {hours} h</p>
                <p className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-[var(--poskoo-ink)]">
                  {result.minPosts === result.maxPosts
                    ? `${result.minPosts} posts`
                    : `${result.minPosts}–${result.maxPosts} posts`}
                  <span className="text-base font-medium text-[var(--poskoo-muted)]"> / week</span>
                </p>
                <p className="mt-2 text-xs text-[var(--poskoo-muted)]">
                  {result.minPosts} if you spend the week on your slowest format, up to {result.maxPosts} on your
                  fastest. An estimate from your time budget — not a growth guarantee.
                </p>
                <div className="mt-4 border-t border-[var(--poskoo-line)] pt-3 text-left">
                  <p className="text-sm font-semibold">Sample week ({result.sampleTotal} posts)</p>
                  <ul className="mt-2 space-y-2">
                    {result.sample.map((f) => (
                      <li key={f.key} className="text-sm tabular-nums">
                        <span className="flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full" style={{ background: HEX[f.key] }} aria-hidden="true" />{f.posts} {f.label.toLowerCase()}</span>
                          <span className="text-xs text-[#5f5873]">{f.posts * f.minutes} min</span>
                        </span>
                        <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
                          <i className="block h-full rounded-full" style={{ width: `${Math.min(100, ((f.posts * f.minutes) / (hours * 60)) * 100)}%`, background: HEX[f.key] }} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={copyPlan}
            disabled={!result}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] disabled:opacity-40"
          >
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy plan"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Plan copied to clipboard" : ""}</span>
          <p className="text-sm">
            Put the plan on a calendar:{" "}
            <Link href="/instagram-scheduler" className="font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
              Instagram scheduler
            </Link>{" "}
            · or draft each post first with the{" "}
            <Link href="/instagram-content-planner" className="font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
              content planner
            </Link>
            .
          </p>
        </aside>
      </div>

    </div>
  );
}
