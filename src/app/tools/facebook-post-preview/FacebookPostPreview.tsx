"use client";

import { useId, useRef, useState } from "react";
import { Check, Copy, ImagePlus, Monitor, RotateCcw, Smartphone, ThumbsUp, MessageCircle, Share2 } from "lucide-react";
import { countFacebook, FB_LIMITS } from "@/lib/facebookCharCount";

const MAX = FB_LIMITS.post;
const SAMPLE =
  "The first two lines decide whether someone reads the rest of your Facebook post.\n\nLead with a useful idea, add the detail your community needs, and finish with a question that makes it easy to comment. A quick preview helps you spot a hidden hook, an awkward break or a wall of text before you publish.";

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

export default function FacebookPostPreview() {
  const [text, setText] = useState(SAMPLE);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [device, setDevice] = useState<Device>("desktop");
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const id = useId();
  const objectUrl = useRef<string | null>(null);

  const count = countFacebook(text, "post").chars;
  const remaining = MAX - count;
  const over = remaining < 0;
  const characterLimit = device === "desktop" ? 480 : 125;
  const cut = seeMoreCut(text, characterLimit);
  const hasMore = cut < count;
  const preview = expanded ? text : [...text].slice(0, cut).join("");
  const displayName = name.trim() || "Your Page";

  function updateText(value: string) {
    setText(value);
    setExpanded(false);
  }

  function selectDevice(value: Device) {
    setDevice(value);
    setExpanded(false);
  }

  function pickImage(file: File | undefined) {
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    if (!file) {
      objectUrl.current = null;
      setImage(null);
      return;
    }
    objectUrl.current = URL.createObjectURL(file);
    setImage(objectUrl.current);
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
    pickImage(undefined);
    setExpanded(false);
    setCopied(false);
  }

  return (
    <div className="grid min-w-0 gap-5 text-left lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-start">
      <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={`${id}-post`} className="text-sm font-semibold">Your Facebook post</label>
          <button
            type="button"
            onClick={reset}
            disabled={!text && !name && !image}
            aria-label="Reset Facebook post preview"
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
          placeholder="Write or paste your Facebook post…"
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
          aria-label="Facebook post length used"
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
            Facebook posts can be up to {MAX.toLocaleString("en-US")} characters. Shorten this draft before publishing.
          </p>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-name`} className="text-sm font-semibold">Page name <span className="font-normal">(optional)</span></label>
            <input
              id={`${id}-name`}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your Page"
              autoComplete="off"
              className={field}
            />
          </div>
          <div>
            <label htmlFor={`${id}-image`} className="text-sm font-semibold">Image <span className="font-normal">(optional)</span></label>
            <input
              id={`${id}-image`}
              type="file"
              accept="image/*"
              onChange={(event) => pickImage(event.target.files?.[0])}
              className="mt-2 block w-full text-sm text-[var(--poskoo-ink)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--poskoo-ink)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />
          </div>
        </div>
      </div>

      <aside aria-labelledby={`${id}-preview`} className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
        <button
          type="button"
          onClick={copy}
          disabled={!text}
          aria-label="Copy Facebook post text"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] disabled:opacity-40"
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
          aria-label={`${device === "desktop" ? "Desktop" : "Mobile"} Facebook post mockup`}
          className={`mx-auto w-full overflow-hidden bg-[var(--poskoo-card)] shadow-[var(--poskoo-shadow-float)] motion-safe:transition-all ${
            device === "mobile"
              ? "max-w-[20rem] rounded-[2rem] border-[6px] border-[var(--poskoo-ink)] p-4"
              : "max-w-[32rem] rounded-2xl border border-[var(--poskoo-line)] p-5"
          }`}
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="grid h-12 w-12 flex-none place-items-center rounded-full bg-[linear-gradient(135deg,var(--poskoo-violet),var(--poskoo-coral))]" aria-hidden="true">
              <ImagePlus className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--poskoo-ink)]">{displayName}</p>
              <p className="text-xs leading-5 text-[var(--poskoo-ink)]">Just now · 🌐</p>
            </div>
          </div>
          {text && (
            <p className="mt-3 min-h-24 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--poskoo-ink)]">
              {preview}
              {!expanded && hasMore && (
                <button
                  type="button"
                  onClick={() => setExpanded(true)}
                  aria-expanded={expanded}
                  className="inline min-h-11 align-middle font-medium text-[var(--poskoo-violet)] hover:underline"
                >
                  …See more
                </button>
              )}
            </p>
          )}
          {image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="mt-3 max-h-72 w-full rounded-xl object-cover" />
          )}
          <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--poskoo-line)] pt-3 text-sm font-medium text-[var(--poskoo-ink)]">
            <span className="inline-flex items-center gap-1.5"><ThumbsUp className="h-4 w-4" aria-hidden="true" />Like</span>
            <span className="inline-flex items-center gap-1.5"><MessageCircle className="h-4 w-4" aria-hidden="true" />Comment</span>
            <span className="inline-flex items-center gap-1.5"><Share2 className="h-4 w-4" aria-hidden="true" />Share</span>
          </div>
        </article>
        <p className="text-center text-xs text-[var(--poskoo-ink)]">
          Approximate {device} cut-off: {characterLimit} characters or the third line break, whichever comes first.
        </p>
      </aside>
    </div>
  );
}
