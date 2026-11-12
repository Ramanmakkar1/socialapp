// The button under a pricing card (home + /pricing). Paid plans that aren't on sale yet
// (featureReadiness "billing") send people to the Free sign-up with a "launching soon" line,
// never to a checkout. /upgrade links are plain <a>: a route handler that must not be prefetched.
import Link from "next/link";
import type { Plan } from "@/lib/plans";

export function PlanTag({ plan }: { plan: Plan }) {
  if (plan.comingSoon) return <span className="tag">Coming soon</span>;
  return plan.popular ? <span className="tag">Most popular</span> : null;
}

export function PlanCta({ plan }: { plan: Plan }) {
  const cls = plan.popular ? "btn btn-dark" : "btn btn-line";
  if (plan.comingSoon) {
    return (
      <>
        <Link className={cls} href={plan.ctaHref}>{plan.cta}</Link>
        <p className="small" style={{ margin: "-6px 0 0", textAlign: "center", color: "var(--muted)" }}>Paid plans launching soon</p>
      </>
    );
  }
  return plan.ctaHref.startsWith("/upgrade") ? <a className={cls} href={plan.ctaHref}>{plan.cta}</a> : <Link className={cls} href={plan.ctaHref}>{plan.cta}</Link>;
}
