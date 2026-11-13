"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { Bookmark, Calculator, Check, Copy, Heart, MessageCircle, RotateCcw, Send, Users } from "lucide-react";
import { engagementRate } from "@/lib/engagementRate";
import ui from "@/components/ui/ui.module.css";

type Mode = "followers" | "reach";

type Fields = {
  likes: string;
  comments: string;
  saves: string;
  shares: string;
  base: string;
};

const empty: Fields = { likes: "", comments: "", saves: "", shares: "", base: "" };

const PARTS: { key: Exclude<keyof Fields, "base">; label: string; color: string }[] = [
  { key: "likes", label: "Likes", color: "#6b4eff" },
  { key: "comments", label: "Comments", color: "#ff8a5b" },
  { key: "saves", label: "Saves", color: "#1fa971" },
  { key: "shares", label: "Shares", color: "#c6e04a" },
];
const ICONS = { likes: Heart, comments: MessageCircle, saves: Bookmark, shares: Send };

export type EngagementCalculatorProps = {
  labels?: Partial<Record<"likes" | "comments" | "saves" | "shares", string>>;
  followersLabel?: string;
  reachLabel?: string;
  hideSaves?: boolean;
};

const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const ghostBtn = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const number = new Intl.NumberFormat("en");

function Field({
  id,
  label,
  optional,
  value,
  onChange,
  icon: Icon,
}: {
  id: string;
  label: string;
  optional?: boolean;
  value: string;
  onChange: (v: string) => void;
  icon: typeof Heart;
}) {
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
        {optional ? <span className="font-normal text-[var(--poskoo-muted)]"> (optional)</span> : null}
      </label>
      <div className="relative mt-2">
        <Icon aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--poskoo-violet)]" />
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] py-2.5 pl-9 pr-3 text-base tabular-nums outline-none focus:border-[var(--poskoo-violet)]"
          placeholder="0"
        />
      </div>
    </div>
  );
}

export default function EngagementCalculator({
  labels,
  followersLabel = "Followers",
  reachLabel = "Reach",
  hideSaves = false,
}: EngagementCalculatorProps = {}) {
  const [mode, setMode] = useState<Mode>("followers");
  const [values, setValues] = useState<Fields>(empty);
  const [copied, setCopied] = useState(false);
  const uid = useId();

  const baseLabel = mode === "followers" ? followersLabel : reachLabel;

  const filled =
    values.likes.trim() !== "" && values.comments.trim() !== "" && values.base.trim() !== "";

  const rate = useMemo(() => {
    if (!filled) return null;
    return engagementRate({
      likes: Number(values.likes),
      comments: Number(values.comments),
      saves: hideSaves || values.saves === "" ? undefined : Number(values.saves),
      shares: values.shares === "" ? undefined : Number(values.shares),
      base: Number(values.base),
    });
  }, [filled, values, hideSaves]);

  const baseWord = mode === "followers" ? followersLabel.toLowerCase() : reachLabel.toLowerCase();

  function set(field: keyof Fields, v: string) {
    setValues((prev) => ({ ...prev, [field]: v }));
  }

  // Breakdown uses the same numbers the rate was calculated from; only shown once the rate is valid.
  const parts = PARTS.filter((p) => !(hideSaves && p.key === "saves"))
    .map((p) => ({ ...p, label: labels?.[p.key] ?? p.label }))
    .map((p) => ({ ...p, n: rate === null ? 0 : Number(values[p.key] || 0) }));
  const formula = `(${parts.map((p) => p.label.toLowerCase()).join(" + ")}) ÷ ${baseWord} × 100`;
  const total = parts.reduce((s, p) => s + p.n, 0);
  const top = total > 0 ? parts.reduce((a, b) => (b.n > a.n ? b : a)) : null;
  const meter = rate === null ? 0 : Math.min(100, rate * 10); // 0–10% scale, capped
  const hasInput = Object.values(values).some((v) => v.trim() !== "");
  const invalid = filled && rate === null;

  async function copyResult() {
    if (rate === null) return;
    try {
      await navigator.clipboard.writeText(`Engagement rate: ${rate.toFixed(2)}% (${formula})`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const tabClass = (on: boolean) =>
    `flex min-h-10 flex-1 items-center justify-center rounded-lg px-3 text-sm font-medium transition ${on ? ui.inkFill : "text-[#3d3450] hover:bg-[var(--poskoo-band)] hover:text-[var(--poskoo-ink)]"}`;

  return (
    <div className="min-w-0 space-y-5 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Inputs */}
        <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div role="tablist" aria-label="Engagement rate basis" className="flex gap-1 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1">
            <button type="button" role="tab" aria-selected={mode === "followers"} onClick={() => setMode("followers")} className={tabClass(mode === "followers")}>
              By {followersLabel.toLowerCase()}
            </button>
            <button type="button" role="tab" aria-selected={mode === "reach"} onClick={() => setMode("reach")} className={tabClass(mode === "reach")}>
              By {reachLabel.toLowerCase()}
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
            {parts.map((p) => {
              const Icon = ICONS[p.key];
              return (
                <Field
                  key={p.key}
                  id={`${uid}-${p.key}`}
                  label={p.label}
                  optional={p.key === "saves" || p.key === "shares"}
                  icon={Icon}
                  value={values[p.key]}
                  onChange={(v) => set(p.key, v)}
                />
              );
            })}
          </div>
          <div className="mt-4 border-t border-dashed border-[var(--poskoo-line)] pt-4">
            <Field id={`${uid}-base`} label={baseLabel} icon={Users} value={values.base} onChange={(v) => set("base", v)} />
          </div>
          {invalid ? (
            <p role="status" className="mt-3 text-sm text-[var(--poskoo-coral)]">
              Use whole numbers of 0 or more, and a {baseWord} figure above 0.
            </p>
          ) : null}
        </div>

        {/* Result */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-5 text-center" aria-live="polite">
            <p className="text-sm text-[#3d3450]">Engagement rate</p>
            <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
              {rate === null ? "—" : `${rate.toFixed(2)}%`}
            </p>
            <div className="mx-auto mt-4 h-2 max-w-[240px] overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
              <i className="block h-full rounded-full bg-[linear-gradient(90deg,var(--poskoo-violet),var(--poskoo-lime))] transition-[width]" style={{ width: `${meter}%` }} />
            </div>
            <p className="mt-1 text-[11px] text-[#5f5873]" aria-hidden="true">0% to 10%+ scale</p>
            <p className="mt-3 text-sm text-[var(--poskoo-muted)]">{formula}</p>
          </div>
          <button
            type="button"
            onClick={copyResult}
            disabled={rate === null}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40 disabled:hover:translate-y-0"
          >
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy result"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Result copied to clipboard" : ""}</span>
          <button type="button" className={`${ghostBtn} w-full`} disabled={!hasInput} onClick={() => setValues(empty)}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            Clear numbers
          </button>
        </aside>
      </div>

      {/* Breakdown */}
      {rate === null ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-[var(--poskoo-line)] px-4 py-8 text-center text-sm text-[#3d3450]">
          <Calculator className="h-7 w-7 text-[var(--poskoo-violet)]" aria-hidden="true" />
          <p>Enter likes, comments and {baseWord} to see your rate and interaction breakdown.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className={kpi}>
            <p className={kpiLabel}>Total interactions</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{number.format(total)}</p>
            <p className="mt-1 text-xs text-[#3d3450]">{parts.map((p) => p.label.toLowerCase()).join(" + ")}.</p>
          </div>
          <div className={kpi}>
            <p className={kpiLabel}>{baseLabel}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{number.format(Number(values.base))}</p>
            <p className="mt-1 text-xs text-[#3d3450]">The base you divided by.</p>
          </div>
          <div className={kpi}>
            <p className={kpiLabel}>Biggest driver</p>
            <p className="mt-1 text-2xl font-bold text-[var(--poskoo-ink)]">{top ? top.label : "—"}</p>
            <p className="mt-1 text-xs tabular-nums text-[#3d3450]">{top ? `${Math.round((top.n / total) * 100)}% of interactions` : "No interactions yet."}</p>
          </div>
          <div className={kpi}>
            <p className={kpiLabel}>Mix</p>
            <div className="mt-2 flex h-2.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
              {parts.filter((p) => p.n > 0).map((p) => (
                <i key={p.key} className="h-full" style={{ width: `${(p.n / total) * 100}%`, background: p.color }} />
              ))}
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-x-2 gap-y-0.5 text-xs text-[#3d3450]">
              {parts.map((p) => {
                const Icon = ICONS[p.key];
                return (
                  <li key={p.key} className="flex min-w-0 items-center gap-1">
                    <i className="h-2 w-2 flex-none rounded-full" style={{ background: p.color }} aria-hidden="true" />
                    <Icon className="h-3 w-3 flex-none" aria-hidden="true" />
                    <b className="tabular-nums text-[var(--poskoo-ink)]">{total ? Math.round((p.n / total) * 100) : 0}%</b>
                    <span className="sr-only">{p.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      <p className="text-center text-sm">
        <Link href="/signup" className="font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
          Turn those comments into leads with auto-DMs
        </Link>
      </p>
    </div>
  );
}
