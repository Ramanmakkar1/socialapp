"use client";

import { useId, useRef, useState } from "react";
import { Play } from "lucide-react";
import { matchComment } from "@/lib/match";
import { PUBLIC_REPLY_MAX, cleanPublicReply } from "@/lib/publicReply";
import { buildCommentDmMessage } from "@/lib/commentMessage";
import s from "@/components/site.module.css";
import ui from "@/components/ui/ui.module.css";

// Illustrative samples only: nothing here is read from a real post or account.
const SAMPLE_COMMENT = "Love this! Can you send me the guide please?";
const SAMPLE_HANDLE = "jane_doe";
const BRAND_HANDLE = "yourbrand";

function httpUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return "";
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:" ? value : "";
  } catch {
    return "";
  }
}

const LABEL = "block text-sm font-medium text-[#3d3450]";
const INPUT =
  "mt-1.5 w-full min-w-0 resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]/30";
const HINT = "mt-1 text-xs leading-relaxed text-[#3d3450]";
const TOKEN =
  "min-h-10 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-1 text-xs font-medium text-[#3d3450] hover:border-[var(--poskoo-violet)] hover:text-[var(--poskoo-violet)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)]/40";
const STEP_LABEL = "text-[11px] font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]";
const BUBBLE_IN =
  "mt-1 w-fit max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-2 text-sm text-[var(--poskoo-ink)] [overflow-wrap:anywhere]";
const BUBBLE_OUT =
  "mt-1 ml-auto w-fit max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-br-md px-3 py-2 text-sm [overflow-wrap:anywhere]";

export default function FlowDemo() {
  const id = useId();
  const keywordId = `${id}-keyword`;
  const replyId = `${id}-reply`;
  const dmId = `${id}-dm`;
  const linkId = `${id}-link`;

  const dmRef = useRef<HTMLTextAreaElement>(null);
  const [keyword, setKeyword] = useState("GUIDE");
  const [publicReply, setPublicReply] = useState("Sent it to your DMs! 📩");
  const [dmText, setDmText] = useState("Hey {{username}}! Here is the guide you asked for 👉 {{link}}");
  const [link, setLink] = useState("https://example.com/your-free-guide");
  const [run, setRun] = useState(0);

  const keywords = keyword.split(",").map((value) => value.trim()).filter(Boolean);
  const linkUrl = httpUrl(link);
  const linkInvalid = link.trim().length > 0 && linkUrl === "";
  const match =
    keywords.length > 0
      ? matchComment(SAMPLE_COMMENT, [
          { id: "flow-demo", keywords, match_type: "contains", status: "active" },
        ])
      : null;
  const publicReplyText = cleanPublicReply(publicReply);
  const dmBody = buildCommentDmMessage({
    dmText,
    fromUsername: SAMPLE_HANDLE,
    linkUrl: linkUrl || null,
    emailGate: false,
    followGate: false,
    resolvedLink: linkUrl || null,
  }).trim();

  const status =
    keywords.length === 0
      ? "Add a keyword above to see what this comment triggers."
      : match
        ? `Matched “${match.keyword}”. The DM goes out, usually within a minute, then the public reply posts under the comment so others can see it works.`
        : "No keyword matched, so this comment gets no DM and no public reply.";

  function insertToken(token: string) {
    const field = dmRef.current;
    const start = field?.selectionStart ?? dmText.length;
    const end = field?.selectionEnd ?? start;
    const next = dmText.slice(0, start) + token + dmText.slice(end);
    setDmText(next);
    const caret = start + token.length;
    requestAnimationFrame(() => {
      field?.focus();
      field?.setSelectionRange(caret, caret);
    });
  }

  return (
    <section aria-labelledby={`${id}-title`} className={s.flowCard}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">Try the flow builder</p>
          <h2 id={`${id}-title`} className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Build your first <span className={ui.accent}>comment-to-DM flow</span>
          </h2>
        </div>
        <span className="rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-1 text-xs font-medium text-[#3d3450]">
          Local simulation · nothing is sent or saved
        </span>
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#3d3450]">
        Edit the rule on the left and the same sample comment runs through it live: your keyword decides whether it
        matches, then your DM and public reply appear exactly as they would be sent.
      </p>

      <div className={`${s.flowGrid} mt-6`}>
        <div className={s.flowForm}>
          <h3 className="text-sm font-semibold text-[var(--poskoo-ink)]">Your rule</h3>

          <div>
            <label htmlFor={keywordId} className={LABEL}>
              Keyword that triggers the DM
            </label>
            <input
              id={keywordId}
              type="text"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="GUIDE"
              aria-describedby={`${keywordId}-hint`}
              className={INPUT}
            />
            <p id={`${keywordId}-hint`} className={HINT}>
              Followers comment this word on your post, and you can separate several keywords with commas. Matching
              ignores case and punctuation and finds a whole word anywhere in the comment.
            </p>
          </div>

          <div>
            <label htmlFor={dmId} className={LABEL}>
              DM message
            </label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <button type="button" onClick={() => insertToken("{{username}}")} className={TOKEN}>
                {"{{username}}"}
              </button>
              <button type="button" onClick={() => insertToken("{{link}}")} className={TOKEN}>
                {"{{link}}"}
              </button>
            </div>
            <textarea
              id={dmId}
              ref={dmRef}
              rows={4}
              maxLength={1000}
              value={dmText}
              onChange={(event) => setDmText(event.target.value)}
              placeholder="Hey {{username}}! Here is your link 👉 {{link}}"
              aria-describedby={`${dmId}-hint ${dmId}-count`}
              className={INPUT}
            />
            <div className="mt-1.5 flex flex-wrap items-start justify-between gap-2">
              <p id={`${dmId}-hint`} className="text-xs leading-relaxed text-[#3d3450]">
                Sent privately, usually within a minute. The tokens become their name and your link.
              </p>
              <span
                id={`${dmId}-count`}
                className={`shrink-0 text-xs ${
                  dmBody.length > 1000
                    ? "text-[var(--poskoo-red)]"
                    : dmBody.length >= 900
                      ? "text-[var(--poskoo-coral)]"
                      : "text-[var(--poskoo-muted)]"
                }`}
              >
                {dmBody.length}/1000
              </span>
            </div>
            {dmBody.length > 1000 && (
              <p className="mt-1 text-xs leading-relaxed text-[var(--poskoo-red)]">
                Message exceeds 1,000 characters. Shorten it to leave room for usernames and links.
              </p>
            )}
          </div>

          <div>
            <label htmlFor={replyId} className={LABEL}>
              Public reply under the comment (optional)
            </label>
            <textarea
              id={replyId}
              rows={2}
              maxLength={PUBLIC_REPLY_MAX}
              value={publicReply}
              onChange={(event) => setPublicReply(event.target.value)}
              placeholder="Sent it to your DMs! 📩"
              aria-describedby={`${replyId}-hint`}
              className={INPUT}
            />
            <p id={`${replyId}-hint`} className={HINT}>
              Posted as a reply to the comment after the DM is sent, so others see it works. Leave empty to skip.
            </p>
          </div>

          <div>
            <label htmlFor={linkId} className={LABEL}>
              Link to send (optional)
            </label>
            <input
              id={linkId}
              type="url"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="https://yoursite.com/guide"
              aria-describedby={`${linkId}-hint`}
              aria-invalid={linkInvalid || undefined}
              className={`${INPUT} ${linkInvalid ? "border-[var(--poskoo-coral)]" : ""}`}
            />
            <p id={`${linkId}-hint`} className={HINT}>
              {linkInvalid
                ? "Enter a full address starting with https:// so the link stays valid."
                : "Your guide, product or booking page. Live sends may replace it with a tracked link, so you can see every click."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRun((value) => value + 1)}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 self-start rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-5 py-2.5 text-sm font-medium text-[var(--poskoo-ink)] hover:border-[var(--poskoo-violet)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)]/40 sm:w-auto"
          >
            <Play className="h-4 w-4 text-[var(--poskoo-violet)]" aria-hidden="true" />
            Play the simulation again
          </button>
        </div>

        <div className={s.flowPreview}>
          <h3 className="text-sm font-semibold text-[var(--poskoo-ink)]">
            The same comment, running through your rule
          </h3>

          <div
            key={run}
            className="min-w-0 overflow-hidden rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-[var(--poskoo-line)] px-4 py-3">
              <span
                aria-hidden="true"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--poskoo-violet)] text-xs font-bold text-white"
              >
                P
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[var(--poskoo-ink)]">{BRAND_HANDLE}</span>
                <span className="block text-xs text-[var(--poskoo-muted)]">Reel · your latest post</span>
              </span>
            </div>

            <div
              className="relative h-28 sm:h-32"
              style={{ background: "linear-gradient(135deg, var(--poskoo-lilac), var(--poskoo-pink))" }}
            >
              <svg viewBox="0 0 320 120" aria-hidden="true" focusable="false" className="h-full w-full">
                <ellipse cx="160" cy="104" rx="128" ry="9" fill="var(--poskoo-violet)" opacity=".1" />
                <rect x="98" y="14" width="124" height="78" rx="16" fill="var(--poskoo-card)" opacity=".92" />
                <path
                  d="M128 34h64a9 9 0 0 1 9 9v14a9 9 0 0 1-9 9h-40l-11 8V66a9 9 0 0 1-4-9V43a9 9 0 0 1 9-9Z"
                  fill="var(--poskoo-violet)"
                  opacity=".2"
                />
                <path d="M150 78c0-12 40-12 40 0Z" fill="var(--poskoo-violet)" opacity=".55" />
                <circle cx="170" cy="58" r="9" fill="var(--poskoo-coral)" />
                <path d="m238 22 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z" fill="var(--poskoo-card)" />
                <path d="M82 32l2 6 6 2-6 2-2 6-2-6-6-2 6-2Z" fill="var(--poskoo-card)" opacity=".85" />
              </svg>
              <div className="absolute inset-x-3 bottom-3">
                <span className="inline-block max-w-full rounded-full bg-[var(--poskoo-ink)] px-3 py-1.5 text-xs font-semibold text-white [overflow-wrap:anywhere]">
                  Comment {keyword.trim() || "your keyword"} for the guide
                </span>
              </div>
            </div>

            <div className="px-4 py-4">
              <div className={s.flowSteps}>
                <div className={s.flowStep}>
                  <p className={STEP_LABEL}>1 · Comment arrives</p>
                  <div className={BUBBLE_IN}>
                    <span className="mr-1.5 font-semibold">{SAMPLE_HANDLE}</span>
                    {SAMPLE_COMMENT}
                  </div>
                </div>
                {match && (
                  <div className={s.flowStep}>
                    <p className={STEP_LABEL}>2 · DM is sent</p>
                    <div className={`${BUBBLE_OUT} bg-[var(--poskoo-violet)] text-white`}>
                      {dmBody || "Your DM message appears here once you type it above."}
                    </div>
                  </div>
                )}
                {match && (
                  <div className={s.flowStep}>
                    <p className={STEP_LABEL}>3 · Public reply posts</p>
                    {publicReplyText ? (
                      <div className={`${BUBBLE_OUT} bg-[var(--poskoo-mint)] text-[var(--poskoo-ink)]`}>
                        <span className="mr-1.5 font-semibold">{BRAND_HANDLE}</span>
                        {publicReplyText}
                      </div>
                    ) : (
                      <p className="mt-1 text-xs leading-relaxed text-[#3d3450]">
                        No public reply is set, so nothing posts under the comment.
                      </p>
                    )}
                  </div>
                )}
              </div>
              {!match && (
                <div className="mt-3 rounded-xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-2 text-xs leading-relaxed text-[#3d3450]">
                  {keywords.length === 0
                    ? "Add a keyword above to see this comment trigger a DM."
                    : "This comment does not contain your keyword, so no DM is sent and no public reply posts."}
                </div>
              )}
            </div>
          </div>

          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-2 text-xs leading-relaxed text-[#3d3450]"
          >
            {status}
          </p>
          <p className="text-xs leading-relaxed text-[var(--poskoo-muted)]">
            Illustrative only: the comment, the {SAMPLE_HANDLE} account and the example.com address are samples.
            Nothing is sent or saved and no Instagram account is needed to play. Live rules use the official Meta API,
            respect Meta’s rate limits and only message people who commented first.
          </p>
        </div>
      </div>
    </section>
  );
}
