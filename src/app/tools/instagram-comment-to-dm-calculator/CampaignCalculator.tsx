"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { Calculator, Check, Copy, Eye, Info, MessageCircle, MousePointerClick, Send } from "lucide-react";

type Field = "views" | "commentRate" | "dmRate" | "clickRate";

type Values = Record<Field, string>;

const initial: Values = {
  views: "10000",
  commentRate: "2",
  dmRate: "90",
  clickRate: "30",
};

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const pctFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const kpi = "grid min-w-0 content-start gap-1 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const ghostBtn =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 text-sm font-medium hover:border-[var(--poskoo-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)]";

function parseNumber(raw: string): number | null {
  const value = raw.trim();
  if (value === "") return 0;
  if (!/^\d*\.?\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function Field({
  id,
  label,
  hint,
  suffix,
  value,
  error,
  onChange,
  slider,
}: {
  id: string;
  label: string;
  hint: string;
  suffix?: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  slider?: boolean;
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const numeric = parseNumber(value);
  const sliderValue = numeric === null ? 0 : Math.min(100, numeric);

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      <div className="relative mt-2">
        <input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          className={`min-h-11 w-full rounded-xl border bg-[var(--poskoo-card)] px-3 py-2.5 text-base tabular-nums outline-none focus:border-[var(--poskoo-violet)] focus:ring-2 focus:ring-[var(--poskoo-violet)]/25 ${
            suffix ? "pr-10" : ""
          } ${error ? "border-[var(--poskoo-red)]" : "border-[var(--poskoo-line)]"}`}
        />
        {suffix ? (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-[var(--poskoo-muted)]">
            {suffix}
          </span>
        ) : null}
      </div>
      {slider ? (
        <input
          type="range"
          min={0}
          max={100}
          step={0.5}
          value={sliderValue}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} slider`}
          className="mt-1 min-h-8 w-full accent-[var(--poskoo-violet)]"
        />
      ) : null}
      <p id={hintId} className="mt-1 text-xs text-[#3d3450]">
        {hint}
      </p>
      {error ? (
        <p id={errorId} className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default function CampaignCalculator() {
  const [values, setValues] = useState<Values>(initial);
  const [copied, setCopied] = useState(false);
  const uid = useId();

  function set(field: Field, v: string) {
    setValues((prev) => ({ ...prev, [field]: v }));
  }

  const parsed = useMemo(() => {
    const views = parseNumber(values.views);
    const commentRate = parseNumber(values.commentRate);
    const dmRate = parseNumber(values.dmRate);
    const clickRate = parseNumber(values.clickRate);
    return { views, commentRate, dmRate, clickRate };
  }, [values]);

  const errors = useMemo(() => {
    const next: Partial<Record<Field, string>> = {};
    const { views, commentRate, dmRate, clickRate } = parsed;

    if (views === null) next.views = "Enter a whole number of 0 or more.";
    else if (!Number.isInteger(views)) next.views = "Views must be a whole number.";

    if (commentRate === null) next.commentRate = "Enter a percentage from 0 to 100.";
    else if (commentRate > 100) next.commentRate = "Comment rate cannot be more than 100%.";

    if (dmRate === null) next.dmRate = "Enter a percentage from 0 to 100.";
    else if (dmRate > 100) next.dmRate = "DM delivery rate cannot be more than 100%.";

    if (clickRate === null) next.clickRate = "Enter a percentage from 0 to 100.";
    else if (clickRate > 100) next.clickRate = "Link-click rate cannot be more than 100%.";

    return next;
  }, [parsed]);

  const valid = Object.keys(errors).length === 0;

  const result = useMemo(() => {
    if (!valid) return null;
    const { views, commentRate, dmRate, clickRate } = parsed;
    if (views === null || commentRate === null || dmRate === null || clickRate === null) return null;

    const comments = views * (commentRate / 100);
    const dms = comments * (dmRate / 100);
    const clicks = dms * (clickRate / 100);
    return { comments, dms, clicks };
  }, [valid, parsed]);

  const formulas = [
    "Comments = views × (comment rate ÷ 100)",
    "DMs = comments × (DM delivery rate ÷ 100)",
    "Clicks = DMs × (link-click rate ÷ 100)",
  ];

  // Funnel rows, derived only from the inputs and the result above.
  const views = parsed.views ?? 0;
  const fmt = (n: number) => numberFormat.format(Math.round(n));
  const stages = result
    ? [
        { key: "views", label: "Views", value: views, icon: Eye, rate: null as string | null },
        { key: "comments", label: "Comments", value: result.comments, icon: MessageCircle, rate: values.commentRate },
        { key: "dms", label: "DMs delivered", value: result.dms, icon: Send, rate: values.dmRate },
        { key: "clicks", label: "Link clicks", value: result.clicks, icon: MousePointerClick, rate: values.clickRate },
      ]
    : [];
  const overall = result && views > 0 ? (result.clicks / views) * 100 : null;
  const viewsPerClick = result && result.clicks >= 1 ? Math.round(views / result.clicks) : null;

  async function copyEstimate() {
    if (!result) return;
    const text = [
      "Comment-to-DM campaign estimate",
      `Views: ${fmt(views)}`,
      `Comments (${values.commentRate || 0}%): ${fmt(result.comments)}`,
      `DMs delivered (${values.dmRate || 0}%): ${fmt(result.dms)}`,
      `Link clicks (${values.clickRate || 0}%): ${fmt(result.clicks)}`,
      "Estimates, not guarantees.",
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field
          id={`${uid}-views`}
          label="Post views"
          hint="Total views on the post, reel or Story where you ask people to comment."
          value={values.views}
          error={errors.views}
          onChange={(v) => set("views", v)}
        />
        <Field
          id={`${uid}-comment-rate`}
          label="Comment rate"
          hint="Share of viewers who leave the comment keyword. 2% means 2 in every 100 views."
          suffix="%"
          value={values.commentRate}
          error={errors.commentRate}
          onChange={(v) => set("commentRate", v)}
          slider
        />
        <Field
          id={`${uid}-dm-rate`}
          label="DM delivery rate"
          hint="Share of comments that become a delivered DM after your rule matches and delivery rules allow it."
          suffix="%"
          value={values.dmRate}
          error={errors.dmRate}
          onChange={(v) => set("dmRate", v)}
          slider
        />
        <Field
          id={`${uid}-click-rate`}
          label="Link-click rate"
          hint="Share of people who open the link inside the DM. Use your own link data if you have it."
          suffix="%"
          value={values.clickRate}
          error={errors.clickRate}
          onChange={(v) => set("clickRate", v)}
          slider
        />
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-4" aria-live="polite">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Calculator className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden="true" />
            Estimated results
          </h3>
          <dl className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className={kpi}>
              <dt className={kpiLabel}><MessageCircle className="h-3.5 w-3.5 max-sm:hidden" aria-hidden="true" />Comments</dt>
              <dd className="text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
                {result ? numberFormat.format(Math.round(result.comments)) : "—"}
              </dd>
            </div>
            <div className={kpi}>
              <dt className={kpiLabel}><Send className="h-3.5 w-3.5 max-sm:hidden" aria-hidden="true" />DMs delivered</dt>
              <dd className="text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
                {result ? numberFormat.format(Math.round(result.dms)) : "—"}
              </dd>
            </div>
            <div className={`${kpi} border-[var(--poskoo-ink)] bg-[var(--poskoo-lime)]/40`}>
              <dt className={kpiLabel}><MousePointerClick className="h-3.5 w-3.5 max-sm:hidden" aria-hidden="true" />Link clicks</dt>
              <dd className="text-2xl font-bold tabular-nums tracking-tight sm:text-3xl">
                {result ? numberFormat.format(Math.round(result.clicks)) : "—"}
              </dd>
            </div>
          </dl>

          <div className="min-w-0 overflow-hidden rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)]">
            {result ? (
              <div className="p-4">
              <p className="text-xs text-[#5f5873]">Each bar shows the share kept from the step before.</p>
              <ol className="mt-3 space-y-3" aria-label="Campaign funnel">
                {stages.map((st) => {
                  // Bar = this step's rate of the stage before it (views = 100%).
                  const pct = st.rate === null ? (views > 0 ? 100 : 0) : Math.min(100, Number(st.rate) || 0);
                  const Icon = st.icon;
                  return (
                    <li key={st.key} className="min-w-0">
                      <div className="flex items-baseline justify-between gap-2 text-sm">
                        <span className="inline-flex min-w-0 items-center gap-1.5 font-medium">
                          <Icon className="h-4 w-4 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
                          {st.label}
                          {st.rate !== null && (
                            <span className="rounded-md bg-[var(--poskoo-band)] px-1.5 text-xs font-semibold tabular-nums text-[var(--poskoo-violet)]">
                              {st.rate || 0}%
                            </span>
                          )}
                        </span>
                        <span className="font-semibold tabular-nums">{fmt(st.value)}</span>
                      </div>
                      <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-[var(--poskoo-band)]" aria-hidden="true">
                        <div
                          className={`h-full rounded-full transition-all ${st.key === "clicks" ? "bg-[var(--poskoo-ink)]" : "bg-[var(--poskoo-violet)]"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ol>
              </div>
            ) : (
              <div className="grid place-items-center gap-2 border border-dashed border-[var(--poskoo-line)] px-4 py-10 text-center text-sm text-[#3d3450]">
                <Calculator className="h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden="true" />
                <p className="font-medium text-red-600">Fix the highlighted inputs to see your estimate.</p>
              </div>
            )}
            <div className="border-t border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5f5873]">Formulas used</p>
              <ul className="mt-2 space-y-1 text-sm text-[#3d3450]">
                {formulas.map((formula) => (
                  <li key={formula} className="sm:font-mono sm:text-[13px]">{formula}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="flex items-start gap-1.5 text-sm text-[#3d3450]">
            <Info className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
            <span>
              These are estimates, not guarantees. Real comments, DM delivery and clicks depend on your audience, offer,
              keyword and Instagram&apos;s messaging rules.
            </span>
          </p>
        </div>

        <aside className="flex min-w-0 flex-col gap-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <div>
            <p className={kpiLabel}>Views to link click</p>
            <p className="!mt-1 text-3xl font-bold tabular-nums text-[var(--poskoo-ink)]">
              {overall === null ? "—" : `${pctFormat.format(overall)}%`}
            </p>
            <p className="!mt-1 text-xs text-[#3d3450]">
              {viewsPerClick ? `About 1 click per ${numberFormat.format(viewsPerClick)} views.` : "Fewer than one click at these inputs."}
            </p>
          </div>
          <button
            type="button"
            onClick={copyEstimate}
            disabled={!result}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)] disabled:opacity-40"
          >
            {copied ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Copy className="h-5 w-5" aria-hidden="true" />}
            {copied ? "Copied" : "Copy estimate"}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Estimate copied to clipboard" : ""}</span>
          <Link href="/instagram-auto-dm#how" className={`${ghostBtn} w-full`}>
            See the auto-DM flow demo
          </Link>
          <Link href="/signup" className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
            Start free and set up your first campaign
          </Link>
        </aside>
      </div>
    </div>
  );
}
