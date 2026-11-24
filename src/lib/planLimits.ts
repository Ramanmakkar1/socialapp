// Plan limits as numbers, enforced on the server. The numbers mirror the plan cards in
// src/lib/plans.ts (planLimits.test.ts fails if they drift apart). Prices are not here.
import { isDbConfigured, query } from "@/lib/db";
import { BIO_LINK_LIMITS } from "@/lib/bioLinkLimits";
import { referralBonusDms } from "@/lib/referrals";
import { planFromBilling, type BillingRow } from "@/lib/billingState";
import { isAdminEmail } from "@/lib/admin";
import type { NetworkId } from "@/lib/networks/common";

export type PlanName = "Free" | "Pro" | "Agency";
export type PlanLimits = {
  socialAccounts: number;
  /** null = unlimited */
  scheduledPostsPerMonth: number | null;
  autoDmsPerMonth: number;
  /** Links on the link-in-bio page. */
  bioLinks: number;
};

export const PLAN_LIMITS: Record<PlanName, PlanLimits> = {
  Free: { socialAccounts: 2, scheduledPostsPerMonth: 10, autoDmsPerMonth: 500, bioLinks: BIO_LINK_LIMITS.Free },
  Pro: { socialAccounts: 5, scheduledPostsPerMonth: null, autoDmsPerMonth: 2_500, bioLinks: BIO_LINK_LIMITS.Pro },
  Agency: { socialAccounts: 25, scheduledPostsPerMonth: null, autoDmsPerMonth: 10_000, bioLinks: BIO_LINK_LIMITS.Agency },
};

/**
 * The user's plan from their Stripe subscription (billing_subscriptions, migration 043): Pro/Agency
 * while active or trialing, or past_due within the 7-day grace period (billingState.planFromBilling);
 * otherwise Free. Any read error falls back to Free (limits fail closed, nothing is deleted).
 */
export async function planForUser(userId: string): Promise<PlanName> {
  if (!userId || !isDbConfigured()) return "Free";
  // Client workspaces (migration 054) have no plan of their own: they use their creator's plan.
  userId = await billingOwnerId(userId);
  try {
    // Admins (allow-listed AND email verified, same rule as the admin panel) get Agency limits.
    const admins = await query<{ email: string }>(
      "select email from socialapp.users where id=$1 and email_verified_at is not null",
      [userId],
    );
    if (admins[0] && isAdminEmail(admins[0].email)) return "Agency";
  } catch {
    // Column or table missing: fall through to the billing lookup.
  }
  try {
    const rows = await query<BillingRow>("select plan, status, past_due_since from socialapp.billing_subscriptions where user_id=$1", [userId]);
    return planFromBilling(rows[0]);
  } catch {
    return "Free";
  }
}

/** Whose subscription pays for `userId`'s workspace: the creator of a client workspace, else itself. */
export async function billingOwnerId(userId: string): Promise<string> {
  try {
    const rows = await query<{ created_by_user_id: string | null }>("select created_by_user_id from socialapp.users where id=$1", [userId]);
    return rows[0]?.created_by_user_id ?? userId;
  } catch {
    return userId; // before migration 054
  }
}

/** Short nudge appended to limit messages ("" on the biggest plan). */
export function upgradeHint(plan: PlanName): string {
  return plan === "Agency" ? "" : ` Need more? Upgrade to ${plan === "Free" ? "Pro" : "Agency"} in Settings > Plan & billing.`;
}

/** UTC calendar month [start, end) containing `at`. */
export function utcMonthRange(at: Date): { start: Date; end: Date } {
  const start = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), 1));
  const end = new Date(Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1));
  return { start, end };
}

export function scheduledLimitMessage(limit: number, plan: PlanName): string {
  return `The ${plan} plan includes ${limit} scheduled posts per month, and that month is full. Save this one as a draft, pick another month, or delete a scheduled post.${upgradeHint(plan)}`;
}

/**
 * Monthly automated-DM limit: the plan's number plus the Refer-and-earn bonus
 * (REFERRAL_BONUS_DMS per qualified referral, see src/lib/referrals.ts).
 */
export function autoDmLimitWithBonus(plan: PlanName, bonusDms: number): number {
  const bonus = Number.isFinite(bonusDms) && bonusDms > 0 ? Math.floor(bonusDms) : 0;
  return PLAN_LIMITS[plan].autoDmsPerMonth + bonus;
}

/** Server-side monthly automated-DM limit for a user (plan + referral bonus; bonus 0 if it cannot be read). */
export async function monthlyAutoDmLimit(userId: string): Promise<{ plan: PlanName; limit: number; bonus: number }> {
  const [plan, bonus] = await Promise.all([planForUser(userId), referralBonusDms(userId)]);
  return { plan, limit: autoDmLimitWithBonus(plan, bonus), bonus };
}

/** Dashboard flag: automated DMs are paused for the rest of the UTC month (same count the sender uses). */
export function autoDmLimitReached(sentThisMonth: number, limit: number): boolean {
  return limit >= 0 && sentThisMonth >= limit;
}

/** Text for the dashboard alert while auto-DMs are paused by the monthly limit. */
export function autoDmLimitBanner(limit: number, plan: PlanName): string {
  return `Auto-DMs are paused: you reached this month's ${limit.toLocaleString("en-US")} auto-DMs on the ${plan} plan. They start again on the 1st (UTC).`;
}

export function autoDmLimitMessage(limit: number, plan: PlanName): string {
  return `Monthly auto-DM limit reached (${limit.toLocaleString("en-US")} on the ${plan} plan). Auto-DMs start again on the 1st of next month (UTC).${upgradeHint(plan)}`;
}

/**
 * Server-side check for the monthly scheduled-post limit. Counts posts scheduled,
 * publishing or published in the UTC month of `at`, ignoring `excludePostId` (the post being saved / moved).
 */
export async function scheduledPostLimitError(userId: string, at: Date, excludePostId?: string | null): Promise<string | null> {
  const plan = await planForUser(userId);
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

/**
 * Usage for the "Scheduled this month" meters (sidebar + composer): posts scheduled, publishing or
 * published in the current UTC month, counted exactly like scheduledPostLimitError. limit null = unlimited.
 */
export async function scheduledPostsUsage(userId: string, at: Date = new Date()): Promise<{ used: number; limit: number | null }> {
  const limit = PLAN_LIMITS[await planForUser(userId)].scheduledPostsPerMonth;
  const { start, end } = utcMonthRange(at);
  const rows = await query<{ n: number }>(
    `select count(*)::int as n from socialapp.scheduled_posts
     where user_id=$1 and status in ('scheduled','publishing','published')
       and scheduled_at >= $2 and scheduled_at < $3`,
    [userId, start.toISOString(), end.toISOString()],
  );
  return { used: rows[0]?.n ?? 0, limit };
}

/** Shown in Settings when a NEW account would go over the plan's connected-account limit. */
export function accountLimitMessage(limit: number, plan: PlanName): string {
  return `The ${plan} plan includes ${limit} connected accounts and they are all in use. Disconnect one below, then connect the new one. Reconnecting an account you already have always works.${upgradeHint(plan)}`;
}

/**
 * Pure decision: may this connect go ahead? Reconnecting an account that is already connected
 * (same platform + id, not disconnected) is always allowed; a new one only below the limit.
 */
export function accountConnectAllowed(input: { alreadyConnected: boolean; connectedCount: number; limit: number }): boolean {
  if (input.alreadyConnected) return true;
  return input.connectedCount < input.limit;
}

export type ConnectTarget =
  | {
      kind: "social";
      /** ig_personal / fb_group are reminder channels: they hold a slot like any other channel. */
      platform: "instagram" | "facebook" | "threads" | NetworkId;
      externalId: string;
    }
  | { kind: "youtube"; channelId: string };

/**
 * Server-side connected-account limit for the OAuth callbacks (Instagram / Meta, Threads, YouTube).
 * Connected = social_accounts not disconnected (active or expired: an expired one still holds a slot
 * until it is disconnected) plus YouTube channels not disconnected. Returns the friendly message, or
 * null when the connect may go ahead.
 */
export async function accountLimitError(userId: string, target: ConnectTarget): Promise<string | null> {
  const rows = await query<{ social: number; youtube: number; already: boolean }>(
    `select
       (select count(*)::int from socialapp.social_accounts where user_id=$1 and status <> 'disconnected') as social,
       (select count(*)::int from socialapp.youtube_channels where user_id=$1 and status <> 'disconnected') as youtube,
       (case when $2 = 'youtube'
          then exists (select 1 from socialapp.youtube_channels where user_id=$1 and channel_id=$4 and status <> 'disconnected')
          else exists (select 1 from socialapp.social_accounts where user_id=$1 and platform=$3 and external_id=$4 and status <> 'disconnected')
        end) as already`,
    [userId, target.kind, target.kind === "social" ? target.platform : null, target.kind === "social" ? target.externalId : target.channelId],
  );
  const r = rows[0] ?? { social: 0, youtube: 0, already: false };
  const plan = await planForUser(userId);
  const limit = PLAN_LIMITS[plan].socialAccounts;
  const allowed = accountConnectAllowed({ alreadyConnected: r.already === true, connectedCount: (r.social ?? 0) + (r.youtube ?? 0), limit });
  return allowed ? null : accountLimitMessage(limit, plan);
}
