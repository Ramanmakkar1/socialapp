"use client";

import { useId, useState } from "react";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { matchComment, type MatchableRule } from "@/lib/match";

type Props = {
  keywords: string[];
  matchType: MatchableRule["match_type"];
  commentTrigger: boolean;
  /** "Keyword simulation only" pill. Off where the surrounding card already says it (free tool page). */
  showBadge?: boolean;
};

const SAMPLES = ["GUIDE", "guide!", "send GUIDE please", "hello", ""];

export default function CommentKeywordTester({ keywords, matchType, commentTrigger, showBadge = true }: Props) {
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
        {showBadge && <span className="rounded-full bg-[var(--poskoo-card)] px-2.5 py-1 text-xs font-medium text-[#3d3450]">Keyword simulation only</span>}
      </div>
      <p
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={`!mt-3 flex min-w-0 items-start gap-2.5 break-words rounded-xl border p-3 text-sm ${matched ? "border-[var(--poskoo-green)] bg-[color-mix(in_srgb,var(--poskoo-mint)_55%,var(--poskoo-card))] text-[var(--poskoo-ink)]" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] text-[#3d3450]"}`}
      >
        {matched
          ? <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-[#14744d]" aria-hidden="true" />
          : <MessageCircle className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />}
        <span className="min-w-0">{feedback}</span>
      </p>
      <label htmlFor={`${id}-comment`} className="!mt-4 block text-sm font-medium text-[#3d3450]">Example comment</label>
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
      <div className="!mt-4 space-y-1.5 rounded-xl bg-[var(--poskoo-card)]/60 px-3 py-2.5 text-xs leading-relaxed text-[var(--poskoo-muted)]">
        <p id={`${id}-mode`}>
          {matchType === "exact"
            ? "Exact: the whole comment must equal a keyword (GUIDE and guide! match; send GUIDE please doesn't)."
            : "Contains: the keyword can appear anywhere as a whole word (send GUIDE please matches; guidebook doesn't)."}
          {" "}Case, accents, punctuation and leading @mentions are ignored.
        </p>
        <p id={`${id}-scope`} className="!mt-1.5">Local preview only: nothing is saved or sent. Real sending also depends on the connected account, rule status and post scope.</p>
      </div>
    </section>
  );
}
