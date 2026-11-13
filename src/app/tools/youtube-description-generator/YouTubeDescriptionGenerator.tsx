"use client";

import { useId, useMemo, useState } from "react";
import { Check, Copy, FileText, ListOrdered, Link2, Megaphone, PenLine, Hash } from "lucide-react";

const DESCRIPTION_LIMIT = 5000;
const FIRST_LINE_LIMIT = 150;
const MAX_HASHTAGS = 3;
const CTA_PLACEHOLDER = "Subscribe for a new video every week.";
const CHAPTER_RE = /^\d{1,2}:\d{2}(:\d{2})?\s+\S/;

const field = "mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base text-[var(--poskoo-ink)] outline-none focus:border-[var(--poskoo-violet)]";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const primaryBtn = "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40";

function cleanLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function buildHook(title: string, summary: string) {
  const t = title.trim();
  const s = summary.trim();
  if (!t && !s) return "";
  if (!t) return s.slice(0, FIRST_LINE_LIMIT);
  if (!s) return t.slice(0, FIRST_LINE_LIMIT);
  const hook = `${t}: ${s}`;
  if (hook.length <= FIRST_LINE_LIMIT) return hook;
  const room = FIRST_LINE_LIMIT - t.length - 2;
  if (room <= 0) return t.slice(0, FIRST_LINE_LIMIT);
  return `${t}: ${s.slice(0, room)}`;
}

export default function YouTubeDescriptionGenerator() {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [chapters, setChapters] = useState("");
  const [links, setLinks] = useState("");
  const [cta, setCta] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [copied, setCopied] = useState(false);
  const id = useId();

  const built = useMemo(() => {
    const hook = buildHook(title, summary);
    const summaryText = summary.trim();
    const chapterLines = cleanLines(chapters).filter((line) => CHAPTER_RE.test(line));
    const linkLines = cleanLines(links);
    const ctaText = cta.trim();
    const hashtagList = hashtags
      .split(",")
      .map((tag) => tag.replace(/[\s#]/g, "").toLowerCase())
      .filter(Boolean)
      .slice(0, MAX_HASHTAGS);

    const parts: string[] = [];
    if (hook) parts.push(hook);
    if (summaryText) parts.push(summaryText);
    if (chapterLines.length) parts.push(`Chapters:\n${chapterLines.join("\n")}`);
    if (linkLines.length) parts.push(`Links:\n${linkLines.join("\n")}`);
    if (ctaText) parts.push(ctaText);
    if (hashtagList.length) parts.push(hashtagList.map((tag) => `#${tag}`).join(" "));

    const firstValidChapter = chapterLines[0] ?? "";
    const chaptersNeedFix = chapterLines.length > 0 && !firstValidChapter.startsWith("0:00");

    return {
      text: parts.join("\n\n"),
      firstLine: hook,
      chapterCount: chapterLines.length,
      hashtagCount: hashtagList.length,
      chaptersNeedFix,
    };
  }, [title, summary, chapters, links, cta, hashtags]);

  const total = built.text.length;
  const over = total > DESCRIPTION_LIMIT;
  const firstLineOver = built.firstLine.length > FIRST_LINE_LIMIT;

  async function copyDescription() {
    try {
      await navigator.clipboard.writeText(built.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start">
        <form className="min-w-0 space-y-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div>
            <label htmlFor={`${id}-title`} className="text-sm font-semibold">
              Video title or topic
            </label>
            <input
              id={`${id}-title`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. 15-minute morning routine"
              autoComplete="off"
              className={field}
            />
            <p className="mt-1.5 text-xs text-[#5f5873]">Used for the first-line hook shown before “Show more”.</p>
          </div>
          <div>
            <label htmlFor={`${id}-summary`} className="text-sm font-semibold">
              What viewers learn
            </label>
            <textarea
              id={`${id}-summary`}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="e.g. A simple full-body routine you can do at home with no equipment."
              rows={4}
              className={`${field} resize-y`}
            />
            <p className="mt-1.5 text-xs text-[#5f5873]">One or two sentences about the video.</p>
          </div>
          <div>
            <label htmlFor={`${id}-chapters`} className="text-sm font-semibold">
              Chapters <span className="font-normal text-[#5f5873]">(optional)</span>
            </label>
            <textarea
              id={`${id}-chapters`}
              value={chapters}
              onChange={(event) => setChapters(event.target.value)}
              placeholder={"0:00 Intro\n1:30 Warm-up\n4:00 Main routine"}
              rows={4}
              className={`${field} resize-y`}
            />
            <p className="mt-1.5 text-xs text-[#5f5873]">One per line as “mm:ss Title”. The first chapter must start at 0:00.</p>
          </div>
          <div>
            <label htmlFor={`${id}-links`} className="text-sm font-semibold">
              Links <span className="font-normal text-[#5f5873]">(optional)</span>
            </label>
            <textarea
              id={`${id}-links`}
              value={links}
              onChange={(event) => setLinks(event.target.value)}
              placeholder={"Gear I used - https://example.com/gear\nFull playlist - https://example.com/playlist"}
              rows={3}
              className={`${field} resize-y`}
            />
            <p className="mt-1.5 text-xs text-[#5f5873]">One per line as “Label - URL”.</p>
          </div>
          <div>
            <label htmlFor={`${id}-cta`} className="text-sm font-semibold">
              Call to action <span className="font-normal text-[#5f5873]">(optional)</span>
            </label>
            <input
              id={`${id}-cta`}
              value={cta}
              onChange={(event) => setCta(event.target.value)}
              placeholder={CTA_PLACEHOLDER}
              autoComplete="off"
              className={field}
            />
          </div>
          <div>
            <label htmlFor={`${id}-hashtags`} className="text-sm font-semibold">
              Hashtags <span className="font-normal text-[#5f5873]">(optional, max 3 used)</span>
            </label>
            <input
              id={`${id}-hashtags`}
              value={hashtags}
              onChange={(event) => setHashtags(event.target.value)}
              placeholder="e.g. fitness, homeworkout, noequipment"
              autoComplete="off"
              className={field}
            />
            <p className="mt-1.5 text-xs text-[#5f5873]">Comma-separated. Up to 3 are added, lowercased with #.</p>
          </div>
        </form>

        <aside aria-label="Generated YouTube description" className="min-w-0 space-y-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <div className="grid grid-cols-2 gap-3">
            <div className={kpi}>
              <p className={kpiLabel}>
                <FileText className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />
                Total
              </p>
              <p aria-live="polite" className={`mt-1 text-2xl font-bold tabular-nums ${over ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-ink)]"}`}>
                {total.toLocaleString("en-US")}
                <span className="text-base font-medium text-[#5f5873]"> / {DESCRIPTION_LIMIT.toLocaleString("en-US")}</span>
              </p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, (total / DESCRIPTION_LIMIT) * 100)}%`, background: over ? "var(--poskoo-coral)" : "var(--poskoo-green)" }}
                />
              </div>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}>
                <PenLine className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />
                First line
              </p>
              <p className={`mt-1 text-2xl font-bold tabular-nums ${firstLineOver ? "text-[var(--poskoo-coral)]" : "text-[var(--poskoo-ink)]"}`}>
                {built.firstLine.length}
                <span className="text-base font-medium text-[#5f5873]"> / {FIRST_LINE_LIMIT}</span>
              </p>
              <p className="mt-1 text-xs text-[#5f5873]">Shown before “Show more”.</p>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}>
                <ListOrdered className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />
                Chapters
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{built.chapterCount}</p>
              <p className="mt-1 text-xs text-[#5f5873]">Valid “mm:ss Title” lines.</p>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}>
                <Hash className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />
                Hashtags
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{built.hashtagCount}</p>
              <p className="mt-1 text-xs text-[#5f5873]">Up to {MAX_HASHTAGS} are used.</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">
              <Link2 className="h-4 w-4 text-[var(--poskoo-violet)]" aria-hidden="true" />
              Description preview
            </p>
            <Megaphone className="h-4 w-4 text-[var(--poskoo-violet)]" aria-hidden="true" />
          </div>
          <pre className="whitespace-pre-wrap break-words rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-sm text-[var(--poskoo-ink)]">
            {built.text || "Fill in the blocks to build your description."}
          </pre>

          {built.chaptersNeedFix && (
            <p role="alert" className="rounded-xl border border-[#f5b700] bg-[var(--poskoo-card)] p-3 text-sm font-medium text-[#8a5a00]">
              YouTube chapters need the first timestamp to be 0:00 and at least 3 chapters.
            </p>
          )}

          <button type="button" onClick={copyDescription} disabled={!built.text} className={primaryBtn}>
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy description"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Description copied to clipboard" : ""}</span>
          <p className="text-xs text-[#5f5873]">Built and copied in your browser. Nothing is uploaded.</p>
        </aside>
      </div>
    </div>
  );
}
