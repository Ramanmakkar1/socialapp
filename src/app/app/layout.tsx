import { Suspense, type ReactNode } from "react";
import { MarkLoggedIn } from "@/components/AuthNav";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { isDbConfigured, query } from "@/lib/db";
import { instrumentSans } from "@/lib/fonts";
import { isIgConfigured } from "@/lib/instagram";
import { isMetaLoginConfigured } from "@/lib/metaLogin";
import { monthlyAutoDmLimit, PLAN_LIMITS, type PlanName } from "@/lib/planLimits";
import { getBilling, type StoredBilling } from "@/lib/billing";
import { graceEndsAt, planFromBilling } from "@/lib/billingState";
import { cookies } from "next/headers";
import { UPGRADE_INTENT_COOKIE, parseUpgradeIntent } from "@/lib/upgradeIntent";
import { pendingMediaUsage } from "@/lib/mediaLifecycle";
import { GB, PLAN_MEDIA_LIMITS, pendingStorageLabel } from "@/lib/mediaLimits";
import { isThreadsConfigured } from "@/lib/threadsAuth";
import { isYouTubeConfigured } from "@/lib/youtubeAuth";
import { NEW_NETWORK_ICON } from "@/components/brandIcons";
import { connectHref, networkAvailability } from "@/lib/networks/registry";
import { linkedinConfig } from "@/lib/networks/linkedin";
import { channelStatuses } from "@/lib/channelStatus";
import { isFeatureReady, reminderChannelStatus } from "@/lib/featureReadiness";
import { logoutAction } from "../login/actions";
import PoskooMark from "@/components/PoskooMark";
import { VERIFY_DISMISS_COOKIE } from "@/lib/emailCodes";
import AlertBar, { VerifyEmailActions, type ShellAlert } from "./AlertBar";
import { BtnA } from "@/components/ui/kit";
import { AtSign, Check, ChevronDown, ChevronsUpDown, Gauge, Facebook, Instagram, LogOut, Plus, Settings, Youtube } from "lucide-react";
import { getSidebarChannels, type SidebarChannel } from "@/lib/sidebarChannels";
import ConnectChannelDialog, { type ConnectAvailability } from "./ConnectChannelDialog";
import SidebarNav from "./SidebarNav";
import ShellFrame from "./ShellFrame";
import NewAutomationDialog from "./NewAutomationDialog";
import { ShellSkeleton } from "./Skeleton";
import styles from "./shell.module.css";
import type { Metadata } from "next";

// The dashboard is private: never indexed (robots.txt also disallows /app).
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Every /app page is per-user: never prerender or cache it at build time.
export const dynamic = "force-dynamic";

// Shared dashboard shell. Guests are sent to /login by requireUser().
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<ShellSkeleton />}>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}

function Logo() {
  return (
    <Link href="/app" className={styles.logo} aria-label="Poskoo dashboard home">
      <PoskooMark size={28} />
      poskoo<b>.</b>
    </Link>
  );
}

const CHANNEL_ICON: Record<string, typeof Instagram> = { instagram: Instagram, facebook: Facebook, threads: AtSign, youtube: Youtube, ...NEW_NETWORK_ICON };

// Account / workspace menu at the top of the sidebar (native disclosure, no JS needed).
function AccountMenu({ name, email, plan }: { name: string; email: string; plan: string }) {
  return (
    <details className={styles.acctMenu}>
      <summary className={styles.acctBtn} aria-label={`Account menu for ${name}`}>
        <span className={styles.acctAvatar} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
        <span className={styles.acctText}>
          <b>{name}</b>
          <span>{plan} plan</span>
        </span>
        <ChevronsUpDown width={16} height={16} aria-hidden="true" className={styles.acctChevron} />
      </summary>
      <div className={styles.acctPop}>
        <p className={styles.acctLabel}>Workspace</p>
        <p className={styles.acctWorkspace}>
          <span className={styles.acctAvatarSm} aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
          <span className={styles.acctWsName}>{name}</span>
          <Check width={16} height={16} aria-label="Current workspace" />
        </p>
        <p className={styles.acctEmail} title={email}>{email}</p>
        <div className={styles.acctSep} />
        <Link href="/app/settings" className={styles.acctItem}><Settings width={16} height={16} aria-hidden="true" /> Settings</Link>
        <form action={logoutAction}>
          <button type="submit" className={styles.acctItem}><LogOut width={16} height={16} aria-hidden="true" /> Sign out</button>
        </form>
      </div>
    </details>
  );
}

// Primary actions: new post (opens the composer) and new automation (trigger picker dialog).
function NewButtons() {
  return (
    <div className={styles.newRow}>
      <Link href="/app/calendar?compose=1" className={styles.newBtn}>
        <Plus width={16} height={16} aria-hidden="true" /> Post
      </Link>
      <NewAutomationDialog label="Auto-DM" className={styles.newAutoBtn} />
    </div>
  );
}

function ChannelRow({ c, Icon, ok }: { c: SidebarChannel; Icon: typeof Instagram; ok: boolean }) {
  return (
    <>
      <span className={styles.channelAvatar} aria-hidden="true">
        {c.name.replace(/^@/, "").slice(0, 1).toUpperCase()}
        <span className={`${styles.channelBadge} ${styles[`badge_${c.platform}`] ?? ""}`}><Icon width={9} height={9} /></span>
      </span>
      <span className={styles.channelName}>{c.name}</span>
      {ok ? (
        c.scheduled > 0 && <span className={styles.channelCount} aria-label={`${c.scheduled} scheduled`}>{c.scheduled}</span>
      ) : (
        <span className={styles.channelWarn}>Reconnect</span>
      )}
    </>
  );
}

// Buffer-style channel list: avatar initial with network badge, handle, scheduled count.
function Channels({ channels, availability, slots }: { channels: SidebarChannel[]; availability: ConnectAvailability; slots?: { used: number; limit: number } }) {
  return (
    <section className={styles.channels} aria-labelledby="sidebar-channels">
      <p id="sidebar-channels" className={styles.navGroupTitle}>Channels</p>
      <ul className={styles.channelList}>
        {channels.map((c, i) => {
          const Icon = CHANNEL_ICON[c.platform] ?? AtSign;
          const ok = c.status === "active";
          return (
            <li key={`${c.platform}-${i}`}>
              {ok ? (
                <Link href={`/app/calendar?view=week&channel=${c.platform}`} className={styles.channel} title={`${c.name} · ${c.platform}`}>
                  <ChannelRow c={c} Icon={Icon} ok />
                </Link>
              ) : (
                // Reconnect = the same one-click connect as the Connect dialog (full navigation: OAuth start or the dialog form).
                <a href={connectHref(c.platform)} className={styles.channel} title={`${c.name} needs to be reconnected`}>
                  <ChannelRow c={c} Icon={Icon} ok={false} />
                </a>
              )}
            </li>
          );
        })}
        <li>
          <ConnectChannelDialog availability={availability} slots={slots} label={channels.length ? "Connect more channels" : "Connect a channel"} />
        </li>
      </ul>
    </section>
  );
}

function Meter({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  return (
    <div className={styles.meter}>
      <p className={styles.meterTop}>
        <span>{label}</span>
        <span className={styles.meterNum}>{used.toLocaleString("en-US")}/{limit.toLocaleString("en-US")}</span>
      </p>
      <span className={styles.meterBar} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={limit} aria-valuenow={used}>
        <span style={{ width: `${pct}%` }} className={pct >= 90 ? styles.meterHot : undefined} />
      </span>
    </div>
  );
}

/** "Media storage: 0.4 / 2 GB": only files waiting to be posted count (src/lib/mediaLifecycle.ts). */
function MediaMeter({ used, plan }: { used: number; plan: PlanName }) {
  const limit = PLAN_MEDIA_LIMITS[plan].pendingBytes;
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const label = pendingStorageLabel(used, plan);
  return (
    <div className={styles.meter} title="Only files waiting to be posted count. Files are deleted once their post is published.">
      <p className={styles.meterTop}>
        <span>Media storage</span>
        <span className={styles.meterNum}>{label.replace("Media storage: ", "")}</span>
      </p>
      <span className={styles.meterBar} role="meter" aria-label={`${label} (only files waiting to be posted count)`} aria-valuemin={0} aria-valuemax={Math.round(limit / GB)} aria-valuenow={Number((used / GB).toFixed(1))}>
        <span style={{ width: `${pct}%` }} className={pct >= 90 ? styles.meterHot : undefined} />
      </span>
      <p className={styles.meterTop}><span>Only files waiting to be posted count</span></p>
    </div>
  );
}

async function AppShell({ children }: { children: ReactNode }) {
  const user = await requireUser();
  // Started now, awaited at render: a folder listing + one query, in parallel with the rest.
  const mediaPendingPromise = isDbConfigured() ? pendingMediaUsage(user.id).catch(() => 0) : Promise.resolve(0);
  let needsReconnect = false;
  let failedPosts = 0;
  let scheduledPosts = 0;
  let pendingOrders = 0;
  let dmsThisMonth = 0;
  let scheduledThisMonth = 0;
  if (isDbConfigured()) {
    try {
      const rows = await query<{ expired: number; failed: number; scheduled: number; dms: number; scheduled_month: number; pending_orders: number }>(
        `select (select count(*)::int from socialapp.social_accounts where user_id=$1 and platform='instagram' and status='expired') as expired,
                (select count(*)::int from socialapp.scheduled_posts where user_id=$1 and status='failed') as failed,
                (select count(*)::int from socialapp.scheduled_posts where user_id=$1 and status='scheduled') as scheduled,
                (select count(*)::int from socialapp.orders where user_id=$1 and status='awaiting_confirmation') as pending_orders,
                (select count(*)::int from socialapp.dm_queue where user_id=$1 and status='sent' and kind <> 'manual_reply'
                   and sent_at >= (date_trunc('month', now() at time zone 'UTC') at time zone 'UTC')) as dms,
                (select count(*)::int from socialapp.scheduled_posts where user_id=$1 and status in ('scheduled','publishing','published')
                   and scheduled_at >= (date_trunc('month', now() at time zone 'UTC') at time zone 'UTC')
                   and scheduled_at < ((date_trunc('month', now() at time zone 'UTC') + interval '1 month') at time zone 'UTC')) as scheduled_month`,
        [user.id]
      );
      needsReconnect = (rows[0]?.expired ?? 0) > 0;
      failedPosts = rows[0]?.failed ?? 0;
      scheduledPosts = rows[0]?.scheduled ?? 0;
      pendingOrders = rows[0]?.pending_orders ?? 0;
      dmsThisMonth = rows[0]?.dms ?? 0;
      scheduledThisMonth = rows[0]?.scheduled_month ?? 0;
    } catch {
      needsReconnect = false;
      failedPosts = 0;
    }
  }
  const channels = await getSidebarChannels(user.id);
  // Same rule as planLimits.planForUser (one read gives the plan AND the payment-failed state).
  const billing: StoredBilling | null = isDbConfigured() ? await getBilling(user.id).catch(() => null) : null;
  // Admins get Agency limits (same rule as planLimits.planForUser).
  const plan: PlanName = isAdmin(user) ? "Agency" : planFromBilling(billing);
  const limits = PLAN_LIMITS[plan];
  // No "Continue to checkout" banner while paid plans aren't on sale (src/lib/featureReadiness.ts).
  const upgradeIntent = plan === "Free" && isFeatureReady("billing") ? parseUpgradeIntent((await cookies()).get(UPGRADE_INTENT_COOKIE)?.value) : null;
  const paymentFailed = billing?.status === "past_due" || billing?.status === "unpaid";
  const graceEnd = billing?.status === "past_due" ? graceEndsAt(billing.past_due_since) : null;
  // Same number the send worker enforces (plan + Refer-and-earn bonus).
  const dmLimit = await monthlyAutoDmLimit(user.id).then((r) => r.limit, () => limits.autoDmsPerMonth);
  const metaReady = isMetaLoginConfigured();
  const availability: ConnectAvailability = {
    instagram: metaReady || isIgConfigured(),
    facebook: metaReady,
    threads: isThreadsConfigured(),
    youtube: isYouTubeConfigured(),
    instagramLogin: isIgConfigured(),
    ...networkAvailability(),
  };
  // "Awaiting approval" / "Coming soon" pills for channels whose keys or approval are missing.
  availability.linkedinPages = Boolean(availability.linkedin) && linkedinConfig().companyPages;
  availability.statuses = channelStatuses(
    { tiktok: Boolean(availability.tiktok), pinterest: Boolean(availability.pinterest), x: Boolean(availability.x), gbp: Boolean(availability.gbp), linkedin_pages: availability.linkedinPages },
    process.env,
  );
  availability.reminderStatuses = {
    ig_personal: reminderChannelStatus("Instagram (personal)", process.env),
    fb_group: reminderChannelStatus("Facebook Group", process.env),
  };
  const displayName = user.name?.trim() || user.email.split("@")[0];
  const mediaPending = await mediaPendingPromise;
  // Same rule as the connect callbacks (planLimits.accountLimitError): anything not disconnected holds a slot.
  const connectedAccounts = channels.filter((c) => c.status !== "disconnected").length;
  // "We sent you a code" is only true when e-mail is switched on; verification never blocks the app.
  const showVerify = user.emailVerified !== true && isFeatureReady("email") && (await cookies()).get(VERIFY_DISMISS_COOKIE)?.value !== "1";

  // One compact alert bar, most important first (the rest sit behind "+N more").
  const alerts: ShellAlert[] = [];
  // Only offer Reconnect when Instagram connecting is switched on (otherwise Settings says it isn't).
  if (needsReconnect && availability.instagram) {
    alerts.push({
      id: "reconnect",
      tone: "danger",
      text: "Instagram access expired. Posts and auto-DMs are paused until you reconnect.",
      action: <BtnA href="/api/instagram/connect" size="sm">Reconnect Instagram</BtnA>,
    });
  }
  if (paymentFailed) {
    alerts.push({
      id: "payment",
      tone: "danger",
      text: `Your last Poskoo payment failed. ${
        graceEnd && plan !== "Free"
          ? `Update your card by ${graceEnd.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })} to keep your ${billing?.plan ?? "paid"} plan.`
          : "Your account is on the Free plan until the payment goes through."
      }`,
      action: <BtnA href="/app/settings/billing" size="sm">Update payment</BtnA>,
    });
  }
  if (upgradeIntent) {
    alerts.push({
      id: "upgrade",
      tone: "info",
      text: `You picked the ${upgradeIntent.plan} plan. Finish upgrading in one step.`,
      action: <BtnA href={`/app/settings/billing?plan=${upgradeIntent.plan.toLowerCase()}&interval=${upgradeIntent.interval}#plans`} size="sm">Continue to checkout</BtnA>,
    });
  }
  if (showVerify) {
    alerts.push({
      id: "verify",
      tone: "info",
      text: `Verify your email: we sent a 6-digit code to ${user.email}.`,
      action: <VerifyEmailActions />,
    });
  }

  return (
    <div className={`app-theme ${instrumentSans.variable} ${styles.shell}`}>
      <ShellFrame
        logo={
          <Link href="/app" className={styles.topbarLogo} aria-label="Poskoo dashboard home">
            <PoskooMark size={26} />
          </Link>
        }
        initial={displayName.slice(0, 1).toUpperCase()}
        failedPosts={failedPosts}
        sidebar={
          <>
            <div className={styles.sideTop}>
              <Logo />
            </div>
            <AccountMenu name={displayName} email={user.email} plan={plan} />
            <NewButtons />
            <div className={styles.sideScroll}>
              <SidebarNav failedPosts={failedPosts} scheduledPosts={scheduledPosts} pendingOrders={pendingOrders} />
              <Channels channels={channels} availability={availability} slots={{ used: connectedAccounts, limit: limits.socialAccounts }} />
              <details className={styles.usage}>
                <summary className={styles.usageSummary}>
                  <Gauge width={16} height={16} aria-hidden="true" />
                  <span>Usage</span>
                  <span className={styles.usageHint}>{plan} plan</span>
                  <ChevronDown width={14} height={14} aria-hidden="true" className={styles.usageChevron} />
                </summary>
                <div className={styles.usageBody} aria-label="Plan usage">
                  {limits.scheduledPostsPerMonth !== null && (
                    <Meter label="Scheduled this month" used={scheduledThisMonth} limit={limits.scheduledPostsPerMonth} />
                  )}
                  <Meter label="DMs sent this month" used={dmsThisMonth} limit={dmLimit} />
                  <Meter label="Connected accounts" used={connectedAccounts} limit={limits.socialAccounts} />
                  <MediaMeter used={mediaPending} plan={plan} />
                  {plan !== "Agency" && (
                    <Link href="/app/settings/billing" className={styles.meterUpgrade}>
                      {plan === "Free" ? "Upgrade for more" : "Upgrade to Agency"}
                    </Link>
                  )}
                </div>
              </details>
            </div>
            <SidebarNav variant="footer" failedPosts={failedPosts} showAdmin={isAdmin(user)} />
          </>
        }
      >
        <AlertBar alerts={alerts} />
        <div className={styles.content}>{children}</div>
        <MarkLoggedIn />
      </ShellFrame>
    </div>
  );
}
