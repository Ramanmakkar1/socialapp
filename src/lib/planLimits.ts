// Plan limits as numbers, enforced on the server. The numbers mirror the plan cards in
// src/lib/plans.ts (planLimits.test.ts fails if they drift apart). Prices are not here.
import { query } from "@/lib/db";

export type PlanName = "Free" | "Pro" | "Agency";
export type PlanLimits = {
  socialAccounts: number;
  /** null = unlimited */
  scheduledPostsPerMonth: number | null;
  autoDmsPerMonth: number;
};

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  Free: { socialAccounts: 2, scheduledPostsPerMonth: 10, autoDmsPerMonth: 500 },
  Pro: { socialAccounts: 5, scheduledPostsPerMonth: null, autoDmsPerMonth: 10_000 },
  Agency: { socialAccounts: 25, scheduledPostsPerMonth: null, autoDmsPerMonth: 50_000 },
};

/** Every account is on the Free plan until paid plans open (see PLANS_NOTE). */
export function planForUser(): PlanName {
  return "Free";
}

/** UTC calendar month [start, end) containing `at`. */
export function utcMonthRange(at: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), 1));
  const end = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1));
  return { start, end };
}

export function scheduledLimitMessage(limit: number, plan: PlanName): string {
  return `The ${plan} plan includes ${limit} scheduled posts per month, and that month is full. Save this one as a draft, pick another month, or delete a scheduled post.`;
}

export function autoDmLimitMessage(limit: number, plan: PlanName): string {
  return `Monthly auto-DM limit reached (${limit.toLocaleString("en-US")} on the ${plan} plan). Auto-DMs start again on the 1st of next month (UTC).`;
}

/**
 * Server-side check for the monthly scheduled-post limit. Counts posts scheduled,
 * publishing or published in the UTC month of `at`, ignoring `excludePostId` (the post being saved / moved).
 */
export async function scheduledPostLimitError(userId: string, at: Date, excludePostId?: string | null): Promise<string | null> {
  const plan = planForUser();
  const limit = PLAN_LIMITS[plan].scheduledPostsPerMonth;
  if (limit === null) return null;
  const { start, end } = utcMonthRange(at);
  const rows = await query<{ n: number }>(
    `select count(*)::int as n from socialapp.scheduled_posts
     where user_id=$1 and status in ('scheduled','publishing','published')
       and scheduled_at >= $2 and scheduled_at < $3 and ($4::uuid is null or id <> $4::uuid)`,
    [userId, start.toISOString(), end.toISOString(), excludePostId ?? null],
  );
  return (rows[0]?.n ?? 0) >= limit ? scheduledLimitMessage(limit, plan) : null;
}
