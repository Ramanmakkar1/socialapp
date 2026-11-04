"use client";

import { useId, useMemo, useState } from "react";
import {
  buildCommentDmMessage,
  COMMENT_USERNAME_FALLBACK,
} from "@/lib/commentMessage";

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
      className="min-w-0 rounded-2xl border border-line bg-surface-2 p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`${id}-title`} className="text-sm font-semibold text-ink">
          What your recipient receives
        </h3>
        <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink-2">
          Local preview — nothing is sent
        </span>
      </div>

      <div className="mt-3">
        <label htmlFor={usernameFieldId} className="text-sm font-medium text-ink-2">
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
          className="mt-1.5 w-full min-w-0 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
        <p className="mt-1 text-xs text-muted">
          Replaces {"{{username}}"} in your template. Blank uses the production fallback “
          {COMMENT_USERNAME_FALLBACK}”.
        </p>
      </div>

      <div className="mt-4 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
        <svg
          viewBox="0 0 88 120"
          aria-hidden="true"
          focusable="false"
          className="mx-auto h-24 w-20 shrink-0 sm:mx-0 motion-safe:transition-transform motion-safe:duration-700 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none"
        >
          <ellipse cx="44" cy="112" rx="32" ry="5" fill="var(--brand)" opacity=".12" />
          <circle cx="44" cy="38" r="22" fill="var(--brand-2)" />
          <path
            d="M26 36c-4-18 32-20 28 2l-8-8-20 6Z"
            fill="var(--ink)"
          />
          <circle cx="36" cy="40" r="2.5" fill="var(--surface)" />
          <circle cx="52" cy="40" r="2.5" fill="var(--surface)" />
          <path
            d="M36 48q8 6 16 0"
            fill="none"
            stroke="var(--surface)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M28 72c0-8 32-8 32 0v28H28V72Z"
            fill="var(--brand)"
            opacity=".85"
          />
          <path
            d="m58 88 10 6 8-12"
            fill="none"
            stroke="var(--brand-2)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        <div className="min-w-0 flex-1">
          <div
            className="mx-auto w-full max-w-[390px] rounded-[1.75rem] border-2 border-line bg-ink p-2 shadow-sm sm:mx-0"
            role="img"
            aria-label="Phone mockup showing the outgoing DM"
          >
            <div className="rounded-[1.35rem] bg-surface px-3 pb-4 pt-8">
              <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-line" aria-hidden="true" />
              <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
                Messages
              </p>
              <div
                id={messageRegionId}
                role="status"
                aria-live="polite"
                aria-atomic="true"
                className="mt-3 rounded-2xl rounded-bl-md border border-line bg-surface-2 px-3 py-2.5 text-sm leading-relaxed text-ink [overflow-wrap:anywhere] whitespace-pre-wrap"
              >
                {messageBody}
              </div>
              <p className="mt-2 text-center text-[10px] text-muted">Initial automated DM only</p>
            </div>
          </div>
        </div>
      </div>

      {requirementLines.length > 0 && (
        <div className="mt-4 rounded-xl border border-line bg-surface px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-2">
            Before the link is delivered
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs leading-relaxed text-ink-2">
            {requirementLines.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-3 text-xs leading-relaxed text-ink-2">
        This preview uses your destination URL as written. It does not simulate successful follow
        checks, email collection, or later reply messages—only the first outgoing DM from this
        automation.
      </p>
    </section>
  );
}
