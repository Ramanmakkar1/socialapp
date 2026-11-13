"use client";

import { useId, useMemo, useRef, useState } from "react";
import { AtSign, Check, Copy, Info, Sparkles } from "lucide-react";
import {
  PLATFORM_USERNAME_MAX,
  USERNAME_STYLES,
  generateUsernames,
  type UsernamePlatform,
  type UsernameStyle,
} from "@/lib/usernameIdeas";

const fieldClass =
  "mt-2 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base outline-none focus:border-[var(--poskoo-violet)]";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

export default function UsernameTool({ platform = "instagram" }: { platform?: UsernamePlatform }) {
  const max = PLATFORM_USERNAME_MAX[platform];
  const platformLabel = platform === "youtube" ? "YouTube" : platform === "tiktok" ? "TikTok" : "Instagram";
  const availabilityNote = platform === "youtube"
    ? `We do not check YouTube. Before you settle on a handle, go to YouTube Studio > Customization > Basic info > Handle to see if it is free.`
    : platform === "tiktok"
    ? `We do not check ${platformLabel}. Before you settle on a name, open Profile > Edit profile > Username in the ${platformLabel} app to see if it is free.`
    : `We do not check ${platformLabel}. Before you settle on a name, type it into Edit profile > Username in the ${platformLabel} app to see if it is free.`;
  const [name, setName] = useState("");
  const [niche, setNiche] = useState("");
  const [style, setStyle] = useState<UsernameStyle>("clean");
  const [copied, setCopied] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameId = useId();
  const nicheId = useId();
  const styleId = useId();

  const results = useMemo(() => generateUsernames({ name, niche, style, platform }), [name, niche, style, platform]);
  const current = picked && results.includes(picked) ? picked : results[0] ?? null;
  const lengths = results.map((u) => u.length);
  const shortest = lengths.length ? Math.min(...lengths) : 0;
  const average = lengths.length ? Math.round(lengths.reduce((s, n) => s + n, 0) / lengths.length) : 0;
  const plain = results.filter((u) => !/[._]/.test(u)).length;

  async function copy(value: string, key = value) {
    try {
      await navigator.clipboard.writeText(value);
      if (timer.current) clearTimeout(timer.current);
      setCopied(key);
      timer.current = setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Inputs */}
      <div className="grid gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 sm:grid-cols-3">
        <div className="min-w-0">
          <label htmlFor={nameId} className="text-sm font-semibold">Your name or brand</label>
          <input id={nameId} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Rivera" className={fieldClass} />
        </div>
        <div className="min-w-0">
          <label htmlFor={nicheId} className="text-sm font-semibold">Niche or topic</label>
          <input id={nicheId} type="text" value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="Fitness, baking, travel…" className={fieldClass} />
        </div>
        <div className="min-w-0">
          <label htmlFor={styleId} className="text-sm font-semibold">Style</label>
          <select id={styleId} value={style} onChange={(e) => setStyle(e.target.value as UsernameStyle)} className={fieldClass}>
            {USERNAME_STYLES.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
        </div>
        <p className="flex items-start gap-1.5 text-sm text-[#3d3450] sm:col-span-3">
          <Info className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
          <span>{availabilityNote}</span>
        </p>
      </div>

      {results.length === 0 ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-12 text-center">
          <Sparkles className="h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden="true" />
          <p className="text-[#3d3450]">Enter a name or a niche to see username ideas.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className={kpi}><p className={kpiLabel}>Ideas</p><p className="mt-1 text-2xl font-bold tabular-nums">{results.length}</p></div>
            <div className={kpi}><p className={kpiLabel}>Shortest</p><p className="mt-1 text-2xl font-bold tabular-nums">{shortest}<span className="text-sm font-medium text-[#5f5873]"> chars</span></p></div>
            <div className={kpi}><p className={kpiLabel}>Average length</p><p className="mt-1 text-2xl font-bold tabular-nums">{average}<span className="text-sm font-medium text-[#5f5873]"> / {max}</span></p></div>
            <div className={kpi}><p className={kpiLabel}>No dots or underscores</p><p className="mt-1 text-2xl font-bold tabular-nums">{plain}</p></div>
          </div>

          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start">
            <ul className="grid min-w-0 content-start gap-2 sm:grid-cols-2 lg:-m-1 lg:max-h-[600px] lg:overflow-y-auto lg:p-1" aria-live="polite">
              {results.map((u) => {
                const on = u === current;
                return (
                  <li key={u} className={`flex min-w-0 items-center gap-2 rounded-2xl border bg-[var(--poskoo-card)] py-1.5 pl-1.5 pr-2 transition ${on ? "border-[var(--poskoo-violet)] shadow-[0_0_0_3px_var(--poskoo-band)]" : "border-[var(--poskoo-line)] hover:border-[var(--poskoo-ink)]"}`}>
                    <button type="button" aria-pressed={on} onClick={() => setPicked(u)} className="flex min-h-10 min-w-0 flex-1 items-center gap-2 rounded-xl px-2 text-left">
                      <span className="min-w-0 break-all font-semibold text-[var(--poskoo-ink)]">@{u}</span>
                      <span className="ml-auto flex-none rounded-md bg-[var(--poskoo-paper)] px-1.5 text-[11px] font-semibold tabular-nums text-[#5f5873]">{u.length}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => copy(u)}
                      aria-label={`${copied === u ? "Copied" : "Copy"} ${u}`}
                      className={`inline-grid h-9 w-9 flex-none place-items-center rounded-lg border transition ${copied === u ? "border-[var(--poskoo-green)] bg-[var(--poskoo-green)]/10" : "border-[var(--poskoo-line)] hover:border-[var(--poskoo-ink)]"}`}
                    >
                      {copied === u ? <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </li>
                );
              })}
            </ul>

            <aside aria-label="Profile preview" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
              <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 text-center">
                <span className="mx-auto block h-16 w-16 rounded-full bg-[conic-gradient(var(--poskoo-violet),var(--poskoo-pink),var(--poskoo-peach),var(--poskoo-violet))] p-[3px]" aria-hidden="true">
                  <span className="grid h-full w-full place-items-center rounded-full border-2 border-white bg-[var(--poskoo-band)]"><AtSign className="h-6 w-6 text-[var(--poskoo-violet)]" /></span>
                </span>
                <p className="mt-2 break-all text-lg font-bold">{current}</p>
                <p className="text-xs text-[#5f5873]">{name.trim() || "Your name"}{niche.trim() ? ` · ${niche.trim()}` : ""}</p>
                <p className="mt-2 text-xs tabular-nums text-[#3d3450]">{current?.length ?? 0} of {max} characters</p>
              </div>
              <button type="button" onClick={() => current && copy(current, "picked")}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px">
                {copied === "picked" ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
                {copied === "picked" ? "Copied" : "Copy this username"}
              </button>
              <button type="button" onClick={() => copy(results.join("\n"), "all")}
                className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)]">
                {copied === "all" ? <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                {copied === "all" ? "Copied" : `Copy all ${results.length}`}
              </button>
              <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
              <p className="text-xs text-[#5f5873]">Tap any idea to preview it here.</p>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}
