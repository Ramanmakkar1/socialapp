// Pricing cards shared by the home page and /pricing (styles: .plans / .plan in
// src/app/landing.module.css). Paid plans that aren't on sale yet (featureReadiness "billing")
// send people to the Free sign-up with a "Paid plans launching soon" pill, never to a checkout.
// /upgrade links are plain <a>: a route handler that must not be prefetched.
import type { ReactNode } from "react";
import Link from "next/link";
import type { Plan } from "@/lib/plans";
import { PLAN_LIMITS, type PlanName } from "@/lib/planLimits";

export function PlanTag({ plan }: { plan: Plan }) {
  if (plan.comingSoon) return <span className="tag">Coming soon</span>;
  return plan.popular ? <span className="tag">Most popular</span> : null;
}

/** Small "Soon" badge for a plan item (or any feature line) that isn't switched on yet. */
export function SoonBadge() {
  return <span className="soonBadge">Soon</span>;
}

export function PlanCta({ plan }: { plan: Plan }) {
  const cls = plan.popular ? "btn btn-dark" : "btn btn-line";
  const button = plan.ctaHref.startsWith("/upgrade")
    ? <a className={cls} href={plan.ctaHref}>{plan.cta}</a>
    : <Link className={cls} href={plan.ctaHref}>{plan.cta}</Link>;
  return (
    <div className="planCta">
      {button}
      {/* Same note slot on every card so all buttons sit on one baseline. */}
      <p className="planNote">{plan.comingSoon ? <span className="soonPill">Paid plans launching soon</span> : null}</p>
    </div>
  );
}

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden="true">
      <circle cx="9" cy="9" r="9" fill="var(--green)" />
      <path d="M5 9.3l2.6 2.5L13 6.4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The three plan cards: equal height, list grows, CTA block pinned to the bottom. */
export function PlanCards({ plans }: { plans: Plan[] }) {
  return (
    <div className="plans">
      {plans.map((p) => (
        <div key={p.name} className={`plan${p.popular ? " pop" : ""}${p.comingSoon || p.popular ? " tagged" : ""}`}>
          <PlanTag plan={p} />
          <h3>{p.name}</h3>
          <div className="price">{p.price} <small>{p.per}</small></div>
          <p className="priceYearly">
            {p.yearly ? <>or {p.yearlyHref ? <a href={p.yearlyHref}>{p.yearly}</a> : p.yearly}</> : "No credit card needed"}
          </p>
          <ul>
            {p.items.map((item) => (
              <li key={item.text}>
                <Check />
                <span>
                  {item.text}
                  {item.soon ? <> <SoonBadge /></> : null}
                </span>
              </li>
            ))}
          </ul>
          <PlanCta plan={p} />
        </div>
      ))}
    </div>
  );
}

type CompareRow = { label: string; cell: (p: Plan) => ReactNode };
const n = (v: number | null) => (v === null ? "Unlimited" : v.toLocaleString("en-US"));
const yes = (p: Plan, re: RegExp): ReactNode => {
  const item = p.items.find((i) => re.test(i.text));
  if (!item) return <span className="cmpNo" aria-label="Not included">—</span>;
  return item.soon ? <SoonBadge /> : <span className="cmpYes">Included</span>;
};

/** Compact Free / Pro / Agency table from the enforced limits (planLimits.ts) and the plan items. */
export function PlanCompareTable({ plans }: { plans: Plan[] }) {
  const rows: CompareRow[] = [
    { label: "Price", cell: (p) => `${p.price} ${p.per}` },
    { label: "Social accounts", cell: (p) => n(PLAN_LIMITS[p.name as PlanName].socialAccounts) },
    { label: "Scheduled posts a month", cell: (p) => n(PLAN_LIMITS[p.name as PlanName].scheduledPostsPerMonth) },
    { label: "Auto-DMs a month", cell: (p) => n(PLAN_LIMITS[p.name as PlanName].autoDmsPerMonth) },
    { label: "Link-in-bio links", cell: (p) => n(PLAN_LIMITS[p.name as PlanName].bioLinks) },
    { label: "AI captions and DM ideas", cell: (p) => yes(p, /^AI /) },
    { label: "Email capture in DMs", cell: (p) => yes(p, /^Email capture/) },
    { label: "Click + lead analytics", cell: (p) => yes(p, /^Click \+ lead/) },
    { label: "Priority support", cell: (p) => yes(p, /^Priority support/) },
  ];
  return (
    <div className="cmpWrap">
      <table className="cmpTable">
        <caption className="sr-only">Plan comparison: Free, Pro and Agency</caption>
        <thead>
          <tr>
            <th scope="col">Feature</th>
            {plans.map((p) => <th key={p.name} scope="col" className={p.popular ? "cmpPop" : undefined}>{p.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              {plans.map((p) => <td key={p.name} className={p.popular ? "cmpPop" : undefined}>{row.cell(p)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
