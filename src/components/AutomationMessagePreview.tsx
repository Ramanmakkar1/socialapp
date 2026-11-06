"use client";

import { useId, useMemo, useState } from "react";
import {
  buildCommentDmMessage,
  COMMENT_USERNAME_FALLBACK,
} from "@/lib/commentMessage";
import AutomationJourneyPreview from "@/components/AutomationJourneyPreview";

type Props = {
  dmText: string;
  linkUrl: string;
  emailGate: boolean;
  followGate: boolean;
};

function gateRequirementLines(
  emailGate: boolean,
  followGate: boolean,
  hasLink: boolean,
): string[] {
  if (!emailGate && !followGate) {
    if (!hasLink) return ["No destination URL is set, so no link is added to this message."];
    return [
      "No gates: the link is included in this first message.",
      "Live ungated sends may replace your URL with a tracked link for click analytics.",
    ];
  }
  if (!hasLink) {
    return [
      "Gates are on but no destination URL is set, so no link can be delivered after requirements are met.",
    ];
  }
  const lines: string[] = [];
  if (followGate && emailGate) {
    lines.push(
      "Before the link is sent, they must follow you and reply here with their email address.",
    );
  } else if (followGate) {
    lines.push(
      "Before the link is sent, they must follow you and reply “done” to this message.",
    );
  } else if (emailGate) {
    lines.push(
      "Before the link is sent, they must reply to this message with their email address.",
    );
  }
  lines.push("The destination URL is withheld from this first message until those steps are completed.");
  return lines;
}

export default function AutomationMessagePreview({
  dmText,
  linkUrl,
  emailGate,
  followGate,
}: Props) {
  const id = useId();
  const usernameFieldId = `${id}-sample-username`;
  const messageRegionId = `${id}-outgoing-message`;
  const [sampleUsername, setSampleUsername] = useState("jane_doe");

  const trimmedLink = linkUrl.trim() || null;
  const fromUsername = sampleUsername.trim()
    ? sampleUsername.trim().replace(/^@+/, "")
    : null;

  const previewMessage = useMemo(
    () =>
      buildCommentDmMessage({
        dmText,
        fromUsername,
        linkUrl: trimmedLink,
        emailGate,
        followGate,
        resolvedLink: trimmedLink,
      }),
    [dmText, fromUsername, trimmedLink, emailGate, followGate],
  );

  const requirementLines = useMemo(
    () => gateRequirementLines(emailGate, followGate, Boolean(trimmedLink)),
    [emailGate, followGate, trimmedLink],
  );

  const messageBody =
    previewMessage.trim().length > 0
      ? previewMessage
      : "Type a DM message above to preview what recipients receive.";

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`${id}-title`} className="text-sm font-semibold text-[var(--poskoo-ink)]">
          What your recipient receives
        </h3>
        <span className="rounded-full bg-[var(--poskoo-card)] px-2.5 py-1 text-xs font-medium text-[#3d3450]">
          Local preview — nothing is sent
        </span>
      </div>

      <div className="mt-3">
        <label htmlFor={usernameFieldId} className="text-sm font-medium text-[#3d3450]">
          Example commenter username
        </label>
        <input
          id={usernameFieldId}
          type="text"
          value={sampleUsername}
          onChange={(event) => setSampleUsername(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder={`Leave blank for “${COMMENT_USERNAME_FALLBACK}”`}
          className="mt-1.5 w-full min-w-0 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]/30"
        />
        <p className="mt-1 text-xs text-[var(--poskoo-muted)]">
          Replaces {"{{username}}"} in your template. Blank uses the production fallback “
          {COMMENT_USERNAME_FALLBACK}”.
        </p>
      </div>

      <div role="status" aria-live="polite" aria-atomic="true" className="mt-3 min-w-0 text-xs leading-relaxed [overflow-wrap:anywhere]">
        <p className="text-[#3d3450]">Rendered message: {previewMessage.length.toLocaleString("en-US")} / 1,000 characters</p>
        {previewMessage.length > 1000 && (
          <p className="mt-1 rounded-xl border border-[var(--poskoo-coral)] bg-[var(--poskoo-card)] px-3 py-2 text-[var(--poskoo-ink)]">
            Message exceeds 1,000 characters. Shorten it to leave room for usernames, links and gate instructions.
          </p>
        )}
        <p className="mt-1 text-[#3d3450]">
          Saving reserves 30 characters for each username replacement{emailGate || followGate ? '' : ', and checks the message against the tracked link that replaces your destination URL'}.
        </p>
      </div>

      <div className="mt-4 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
        <svg
          viewBox="0 0 88 120"
          aria-hidden="true"
          focusable="false"
          className="mx-auto h-24 w-20 shrink-0 sm:mx-0 motion-safe:transition-transform motion-safe:duration-700 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
        >
          <ellipse cx="44" cy="112" rx="32" ry="5" fill="var(--poskoo-violet)" opacity=".12" />
          <circle cx="44" cy="38" r="22" fill="var(--poskoo-coral)" />
          <path
            d="M26 36c-4-18 32-20 28 2l-8-8-20 6Z"
            fill="var(--poskoo-ink)"
          />
          <circle cx="36" cy="40" r="2.5" fill="var(--poskoo-card)" />
          <circle cx="52" cy="40" r="2.5" fill="var(--poskoo-card)" />
          <path
            d="M36 48q8 6 16 0"
            fill="none"
            stroke="var(--poskoo-card)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M28 72c0-8 32-8 32 0v28H28V72Z"
            fill="var(--poskoo-violet)"
            opacity=".85"
          />
          <path
            d="m58 88 10 6 8-12"
            fill="none"
            stroke="var(--poskoo-coral)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="min-w-0 flex-1">
          <div
            className="mx-auto w-full max-w-[390px] rounded-[1.75rem] border-2 border-[var(--poskoo-line)] bg-[var(--poskoo-ink)] p-2 shadow-sm sm:mx-0"
            role="img"
            aria-label="Phone mockup showing the outgoing DM"
          >
            <div className="rounded-[1.35rem] bg-[var(--poskoo-card)] px-3 pb-4 pt-8">
              <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-[var(--poskoo-line)]" aria-hidden="true" />
              <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">
                Messages
              </p>
              <div
                id={messageRegionId}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="mt-3 rounded-2xl rounded-bl-md border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-2.5 text-sm leading-relaxed text-[var(--poskoo-ink)] [overflow-wrap:anywhere] whitespace-pre-wrap"
              >
                {messageBody}
              </div>
              <p className="mt-2 text-center text-[10px] text-[var(--poskoo-muted)]">Initial automated DM only</p>
            </div>
          </div>
        </div>
      </div>

      {requirementLines.length > 0 && (
        <div className="mt-4 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3d3450]">
            Before the link is delivered
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-relaxed text-[#3d3450]">
            {requirementLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-[#3d3450]">
        This preview uses your destination URL as written. Use the optional rehearsal below to
        simulate sample replies and a follow result locally—nothing is checked on Instagram.
      </p>

      <AutomationJourneyPreview
        key={JSON.stringify([dmText, trimmedLink, emailGate, followGate])}
        initialMessage={messageBody}
        linkUrl={trimmedLink}
        emailGate={emailGate}
        followGate={followGate}
      />
    </section>
  );
}
