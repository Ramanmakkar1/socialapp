"use client";

import { useId, useState } from "react";
import { Check, Copy, Eraser, ListOrdered, Type } from "lucide-react";
import { countX, X_LIMIT } from "@/lib/xCharCount";
import { countThreads, THREADS_LIMITS } from "@/lib/threadsCharCount";

const SAMPLE =
  "Posting at the right time is easier when you plan ahead. A content calendar turns a pile of ideas into a steady schedule you can actually keep up with.\n\nStart by choosing the days and times your audience is most active. Then write each post in advance, add the image or link, and let the queue publish it for you.\n\nScheduling also gives you room to review your wording before it goes live. You can check the character count, fix a typo, and make sure every link works.\n\nKeep a few slots open for timely posts. When news breaks or a conversation takes off, you can still join in without breaking your routine.\n\nReview your results each week. Keep the formats that get replies and saves, and drop the ones that do not. Small adjustments add up over time.";

const ghostBtn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

type Style = "end" | "start";

function pack(paragraphs: string[], suffixLength: number, limit: number, count: (value: string) => number): string[] {
  const posts: string[] = [];
  let current = "";
  const fits = (value: string) => count(value + " ".repeat(suffixLength)) <= limit;

  function pushCurrent() {
    if (current.trim()) posts.push(current.trim());
    current = "";
  }

  function addUnit(text: string, separator: string) {
    const candidate = current ? current + separator + text : text;
    if (fits(candidate)) {
      current = candidate;
      return;
    }
    if (current) pushCurrent();
    if (fits(text)) {
      current = text;
      return;
    }

    const words = text.split(/\s+/).filter(Boolean);
    for (const word of words) {
      const wordCandidate = current ? current + " " + word : word;
      if (fits(wordCandidate)) {
        current = wordCandidate;
        continue;
      }
      if (current) pushCurrent();
      if (fits(word)) {
        current = word;
        continue;
      }

      let rest = word;
      while (rest) {
        let low = 1;
        let high = rest.length;
        let best = 1;
        while (low <= high) {
          const mid = (low + high) >> 1;
          if (fits(rest.slice(0, mid))) {
            best = mid;
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }
        if (current) pushCurrent();
        current = rest.slice(0, best);
        rest = rest.slice(best);
        if (rest) pushCurrent();
      }
    }
  }

  for (let p = 0; p < paragraphs.length; p += 1) {
    const sentences = paragraphs[p].split(/(?<=[.!?])\s+/).filter(Boolean);
    for (let s = 0; s < sentences.length; s += 1) {
      const separator = current ? (s === 0 && p > 0 ? "\n\n" : " ") : "";
      addUnit(sentences[s], separator);
    }
  }
  pushCurrent();
  return posts;
}

function splitThread(text: string, numbering: boolean, style: Style, limit: number, count: (value: string) => number): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  if (!paragraphs.length) return [];

  let total = 1;
  let posts: string[] = [];
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const suffixLength = numbering ? ` ${total}/${total}`.length : 0;
    posts = pack(paragraphs, suffixLength, limit, count);
    if (posts.length === total) break;
    total = posts.length;
  }

  if (!numbering) return posts;
  return posts.map((post, index) => {
    const label = `${index + 1}/${posts.length}`;
    return style === "start" ? `${label} ${post}` : `${post} ${label}`;
  });
}

function CountCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Type }) {
  return (
    <div className={kpi}>
      <p className={kpiLabel}><Icon className="h-3 w-3" aria-hidden="true" />{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{value.toLocaleString("en-US")}</p>
    </div>
  );
}

export default function ThreadMaker({ platform = "x" }: { platform?: "x" | "threads" }) {
  const [text, setText] = useState(SAMPLE);
  const [numbering, setNumbering] = useState(true);
  const [style, setStyle] = useState<Style>("end");
  const [copied, setCopied] = useState<number | "all" | null>(null);
  const id = useId();

  const isThreads = platform === "threads";
  const limit = isThreads ? THREADS_LIMITS.post : X_LIMIT;
  const count = (value: string) => (isThreads ? countThreads(value).chars : countX(value).weighted);

  const posts = splitThread(text, numbering, style, limit, count);
  const totalCharacters = posts.reduce((sum, post) => sum + count(post), 0);

  async function copy(value: string, key: number | "all") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
        {/* Input */}
        <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={id} className="text-sm font-semibold">Your long text</label>
            <button type="button" className={ghostBtn} onClick={() => setText("")} disabled={!text}>
              <Eraser className="h-4 w-4" aria-hidden="true" />Clear
            </button>
          </div>
          <textarea
            id={id}
            aria-label="Your long text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={10}
            placeholder="Paste the text you want to turn into a thread…"
            className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium">
              <input
                type="checkbox"
                checked={numbering}
                onChange={(event) => setNumbering(event.target.checked)}
                className="h-4 w-4 accent-[var(--poskoo-violet)]"
              />
              Add numbering (1/5)
            </label>
            <label className="flex min-h-10 items-center gap-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium">
              <span className="text-[#5f5873]">Style</span>
              <select
                value={style}
                onChange={(event) => setStyle(event.target.value as Style)}
                disabled={!numbering}
                className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none disabled:opacity-40"
              >
                <option value="end">1/5 at the end</option>
                <option value="start">1/5 at the start</option>
              </select>
            </label>
          </div>
          <p className="mt-2 text-xs text-[#5f5873]">
            {isThreads
              ? "Posts are split at sentence breaks and kept under 500 characters, counted by code point."
              : "Posts are split at sentence breaks and kept under 280 weighted characters, with links counted as 23 and emoji as 2."}
          </p>
        </div>

        {/* Summary */}
        <aside aria-label="Thread summary" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <div className="grid grid-cols-2 gap-3">
            <CountCard label="Posts" value={posts.length} icon={ListOrdered} />
            <CountCard label="Characters" value={totalCharacters} icon={Type} />
          </div>
          <button
            type="button"
            onClick={() => copy(posts.join("\n\n---\n\n"), "all")}
            disabled={!posts.length}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40"
          >
            {copied === "all" ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied === "all" ? "Copied all" : "Copy all"}
          </button>
          <span className="sr-only" aria-live="polite">{copied === "all" ? "Copied all posts to clipboard" : ""}</span>
          <p className="text-xs text-[#5f5873]">Copy all joins the posts with a divider so you can paste them in order.</p>
        </aside>
      </div>

      {/* Posts */}
      <div className="space-y-3">
        {posts.length ? (
          posts.map((post, index) => {
            const postCount = count(post);
            const over = postCount > limit;
            return (
              <article key={index} className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#5f5873]">Post {index + 1}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-semibold tabular-nums ${over ? "text-[var(--poskoo-red)]" : "text-[#5f5873]"}`}>
                      {postCount}/{limit}
                    </span>
                    <button type="button" className={ghostBtn} onClick={() => copy(post, index)}>
                      {copied === index ? <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                      {copied === index ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words text-base leading-6 text-[var(--poskoo-ink)]">{post}</p>
              </article>
            );
          })
        ) : (
          <p className="rounded-2xl border border-dashed border-[var(--poskoo-line)] p-6 text-center text-sm text-[#5f5873]">
            Paste some text to split it into a thread.
          </p>
        )}
      </div>
    </div>
  );
}
