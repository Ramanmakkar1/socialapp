// Pure (client-safe): the per-network composer options stored in post_targets.net_options and their
// validation, shared by the composer, savePost and the publishers. No server-only imports here.
import type { MediaItem } from "@/lib/networks/common";

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export type TikTokPrivacy = "PUBLIC_TO_EVERYONE" | "MUTUAL_FOLLOW_FRIENDS" | "FOLLOWER_OF_CREATOR" | "SELF_ONLY";
export const PRIVACY_VALUES: TikTokPrivacy[] = ["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "FOLLOWER_OF_CREATOR", "SELF_ONLY"];

export const TIKTOK_PRIVACY_LABEL: Record<TikTokPrivacy, string> = {
  PUBLIC_TO_EVERYONE: "Everyone",
  MUTUAL_FOLLOW_FRIENDS: "Friends",
  FOLLOWER_OF_CREATOR: "Followers",
  SELF_ONLY: "Only me",
};

/** The per-target options chosen in the composer (post_targets.net_options.tiktok). */
export type TikTokOptions = {
  /** "direct" = Direct Post (video.publish); "inbox" = send to the TikTok inbox as a draft (video.upload). */
  mode: "direct" | "inbox";
  privacyLevel: TikTokPrivacy | "";
  allowComment: boolean;
  allowDuet: boolean;
  allowStitch: boolean;
  /** "Disclose video content" switch. */
  commercial: boolean;
  /** "Your brand": promoting yourself or your own business (brand_organic_toggle). */
  yourBrand: boolean;
  /** "Branded content": a paid partnership for a third party (brand_content_toggle). */
  brandedContent: boolean;
  isAigc: boolean;
};

export function parseTikTokOptions(raw: unknown): TikTokOptions {
  const o = obj(raw);
  const privacy = PRIVACY_VALUES.includes(o.privacyLevel as TikTokPrivacy) ? (o.privacyLevel as TikTokPrivacy) : "";
  const commercial = o.commercial === true;
  return {
    mode: o.mode === "inbox" ? "inbox" : "direct",
    privacyLevel: privacy,
    allowComment: o.allowComment === true,
    allowDuet: o.allowDuet === true,
    allowStitch: o.allowStitch === true,
    commercial,
    yourBrand: commercial && o.yourBrand === true,
    brandedContent: commercial && o.brandedContent === true,
    isAigc: o.isAigc === true,
  };
}

/** Shared composer + save validation (TikTok Content Sharing Guidelines). Returns an error or null. */
export function tiktokOptionsError(opts: TikTokOptions, media: MediaItem[]): string | null {
  const videos = media.filter((m) => m.type === "video").length;
  const images = media.filter((m) => m.type === "image").length;
  if (videos > 1 || (videos === 1 && images > 0)) return "TikTok takes one video, or up to 35 photos.";
  if (videos === 0 && images === 0) return "TikTok posts need a video or at least one photo.";
  if (images > 35) return "TikTok photo posts take up to 35 photos.";
  if (opts.mode === "inbox") return null;
  if (!opts.privacyLevel) return "Choose who can see the TikTok post (TikTok requires you to pick it yourself).";
  if (opts.commercial && !opts.yourBrand && !opts.brandedContent) {
    return "You turned on TikTok content disclosure: choose “Your brand”, “Branded content” or both.";
  }
  if (opts.brandedContent && opts.privacyLevel === "SELF_ONLY") {
    return "Branded content on TikTok can't be private. Choose another visibility.";
  }
  return null;
}

/** TikTok's required consent sentence, shown above the publish button (with links). */
export function tiktokConsentText(opts: Pick<TikTokOptions, "brandedContent">): string {
  return opts.brandedContent
    ? "By posting, you agree to TikTok's Branded Content Policy and Music Usage Confirmation."
    : "By posting, you agree to TikTok's Music Usage Confirmation.";
}

export const PINTEREST_TITLE_MAX = 100;
export const PINTEREST_DESCRIPTION_MAX = 500;

export type PinterestOptions = { boardId: string; title: string; link: string };

export function parsePinterestOptions(raw: unknown): PinterestOptions {
  const o = obj(raw);
  return { boardId: str(o.boardId).trim(), title: str(o.title).trim(), link: str(o.link).trim() };
}

export function pinterestOptionsError(opts: PinterestOptions, imageCount: number, hasVideo: boolean): string | null {
  if (!opts.boardId) return "Pick the Pinterest board to pin to.";
  if (Array.from(opts.title).length > PINTEREST_TITLE_MAX) return `The Pinterest title must be ${PINTEREST_TITLE_MAX} characters or fewer.`;
  if (opts.link) {
    try {
      const u = new URL(opts.link);
      if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error("bad");
    } catch {
      return "The Pinterest link must be a full web address (https://…).";
    }
  }
  if (hasVideo) return "Pinterest pins from Poskoo support images for now. Remove the video or untick Pinterest.";
  if (imageCount === 0) return "A Pinterest pin needs an image.";
  return null;
}


// Google Business Profile local posts (v4 localPosts): Update (STANDARD), Offer, Event.
export const GBP_SUMMARY_MAX = 1500;
export const GBP_TITLE_MAX = 58;
export type GbpPostType = "STANDARD" | "OFFER" | "EVENT";
export type GbpCta = "" | "BOOK" | "ORDER" | "SHOP" | "LEARN_MORE" | "SIGN_UP" | "CALL";
export const GBP_CTA_LABEL: Record<Exclude<GbpCta, "">, string> = {
  BOOK: "Book",
  ORDER: "Order online",
  SHOP: "Buy",
  LEARN_MORE: "Learn more",
  SIGN_UP: "Sign up",
  CALL: "Call now",
};
export const GBP_TYPE_LABEL: Record<GbpPostType, string> = { STANDARD: "Update", OFFER: "Offer", EVENT: "Event" };

export type GbpOptions = {
  type: GbpPostType;
  /** Offer / event title. */
  title: string;
  /** YYYY-MM-DD, and optional HH:MM (events). */
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  couponCode: string;
  redeemUrl: string;
  terms: string;
  cta: GbpCta;
  ctaUrl: string;
};

const GBP_CTAS: GbpCta[] = ["BOOK", "ORDER", "SHOP", "LEARN_MORE", "SIGN_UP", "CALL"];
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function parseGbpOptions(raw: unknown): GbpOptions {
  const o = obj(raw);
  const type = o.type === "OFFER" || o.type === "EVENT" ? o.type : "STANDARD";
  const cta = GBP_CTAS.includes(o.cta as GbpCta) ? (o.cta as GbpCta) : "";
  const date = (v: unknown) => (DATE_RE.test(str(v)) ? str(v) : "");
  const time = (v: unknown) => (TIME_RE.test(str(v)) ? str(v) : "");
  return {
    type,
    title: str(o.title).trim().slice(0, 200),
    startDate: date(o.startDate),
    startTime: time(o.startTime),
    endDate: date(o.endDate),
    endTime: time(o.endTime),
    couponCode: str(o.couponCode).trim().slice(0, 100),
    redeemUrl: str(o.redeemUrl).trim().slice(0, 2000),
    terms: str(o.terms).trim().slice(0, 5000),
    cta,
    ctaUrl: cta === "CALL" ? "" : str(o.ctaUrl).trim().slice(0, 2000),
  };
}

function isWebUrl(u: string): boolean {
  try {
    const p = new URL(u);
    return p.protocol === "https:" || p.protocol === "http:";
  } catch {
    return false;
  }
}

/** Rules for a Google Business Profile post (Google rejects these server-side otherwise). */
export function gbpOptionsError(opts: GbpOptions, media: MediaItem[]): string | null {
  if (media.some((m) => m.type === "video")) return "Google Business Profile posts take one photo, not a video.";
  if (media.length > 1) return "Google Business Profile posts take one photo. Remove the extra images or untick Google Business Profile.";
  if (opts.type !== "STANDARD") {
    const what = opts.type === "OFFER" ? "offer" : "event";
    if (!opts.title) return `Add a title for the ${what}.`;
    if (Array.from(opts.title).length > GBP_TITLE_MAX) return `The ${what} title must be ${GBP_TITLE_MAX} characters or fewer.`;
    if (!opts.startDate || !opts.endDate) return `Add the start and end dates of the ${what}.`;
    if (`${opts.endDate}T${opts.endTime || "23:59"}` < `${opts.startDate}T${opts.startTime || "00:00"}`) return `The ${what} ends before it starts.`;
  }
  if (opts.type === "OFFER" && opts.redeemUrl && !isWebUrl(opts.redeemUrl)) return "The offer's redeem link must be a full web address (https://…).";
  if (opts.cta && opts.cta !== "CALL" && !isWebUrl(opts.ctaUrl)) return "Add the web address for the button (https://…).";
  return null;
}
