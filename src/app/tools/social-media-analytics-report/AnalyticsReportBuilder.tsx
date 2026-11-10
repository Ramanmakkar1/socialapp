"use client";

import { useMemo, useState } from "react";
import { Download } from "lucide-react";

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
  "mt-1 w-full min-h-11 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm text-[var(--poskoo-ink)] outline-none focus:border-[var(--poskoo-violet)]";

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
  period,
  onChange,
}: {
  label: string;
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
    <fieldset className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
      <legend className="px-1 text-sm font-semibold text-[var(--poskoo-ink)]">{label}</legend>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-[var(--poskoo-ink)]">
          Platform
          <select className={inputClass} value={period.platform} onChange={(e) => onChange("platform", e.target.value)}>
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-medium text-[var(--poskoo-ink)]">
            Start date
            <input type="date" className={inputClass} value={period.start} onChange={(e) => onChange("start", e.target.value)} />
          </label>
          <label className="text-sm font-medium text-[var(--poskoo-ink)]">
            End date
            <input type="date" className={inputClass} value={period.end} onChange={(e) => onChange("end", e.target.value)} />
          </label>
        </div>
        {fields.map((f) => (
          <label key={f.key} className="text-sm font-medium text-[var(--poskoo-ink)]">
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

export default function AnalyticsReportBuilder() {
  const [a, setA] = useState<Period>(emptyPeriod);
  const [b, setB] = useState<Period>(emptyPeriod);

  const rateA = useMemo(() => engagementRate(a), [a]);
  const rateB = useMemo(() => engagementRate(b), [b]);

  const rows = useMemo(() => {
    const metric = (label: string, key: keyof Period) => ({
      label,
      a: count(a[key]),
      b: count(b[key]),
      change: chg(change(num(b[key]), num(a[key]))),
    });
    return [
      metric("Followers", "followers"),
      metric("Reach", "reach"),
      metric("Impressions", "impressions"),
      metric("Engagement", "engagement"),
      {
        label: "Engagement rate",
        a: pct(rateA),
        b: pct(rateB),
        change: chg(rateA === null || rateB === null ? null : change(rateB, rateA)),
      },
      metric("Clicks", "clicks"),
      metric("Leads", "leads"),
    ];
  }, [a, b, rateA, rateB]);

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
  }

  return (
    <div className="text-left">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--poskoo-ink)]">Compare two reporting periods</p>
        <button
          type="button"
          onClick={downloadCsv}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[var(--poskoo-violet)] px-4 text-sm font-semibold text-white hover:opacity-90"
        >
          <Download className="h-4 w-4" aria-hidden /> Download CSV
        </button>
      </div>
      <p className="mt-2 text-sm text-[var(--poskoo-muted)]">
        Enter the numbers from each platform&apos;s insights for two periods. Everything is calculated in your browser and
        nothing is uploaded or saved.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <PeriodFields label="Period A (earlier)" period={a} onChange={(field, value) => update(setA, field, value)} />
        <PeriodFields label="Period B (later)" period={b} onChange={(field, value) => update(setB, field, value)} />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-[var(--poskoo-line)]">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-[var(--poskoo-band)] text-xs uppercase tracking-wide text-[var(--poskoo-muted)]">
              <th className="px-3 py-3 font-semibold">Metric</th>
              <th className="px-3 py-3 font-semibold">Period A</th>
              <th className="px-3 py-3 font-semibold">Period B</th>
              <th className="px-3 py-3 font-semibold">Change</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-[var(--poskoo-line)]">
                <th scope="row" className="px-3 py-2.5 font-medium text-[var(--poskoo-ink)]">
                  {row.label}
                </th>
                <td className="px-3 py-2.5 tabular-nums text-[#3d3450]">{row.a}</td>
                <td className="px-3 py-2.5 tabular-nums text-[#3d3450]">{row.b}</td>
                <td className="px-3 py-2.5 tabular-nums font-medium text-[var(--poskoo-ink)]">{row.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-[var(--poskoo-muted)]">
        Engagement rate is engagement ÷ reach × 100. A dash (—) means the base is zero, so the rate or change cannot be
        calculated yet.
      </p>
    </div>
  );
}
