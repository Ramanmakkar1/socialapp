"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Clapperboard, Copy, Lightbulb, Sparkles } from "lucide-react";
import {
  HOOK_STYLES,
  generateHooks,
  normalizeTopic,
  hooksToText,
  type HookStyleFilter,
} from "@/lib/hookIdeas";

const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const ghostBtn = "inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";

const CHIP_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium text-[#3d3450] transition-colors hover:border-[var(--poskoo-violet)] hover:text-[var(--poskoo-violet)]";

export default function HookGenerator({ platform = "instagram" }: { platform?: "instagram" | "tiktok" | "linkedin" }) {
  const isTikTok = platform === "tiktok";
  const isLinkedIn = platform === "linkedin";
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<HookStyleFilter>("all");
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topicId = useId();

  const groups = useMemo(() => {
    const styles =
      style === "all" ? HOOK_STYLES : HOOK_STYLES.filter((s) => s.id === style);
    return styles.map((s) => ({
      id: s.id,
      label: s.label,
      hooks: generateHooks(topic, s.id),
    }));
  }, [topic, style]);

  const all = groups.flatMap((g) => g.hooks);
  const [picked, setPicked] = useState<string | null>(null);
  const previewHook = picked && all.includes(picked) ? picked : all[0] ?? "";
  const words = (h: string) => h.split(/\s+/).filter(Boolean).length;
  const avgWords = all.length ? Math.round(all.reduce((s, h) => s + words(h), 0) / all.length) : 0;
  const shortest = all.length ? Math.min(...all.map((h) => h.length)) : 0;
  const usingSample = topic.trim() === "";

  async function copy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      if (timer.current) clearTimeout(timer.current);
      setCopied(id);
      timer.current = setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Inputs */}
      <div className="grid gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <div className="min-w-0">
          <label htmlFor={topicId} className="text-sm font-semibold">
            {isTikTok ? "What is your video about?" : isLinkedIn ? "What is your LinkedIn post about?" : "What is your Reel about?"}
          </label>
          <input
            id={topicId}
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={isLinkedIn ? "e.g. B2B leads, founder lessons, career change" : "e.g. meal prep, cold email, puppy training"}
            className="mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-base outline-none focus:border-[var(--poskoo-violet)]"
          />
          {usingSample ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-[#3d3450]">
              <Lightbulb className="h-3.5 w-3.5 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
              Showing examples for &ldquo;{normalizeTopic("")}&rdquo;. Add your topic.
            </p>
          ) : null}
        </div>
        <div className="min-w-0">
          <span className="text-sm font-semibold">Hook style</span>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStyle("all")}
              aria-pressed={style === "all"}
              className={`${CHIP_CLASS} ${style === "all" ? "!border-[var(--poskoo-ink)] !bg-[var(--poskoo-ink)] !text-white" : ""}`}
            >
              All
            </button>
            {HOOK_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setStyle(s.id)}
                aria-pressed={style === s.id}
                className={`${CHIP_CLASS} ${style === s.id ? "!border-[var(--poskoo-ink)] !bg-[var(--poskoo-ink)] !text-white" : ""}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}>Hooks</p>
          <p aria-live="polite" className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{all.length}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Ready to copy.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Styles</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">
            {groups.length}
            <span className="text-base font-medium text-[#5f5873]"> / {HOOK_STYLES.length}</span>
          </p>
          <p className="mt-1 truncate text-xs text-[#3d3450]">{style === "all" ? "All angles" : groups[0]?.label}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Avg. length</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{avgWords}<span className="text-base font-medium text-[#5f5873]"> words</span></p>
          <p className="mt-1 text-xs text-[#3d3450]">
            {isLinkedIn ? "Short hooks fit the first line before see more." : "Short hooks read in the first second."}
          </p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Shortest</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{shortest}<span className="text-base font-medium text-[#5f5873]"> chars</span></p>
          <p className="mt-1 text-xs text-[#3d3450]">
            {isLinkedIn ? "Best fit for the line before see more." : "Best fit for on-screen text."}
          </p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Hooks */}
        <div className="min-w-0">
          {groups.map((group) => (
            <section key={group.id} className="mt-6 !p-0 first:mt-0">
              {style === "all" && (
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">
                  {group.label}
                  <span className="rounded-md bg-[var(--poskoo-band)] px-1.5 text-xs tabular-nums text-[var(--poskoo-violet)]">{group.hooks.length}</span>
                </h3>
              )}
              <ul className="mt-3 grid gap-2.5">
                {group.hooks.map((hook, i) => {
                  const id = `${group.id}-${i}`;
                  const on = hook === previewHook;
                  return (
                    <li
                      key={hook}
                      className={`flex flex-col gap-3 rounded-2xl border p-4 transition-colors sm:flex-row sm:items-center sm:justify-between ${on ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-band)]/60" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] hover:border-[var(--poskoo-ink)]/40"}`}
                    >
                      <p className="text-base font-medium leading-snug text-[#3d3450]">{hook}</p>
                      <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setPicked(hook)}
                          aria-pressed={on}
                          aria-label={`Preview hook on a ${isTikTok ? "video" : isLinkedIn ? "LinkedIn post" : "Reel"}: ${hook}`}
                          className={`hidden min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-medium lg:inline-flex ${on ? "text-[var(--poskoo-violet)]" : "text-[#5f5873] hover:bg-[var(--poskoo-band)]"}`}
                        >
                          <Clapperboard className="h-4 w-4" aria-hidden="true" />
                          {on ? "Previewing" : "Preview"}
                        </button>
                        <button
                          type="button"
                          onClick={() => copy(id, hook)}
                          aria-label={`${copied === id ? "Copied" : "Copy"} hook: ${hook}`}
                          className={`inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-4 text-sm font-medium transition ${copied === id ? "border-[var(--poskoo-green)] bg-[var(--poskoo-green)]/10" : "border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] hover:border-[var(--poskoo-ink)]"}`}
                        >
                          {copied === id ? (
                            <Check className="h-4 w-4 text-[var(--poskoo-green)]" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {copied === id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        {/* Actions + video preview */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <button
            type="button"
            onClick={() => copy("all", hooksToText(all))}
            disabled={all.length === 0}
            aria-label="Copy all hooks"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] disabled:opacity-40"
          >
            {copied === "all" ? (
              <Check className="h-5 w-5 text-[var(--poskoo-lime)]" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
            {copied === "all" ? "Copied" : `Copy all (${all.length})`}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>

          <div className="hidden lg:block">
            <p className="mb-2 text-sm font-semibold">{isTikTok ? "Video preview" : isLinkedIn ? "LinkedIn preview" : "Reel preview"}</p>
            {isLinkedIn ? (
              <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3" aria-hidden="true">
                <div className="flex items-center gap-2">
                  <span className="h-7 w-7 rounded-full bg-[linear-gradient(160deg,#6b4eff,#ff8a5b)]" />
                  <span className="h-2 w-20 rounded-full bg-[var(--poskoo-line)]" />
                </div>
                <p className="mt-2.5 whitespace-pre-line text-[13px] font-semibold leading-snug text-[var(--poskoo-ink)]">
                  {previewHook}
                </p>
                <p className="mt-2 text-[11px] font-medium text-[#5f5873]">…see more</p>
              </div>
            ) : (
              <div className="relative mx-auto aspect-[9/16] w-full max-w-[190px] overflow-hidden rounded-2xl bg-[linear-gradient(160deg,#2a1f4a,#6b4eff_55%,#ff8a5b)] p-4" aria-hidden="true">
                <Sparkles className="absolute right-3 top-3 h-4 w-4 text-white/70" />
                <p className="absolute inset-x-3 top-[22%] rounded-lg bg-white px-2.5 py-2 text-center text-[13px] font-bold leading-snug text-[var(--poskoo-ink)] shadow">
                  {previewHook}
                </p>
                <span className="absolute inset-x-3 bottom-3 h-1 rounded-full bg-white/30"><i className="block h-full w-1/4 rounded-full bg-white" /></span>
              </div>
            )}
            <p className="mt-2 text-xs text-[#5f5873]">
              {isLinkedIn
                ? "LinkedIn shows about 210 characters (2-3 lines) before see more, so put the hook in the first line."
                : "Click Preview on any hook to see it as on-screen text."}
            </p>
          </div>

          <Link
            href={isTikTok ? "/tiktok-scheduler" : isLinkedIn ? "/linkedin-scheduler" : "/signup"}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--poskoo-violet)] px-4 text-sm font-semibold !text-white transition-transform hover:-translate-y-0.5"
          >
            {isTikTok ? "Schedule your video with Poskoo" : isLinkedIn ? "Schedule your post with Poskoo" : "Schedule your Reel with Poskoo"} <span aria-hidden="true">&nbsp;→</span>
          </Link>
          <Link href={isTikTok ? "/tools/tiktok-caption-generator" : isLinkedIn ? "/tools/linkedin-post-generator" : "/tools/instagram-caption-generator"} className={ghostBtn}>
            {isLinkedIn ? "Turn a hook into a post" : "Turn a hook into a caption"}
          </Link>
        </aside>
      </div>
    </div>
  );
}
