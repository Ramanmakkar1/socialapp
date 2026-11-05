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
      { text: "Link in bio page", soon: true },
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
      { text: "AI captions + AI DM replies" },
      { text: "Email & phone capture" },
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
      { text: "50,000 auto-DMs / month" },
      { text: "Client workspaces", soon: true },
      { text: "Approve-before-post", soon: true },
      { text: "Team seats", soon: true },
      { text: "Priority support" },
    ],
    cta: "Start free, upgrade later",
    ctaHref: "/signup",
  },
];
export const PLANS_NOTE = "Every account starts on the Free plan. Paid plans open soon. You will never be charged without choosing a plan first.";
