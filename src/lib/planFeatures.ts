// Server-side gating of the paid plan features sold on the pricing cards (src/lib/plans.ts):
// AI ideas, email capture in DMs and click + lead analytics are Pro / Agency features.
//
// ROLLOUT (read before changing): gating is only ENFORCED while paid plans are on sale, i.e. when
// featureReadiness("billing") is ready (live Stripe key, billing webhook secret and
// STRIPE_BILLING_LIVE_PRICES). Before that every user is effectively on Free with no way to upgrade,
// so blocking would take features away from everyone. Override with PLAN_FEATURE_GATING:
//   PLAN_FEATURE_GATING=off  never enforce (kill switch, even with billing live)
//   PLAN_FEATURE_GATING=on   always enforce (staging / testing before billing is live)
// The user's plan comes from planForUser (billing_subscriptions + the admin allow-list = Agency).
import { featureReadiness, type Env } from "@/lib/featureReadiness";
import { planForUser, upgradeHint, type PlanName } from "@/lib/planLimits";

export type PlanFeature = "ai" | "email_capture" | "click_lead_analytics";

/** Plans that include each feature (mirrors the plan card items; planFeatures.test.ts checks the copy). */
export const PLAN_FEATURES: Record<PlanFeature, readonly PlanName[]> = {
  ai: ["Pro", "Agency"],
  email_capture: ["Pro", "Agency"],
  click_lead_analytics: ["Pro", "Agency"],
};

const FEATURE_LABEL: Record<PlanFeature, string> = {
  ai: "AI captions, campaign drafts and DM message ideas are",
  email_capture: "Email capture in DMs is",
  click_lead_analytics: "Click and lead analytics are",
};

/** Whether plan features are enforced right now (see ROLLOUT above). */
export function planFeatureGatingEnabled(env: Env = process.env): boolean {
  const flag = (env.PLAN_FEATURE_GATING ?? "").trim().toLowerCase();
  if (flag === "off") return false;
  if (flag === "on") return true;
  return featureReadiness("billing", env).ready;
}

export function planHasFeature(plan: PlanName, feature: PlanFeature): boolean {
  return PLAN_FEATURES[feature].includes(plan);
}

export function planFeatureMessage(feature: PlanFeature, plan: PlanName): string {
  return `${FEATURE_LABEL[feature]} part of the Pro and Agency plans.${upgradeHint(plan)}`;
}

export type PlanFeatureResult = { ok: true } | { ok: false; plan: PlanName; error: string };

/**
 * The single server-side check for a paid feature. Always ok while gating is off (no DB read);
 * otherwise ok only when the user's plan includes the feature.
 */
export async function requirePlanFeature(userId: string, feature: PlanFeature, env: Env = process.env): Promise<PlanFeatureResult> {
  if (!planFeatureGatingEnabled(env)) return { ok: true };
  const plan = await planForUser(userId);
  return planHasFeature(plan, feature) ? { ok: true } : { ok: false, plan, error: planFeatureMessage(feature, plan) };
}

/** Boolean form for loaders that hide data instead of returning an error. */
export async function planFeatureAllowed(userId: string, feature: PlanFeature, env: Env = process.env): Promise<boolean> {
  return (await requirePlanFeature(userId, feature, env)).ok;
}
