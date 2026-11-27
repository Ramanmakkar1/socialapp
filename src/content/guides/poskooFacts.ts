// Poskoo's own plan and network lines for the guide articles, derived from src/lib/plans.ts,
// src/lib/featureReadiness.ts (billing) and src/lib/platform-support.ts (live / awaiting networks)
// so comparison tables never present Pro/Agency as buyable before billing is live, or a network as
// working before its platform approval lands. Evaluated with the runtime env; the guide pages
// revalidate every 10 minutes.
import { PLANS, type Plan } from "@/lib/plans";
import { planReadiness } from "@/lib/featureReadiness";
import { getPlatformCopy, listText, pendingNetworksText } from "@/lib/platform-support";

const plan = (name: string) => PLANS.find((p) => p.name === name) as Plan;
const yearly = (p: Plan) => (p.yearly ?? "").match(/\$\d+/)?.[0] ?? "";
const pro = plan("Pro");
const agency = plan("Agency");

const { paidPlans } = planReadiness();
const copy = getPlatformCopy();
const pendingIds = copy.catalog.filter((e) => !e.live && (e.awaiting || ["tiktok", "pinterest", "x"].includes(e.id))).map((e) => e.id);

export const POSKOO = {
  paidPlans,
  /** " (launching soon)" while Pro/Agency can't be bought yet. */
  soon: paidPlans ? "" : " (launching soon)",
  proPrice: `Pro ${pro.price}/mo (${yearly(pro)}/mo yearly)`,
  agencyPrice: `Agency ${agency.price}/mo (${yearly(agency)}/mo yearly)`,
  proShort: `Pro ${pro.price}`,
  agencyShort: `Agency ${agency.price}`,
  proYearly: yearly(pro),
  /** "Pro and Agency are launching soon; " (empty once billing is live). */
  paidLead: paidPlans ? "" : "Pro and Agency are launching soon. ",
  /** Live social networks, e.g. "Instagram, Facebook Pages, Threads and YouTube". */
  socialNetworks: listText(copy.live.social),
  /** "TikTok and Pinterest are built and waiting on platform approval; X is coming soon." */
  pendingSentence: pendingNetworksText(pendingIds, copy.catalog),
};
