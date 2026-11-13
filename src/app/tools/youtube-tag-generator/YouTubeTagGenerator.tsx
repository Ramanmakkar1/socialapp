"use client";

import { useId, useState, type FormEvent } from "react";
import { Check, Copy, Hash, Tags, X } from "lucide-react";
import t from "@/components/tools/tools.module.css";
import { countTags, YT_LIMITS } from "@/lib/youtubeCharCount";

const MODIFIERS = [
  "for beginners",
  "tutorial",
  "tips",
  "how to",
  "2026",
  "guide",
  "ideas",
  "at home",
  "explained",
  "step by step",
  "mistakes",
  "shorts",
];

const field = "mt-2 min-h-12 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base text-[var(--poskoo-ink)] outline-none focus:border-[var(--poskoo-violet)]";
const primaryBtn = "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40";

function normalise(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function YouTubeTagGenerator() {
  const [topic, setTopic] = useState("");
  const [extraKeywords, setExtraKeywords] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [copied, setCopied] = useState(false);
  const id = useId();
  const tagCount = countTags(tags.join(", "));
  const remaining = YT_LIMITS.tags - tagCount.total;
  const near = remaining <= 25;

  function generate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanTopic = normalise(topic);
    if (!cleanTopic) return;

    const extras = extraKeywords.split(",").map(normalise).filter(Boolean);
    const candidates = [
      cleanTopic,
      ...extras,
      ...MODIFIERS.map((modifier) => `${cleanTopic} ${modifier}`),
      `how to ${cleanTopic}`,
      `best ${cleanTopic}`,
    ];
    const nextTags: string[] = [];
    const seen = new Set<string>();
    let stoppedAtLimit = false;

    for (const candidate of candidates) {
      const tag = normalise(candidate);
      if (!tag || seen.has(tag)) continue;
      seen.add(tag);
      if (countTags([...nextTags, tag].join(", ")).total > YT_LIMITS.tags) {
        stoppedAtLimit = true;
        break;
      }
      nextTags.push(tag);
    }

    setTags(nextTags);
    setGenerated(true);
    setLimitReached(stoppedAtLimit);
    setCopied(false);
  }

  function removeTag(tagToRemove: string) {
    setTags((current) => current.filter((tag) => tag !== tagToRemove));
    setCopied(false);
  }

  async function copyTags() {
    try {
      await navigator.clipboard.writeText(tags.join(", "));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start">
        <form onSubmit={generate} className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div>
            <label htmlFor={`${id}-topic`} className="text-sm font-semibold">Main topic <span className="text-[var(--poskoo-red)]" aria-hidden="true">*</span></label>
            <input
              id={`${id}-topic`}
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              placeholder="e.g. home workout"
              autoComplete="off"
              required
              className={field}
            />
            <p className="mt-1.5 text-xs text-[#5f5873]">Use the main subject of your video, in a few words.</p>
          </div>
          <div className="mt-4">
            <label htmlFor={`${id}-keywords`} className="text-sm font-semibold">Extra keywords <span className="font-normal text-[#5f5873]">(optional)</span></label>
            <input
              id={`${id}-keywords`}
              value={extraKeywords}
              onChange={(event) => setExtraKeywords(event.target.value)}
              placeholder="e.g. dumbbells, weight loss, morning routine"
              autoComplete="off"
              className={field}
            />
            <p className="mt-1.5 text-xs text-[#5f5873]">Separate each extra keyword with a comma.</p>
          </div>
          <button type="submit" disabled={!topic.trim()} className={`${primaryBtn} mt-5`}>
            <Hash className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" />
            Generate tags
          </button>
          <p className="mt-3 text-xs leading-5 text-[#5f5873]">
            Tags are built from a fixed modifier list, lowercased and deduplicated in your browser. No topic is uploaded.
          </p>
        </form>

        <aside aria-label="Generated YouTube tags" className="min-w-0 space-y-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <div className={`${t.example} overflow-hidden`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">Tags ({tags.length})</p>
              <Tags className="h-4 w-4 text-[var(--poskoo-violet)]" aria-hidden="true" />
            </div>
            {tags.length > 0 ? (
              <ul className={`${t.points} mt-3`} aria-label="Generated YouTube tags">
                {tags.map((tag) => (
                  <li key={tag} className="inline-flex max-w-full items-center gap-1 break-all rounded-full bg-[var(--poskoo-card)] px-2.5 py-1 text-xs text-[var(--poskoo-ink)]">
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      aria-label={`Remove tag ${tag}`}
                      className="ml-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full hover:bg-[var(--poskoo-band)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)]"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-[#5f5873]">
                {generated ? "No tags fit. Shorten the topic or extra keywords and try again." : "Enter your topic and select Generate tags to see your list."}
              </p>
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span className="tabular-nums text-[#5f5873]">
                <strong className="font-semibold text-[var(--poskoo-ink)]">{tagCount.total.toLocaleString("en-US")}</strong>
                {" / "}{YT_LIMITS.tags.toLocaleString("en-US")} characters
              </span>
              <span aria-live="polite" className={`font-semibold tabular-nums ${near ? "text-[#8a5a00]" : "text-[var(--poskoo-green)]"}`}>
                {remaining.toLocaleString("en-US")} characters left
              </span>
            </div>
            <div
              className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--poskoo-line)]"
              role="progressbar"
              aria-label="YouTube tag character limit used"
              aria-valuemin={0}
              aria-valuemax={YT_LIMITS.tags}
              aria-valuenow={tagCount.total}
            >
              <div
                className="h-full rounded-full motion-safe:transition-all"
                style={{ width: `${Math.min(100, (tagCount.total / YT_LIMITS.tags) * 100)}%`, background: near ? "#f5b700" : "var(--poskoo-green)" }}
              />
            </div>
            <p className="mt-2 text-xs text-[#5f5873]">Multi-word tags count two extra quote characters, and commas between tags count too.</p>
          </div>

          <button type="button" onClick={copyTags} disabled={!tags.length} className={primaryBtn}>
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy tags"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Tags copied to clipboard" : ""}</span>
        </aside>
      </div>

      {limitReached && (
        <p role="alert" className="rounded-xl border border-[#f5b700] bg-[var(--poskoo-card)] p-3 text-sm font-medium text-[#8a5a00]">
          The next tag would exceed YouTube&apos;s 500-character limit, so it and all later suggestions were left out. Remove a tag or shorten your inputs to make room.
        </p>
      )}
    </div>
  );
}
