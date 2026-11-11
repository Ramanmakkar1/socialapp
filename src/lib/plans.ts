export type PlanItem = { text: string; soon?: boolean };
export type Plan = { name: string; price: string; per: string; popular?: boolean; items: PlanItem[]; cta: string; ctaHref: string };
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
    price: "$19",
    per: "/ month",
    popular: true,
    items: [
      { text: "5 social accounts" },
      { text: "Unlimited scheduling" },
      { text: "10,000 auto-DMs / month" },
      { text: "AI caption and DM message ideas" },
      { text: "Link in bio page (20 links)" },
      { text: "Email capture in DMs" },
      { text: "Click + lead analytics" },
    ],
    cta: "Start free, upgrade later",
    ctaHref: "/signup",
  },
  {
    name: "Agency",
    price: "$49",
    per: "/ month",
    items: [
      { text: "25 social accounts" },
      { text: "Unlimited scheduling" },
      { text: "50,000 auto-DMs / month" },
      { text: "AI caption and DM message ideas" },
      { text: "Link in bio page (20 links)" },
      { text: "Email capture in DMs" },
      { text: "Click + lead analytics" },
      { text: "Priority support" },
    ],
    cta: "Start free, upgrade later",
    ctaHref: "/signup",
  },
];
export const PLANS_NOTE = "Every account starts on the Free plan. Paid plans open soon. You will never be charged without choosing a plan first.";

const freePlan = PLANS.find((p) => p.name === "Free") ?? PLANS[0];
/** JSON-LD offers for SoftwareApplication — only plans available at launch (Free). */
export const SOFTWARE_APPLICATION_OFFERS = [
  {
    "@type": "Offer" as const,
    name: freePlan.name,
    price: freePlan.price.replace("$", ""),
    priceCurrency: "USD",
  },
];

const paidPrices = PLANS.filter((p) => p !== freePlan).map((p) => Number(p.price.replace("$", "")));
/** One-line price summary for comparison tables: "Free plan; paid plans from $19/mo (coming soon)". */
export const PRICE_SUMMARY = `${freePlan.name} plan; paid plans from $${Math.min(...paidPrices)}/mo (coming soon)`;
