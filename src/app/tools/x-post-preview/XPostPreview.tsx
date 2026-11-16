"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy, Eye, Heart, Monitor, RotateCcw, Smartphone, Upload } from "lucide-react";
import { countX, X_LIMIT } from "@/lib/xCharCount";

const SAMPLE =
  "Your first two lines decide whether someone reads the rest of your post.\n\nLead with a useful idea, add the detail your audience needs, and finish with a question that makes it easy to reply. A quick preview helps you spot a hidden hook, an awkward break or a wall of text before you publish. #contentstrategy";

const ghostBtn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const field = "mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base text-[var(--poskoo-ink)] outline-none focus:border-[var(--poskoo-violet)]";

type Device = "desktop" | "mobile";

const TOKEN_RE = /(\bhttps?:\/\/[^\s]+)|(^|\s)(#[\p{L}\p{N}_]+)|(^|\s)(@\w{1,15})/gu;

function renderPost(text: string) {
  const parts = text.split(TOKEN_RE);
  return parts.map((part, index) => {
    if (!part) return null;
    if (/^https?:\/\//.test(part) || part.startsWith("#") || part.startsWith("@")) {
      return (
        <span key={index} className="text-[var(--poskoo-violet)]">
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function XPostPreview() {
  const [text, setText] = useState(SAMPLE);
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [device, setDevice] = useState<Device>("desktop");
  const [copied, setCopied] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!image) return;
    return () => URL.revokeObjectURL(image);
  }, [image]);

  const { weighted, remaining, overBy } = countX(text);
  const over = overBy > 0;
  const displayName = name.trim() || "Your Name";
  const displayHandle = handle.trim() ? (handle.startsWith("@") ? handle : `@${handle}`) : "@yourhandle";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => [...part][0] ?? "")
    .join("")
    .toUpperCase();
  const overflowStart = over ? Math.max(0, [...text].length - overBy) : null;

  function updateText(value: string) {
    setText(value);
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
    setHandle("");
    setImage(null);
    setCopied(false);
  }

  function onImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
  }

  const body = overflowStart === null ? text : [...text].slice(overflowStart).join("");
  const prefix = overflowStart === null ? "" : [...text].slice(0, overflowStart).join("");

  return (
    <div className="grid min-w-0 gap-5 text-left lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:items-start">
      <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label htmlFor={`${id}-post`} className="text-sm font-semibold">Your X post</label>
          <button
            type="button"
            onClick={reset}
            disabled={!text && !name && !handle && !image}
            aria-label="Reset X post preview"
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
          placeholder="Write or paste your post…"
          aria-describedby={`${id}-status`}
          className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
          <span className="tabular-nums text-[var(--poskoo-ink)]">
            <strong className="font-semibold">{weighted.toLocaleString("en-US")}</strong> / {X_LIMIT} characters
          </span>
          <span
            id={`${id}-status`}
            aria-live="polite"
            className={`font-semibold tabular-nums ${over ? "text-[var(--poskoo-red)]" : "text-[var(--poskoo-green)]"}`}
          >
            {over ? `${overBy.toLocaleString("en-US")} over the limit` : `${remaining.toLocaleString("en-US")} characters left`}
          </span>
        </div>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--poskoo-line)]"
          role="progressbar"
          aria-label="X post length used"
          aria-valuemin={0}
          aria-valuemax={X_LIMIT}
          aria-valuenow={Math.min(weighted, X_LIMIT)}
        >
          <div
            className="h-full rounded-full motion-safe:transition-all"
            style={{ width: `${Math.min(100, (weighted / X_LIMIT) * 100)}%`, background: over ? "var(--poskoo-red)" : "var(--poskoo-green)" }}
          />
        </div>
        {over && (
          <p className="mt-2 text-xs font-medium text-[var(--poskoo-red)]">
            X posts can be up to {X_LIMIT} characters. Links count as 23. Shorten this draft before publishing.
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
            <label htmlFor={`${id}-handle`} className="text-sm font-semibold">@handle <span className="font-normal">(optional)</span></label>
            <input
              id={`${id}-handle`}
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="@yourhandle"
              className={field}
            />
          </div>
        </div>

        <div className="mt-4">
          <span className="text-sm font-semibold">Image <span className="font-normal">(optional, stays in your browser)</span></span>
          <input ref={fileRef} type="file" accept="image/*" onChange={onImageChange} className="sr-only" aria-label="Upload an image for the preview" />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} className={ghostBtn}>
              <Upload className="h-4 w-4" aria-hidden="true" />
              {image ? "Change image" : "Add image"}
            </button>
            {image && (
              <button type="button" onClick={() => setImage(null)} className={ghostBtn} aria-label="Remove image">
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <aside aria-labelledby={`${id}-preview`} className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
        <button
          type="button"
          onClick={copy}
          disabled={!text}
          aria-label="Copy X post text"
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] disabled:opacity-40"
        >
          {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id={`${id}-preview`} className="text-sm font-semibold">{device === "desktop" ? "Desktop preview" : "Mobile preview"}</h3>
          <div role="group" aria-label="Preview width" className="flex rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1">
            <button
              type="button"
              aria-pressed={device === "desktop"}
              onClick={() => setDevice("desktop")}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium ${device === "desktop" ? "bg-[var(--poskoo-ink)] text-white" : "text-[var(--poskoo-ink)]"}`}
            >
              <Monitor className="h-4 w-4" aria-hidden="true" />Desktop
            </button>
            <button
              type="button"
              aria-pressed={device === "mobile"}
              onClick={() => setDevice("mobile")}
              className={`inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium ${device === "mobile" ? "bg-[var(--poskoo-ink)] text-white" : "text-[var(--poskoo-ink)]"}`}
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />Mobile
            </button>
          </div>
        </div>

        <article
          aria-label={`${device === "desktop" ? "Desktop" : "Mobile"} X post mockup`}
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
              <p className="truncate text-xs leading-5 text-[var(--poskoo-ink)]">{displayHandle} · now</p>
            </div>
          </div>
          <p className="mt-3 min-h-24 whitespace-pre-wrap break-words text-sm leading-6 text-[var(--poskoo-ink)]">
            {text ? (
              <>
                {prefix && <span>{renderPost(prefix)}</span>}
                {over && body && <span className="rounded bg-[var(--poskoo-red)]/15 text-[var(--poskoo-red)]">{renderPost(body)}</span>}
              </>
            ) : (
              <span>Your post appears here</span>
            )}
          </p>
          {image && (
            <img src={image} alt="Attached to the post preview" className="mt-3 max-h-64 w-full rounded-xl object-cover" />
          )}
          <div className="mt-4 flex items-center justify-between border-t border-[var(--poskoo-line)] pt-3 text-[var(--poskoo-ink)]" aria-hidden="true">
            <span className="inline-flex items-center gap-1.5 text-xs"><Heart className="h-4 w-4" /> 0</span>
            <span className="inline-flex items-center gap-1.5 text-xs"><Copy className="h-4 w-4" /> 0</span>
            <span className="inline-flex items-center gap-1.5 text-xs"><Eye className="h-4 w-4" /> 0</span>
            <span className="inline-flex items-center gap-1.5 text-xs"><RotateCcw className="h-4 w-4" /> 0</span>
          </div>
        </article>
        <p className="text-center text-xs text-[var(--poskoo-ink)]">
          Links count as 23 characters against the {X_LIMIT}-character limit.
        </p>
      </aside>
    </div>
  );
}
