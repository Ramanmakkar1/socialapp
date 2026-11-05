"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { Check, Copy, Hash } from "lucide-react";
import { buildHashtags, type HashtagMix } from "@/lib/hashtagSets";

const niches = [
  ["fitness", "Fitness"], ["food", "Food"], ["travel", "Travel"],
  ["real-estate", "Real estate"], ["beauty-salon", "Beauty / salon"],
  ["photography", "Photography"], ["small-business", "Small business"],
  ["coaching", "Coaching"], ["fashion", "Fashion"], ["ecommerce", "Ecommerce"],
  ["restaurant", "Restaurant"], ["wedding", "Wedding"], ["pets", "Pets"],
  ["tech-saas", "Tech / SaaS"], ["local-services", "Local services"],
];
const mixes: { value: HashtagMix; label: string }[] = [
  { value: "balanced", label: "Balanced" },
  { value: "broad", label: "More broad" },
  { value: "niche", label: "More specific" },
];

export default function HashtagGenerator() {
  const id = useId();
  const [niche, setNiche] = useState("fitness");
  const [count, setCount] = useState(15);
  const [mix, setMix] = useState<HashtagMix>("balanced");
  const [extra, setExtra] = useState("");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const tags = buildHashtags(niche, { count, mix, extra });
  const text = tags.map((tag) => `#${tag}`).join(" ");

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <div className="glow grid gap-6 rounded-3xl border border-line bg-surface p-4 text-left sm:p-6 lg:grid-cols-[1fr_1.2fr]">
      <div className="min-w-0 space-y-6">
        <div>
          <label htmlFor={`${id}-niche`} className="text-sm font-medium">Your niche</label>
          <select id={`${id}-niche`} value={niche} onChange={(e) => setNiche(e.target.value)} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-bg px-3 text-base focus:border-brand">
            {niches.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-count`} className="flex justify-between text-sm font-medium">Hashtag count <span className="text-brand tabular-nums">{count}</span></label>
          <input id={`${id}-count`} type="range" min={5} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-2 min-h-11 w-full accent-brand" />
          <div className="flex justify-between text-xs text-ink-2"><span>5 tags</span><span>30 tags</span></div>
        </div>
        <fieldset>
          <legend className="text-sm font-medium">Your mix</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {mixes.map((item) => (
              <label key={item.value} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm ${mix === item.value ? "border-brand bg-brand/10" : "border-line bg-bg"}`}>
                <input type="radio" name={`${id}-mix`} value={item.value} checked={mix === item.value} onChange={() => setMix(item.value)} className="accent-brand" />{item.label}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-ink-2">Broad = general topics. Specific = focused subjects. At 30 tags, the full curated set uses all three tiers.</p>
        </fieldset>
        <div>
          <label htmlFor={`${id}-extra`} className="text-sm font-medium">Extra keyword <span className="font-normal text-ink-2">(optional)</span></label>
          <input id={`${id}-extra`} value={extra} onChange={(e) => setExtra(e.target.value)} maxLength={80} placeholder="e.g. Denver fitness" aria-describedby={`${id}-hint`} className="mt-2 min-h-11 w-full rounded-xl border border-line bg-bg px-3 text-base focus:border-brand" />
          <p id={`${id}-hint`} className="mt-2 text-xs text-ink-2">Adds a combined tag and, for a phrase, its first word. Review both before posting.</p>
        </div>
      </div>
      <div className="min-w-0 rounded-2xl border border-line bg-bg p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-semibold"><Hash className="h-5 w-5 text-brand" />Your hashtag set</h2>
          <button type="button" onClick={copy} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-sm font-medium hover:text-brand">
            {copyStatus === "copied" ? <Check className="h-4 w-4 text-ok" /> : <Copy className="h-4 w-4" />}
            <span aria-live="polite">{copyStatus === "copied" ? "Copied" : "Copy all"}</span>
          </button>
        </div>
        <p aria-live="polite" className="mt-2 text-xs text-ink-2">{tags.length} tags ready to review</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {tags.map((tag) => <li key={tag} className="max-w-full break-all rounded-full border border-brand/20 bg-brand/10 px-3 py-2 text-sm text-brand">#{tag}</li>)}
        </ul>
        {copyStatus === "failed" && <p role="status" className="mt-4 text-sm text-ink-2">Clipboard access is unavailable. Select and copy the tags below.</p>}
        <details className="mt-5 text-sm text-ink-2" open={copyStatus === "failed" || undefined}>
          <summary className="min-h-11 cursor-pointer py-3">Select tags as plain text</summary>
          <textarea aria-label="Hashtags to copy manually" readOnly value={text} rows={5} onFocus={(e) => e.target.select()} className="w-full rounded-xl border border-line bg-surface p-3 text-base" />
        </details>
        <Link href="/tools/instagram-caption-counter" className="mt-4 inline-flex min-h-11 items-center text-sm font-medium text-brand underline underline-offset-2">Check your caption and hashtag count</Link>
      </div>
    </div>
  );
}
