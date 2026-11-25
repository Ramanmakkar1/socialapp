import Link from "next/link";
import { Check, CreditCard } from "lucide-react";
import { Btn, BtnLink, PageHero } from "@/components/ui/kit";
import SubmitButton from "@/components/ui/SubmitButton";
import ui from "@/components/ui/ui.module.css";

import { getBilling, isBillingConfigured, refreshStoredSubscription, syncFromCheckoutSession, type StoredBilling } from "@/lib/billing";
import {
  BILLING_INTERVALS,
  PLAN_PRICES,
  endsAt,
  formatUsd,
  graceEndsAt,
  parsePlanChoice,
  planFromBilling,
  yearlySavingPercent,
  type BillingInterval,
  type PaidPlan,
} from "@/lib/billingState";
import { isDbConfigured, query } from "@/lib/db";
import { FEATURE_COPY, isFeatureReady } from "@/lib/featureReadiness";
import { libraryUsage } from "@/lib/mediaLibrary";
import { PLAN_MEDIA_LIMITS, libraryStorageLabel } from "@/lib/mediaLimits";
import { PLAN_LIMITS, monthlyAutoDmLimit, scheduledPostsUsage, type PlanName } from "@/lib/planLimits";
import { PLANS } from "@/lib/plans";
import styles from "../../app-page.module.css";
import billing from "./billing.module.css";
import { requireOwnWorkspaceUser } from "@/lib/workspace";

export const metadata = { title: "Plan & billing" };

const MESSAGES: Record<string, { warn: boolean; text: string }> = {
  error: { warn: true, text: "We couldn't reach Stripe. Nothing was charged. Please try again." },
  not_configured: { warn: false, text: "Paid plans are launching soon. Nothing was charged." },
  no_customer: { warn: true, text: "There is no billing account yet. Pick a plan below to start one." },
};

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  trialing: "Trial",
  past_due: "Payment failed",
  unpaid: "Unpaid",
  canceled: "Canceled",
  incomplete: "Waiting for payment",
  incomplete_expired: "Checkout expired",
  paused: "Paused",
};

function fmtDate(d: Date | string | null | undefined): string | null {
  if (!d) return null;
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? null : t.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

function Meter({ label, used, limit, note }: { label: string; used: number; limit: number | null; note?: string }) {
  const pct = limit === null ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  return (
    <div className={billing.meter}>
      <p className={billing.meterTop}>
        <span>{label}</span>
        <span className={billing.meterNum}>{limit === null ? `${used.toLocaleString("en-US")} · unlimited` : `${used.toLocaleString("en-US")} / ${limit.toLocaleString("en-US")}`}</span>
      </p>
      {limit !== null && (
        <span className={billing.meterBar} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={used}>
          <span style={{ width: `${pct}%` }} className={pct >= 90 ? billing.meterHot : undefined} />
        </span>
      )}
      {note ? <p className={billing.meterNote}>{note}</p> : null}
    </div>
  );
}

async function usageFor(userId: string, plan: PlanName) {
  const empty = { scheduled: { used: 0, limit: PLAN_LIMITS[plan].scheduledPostsPerMonth }, dms: 0, dmLimit: PLAN_LIMITS[plan].autoDmsPerMonth, accounts: 0, bioLinks: 0, media: 0 };
  if (!isDbConfigured()) return empty;
  try {
    const [scheduled, dmLimit, rows, media] = await Promise.all([
      scheduledPostsUsage(userId),
      monthlyAutoDmLimit(userId).then((r) => r.limit, () => PLAN_LIMITS[plan].autoDmsPerMonth),
      query<{ dms: number; accounts: number; links: number }>(
        `select
           (select count(*)::int from socialapp.dm_queue where user_id=$1 and status='sent' and kind <> 'manual_reply'
              and sent_at >= (date_trunc('month', now() at time zone 'UTC') at time zone 'UTC')) as dms,
           (select count(*)::int from socialapp.social_accounts where user_id=$1 and status <> 'disconnected')
             + (select count(*)::int from socialapp.youtube_channels where user_id=$1 and status <> 'disconnected') as accounts,
           (select count(*)::int from socialapp.bio_links l join socialapp.bio_pages p on p.id = l.page_id where p.user_id=$1) as links`,
        [userId],
      ),
      libraryUsage(userId).catch(() => 0),
    ]);
    return { scheduled, dms: rows[0]?.dms ?? 0, dmLimit, accounts: rows[0]?.accounts ?? 0, bioLinks: rows[0]?.links ?? 0, media };
  } catch {
    return empty;
  }
}

function UpgradeCard({ plan, interval, current, picked, enabled }: { plan: PaidPlan; interval: BillingInterval; current: PlanName; picked: boolean; enabled: boolean }) {
  const card = PLANS.find((p) => p.name === plan);
  const cents = PLAN_PRICES[plan][interval];
  const perMonth = interval === "month" ? cents : Math.round(cents / 12);
  const isCurrent = current === plan;
  return (
    <div className={`${ui.card} ${billing.planCard} ${picked ? billing.picked : ""}`}>
      <p className={billing.planName}>
        {plan}
        {isCurrent ? <span className={`${ui.pill} ${ui.pillMint}`}>Your plan</span> : null}
        {!enabled && !isCurrent ? <span className={`${ui.pill} ${ui.pillSoon}`}>Coming soon</span> : null}
        {picked && !isCurrent ? <span className={`${ui.pill} ${ui.pillPeach}`}>You picked this</span> : null}
      </p>
      <p className={billing.price}>
        {formatUsd(perMonth)}
        <span> / month</span>
      </p>
      <p className={billing.priceNote}>
        {interval === "year" ? `${formatUsd(cents)} billed yearly · save ${yearlySavingPercent(plan)}%` : `Billed monthly · or ${formatUsd(Math.round(PLAN_PRICES[plan].year / 12))}/mo billed yearly`}
      </p>
      <ul className={billing.items}>
        {(card?.items ?? []).map((item) => (
          <li key={item.text}>
            <Check width={16} height={16} aria-hidden="true" /> {item.text}
          </li>
        ))}
      </ul>
      {isCurrent ? null : enabled ? (
        <form action="/app/settings/billing/checkout" method="post">
          <input type="hidden" name="plan" value={plan.toLowerCase()} />
          <input type="hidden" name="interval" value={interval} />
          <SubmitButton label={picked ? "Continue to checkout" : `Upgrade to ${plan}`} pendingLabel="Opening checkout…" variant={plan === "Pro" ? "dark" : "line"} />
        </form>
      ) : (
        <div>
          <Btn variant="line" disabled aria-describedby={`soon-${plan}`} className="w-full cursor-not-allowed opacity-60">
            Coming soon
          </Btn>
          <p id={`soon-${plan}`} className={ui.hint} style={{ marginTop: 8 }}>Paid plans are launching soon.</p>
        </div>
      )}
    </div>
  );
}

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string | string[]; session_id?: string | string[]; canceled?: string | string[]; portal?: string | string[]; billing?: string | string[]; plan?: string | string[]; interval?: string | string[] }>;
}) {
  const user = await requireOwnWorkspaceUser();
  const sp = await searchParams;
  const configured = isBillingConfigured();
  // Selling Pro / Agency needs live Stripe (src/lib/featureReadiness.ts). Until then the cards show
  // "Coming soon" and no checkout starts; syncing an existing subscription still works.
  const paidReady = isFeatureReady("billing");
  let syncNote: { warn: boolean; text: string } | null = null;

  // Success page sync: record the subscription now, so a slow or missing webhook never leaves a paying user on Free.
  if (configured && sp.upgraded === "1" && typeof sp.session_id === "string") {
    try {
      const r = await syncFromCheckoutSession(sp.session_id, user.id);
      if (r === "not_paid") syncNote = { warn: true, text: "Stripe is still confirming your payment. This page updates as soon as it goes through." };
    } catch (err) {
      console.error("billing success sync failed for user", user.id, err instanceof Error ? err.message : err);
      syncNote = { warn: true, text: "Payment received by Stripe; we are still confirming it. Refresh in a minute." };
    }
  } else if (configured) {
    // Back from the portal (or any visit): re-read the subscription so plan changes show at once.
    await refreshStoredSubscription(user.id, sp.portal === "1" ? 0 : 60_000).catch((err) => {
      console.error("billing refresh failed for user", user.id, err instanceof Error ? err.message : err);
    });
  }

  const row: StoredBilling | null = isDbConfigured() ? await getBilling(user.id).catch(() => null) : null;
  const plan = planFromBilling(row);
  const usage = await usageFor(user.id, plan);
  const limits = PLAN_LIMITS[plan];
  const picked = parsePlanChoice(sp.plan, sp.interval ?? "month");
  const interval: BillingInterval = picked?.interval ?? (sp.interval === "year" ? "year" : "month");
  const message = typeof sp.billing === "string" && Object.hasOwn(MESSAGES, sp.billing) ? MESSAGES[sp.billing] : null;
  const hasSubscription = Boolean(row?.stripe_subscription_id && row.status && !["canceled", "incomplete_expired"].includes(row.status));
  const ending = row ? endsAt({ cancelAtPeriodEnd: row.cancel_at_period_end, cancelAt: row.cancel_at ? new Date(row.cancel_at) : null, currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end) : null }) : null;
  const grace = row?.status === "past_due" ? graceEndsAt(row.past_due_since) : null;
  const upgradeTargets: PaidPlan[] = plan === "Free" ? ["Pro", "Agency"] : plan === "Pro" ? ["Agency"] : [];

  return (
    <div className={styles.page}>
      <PageHero title="Plan & billing" lede="Your plan, what you have used this month, and your Stripe billing." icon={<CreditCard width={20} height={20} />} action={<BtnLink href="/app/settings" variant="line" size="sm">Back to settings</BtnLink>} />
      {sp.upgraded === "1" && plan !== "Free" ? (
        <p role="status" className={ui.notice}>Welcome to {plan}! Your new limits are on. A receipt is on its way to {user.email}.</p>
      ) : null}
      {syncNote ? <p role="status" className={`${ui.notice} ${syncNote.warn ? ui.noticeWarn : ""}`}>{syncNote.text}</p> : null}
      {sp.canceled === "1" ? <p role="status" className={ui.notice}>Checkout canceled. Nothing was charged.</p> : null}
      {message ? <p role="alert" className={`${ui.notice} ${message.warn ? ui.noticeWarn : ""}`}>{message.text}</p> : null}

      <section className={styles.section} aria-labelledby="current-plan-heading">
        <div className={styles.sectionHeader}>
          <h2 id="current-plan-heading" className={styles.sectionTitle}>Current plan</h2>
          {configured && row ? (
            <form action="/app/settings/billing/portal" method="post">
              <SubmitButton label={hasSubscription ? "Manage billing" : "Billing history"} pendingLabel="Opening Stripe…" size="sm" variant="line" />
            </form>
          ) : null}
        </div>
        <div className={`${ui.card} ${billing.current}`}>
          <p className={billing.planName}>
            {plan}
            {row?.status && hasSubscription ? (
              <span className={`${ui.pill} ${row.status === "active" || row.status === "trialing" ? ui.pillMint : ui.pillPeach}`}>{STATUS_LABEL[row.status] ?? row.status}</span>
            ) : null}
          </p>
          {plan === "Free" && !hasSubscription ? <p className={ui.hint}>{paidReady ? "Free forever. Upgrade any time; cancel any time." : "Free forever. Pro and Agency are launching soon."}</p> : null}
          {hasSubscription && row ? (
            <p className={ui.hint}>
              {row.plan} · {row.billing_interval === "year" ? "billed yearly" : "billed monthly"}
              {row.plan && row.billing_interval ? ` · ${formatUsd(PLAN_PRICES[row.plan][row.billing_interval])} per ${row.billing_interval}` : ""}
            </p>
          ) : null}
          {hasSubscription && ending ? (
            <p className={ui.hint}><strong>Cancels on {fmtDate(ending)}.</strong> You keep {row?.plan} until then. Changed your mind? Press Manage billing to renew.</p>
          ) : hasSubscription && row?.current_period_end ? (
            <p className={ui.hint}>Renews on {fmtDate(row.current_period_end)}.</p>
          ) : null}
          {row?.status === "past_due" || row?.status === "unpaid" ? (
            <p role="alert" className={`${ui.notice} ${ui.noticeWarn}`}>
              Your last payment failed.{" "}
              {grace && plan !== "Free" ? `Update your card by ${fmtDate(grace)} to keep ${row.plan}.` : "You are on the Free plan until the payment goes through."}{" "}
              Press Manage billing to update your card.
            </p>
          ) : null}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="usage-heading">
        <h2 id="usage-heading" className={styles.sectionTitle}>Usage this month</h2>
        <div className={billing.meters}>
          <Meter label="Scheduled posts" used={usage.scheduled.used} limit={usage.scheduled.limit} />
          <Meter label="Auto-DMs sent" used={usage.dms} limit={usage.dmLimit} note={usage.dmLimit > limits.autoDmsPerMonth ? "Includes your Refer-and-earn bonus." : undefined} />
          <Meter label="Connected accounts" used={usage.accounts} limit={limits.socialAccounts} note={usage.accounts > limits.socialAccounts ? "Over the limit: your accounts keep working. Disconnect one to connect a new one." : undefined} />
          <Meter label="Link-in-bio links" used={usage.bioLinks} limit={limits.bioLinks} note={usage.bioLinks > limits.bioLinks ? "Over the limit: your links stay. Remove one before adding another." : undefined} />
          <Meter label="Media library (MB)" used={Math.round(usage.media / 1e6)} limit={Math.round(PLAN_MEDIA_LIMITS[plan].libraryBytes / 1e6)} note={libraryStorageLabel(usage.media, plan)} />
        </div>
        <p className={ui.hint}>Auto-DM and scheduled-post counts reset on the 1st of each month (UTC). Nothing is ever deleted when you change plans.</p>
      </section>

      {upgradeTargets.length > 0 ? (
        <section id="plans" className={styles.section} aria-labelledby="plans-heading">
          <div className={styles.sectionHeader}>
            <h2 id="plans-heading" className={styles.sectionTitle}>{plan === "Free" ? "Upgrade" : "Need more?"}</h2>
            <div className={billing.toggle} role="group" aria-label="Billing period">
              {BILLING_INTERVALS.map((i) => (
                <Link
                  key={i}
                  href={`/app/settings/billing?interval=${i}${picked ? `&plan=${picked.plan.toLowerCase()}` : ""}#plans`}
                  className={i === interval ? billing.toggleOn : undefined}
                  aria-current={i === interval ? "true" : undefined}
                  scroll={false}
                >
                  {i === "month" ? "Monthly" : `Yearly · save up to ${Math.max(...upgradeTargets.map(yearlySavingPercent))}%`}
                </Link>
              ))}
            </div>
          </div>
          {!paidReady ? (
            <p role="status" className={`${ui.notice} ${ui.noticeSoon}`}><strong>{FEATURE_COPY.billing.title}.</strong> {FEATURE_COPY.billing.body}</p>
          ) : null}
          {hasSubscription && paidReady ? (
            <p className={ui.hint}>You already have a subscription: switching plans or billing period happens in Manage billing (Stripe charges or credits the difference).</p>
          ) : null}
          <div className={billing.plans}>
            {upgradeTargets.map((p) => (
              <UpgradeCard key={p} plan={p} interval={interval} current={plan} picked={picked?.plan === p && paidReady} enabled={paidReady} />
            ))}
          </div>
          <p className={ui.hint}>
            {paidReady ? "Prices in USD. Taxes may apply at checkout. Cancel any time from Manage billing: you keep your plan until the end of the period you paid for." : "Prices in USD, shown so you can plan ahead. Nothing can be charged until paid plans launch."}{" "}
            <Link href="/pricing" className={ui.link}>Compare all plans</Link>
          </p>
        </section>
      ) : (
        <section className={styles.section}>
          <p className={ui.hint}>You are on our biggest plan. Need more than {limits.socialAccounts} accounts? <a href="mailto:hello@poskoo.com" className={ui.link}>Write to us</a>.</p>
        </section>
      )}
      <p><BtnLink href="/app/settings" variant="ghost" size="sm">Back to settings</BtnLink></p>
    </div>
  );
}
