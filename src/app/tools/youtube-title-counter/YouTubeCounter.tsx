"use client";

import { useId, useState } from "react";
import { AlignLeft, Check, Copy, Eraser, Tags, Type } from "lucide-react";
import t from "@/components/tools/tools.module.css";
import { countTags, countYouTube, hasInvalidTitleChars, YT_LIMITS } from "@/lib/youtubeCharCount";

type Tab = "title" | "description" | "tags";

const TABS: { value: Tab; label: string }[] = [
  { value: "title", label: "Title" },
  { value: "description", label: "Description" },
  { value: "tags", label: "Tags" },
];

const INITIAL_DRAFTS: Record<Tab, string> = {
  title: "How to Plan a Week of YouTube Videos in One Sitting",
  description: "Plan your next YouTube video with a clear title, a useful description and relevant tags. Put the main topic and viewer benefit first, then add links, chapters and any details your audience needs.",
  tags: "youtube tips, content planning, video marketing",
};

const ghostBtn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

function CountCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Type }) {
  return (
    <div className={kpi}>
      <p className={kpiLabel}><Icon className="h-3 w-3" aria-hidden="true" />{label}</p>
      <p className="mt-0.5 text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{value.toLocaleString("en-US")}</p>
    </div>
  );
}

export default function YouTubeCounter() {
  const [tab, setTab] = useState<Tab>("title");
  const [drafts, setDrafts] = useState(INITIAL_DRAFTS);
  const [copied, setCopied] = useState(false);
  const id = useId();
  const text = drafts[tab];
  const textCount = tab === "tags" ? null : countYouTube(text, tab);
  const tagCount = countTags(text);
  const chars = textCount?.chars ?? tagCount.total;
  const limit = YT_LIMITS[tab];
  const remaining = limit - chars;
  const over = remaining < 0;
  const invalidTitle = tab === "title" && hasInvalidTitleChars(text);
  const near = !over && remaining <= Math.max(10, Math.round(limit * 0.05));
  const colour = over || invalidTitle ? "text-[var(--poskoo-red)]" : near ? "text-[#8a5a00]" : "text-[var(--poskoo-green)]";
  const hex = over || invalidTitle ? "var(--poskoo-red)" : near ? "#f5b700" : "var(--poskoo-green)";
  const used = Math.min(100, (chars / limit) * 100);
  const verdict = !text ? "Empty" : invalidTitle ? "Invalid title" : over ? "Too long" : near ? "Almost full" : "Fits";

  function setText(value: string) {
    setDrafts((current) => ({ ...current, [tab]: value }));
    setCopied(false);
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

  return (
    <div className="min-w-0 space-y-5 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div role="group" aria-label="YouTube field" className="grid grid-cols-3 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1">
            {TABS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={tab === option.value}
                onClick={() => { setTab(option.value); setCopied(false); }}
                className={`min-h-10 rounded-lg px-2 text-sm font-medium motion-safe:transition ${tab === option.value ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={id} className="text-sm font-semibold">Your YouTube {tab}</label>
            <button type="button" className={ghostBtn} onClick={() => setText("")} disabled={!text}>
              <Eraser className="h-4 w-4" aria-hidden="true" />Clear
            </button>
          </div>
          {tab === "title" ? (
            <input
              id={id}
              aria-describedby={`${id}-status${invalidTitle ? ` ${id}-invalid` : ""}`}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Write or paste your YouTube title…"
              className="mt-2 min-h-12 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base outline-none focus:border-[var(--poskoo-violet)]"
            />
          ) : (
            <textarea
              id={id}
              aria-describedby={`${id}-status`}
              value={text}
              onChange={(event) => setText(event.target.value)}
              rows={tab === "description" ? 10 : 7}
              placeholder={tab === "description" ? "Write or paste your YouTube description…" : "Enter tags separated by commas…"}
              className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base leading-6 outline-none focus:border-[var(--poskoo-violet)]"
            />
          )}

          <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <span className="tabular-nums text-[#5f5873]">
              <strong className="font-semibold text-[var(--poskoo-ink)]">{chars.toLocaleString("en-US")}</strong>
              {" / "}{limit.toLocaleString("en-US")} characters
            </span>
            <span id={`${id}-status`} aria-live="polite" className={`font-semibold tabular-nums ${colour}`}>
              {over ? `${Math.abs(remaining).toLocaleString("en-US")} over the limit` : `${remaining.toLocaleString("en-US")} characters left`}
            </span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--poskoo-line)]"
            role="progressbar"
            aria-label={`YouTube ${tab} length used`}
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-valuenow={Math.min(chars, limit)}
          >
            <div className="h-full rounded-full motion-safe:transition-all" style={{ width: `${used}%`, background: hex }} />
          </div>
          <p className="mt-2 text-xs text-[#5f5873]">
            {tab === "tags"
              ? "Multi-word tags count two extra quote characters, and commas between tags count too."
              : "Characters are counted by code point, so an emoji such as 😀 counts as 1."}
          </p>

          {invalidTitle && (
            <p id={`${id}-invalid`} role="alert" className="mt-3 rounded-xl border border-[var(--poskoo-red)] bg-[var(--poskoo-card)] p-3 text-sm font-medium text-[var(--poskoo-red)]">
              YouTube titles cannot contain &lt; or &gt;. Remove the angle brackets before publishing.
            </p>
          )}
        </div>

        <aside aria-label={`YouTube ${tab} result`} className="min-w-0 space-y-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className={kpiLabel}>Status</p>
              <p className="text-2xl font-bold text-[var(--poskoo-ink)]">{verdict}</p>
            </div>
            <p className="text-right text-xs tabular-nums text-[#5f5873]">{Math.round((chars / limit) * 100)}% used</p>
          </div>

          {tab === "title" && (
            <div className={`${t.example} overflow-hidden`}>
              <p className={kpiLabel}>Shown in search</p>
              {text ? (
                <p className="mt-2 break-words text-base font-semibold leading-6 text-[#065fd4]">
                  {textCount?.visiblePreview}{chars > YT_LIMITS.titleVisible ? "…" : ""}
                </p>
              ) : (
                <p className="mt-2 text-xs text-[#5f5873]">Start typing to preview your title.</p>
              )}
              <p className="mt-2 text-xs text-[#3d3450]">Approximately the first 70 characters · yourchannel</p>
            </div>
          )}

          {tab === "description" && (
            <div className={`${t.example} overflow-hidden`}>
              <p className={kpiLabel}>Above the fold</p>
              {text ? (
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-5 text-[#3d3450]">
                  {textCount?.visiblePreview}
                  {chars > YT_LIMITS.descriptionVisible && <span className="font-semibold text-[var(--poskoo-ink)]"> Show more</span>}
                </p>
              ) : (
                <p className="mt-2 text-xs text-[#5f5873]">Start typing to preview your description.</p>
              )}
              <p className="mt-2 text-xs text-[#3d3450]">Approximately 157 characters show before Show more.</p>
            </div>
          )}

          {tab === "tags" && (
            <div className={`${t.example} overflow-hidden`}>
              <p className={kpiLabel}>Tags ({tagCount.tags.length})</p>
              {tagCount.tags.length > 0 ? (
                <ul className={`${t.points} mt-3`} aria-label="YouTube tags">
                  {tagCount.tags.map((tag, index) => (
                    <li key={`${tag}-${index}`} className="max-w-full break-all rounded-full bg-[var(--poskoo-card)] px-2.5 py-1 text-xs text-[var(--poskoo-ink)]">{tag}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-xs text-[#5f5873]">Add comma-separated tags to see them here.</p>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={copy}
            disabled={!text}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] disabled:opacity-40"
          >
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : `Copy ${tab}`}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
        </aside>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <CountCard label={tab === "tags" ? "Tag total" : "Characters"} value={chars} icon={Type} />
        <CountCard label="Remaining" value={remaining} icon={Type} />
        <CountCard label={tab === "tags" ? "Tags" : "Preview chars"} value={tab === "tags" ? tagCount.tags.length : Math.min(chars, tab === "title" ? YT_LIMITS.titleVisible : YT_LIMITS.descriptionVisible)} icon={tab === "tags" ? Tags : AlignLeft} />
      </div>
    </div>
  );
}
