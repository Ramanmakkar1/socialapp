// Server only: the app's e-mail notifications. Every function here never throws (failures are
// logged) and none of them should be awaited on a user's request path: wrap calls in inBackground().
import { after } from "next/server";
import { claimEmailKey, issueCode } from "@/lib/authEmail";
import { query } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  absoluteUrl,
  buyerReceiptEmail,
  newDeviceEmail,
  newOrderEmail,
  passwordChangedEmail,
  postFailedEmail,
  referralBonusEmail,
  subscriptionCanceledEmail,
  subscriptionPaymentFailedEmail,
  subscriptionStartedEmail,
  verifyEmail,
  welcomeEmail,
  type RenderedEmail,
} from "@/lib/emailTemplates";
import { maskEmail } from "@/lib/referrals";
import { graceEndsAt } from "@/lib/billingState";

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
