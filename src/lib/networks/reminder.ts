// Pure (client-safe): reminder channels ("notification publishing", like Buffer's).
// Instagram personal accounts and Facebook Groups have no posting API (Meta never offered one for
// personal Instagram, and removed Groups publishing in April 2024). The user adds the @handle or the
// group as a channel without OAuth; at the scheduled time Poskoo e-mails the caption + media links
// and a "Mark as posted" link instead of publishing. No server-only imports here.

export const REMINDER_NETWORK_IDS = ["ig_personal", "fb_group"] as const;
export type ReminderNetworkId = (typeof REMINDER_NETWORK_IDS)[number];

export function isReminderNetwork(platform: unknown): platform is ReminderNetworkId {
  return typeof platform === "string" && (REMINDER_NETWORK_IDS as readonly string[]).includes(platform);
}

/** Which publish path a target takes: a network API, or a reminder e-mail. */
export function adapterKind(platform: string): "reminder" | "api" {
  return isReminderNetwork(platform) ? "reminder" : "api";
}

/** Media stays this long after the reminder e-mail unless the user marks the post as posted sooner. */
export const REMINDER_MEDIA_HOLD_DAYS = 7;
/** "Mark as posted" links keep working a while after the media hold ends. */
export const REMINDER_LINK_DAYS = 30;

/** The app name in the reminder e-mail ("Open Instagram"). */
export const REMINDER_APP: Record<ReminderNetworkId, { app: string; place: string }> = {
  ig_personal: { app: "Instagram", place: "your Instagram" },
  fb_group: { app: "Facebook", place: "the group" },
};

export type ReminderChannel = {
  /** Stored as social_accounts.external_id (unique per platform). */
  externalId: string;
  /** Shown in the sidebar / composer. */
  name: string;
  /** Opened from the reminder e-mail. */
  openUrl: string;
};

const IG_HANDLE = /^[a-z0-9._]{1,30}$/;

/**
 * "@name", "name" or an instagram.com/name link -> the channel, or an error to show.
 * Instagram usernames: letters, digits, "." and "_", up to 30 characters.
 */
export function parseInstagramHandle(raw: string): ReminderChannel | { error: string } {
  let s = raw.trim();
  const url = /^(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^/?#\s]+)/i.exec(s);
  if (url) s = url[1];
  s = s.replace(/^@/, "").toLowerCase();
  if (!s) return { error: "Enter your Instagram username, e.g. @yourname." };
  if (!IG_HANDLE.test(s) || s.startsWith(".") || s.endsWith(".")) {
    return { error: "That doesn't look like an Instagram username. Use letters, numbers, dots and underscores." };
  }
  return { externalId: s, name: `@${s}`, openUrl: `https://www.instagram.com/${s}/` };
}

/**
 * A Facebook group link (facebook.com/groups/<id or slug>) or just its name.
 * With a link the e-mail opens that group; with a name it opens the Groups feed.
 */
export function parseFacebookGroup(raw: string, nameHint = ""): ReminderChannel | { error: string } {
  const s = raw.trim();
  if (!s) return { error: "Enter the group's link or name." };
  const url = /^(?:https?:\/\/)?(?:www\.|m\.|web\.)?facebook\.com\/groups\/([A-Za-z0-9._-]{1,100})/i.exec(s);
  if (url) {
    const slug = url[1];
    const name = nameHint.trim().slice(0, 80) || (/^\d+$/.test(slug) ? "Facebook group" : slug.replace(/[._-]+/g, " "));
    return { externalId: `groups/${slug.toLowerCase()}`, name, openUrl: `https://www.facebook.com/groups/${slug}/` };
  }
  if (/^https?:\/\//i.test(s) || /facebook\.com/i.test(s)) {
    return { error: "Paste the group's link as it appears in the address bar, e.g. facebook.com/groups/yourgroup." };
  }
  const name = s.replace(/\s+/g, " ").slice(0, 80);
  if (name.length < 2) return { error: "Enter the group's link or name." };
  return { externalId: `name:${name.toLowerCase()}`, name, openUrl: "https://www.facebook.com/groups/feed/" };
}

export function parseReminderChannel(platform: ReminderNetworkId, raw: string, nameHint = ""): ReminderChannel | { error: string } {
  return platform === "ig_personal" ? parseInstagramHandle(raw) : parseFacebookGroup(raw, nameHint);
}

/** Where "Open Instagram / Open group" points, from the stored account meta. */
export function reminderOpenUrl(platform: ReminderNetworkId, meta: Record<string, unknown>): string {
  const u = typeof meta.openUrl === "string" ? meta.openUrl : "";
  if (/^https:\/\/(www\.)?(instagram|facebook)\.com\//.test(u)) return u;
  return platform === "ig_personal" ? "https://www.instagram.com/" : "https://www.facebook.com/groups/feed/";
}

/** File name for a media download link ("Photo 1", "Video 2"). */
export function mediaLinkLabel(type: "image" | "video", index: number): string {
  return `${type === "video" ? "Video" : "Photo"} ${index + 1}`;
}
