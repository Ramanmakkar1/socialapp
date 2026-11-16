"use client";

import { useMemo, useState } from "react";
import { BarChart3, Check, Download, Minus, TrendingDown, TrendingUp } from "lucide-react";

type Period = {
  platform: string;
  start: string;
  end: string;
  followers: string;
  reach: string;
  impressions: string;
  engagement: string;
  clicks: string;
  leads: string;
};

const PLATFORMS = ["Instagram", "Facebook", "Threads", "TikTok", "LinkedIn", "YouTube", "Pinterest", "X"];

const emptyPeriod = (): Period => ({
  platform: "Instagram",
  start: "",
  end: "",
  followers: "",
  reach: "",
  impressions: "",
  engagement: "",
  clicks: "",
  leads: "",
});

const inputClass =
  "mt-1 w-full min-w-0 min-h-11 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base text-[var(--poskoo-ink)] outline-none focus:border-[var(--poskoo-violet)]";

const num = (value: string) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
};
const filled = (value: string) => value.trim() !== "";

/** Engagement rate = engagement ÷ reach × 100. Returns null when reach is zero or blank. */
function engagementRate(period: Period): number | null {
  const reach = num(period.reach);
  if (!filled(period.reach) || reach <= 0) return null;
  return (num(period.engagement) / reach) * 100;
}

/** Percentage change from the previous period. Returns null when the previous value is zero. */
function change(current: number, previous: number): number | null {
  if (previous <= 0) return null;
  return ((current - previous) / previous) * 100;
}

const pct = (value: number | null) => (value === null ? "—" : `${value.toFixed(2)}%`);
const chg = (value: number | null) => (value === null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`);
const count = (value: string) => (filled(value) ? num(value).toLocaleString("en-US") : "—");

const csvCell = (value: string) => `"${value.replace(/"/g, '""')}"`;

function PeriodFields({
  label,
  accent,
  period,
  onChange,
}: {
  label: string;
  accent: string;
  period: Period;
  onChange: (field: keyof Period, value: string) => void;
}) {
  const fields: { key: keyof Period; label: string; placeholder: string }[] = [
    { key: "followers", label: "Followers", placeholder: "0" },
    { key: "reach", label: "Reach", placeholder: "0" },
    { key: "impressions", label: "Impressions", placeholder: "0" },
    { key: "engagement", label: "Engagement", placeholder: "0" },
    { key: "clicks", label: "Clicks", placeholder: "0" },
    { key: "leads", label: "Leads", placeholder: "0" },
  ];

  return (
    <fieldset className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
      <legend className="flex items-center gap-2 rounded-full bg-[var(--poskoo-card)] px-2 text-sm font-semibold text-[var(--poskoo-ink)]">
        <i className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} aria-hidden="true" />{label}
      </legend>
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 text-sm font-medium text-[var(--poskoo-ink)]">
          Platform
          <select className={inputClass} value={period.platform} onChange={(e) => onChange("platform", e.target.value)}>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <div className="col-span-2 grid grid-cols-2 gap-3">
          <label className="min-w-0 text-sm font-medium text-[var(--poskoo-ink)]">
            Start date
            <input type="date" className={inputClass} value={period.start} onChange={(e) => onChange("start", e.target.value)} />
          </label>
          <label className="min-w-0 text-sm font-medium text-[var(--poskoo-ink)]">
            End date
            <input type="date" className={inputClass} value={period.end} onChange={(e) => onChange("end", e.target.value)} />
          </label>
        </div>
        {fields.map((f) => (
          <label key={f.key} className="min-w-0 text-sm font-medium text-[var(--poskoo-ink)]">
            {f.label}
            <input
              type="text"
              inputMode="numeric"
              className={`${inputClass} tabular-nums`}
              value={period[f.key]}
              placeholder={f.placeholder}
              onChange={(e) => onChange(f.key, e.target.value)}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const A_HEX = "#b5a6f0";
const B_HEX = "#6b4eff";

function ChangeChip({ value }: { value: number | null }) {
  if (value === null) return <span className="text-[#5f5873]">—</span>;
  const up = value > 0;
  const flat = value === 0;
  const Icon = flat ? Minus : up ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${flat ? "bg-[var(--poskoo-line)] text-[#3d3450]" : up ? "bg-[#1fa971]/12 text-[#146b43]" : "bg-[#ff6a3d]/12 text-[#a8410f]"}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />{chg(value)}
    </span>
  );
}

export default function AnalyticsReportBuilder() {
  const [a, setA] = useState<Period>(emptyPeriod);
  const [b, setB] = useState<Period>(emptyPeriod);
  const [saved, setSaved] = useState(false);

  const rateA = useMemo(() => engagementRate(a), [a]);
  const rateB = useMemo(() => engagementRate(b), [b]);

  const rows = useMemo(() => {
    const metric = (label: string, key: keyof Period) => {
      const changeN = change(num(b[key]), num(a[key]));
      return {
        label,
        a: count(a[key]),
        b: count(b[key]),
        change: chg(changeN),
        changeN,
        an: filled(a[key]) ? num(a[key]) : null,
        bn: filled(b[key]) ? num(b[key]) : null,
      };
    };
    const rateChange = rateA === null || rateB === null ? null : change(rateB, rateA);
    return [
      metric("Followers", "followers"),
      metric("Reach", "reach"),
      metric("Impressions", "impressions"),
      metric("Engagement", "engagement"),
      {
        label: "Engagement rate",
        a: pct(rateA),
        b: pct(rateB),
        change: chg(rateChange),
        changeN: rateChange,
        an: rateA,
        bn: rateB,
      },
      metric("Clicks", "clicks"),
      metric("Leads", "leads"),
    ];
  }, [a, b, rateA, rateB]);

  const anyFilled = rows.some((r) => r.an !== null || r.bn !== null);
  const highlights = ["Reach", "Engagement rate", "Clicks", "Leads"].map((label) => rows.find((r) => r.label === label)!);
  const compared = rows.filter((r) => r.changeN !== null);
  const improved = compared.filter((r) => (r.changeN ?? 0) > 0).length;

  function update(setter: (fn: (p: Period) => Period) => void, field: keyof Period, value: string) {
    setter((prev) => ({ ...prev, [field]: value }));
  }

  function downloadCsv() {
    const lines = [
      ["Metric", "Period A", "Period B", "Change"],
      ["Platform", a.platform, b.platform, ""],
      ["Start date", a.start, b.start, ""],
      ["End date", a.end, b.end, ""],
      ...rows.map((r) => [r.label, r.a, r.b, r.change]),
    ].map((cells) => cells.map(csvCell).join(","));
    const url = URL.createObjectURL(new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "social-media-analytics-report.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      <div>
        <p className="text-sm font-semibold text-[var(--poskoo-ink)]">Compare two reporting periods</p>
        <p className="mt-1 text-sm text-[#3d3450]">
          Enter the numbers from each platform&apos;s insights for two periods. Everything is calculated in your browser and
          nothing is uploaded or saved.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PeriodFields label="Period A (earlier)" accent={A_HEX} period={a} onChange={(field, value) => update(setA, field, value)} />
        <PeriodFields label="Period B (later)" accent={B_HEX} period={b} onChange={(field, value) => update(setB, field, value)} />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {highlights.map((r) => (
          <div key={r.label} className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">{r.label} · B</p>
            <p className="mt-0.5 truncate text-xl font-bold tabular-nums text-[var(--poskoo-ink)]">{r.b}</p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#5f5873]">
              <ChangeChip value={r.changeN} /><span className="truncate">vs {r.a}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-sm font-semibold"><BarChart3 className="h-4 w-4 text-[var(--poskoo-violet)]" aria-hidden="true" />Period comparison</p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#5f5873]">
              <span className="inline-flex items-center gap-1" aria-hidden="true"><i className="h-2 w-3 rounded-sm" style={{ background: A_HEX }} />A</span>
              <span className="inline-flex items-center gap-1" aria-hidden="true"><i className="h-2 w-3 rounded-sm" style={{ background: B_HEX }} />B</span>
              {compared.length ? `${improved} of ${compared.length} compared metrics went up` : "Fill in both periods to compare them."}
            </p>
          </div>
          <button
            type="button"
            onClick={downloadCsv}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-sm font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px"
          >
            {saved ? <Check className="h-4 w-4 text-[var(--poskoo-lime)]" aria-hidden /> : <Download className="h-4 w-4" aria-hidden />} {saved ? "Downloaded" : "Download CSV"}
          </button>
          <span className="sr-only" aria-live="polite">{saved ? "CSV downloaded" : ""}</span>
        </div>
        {!anyFilled ? (
          <div className="grid place-items-center gap-2 px-4 py-10 text-center text-sm text-[#3d3450]">
            <BarChart3 className="h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden="true" />
            <p>Your comparison appears here as you type numbers above.</p>
          </div>
        ) : null}
        <div className={anyFilled ? "overflow-x-auto" : "sr-only"}>
          <table className="w-full border-collapse text-left text-sm sm:min-w-[520px]">
            <thead className="max-sm:sr-only">
              <tr className="text-[11px] uppercase tracking-wide text-[#5f5873]">
                <th className="px-3 py-2.5 font-semibold">Metric</th>
                <th className="px-3 py-2.5 font-semibold">Period A</th>
                <th className="px-3 py-2.5 font-semibold">Period B</th>
                <th className="px-3 py-2.5 font-semibold">Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const max = Math.max(row.an ?? 0, row.bn ?? 0);
                return (
                  <tr key={row.label} className="border-t border-[var(--poskoo-line)] max-sm:grid max-sm:grid-cols-[1fr_auto] max-sm:gap-x-3 max-sm:px-3 max-sm:py-2.5">
                    <th scope="row" className="px-3 py-2.5 font-semibold text-[var(--poskoo-ink)] max-sm:p-0">
                      {row.label}
                      {max > 0 && (
                        <span className="mt-1.5 block max-w-[220px] space-y-1" aria-hidden="true">
                          <i className="block h-1.5 rounded-full" style={{ width: `${((row.an ?? 0) / max) * 100}%`, background: A_HEX }} />
                          <i className="block h-1.5 rounded-full" style={{ width: `${((row.bn ?? 0) / max) * 100}%`, background: B_HEX }} />
                        </span>
                      )}
                    </th>
                    <td className="px-3 py-2.5 tabular-nums text-[#3d3450] max-sm:col-start-1 max-sm:p-0 max-sm:text-xs"><span className="sm:hidden">A: </span>{row.a}</td>
                    <td className="px-3 py-2.5 tabular-nums font-semibold text-[var(--poskoo-ink)] max-sm:col-start-1 max-sm:p-0 max-sm:text-xs"><span className="font-normal sm:hidden">B: </span>{row.b}</td>
                    <td className="px-3 py-2.5 max-sm:col-start-2 max-sm:row-span-3 max-sm:row-start-1 max-sm:self-center max-sm:p-0">
                      <span className="sr-only">{row.change}</span>
                      <span aria-hidden="true"><ChangeChip value={row.changeN} /></span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="border-t border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3 text-xs text-[#3d3450]">
          Engagement rate is engagement ÷ reach × 100. A dash (—) means the base is zero, so the rate or change cannot be
          calculated yet.
        </p>
      </div>
    </div>
  );
}
