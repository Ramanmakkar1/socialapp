"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowRight, Check, Info, Minus, Sparkles } from "lucide-react";
import { PLAN_FIT_LIMITS, type PlanFitLimit } from "@/lib/plans";

const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

type InputKey = "accounts" | "postsPerMonth" | "dmsPerMonth";

const FIELDS: { key: InputKey; label: string; hint: string; step: number }[] = [
  { key: "accounts", label: "Connected accounts", hint: "Instagram, Facebook or Threads accounts you manage.", step: 1 },
  { key: "postsPerMonth", label: "Scheduled posts / month", hint: "Every post you queue in a typical month.", step: 1 },
  { key: "dmsPerMonth", label: "Auto-DMs / month", hint: "Replies sent by comment-to-DM rules.", step: 1 },
];

const DIMENSION_LABEL: Record<InputKey, string> = {
  accounts: "connected accounts",
  postsPerMonth: "scheduled posts a month",
  dmsPerMonth: "auto-DMs a month",
};

function formatLimit(n: number | null): string {
  if (n === null) return "Unlimited";
  return n.toLocaleString("en-US");
}

function fits(plan: PlanFitLimit, input: Record<InputKey, number>): boolean {
  return FIELDS.every(({ key }) => plan[key] === null || input[key] <= (plan[key] as number));
}

/** Every input where `input` exceeds `plan`, in the order the fields appear. */
function blockers(plan: PlanFitLimit, input: Record<InputKey, number>) {
  return FIELDS.flatMap(({ key }) => {
    const limit = plan[key];
    if (limit === null || input[key] <= limit) return [];
    return [{ key, value: input[key], limit }];
  });
}

export default function PlanFitCalculator({ paidPlans }: { paidPlans: boolean }) {
  const uid = useId();
  const [input, setInput] = useState<Record<InputKey, number>>({ accounts: 3, postsPerMonth: 20, dmsPerMonth: 800 });

  const result = useMemo(() => {
    const index = PLAN_FIT_LIMITS.findIndex((p) => fits(p, input));
    const plan = index >= 0 ? PLAN_FIT_LIMITS[index] : null;
    const previous = index > 0 ? PLAN_FIT_LIMITS[index - 1] : null;
    const triggers = plan && previous ? blockers(previous, input) : [];
    const overAgency = !plan ? blockers(PLAN_FIT_LIMITS[PLAN_FIT_LIMITS.length - 1], input) : [];
    return { plan, index, previous, triggers, overAgency };
  }, [input]);

  const { plan, previous, triggers, overAgency } = result;
  const recommended = plan?.name ?? "Custom";

  function update(key: InputKey, raw: string) {
    const value = Math.max(0, Math.min(1_000_000, Math.floor(Number(raw) || 0)));
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  const cta =
    !plan
      ? { label: "Talk to support", href: "/contact" }
      : plan.name === "Free"
        ? { label: "Start free", href: "/signup" }
        : paidPlans
          ? { label: `See ${plan.name} plan`, href: "/pricing" }
          : { label: "Start free now", href: "/signup" };

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={`${kpi} col-span-2 lg:col-span-1`}>
          <p className={kpiLabel}><Sparkles className="h-3 w-3" aria-hidden="true" />Your plan</p>
          <p className="mt-1 text-2xl font-bold text-[var(--poskoo-ink)]">{plan ? plan.name : "Custom"}</p>
          <p className="mt-1 text-xs text-[#3d3450]">
            {plan ? "Smallest plan that fits all three inputs." : "Above the Agency limits."}
          </p>
        </div>
        {FIELDS.map(({ key, label }) => (
          <div key={key} className={kpi}>
            <p className={kpiLabel}>{label}</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-[var(--poskoo-ink)]">{input[key].toLocaleString("en-US")}</p>
            <p className="mt-1 truncate text-xs text-[#3d3450]">
              {!plan
                ? "Above Agency limits"
                : plan[key] === null
                  ? "No limit on your plan"
                  : `${formatLimit(plan[key])} included`}
            </p>
          </div>
        ))}
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
        {/* Inputs */}
        <div className="min-w-0 space-y-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <p className="text-sm text-[var(--poskoo-muted)]">
            Enter your monthly numbers. The calculator checks them against the Free, Pro and Agency limits and
            shows the first plan that covers all three.
          </p>
          {FIELDS.map(({ key, label, hint, step }) => (
            <div key={key}>
              <label htmlFor={`${uid}-${key}`} className="flex items-center justify-between gap-2 text-sm font-semibold">
                <span>{label}</span>
                <span className="rounded-md bg-[var(--poskoo-band)] px-1.5 tabular-nums text-[var(--poskoo-violet)]" aria-hidden="true">
                  {input[key].toLocaleString("en-US")}
                </span>
              </label>
              <input
                id={`${uid}-${key}`}
                type="number"
                inputMode="numeric"
                min={0}
                step={step}
                value={input[key]}
                onChange={(e) => update(key, e.target.value)}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base tabular-nums text-[var(--poskoo-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--poskoo-violet)]"
              />
              <p className="mt-1 text-xs text-[var(--poskoo-muted)]">{hint}</p>
            </div>
          ))}

          {/* Plan comparison */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-collapse text-sm">
              <caption className="pb-2 text-left text-xs font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">
                Plan limits
              </caption>
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-[var(--poskoo-muted)]">
                  <th scope="col" className="py-2 pr-3 font-semibold">Plan</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Accounts</th>
                  <th scope="col" className="py-2 pr-3 font-semibold">Posts / mo</th>
                  <th scope="col" className="py-2 font-semibold">Auto-DMs / mo</th>
                </tr>
              </thead>
              <tbody>
                {PLAN_FIT_LIMITS.map((p) => {
                  const isPlan = p.name === plan?.name;
                  return (
                    <tr key={p.name} className={isPlan ? "bg-[var(--poskoo-band)]" : undefined}>
                      <th scope="row" className="py-2 pr-3 font-semibold">
                        <span className="flex items-center gap-1.5">
                          {isPlan ? <Check className="h-4 w-4 text-[var(--poskoo-violet)]" aria-hidden="true" /> : <Minus className="h-4 w-4 text-[var(--poskoo-muted)]" aria-hidden="true" />}
                          {p.name}
                        </span>
                      </th>
                      <td className="py-2 pr-3 tabular-nums">{formatLimit(p.accounts)}</td>
                      <td className="py-2 pr-3 tabular-nums">{formatLimit(p.postsPerMonth)}</td>
                      <td className="py-2 tabular-nums">{formatLimit(p.dmsPerMonth)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Result */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24" aria-live="polite">
          <div className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 text-center">
            <p className="text-sm text-[#3d3450]">Recommended plan</p>
            <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--poskoo-ink)]">{recommended}</p>

            {plan && plan.name === "Free" ? (
              <p className="mt-2 text-sm text-[var(--poskoo-muted)]">
                All three inputs fit inside the Free plan. No upgrade needed.
              </p>
            ) : null}

            {triggers.length > 0 ? (
              <div className="mt-4 border-t border-[var(--poskoo-line)] pt-3 text-left">
                <p className="text-sm font-semibold">Why {plan ? plan.name : "Agency"}?</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {triggers.map((t) => (
                    <li key={t.key} className="flex gap-2">
                      <Info className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
                      <span>
                        <b className="tabular-nums">{t.value.toLocaleString("en-US")}</b> {DIMENSION_LABEL[t.key]} is more
                        than {previous?.name}&apos;s <b className="tabular-nums">{formatLimit(t.limit)}</b>.
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {!plan ? (
              <div className="mt-4 border-t border-[var(--poskoo-line)] pt-3 text-left">
                <p className="text-sm font-semibold">Above the Agency limits</p>
                <ul className="mt-2 space-y-2 text-sm">
                  {overAgency.map((t) => (
                    <li key={t.key}>
                      <b className="tabular-nums">{t.value.toLocaleString("en-US")}</b> {DIMENSION_LABEL[t.key]} (Agency allows{" "}
                      <b className="tabular-nums">{formatLimit(t.limit)}</b>)
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-[var(--poskoo-muted)]">
                  Agency is the largest self-serve plan. Contact support if you need more.
                </p>
              </div>
            ) : null}
          </div>

          <Link
            href={cta.href}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px"
          >
            {cta.label}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>

          {!paidPlans && plan && plan.name !== "Free" ? (
            <p className="text-xs text-[var(--poskoo-muted)]">
              {plan.name} is launching soon, so this button starts you on the Free plan. You will never be charged
              without choosing a plan first.
            </p>
          ) : (
            <p className="text-xs text-[var(--poskoo-muted)]">
              Limits reset monthly. You can change plans at any time from Settings.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
