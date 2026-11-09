"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";

type Field = "views" | "commentRate" | "dmRate" | "clickRate";

type Values = Record<Field, string>;

const initial: Values = {
  views: "10000",
  commentRate: "2",
  dmRate: "90",
  clickRate: "30",
};

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

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
}: {
  id: string;
  label: string;
  hint: string;
  suffix?: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
}) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
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
          className={`w-full rounded-xl border bg-[var(--poskoo-paper)] px-3 py-2.5 text-base tabular-nums outline-none focus:border-[var(--poskoo-violet)] ${
            suffix ? "pr-10" : ""
          } ${error ? "border-red-500" : "border-[var(--poskoo-line)]"}`}
        />
        {suffix ? (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-[var(--poskoo-muted)]">
            {suffix}
          </span>
        ) : null}
      </div>
      <p id={hintId} className="mt-1 text-xs text-[var(--poskoo-muted)]">
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

  return (
    <div className="text-left">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
        />
        <Field
          id={`${uid}-dm-rate`}
          label="DM delivery rate"
          hint="Share of comments that become a delivered DM after your rule matches and delivery rules allow it."
          suffix="%"
          value={values.dmRate}
          error={errors.dmRate}
          onChange={(v) => set("dmRate", v)}
        />
        <Field
          id={`${uid}-click-rate`}
          label="Link-click rate"
          hint="Share of people who open the link inside the DM. Use your own link data if you have it."
          suffix="%"
          value={values.clickRate}
          error={errors.clickRate}
          onChange={(v) => set("clickRate", v)}
        />
      </div>

      <div
        className="mt-8 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-6"
        aria-live="polite"
      >
        <p className="text-center text-sm text-[#3d3450]">Estimated results</p>
        <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-[var(--poskoo-band)] p-4 text-center">
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--poskoo-muted)]">Comments</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
              {result ? numberFormat.format(Math.round(result.comments)) : "—"}
            </dd>
          </div>
          <div className="rounded-xl bg-[var(--poskoo-band)] p-4 text-center">
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--poskoo-muted)]">DMs delivered</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
              {result ? numberFormat.format(Math.round(result.dms)) : "—"}
            </dd>
          </div>
          <div className="rounded-xl bg-[var(--poskoo-band)] p-4 text-center">
            <dt className="text-xs font-medium uppercase tracking-wide text-[var(--poskoo-muted)]">Link clicks</dt>
            <dd className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
              {result ? numberFormat.format(Math.round(result.clicks)) : "—"}
            </dd>
          </div>
        </dl>
        {!valid ? (
          <p className="mt-4 text-center text-sm font-medium text-red-600">Fix the highlighted inputs to see your estimate.</p>
        ) : null}
        <div className="mt-5 border-t border-[var(--poskoo-line)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">Formulas used</p>
          <ul className="mt-2 space-y-1 text-sm text-[#3d3450]">
            {formulas.map((formula) => (
              <li key={formula}>{formula}</li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-sm text-[var(--poskoo-muted)]">
          These are estimates, not guarantees. Real comments, DM delivery and clicks depend on your audience, offer,
          keyword and Instagram&apos;s messaging rules.
        </p>
      </div>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/instagram-auto-dm#how"
          className="rounded-full border border-[var(--poskoo-line)] px-4 py-2 text-sm font-medium hover:border-[var(--poskoo-violet)] hover:text-[var(--poskoo-violet)]"
        >
          See the auto-DM flow demo
        </Link>
        <Link href="/signup" className="font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
          Start free and set up your first campaign
        </Link>
      </div>
    </div>
  );
}
