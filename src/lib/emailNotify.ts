// Server only: the app's e-mail notifications. Every function here never throws (failures are
// logged) and none of them should be awaited on a user's request path: wrap calls in inBackground().
import { after } from "next/server";
import { claimEmailKey, issueCode } from "@/lib/authEmail";
import { query } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  absoluteUrl,
  buyerReceiptEmail,
  dmLimitReachedEmail,
  newDeviceEmail,
  newOrderEmail,
  passwordChangedEmail,
  postFailedEmail,
  reconnectNeededEmail,
  referralBonusEmail,
  subscriptionCanceledEmail,
  subscriptionPaymentFailedEmail,
  subscriptionStartedEmail,
  upiAwaitingEmail,
  upiOrderToConfirmEmail,
  upiRejectedEmail,
  verifyEmail,
  welcomeEmail,
  type RenderedEmail,
} from "@/lib/emailTemplates";
import { maskEmail } from "@/lib/referrals";
import { graceEndsAt } from "@/lib/billingState";
import { EXTRA_NETWORK_LABEL } from "@/lib/networks/tokenNetworks";

/** Runs `task` after the response is sent (Next `after`), or detached outside a request. */
export function inBackground(label: string, task: () => Promise<unknown>): void {
  const run = () =>
    task().catch((err) => {
      console.error(`[email:${label}] failed`, err instanceof Error ? err.message.slice(0, 160) : "unknown");
    });
  try {
    after(run);
  } catch {
    void run();
  }
}

function send(to: string, mail: RenderedEmail, tag: string) {
  return sendEmail({ to, subject: mail.subject, html: mail.html, text: mail.text, tag });
}

/** Welcome e-mail, once per user (password and Google sign-ups). */
export async function sendWelcome(user: { id: string; email: string; name: string | null }): Promise<void> {
  if (!(await claimEmailKey(`welcome:${user.id}`))) return;
  await send(user.email, welcomeEmail({ name: user.name }), "welcome");
}

/** Issues a verification code + link and e-mails it. */
export async function sendVerification(user: { id: string; email: string; name: string | null }): Promise<boolean> {
  const { code, token } = await issueCode(user.id, "verify");
  const res = await send(user.email, verifyEmail({ name: user.name, code, link: absoluteUrl(`/verify-email?token=${encodeURIComponent(token)}`) }), "verify");
  return res.ok;
}

export async function sendPasswordChanged(user: { email: string; name: string | null }): Promise<void> {
  await send(user.email, passwordChangedEmail({ name: user.name, when: new Date() }), "password_changed");
}

/** "Chrome on macOS" from a user agent (rough; only for the new-device e-mail). */
export function describeDevice(ua: string | null | undefined): string {
  const s = ua ?? "";
  const browser = /Edg\//.test(s) ? "Edge" : /OPR\//.test(s) ? "Opera" : /Firefox\//.test(s) ? "Firefox" : /Chrome\//.test(s) ? "Chrome" : /Safari\//.test(s) ? "Safari" : "A browser";
  const os = /iPhone|iPad/.test(s) ? "iOS" : /Android/.test(s) ? "Android" : /Mac OS X/.test(s) ? "macOS" : /Windows/.test(s) ? "Windows" : /Linux/.test(s) ? "Linux" : "an unknown system";
  return `${browser} on ${os}`;
}

export async function sendNewDevice(user: { email: string; name: string | null }, userAgent: string | null | undefined): Promise<void> {
  await send(user.email, newDeviceEmail({ name: user.name, device: describeDevice(userAgent), when: new Date() }), "new_device");
}

/** New-order (creator) + receipt (buyer) for a PAID order, each at most once per Checkout Session. */
export async function notifyOrderPaid(checkoutSessionId: string): Promise<void> {
  const rows = await query<{
    status: string;
    buyer_email: string | null;
    product_title: string;
    amount_cents: number;
    fee_cents: number;
    currency: string;
    seller_email: string;
    seller_name: string | null;
    slug: string | null;
    delivery_type: "file" | "link" | null;
  }>(
    `select o.status, o.buyer_email, o.product_title, o.amount_cents, o.fee_cents, o.currency,
            u.email as seller_email, u.name as seller_name, p.slug, p.delivery_type
     from socialapp.orders o join socialapp.users u on u.id = o.user_id
     left join socialapp.products p on p.id = o.product_id
     where o.stripe_checkout_session_id=$1`,
    [checkoutSessionId],
  );
  const o = rows[0];
  if (!o || o.status !== "paid") return;
  if (await claimEmailKey(`order-seller:${checkoutSessionId}`)) {
    await send(
      o.seller_email,
      newOrderEmail({ name: o.seller_name, buyerEmail: o.buyer_email, product: o.product_title, amountCents: o.amount_cents, feeCents: o.fee_cents, currency: o.currency }),
      "new_order",
    );
  }
  if (o.buyer_email && o.slug && (await claimEmailKey(`order-buyer:${checkoutSessionId}`))) {
    const accessUrl = absoluteUrl(`/p/${o.slug}/success?session_id=${encodeURIComponent(checkoutSessionId)}`);
    await send(
      o.buyer_email,
      buyerReceiptEmail({ product: o.product_title, amountCents: o.amount_cents, currency: o.currency, accessUrl, delivery: o.delivery_type ?? "link", seller: o.seller_name }),
      "receipt",
    );
  }
}

type UpiOrderMail = {
  status: string;
  buyer_email: string | null;
  buyer_name: string | null;
  product_title: string;
  amount_cents: number;
  currency: string;
  upi_utr: string;
  order_ref: string;
  access_token: string;
  reject_reason: string | null;
  seller_email: string;
  seller_name: string | null;
  payee_name: string | null;
  support_contact: string | null;
  slug: string | null;
  delivery_type: "file" | "link" | null;
};

async function upiOrderMail(orderId: string): Promise<UpiOrderMail | null> {
  const rows = await query<UpiOrderMail>(
    `select o.status, o.buyer_email, o.buyer_name, o.product_title, o.amount_cents, o.currency, o.upi_utr, o.order_ref,
            o.access_token, o.reject_reason, u.email as seller_email, u.name as seller_name,
            sp.upi_payee_name as payee_name, sp.upi_support_contact as support_contact, p.slug, p.delivery_type
     from socialapp.orders o join socialapp.users u on u.id = o.user_id
     left join socialapp.products p on p.id = o.product_id
     left join socialapp.seller_payouts sp on sp.user_id = o.user_id
     where o.id=$1 and o.payment_method='upi'`,
    [orderId],
  );
  return rows[0] ?? null;
}

/** Buyer status/access page for a UPI order (bearer token in the link). */
export function upiOrderUrl(slug: string, orderId: string, token: string): string {
  return absoluteUrl(`/p/${slug}/order/${orderId}?t=${encodeURIComponent(token)}`);
}

/** New UPI order: buyer "awaiting confirmation" + seller "confirm this payment", each once. */
export async function notifyUpiSubmitted(orderId: string): Promise<void> {
  const o = await upiOrderMail(orderId);
  if (!o || o.status !== "awaiting_confirmation") return;
  if (await claimEmailKey(`upi-seller:${orderId}`)) {
    await send(
      o.seller_email,
      upiOrderToConfirmEmail({ name: o.seller_name, buyerEmail: o.buyer_email ?? "", buyerName: o.buyer_name, product: o.product_title, amountCents: o.amount_cents, currency: o.currency, utr: o.upi_utr, orderRef: o.order_ref }),
      "upi_to_confirm",
    );
  }
  if (o.buyer_email && o.slug && (await claimEmailKey(`upi-buyer-awaiting:${orderId}`))) {
    await send(
      o.buyer_email,
      upiAwaitingEmail({ product: o.product_title, amountCents: o.amount_cents, currency: o.currency, utr: o.upi_utr, orderRef: o.order_ref, statusUrl: upiOrderUrl(o.slug, orderId, o.access_token), seller: o.payee_name, supportContact: o.support_contact }),
      "upi_awaiting",
    );
  }
}

/** Seller decided: confirmed -> the usual receipt with the access link; rejected -> reason. Once each. */
export async function notifyUpiDecided(orderId: string): Promise<void> {
  const o = await upiOrderMail(orderId);
  if (!o || !o.buyer_email) return;
  if (o.status === "paid" && o.slug && (await claimEmailKey(`upi-buyer-paid:${orderId}`))) {
    await send(
      o.buyer_email,
      buyerReceiptEmail({ product: o.product_title, amountCents: o.amount_cents, currency: o.currency, accessUrl: upiOrderUrl(o.slug, orderId, o.access_token), delivery: o.delivery_type ?? "link", seller: o.payee_name, method: "upi" }),
      "receipt",
    );
  }
  if (o.status === "rejected" && (await claimEmailKey(`upi-buyer-rejected:${orderId}`))) {
    await send(
      o.buyer_email,
      upiRejectedEmail({ product: o.product_title, amountCents: o.amount_cents, currency: o.currency, utr: o.upi_utr, orderRef: o.order_ref, reason: o.reject_reason ?? "The seller could not find this payment.", seller: o.payee_name, supportContact: o.support_contact }),
      "upi_rejected",
    );
  }
}

const PLATFORM_LABEL: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  threads: "Threads",
  youtube: "YouTube",
  tiktok: "TikTok",
  bluesky: "Bluesky",
  mastodon: "Mastodon",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  x: "X",
  ...EXTRA_NETWORK_LABEL,
};

/** "Scheduled post failed" alert: at most one e-mail per post, ever. */
export async function notifyPostFailed(postId: string): Promise<void> {
  const rows = await query<{ email: string; name: string | null; caption: string; scheduled_at: Date | null; platform: string; error: string | null }>(
    `select u.email, u.name, p.caption, p.scheduled_at, t.platform, t.error
     from socialapp.scheduled_posts p join socialapp.users u on u.id = p.user_id
     join socialapp.post_targets t on t.post_id = p.id and t.status = 'failed'
     where p.id=$1 order by t.platform limit 1`,
    [postId],
  );
  const r = rows[0];
  if (!r || !(await claimEmailKey(`post-failed:${postId}`))) return;
  await send(
    r.email,
    postFailedEmail({ name: r.name, platform: PLATFORM_LABEL[r.platform] ?? r.platform, caption: r.caption, error: r.error ?? "Unknown error", scheduledFor: r.scheduled_at }),
    "post_failed",
  );
}

/** "+500 DMs" e-mail for referrals that just qualified, once per referral. */
export async function notifyReferralsQualified(referralIds: string[]): Promise<void> {
  if (referralIds.length === 0) return;
  const rows = await query<{ id: string; bonus_dms: number; email: string; name: string | null; friend: string }>(
    `select r.id, r.bonus_dms, u.email, u.name, f.email as friend
     from socialapp.referrals r join socialapp.users u on u.id = r.referrer_user_id
     join socialapp.users f on f.id = r.referred_user_id
     where r.id = any($1::uuid[]) and r.qualified_at is not null`,
    [referralIds],
  );
  for (const r of rows) {
    if (!(await claimEmailKey(`referral:${r.id}`))) continue;
    await send(r.email, referralBonusEmail({ name: r.name, bonusDms: r.bonus_dms, friend: maskEmail(r.friend) }), "referral");
  }
}

async function billingRecipient(userId: string): Promise<{ email: string; name: string | null } | null> {
  const rows = await query<{ email: string; name: string | null }>("select email, name from socialapp.users where id=$1", [userId]);
  return rows[0] ?? null;
}

/**
 * Subscription e-mails that follow the stored state, each at most once (email_sends keys):
 * "started" once per subscription when it is active/trialing, "canceled" once per scheduled end
 * date, "ended" once when it is canceled.
 */
export async function notifyBillingState(
  userId: string,
  s: { subscriptionId: string; plan: string | null; interval: "month" | "year" | null; status: string; amountCents: number | null; currency: string | null; currentPeriodEnd: Date | null; endsAt: Date | null },
): Promise<void> {
  const to = await billingRecipient(userId);
  if (!to || !s.plan) return;
  if ((s.status === "active" || s.status === "trialing") && (await claimEmailKey(`billing-started:${s.subscriptionId}`))) {
    await send(to.email, subscriptionStartedEmail({ name: to.name, plan: s.plan, interval: s.interval ?? "month", amountCents: s.amountCents, currency: s.currency, renewsOn: s.endsAt ? null : s.currentPeriodEnd }), "billing_started");
  }
  if (s.endsAt && s.status !== "canceled" && (await claimEmailKey(`billing-cancel:${s.subscriptionId}:${s.endsAt.toISOString().slice(0, 10)}`))) {
    await send(to.email, subscriptionCanceledEmail({ name: to.name, plan: s.plan, endsOn: s.endsAt, ended: false }), "billing_canceled");
  }
  if (s.status === "canceled" && (await claimEmailKey(`billing-ended:${s.subscriptionId}`))) {
    await send(to.email, subscriptionCanceledEmail({ name: to.name, plan: s.plan, endsOn: null, ended: true }), "billing_ended");
  }
}

/** "Payment failed" for one invoice, at most once. */
export async function notifyBillingPaymentFailed(userId: string, d: { invoiceId: string; amountCents: number | null; currency: string | null; plan: string | null }): Promise<void> {
  const to = await billingRecipient(userId);
  if (!to || !(await claimEmailKey(`billing-failed:${d.invoiceId}`))) return;
  const rows = await query<{ past_due_since: Date | null }>("select past_due_since from socialapp.billing_subscriptions where user_id=$1", [userId]);
  const graceEnds = graceEndsAt(rows[0]?.past_due_since ?? null);
  await send(to.email, subscriptionPaymentFailedEmail({ name: to.name, plan: d.plan, amountCents: d.amountCents, currency: d.currency, graceEnds }), "billing_failed");
}

/** UTC calendar month key, e.g. "2026-11". */
export function utcMonthKey(at: Date): string {
  return at.toISOString().slice(0, 7);
}

/**
 * "Your auto-DMs are paused" when a user hits the monthly auto-DM limit: at most one e-mail per user
 * per UTC month (email_sends key dm-limit:<user>:<YYYY-MM>, which is also the record that it happened).
 */
export async function notifyDmLimitReached(
  userId: string,
  d: { limit: number; plan: string; canUpgrade: boolean },
  now: Date = new Date(),
): Promise<void> {
  if (!(await claimEmailKey(`dm-limit:${userId}:${utcMonthKey(now)}`))) return;
  const to = await billingRecipient(userId);
  if (!to) return;
  const resetsOn = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  await send(to.email, dmLimitReachedEmail({ name: to.name, limit: d.limit, plan: d.plan, resetsOn, canUpgrade: d.canUpgrade }), "dm_limit");
}

/** Only channels that expired recently are e-mailed (no flood for accounts that expired long ago). */
export const RECONNECT_EMAIL_WINDOW_DAYS = 14;

/**
 * "Reconnect <network>" e-mails for every connected channel (Instagram, Threads, Facebook, TikTok,
 * LinkedIn, Pinterest, X, Bluesky, GBP, ...) whose access expired: the token jobs, the publisher and
 * the DM sender mark such accounts status='expired' (updated_at = when). One e-mail per expiry
 * (email_sends key reconnect:<account>:<updated_at>), so a reconnect followed by a new expiry
 * e-mails again. Run daily from the refresh-tokens job. Returns how many were sent.
 */
export async function notifyExpiredAccounts(limit = 100): Promise<number> {
  const rows = await query<{ id: string; platform: string; username: string | null; updated_at: Date; email: string; name: string | null }>(
    `select a.id, a.platform, a.username, a.updated_at, u.email, u.name
     from socialapp.social_accounts a join socialapp.users u on u.id = a.user_id
     where a.status = 'expired' and a.updated_at > now() - ($2::int * interval '1 day')
     order by a.updated_at limit $1`,
    [limit, RECONNECT_EMAIL_WINDOW_DAYS],
  );
  let sent = 0;
  for (const r of rows) {
    try {
      if (!(await claimEmailKey(`reconnect:${r.id}:${new Date(r.updated_at).toISOString()}`))) continue;
      const handle = r.username ? (r.platform === "instagram" || r.platform === "threads" ? `@${r.username}` : r.username) : null;
      await send(r.email, reconnectNeededEmail({ name: r.name, platform: PLATFORM_LABEL[r.platform] ?? r.platform, account: handle }), "reconnect");
      sent += 1;
    } catch (err) {
      console.error("[email:reconnect] failed for account", r.id, err instanceof Error ? err.message.slice(0, 160) : "unknown");
    }
  }
  return sent;
}
