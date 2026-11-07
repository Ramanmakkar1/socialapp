"use client";

import { useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Check, Copy, RefreshCw } from "lucide-react";
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

const CHIP_CLASS =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium text-[#3d3450] transition-colors hover:border-[var(--poskoo-violet)] hover:text-[var(--poskoo-violet)]";

export default function PostIdeasGenerator() {
  const [nicheId, setNicheId] = useState<string>("creator");
  const [format, setFormat] = useState<string>("all");
  const [seed, setSeed] = useState(1);
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nicheSelectId = useId();

  const ideas = useMemo<Idea[]>(
    () =>
      pickIdeas(nicheId, {
        format: format === "all" ? undefined : format,
        count: 6,
        seed,
      }),
    [nicheId, format, seed],
  );

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

  function ideaText(idea: Idea) {
    return `${idea.title}\nFormat: ${FORMAT_LABELS[idea.format] ?? idea.format}\nHook: ${idea.hook}\nCaption starter: ${idea.captionStarter}`;
  }

  return (
    <div className="text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={nicheSelectId} className="text-sm font-medium">
            Your niche
          </label>
          <select
            id={nicheSelectId}
            value={nicheId}
            onChange={(e) => setNicheId(e.target.value)}
            className="mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-base outline-none focus:border-[var(--poskoo-violet)]"
          >
            {NICHES.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="text-sm font-medium">Format</span>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFormat("all")}
              aria-pressed={format === "all"}
              className={`${CHIP_CLASS} ${format === "all" ? "!border-[var(--poskoo-violet)] !bg-[var(--poskoo-violet)] !text-white" : ""}`}
            >
              All
            </button>
            {FORMATS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormat(f)}
                aria-pressed={format === f}
                className={`${CHIP_CLASS} ${format === f ? "!border-[var(--poskoo-violet)] !bg-[var(--poskoo-violet)] !text-white" : ""}`}
              >
                {FORMAT_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setSeed((s) => s + 1)}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--poskoo-violet)] px-5 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
        >
          <RefreshCw className="h-4 w-4" />
          New ideas
        </button>
        <button
          type="button"
          onClick={() => copy("all", ideasToText(ideas))}
          disabled={ideas.length === 0}
          aria-label="Copy all ideas"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-5 text-sm font-semibold text-[#3d3450] hover:text-[var(--poskoo-violet)] disabled:opacity-50"
        >
          {copied === "all" ? (
            <Check className="h-4 w-4 text-[var(--poskoo-green)]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
          {copied === "all" ? "Copied" : "Copy all"}
        </button>
        <Link
          href="/signup"
          className="inline-flex min-h-11 items-center rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-5 text-sm font-semibold text-[#3d3450] hover:text-[var(--poskoo-violet)]"
        >
          Schedule this in Poskoo <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {ideas.map((idea, index) => {
          const cardId = `${nicheId}-${format}-${seed}-${index}`;
          return (
            <div
              key={cardId}
              className="flex flex-col rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-base font-semibold leading-snug text-[#3d3450]">
                  {idea.title}
                </h3>
                <span className="shrink-0 rounded-full bg-[var(--poskoo-band)] px-2.5 py-1 text-xs font-semibold text-[#3d3450]">
                  {FORMAT_LABELS[idea.format] ?? idea.format}
                </span>
              </div>
              <p className="mt-2 text-sm text-[#3d3450]">
                <span className="font-semibold">Hook:</span> {idea.hook}
              </p>
              <p className="mt-2 text-sm text-[var(--poskoo-muted)]">
                <span className="font-semibold text-[#3d3450]">Caption starter:</span>{" "}
                {idea.captionStarter}
              </p>
              <div className="mt-3 flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => copy(cardId, ideaText(idea))}
                  aria-label={`${copied === cardId ? "Copied" : "Copy"} idea ${index + 1}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 text-sm font-medium hover:text-[var(--poskoo-violet)]"
                >
                  {copied === cardId ? (
                    <Check className="h-4 w-4 text-[var(--poskoo-green)]" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied === cardId ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
