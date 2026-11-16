"use client";

import { useId, useState } from "react";
import { ArrowDown, Check, Copy, Heart, ListOrdered, Mail, MessageCircle, Send, SlidersHorizontal, Zap } from "lucide-react";
import { matchComment, type MatchableRule } from "@/lib/match";
import s from "@/components/site.module.css";

type MatchType = MatchableRule["match_type"];

const INPUT =
  "mt-1.5 min-h-11 w-full min-w-0 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-base text-[var(--poskoo-ink)] sm:text-sm placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]/30";
const LABEL = "block text-sm font-medium text-[#3d3450]";
const HINT = "!mt-1.5 text-xs leading-relaxed text-[#3d3450]";
const STEP_LABEL = "text-[11px] font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]";
const kpi = "grid min-w-0 content-start gap-1 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

const MATCH_EXAMPLES: {
  title: string;
  keyword: string;
  comment: string;
  matchType: MatchType;
  explanation: string;
  button: string;
}[] = [
  {
    title: "Contains finds a keyword in a sentence",
    keyword: "GUIDE",
    comment: "Can you send the GUIDE please?",
    matchType: "contains",
    explanation: "GUIDE appears as a whole word, so this longer comment matches.",
    button: "Try the contains example",
  },
  {
    title: "Exact rejects extra words",
    keyword: "GUIDE",
    comment: "Can you send the GUIDE please?",
    matchType: "exact",
    explanation: "The whole comment is not just GUIDE, so this does not match.",
    button: "Try the exact non-match",
  },
  {
    title: "Exact ignores case and punctuation",
    keyword: "GUIDE",
    comment: "guide!",
    matchType: "exact",
    explanation: "Case and punctuation are normalized, leaving only the keyword GUIDE.",
    button: "Try the exact match",
  },
];

function findMatch(comment: string, keyword: string, matchType: MatchType) {
  return matchComment(comment, [
    { id: "local-flow-preview", keywords: [keyword], match_type: matchType, status: "active" },
  ]);
}

export default function FlowPreview() {
  const id = useId();
  const [keyword, setKeyword] = useState("GUIDE");
  const [comment, setComment] = useState("GUIDE please!");
  const [dmText, setDmText] = useState("Thanks for commenting! Here is the guide you asked for.");
  const [matchType, setMatchType] = useState<MatchType>("contains");
  const [captureEmail, setCaptureEmail] = useState(false);
  const [emailPrompt, setEmailPrompt] = useState("Want the full guide? Leave your email and I'll send it over.");
  const [sampleEmail, setSampleEmail] = useState("reader@example.com");
  const [followUpDm, setFollowUpDm] = useState(
    "Thanks! I've sent the guide to your inbox. Reply here if you have questions.",
  );
  const [copied, setCopied] = useState(false);

  async function copyDm() {
    try {
      await navigator.clipboard.writeText(dmText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const hasKeyword = keyword.trim().length > 0;
  const hasComment = comment.trim().length > 0;
  const hasDm = dmText.trim().length > 0;
  const hasEmailPrompt = emailPrompt.trim().length > 0;
  const hasSampleEmail = sampleEmail.trim().length > 0;
  const hasFollowUp = followUpDm.trim().length > 0;
  const match = hasKeyword && hasComment ? findMatch(comment, keyword, matchType) : null;
  const matchedKeyword = match?.keyword === "*" ? "Any comment" : match?.keyword;

  const baseStatus = !hasKeyword
    ? "Enter a keyword to test this comment. No DM preview is shown yet."
    : !hasComment
      ? "Enter a sample comment to test your keyword. No DM preview is shown yet."
      : match
        ? hasDm
          ? `Matched “${matchedKeyword}” with ${matchType} matching. Your outgoing DM preview is ready; nothing was sent.`
          : `Matched “${matchedKeyword}”. Enter DM text to complete the outgoing message preview.`
        : `No ${matchType} match, so no outgoing DM preview is shown.`;

  const emailStatus = !captureEmail
    ? ""
    : !hasEmailPrompt
      ? " Add an email prompt to complete the capture step."
      : !hasSampleEmail
        ? " Add a sample email to preview the capture step."
        : !hasFollowUp
          ? " Add follow-up DM text to complete the email flow."
          : " The email capture and follow-up DM previews are ready; nothing was sent or saved.";

  const status = baseStatus + emailStatus;

  function tryExample(example: (typeof MATCH_EXAMPLES)[number]) {
    setKeyword(example.keyword);
    setComment(example.comment);
    setMatchType(example.matchType);
  }

  return (
    <section aria-labelledby={`${id}-title`} className="min-w-0 space-y-5 !py-0 text-left">
      <div className="min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">Interactive local preview</p>
          <h2 id={`${id}-title`} className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            See a comment become a DM
          </h2>
        </div>
        <span className="rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-1 text-xs font-medium text-[#3d3450]">
          Preview only · not a live Meta connection
        </span>
      </div>
      <p className="!mt-3 max-w-2xl text-sm leading-relaxed text-[#3d3450]">
        Change the keyword, sample comment, match type or DM text, then switch on the optional email-capture step to
        preview a prompt, a submitted sample email and a follow-up DM. The preview updates in this browser; it does not
        contact Instagram, send a message or save your entries.
      </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={`${kpi} ${match ? "border-[var(--poskoo-green)]/40 bg-[var(--poskoo-mint)]/35" : ""}`}>
          <p className={kpiLabel}><Zap className="h-3.5 w-3.5" aria-hidden="true" />Keyword check</p>
          <p className={`mt-0.5 text-xl font-bold ${match ? "text-[#146b43]" : "text-[var(--poskoo-ink)]"}`}>{match ? "Matched" : "No match"}</p>
          <p className="mt-1 truncate text-xs text-[#3d3450]">{match ? `On “${matchedKeyword}”` : hasKeyword && hasComment ? "No DM would be sent." : "Add a keyword and comment."}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />Match type</p>
          <p className="mt-0.5 text-xl font-bold capitalize text-[var(--poskoo-ink)]">{matchType}</p>
          <p className="mt-1 text-xs text-[#3d3450]">{matchType === "contains" ? "Keyword anywhere." : "Whole comment only."}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />DM length</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{dmText.length}<span className="text-base font-medium text-[#5f5873]"> / 1,000</span></p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-band)]" aria-hidden="true">
            <div className="h-full rounded-full bg-[var(--poskoo-violet)] transition-all" style={{ width: `${(dmText.length / 1000) * 100}%` }} />
          </div>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><ListOrdered className="h-3.5 w-3.5" aria-hidden="true" />Flow steps</p>
          <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{captureEmail ? 5 : 3}</p>
          <p className="mt-1 text-xs text-[#3d3450]">{captureEmail ? "With email capture." : "Comment, check, DM."}</p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="grid min-w-0 content-start gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <h3 className="text-sm font-semibold text-[var(--poskoo-ink)]">Your example rule</h3>
          <div>
            <label htmlFor={`${id}-keyword`} className={LABEL}>
              Trigger keyword
            </label>
            <input
              id={`${id}-keyword`}
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="GUIDE"
              autoComplete="off"
              spellCheck={false}
              aria-describedby={`${id}-keyword-hint`}
              className={INPUT}
            />
            <p id={`${id}-keyword-hint`} className={HINT}>
              Try one word such as GUIDE, LINK or PRICE.
            </p>
          </div>

          <div>
            <label htmlFor={`${id}-comment`} className={LABEL}>
              Sample post comment
            </label>
            <textarea
              id={`${id}-comment`}
              rows={3}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="GUIDE please!"
              aria-describedby={`${id}-comment-hint`}
              className={`${INPUT} resize-y`}
            />
            <p id={`${id}-comment-hint`} className={HINT}>
              This is an example comment, not a comment imported from one of your posts.
            </p>
          </div>

          <div>
            <label htmlFor={`${id}-match-type`} className={LABEL}>
              Match type
            </label>
            <select
              id={`${id}-match-type`}
              value={matchType}
              onChange={(event) => setMatchType(event.target.value as MatchType)}
              aria-describedby={`${id}-match-type-hint`}
              className={INPUT}
            >
              <option value="contains">Contains keyword</option>
              <option value="exact">Exact match only</option>
            </select>
            <p id={`${id}-match-type-hint`} className={HINT}>
              {matchType === "contains"
                ? "Contains finds the keyword as a whole word or phrase inside a longer comment."
                : "Exact requires the entire comment to equal the keyword after normalization."}
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-2">
              <label htmlFor={`${id}-dm`} className={LABEL}>
                Outgoing DM text
              </label>
              <span className="text-xs text-[var(--poskoo-muted)]">{dmText.length}/1,000</span>
            </div>
            <textarea
              id={`${id}-dm`}
              rows={5}
              maxLength={1000}
              value={dmText}
              onChange={(event) => setDmText(event.target.value)}
              placeholder="Thanks for commenting! Here is the guide you asked for."
              aria-describedby={`${id}-dm-hint`}
              className={`${INPUT} resize-y`}
            />
            <p id={`${id}-dm-hint`} className={HINT}>
              Leave this empty to see the missing-message state. Text stays in this browser tab.
            </p>
          </div>

          <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3">
            <label htmlFor={`${id}-capture-email`} className="flex min-h-11 cursor-pointer items-center gap-3">
              <input
                id={`${id}-capture-email`}
                type="checkbox"
                checked={captureEmail}
                onChange={(event) => setCaptureEmail(event.target.checked)}
                className="h-5 w-5 shrink-0 accent-[var(--poskoo-violet)]"
              />
              <Mail aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--poskoo-violet)]" />
              <span className="text-sm font-medium text-[var(--poskoo-ink)]">Add an optional email-capture step</span>
            </label>
            <p className={HINT}>
              Off by default. When on, the preview shows a sample email prompt, a submitted sample email and a follow-up
              DM. Use sample data only; nothing is sent or saved.
            </p>
          </div>

          {captureEmail && (
            <>
              <div>
                <label htmlFor={`${id}-email-prompt`} className={LABEL}>
                  Email prompt
                </label>
                <textarea
                  id={`${id}-email-prompt`}
                  rows={3}
                  value={emailPrompt}
                  onChange={(event) => setEmailPrompt(event.target.value)}
                  placeholder="Want the full guide? Leave your email and I'll send it over."
                  aria-describedby={`${id}-email-prompt-hint`}
                  className={`${INPUT} resize-y`}
                />
                <p id={`${id}-email-prompt-hint`} className={HINT}>
                  The message that asks the visitor for an email address.
                </p>
              </div>

              <div>
                <label htmlFor={`${id}-sample-email`} className={LABEL}>
                  Sample visitor email
                </label>
                <input
                  id={`${id}-sample-email`}
                  type="email"
                  value={sampleEmail}
                  onChange={(event) => setSampleEmail(event.target.value)}
                  placeholder="reader@example.com"
                  autoComplete="off"
                  spellCheck={false}
                  aria-describedby={`${id}-sample-email-hint`}
                  className={INPUT}
                />
                <p id={`${id}-sample-email-hint`} className={HINT}>
                  Example data only. Do not enter a real email address; this field is never submitted or stored.
                </p>
              </div>

              <div>
                <label htmlFor={`${id}-follow-up`} className={LABEL}>
                  Follow-up DM after email
                </label>
                <textarea
                  id={`${id}-follow-up`}
                  rows={4}
                  value={followUpDm}
                  onChange={(event) => setFollowUpDm(event.target.value)}
                  placeholder="Thanks! I've sent the guide to your inbox."
                  aria-describedby={`${id}-follow-up-hint`}
                  className={`${INPUT} resize-y`}
                />
                <p id={`${id}-follow-up-hint`} className={HINT}>
                  The message sent after the sample email is captured. Leave it empty to see the missing-message state.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="grid min-w-0 content-start gap-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <h3 className="text-sm font-semibold text-[var(--poskoo-ink)]">Your local flow preview</h3>
          <div className="mx-auto w-full max-w-[400px] min-w-0 overflow-hidden rounded-[28px] border-[6px] border-[var(--poskoo-ink)] bg-[var(--poskoo-card)] shadow-[0_18px_30px_-22px_rgba(30,22,49,0.45)]">
            <div className="flex items-center gap-3 border-b border-[var(--poskoo-line)] px-4 py-3">
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--poskoo-violet)] text-xs font-bold text-white"
              >
                YB
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--poskoo-ink)]">yourbrand</span>
                <span className="block text-xs text-[var(--poskoo-muted)]">Sample Instagram post</span>
              </span>
            </div>
            <div
              className="relative h-28"
              style={{ background: "linear-gradient(135deg, var(--poskoo-lilac), var(--poskoo-pink))" }}
            >
              <svg viewBox="0 0 360 112" aria-hidden="true" focusable="false" className="h-full w-full">
                <circle cx="180" cy="44" r="22" fill="var(--poskoo-card)" opacity=".9" />
                <path d="M162 43h36M180 27v34" stroke="var(--poskoo-violet)" strokeWidth="4" strokeLinecap="round" />
                <path d="m92 24 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="var(--poskoo-card)" />
                <path d="m268 54 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="var(--poskoo-card)" opacity=".85" />
              </svg>
              <span className="absolute inset-x-3 bottom-3 mx-auto block w-fit max-w-[calc(100%-1.5rem)] rounded-full bg-[var(--poskoo-ink)] px-3 py-1.5 text-center text-xs font-semibold text-white [overflow-wrap:anywhere]">
                Comment {keyword.trim() || "your keyword"} for the guide
              </span>
            </div>
            <div aria-hidden="true" className="flex gap-4 border-b border-[var(--poskoo-line)] px-4 py-3">
              <Heart className="h-5 w-5" />
              <MessageCircle className="h-5 w-5" />
              <Send className="h-5 w-5" />
            </div>

            <div className={s.flowSteps + " px-4 py-4"}>
              <div className={s.flowStep}>
                <p className={STEP_LABEL}>1 · Post comment</p>
                <div className="mt-1 flex min-w-0 items-start gap-2.5">
                  <span aria-hidden="true" className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--poskoo-peach)] text-xs font-bold">
                    SF
                  </span>
                  <div className="min-w-0 rounded-2xl rounded-tl-md border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-2 text-sm">
                    <span className="mr-1.5 font-semibold">sample.follower</span>
                    <span className="whitespace-pre-wrap [overflow-wrap:anywhere]">
                      {hasComment ? comment : "Your sample comment will appear here."}
                    </span>
                  </div>
                </div>
              </div>

              <ArrowDown aria-hidden="true" className="mx-auto h-4 w-4 text-[var(--poskoo-muted)]" />
              <div className={s.flowStep}>
                <p className={STEP_LABEL}>2 · Keyword check · {matchType}</p>
                <div
                  className={`mt-1 flex min-w-0 items-center gap-2 rounded-xl border px-3 py-2.5 text-sm ${
                    match
                      ? "border-[var(--poskoo-green)]/30 bg-[var(--poskoo-mint)]/45"
                      : "border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-band)]"
                  }`}
                >
                  {match && <Check aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--poskoo-green)]" />}
                  <span className="min-w-0 [overflow-wrap:anywhere]">
                    {match ? (
                      <>Matched keyword: <strong>{matchedKeyword}</strong></>
                    ) : (
                      "No keyword matched"
                    )}
                  </span>
                </div>
              </div>

              <ArrowDown aria-hidden="true" className="mx-auto h-4 w-4 text-[var(--poskoo-muted)]" />
              <div className={s.flowStep}>
                <p className={STEP_LABEL}>3 · Outgoing DM preview</p>
                <div
                  className={`mt-1 ml-auto w-fit max-w-[95%] rounded-2xl rounded-br-md px-3 py-2.5 text-sm ${
                    match && hasDm
                      ? "bg-[var(--poskoo-violet)] text-white"
                      : "border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-band)] text-[#3d3450]"
                  }`}
                >
                  <span className="mb-1 block text-xs font-semibold opacity-80">yourbrand → sample.follower · preview only</span>
                  <span className="block whitespace-pre-wrap [overflow-wrap:anywhere]">
                    {match
                      ? hasDm
                        ? dmText
                        : "Add DM text to complete this preview."
                      : "No outgoing DM: the comment has not matched a usable keyword."}
                  </span>
                </div>
              </div>

              {captureEmail && (
                <>
                  <ArrowDown aria-hidden="true" className="mx-auto h-4 w-4 text-[var(--poskoo-muted)]" />
                  <div className={s.flowStep}>
                    <p className={STEP_LABEL}>4 · Optional email capture</p>
                    <div className="mt-1 min-w-0 rounded-2xl rounded-tl-md border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-2.5 text-sm">
                      <span className="mb-1 block text-xs font-semibold text-[var(--poskoo-muted)]">
                        yourbrand → sample.follower · preview only
                      </span>
                      <span className="block whitespace-pre-wrap [overflow-wrap:anywhere]">
                        {hasEmailPrompt ? emailPrompt : "Add an email prompt to complete this preview."}
                      </span>
                      <span className="mt-2 block rounded-lg border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-2.5 py-1.5 text-xs text-[#3d3450] [overflow-wrap:anywhere]">
                        {hasSampleEmail ? `Sample email: ${sampleEmail}` : "Sample email will appear here."}
                      </span>
                    </div>
                  </div>

                  <ArrowDown aria-hidden="true" className="mx-auto h-4 w-4 text-[var(--poskoo-muted)]" />
                  <div className={s.flowStep}>
                    <p className={STEP_LABEL}>5 · Follow-up DM preview</p>
                    <div
                      className={`mt-1 ml-auto w-fit max-w-[95%] rounded-2xl rounded-br-md px-3 py-2.5 text-sm ${
                        hasFollowUp
                          ? "bg-[var(--poskoo-violet)] text-white"
                          : "border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-band)] text-[#3d3450]"
                      }`}
                    >
                      <span className="mb-1 block text-xs font-semibold opacity-80">
                        yourbrand → sample.follower · preview only
                      </span>
                      <span className="block whitespace-pre-wrap [overflow-wrap:anywhere]">
                        {hasFollowUp ? followUpDm : "Add follow-up DM text to complete this preview."}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={copyDm}
            disabled={!hasDm}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)] disabled:opacity-40"
          >
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy DM text"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "DM text copied to clipboard" : ""}</span>
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-xs leading-relaxed text-[#3d3450]"
          >
            {status}
          </p>
          <p className="text-xs leading-relaxed text-[var(--poskoo-muted)]">
            Illustration only: yourbrand, sample.follower, the post and the conversation are samples. This is not a
            live Meta connection and no DM is sent.
          </p>
        </div>
      </div>

      <div className="!mt-8 border-t border-[var(--poskoo-line)] pt-6">
        <h3 className="text-xl font-semibold tracking-tight">Contains match versus exact match</h3>
        <p className="!mt-2 max-w-3xl text-sm leading-relaxed text-[#3d3450]">
          These results use the same matching function as the preview and Poskoo&apos;s auto-DM rules. Load an example
          to edit it yourself.
        </p>
        <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-3">
          {MATCH_EXAMPLES.map((example) => {
            const exampleMatch = findMatch(example.comment, example.keyword, example.matchType);
            return (
              <article key={example.title} className="flex min-w-0 flex-col rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-[var(--poskoo-band)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[var(--poskoo-violet)]">
                    {example.matchType}
                  </span>
                  <span className={`text-xs font-semibold ${exampleMatch ? "text-[var(--poskoo-green)]" : "text-[#3d3450]"}`}>
                    {exampleMatch ? "Keyword matched" : "No match"}
                  </span>
                </div>
                <h4 className="mt-3 text-base font-semibold leading-snug">{example.title}</h4>
                <p className="mt-2 text-sm leading-relaxed [overflow-wrap:anywhere]">
                  <strong>{example.keyword}</strong> · “{example.comment}”
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#3d3450]">{example.explanation}</p>
                <button
                  type="button"
                  onClick={() => tryExample(example)}
                  className="mt-4 inline-flex min-h-11 items-center justify-center self-start rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 py-2 text-sm font-medium text-[var(--poskoo-ink)] hover:border-[var(--poskoo-violet)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)]/40"
                >
                  {example.button}
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
