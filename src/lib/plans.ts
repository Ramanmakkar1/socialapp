export type PlanItem = { text: string; soon?: boolean };
export type Plan = { name: string; price: string; per: string; yearly?: string; /** Checkout for the yearly price (paid plans). */ yearlyHref?: string; popular?: boolean; items: PlanItem[]; cta: string; ctaHref: string };
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

const freePlan = PLANS.find((p) => p.name === "Free") ?? PLANS[0];
/** JSON-LD offers for SoftwareApplication: Free plus the paid plans' monthly prices (paid plans are live). */
export const SOFTWARE_APPLICATION_OFFERS = PLANS.map((p) => ({
  "@type": "Offer" as const,
  name: p.name,
  price: p.price.replace("$", ""),
  priceCurrency: "USD",
}));

const paidPrices = PLANS.filter((p) => p !== freePlan).map((p) => Number(p.price.replace("$", "")));
/** One-line price summary for comparison tables: "Free plan; paid plans from $17/mo". */
export const PRICE_SUMMARY = `${freePlan.name} plan; paid plans from $${Math.min(...paidPrices)}/mo`;
