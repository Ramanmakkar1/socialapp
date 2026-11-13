"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, Lightbulb } from "lucide-react";
import {
  TITLE_STYLES,
  generateTitles,
  normalizeTitleTopic,
  YT_TITLE_MAX,
  YT_TITLE_SEARCH_VISIBLE,
  type TitleStyleFilter,
} from "@/lib/youtubeTitleIdeas";

const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const ghostBtn = "inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";

const CHIP_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium text-[#3d3450] transition-colors hover:border-[var(--poskoo-violet)] hover:text-[var(--poskoo-violet)]";

export default function YouTubeTitleGenerator() {
  const [topic, setTopic] = useState("");
  const [style, setStyle] = useState<TitleStyleFilter>("all");
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topicId = useId();

  const groups = useMemo(() => {
    const styles =
      style === "all" ? TITLE_STYLES : TITLE_STYLES.filter((s) => s.id === style);
    return styles.map((s) => ({
      id: s.id,
      label: s.label,
      titles: generateTitles(topic, s.id),
    }));
  }, [topic, style]);

  const all = groups.flatMap((g) => g.titles);
  const usingSample = topic.trim() === "";
  const overSearch = all.filter((t) => t.length > YT_TITLE_SEARCH_VISIBLE).length;
  const overMax = all.filter((t) => t.length > YT_TITLE_MAX).length;

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
            What is your video about?
          </label>
          <input
            id={topicId}
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. home workouts, sourdough, budget travel"
            className="mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-base outline-none focus:border-[var(--poskoo-violet)]"
          />
          {usingSample ? (
            <p className="mt-1.5 flex items-center gap-1 text-xs text-[#3d3450]">
              <Lightbulb className="h-3.5 w-3.5 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
              Showing examples for &ldquo;{normalizeTitleTopic("")}&rdquo;. Add your topic.
            </p>
          ) : null}
        </div>
        <div className="min-w-0">
          <span className="text-sm font-semibold">Title style</span>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStyle("all")}
              aria-pressed={style === "all"}
              className={`${CHIP_CLASS} ${style === "all" ? "!border-[var(--poskoo-ink)] !bg-[var(--poskoo-ink)] !text-white" : ""}`}
            >
              All
            </button>
            {TITLE_STYLES.map((s) => (
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
          <p className={kpiLabel}>Titles</p>
          <p aria-live="polite" className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{all.length}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Ready to copy.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Styles</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">
            {groups.length}
            <span className="text-base font-medium text-[#5f5873]"> / {TITLE_STYLES.length}</span>
          </p>
          <p className="mt-1 truncate text-xs text-[#3d3450]">{style === "all" ? "All angles" : groups[0]?.label}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Over 70</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{overSearch}</p>
          <p className="mt-1 text-xs text-[#3d3450]">May be cut off in search.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Over 100</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{overMax}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Too long for YouTube.</p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Titles */}
        <div className="min-w-0">
          {groups.map((group) => (
            <section key={group.id} className="mt-6 !p-0 first:mt-0">
              {style === "all" && (
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">
                  {group.label}
                  <span className="rounded-md bg-[var(--poskoo-band)] px-1.5 text-xs tabular-nums text-[var(--poskoo-violet)]">{group.titles.length}</span>
                </h3>
              )}
              <ul className="mt-3 grid gap-2.5">
                {group.titles.map((title, i) => {
                  const id = `${group.id}-${i}`;
                  const tooLong = title.length > YT_TITLE_MAX;
                  const cutOff = !tooLong && title.length > YT_TITLE_SEARCH_VISIBLE;
                  return (
                    <li
                      key={title}
                      className="flex flex-col gap-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 transition-colors hover:border-[var(--poskoo-ink)]/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-base font-medium leading-snug text-[#3d3450]">{title}</p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                          <span className="tabular-nums text-[#5f5873]">{title.length} characters</span>
                          {tooLong ? (
                            <span className="rounded-full bg-red-100 px-2 py-0.5 font-semibold text-red-700">too long</span>
                          ) : cutOff ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-800">may be cut off in search</span>
                          ) : (
                            <span className="rounded-full bg-[var(--poskoo-green)]/10 px-2 py-0.5 font-semibold text-[var(--poskoo-green)]">fits in search</span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => copy(id, title)}
                          aria-label={`${copied === id ? "Copied" : "Copy"} title: ${title}`}
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

        {/* Actions */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <button
            type="button"
            onClick={() => copy("all", all.join("\n"))}
            disabled={all.length === 0}
            aria-label="Copy all titles"
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40"
          >
            {copied === "all" ? (
              <Check className="h-5 w-5 text-[var(--poskoo-lime)]" />
            ) : (
              <Copy className="h-5 w-5" />
            )}
            {copied === "all" ? "Copied" : `Copy all (${all.length})`}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>

          <p className="text-xs leading-relaxed text-[#5f5873]">
            YouTube allows up to {YT_TITLE_MAX} characters, but search usually shows about the first{" "}
            {YT_TITLE_SEARCH_VISIBLE}. Keep the main keyword near the start.
          </p>

          <Link
            href="/signup"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[var(--poskoo-violet)] px-4 text-sm font-semibold !text-white transition-transform hover:-translate-y-0.5"
          >
            Schedule your video with Poskoo <span aria-hidden="true">&nbsp;→</span>
          </Link>
          <Link href="/tools/youtube-title-counter" className={ghostBtn}>
            Check a title&apos;s exact length
          </Link>
        </aside>
      </div>
    </div>
  );
}
