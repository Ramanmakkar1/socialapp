// Server only: the "reminder" network adapter. Instead of calling a posting API it e-mails the
// owner the caption, media links, an "Open Instagram / Open group" link and a signed "Mark as
// posted" link. The target then waits in status 'reminded' (media kept, see mediaLifecycle) until
// the owner marks it as posted or REMINDER_MEDIA_HOLD_DAYS pass.
import { query } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { absoluteUrl, reminderEmail } from "@/lib/emailTemplates";
import { NETWORK_LABEL, type PublishInput, type PublishOutcome } from "@/lib/networks/common";
import {
  REMINDER_APP,
  REMINDER_LINK_DAYS,
  REMINDER_MEDIA_HOLD_DAYS,
  isReminderNetwork,
  mediaLinkLabel,
  reminderOpenUrl,
} from "@/lib/networks/reminder";
import { reminderSecret, signReminderToken } from "@/lib/networks/reminderToken";

const DAY_MS = 86_400_000;

export function reminderDoneUrl(targetId: string, nowMs = Date.now()): string | null {
  const secret = reminderSecret();
  if (!secret) return null;
  const token = signReminderToken(targetId, nowMs + REMINDER_LINK_DAYS * DAY_MS, secret);
  return absoluteUrl(`/api/reminders/done?t=${encodeURIComponent(token)}`);
}

/** NETWORKS[ig_personal | fb_group].publish: send the reminder e-mail. */
export async function publishReminder(input: PublishInput): Promise<PublishOutcome> {
  const platform = input.account.platform;
  if (!isReminderNetwork(platform)) return { ok: false, error: "Not a reminder channel." };
  const targetId = input.idempotencyKey ?? "";
  const rows = await query<{ email: string; name: string | null; scheduled_at: Date | null }>(
    `select u.email, u.name, p.scheduled_at from socialapp.post_targets t
     join socialapp.scheduled_posts p on p.id = t.post_id
     join socialapp.users u on u.id = p.user_id
     where t.id = $1`,
    [targetId],
  );
  const owner = rows[0];
  if (!owner?.email) return { ok: false, error: "No e-mail address on this Poskoo account to send the reminder to." };
  const doneUrl = reminderDoneUrl(targetId);
  if (!doneUrl) return { ok: false, error: "Reminder links are not set up on this server (TOKEN_ENCRYPTION_KEY missing)." };
  const app = REMINDER_APP[platform];
  const mail = reminderEmail({
    name: owner.name,
    channel: NETWORK_LABEL[platform],
    account: input.account.username ? (platform === "ig_personal" ? `@${input.account.username.replace(/^@/, "")}` : input.account.username) : app.place,
    caption: input.text,
    media: input.media.map((m, i) => ({ label: mediaLinkLabel(m.type, i), url: absoluteUrl(m.url) })),
    openLabel: platform === "ig_personal" ? "Open Instagram" : "Open group",
    openUrl: reminderOpenUrl(platform, input.account.meta),
    doneUrl,
    scheduledFor: owner.scheduled_at ? new Date(owner.scheduled_at) : null,
    holdDays: REMINDER_MEDIA_HOLD_DAYS,
  });
  const sent = await sendEmail({ to: owner.email, subject: mail.subject, html: mail.html, text: mail.text, tag: "post_reminder" });
  if (!sent.ok) return { ok: false, error: `Could not send the reminder e-mail (${sent.error}). Press Retry to send it again.` };
  return { ok: true, id: "reminder", reminded: true };
}

/** The reminder went out: the target waits for the owner; its files are kept for the hold period. */
export async function markReminded(targetId: string, accountId: string): Promise<void> {
  await query(
    `update socialapp.post_targets set status='reminded', error=null, published_at=null, external_post_id=null,
       social_account_id=$2, media_hold_until = now() + ($3::int * interval '1 day')
     where id=$1`,
    [targetId, accountId, REMINDER_MEDIA_HOLD_DAYS],
  );
}

/**
 * "Mark as posted" (signed link from the e-mail). Also accepted after the 7-day expiry, which
 * turns the unconfirmed target into a confirmed one. Returns the post id, or null when nothing matched.
 */
export async function markReminderPosted(targetId: string): Promise<{ postId: string; already: boolean } | null> {
  const rows = await query<{ post_id: string; was: string; ext: string | null }>(
    `update socialapp.post_targets t set status='published', external_post_id='reminder:confirmed', error=null,
       published_at=coalesce(case when t.external_post_id='reminder:confirmed' then t.published_at end, now()), media_hold_until=null
     from (select id, status as was, external_post_id as ext from socialapp.post_targets where id=$1) old
     where t.id = old.id and t.platform in ('ig_personal','fb_group')
       and (old.was = 'reminded' or (old.was = 'published' and old.ext like 'reminder:%'))
     returning t.post_id, old.was, old.ext`,
    [targetId],
  );
  const r = rows[0];
  if (!r) return null;
  return { postId: r.post_id, already: r.was === "published" && r.ext === "reminder:confirmed" };
}

/**
 * Reminders nobody confirmed within the hold: closed as published-unconfirmed so the post's files
 * can be released (the e-mail link still confirms it later). Runs with the publish job.
 */
export async function expireReminders(refreshPostStatus: (postId: string) => Promise<void>, limit = 50): Promise<number> {
  const rows = await query<{ post_id: string }>(
    `update socialapp.post_targets set status='published', external_post_id='reminder:unconfirmed', published_at=now(),
       media_hold_until=null, error=null
     where id in (select id from socialapp.post_targets where status='reminded' and media_hold_until < now() limit $1)
     returning post_id`,
    [limit],
  );
  for (const postId of new Set(rows.map((r) => r.post_id))) await refreshPostStatus(postId);
  return rows.length;
}
