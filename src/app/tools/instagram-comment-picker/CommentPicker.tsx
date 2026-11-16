"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, Copy, Filter, Gift, Inbox, ListChecks, Percent, ShieldCheck, Shuffle, Trophy, Users } from "lucide-react";
import { filterEntries, parseComments, pickWinners, type CommentEntry } from "@/lib/commentPicker";

const SAMPLE = `@anna.k: I want to win this! @mia @leo
@ben_r: win please 🙏 @sam
@cara: love this post
@anna.k: win again @mia
@dev.ops: count me in to win @tom @ana
@ella: WIN WIN @joe`;

const field =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-base outline-none focus:border-[var(--poskoo-violet)] focus:ring-2 focus:ring-[var(--poskoo-violet)]/25";
const kpi = "grid min-w-0 content-start gap-1 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const ghostBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium hover:border-[var(--poskoo-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)] disabled:opacity-40";

function label(entry: CommentEntry) {
  return entry.username ? `@${entry.username}` : "Comment";
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

export default function CommentPicker() {
  const uid = useId();
  const [text, setText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [dedupe, setDedupe] = useState(true);
  const [minMentions, setMinMentions] = useState("0");
  const [count, setCount] = useState("1");
  const [winners, setWinners] = useState<CommentEntry[]>([]);
  const [shuffling, setShuffling] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const timers = useRef<number[]>([]);

  const parsed = useMemo(() => parseComments(text), [text]);
  const valid = useMemo(
    () => filterEntries(parsed, { keyword, dedupe, minMentions: Number(minMentions) || 0 }),
    [parsed, keyword, dedupe, minMentions],
  );
  const winnerCount = Math.min(10, Math.max(1, Math.floor(Number(count) || 1)));
  const filteredOut = parsed.length - valid.length;
  const validPct = parsed.length ? (valid.length / parsed.length) * 100 : 0;
  // Chance one valid entry wins at least one slot when picking without replacement.
  const odds = valid.length ? Math.min(1, winnerCount / valid.length) : 0;

  useEffect(() => {
    const list = timers.current;
    return () => list.forEach((t) => window.clearTimeout(t));
  }, []);

  function pick() {
    if (valid.length === 0 || shuffling !== null) return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setCopied(false);
    const result = pickWinners(valid, winnerCount);
    if (prefersReducedMotion()) {
      setWinners(result);
      return;
    }
    setWinners([]);
    const steps = 12;
    for (let i = 0; i < steps; i++) {
      timers.current.push(
        window.setTimeout(() => {
          const e = valid[Math.floor(Math.random() * valid.length)];
          setShuffling(label(e));
        }, i * 70),
      );
    }
    timers.current.push(
      window.setTimeout(() => {
        setShuffling(null);
        setWinners(result);
      }, steps * 70),
    );
  }

  async function copyResult() {
    const lines = winners.map((w, i) => `${i + 1}. ${label(w)}${w.text ? ` — ${w.text}` : ""}`);
    const summary = `Instagram giveaway winner${winners.length > 1 ? "s" : ""} (picked from ${valid.length} valid entries):\n${lines.join("\n")}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Inputs */}
      <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <label htmlFor={`${uid}-comments`} className="text-sm font-semibold">
            Paste comments, one per line
          </label>
          {text ? (
            <span className="text-xs tabular-nums text-[#5f5873]">{parsed.length} {parsed.length === 1 ? "line" : "lines"} read</span>
          ) : (
            <button
              type="button"
              onClick={() => setText(SAMPLE)}
              className="min-h-11 rounded-lg px-2 text-sm font-medium text-[var(--poskoo-violet)] underline underline-offset-2 hover:bg-[var(--poskoo-band)]"
            >
              Try sample comments
            </button>
          )}
        </div>
        <textarea
          id={`${uid}-comments`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder={"@username: comment text\nusername comment text"}
          className={`${field} resize-y font-mono text-sm sm:text-[15px]`}
        />
        <p className="!mt-2 inline-flex items-center gap-1.5 text-xs text-[#3d3450]">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" /> Comments stay in your browser. Nothing is uploaded.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 border-t border-[var(--poskoo-line)] pt-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="min-w-0">
            <label htmlFor={`${uid}-keyword`} className="text-sm font-semibold">
              Keyword <span className="font-normal text-[#3d3450]">(optional)</span>
            </label>
            <input
              id={`${uid}-keyword`}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. win"
              className={field}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor={`${uid}-mentions`} className="text-sm font-semibold">
              Min tagged friends
            </label>
            <input
              id={`${uid}-mentions`}
              type="number"
              min={0}
              max={20}
              inputMode="numeric"
              value={minMentions}
              onChange={(e) => setMinMentions(e.target.value)}
              className={`${field} tabular-nums`}
            />
          </div>
          <div className="min-w-0">
            <label htmlFor={`${uid}-count`} className="text-sm font-semibold">
              Winners (1–10)
            </label>
            <input
              id={`${uid}-count`}
              type="number"
              min={1}
              max={10}
              inputMode="numeric"
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className={`${field} tabular-nums`}
            />
          </div>
          <div className="min-w-0">
            <span className="text-sm font-semibold" aria-hidden="true">Duplicates</span>
            <label className="mt-2 flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--poskoo-violet)]">
              <input
                type="checkbox"
                checked={dedupe}
                onChange={(e) => setDedupe(e.target.checked)}
                className="h-[18px] w-[18px] accent-[var(--poskoo-violet)]"
              />
              One entry per person
            </label>
          </div>
        </div>
      </div>

      {/* Entry summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}><Inbox className="h-3.5 w-3.5" aria-hidden="true" />Pasted</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{parsed.length}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Comments read from your list.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><ListChecks className="h-3.5 w-3.5" aria-hidden="true" />Valid</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{valid.length}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-band)]" aria-hidden="true">
            <div className="h-full rounded-full bg-[var(--poskoo-green)] transition-all" style={{ width: `${validPct}%` }} />
          </div>
          <p className="text-xs text-[#3d3450]">{parsed.length ? `${Math.round(validPct)}% of pasted comments.` : "Nothing pasted yet."}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><Filter className="h-3.5 w-3.5" aria-hidden="true" />Filtered out</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{filteredOut}</p>
          <p className="mt-1 text-xs text-[#3d3450]">By keyword, tags or duplicates.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><Percent className="h-3.5 w-3.5" aria-hidden="true" />Win chance</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">
            {valid.length ? `${odds >= 1 ? 100 : (odds * 100).toFixed(odds < 0.1 ? 1 : 0)}%` : "—"}
          </p>
          <p className="mt-1 text-xs text-[#3d3450]">
            {valid.length ? `${Math.min(winnerCount, valid.length)} of ${valid.length}, equal odds.` : "Add valid entries first."}
          </p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Results */}
        <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4" aria-live="polite">
          <h3 className="!mb-3 flex items-center gap-2 text-lg font-semibold">
            <Trophy className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden="true" />
            Winners
          </h3>
          {shuffling !== null ? (
            <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] p-8 text-center">
              <Shuffle className="mx-auto h-6 w-6 text-[var(--poskoo-violet)] motion-safe:animate-pulse" aria-hidden="true" />
              <p className="!mt-2 text-sm text-[#3d3450]">Shuffling…</p>
              <p className="!mt-2 truncate text-3xl font-bold tracking-tight">{shuffling}</p>
            </div>
          ) : winners.length > 0 ? (
            <div>
              <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {winners.map((w, i) => (
                  <li
                    key={`${w.line}-${i}`}
                    className={`rounded-2xl border p-4 ${i === 0 ? "border-[var(--poskoo-ink)] bg-[var(--poskoo-lime)]/45 sm:col-span-2" : "border-[var(--poskoo-line)] bg-[var(--poskoo-paper)]"}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--poskoo-ink)] text-white">
                        {i === 0 ? <Trophy className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Gift className="h-5 w-5" aria-hidden="true" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-[#5f5873]">Winner {i + 1}</p>
                        <p className={`truncate font-bold ${i === 0 ? "text-xl" : ""}`}>{label(w)}</p>
                      </div>
                    </div>
                    {w.text ? <p className="!mt-3 break-words text-sm text-[#3d3450]">{w.text}</p> : null}
                  </li>
                ))}
              </ol>
              <p className="!mt-4 text-xs text-[#3d3450]">
                Picked {winners.length} of {valid.length} valid {valid.length === 1 ? "entry" : "entries"} at random.
              </p>
            </div>
          ) : (
            <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-10 text-center text-sm text-[#3d3450]">
              <Users className="h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden="true" />
              <p>
                {parsed.length === 0
                  ? "Paste your comments above to see how many entries are valid."
                  : valid.length === 0
                    ? "No comments match your filters. Try a different keyword or fewer tagged friends."
                    : "Ready. Press Pick winner."}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <aside className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <p className="text-sm text-[#3d3450]" aria-live="polite">
            <strong className="text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{valid.length}</strong> valid{" "}
            {valid.length === 1 ? "entry" : "entries"}
            {parsed.length !== valid.length ? <span className="text-[#5f5873]"> of {parsed.length} pasted</span> : null}
          </p>
          <button
            type="button"
            onClick={pick}
            disabled={valid.length === 0 || shuffling !== null}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Shuffle className="h-5 w-5" aria-hidden="true" /> Pick winner{winnerCount > 1 ? "s" : ""}
          </button>
          <button type="button" onClick={copyResult} disabled={winners.length === 0} className={`${ghostBtn} w-full`}>
            {copied ? <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy result"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Winners copied to clipboard" : ""}</span>
          <Link href="/instagram-auto-dm" className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
            Auto-DM everyone who comments your giveaway keyword
          </Link>
        </aside>
      </div>
    </div>
  );
}
