"use client";

import { useId, useState } from "react";
import { matchComment, type MatchableRule } from "@/lib/match";

type Props = {
  keywords: string[];
  matchType: MatchableRule["match_type"];
  commentTrigger: boolean;
};

const SAMPLES = ["GUIDE", "guide!", "send GUIDE please", "hello", ""];

export default function CommentKeywordTester({ keywords, matchType, commentTrigger }: Props) {
  const id = useId();
  const [comment, setComment] = useState("");
  const match = matchComment(comment, [{
    id: "local-preview", keywords, match_type: matchType, status: "active",
  }]);
  const matched = commentTrigger && Boolean(match);
  const feedback = !commentTrigger
    ? "Comment trigger is off. Select ‘Comments on my posts’ to test comment keywords."
    : keywords.length === 0
      ? "Add a keyword above, such as GUIDE, to start testing."
      : !comment.trim()
        ? "Enter an example comment or choose a sample below."
        : match
          ? `Matched keyword: “${match.keyword}”. This comment passes the keyword check.`
          : "No keyword match. Try another comment or adjust your keywords or match type.";

  return (
    <section aria-labelledby={`${id}-title`} className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`${id}-title`} className="text-sm font-semibold text-[var(--poskoo-ink)]">Try your keywords</h3>
        <span className="rounded-full bg-[var(--poskoo-card)] px-2.5 py-1 text-xs font-medium text-[#3d3450]">Keyword simulation only</span>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <svg viewBox="0 0 200 128" aria-hidden="true" focusable="false" className="w-28 shrink-0 sm:w-36">
          <ellipse cx="98" cy="115" rx="86" ry="8" fill="var(--poskoo-violet)" opacity=".08" />
          <rect x="60" y="12" width="126" height="86" rx="16" fill="var(--poskoo-card)" stroke="var(--poskoo-line)" />
          <rect x="72" y="24" width="44" height="6" rx="3" fill="var(--poskoo-violet)" opacity=".3" />
          <path d="M84 42h77a9 9 0 0 1 9 9v17a9 9 0 0 1-9 9h-47l-13 9v-9H84a9 9 0 0 1-9-9V51a9 9 0 0 1 9-9Z" fill="var(--poskoo-violet)" opacity=".12" />
          <text x="122" y="63" textAnchor="middle" fill="var(--poskoo-violet)" fontSize="12" fontWeight="600">{matched ? "Match!" : "Try it"}</text>
          <path d="M18 108V82c0-15 37-15 37 0v26" fill="var(--poskoo-violet)" />
          <circle cx="36" cy="55" r="15" fill="var(--poskoo-coral)" />
          <path d="M21 54c-5-23 35-25 31 0l-9-10-22 10Z" fill="var(--poskoo-ink)" />
          <path d="m49 83 18 8 13-19" fill="none" stroke="var(--poskoo-coral)" strokeWidth="9" strokeLinecap="round" />
          <rect x="75" y="58" width="14" height="23" rx="4" fill="#3d3450" transform="rotate(15 82 70)" />
          <path d="m178 5 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="var(--poskoo-coral)" className="motion-safe:animate-pulse motion-reduce:animate-none" />
        </svg>
        <p role="status" aria-live="polite" aria-atomic="true" className="min-w-0 break-words rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-sm text-[#3d3450]">
          {feedback}
        </p>
      </div>
      <label htmlFor={`${id}-comment`} className="mt-3 block text-sm font-medium text-[#3d3450]">Example comment</label>
      <input
        id={`${id}-comment`}
        type="text"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        aria-describedby={`${id}-mode ${id}-scope`}
        placeholder="Try: send GUIDE please"
        className="mt-1.5 w-full min-w-0 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]/30"
      />
      <div role="group" aria-label="Sample comments for the GUIDE keyword" className="mt-2 flex flex-wrap gap-2">
        {SAMPLES.map((sample) => (
          <button
            key={sample}
            type="button"
            onClick={() => setComment(sample)}
            className="min-h-11 max-w-full break-words rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-xs font-medium text-[#3d3450] hover:border-[var(--poskoo-violet)] hover:text-[var(--poskoo-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)]"
          >
            {sample || "Empty input"}
          </button>
        ))}
      </div>
      <p id={`${id}-mode`} className="mt-3 text-xs leading-relaxed text-[#3d3450]">
        {matchType === "exact"
          ? "Exact: the entire normalized comment must equal a keyword. GUIDE and guide! match GUIDE; send GUIDE please does not."
          : "Contains: matches a whole word or phrase anywhere in the comment. GUIDE, guide! and send GUIDE please match GUIDE; guidebook does not."}
        {" "}Both modes ignore case, accents and punctuation, collapse spaces and remove leading @mentions. Samples use your current keywords; add GUIDE above to try these examples.
      </p>
      <p id={`${id}-scope`} className="mt-2 text-xs leading-relaxed text-[#3d3450]">
        Local preview only: nothing is saved or sent, and no webhooks are called. Account connection, rule status, post scope and delivery permissions still determine real sending.
      </p>
    </section>
  );
}
