"use client";

import { useId, useMemo, useState } from "react";
import { ArrowRight, Check, Copy, Info, KeyRound, MessageCircle, Send, SlidersHorizontal, Tags } from "lucide-react";
import CommentKeywordTester from "@/components/CommentKeywordTester";
import type { MatchableRule } from "@/lib/match";

const INPUT =
  "mt-2 min-h-11 w-full min-w-0 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-base text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]/30";
const kpi = "grid min-w-0 content-start gap-1 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

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

const MATCH_TYPE_HELP: Record<MatchableRule["match_type"], string> = {
  contains:
    "Contains: after the same normalization as production, the comment must include the keyword as a whole word or phrase (space-padded), so “send GUIDE please” matches GUIDE but “guidebook” does not.",
  exact:
    "Exact: after normalization, the entire comment must equal the keyword—GUIDE and guide! match GUIDE, but “send GUIDE please” does not.",
};

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

      {/* Rule summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}><Tags className="h-3.5 w-3.5" aria-hidden="true" />Keywords</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{keywords.length}</p>
          <p className="mt-1 text-xs text-[#3d3450]">{keywords.length ? "Any one of them triggers the rule." : "Add at least one keyword."}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />Match type</p>
          <p className="mt-1 text-2xl font-bold capitalize text-[var(--poskoo-ink)]">{matchType}</p>
          <p className="mt-1 text-xs text-[#3d3450]">{matchType === "contains" ? "Most forgiving for real comments." : "Strict: no extra words."}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Duplicates</p>
          <p className={`mt-1 text-2xl font-bold tabular-nums ${dupes ? "text-[#c4410f]" : "text-[var(--poskoo-ink)]"}`}>{dupes}</p>
          <p className="mt-1 text-xs text-[#3d3450]">{dupes ? "Same keyword listed twice (case ignored)." : "Every keyword is unique."}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Longest keyword</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{longest}<span className="text-base font-medium text-[#5f5873]"> chars</span></p>
          <p className="mt-1 text-xs text-[#3d3450]">Short, distinct words are easiest to type.</p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Live tester (shared component) */}
        <div className="min-w-0 [&>section]:!py-4 sm:[&>section]:!p-5">
          <CommentKeywordTester keywords={keywords} matchType={matchType} commentTrigger />
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
            <li className="flex items-start gap-2.5 rounded-xl bg-[var(--poskoo-violet)] p-3 text-white">
              <Send className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wide opacity-80">Then</span>
                Poskoo can send your DM (in the app, once connected).
              </span>
            </li>
          </ol>
          <button
            type="button"
            onClick={copyKeywords}
            disabled={!keywords.length}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)] disabled:opacity-40"
          >
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : `Copy keywords (${keywords.length})`}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Keywords copied to clipboard" : ""}</span>
        </aside>
      </div>

      <div className="flex items-start gap-2 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
        <Info className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-xs leading-relaxed text-[#3d3450]">{MATCH_TYPE_HELP.contains}</p>
          <p className="!mt-2 text-xs leading-relaxed text-[#3d3450]">{MATCH_TYPE_HELP.exact}</p>
        </div>
      </div>
    </div>
  );
}
