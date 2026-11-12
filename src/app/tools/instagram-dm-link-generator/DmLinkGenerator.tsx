"use client";

import { useId, useMemo, useState } from "react";
import { AtSign, Check, CircleAlert, CircleCheck, Code2, Copy, ExternalLink, Link2, MessageCircle, Sticker, UserRound } from "lucide-react";

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

const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const ghostBtn = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";

function CopyChip({ text, label, primary }: { text: string; label: string; primary?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!text) return;
    const ok = await copyText(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (primary) {
    return (
      <button
        type="button"
        onClick={copy}
        disabled={!text}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40 disabled:hover:translate-y-0"
      >
        {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
        <span aria-live="polite">{copied ? "Copied" : label}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={copy}
      disabled={!text}
      className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition disabled:opacity-40 ${copied ? "border-[var(--poskoo-green)] bg-[var(--poskoo-green)]/10" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] hover:border-[var(--poskoo-ink)]"}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-[var(--poskoo-green)]" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
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

  const cleaned = input.trim() !== "" && username !== input.trim();
  const status = !username ? "Waiting" : valid ? "Ready" : "Check name";
  const snippetsReady = [bioLine, htmlSnippet, storyTip].filter(Boolean).length;

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Input */}
      <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
        <label htmlFor={inputId} className="text-sm font-semibold">
          Instagram username
        </label>
        <div className="relative mt-2">
          <AtSign aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--poskoo-violet)]" />
          <input
            id={inputId}
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="@my.brand or instagram.com/my.brand"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            aria-invalid={error ? true : undefined}
            className={`min-h-12 w-full rounded-xl border bg-[var(--poskoo-card)] py-3 pl-10 pr-28 text-base outline-none ring-[var(--poskoo-violet)] focus:ring-2 ${error ? "border-[var(--poskoo-coral)]" : "border-[var(--poskoo-line)]"}`}
          />
          <span
            aria-hidden="true"
            className={`absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold ${
              valid ? "bg-[var(--poskoo-green)]/12 text-[#146b43]" : error ? "bg-[var(--poskoo-coral)]/12 text-[#a8410f]" : "bg-[var(--poskoo-band)] text-[#5f5873]"
            }`}
          >
            {valid ? <CircleCheck className="h-3.5 w-3.5" /> : error ? <CircleAlert className="h-3.5 w-3.5" /> : null}
            {status}
          </span>
        </div>
        {error ? (
          <p className="mt-2 text-sm text-[var(--poskoo-coral)]" role="alert">
            {error}
          </p>
        ) : (
          <p className="mt-2 text-xs text-[var(--poskoo-muted)]">Paste @handle, a profile URL, or type the username. Nothing leaves your browser.</p>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}>Status</p>
          <p className={`mt-1 text-2xl font-bold ${valid ? "text-[var(--poskoo-green)]" : error ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-ink)]"}`}>{status}</p>
          <p className="mt-1 text-xs text-[#3d3450]">{cleaned && valid ? "Cleaned from your paste." : "Format check only."}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Username length</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">
            {username.length}
            <span className="text-base font-medium text-[#5f5873]"> / 30</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
            <i
              className="block h-full rounded-full"
              style={{ width: `${Math.min(100, (username.length / 30) * 100)}%`, background: username.length > 30 ? "var(--poskoo-coral)" : "var(--poskoo-violet)" }}
            />
          </div>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Link length</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{valid ? dmUrl.length : "—"}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Characters in the ig.me link.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>Snippets ready</p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">
            {snippetsReady}
            <span className="text-base font-medium text-[#5f5873]"> / 3</span>
          </p>
          <p className="mt-1 text-xs text-[#3d3450]">Bio, HTML and Story sticker.</p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Snippets */}
        <div className="min-w-0 space-y-3">
          <SnippetBlock icon={UserRound} title="Bio line" text={bioLine} copyLabel="Copy bio line" />
          <SnippetBlock icon={Code2} title="HTML link" text={htmlSnippet} copyLabel="Copy HTML" mono />
          <SnippetBlock icon={Sticker} title="Story Link sticker" text={storyTip} copyLabel="Copy tip" />
        </div>

        {/* Primary action + preview */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#5f5873]">
            <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
            Your DM link
          </p>
          <code className={`block break-all rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-3 text-sm font-semibold ${valid ? "text-[var(--poskoo-violet)]" : "text-[#b5aec4]"}`}>
            {valid ? dmUrl : "https://ig.me/m/yourname"}
          </code>
          <CopyChip text={dmUrl} label="Copy link" primary />
          {valid ? (
            <a href={dmUrl} target="_blank" rel="noopener noreferrer" className={`${ghostBtn} w-full`}>
              Open link <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : null}

          {/* Mock profile preview */}
          <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-sm" aria-hidden="true">
            <div className="flex items-center gap-2.5">
              <span className="h-10 w-10 flex-none rounded-full bg-[conic-gradient(var(--poskoo-violet),var(--poskoo-pink),var(--poskoo-peach),var(--poskoo-violet))] p-[2px]">
                <span className="block h-full w-full rounded-full border-2 border-white bg-[var(--poskoo-band)]" />
              </span>
              <span className="min-w-0 truncate font-semibold">{valid ? username : "yourname"}</span>
            </div>
            <p className="mt-2 text-xs text-[#5f5873]">Bio preview</p>
            {valid ? (
              <p className="mt-1 break-all text-[13px] leading-snug">
                DM me here: <span className="font-medium text-[#3b5bdb]">{dmUrl.replace("https://", "")}</span>
              </p>
            ) : (
              <p className="mt-1 rounded-lg border border-dashed border-[var(--poskoo-line)] p-2 text-center text-xs text-[#5f5873]">Enter a username to preview your bio link.</p>
            )}
            <span className={`mt-3 flex min-h-9 items-center justify-center gap-1.5 rounded-lg text-xs font-semibold ${valid ? "bg-[var(--poskoo-violet)] text-white" : "bg-[var(--poskoo-line)] text-[#5f5873]"}`}>
              <MessageCircle className="h-3.5 w-3.5" />
              Message
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SnippetBlock({
  icon: Icon,
  title,
  text,
  copyLabel,
  mono,
}: {
  icon: typeof Copy;
  title: string;
  text: string;
  copyLabel: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <span className="grid h-8 w-8 flex-none place-items-center rounded-lg bg-[var(--poskoo-band)] text-[var(--poskoo-violet)]">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </span>
          {title}
        </p>
        <CopyChip text={text} label={copyLabel} />
      </div>
      {/* Monospace only for the generated code itself, not for the hint. */}
      {text ? (
        <p className={`mt-3 rounded-xl bg-[var(--poskoo-paper)] p-3 text-sm text-[#3d3450] ${mono ? "font-mono text-xs break-all" : "break-words"}`}>{text}</p>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-[var(--poskoo-line)] p-3 text-sm text-[#5f5873]">Enter a valid username above to generate this snippet.</p>
      )}
    </div>
  );
}
