// "Choose Pro" from the public pricing pages: a visitor first signs up, then lands on the billing
// page with that plan picked. The choice rides in a short-lived cookie (pure helpers here).
import { parsePlanChoice, type BillingInterval, type PaidPlan } from "@/lib/billingState";

export const UPGRADE_INTENT_COOKIE = "pk_upgrade";
export const UPGRADE_INTENT_MAX_AGE = 60 * 60; // 1 hour

export function serializeUpgradeIntent(choice: { plan: PaidPlan; interval: BillingInterval }): string {
  return `${choice.plan.toLowerCase()}.${choice.interval}`;
}

export function parseUpgradeIntent(value: string | null | undefined): { plan: PaidPlan; interval: BillingInterval } | null {
  if (!value) return null;
  const [plan, interval] = value.split(".");
  return parsePlanChoice(plan, interval);
}

/** Billing page URL with the plan picked (the page shows a "Continue to checkout" button). */
export function billingChoiceHref(choice: { plan: PaidPlan; interval: BillingInterval }): string {
  return `/app/settings/billing?plan=${choice.plan.toLowerCase()}&interval=${choice.interval}#plans`;
}
