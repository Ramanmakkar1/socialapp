export type PlanItem = { text: string; soon?: boolean };
export type Plan = { name: string; /** Paid plan not on sale yet (featureReadiness "billing"): CTA goes to sign-up instead. */ comingSoon?: boolean; price: string; per: string; yearly?: string; /** Checkout for the yearly price (paid plans). */ yearlyHref?: string; popular?: boolean; items: PlanItem[]; cta: string; ctaHref: string };
export const PLANS: Plan[] = [
  {
    name: "Free",
    price: "$0",
    per: "forever",
    items: [
      { text: "2 social accounts" },
      { text: "10 scheduled posts / month" },
      { text: "500 auto-DMs / month" },
      { text: "Link in bio page (5 links)" },
    ],
    cta: "Start free",
    ctaHref: "/signup",
  },
  {
    name: "Pro",
    price: "$17",
    per: "/ month",
    yearly: "$14 / month billed yearly",
    yearlyHref: "/upgrade?plan=pro&interval=year",
    popular: true,
    items: [
      { text: "5 social accounts" },
      { text: "Unlimited scheduling" },
      { text: "2,500 auto-DMs / month" },
      { text: "AI caption and DM message ideas" },
      { text: "Link in bio page (20 links)" },
      { text: "Email capture in DMs" },
      { text: "Click + lead analytics" },
    ],
    cta: "Choose Pro",
    ctaHref: "/upgrade?plan=pro&interval=month",
  },
  {
    name: "Agency",
    price: "$35",
    per: "/ month",
    yearly: "$29 / month billed yearly",
    yearlyHref: "/upgrade?plan=agency&interval=year",
    items: [
      { text: "25 social accounts" },
      { text: "Unlimited scheduling" },
      { text: "10,000 auto-DMs / month" },
      { text: "AI caption and DM message ideas" },
      { text: "Link in bio page (20 links)" },
      { text: "Email capture in DMs" },
      { text: "Click + lead analytics" },
      { text: "Priority support" },
    ],
    cta: "Choose Agency",
    ctaHref: "/upgrade?plan=agency&interval=month",
  },
];
export const PLANS_NOTE = "Every account starts on the Free plan. Upgrade to Pro or Agency any time and cancel any time from Settings. You will never be charged without choosing a plan first.";

/**
 * Numeric plan limits for the plan-fit calculator, read from the plan item text (the public copy
 * is the single source of truth). `null` means unlimited: "Unlimited scheduling" must not turn into
 * a limit of 0, or the calculator would say Pro/Agency allow no posts at all.
 */
export type PlanFitLimit = { name: string; accounts: number; postsPerMonth: number | null; dmsPerMonth: number | null };

function limitFromText(text: string | undefined): number | null {
  if (!text) return 0;
  if (/unlimited/i.test(text)) return null;
  const match = text.match(/[\d,]+/);
  return match ? Number(match[0].replace(/,/g, "")) : 0;
}

const planItem = (plan: Plan, pattern: RegExp) => plan.items.find((i) => pattern.test(i.text))?.text;

export const PLAN_FIT_LIMITS: PlanFitLimit[] = PLANS.map((p) => ({
  name: p.name,
  accounts: limitFromText(planItem(p, /social accounts?/i)) ?? 0,
  postsPerMonth: limitFromText(planItem(p, /schedul|scheduled posts?/i)),
  dmsPerMonth: limitFromText(planItem(p, /auto-dms?/i)),
}));

/** Which plan features are switched on (from src/lib/featureReadiness.ts, decided at runtime). */
export type PlanReadiness = { paidPlans: boolean; ai: boolean };

/**
 * PLANS as the public pages should show them right now: paid plans that can't be bought yet keep
 * their price but say "Coming soon" and send people to the Free sign-up; AI items get "coming soon"
 * while AI isn't switched on.
 */
export function plansFor(r: PlanReadiness): Plan[] {
  return PLANS.map((p) => {
    const items = p.items.map((i) => (!r.ai && /^AI /.test(i.text) ? { ...i, soon: true } : i));
    if (p.name === "Free" || r.paidPlans) return { ...p, items };
    return { ...p, items, comingSoon: true, cta: "Start free now", ctaHref: "/signup", yearlyHref: undefined };
  });
}

export const PLANS_NOTE_SOON = "Every account starts on the Free plan, which works today. Pro and Agency are launching soon; you will never be charged without choosing a plan first.";

export function plansNote(r: PlanReadiness): string {
  return r.paidPlans ? PLANS_NOTE : PLANS_NOTE_SOON;
}

/** FAQ answer about cancelling, honest while paid plans aren't on sale yet. */
export function cancelAnswer(r: PlanReadiness): string {
  return r.paidPlans
    ? "Yes. Pro and Agency are month to month (or yearly) with no contract. Cancel from Settings > Plan & billing and you keep your plan until the end of the period you paid for."
    : "Pro and Agency are launching soon. They will be month to month (or yearly) with no contract, cancelled any time from Settings > Plan & billing. The Free plan has nothing to cancel.";
}

const freePlan = PLANS.find((p) => p.name === "Free") ?? PLANS[0];

/** JSON-LD offers: only plans that can actually be bought today (Free alone until paid plans launch). */
export function softwareOffers(r: PlanReadiness) {
  return SOFTWARE_APPLICATION_OFFERS.filter((o) => r.paidPlans || o.name === freePlan.name);
}

/** JSON-LD offers for SoftwareApplication: Free plus the paid plans' monthly prices (when paid plans are live). */
export const SOFTWARE_APPLICATION_OFFERS = PLANS.map((p) => ({
  "@type": "Offer" as const,
  name: p.name,
  price: p.price.replace("$", ""),
  priceCurrency: "USD",
}));

const paidPrices = PLANS.filter((p) => p !== freePlan).map((p) => Number(p.price.replace("$", "")));
/** One-line price summary for comparison tables: "Free plan; paid plans from $17/mo". */
export const PRICE_SUMMARY = `${freePlan.name} plan; paid plans from $${Math.min(...paidPrices)}/mo`;
