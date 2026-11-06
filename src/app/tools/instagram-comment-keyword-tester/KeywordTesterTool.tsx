"use client";

import { useId, useMemo, useState } from "react";
import CommentKeywordTester from "@/components/CommentKeywordTester";
import type { MatchableRule } from "@/lib/match";

const INPUT =
  "mt-1.5 w-full min-w-0 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]/30";

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
  const keywords = useMemo(() => parseKeywords(keywordText), [keywordText]);

  return (
    <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 sm:p-6">
      <div className="grid min-w-0 gap-5 sm:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor={keywordsId} className="text-sm font-medium text-[#3d3450]">
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
              {keywords.map((k) => (
                <span
                  key={k}
                  className="inline-block max-w-full break-words rounded-md bg-[var(--poskoo-band)] px-2 py-0.5 font-mono text-xs font-semibold text-[var(--poskoo-violet)]"
                >
                  {k}
                </span>
              ))}
            </div>
          )}
          <p className="mt-1 text-xs text-[var(--poskoo-muted)]">Comma-separated, same parsing as auto-DM rules in the app.</p>
        </div>
        <div className="min-w-0">
          <label htmlFor={matchId} className="text-sm font-medium text-[#3d3450]">
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
        </div>
      </div>
      <div className="mt-5 min-w-0">
        <CommentKeywordTester keywords={keywords} matchType={matchType} commentTrigger />
      </div>
      <p className="mt-4 text-xs leading-relaxed text-[#3d3450]">{MATCH_TYPE_HELP.contains}</p>
      <p className="mt-2 text-xs leading-relaxed text-[#3d3450]">{MATCH_TYPE_HELP.exact}</p>
    </div>
  );
}
