"use client";

import { useId, useMemo, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

const USERNAME_RE = /^[a-zA-Z0-9._]{1,30}$/;

function normalizeUsername(raw: string): string {
  let s = raw.trim();
  const urlMatch = s.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#]+)/i);
  if (urlMatch) s = urlMatch[1];
  s = s.replace(/^@+/, "").replace(/\s/g, "");
  return s;
}

function validateUsername(username: string): string | null {
  if (!username) return null;
  if (!USERNAME_RE.test(username)) {
    return "Use 1–30 characters: letters, numbers, periods (.) and underscores (_).";
  }
  return null;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

function CopyChip({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!text) return;
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!text}
      className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 text-xs font-medium hover:text-[var(--poskoo-ink)] disabled:opacity-40"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[var(--poskoo-green)]" /> : <Copy className="h-3.5 w-3.5" />}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}

export default function DmLinkGenerator() {
  const [input, setInput] = useState("");
  const inputId = useId();

  const username = useMemo(() => normalizeUsername(input), [input]);
  const error = validateUsername(username);
  const valid = username.length > 0 && !error;
  const dmUrl = valid ? `https://ig.me/m/${username}` : "";

  const bioLine = valid ? `DM me here: ${dmUrl}` : "";
  const htmlSnippet = valid
    ? `<a href="${dmUrl}" target="_blank" rel="noopener noreferrer">Message me on Instagram</a>`
    : "";
  const storyTip = valid
    ? `In Instagram Stories, tap the Link sticker and paste ${dmUrl}. Label it “DM me” or “Send a message”.`
    : "";

  return (
    <div className="text-left">
      <label htmlFor={inputId} className="text-sm font-medium">
        Instagram username
      </label>
      <input
        id={inputId}
        type="text"
        inputMode="text"
        autoComplete="off"
        spellCheck={false}
        placeholder="@my.brand or instagram.com/my.brand"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-3 text-sm outline-none ring-[var(--poskoo-violet)] focus:ring-2"
      />
      {error ? (
        <p className="mt-2 text-sm text-[var(--poskoo-coral)]" role="alert">
          {error}
        </p>
      ) : (
        <p className="mt-2 text-xs text-[var(--poskoo-muted)]">Paste @handle, a profile URL, or type the username. Nothing leaves your browser.</p>
      )}

      <div className="mt-6 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-[var(--poskoo-muted)]">Your DM link</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <code className="break-all text-sm font-medium text-[var(--poskoo-violet)]">{valid ? dmUrl : "https://ig.me/m/yourname"}</code>
          <div className="flex flex-wrap items-center gap-2">
            <CopyChip text={dmUrl} label="Copy link" />
            {valid ? (
              <a
                href={dmUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-xs font-medium hover:text-[var(--poskoo-ink)]"
              >
                Open link <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <SnippetBlock title="Bio line" text={bioLine} copyLabel="Copy bio line" />
        <SnippetBlock title="HTML link" text={htmlSnippet} copyLabel="Copy HTML" mono />
        <SnippetBlock title="Story Link sticker" text={storyTip} copyLabel="Copy tip" />
      </div>
    </div>
  );
}

function SnippetBlock({
  title,
  text,
  copyLabel,
  mono,
}: {
  title: string;
  text: string;
  copyLabel: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium">{title}</p>
        <CopyChip text={text} label={copyLabel} />
      </div>
      <p className={`mt-2 text-sm text-[#3d3450] ${mono ? "font-mono text-xs break-all" : ""}`}>
        {text || "Enter a valid username above to generate this snippet."}
      </p>
    </div>
  );
}
