"use client";

import { useId, useMemo, useRef, useState } from "react";
import { AtSign, Briefcase, Check, Copy, Megaphone, PenLine, Sparkles, Tag, Type, UserRound } from "lucide-react";
import {
  BIO_LIMIT,
  BIO_TEMPLATES,
  NICHES,
  bioLength,
  fillBio,
  type NicheId,
} from "@/lib/bioTemplates";
import { FONT_STYLES, convert } from "@/lib/igFonts";

const DEFAULT_CTA = 'DM "START" for my free guide';

const field =
  "min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base outline-none focus:border-[var(--poskoo-violet)] focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)]/30";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const icon = "pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--poskoo-violet)]";

export default function BioTool() {
  const [name, setName] = useState("");
  const [what, setWhat] = useState("");
  const [cta, setCta] = useState(DEFAULT_CTA);
  const [nicheId, setNicheId] = useState<NicheId>("creator");
  const [nameStyle, setNameStyle] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameId = useId();
  const whatId = useId();
  const ctaId = useId();
  const nicheIdSelect = useId();
  const styleId = useId();
  const baseId = useId();

  const displayName = nameStyle ? convert(name, nameStyle) : name;

  const values = useMemo(
    () => ({ name: displayName, what, cta }),
    [displayName, what, cta],
  );

  const templates = BIO_TEMPLATES[nicheId];

  async function copy(id: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      if (timer.current) clearTimeout(timer.current);
      setCopied(id);
      timer.current = setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  // Derived from the filled templates above.
  const bios = templates.map((template) => {
    const filled = fillBio(template, values);
    return { filled, len: bioLength(filled) };
  });
  const current = Math.min(selected, bios.length - 1);
  const currentBio = bios[current];
  const currentId = `${nicheId}-${current}`;
  const fitCount = bios.filter((b) => b.filled && b.len <= BIO_LIMIT).length;
  const shortest = bios.length ? Math.min(...bios.map((b) => b.len)) : 0;
  const nicheLabel = NICHES.find((n) => n.id === nicheId)?.label ?? "";
  const styleLabel = FONT_STYLES.find((s) => s.id === nameStyle)?.label ?? "Plain text";
  const isBlank = !name.trim() && !what.trim();

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Controls */}
      <div className="grid gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="min-w-0">
          <label htmlFor={nameId} className="block text-sm font-semibold">
            Name or brand
          </label>
          <div className="relative mt-2">
            <UserRound aria-hidden="true" className={icon} />
            <input
              id={nameId}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className={`${field} pl-10`}
            />
          </div>
        </div>
        <div className="min-w-0">
          <label htmlFor={whatId} className="block text-sm font-semibold">
            What you do
          </label>
          <div className="relative mt-2">
            <Briefcase aria-hidden="true" className={icon} />
            <input
              id={whatId}
              type="text"
              value={what}
              onChange={(e) => setWhat(e.target.value)}
              placeholder="Content creator, bakery, trainer…"
              className={`${field} pl-10`}
            />
          </div>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <label htmlFor={ctaId} className="flex justify-between gap-2 text-sm font-semibold">
            Call to action
            <span className="rounded-md bg-[var(--poskoo-band)] px-1.5 text-xs font-medium tabular-nums text-[var(--poskoo-violet)]">{bioLength(cta)} chars</span>
          </label>
          <div className="relative mt-2">
            <Megaphone aria-hidden="true" className={icon} />
            <input
              id={ctaId}
              type="text"
              value={cta}
              onChange={(e) => setCta(e.target.value)}
              className={`${field} pl-10`}
            />
          </div>
        </div>
        <div className="min-w-0 sm:col-span-1 xl:col-span-2">
          <label htmlFor={nicheIdSelect} className="block text-sm font-semibold">
            Niche
          </label>
          <div className="relative mt-2">
            <Tag aria-hidden="true" className={icon} />
            <select
              id={nicheIdSelect}
              value={nicheId}
              onChange={(e) => { setNicheId(e.target.value as NicheId); setSelected(0); }}
              className={`${field} pl-10`}
            >
              {NICHES.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="min-w-0 sm:col-span-1 xl:col-span-2">
          <label htmlFor={styleId} className="block text-sm font-semibold">
            Style the name (optional)
          </label>
          <div className="relative mt-2">
            <Type aria-hidden="true" className={icon} />
            <select
              id={styleId}
              value={nameStyle}
              onChange={(e) => setNameStyle(e.target.value)}
              className={`${field} pl-10`}
            >
              <option value="">Plain text</option>
              {FONT_STYLES.map((style) => (
                <option key={style.id} value={style.id}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div role="region" aria-labelledby={`${baseId}-sum`} className="min-w-0">
        <h3 id={`${baseId}-sum`} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-lg font-semibold">
          <Sparkles className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden="true" />
          Your bio options
          <span className="rounded-md bg-[var(--poskoo-band)] px-2 py-0.5 text-xs font-semibold text-[var(--poskoo-violet)]">{nicheLabel}</span>
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className={kpi}>
            <p className={kpiLabel}>Options</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{bios.length}</p>
            <p className="mt-1 text-xs text-[#3d3450]">Templates for this niche.</p>
          </div>
          <div className={kpi}>
            <p className={kpiLabel}>Fit in {BIO_LIMIT}</p>
            <p aria-live="polite" className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{fitCount}<span className="text-base font-medium text-[#5f5873]"> / {bios.length}</span></p>
            <div className="mt-2 flex gap-0.5" aria-hidden="true">
              {bios.map((b, i) => (
                <i key={i} className="h-1.5 flex-1 rounded-full" style={{ background: !b.filled ? "var(--poskoo-line)" : b.len > BIO_LIMIT ? "var(--poskoo-coral)" : "var(--poskoo-green)" }} />
              ))}
            </div>
          </div>
          <div className={kpi}>
            <p className={kpiLabel}>Shortest</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{shortest}<span className="text-base font-medium text-[#5f5873]"> chars</span></p>
            <p className="mt-1 text-xs tabular-nums text-[#3d3450]">{Math.max(0, BIO_LIMIT - shortest)} left of {BIO_LIMIT}.</p>
          </div>
          <div className={kpi}>
            <p className={kpiLabel}>Name style</p>
            <p className="mt-1 truncate text-2xl font-bold text-[var(--poskoo-ink)]">{nameStyle && name ? displayName : styleLabel}</p>
            <p className="mt-1 truncate text-xs text-[#3d3450]">{nameStyle ? styleLabel : "Optional fancy font."}</p>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* Results */}
        <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 sm:p-4">
          {isBlank && (
            <p className="mb-3 flex items-start gap-2 rounded-xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3 text-sm text-[#3d3450]">
              <PenLine className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
              <span>Add your name and what you do above. The bios fill in as you type.</span>
            </p>
          )}
          <ul className="grid gap-3 sm:grid-cols-2" aria-label="Generated bios">
            {bios.map(({ filled, len }, index) => {
              const cardId = `${nicheId}-${index}`;
              const over = len > BIO_LIMIT;
              const isSelected = current === index;
              return (
                <li
                  key={cardId}
                  className={`flex min-w-0 flex-col rounded-2xl border bg-[var(--poskoo-paper)] transition ${isSelected ? "border-[var(--poskoo-violet)] shadow-[0_0_0_1px_var(--poskoo-violet)]" : "border-[var(--poskoo-line)] hover:border-[#bdb4cf]"}`}
                >
                  <button
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Preview bio ${index + 1}`}
                    onClick={() => setSelected(index)}
                    className="block w-full flex-1 rounded-t-2xl p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[var(--poskoo-violet)]"
                  >
                    <span className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">
                      <span className={`grid h-6 w-6 place-items-center rounded-full text-xs tabular-nums ${isSelected ? "bg-[var(--poskoo-ink)] text-white" : "bg-[var(--poskoo-band)] text-[var(--poskoo-violet)]"}`}>{index + 1}</span>
                      {isSelected ? "In preview" : "Option"}
                    </span>
                    <span className="block min-h-[4.5rem] whitespace-pre-line break-words text-[#3d3450]">
                      {filled || (
                        <span className="text-[var(--poskoo-muted)]">Fill in the fields above</span>
                      )}
                    </span>
                  </button>
                  <div className="mx-4 flex items-center justify-between gap-3 border-t border-[var(--poskoo-line)] py-3">
                    <span className="min-w-0 flex-1">
                      <span
                        className={`text-xs font-medium tabular-nums ${over ? "text-[var(--poskoo-coral)]" : "text-[#3d3450]"}`}
                      >
                        {len}/{BIO_LIMIT}
                      </span>
                      <span className="mt-1 block h-1 max-w-[9rem] overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
                        <i className="block h-full rounded-full" style={{ width: `${Math.min(100, (len / BIO_LIMIT) * 100)}%`, background: over ? "var(--poskoo-coral)" : "var(--poskoo-green)" }} />
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => copy(cardId, filled)}
                      disabled={!filled}
                      aria-label={`${copied === cardId ? "Copied" : "Copy"} bio ${index + 1}`}
                      className={`inline-flex min-h-11 flex-none items-center gap-1.5 rounded-xl border px-3.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--poskoo-violet)] disabled:opacity-50 ${copied === cardId ? "border-[var(--poskoo-green)] bg-[var(--poskoo-green)]/10" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] hover:border-[var(--poskoo-ink)]"}`}
                    >
                      {copied === cardId ? (
                        <Check className="h-3.5 w-3.5 text-[var(--poskoo-green)]" aria-hidden="true" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      {copied === cardId ? "Copied" : "Copy"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Primary action + profile preview */}
        <aside aria-labelledby={`${baseId}-prev`} className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <button
            type="button"
            onClick={() => currentBio && copy(currentId, currentBio.filled)}
            disabled={!currentBio?.filled}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)] disabled:opacity-40"
          >
            {copied === currentId ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied === currentId ? "Copied" : `Copy bio ${current + 1}`}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>

          <div>
            <h4 id={`${baseId}-prev`} className="flex items-center justify-between gap-2 text-sm font-semibold">
              Profile preview
              <span className={`text-xs font-medium tabular-nums ${currentBio && currentBio.len > BIO_LIMIT ? "text-[var(--poskoo-coral)]" : "text-[#5f5873]"}`}>{currentBio?.len ?? 0}/{BIO_LIMIT}</span>
            </h4>
            <div className="mt-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 text-sm">
              <div className="flex items-center gap-3">
                <span className="h-16 w-16 flex-none rounded-full bg-[conic-gradient(var(--poskoo-violet),var(--poskoo-pink),var(--poskoo-peach),var(--poskoo-violet))] p-[3px]" aria-hidden="true">
                  <span className="grid h-full w-full place-items-center rounded-full border-[3px] border-white bg-[var(--poskoo-band)] text-lg font-bold text-[var(--poskoo-violet)]">
                    {(name.trim()[0] ?? "").toUpperCase() || <UserRound className="h-6 w-6" />}
                  </span>
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1 truncate text-xs text-[#5f5873]"><AtSign className="h-3 w-3 flex-none" aria-hidden="true" />your_account</p>
                  <p className="truncate text-base font-semibold text-[var(--poskoo-ink)]">{displayName || "Your name"}</p>
                </div>
              </div>
              {currentBio?.filled ? (
                <p className="mt-3 whitespace-pre-line break-words leading-5 text-[var(--poskoo-ink)]">{currentBio.filled}</p>
              ) : (
                <p className="mt-3 rounded-lg border border-dashed border-[var(--poskoo-line)] p-3 text-center text-xs text-[#5f5873]">Fill in the fields to see your bio here.</p>
              )}
              <div className="mt-3 grid grid-cols-2 gap-2" aria-hidden="true">
                <span className="rounded-lg bg-[var(--poskoo-band)] py-1.5 text-center text-xs font-semibold">Follow</span>
                <span className="rounded-lg bg-[var(--poskoo-band)] py-1.5 text-center text-xs font-semibold">Message</span>
              </div>
            </div>
            <p className="mt-2 text-xs text-[#5f5873]">Instagram bios allow up to {BIO_LIMIT} characters. Pick an option to preview it here.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
