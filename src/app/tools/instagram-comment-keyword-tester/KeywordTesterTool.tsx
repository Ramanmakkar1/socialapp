"use client";

import { useId, useMemo, useState } from "react";
import { ArrowRight, Check, Copy, KeyRound, MessageCircle, Send, SlidersHorizontal, Tags } from "lucide-react";
import CommentKeywordTester from "@/components/CommentKeywordTester";
import type { MatchableRule } from "@/lib/match";

const INPUT =
  "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-base text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]/30";
const stat = "inline-flex min-w-0 items-center gap-2 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-1.5 text-[var(--poskoo-ink)]";
const statLabel = "flex items-center gap-1 text-xs font-medium text-[var(--poskoo-muted)]";

function parseKeywords(raw: string): string[] {
  return raw
    .split(/[,，]/)
    .map((part) => part.trim())
    .filter(Boolean);
}

const MATCH_TYPES: { value: MatchableRule["match_type"]; label: string }[] = [
  { value: "contains", label: "Comment contains keyword" },
  { value: "exact", label: "Comment matches exactly" },
];


export default function KeywordTesterTool() {
  const keywordsId = useId();
  const matchId = useId();
  const [keywordText, setKeywordText] = useState("GUIDE");
  const [matchType, setMatchType] = useState<MatchableRule["match_type"]>("contains");
  const [copied, setCopied] = useState(false);
  const keywords = useMemo(() => parseKeywords(keywordText), [keywordText]);
  // Case-insensitive duplicates, derived from the parsed list only.
  const unique = new Set(keywords.map((k) => k.toLowerCase())).size;
  const dupes = keywords.length - unique;
  const longest = keywords.reduce((m, k) => Math.max(m, k.length), 0);

  async function copyKeywords() {
    try {
      await navigator.clipboard.writeText(keywords.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Rule inputs */}
      <div className="grid min-w-0 gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <label htmlFor={keywordsId} className="flex items-center gap-1.5 text-sm font-semibold text-[var(--poskoo-ink)]">
            <KeyRound className="h-4 w-4 text-[var(--poskoo-violet)]" aria-hidden="true" />
            Keywords
          </label>
          <input
            id={keywordsId}
            type="text"
            value={keywordText}
            onChange={(e) => setKeywordText(e.target.value)}
            className={INPUT}
            placeholder="GUIDE, LINK"
            autoComplete="off"
          />
          {keywords.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {keywords.map((k, i) => (
                <span
                  key={`${k}-${i}`}
                  className="inline-block max-w-full break-words rounded-md bg-[var(--poskoo-band)] px-2 py-0.5 font-mono text-xs font-semibold text-[var(--poskoo-violet)]"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
          <p className="!mt-1.5 text-xs text-[#3d3450]">Comma-separated, same parsing as auto-DM rules in the app.</p>
        </div>
        <div className="min-w-0">
          <label htmlFor={matchId} className="flex items-center gap-1.5 text-sm font-semibold text-[var(--poskoo-ink)]">
            <SlidersHorizontal className="h-4 w-4 text-[var(--poskoo-violet)]" aria-hidden="true" />
            Match type
          </label>
          <select
            id={matchId}
            value={matchType}
            onChange={(e) => setMatchType(e.target.value as MatchableRule["match_type"])}
            className={INPUT}
          >
            {MATCH_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <p className="!mt-1.5 text-xs text-[#3d3450]">
            {matchType === "contains" ? "Whole word or phrase anywhere in the comment." : "The whole comment must equal a keyword."}
          </p>
        </div>
      </div>

      {/* Rule summary: one compact row (was four oversized stat cards). */}
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
      <dl className="contents" aria-label="Rule summary">
        <div className={stat}>
          <dt className={statLabel}><Tags className="h-3.5 w-3.5" aria-hidden="true" />Keywords</dt>
          <dd className="font-bold tabular-nums">{keywords.length}</dd>
        </div>
        <div className={stat}>
          <dt className={statLabel}><SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />Match</dt>
          <dd className="font-bold capitalize">{matchType}</dd>
        </div>
        <div className={`${stat} ${dupes ? "border-[var(--poskoo-coral)]" : ""}`}>
          <dt className={statLabel}>Duplicates</dt>
          <dd className={`font-bold tabular-nums ${dupes ? "text-[#b2380a]" : ""}`}>{dupes}</dd>
        </div>
        <div className={stat}>
          <dt className={statLabel}>Longest</dt>
          <dd className="font-bold tabular-nums">{longest} chars</dd>
        </div>
      </dl>
        <p className="text-xs text-[var(--poskoo-muted)] sm:ml-1">
          {!keywords.length ? "Add at least one keyword." : dupes ? "Remove the repeated keyword (case is ignored)." : "Short, distinct keywords are easiest to type."}
        </p>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Live tester (shared component) */}
        <div className="min-w-0 [&>section]:!py-4 sm:[&>section]:!p-5">
          <CommentKeywordTester keywords={keywords} matchType={matchType} commentTrigger showBadge={false} />
        </div>

        {/* Rule card */}
        <aside aria-labelledby={`${keywordsId}-rule`} className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <h3 id={`${keywordsId}-rule`} className="text-sm font-semibold">Your auto-DM rule</h3>
          <ol className="space-y-2 text-sm">
            <li className="flex items-start gap-2.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3">
              <MessageCircle className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">When a comment</span>
                {matchType === "contains" ? "contains" : "exactly matches"}{" "}
                {keywords.length ? (
                  keywords.map((k, i) => (
                    <span key={`${k}-${i}`}>
                      {i > 0 && <span className="text-[#5f5873]"> or </span>}
                      <b className="font-mono [overflow-wrap:anywhere]">{k}</b>
                    </span>
                  ))
                ) : (
                  <span className="text-[#5f5873]">a keyword you add</span>
                )}
              </span>
            </li>
            <li aria-hidden="true" className="flex justify-center"><ArrowRight className="h-4 w-4 rotate-90 text-[#5f5873]" /></li>
            <li className="flex items-start gap-2.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] p-3">
              <Send className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">Then</span>
                Poskoo can send your DM (in the app, once connected).
              </span>
            </li>
          </ol>
          <button
            type="button"
            onClick={copyKeywords}
            disabled={!keywords.length}
            className="btn btn-dark w-full justify-center disabled:opacity-40"
          >
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : `Copy keywords (${keywords.length})`}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Keywords copied to clipboard" : ""}</span>
        </aside>
      </div>
    </div>
  );
}
