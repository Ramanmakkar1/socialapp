// Pure: per-network rules checked when a post is saved (composer and MCP), and the options stored
// in post_targets.net_options. Safe to import on the client (no server-only modules).
import type { MediaItem, NetworkId } from "@/lib/networks/common";
import { isExtraNetwork, extraMediaError } from "@/lib/networks/tokenNetworks";
import { DEST_OPTION, destOptionsError, gbpOptionsError, parseDestOptions, parseGbpOptions, parsePinterestOptions, parseTikTokOptions, pinterestOptionsError, tiktokOptionsError } from "@/lib/networks/options";

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

/** Options saved for a target; null when the network has none. */
export function normalizeNetOptions(platform: NetworkId, raw: unknown): Record<string, unknown> | null {
  if (platform === "tiktok") return parseTikTokOptions(raw);
  if (platform === "pinterest") return parsePinterestOptions(raw);
  if (platform === "gbp") return parseGbpOptions(raw);
  if (DEST_OPTION[platform]) return parseDestOptions(raw);
  if (platform === "linkedin") {
    const a = obj(raw).author;
    const author = typeof a === "string" ? a.trim() : "";
    return author.startsWith("urn:li:organization:") ? { author } : null;
  }
  return null;
}

/**
 * The first problem with this network's part of the post, or null. Drafts only need valid options;
 * media rules are enforced when scheduling (like Instagram's "needs an image" rule).
 */
export function networkTargetError(platform: NetworkId, media: MediaItem[], rawOptions: unknown, scheduling: boolean): string | null {
  const videos = media.filter((m) => m.type === "video").length;
  const images = media.length - videos;
  switch (platform) {
    case "tiktok":
      return scheduling ? tiktokOptionsError(parseTikTokOptions(rawOptions), media) : null;
    case "pinterest": {
      const opts = parsePinterestOptions(rawOptions);
      if (!scheduling) return null;
      return pinterestOptionsError(opts, images, videos > 0);
    }
    case "bluesky":
      if (videos > 0) return "Bluesky posts from Poskoo support images only for now. Remove the video or untick Bluesky.";
      if (images > 4) return "Bluesky takes up to 4 images per post.";
      return null;
    case "x":
      if (videos > 1 || (videos === 1 && images > 0)) return "X takes one video, or up to 4 images.";
      if (images > 4) return "X takes up to 4 images per post.";
      return null;
    case "mastodon":
      if (videos > 0 && media.length > 1) return "Mastodon takes one video, or up to 4 images.";
      if (media.length > 4) return "Mastodon takes up to 4 attachments per post.";
      return null;
    case "gbp":
      return scheduling ? gbpOptionsError(parseGbpOptions(rawOptions), media) : null;
    case "linkedin":
      if (videos > 0) return "LinkedIn posts from Poskoo support text and images for now. Remove the video or untick LinkedIn.";
      return null;
    case "ig_personal":
    case "fb_group":
      // Reminder channels: the owner posts it by hand, so any caption / media mix is fine.
      return null;
    default: {
      // Reddit / Whop: where the post goes (checked on drafts too, so a typo shows early).
      const destError = DEST_OPTION[platform] ? destOptionsError(platform, parseDestOptions(rawOptions)) : null;
      if (destError && (scheduling || parseDestOptions(rawOptions).dest)) return destError;
      return isExtraNetwork(platform) ? extraMediaError(platform, media, scheduling) : null;
    }
  }
}
