"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  Camera, Check, ChefHat, ClipboardList, Copy, Cpu, Download, Dumbbell, Gem, Hash, House, Info, PawPrint, Plane,
  ShoppingCart, Shirt, Sparkles, Store, Target, Utensils, Wrench, type LucideIcon,
} from "lucide-react";
import type { HashtagMix } from "@/lib/hashtagSets";
import {
  POPULARITY_NOTE, TIER_LABEL, captionBlock, hashtagCsv, hashtagLine, planHashtags, type HashtagTier,
} from "@/lib/hashtagPlanner";

const niches: [string, string, LucideIcon][] = [
  ["fitness", "Fitness", Dumbbell], ["food", "Food", Utensils], ["travel", "Travel", Plane],
  ["real-estate", "Real estate", House], ["beauty-salon", "Beauty / salon", Sparkles],
  ["photography", "Photography", Camera], ["small-business", "Small business", Store],
  ["coaching", "Coaching", Target], ["fashion", "Fashion", Shirt], ["ecommerce", "Ecommerce", ShoppingCart],
  ["restaurant", "Restaurant", ChefHat], ["wedding", "Wedding", Gem], ["pets", "Pets", PawPrint],
  ["tech-saas", "Tech / SaaS", Cpu], ["local-services", "Local services", Wrench],
];
const mixes: { value: HashtagMix; label: string }[] = [
  { value: "balanced", label: "Balanced" },
  { value: "broad", label: "More broad" },
  { value: "niche", label: "More specific" },
];
type Sort = "order" | "popularity" | "tier" | "az";
const TIER_ORDER: HashtagTier[] = ["broad", "mid", "niche", "custom"];
const TIER_STYLE: Record<HashtagTier, { chip: string; bar: string }> = {
  broad: { chip: "bg-[var(--poskoo-violet)]/12 text-[var(--poskoo-violet)] border-[var(--poskoo-violet)]/25", bar: "bg-[var(--poskoo-violet)]" },
  mid: { chip: "bg-[#ff8a5b]/15 text-[#b4471c] border-[#ff8a5b]/35", bar: "bg-[#ff8a5b]" },
  niche: { chip: "bg-[var(--poskoo-green)]/12 text-[#17784a] border-[var(--poskoo-green)]/30", bar: "bg-[var(--poskoo-green)]" },
  custom: { chip: "bg-[#ddf46b]/50 text-[#1e1631] border-[#b9d13e]", bar: "bg-[#c6e04a]" },
};
const COMPETITION_STYLE = { High: "text-[#b4471c]", Medium: "text-[#8a6a00]", Low: "text-[#17784a]", Unrated: "text-[#5f5873]" } as const;

const field = "min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base focus:border-[var(--poskoo-violet)]";
const toolBtn = "inline-flex min-h-10 items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3.5 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";

export default function HashtagGenerator() {
  const id = useId();
  const [niche, setNiche] = useState("fitness");
  const [count, setCount] = useState(15);
  const [mix, setMix] = useState<HashtagMix>("balanced");
  const [extra, setExtra] = useState("");
  const [sort, setSort] = useState<Sort>("order");
  const [tierFilter, setTierFilter] = useState<HashtagTier | "all">("all");
  const [copied, setCopied] = useState<string | null>(null);
  const [copyFailed, setCopyFailed] = useState(false);

  const rows = useMemo(() => planHashtags(niche, { count, mix, extra }), [niche, count, mix, extra]);
  // Selection resets to "everything" whenever the generated set changes.
  const setKey = rows.map((r) => r.tag).join(" ");
  const [sel, setSel] = useState<{ key: string; tags: Set<string> }>({ key: "", tags: new Set() });
  const selected = sel.key === setKey ? sel.tags : new Set(rows.map((r) => r.tag));
  const setSelected = (tags: Set<string>) => setSel({ key: setKey, tags });
  const toggle = (tag: string) => {
    const next = new Set(selected);
    if (next.has(tag)) next.delete(tag); else next.add(tag);
    setSelected(next);
  };

  const selectedRows = rows.filter((r) => selected.has(r.tag));
  const selectedTags = selectedRows.map((r) => r.tag);
  const mixCounts = TIER_ORDER.map((tier) => ({ tier, n: selectedRows.filter((r) => r.tier === tier).length }));
  const tiersPresent = TIER_ORDER.filter((tier) => rows.some((r) => r.tier === tier));

  const visible = useMemo(() => {
    const list = rows.map((r, i) => ({ ...r, i })).filter((r) => tierFilter === "all" || r.tier === tierFilter);
    if (sort === "popularity") list.sort((a, b) => b.popularity.level - a.popularity.level || a.i - b.i);
    if (sort === "tier") list.sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier) || a.i - b.i);
    if (sort === "az") list.sort((a, b) => a.tag.localeCompare(b.tag));
    return list;
  }, [rows, sort, tierFilter]);

  async function copy(text: string, what: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFailed(false);
      setCopied(what);
      setTimeout(() => setCopied((c) => (c === what ? null : c)), 1800);
    } catch {
      setCopyFailed(true);
    }
  }

  function downloadCsv() {
    const blob = new Blob([hashtagCsv(rows, selected)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `instagram-hashtags-${niche}.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const NicheIcon = niches.find(([v]) => v === niche)?.[2] ?? Hash;
  const allSelected = selectedTags.length === rows.length && rows.length > 0;

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Controls */}
      <div className="grid gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 sm:grid-cols-2 xl:grid-cols-[1.1fr_1fr_1.25fr_1.1fr]">
        <div className="min-w-0">
          <label htmlFor={`${id}-niche`} className="block text-sm font-semibold">Niche</label>
          <div className="relative mt-2">
            <NicheIcon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--poskoo-violet)]" />
            <select id={`${id}-niche`} value={niche} onChange={(e) => setNiche(e.target.value)} className={`${field} pl-10`}>
              {niches.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-count`} className="flex justify-between text-sm font-semibold">Hashtag count <span className="text-[var(--poskoo-violet)] tabular-nums">{count}</span></label>
          <input id={`${id}-count`} type="range" min={5} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} className="mt-2 min-h-11 w-full accent-[var(--poskoo-violet)]" />
          <div className="flex justify-between text-xs text-[#3d3450]"><span>5</span><span>30</span></div>
        </div>
        <fieldset className="min-w-0">
          <legend className="text-sm font-semibold">Mix</legend>
          <div className="mt-2 grid grid-cols-3 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1">
            {mixes.map((item) => (
              <label key={item.value} className={`flex min-h-10 cursor-pointer items-center justify-center rounded-lg px-1 text-center text-[13px] font-medium leading-tight has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--poskoo-violet)] ${mix === item.value ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"}`}>
                <input type="radio" name={`${id}-mix`} value={item.value} checked={mix === item.value} onChange={() => setMix(item.value)} className="sr-only" />{item.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="min-w-0">
          <label htmlFor={`${id}-extra`} className="block text-sm font-semibold">Your keyword <span className="font-normal text-[#3d3450]">(optional)</span></label>
          <input id={`${id}-extra`} value={extra} onChange={(e) => setExtra(e.target.value)} maxLength={80} placeholder="e.g. Denver fitness" aria-describedby={`${id}-hint`} className={`${field} mt-2`} />
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-[#3d3450]">Adds a combined tag and, for a phrase, its first word.</p>
        </div>
      </div>

      {/* Results */}
      <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)]">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--poskoo-line)] p-4">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-lg font-semibold"><Hash className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden="true" />Your hashtag set</h3>
            <p aria-live="polite" className="mt-1 text-sm text-[#3d3450]">
              <b className="text-[var(--poskoo-ink)] tabular-nums">{selectedTags.length} of {rows.length}</b> selected · mix:{" "}
              {mixCounts.filter((m) => m.tier !== "custom" || m.n > 0).map((m, i) => (
                <span key={m.tier}>{i > 0 && " / "}{m.n} {TIER_LABEL[m.tier].toLowerCase()}</span>
              ))}
            </p>
          </div>
          <div className="w-full sm:w-64" aria-hidden="true">
            <div className="flex h-2.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]">
              {mixCounts.map((m) => m.n > 0 && <span key={m.tier} className={TIER_STYLE[m.tier].bar} style={{ width: `${(m.n / Math.max(1, selectedTags.length)) * 100}%` }} />)}
            </div>
            <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#3d3450]">
              {tiersPresent.map((tier) => <span key={tier} className="inline-flex items-center gap-1"><i className={`h-2 w-2 rounded-full ${TIER_STYLE[tier].bar}`} />{TIER_LABEL[tier]}</span>)}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-b border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
          <button type="button" className={toolBtn} onClick={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.tag)))}>
            {allSelected ? "Select none" : "Select all"}
          </button>
          <button type="button" className={`${toolBtn} border-[var(--poskoo-ink)] bg-[var(--poskoo-ink)] text-white hover:bg-[var(--poskoo-ink)]`} disabled={!selectedTags.length} onClick={() => copy(hashtagLine(selectedTags), "selected")}>
            {copied === "selected" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied === "selected" ? "Copied" : `Copy selected (${selectedTags.length})`}
          </button>
          <button type="button" className={toolBtn} disabled={!selectedTags.length} onClick={() => copy(captionBlock(selectedTags), "block")}>
            {copied === "block" ? <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden="true" /> : <ClipboardList className="h-4 w-4" aria-hidden="true" />}
            {copied === "block" ? "Copied" : "Copy as caption block"}
          </button>
          <button type="button" className={toolBtn} onClick={downloadCsv}>
            <Download className="h-4 w-4" aria-hidden="true" />Download CSV
          </button>
          <label className="ml-auto inline-flex items-center gap-2 text-sm text-[#3d3450]">
            Sort
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="min-h-10 rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm text-[var(--poskoo-ink)]">
              <option value="order">Suggested</option>
              <option value="popularity">Popularity</option>
              <option value="tier">Tier</option>
              <option value="az">A–Z</option>
            </select>
          </label>
          <div className="flex w-full flex-wrap gap-1.5" role="group" aria-label="Filter by tier">
            {(["all", ...tiersPresent] as const).map((tier) => (
              <button key={tier} type="button" aria-pressed={tierFilter === tier} onClick={() => setTierFilter(tier)}
                className={`min-h-9 rounded-full border px-3 text-xs font-semibold ${tierFilter === tier ? "border-[var(--poskoo-ink)] bg-[var(--poskoo-ink)] text-white" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)]"}`}>
                {tier === "all" ? `All (${rows.length})` : `${TIER_LABEL[tier]} (${rows.filter((r) => r.tier === tier).length})`}
              </button>
            ))}
          </div>
        </div>

        <table className="w-full table-fixed border-collapse text-sm">
          <caption className="sr-only">Generated hashtags with estimated popularity, tier and competition</caption>
          <thead>
            <tr className="border-b border-[var(--poskoo-line)] text-left text-xs uppercase tracking-wide text-[#5f5873]">
              <th scope="col" className="w-10 py-2.5 pl-4"><span className="sr-only">Selected</span></th>
              <th scope="col" className="py-2.5 pr-2">Hashtag</th>
              <th scope="col" className="w-[92px] py-2.5 pr-2 sm:w-36">
                <span className="inline-flex items-center gap-1" title={POPULARITY_NOTE}>
                  Popularity<Info className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (estimated range)</span>
                </span>
              </th>
              <th scope="col" className="hidden w-28 py-2.5 pr-2 sm:table-cell">Tier</th>
              <th scope="col" className="hidden w-28 py-2.5 pr-2 md:table-cell">Competition</th>
              <th scope="col" className="w-12 py-2.5 pr-3"><span className="sr-only">Copy</span></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.tag} className={`border-b border-[var(--poskoo-line)] last:border-0 ${selected.has(r.tag) ? "" : "opacity-55"}`}>
                <td className="py-2 pl-4 align-middle">
                  <input type="checkbox" checked={selected.has(r.tag)} onChange={() => toggle(r.tag)} aria-label={`Select #${r.tag}`} className="h-[18px] w-[18px] accent-[var(--poskoo-violet)]" />
                </td>
                <td className="py-2 pr-2 align-middle">
                  <span className="break-all font-medium text-[var(--poskoo-ink)]">#{r.tag}</span>
                  <span className={`ml-1.5 inline-block rounded-full border px-1.5 py-px text-[11px] font-semibold sm:hidden ${TIER_STYLE[r.tier].chip}`}>{TIER_LABEL[r.tier]}</span>
                </td>
                <td className="py-2 pr-2 align-middle">
                  <div className="flex items-center gap-2">
                    <span className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-[var(--poskoo-line)] sm:block" aria-hidden="true">
                      <span className={`block h-full ${TIER_STYLE[r.tier].bar}`} style={{ width: `${r.popularity.level * 25}%` }} />
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-[var(--poskoo-ink)]">{r.popularity.label}</span>
                  </div>
                </td>
                <td className="hidden py-2 pr-2 align-middle sm:table-cell">
                  <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${TIER_STYLE[r.tier].chip}`}>{TIER_LABEL[r.tier]}</span>
                </td>
                <td className={`hidden py-2 pr-2 align-middle text-xs font-semibold md:table-cell ${COMPETITION_STYLE[r.competition]}`}>{r.competition}</td>
                <td className="py-2 pr-3 text-right align-middle">
                  <button type="button" onClick={() => copy(`#${r.tag}`, `row:${r.tag}`)} aria-label={`Copy #${r.tag}`} className="inline-grid h-9 w-9 place-items-center rounded-full hover:bg-[var(--poskoo-band)]">
                    {copied === `row:${r.tag}` ? <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-2 border-t border-[var(--poskoo-line)] p-4 text-xs text-[#3d3450]">
          <p className="flex items-start gap-1.5"><Info className="mt-px h-3.5 w-3.5 flex-none" aria-hidden="true" />{POPULARITY_NOTE} Competition follows the tier: broad tags are crowded, specific tags less so.</p>
          {copyFailed && <p role="status" className="text-sm">Clipboard access is unavailable. Select and copy the tags below.</p>}
          <details className="text-sm" open={copyFailed || undefined}>
            <summary className="min-h-11 cursor-pointer py-3">Select tags as plain text</summary>
            <textarea aria-label="Selected hashtags to copy manually" readOnly value={hashtagLine(selectedTags)} rows={4} onFocus={(e) => e.target.select()} className="w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base" />
          </details>
          <Link href="/tools/instagram-caption-counter" className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--poskoo-violet)] underline underline-offset-2">Check your caption and hashtag count</Link>
        </div>
      </div>
    </div>
  );
}
