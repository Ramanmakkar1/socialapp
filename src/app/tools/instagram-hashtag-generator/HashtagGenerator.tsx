"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowDownUp, Camera, Check, ChefHat, ClipboardList, Copy, Cpu, Download, Dumbbell, Gem, Hash, House, Info,
  PawPrint, Plane, SearchX, ShoppingCart, Shirt, Sparkles, Store, Target, Utensils, Wrench, type LucideIcon,
} from "lucide-react";
import type { HashtagMix } from "@/lib/hashtagSets";
import {
  POPULARITY_NOTE, TIER_LABEL, captionBlock, hashtagCsv, hashtagLine, planHashtags, type Competition, type HashtagTier,
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
const TIER_HEX: Record<HashtagTier, string> = { broad: "#6b4eff", mid: "#ff8a5b", niche: "#1fa971", custom: "#c6e04a" };
const TIER_CHIP: Record<HashtagTier, string> = {
  broad: "bg-[#6b4eff]/10 text-[#5236e0]", mid: "bg-[#ff8a5b]/15 text-[#a8410f]",
  niche: "bg-[#1fa971]/12 text-[#146b43]", custom: "bg-[#ddf46b]/60 text-[#1e1631]",
};
// Rated competition: 1 Low, 2 Medium, 3 High. Unrated (your keyword) is left out of averages.
const COMP_SCORE: Record<Competition, number> = { Low: 1, Medium: 2, High: 3, Unrated: 0 };
const COMP_STYLE: Record<Competition, string> = {
  High: "bg-[#ff6a3d]/12 text-[#a8410f]", Medium: "bg-[#f5b700]/18 text-[#7a5c00]",
  Low: "bg-[#1fa971]/12 text-[#146b43]", Unrated: "bg-[var(--poskoo-line)] text-[#5f5873]",
};
// Opportunity is only the tier restated: smaller, less crowded tags are easier to surface in.
const OPPORTUNITY: Record<HashtagTier, [string, number]> = { niche: ["Strong", 3], mid: ["Fair", 2], broad: ["Low", 1], custom: ["Unrated", 0] };
const OPPORTUNITY_NOTE = "Opportunity is an estimate from the tier: specific tags are less crowded, so posts stay visible longer.";
// Lower bound of each estimated popularity band, used only for the "at least" total.
const BAND_FLOOR = [0, 10_000, 100_000, 1_000_000, 100_000_000];
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

const field = "min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base focus:border-[var(--poskoo-violet)]";
const ghostBtn = "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

function Segments({ level, max, color, label }: { level: number; max: number; color: string; label: string }) {
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={label}>
      {Array.from({ length: max }, (_, i) => (
        <i key={i} className="h-2 w-2.5 rounded-[3px]" style={{ background: i < level ? color : "var(--poskoo-line)" }} />
      ))}
    </span>
  );
}

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

  // KPIs, all derived from the estimated bands above.
  const sizeFloor = selectedRows.reduce((sum, r) => sum + BAND_FLOOR[r.popularity.level], 0);
  const unrated = selectedRows.filter((r) => r.competition === "Unrated").length;
  const rated = selectedRows.filter((r) => r.competition !== "Unrated");
  const compAvg = rated.length ? rated.reduce((s, r) => s + COMP_SCORE[r.competition], 0) / rated.length : 0;
  const compLabel = !rated.length ? "—" : compAvg < 1.67 ? "Low" : compAvg < 2.34 ? "Medium" : "High";
  const deg = (n: number) => (n / Math.max(1, selectedTags.length)) * 360;
  const donut = mixCounts.filter((m) => m.n > 0).map((m, i, list) => {
    const from = list.slice(0, i).reduce((s, x) => s + deg(x.n), 0);
    return `${TIER_HEX[m.tier]} ${from}deg ${from + deg(m.n)}deg`;
  }).join(", ");

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
  const line = hashtagLine(selectedTags);

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
          <label htmlFor={`${id}-count`} className="flex justify-between text-sm font-semibold">Hashtag count <span className="rounded-md bg-[var(--poskoo-band)] px-1.5 text-[var(--poskoo-violet)] tabular-nums">{count}</span></label>
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

      {/* Summary */}
      <div role="region" aria-labelledby={`${id}-sum`} className="min-w-0">
        <h3 id={`${id}-sum`} className="flex items-center gap-2 text-lg font-semibold"><Hash className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden="true" />Your hashtag set</h3>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className={kpi}>
            <p className={kpiLabel}>Selected</p>
            <p aria-live="polite" className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{selectedTags.length}<span className="text-base font-medium text-[#5f5873]"> / {rows.length}</span></p>
            <p className="mt-1 text-xs text-[#3d3450]">Instagram allows up to 30 per post.</p>
          </div>
          <div className={kpi}>
            <p className={kpiLabel} title={POPULARITY_NOTE}>Combined tag size<Info className="h-3 w-3" aria-hidden="true" /><span className="sr-only"> (estimate)</span></p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{sizeFloor ? `${compact.format(sizeFloor)}+` : "—"}</p>
            <p className="mt-1 text-xs text-[#3d3450]">Est. posts, sum of each tag&apos;s lowest band{unrated ? `; ${unrated} unrated` : ""}.</p>
          </div>
          <div className={kpi}>
            <p className={kpiLabel}>Avg. competition</p>
            <p className="mt-1 text-2xl font-bold text-[var(--poskoo-ink)]">{compLabel}</p>
            <div className="relative mt-2 h-1.5 rounded-full bg-[linear-gradient(90deg,#1fa971,#f5b700,#ff6a3d)]" aria-hidden="true">
              {rated.length > 0 && <i className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--poskoo-ink)] shadow" style={{ left: `${((compAvg - 1) / 2) * 100}%` }} />}
            </div>
          </div>
          <div className={`${kpi} flex items-center gap-3`}>
            <div className="relative h-14 w-14 flex-none rounded-full" style={{ background: donut ? `conic-gradient(${donut})` : "var(--poskoo-line)" }} aria-hidden="true">
              <span className="absolute inset-[9px] grid place-items-center rounded-full bg-[var(--poskoo-card)] text-xs font-bold tabular-nums">{selectedTags.length}</span>
            </div>
            <div className="min-w-0">
              <p className={kpiLabel}>Mix</p>
              <ul className="mt-1 space-y-0.5 text-xs text-[#3d3450]">
                {mixCounts.filter((m) => m.tier !== "custom" || m.n > 0).map((m) => (
                  <li key={m.tier} className="flex items-center gap-1.5"><i className="h-2 w-2 flex-none rounded-full" style={{ background: TIER_HEX[m.tier] }} /><b className="tabular-nums text-[var(--poskoo-ink)]">{m.n}</b> {TIER_LABEL[m.tier].toLowerCase()}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] 2xl:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        {/* Results list */}
        <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)]">
          <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-b border-[var(--poskoo-line)] px-3 pt-2">
            <div className="-mb-px flex min-w-0 max-w-full overflow-x-auto [scrollbar-width:none]" role="group" aria-label="Filter by tier">
              {(["all", ...tiersPresent] as const).map((tier) => (
                <button key={tier} type="button" aria-pressed={tierFilter === tier} onClick={() => setTierFilter(tier)}
                  className={`inline-flex min-h-11 flex-none items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 text-sm font-semibold ${tierFilter === tier ? "border-[var(--poskoo-violet)] text-[var(--poskoo-ink)]" : "border-transparent text-[#5f5873] hover:text-[var(--poskoo-ink)]"}`}>
                  {tier !== "all" && <i className="h-2 w-2 rounded-full" style={{ background: TIER_HEX[tier] }} aria-hidden="true" />}
                  {tier === "all" ? "All" : TIER_LABEL[tier]}
                  <span className={`rounded-md px-1.5 text-xs tabular-nums ${tierFilter === tier ? "bg-[var(--poskoo-band)] text-[var(--poskoo-violet)]" : "bg-[var(--poskoo-paper)]"}`}>
                    {tier === "all" ? rows.length : rows.filter((r) => r.tier === tier).length}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pb-2">
              <button type="button" className="min-h-10 rounded-lg px-2 text-sm font-medium text-[var(--poskoo-violet)] hover:bg-[var(--poskoo-band)]" onClick={() => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.tag)))}>
                {allSelected ? "Select none" : "Select all"}
              </button>
              <label className="inline-flex items-center gap-1.5 text-sm text-[#3d3450]">
                <ArrowDownUp className="h-4 w-4" aria-hidden="true" /><span className="sr-only sm:not-sr-only">Sort</span>
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort" className="min-h-10 rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-2 text-sm text-[var(--poskoo-ink)]">
                  <option value="order">Suggested</option>
                  <option value="popularity">Popularity</option>
                  <option value="tier">Tier</option>
                  <option value="az">A–Z</option>
                </select>
              </label>
            </div>
          </div>

          {visible.length === 0 ? (
            <div className="grid place-items-center gap-2 px-4 py-12 text-center text-sm text-[#3d3450]">
              <SearchX className="h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden="true" />
              <p>No hashtags in this view.</p>
              <button type="button" className={ghostBtn} onClick={() => setTierFilter("all")}>Show all</button>
            </div>
          ) : (
            <div className="sm:max-h-[620px] sm:overflow-y-auto">
              <table className="w-full border-separate sm:table-fixed border-spacing-0 text-sm">
                <caption className="sr-only">Generated hashtags with estimated popularity, tier, competition and opportunity</caption>
                <thead className="max-sm:sr-only">
                  <tr className="text-left text-[11px] uppercase tracking-wide text-[#5f5873] [&>th]:sticky [&>th]:top-0 [&>th]:z-10 [&>th]:border-b [&>th]:border-[var(--poskoo-line)] [&>th]:bg-[var(--poskoo-paper)] [&>th]:py-2.5 [&>th]:font-semibold">
                    <th scope="col" className="w-11 pl-4"><span className="sr-only">Selected</span></th>
                    <th scope="col" className="pr-2">Hashtag</th>
                    <th scope="col" className="w-[150px] pr-2 2xl:w-[190px]">
                      <span className="inline-flex items-center gap-1" title={POPULARITY_NOTE}>Popularity<Info className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (estimated range)</span></span>
                    </th>
                    <th scope="col" className="w-[118px] pr-2 2xl:w-[160px]">Competition</th>
                    <th scope="col" className="hidden w-[118px] pr-2 xl:table-cell 2xl:w-[160px]">
                      <span className="inline-flex items-center gap-1" title={OPPORTUNITY_NOTE}>Opportunity<Info className="h-3.5 w-3.5" aria-hidden="true" /><span className="sr-only"> (estimate)</span></span>
                    </th>
                    <th scope="col" className="w-12 pr-3"><span className="sr-only">Copy</span></th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r) => {
                    const on = selected.has(r.tag);
                    const [opp, oppLevel] = OPPORTUNITY[r.tier];
                    const cell = "border-b border-[var(--poskoo-line)] py-2 align-middle";
                    return (
                      <tr key={r.tag} className={`group transition-colors hover:bg-[var(--poskoo-band)]/60 ${on ? "" : "[&>td:not(:first-child)]:opacity-50"}`}>
                        <td className={`${cell} w-11 pl-4`} style={{ boxShadow: `inset 3px 0 0 ${TIER_HEX[r.tier]}` }}>
                          <input id={`${id}-t-${r.tag}`} type="checkbox" checked={on} onChange={() => toggle(r.tag)} aria-label={`Select #${r.tag}`} className="h-[18px] w-[18px] cursor-pointer accent-[var(--poskoo-violet)]" />
                        </td>
                        <td className={`${cell} pr-2`}>
                          <label htmlFor={`${id}-t-${r.tag}`} className="block cursor-pointer">
                            <span className="break-all font-semibold text-[var(--poskoo-ink)]">#{r.tag}</span>
                            <span className={`ml-1.5 inline-block rounded-md px-1.5 py-px text-[11px] font-semibold ${TIER_CHIP[r.tier]}`}>{TIER_LABEL[r.tier]}</span>
                          </label>
                          {/* Phone: the hidden columns, as one meta line */}
                          <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#3d3450] sm:hidden">
                            <span className="inline-flex items-center gap-1.5"><Segments level={r.popularity.level} max={4} color={TIER_HEX[r.tier]} label={`Popularity ${r.popularity.level} of 4`} /><b className="whitespace-nowrap tabular-nums text-[var(--poskoo-ink)]">{r.popularity.label}</b></span>
                            <span className={`rounded-md px-1.5 py-px font-semibold ${COMP_STYLE[r.competition]}`}>{r.competition} comp.</span>
                            <span>Opportunity: <b className="text-[var(--poskoo-ink)]">{opp}</b></span>
                          </span>
                        </td>
                        <td className={`${cell} pr-2 max-sm:hidden`}>
                          <span className="flex items-center gap-2">
                            <Segments level={r.popularity.level} max={4} color={TIER_HEX[r.tier]} label={`Popularity ${r.popularity.level} of 4`} />
                            <span className="text-xs font-semibold tabular-nums text-[var(--poskoo-ink)]">{r.popularity.label}</span>
                          </span>
                        </td>
                        <td className={`${cell} pr-2 max-sm:hidden`}>
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${COMP_STYLE[r.competition]}`}>
                            <span className="inline-flex items-end gap-px" aria-hidden="true">
                              {[1, 2, 3].map((n) => <i key={n} className="w-[3px] rounded-sm bg-current" style={{ height: 3 + n * 3, opacity: n <= COMP_SCORE[r.competition] ? 1 : 0.25 }} />)}
                            </span>
                            {r.competition}
                          </span>
                        </td>
                        <td className={`${cell} hidden pr-2 xl:table-cell`}>
                          <span className="flex items-center gap-2 text-xs font-semibold text-[var(--poskoo-ink)]">
                            <Segments level={oppLevel} max={3} color="#9bb61f" label={`Opportunity ${oppLevel} of 3`} />{opp}
                          </span>
                        </td>
                        <td className={`${cell} w-12 pr-3 text-right`}>
                          <button type="button" onClick={() => copy(`#${r.tag}`, `row:${r.tag}`)} aria-label={`Copy #${r.tag}`}
                            className={`inline-grid h-9 w-9 place-items-center rounded-lg border transition ${copied === `row:${r.tag}` ? "border-[var(--poskoo-green)] bg-[var(--poskoo-green)]/10" : "border-transparent hover:border-[var(--poskoo-line)] hover:bg-[var(--poskoo-card)] sm:opacity-60 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"}`}>
                            {copied === `row:${r.tag}` ? <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <p className="flex items-start gap-1.5 border-t border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3 text-xs text-[#3d3450]">
            <Info className="mt-px h-3.5 w-3.5 flex-none" aria-hidden="true" />
            <span>{POPULARITY_NOTE} Competition follows the tier: broad tags are crowded, specific tags less so. {OPPORTUNITY_NOTE}</span>
          </p>
        </div>

        {/* Actions + live caption preview */}
        <aside aria-labelledby={`${id}-prev`} className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <button type="button" disabled={!selectedTags.length} onClick={() => copy(line, "selected")}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40">
            {copied === "selected" ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied === "selected" ? "Copied" : `Copy selected (${selectedTags.length})`}
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className={ghostBtn} disabled={!selectedTags.length} onClick={() => copy(captionBlock(selectedTags), "block")}>
              {copied === "block" ? <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden="true" /> : <ClipboardList className="h-4 w-4" aria-hidden="true" />}
              <span className="whitespace-nowrap">{copied === "block" ? "Copied" : "Caption block"}</span>
            </button>
            <button type="button" className={ghostBtn} onClick={downloadCsv}>
              <Download className="h-4 w-4" aria-hidden="true" />CSV
            </button>
          </div>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>

          <div>
            <h4 id={`${id}-prev`} className="flex items-center justify-between text-sm font-semibold">
              Caption preview
              <span className={`text-xs font-medium tabular-nums ${selectedTags.length > 30 ? "text-[var(--poskoo-red)]" : "text-[#5f5873]"}`}>{selectedTags.length}/30 tags · {line.length} chars</span>
            </h4>
            <div className="mt-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-sm">
              <div className="flex items-center gap-2 border-b border-[var(--poskoo-line)] pb-2">
                <span className="h-7 w-7 rounded-full bg-[conic-gradient(var(--poskoo-violet),var(--poskoo-pink),var(--poskoo-peach),var(--poskoo-violet))] p-[2px]" aria-hidden="true"><span className="block h-full w-full rounded-full border-2 border-white bg-[var(--poskoo-band)]" /></span>
                <span className="text-xs font-semibold">your_account</span>
              </div>
              <p className="mt-2 text-[#5f5873]">Your caption goes here…</p>
              <p className="text-[#b5aec4]" aria-hidden="true">.<br />.<br />.</p>
              {selectedTags.length ? (
                <p className="mt-1 max-h-48 overflow-y-auto break-words leading-relaxed text-[#3b5bdb]">{line}</p>
              ) : (
                <p className="mt-1 rounded-lg border border-dashed border-[var(--poskoo-line)] p-3 text-center text-xs text-[#5f5873]">No hashtags selected. Tick tags in the list to build your set.</p>
              )}
            </div>
          </div>

          {copyFailed && <p role="status" className="text-sm">Clipboard access is unavailable. Select and copy the tags below.</p>}
          <details className="!rounded-none !border-0 !bg-transparent !p-0 text-sm" open={copyFailed || undefined}>
            <summary className="min-h-11 cursor-pointer items-center py-3 !text-sm !font-medium">Select tags as plain text</summary>
            <textarea aria-label="Selected hashtags to copy manually" readOnly value={line} rows={4} onFocus={(e) => e.target.select()} className="w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-base" />
          </details>
          <Link href="/tools/instagram-caption-counter" className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--poskoo-violet)] underline underline-offset-2">Check your caption and hashtag count</Link>
        </aside>
      </div>
    </div>
  );
}
