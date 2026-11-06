"use client";

import { useId, useState, type FormEvent } from "react";
import { extractEmail } from "@/lib/messageParse";

type Props = {
  /** Initial DM already rendered with buildCommentDmMessage by the parent preview. */
  initialMessage: string;
  linkUrl: string | null;
  emailGate: boolean;
  followGate: boolean;
};

type FollowResult = "not-following" | "following";

type Requirement = { label: string; met: boolean };

export default function AutomationJourneyPreview({
  initialMessage,
  linkUrl,
  emailGate,
  followGate,
}: Props) {
  const id = useId();
  const panelId = `${id}-panel`;
  const replyId = `${id}-reply`;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [replies, setReplies] = useState<string[]>([]);
  const [follow, setFollow] = useState<FollowResult>("not-following");

  const gated = emailGate || followGate;
  const email = replies.map((reply) => extractEmail(reply)).find(Boolean) ?? null;

  const requirements: Requirement[] = [];
  if (emailGate) {
    requirements.push({
      label: email ? `Valid email received (${email})` : "Reply with a valid email address",
      met: Boolean(email),
    });
  } else if (followGate) {
    requirements.push({ label: "Reply to the DM (for example “done”)", met: replies.length > 0 });
  }
  if (followGate) {
    requirements.push({
      label: "Follows your account (simulated result below)",
      met: follow === "following",
    });
  }
  const allMet = requirements.every((r) => r.met);

  let delivery: { tone: "ok" | "wait" | "warn"; text: string };
  if (!linkUrl) {
    delivery = {
      tone: "warn",
      text: "No destination URL is set, so no link can be delivered—even after every requirement is met.",
    };
  } else if (!gated) {
    delivery = { tone: "ok", text: "Link delivered in the first DM (no gates)." };
  } else if (allMet) {
    delivery = { tone: "ok", text: "All requirements met — the link would be sent next." };
  } else {
    delivery = { tone: "wait", text: "Link withheld until the outstanding requirements are met." };
  }

  function sendReply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setReplies((current) => [...current, text].slice(-6));
    setDraft("");
  }

  function reset() {
    setReplies([]);
    setDraft("");
    setFollow("not-following");
  }

  const toneClass = {
    ok: "border-[var(--poskoo-violet)] bg-[var(--poskoo-violet)]/10 text-[var(--poskoo-ink)]",
    wait: "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] text-[#3d3450]",
    warn: "border-[var(--poskoo-coral)] bg-[var(--poskoo-card)] text-[var(--poskoo-ink)]",
  }[delivery.tone];

  return (
    <div className="mt-4 min-w-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 py-2 text-sm font-semibold text-[var(--poskoo-ink)] hover:border-[var(--poskoo-violet)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)]/40 motion-safe:transition-colors"
      >
        <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false" className="h-4 w-4 text-[var(--poskoo-violet)]">
          <path d="M3 4h10a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H8l-4 3v-3H3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" fill="currentColor" opacity=".35" />
          <path d="M7 8h12v6a2 2 0 0 1-2 2h-1v3l-4-3H9a2 2 0 0 1-2-2V8Z" fill="currentColor" />
        </svg>
        {open ? "Hide journey rehearsal" : "Rehearse the full recipient journey"}
      </button>

      {open && (
        <div id={panelId} className="mt-3 min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 sm:p-4">
          <p className="rounded-xl bg-[var(--poskoo-band)] px-3 py-2 text-xs leading-relaxed text-[#3d3450]">
            Simulation only: replies stay on this page, nothing is sent or saved, and the follow result is
            chosen by you—no real Instagram check happens.
          </p>

          <ol className="mt-4 space-y-3 border-l-2 border-[var(--poskoo-line)] pl-4" aria-label="Simulated conversation timeline">
            <li className="relative">
              <span aria-hidden="true" className="absolute -left-[1.4rem] top-2 h-3 w-3 rounded-full bg-[var(--poskoo-violet)]" />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">1 · Your automated DM</p>
              <div className="mt-1 max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-md border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-2 text-sm text-[var(--poskoo-ink)] [overflow-wrap:anywhere]">
                {initialMessage}
              </div>
            </li>
            {replies.map((reply, index) => (
              <li key={`${index}-${reply}`} className="relative">
                <span aria-hidden="true" className="absolute -left-[1.4rem] top-2 h-3 w-3 rounded-full bg-[var(--poskoo-coral)]" />
                <p className="text-right text-[11px] font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">
                  Sample recipient reply
                </p>
                <div className="ml-auto mt-1 w-fit max-w-[85%] rounded-2xl rounded-br-md bg-[var(--poskoo-violet)] px-3 py-2 text-sm text-white [overflow-wrap:anywhere]">
                  {reply}
                </div>
              </li>
            ))}
            <li className="relative">
              <span
                aria-hidden="true"
                className={`absolute -left-[1.4rem] top-2 h-3 w-3 rounded-full ${delivery.tone === "ok" ? "bg-[var(--poskoo-violet)]" : "bg-[var(--poskoo-line)]"}`}
              />
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">
                {gated ? "Next · Link delivery (illustrative)" : "Link delivery (illustrative)"}
              </p>
              <div role="status" aria-live="polite" className={`mt-1 rounded-xl border px-3 py-2 text-sm [overflow-wrap:anywhere] ${toneClass}`}>
                {delivery.text}
                {delivery.tone === "ok" && linkUrl && gated && (
                  <span className="mt-1 block text-xs text-[#3d3450]">Example link message: {linkUrl}</span>
                )}
              </div>
            </li>
          </ol>

          {gated && (
            <>
              <form onSubmit={sendReply} className="mt-4 flex min-w-0 flex-col gap-2 sm:flex-row">
                <label htmlFor={replyId} className="sr-only">
                  Sample recipient reply
                </label>
                <input
                  id={replyId}
                  type="text"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  autoComplete="off"
                  placeholder={emailGate ? "e.g. jane@example.com" : "e.g. done"}
                  className="min-h-11 w-full min-w-0 flex-1 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-2 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]/30"
                />
                <button
                  type="submit"
                  disabled={!draft.trim()}
                  className="min-h-11 rounded-xl bg-[var(--poskoo-violet)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)]/40"
                >
                  Add sample reply
                </button>
              </form>

              {followGate && (
                <fieldset className="mt-4 min-w-0">
                  <legend className="text-xs font-semibold uppercase tracking-wide text-[#3d3450]">
                    Simulated follow result (not a real check)
                  </legend>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(
                      [
                        ["not-following", "Pretend they don't follow"],
                        ["following", "Pretend they follow"],
                      ] as const
                    ).map(([value, label]) => (
                      <label
                        key={value}
                        className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-2 text-sm text-[var(--poskoo-ink)] has-[:checked]:border-[var(--poskoo-violet)] has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--poskoo-violet)]/40"
                      >
                        <input
                          type="radio"
                          name={`${id}-follow`}
                          value={value}
                          checked={follow === value}
                          onChange={() => setFollow(value)}
                          className="accent-[var(--poskoo-violet)]"
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

              <div className="mt-4 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-2.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#3d3450]">Outstanding requirements</p>
                <ul className="mt-2 space-y-1 text-sm">
                  {requirements.map((r) => (
                    <li key={r.label} className="flex items-start gap-2 text-[var(--poskoo-ink)] [overflow-wrap:anywhere]">
                      <span aria-hidden="true" className={r.met ? "text-[var(--poskoo-violet)]" : "text-[var(--poskoo-muted)]"}>
                        {r.met ? "✓" : "○"}
                      </span>
                      <span>
                        <span className="sr-only">{r.met ? "Met: " : "Not met: "}</span>
                        {r.label}
                      </span>
                    </li>
                  ))}
                </ul>
                {emailGate && replies.length > 0 && !email && (
                  <p className="mt-2 text-xs text-[#3d3450]">No valid email found in the sample replies yet.</p>
                )}
              </div>

              <button
                type="button"
                onClick={reset}
                className="mt-3 min-h-11 rounded-xl px-3 py-2 text-sm font-medium text-[#3d3450] underline-offset-2 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)]/40"
              >
                Reset rehearsal
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
