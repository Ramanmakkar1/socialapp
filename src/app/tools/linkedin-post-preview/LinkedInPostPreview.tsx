"use client";

import { useId, useState } from "react";
import { Check, Copy, Monitor, RotateCcw, Smartphone } from "lucide-react";
import { countLinkedIn, LINKEDIN_LIMITS } from "@/lib/linkedinCharCount";

const MAX = LINKEDIN_LIMITS.post;
const SAMPLE =
  "Your first two lines decide whether someone reads the rest of your LinkedIn post.\n\nLead with a useful idea, add the detail your network needs, and finish with a question that makes it easy to reply. A quick preview helps you spot a hidden hook, an awkward break or a wall of text before you publish.";

const ghostBtn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const field = "mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base text-[var(--poskoo-ink)] outline-none focus:border-[var(--poskoo-violet)]";

type Device = "desktop" | "mobile";

function seeMoreCut(text: string, characterLimit: number) {
  const characters = [...text];
  let lineBreaks = 0;

  for (let index = 0; index < Math.min(characters.length, characterLimit); index += 1) {
    const character = characters[index];
    if (character !== "\n" && character !== "\r") continue;
    lineBreaks += 1;
    if (lineBreaks === 3) return index;
    if (character === "\r" && characters[index + 1] === "\n") index += 1;
  }

  return Math.min(characters.length, characterLimit);
}

export default function LinkedInPostPreview() {
  const [text, setText] = useState(SAMPLE);
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [device, setDevice] = useState<Device>("desktop");
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const id = useId();

  const count = countLinkedIn(text).chars;
  const remaining = MAX - count;
  const over = remaining < 0;
  const characterLimit = device === "desktop" ? 210 : 140;
  const cut = seeMoreCut(text, characterLimit);
  const hasMore = cut < count;
  const preview = expanded ? text : [...text].slice(0, cut).join("");
  const displayName = name.trim() || "Your Name";
  const displayHeadline = headline.trim() || "Your LinkedIn headline";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => [...part][0] ?? "")
    .join("")
    .toUpperCase();

  function updateText(value: string) {
    setText(value);
    setExpanded(false);
  }

  function selectDevice(value: Device) {
    setDevice(value);
    setExpanded(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  function reset() {
    setText("");
    setName("");
    setHeadline("");
    setExpanded(false);
    setCopied(false);
  }

  return (
    <div className="grid min-w-0 gap-5 text-left lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-start">
      <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={`${id}-post`} className="text-sm font-semibold">Your LinkedIn post</label>
          <button
            type="button"
            onClick={reset}
            disabled={!text && !name && !headline}
            aria-label="Reset LinkedIn post preview"
            className={ghostBtn}
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Reset
          </button>
        </div>
        <textarea
          id={`${id}-post`}
          value={text}
          onChange={(event) => updateText(event.target.value)}
          rows={10}
          placeholder="Write or paste your LinkedIn post…"
          aria-describedby={`${id}-status`}
          className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="tabular-nums text-[var(--poskoo-ink)]">
            <strong className="font-semibold">{count.toLocaleString("en-US")}</strong> / {MAX.toLocaleString("en-US")} characters
          </span>
          <span
            id={`${id}-status`}
            aria-live="polite"
            className={`font-semibold tabular-nums ${over ? "text-[var(--poskoo-red)]" : "text-[var(--poskoo-green)]"}`}
          >
            {over
              ? `${Math.abs(remaining).toLocaleString("en-US")} over the limit`
              : `${remaining.toLocaleString("en-US")} characters left`}
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--poskoo-line)]"
          role="progressbar"
          aria-label="LinkedIn post length used"
          aria-valuemin={0}
          aria-valuemax={MAX}
          aria-valuenow={Math.min(count, MAX)}
        >
          <div
            className="h-full rounded-full motion-safe:transition-all"
            style={{ width: `${Math.min(100, (count / MAX) * 100)}%`, background: over ? "var(--poskoo-red)" : "var(--poskoo-green)" }}
          />
        </div>
        {over && (
          <p className="mt-2 text-xs font-medium text-[var(--poskoo-red)]">
            LinkedIn posts can be up to {MAX.toLocaleString("en-US")} characters. Shorten this draft before publishing.
          </p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-name`} className="text-sm font-semibold">Display name <span className="font-normal">(optional)</span></label>
            <input
              id={`${id}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your Name"
              autoComplete="name"
              className={field}
            />
          </div>
          <div>
            <label htmlFor={`${id}-headline`} className="text-sm font-semibold">Headline <span className="font-normal">(optional)</span></label>
            <input
              id={`${id}-headline`}
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
              placeholder="Your LinkedIn headline"
              className={field}
            />
          </div>
        </div>
      </div>

      <aside aria-labelledby={`${id}-preview`} className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
        <button
          type="button"
          onClick={copy}
          disabled={!text}
          aria-label="Copy LinkedIn post text"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40"
        >
          {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id={`${id}-preview`} className="text-sm font-semibold">{device === "desktop" ? "Desktop feed preview" : "Mobile preview"}</h3>
          <div role="group" aria-label="Preview width" className="flex rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1">
            <button
              type="button"
              aria-pressed={device === "desktop"}
              onClick={() => selectDevice("desktop")}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium ${device === "desktop" ? "bg-[var(--poskoo-ink)] text-white" : "text-[var(--poskoo-ink)]"}`}
            >
              <Monitor className="h-4 w-4" aria-hidden="true" />Desktop
            </button>
            <button
              type="button"
              aria-pressed={device === "mobile"}
              onClick={() => selectDevice("mobile")}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium ${device === "mobile" ? "bg-[var(--poskoo-ink)] text-white" : "text-[var(--poskoo-ink)]"}`}
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />Mobile
            </button>
          </div>
        </div>

        <article
          aria-label={`${device === "desktop" ? "Desktop" : "Mobile"} LinkedIn post mockup`}
          className={`mx-auto w-full overflow-hidden bg-[var(--poskoo-card)] shadow-[var(--poskoo-shadow-float)] motion-safe:transition-all ${
            device === "mobile"
              ? "max-w-[20rem] rounded-[2rem] border-[6px] border-[var(--poskoo-ink)] p-4"
              : "max-w-[32rem] rounded-2xl border border-[var(--poskoo-line)] p-5"
          }`}
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-12 w-12 flex-none place-items-center rounded-full bg-[linear-gradient(135deg,var(--poskoo-violet),var(--poskoo-coral))] text-sm font-bold text-white" aria-hidden="true">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--poskoo-ink)]">{displayName}</p>
              <p className="break-words text-xs leading-5 text-[var(--poskoo-ink)]">{displayHeadline}</p>
              <p className="text-xs leading-5 text-[var(--poskoo-ink)]">1h · 🌐</p>
            </div>
          </div>
          <p className="mt-3 min-h-24 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--poskoo-ink)]">
            {preview || <span>Your post appears here</span>}
            {!expanded && hasMore && (
              <button
                type="button"
                onClick={() => setExpanded(true)}
                aria-expanded={expanded}
                className="inline min-h-11 align-middle font-medium text-[var(--poskoo-violet)] hover:underline"
              >
                …see more
              </button>
            )}
          </p>
        </article>
        <p className="text-center text-xs text-[var(--poskoo-ink)]">
          Approximate {device} cut-off: {characterLimit} characters or the third line break, whichever comes first.
        </p>
      </aside>
    </div>
  );
}
