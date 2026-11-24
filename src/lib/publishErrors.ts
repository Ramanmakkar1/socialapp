// Portions adapted from Postiz (https://github.com/gitroomhq/postiz-app), AGPL-3.0:
// the per-network known-error tables follow each Postiz provider's handleErrors().
//
// Turns a raw publish error (whatever the network or our own wrapper returned) into a category
// the worker can act on plus a plain-English reason for the user. The raw text is kept and shown
// as "Message from the network" next to the reason.
import { NETWORK_LABEL, isNetworkId } from "@/lib/networks/common";
import type { PublishErrorKind } from "@/lib/publishErrorKinds";

export { failureAction, KIND_SUMMARY, type FailureAction, type PublishErrorKind } from "@/lib/publishErrorKinds";

export type ClassifiedError = { kind: PublishErrorKind; message: string; raw: string };

type Rule = { m: string | RegExp; k: PublishErrorKind; msg: string };

const r = (m: string | RegExp, k: PublishErrorKind, msg: string): Rule => ({ m, k, msg });

const META_COMMON: Rule[] = [
  r("Error validating access token", "refresh_token", "Your access to this account expired. Reconnect it in Settings."),
  r("REVOKED_ACCESS_TOKEN", "refresh_token", "Access to this account was revoked. Reconnect it in Settings."),
  r('"error_subcode":33', "refresh_token", "Access to this account was revoked. Reconnect it in Settings."),
  r(/session has (been invalidated|expired)/i, "refresh_token", "Your session with Meta expired. Reconnect the account in Settings."),
  r("must be granted before impersonating", "refresh_token", "Page posting permission is missing. Reconnect and allow every permission."),
  r(/You cannot access the app till you log in to|Session key is malformed/, "reconnect", "Meta wants you to log in again on their site. Log in to Facebook/Instagram, then reconnect the account."),
  r("Page request limit reached", "rate_limit", "Meta limited posting for this Page today. It will be tried again later."),
  r("Sorry, something went wrong", "retry", "Meta is having a temporary problem."),
  r("An unknown error occurred", "retry", "Meta returned an unknown temporary error."),
  r("(#200)", "bad_body", "Meta refused the post because a permission is missing. Make sure your account has full control of the linked Page, then reconnect."),
  r("Not enough permissions to post", "bad_body", "This account is missing permission to post. Reconnect it and allow every permission."),
];

const RULES: Partial<Record<string, Rule[]>> = {
  instagram: [
    r("2207081", "bad_body", "This account doesn't support Trial Reels."),
    r("2207078", "rate_limit", "Instagram's Trial Reel limit is reached for this account. Post it as a regular Reel or wait."),
    r(/the user is not an instagram business/i, "refresh_token", "This Instagram account isn't a Business or Creator account any more. Switch it back, then reconnect."),
    r("2207050", "bad_body", "Instagram has restricted this account."),
    r("2207003", "retry", "Instagram timed out downloading the media."),
    r("2207020", "bad_body", "The media link expired. Upload the file again."),
    r("2207032", "retry", "Instagram failed to create the media."),
    r("2207053", "bad_body", "Instagram couldn't upload the video. Keep it under 300 MB, 1920 px wide and 25 Mbps, then try again."),
    r("2207052", "retry", "Instagram couldn't fetch the media."),
    r("2207057", "bad_body", "The video thumbnail position is invalid."),
    r("2207026", "bad_body", "Instagram doesn't support this video format. Use MP4 (H.264, AAC)."),
    r("2207023", "bad_body", "Instagram doesn't recognise this media type."),
    r("2207006", "bad_body", "Instagram couldn't find the media. Upload it again."),
    r("2207008", "retry", "Instagram's media session expired."),
    r("2207028", "bad_body", "Instagram rejected the carousel. Check every slide's size and format."),
    r("2207010", "bad_body", "The caption is too long for Instagram (2,200 characters max)."),
    r(/220703[5-7]|2207040/, "bad_body", "Instagram rejected the product tags on this post."),
    r("2207004", "bad_body", "The image is too large for Instagram (8 MB max)."),
    r("2207005", "bad_body", "Instagram doesn't support this image format. Use JPG or PNG."),
    r(/2207009|36003/, "bad_body", "Instagram doesn't support this aspect ratio. Use between 4:5 and 1.91:1."),
    r("36001", "bad_body", "The image resolution is too high for Instagram."),
    r("2207042", "rate_limit", "This account reached Instagram's limit of 25 posts per day."),
    r("2207051", "bad_body", "Instagram blocked this request to protect its community."),
    r("2207001", "bad_body", "Instagram flagged this post as spam. Change the content and try again."),
    r("2207082", "bad_body", "Instagram couldn't process this video's audio. Set the original volume to 0 if you added music to a silent video."),
    r("2207077", "retry", "Instagram failed to download the video."),
    r("2207027", "retry", "Instagram hadn't finished preparing the media."),
    r("too little or too many attachments", "bad_body", "An Instagram carousel needs between 2 and 10 items."),
    r("param collaborators is not allowed", "bad_body", "Instagram doesn't allow collaborators on carousels."),
    // Poskoo's own wrapper messages (src/lib/publisher.ts): nothing was published yet.
    r("Instagram is still processing the video", "retry", "Instagram was still processing the video."),
    r("190,", "refresh_token", "This account is missing permissions. Reconnect it and allow every permission."),
    ...META_COMMON,
  ],
  facebook: [
    r("1404078", "refresh_token", "Facebook needs you to re-authorise Page publishing. Reconnect in Settings."),
    r("1366046", "bad_body", "Facebook photos must be JPG or PNG and under 4 MB."),
    r("1390008", "rate_limit", "Facebook says you're posting too fast."),
    r("1346003", "bad_body", "Facebook flagged this content as abusive."),
    r("1404102", "bad_body", "Facebook says this content goes against its Community Standards."),
    r("2069019", "bad_body", "Facebook rejected the file."),
    r("1366051", "bad_body", "These photos were already posted to this Page."),
    r("1609008", "bad_body", "Facebook doesn't allow posting facebook.com links this way."),
    r("2061006", "bad_body", "A link in the post isn't a valid URL."),
    r("1349125", "bad_body", "Facebook rejected the post format."),
    r("Name parameter too long", "bad_body", "The post is too long for Facebook."),
    r(/1363047|1609010/, "retry", "Facebook is temporarily unavailable."),
    r("No permission to publish the video", "bad_body", "Facebook says this Page can't publish videos through the API."),
    ...META_COMMON,
  ],
  threads: [
    r("2207051", "bad_body", "Meta restricted this activity to protect its community."),
    r("4279013", "bad_body", "Threads has restricted this account."),
    r("4279047", "bad_body", "Threads rejected the link in this post. Check the link and try again."),
    r("The media could not be fetched from this URI", "bad_body", "Threads couldn't download the media. Upload the file again."),
    r("4279009", "retry", "Threads hadn't finished preparing the media."),
    r("text must be at most 500 characters", "bad_body", "Threads posts are limited to 500 characters."),
    ...META_COMMON,
  ],
  tiktok: [
    r("access_token_invalid", "refresh_token", "Your TikTok access expired. Reconnect TikTok in Settings."),
    r(/scope_not_authorized|scope_permission_missed/, "reconnect", "TikTok permissions are missing. Reconnect TikTok and allow every permission."),
    r("reached_active_user_cap", "reconnect", "TikTok's daily user limit for Poskoo was reached. Reconnect TikTok tomorrow."),
    r("spam_risk_too_many_posts", "rate_limit", "TikTok's daily post limit is reached for this account."),
    r("spam_risk_too_many_pending_share", "rate_limit", "TikTok allows 5 pending posts per 24 hours. Check the TikTok app inbox, then wait."),
    r("spam_risk_user_banned_from_posting", "bad_body", "TikTok has banned this account from posting."),
    r("spam_risk_text", "bad_body", "TikTok flagged the caption as possible spam."),
    r("spam_risk", "bad_body", "TikTok flagged this post as possible spam."),
    r("rate_limit_exceeded", "rate_limit", "TikTok's rate limit was reached."),
    r("file_format_check_failed", "bad_body", "TikTok rejected the file format. Use MP4 (H.264)."),
    r("duration_check_failed", "bad_body", "The video length isn't allowed by TikTok."),
    r("frame_rate_check_failed", "bad_body", "The video frame rate isn't allowed by TikTok."),
    r("picture_size_check_failed", "bad_body", "TikTok media size: images up to 1080 px on the short side, videos at least 360 px."),
    r(/video_pull_failed|photo_pull_failed/, "retry", "TikTok couldn't download the media."),
    r("unaudited_client_can_only_post_to_private_accounts", "bad_body", "TikTok hasn't approved Poskoo for public posts yet. Set the post to private (Only me) for now."),
    r("url_ownership_unverified", "bad_body", "TikTok couldn't verify the media domain."),
    r("privacy_level_option_mismatch", "bad_body", "That privacy option isn't available for this TikTok account. Pick another in the TikTok options."),
    r("app_version_check_failed", "bad_body", "Update the TikTok app on your phone, then try again."),
    r(/invalid_file_upload|invalid_params/, "bad_body", "TikTok rejected the upload. Check the media and options."),
  ],
  x: [
    r(/Unsupported Authentication|"title":"Unauthorized"/, "refresh_token", "X rejected the connection. Reconnect X in Settings."),
    r("Too Many Requests", "rate_limit", "X's rate limit was reached."),
    r("usage-capped", "rate_limit", "Poskoo's X posting quota is used up for now."),
    r("Service Unavailable", "retry", "X is temporarily unavailable."),
    r("maximum of one cashtag", "bad_body", "X allows only one cashtag ($SYMBOL) per post."),
    r("maximum of 4 items", "bad_body", "X allows at most 4 images per post."),
    r("You are not allowed to create a Tweet with duplicate content", "bad_body", "X refuses duplicate posts. Change the text."),
    r("user-suspended", "bad_body", "This X account is suspended."),
    r("Your account is temporarily locked", "reconnect", "This X account is temporarily locked. Unlock it on x.com, then reconnect."),
    r("The Tweet contains an invalid URL", "bad_body", "X doesn't allow one of the links in this post."),
    r("Crypto addresses are prohibited", "bad_body", "X doesn't allow crypto addresses in posts."),
    r("Your media IDs are invalid", "retry", "X lost track of the uploaded media."),
    r("Please include either text or media", "bad_body", "Add text or media to the X post."),
    r("You are not permitted to perform this action", "bad_body", "X doesn't allow this account to do that."),
  ],
  linkedin: [
    r(/Unable to obtain activity|resource is forbidden|Service Unavailable/, "retry", "LinkedIn is temporarily unavailable."),
    r(/REVOKED_ACCESS_TOKEN|EXPIRED_ACCESS_TOKEN|Invalid access token/i, "refresh_token", "Your LinkedIn access expired. Reconnect LinkedIn in Settings."),
  ],
  pinterest: [
    r("constraint: maxItems=5", "bad_body", "Pinterest allows at most 5 images per Pin."),
    r(/Something went wrong on our end|Unable to reach the URL/, "retry", "Pinterest is temporarily unavailable."),
    r("Board not found", "bad_body", "That Pinterest board was not found. Pick another board."),
    r("We blocked this link because it may lead to spam", "bad_body", "Pinterest blocked the link on this Pin."),
    r("You are not permitted to access that resource", "reconnect", "Pinterest refused access. Reconnect Pinterest in Settings."),
  ],
  youtube: [
    r(/invalidTags/, "bad_body", "YouTube tags are too long (500 characters in total)."),
    r(/invalidTitle/, "bad_body", "YouTube rejected the title (max 100 characters, no < or >)."),
    r(/invalidDescription/, "bad_body", "YouTube rejected the description (max 5,000 characters, no < or >)."),
    r(/invalidCategoryId/, "bad_body", "The YouTube category is invalid."),
    r(/uploadLimitExceeded|defaultVideoInsertPerDayPerProject/, "rate_limit", "YouTube's daily upload limit was reached."),
    r(/quotaExceeded|rateLimitExceeded|Quota exceeded/i, "rate_limit", "YouTube's API quota was reached."),
    r(/youtubeSignupRequired/, "reconnect", "This Google account has no YouTube channel yet. Create one, then reconnect."),
    r(/UNAUTHENTICATED|invalid_grant/, "refresh_token", "Your YouTube access expired. Reconnect YouTube in Settings."),
    // Poskoo's own wrapper messages (publishToYouTube): no upload had started.
    r(/Could not reach YouTube to refresh access|Could not download the video/, "retry", "Poskoo couldn't reach YouTube or download the video."),
  ],
  gbp: [
    r(/UNAUTHENTICATED|invalid_grant|PERMISSION_DENIED/, "refresh_token", "Your Google Business access expired. Reconnect it in Settings."),
    r("NOT_FOUND", "bad_body", "The business location wasn't found. It may have been removed."),
    r("INVALID_ARGUMENT", "bad_body", "Google rejected the post content. Check the post details."),
    r("RESOURCE_EXHAUSTED", "rate_limit", "Google's rate limit was reached."),
  ],
  discord: [
    r("50001", "bad_body", "The bot can't see this Discord channel."),
    r("50013", "bad_body", "The bot isn't allowed to post in this Discord channel."),
    r("10003", "bad_body", "This Discord channel no longer exists."),
    r("40005", "bad_body", "The attachment is larger than Discord allows."),
    r("20028", "rate_limit", "Discord's rate limit was reached."),
  ],
  tumblr: [
    r(/invalid_grant|invalid_token/, "refresh_token", "Your Tumblr access expired. Reconnect Tumblr in Settings."),
    r(/daily posting limit|8023/, "rate_limit", "Tumblr's daily posting limit was reached."),
  ],
  mastodon: [
    r("Your login is currently disabled", "reconnect", "Your Mastodon login is disabled. Check your server, then reconnect."),
    r("not finished processing", "retry", "Mastodon hadn't finished processing the media."),
  ],
  devto: [r("Canonical url has already been taken", "bad_body", "DEV already has a post with this canonical URL.")],
  wordpress: [r("rest_cannot_create", "bad_body", "The WordPress user can't create posts. Give it Author or Editor rights.")],
};

// Checked after the per-network rules, for every network.
const GENERIC: Rule[] = [
  // Our own wrappers report a dropped connection as "network: …": the request may have landed.
  r(/^network:|\bnetwork: |timed? ?out|aborted|ECONNRESET|socket hang up|fetch failed|UND_ERR/i, "ambiguous", "The connection dropped before the network confirmed the post."),
  r(/HTTP 429\b|Too Many Requests|rate.?limit/i, "rate_limit", "The network's rate limit was reached."),
  r(/HTTP 5\d\d\b|Service Unavailable|Bad Gateway|temporarily unavailable/i, "retry", "The network is temporarily unavailable."),
  r(/HTTP 401\b|OAuthException|invalid_token|access token|token (has )?expired/i, "refresh_token", "Your access to this account expired. Reconnect it in Settings."),
];

function hit(rule: Rule, raw: string): boolean {
  return typeof rule.m === "string" ? raw.includes(rule.m) : rule.m.test(raw);
}

function label(platform: string): string {
  if (isNetworkId(platform)) return NETWORK_LABEL[platform];
  return { instagram: "Instagram", facebook: "Facebook", threads: "Threads", youtube: "YouTube" }[platform] ?? platform;
}

/** Name the network in front of the reason ("Instagram: …") when the reason doesn't already. */
function withLabel(platform: string, msg: string): string {
  const name = label(platform);
  return msg.includes(name) ? msg : `${name}: ${msg}`;
}

/**
 * Classify a raw publish error. `tokenDead` is the adapter's own verdict (an explicit 401 / revoked
 * token): when nothing more specific matches it wins over the generic rules.
 */
export function classifyPublishError(platform: string, raw: string, opts: { tokenDead?: boolean; status?: number } = {}): ClassifiedError {
  const text = raw ?? "";
  for (const rule of RULES[platform] ?? []) {
    if (hit(rule, text)) return { kind: rule.k, message: withLabel(platform, rule.msg), raw: text };
  }
  if (opts.tokenDead) {
    return { kind: "refresh_token", message: `${label(platform)} access expired or was removed. Reconnect ${label(platform)} in Settings, then retry.`, raw: text };
  }
  // HTTP status from the network adapters (src/lib/networks/http.ts failed()).
  if (opts.status === 0) return { kind: "ambiguous", message: withLabel(platform, "The connection dropped before the network confirmed the post."), raw: text };
  if (opts.status === 429) return { kind: "rate_limit", message: withLabel(platform, "The network's rate limit was reached."), raw: text };
  if (opts.status !== undefined && opts.status >= 500) return { kind: "retry", message: withLabel(platform, "The network is temporarily unavailable."), raw: text };
  for (const rule of GENERIC) {
    if (hit(rule, text)) return { kind: rule.k, message: withLabel(platform, rule.msg), raw: text };
  }
  return { kind: "unknown", message: text ? withLabel(platform, text) : `${label(platform)} publishing failed.`, raw: text };
}
