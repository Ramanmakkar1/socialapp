// Planner view of the curated hashtag sets: tier, an ESTIMATED popularity band and competition per tag.
// Instagram has no public API for hashtag post counts (the Graph API hashtag search returns media only,
// limited to 30 unique hashtags per 7 days per account) and we never scrape, so popularity is a
// tier-based estimate, refined only for a few tags that are obviously among the largest on Instagram.
import { HASHTAG_SETS, buildHashtags, type HashtagMix } from "./hashtagSets";
import { formatForInstagram } from "./lineBreaks";

export type HashtagTier = "broad" | "mid" | "niche" | "custom";
export type Competition = "High" | "Medium" | "Low" | "Unrated";

export type PopularityBand = {
  /** Display label, e.g. "1M+". Always a range, never an exact count. */
  label: "100M+" | "1M+" | "100K–1M" | "10K–100K" | "Not rated";
  /** 0 (unrated) to 4 (largest), for bars and sorting. */
  level: 0 | 1 | 2 | 3 | 4;
};

export type PlannedHashtag = {
  tag: string;
  tier: HashtagTier;
  popularity: PopularityBand;
  competition: Competition;
};

export const POPULARITY_NOTE =
  "Popularity is an estimate based on tag size tiers, not a live Instagram count.";

// Very large general tags that are clearly far above 1M posts.
const MEGA_TAGS = new Set([
  "fitness", "food", "travel", "photography", "fashion", "art", "nature", "beauty", "style", "ootd", "makeup",
  "motivation", "photo", "love", "gym", "foodie",
]);

const TIER_BAND: Record<HashtagTier, PopularityBand> = {
  broad: { label: "1M+", level: 3 },
  mid: { label: "100K–1M", level: 2 },
  niche: { label: "10K–100K", level: 1 },
  custom: { label: "Not rated", level: 0 },
};
const TIER_COMPETITION: Record<HashtagTier, Competition> = { broad: "High", mid: "Medium", niche: "Low", custom: "Unrated" };

export const TIER_LABEL: Record<HashtagTier, string> = { broad: "Broad", mid: "Mid", niche: "Specific", custom: "Your keyword" };

/** Tier of a tag within a niche; tags added from the user's keyword are "custom". */
export function tierOf(niche: string, tag: string): HashtagTier {
  const sets = Object.hasOwn(HASHTAG_SETS, niche) ? HASHTAG_SETS[niche] : undefined;
  if (!sets) return "custom";
  if (sets.broad.includes(tag)) return "broad";
  if (sets.mid.includes(tag)) return "mid";
  if (sets.niche.includes(tag)) return "niche";
  return "custom";
}

export function popularityOf(tag: string, tier: HashtagTier): PopularityBand {
  if (tier === "broad" && MEGA_TAGS.has(tag)) return { label: "100M+", level: 4 };
  return TIER_BAND[tier];
}

/** Same deterministic set as buildHashtags, with planner columns attached. */
export function planHashtags(niche: string, opts: { count: number; mix: HashtagMix; extra?: string }): PlannedHashtag[] {
  return buildHashtags(niche, opts).map((tag) => {
    const tier = tierOf(niche, tag);
    return { tag, tier, popularity: popularityOf(tag, tier), competition: TIER_COMPETITION[tier] };
  });
}

/** Tags as one line, e.g. "#a #b". */
export const hashtagLine = (tags: string[]) => tags.map((t) => `#${t}`).join(" ");

/** Tags under three invisible spacer lines, ready to paste below a caption. */
export const captionBlock = (tags: string[]) => (tags.length ? formatForInstagram(`\n\n\n${hashtagLine(tags)}`) : "");

/** CSV with a header row; the popularity column is labelled as an estimate. */
export function hashtagCsv(rows: PlannedHashtag[], selected: Set<string>): string {
  const head = ["hashtag", "estimated_popularity", "tier", "competition", "selected"];
  const lines = rows.map((r) => [`#${r.tag}`, r.popularity.label, TIER_LABEL[r.tier], r.competition, selected.has(r.tag) ? "yes" : "no"]);
  return [head, ...lines].map((cols) => cols.map((c) => (/[",\n]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(",")).join("\n");
}
