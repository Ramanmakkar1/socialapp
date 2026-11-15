// Pure helpers shared by the AI campaign builder and "Tailor per network": per-network writing
// conventions for the prompt, and a last-resort trim so an AI caption always passes the same
// checkCaption limits the composer and savePostForUser enforce.
import { checkCaption, captionLength, PLATFORMS, type PlatformId } from "@/lib/platforms";

/** How each network's captions are usually written. Unknown ids fall back to the length limit only. */
const NETWORK_STYLE: Partial<Record<string, string>> = {
  instagram: "Strong hook in the first line (before the “more” cut), short paragraphs with line breaks, a clear call to action, 3-8 relevant hashtags at the end.",
  facebook: "Conversational, 1-3 short paragraphs, a question or call to action, at most 2 hashtags.",
  threads: "Conversational and short, like talking to a friend, at most 1 hashtag.",
  youtube: "A video description: first two lines summarise the video, then details and a call to action, a few hashtags at the end.",
  tiktok: "Very short hook plus 3-5 hashtags, casual tone.",
  bluesky: "Short and direct, plain text, at most 1-2 hashtags.",
  mastodon: "Plain and friendly, hashtags in CamelCase at the end (they are how people find posts there), no engagement bait.",
  linkedin: "Professional but human: hook line, short paragraphs with line breaks, one takeaway or question, at most 3 hashtags at the end.",
  pinterest: "A keyword-rich description of what the pin shows and why to click, no hashtags.",
  gbp: "A local business update: what is new or on offer, when, and a clear next step. No hashtags.",
  x: "Punchy single thought, at most 1-2 hashtags, links count as 23 characters.",
  ig_personal: "Same as Instagram: hook first, line breaks, hashtags at the end.",
  fb_group: "Conversational and helpful, no hard selling, no hashtags.",
};

export function isKnownPlatform(id: string): id is PlatformId {
  return Object.prototype.hasOwnProperty.call(PLATFORMS, id);
}

/** One prompt line per network: its name, hard limit and conventions. */
export function networkGuide(platform: PlatformId, maxOverride?: number | null): string {
  const config = PLATFORMS[platform];
  const max = typeof maxOverride === "number" && maxOverride > 0 ? maxOverride : config.captionMax;
  const tags = "hashtagMax" in config ? `, max ${config.hashtagMax} hashtags` : "";
  const style = NETWORK_STYLE[platform] ?? "Follow the network's usual style.";
  return `- ${platform} (${config.label}): hard limit ${max} characters${tags}. ${style}`;
}

const HASHTAG_RE = /\s*#[\p{L}\p{N}_]+/gu;

function graphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    return Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/**
 * Makes `text` pass checkCaption for `platform`: drops trailing hashtags over the network's
 * hashtag limit, then trims at a word boundary and adds "…" until it fits. Text that already
 * passes is returned unchanged.
 */
export function fitCaption(platform: PlatformId, text: string, maxOverride?: number | null): string {
  let out = text.trim();
  if (checkCaption(platform, out, maxOverride).errors.length === 0) return out;
  const config = PLATFORMS[platform];
  if ("hashtagMax" in config) {
    let tags = [...out.matchAll(HASHTAG_RE)].length;
    while (tags > config.hashtagMax) {
      const matches = [...out.matchAll(HASHTAG_RE)];
      const last = matches[matches.length - 1];
      if (!last || last.index === undefined) break;
      out = (out.slice(0, last.index) + out.slice(last.index + last[0].length)).trimEnd();
      tags--;
    }
  }
  const max = typeof maxOverride === "number" && maxOverride > 0 ? maxOverride : config.captionMax;
  if (captionLength(platform, out) <= max) return out;
  const parts = graphemes(out);
  let lo = 0;
  let hi = parts.length;
  // Longest prefix that fits with the ellipsis (binary search: X weights characters unevenly).
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (captionLength(platform, parts.slice(0, mid).join("").trimEnd() + "…") <= max) lo = mid;
    else hi = mid - 1;
  }
  let cut = parts.slice(0, lo).join("");
  const space = cut.search(/\s\S*$/);
  if (space > cut.length * 0.6) cut = cut.slice(0, space);
  return cut.trimEnd() + "…";
}
