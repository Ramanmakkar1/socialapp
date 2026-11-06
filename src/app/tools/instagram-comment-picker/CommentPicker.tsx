"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, Copy, Gift, ShieldCheck, Shuffle, Trophy } from "lucide-react";
import { filterEntries, parseComments, pickWinners, type CommentEntry } from "@/lib/commentPicker";
import ui from "@/components/ui/ui.module.css";

const SAMPLE = `@anna.k: I want to win this! @mia @leo
@ben_r: win please 🙏 @sam
@cara: love this post
@anna.k: win again @mia
@dev.ops: count me in to win @tom @ana
@ella: WIN WIN @joe`;

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
    <div className="text-left">
      <label htmlFor={`${uid}-comments`} className="text-sm font-medium">
        Paste comments, one per line
      </label>
      <textarea
        id={`${uid}-comments`}
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        placeholder={"@username: comment text\nusername comment text"}
        className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2.5 text-base outline-none focus:border-[var(--poskoo-violet)]"
      />
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--poskoo-muted)]">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" /> Comments stay in your browser. Nothing is uploaded.
        </span>
        {text ? null : (
          <button type="button" onClick={() => setText(SAMPLE)} className="font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
            Try sample comments
          </button>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor={`${uid}-keyword`} className="text-sm font-medium">
            Keyword <span className="font-normal text-[var(--poskoo-muted)]">(optional)</span>
          </label>
          <input
            id={`${uid}-keyword`}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. win"
            className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2.5 text-base outline-none focus:border-[var(--poskoo-violet)]"
          />
        </div>
        <div>
          <label htmlFor={`${uid}-mentions`} className="text-sm font-medium">
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
            className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2.5 text-base tabular-nums outline-none focus:border-[var(--poskoo-violet)]"
          />
        </div>
        <div>
          <label htmlFor={`${uid}-count`} className="text-sm font-medium">
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
            className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2.5 text-base tabular-nums outline-none focus:border-[var(--poskoo-violet)]"
          />
        </div>
      </div>

      <label className="mt-4 inline-flex min-h-11 cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={dedupe}
          onChange={(e) => setDedupe(e.target.checked)}
          className="h-4 w-4 accent-[var(--poskoo-violet)]"
        />
        One entry per person
      </label>

      <div className="mt-4 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[#3d3450]" aria-live="polite">
          <strong className="font-semibold tabular-nums text-[var(--poskoo-ink)]">{valid.length}</strong> valid{" "}
          {valid.length === 1 ? "entry" : "entries"}
          {parsed.length !== valid.length ? <span className="text-[var(--poskoo-muted)]"> of {parsed.length} pasted</span> : null}
        </p>
        <button
          type="button"
          onClick={pick}
          disabled={valid.length === 0 || shuffling !== null}
          className={`${ui.inkFill} inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-2.5 font-medium disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <Shuffle className="h-4 w-4" /> Pick winner{winnerCount > 1 ? "s" : ""}
        </button>
      </div>

      <div className="mt-6" aria-live="polite">
        {shuffling !== null ? (
          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-6 text-center">
            <p className="text-sm text-[#3d3450]">Shuffling…</p>
            <p className="mt-2 truncate text-2xl font-semibold tracking-tight">{shuffling}</p>
          </div>
        ) : winners.length > 0 ? (
          <div>
            <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {winners.map((w, i) => (
                <li key={`${w.line}-${i}`} className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className={`${ui.inkFill} inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full`}>
                      {i === 0 ? <Trophy className="h-5 w-5" /> : <Gift className="h-5 w-5" />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-[var(--poskoo-muted)]">Winner {i + 1}</p>
                      <p className="truncate font-semibold">{label(w)}</p>
                    </div>
                  </div>
                  {w.text ? <p className="mt-3 break-words text-sm text-[#3d3450]">{w.text}</p> : null}
                </li>
              ))}
            </ol>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-[var(--poskoo-muted)]">
                Picked {winners.length} of {valid.length} valid {valid.length === 1 ? "entry" : "entries"} at random.
              </p>
              <button
                type="button"
                onClick={copyResult}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 py-2 text-sm font-medium hover:border-[var(--poskoo-violet)]"
              >
                {copied ? <Check className="h-4 w-4 text-[var(--poskoo-violet)]" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy result"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-6 text-center text-sm text-[var(--poskoo-muted)]">
            {parsed.length === 0
              ? "Paste your comments above to see how many entries are valid."
              : valid.length === 0
                ? "No comments match your filters. Try a different keyword or fewer tagged friends."
                : "Ready. Press Pick winner."}
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-sm">
        <Link href="/instagram-auto-dm" className="font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
          Auto-DM everyone who comments your giveaway keyword
        </Link>
      </p>
    </div>
  );
}
