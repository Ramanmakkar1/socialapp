/**
 * Template-based Instagram, TikTok and YouTube username ideas. No AI, no network, no randomness:
 * the same input always gives the same list in the same order.
 */

export type UsernameStyle = "clean" | "creative" | "business";
export type UsernamePlatform = "instagram" | "tiktok" | "youtube";

export type UsernameInput = {
  name: string;
  niche: string;
  style: UsernameStyle;
  platform?: UsernamePlatform;
};

export const USERNAME_MAX = 30;
export const PLATFORM_USERNAME_MAX: Record<UsernamePlatform, number> = { instagram: 30, tiktok: 24, youtube: 30 };
export const MAX_RESULTS = 30;

export const USERNAME_STYLES: { id: UsernameStyle; label: string }[] = [
  { id: "clean", label: "Clean (personal)" },
  { id: "creative", label: "Creative" },
  { id: "business", label: "Business / brand" },
];

/** Instagram, TikTok and YouTube usernames: letters, numbers, periods and underscores, within the platform limit. */
export function isValidInstagramUsername(u: string, max = USERNAME_MAX, minLength = 1): boolean {
  if (u.length < minLength || u.length > max) return false;
  if (!/^[a-z0-9._]+$/.test(u)) return false;
  if (u.startsWith(".") || u.endsWith(".")) return false;
  if (u.includes("..")) return false;
  return true;
}

/** Lowercase, strip accents, keep a-z 0-9 . _, collapse repeated periods, trim periods at the ends. */
export function sanitizeUsername(raw: string): string {
  return raw
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._]/g, "")
    .replace(/\.{2,}/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function words(text: string): string[] {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

type Parts = string[];

function stylePatterns(style: UsernameStyle, n: string, k: string): Parts[] {
  switch (style) {
    case "clean":
      return [
        [n],
        [n, ".", k],
        [n, "_", k],
        ["the", ".", n],
        ["its", ".", n],
        ["real", ".", n],
        ["hey", ".", n],
        [n, ".", "official"],
        ["by", ".", n],
        ["iam", ".", n],
      ];
    case "creative":
      return [
        ["hey", ".", n],
        ["its", n],
        [n, ".", "daily"],
        ["daily", ".", k],
        [n, ".", "creates"],
        ["the", ".", n, ".", k],
        [k, ".", "by", ".", n],
        [n, "_", "club"],
        [n, ".", "lab"],
        [k, "_", "with", "_", n],
      ];
    case "business":
      return [
        [n, ".", "co"],
        [n, "hq"],
        [n, ".", "studio"],
        [n, ".", k],
        [n, k, ".", "co"],
        ["the", n, ".", "co"],
        [n, "_", "official"],
        ["shop", ".", n],
        ["get", n],
        [k, ".", "studio"],
        [k, "hq"],
      ];
  }
}

function build(parts: Parts): string {
  // Drop empty name/niche parts and the separators next to them.
  const isSep = (p: string) => p === "." || p === "_";
  const out: string[] = [];
  for (const p of parts) {
    if (!p) continue;
    if (isSep(p) && (out.length === 0 || isSep(out[out.length - 1]))) continue;
    out.push(p);
  }
  while (out.length && isSep(out[out.length - 1])) out.pop();
  return out.join("");
}

export function generateUsernames(input: UsernameInput): string[] {
  const platform = input.platform ?? "instagram";
  const max = PLATFORM_USERNAME_MAX[platform];
  const minLength = platform === "youtube" ? 3 : platform === "tiktok" ? 2 : 1;
  const nameWords = words(input.name);
  const nicheWords = words(input.niche);
  // Keep base parts short so combined ideas still fit the platform limit.
  const nameJoined = nameWords.join("").slice(0, Math.min(18, max - 6));
  const nicheJoined = nicheWords.join("").slice(0, Math.min(14, max - 10));
  if (!nameJoined && !nicheJoined) return [];

  const n = nameJoined || nicheJoined;
  const k = nameJoined ? nicheJoined : "";

  const candidates: Parts[] = [];

  // Multi-word names: first.last style handles come first.
  if (nameWords.length >= 2) {
    const first = nameWords[0];
    const last = nameWords[nameWords.length - 1];
    candidates.push([first, ".", last], [first, "_", last], [first[0], ".", last], [first, ".", last[0]]);
  }

  const order: UsernameStyle[] = [input.style, ...(["clean", "creative", "business"] as UsernameStyle[]).filter((s) => s !== input.style)];
  for (const style of order) candidates.push(...stylePatterns(style, n, k));

  // Niche-only extras so a missing name still gives a full list.
  if (nicheJoined) {
    candidates.push(
      ["the", ".", nicheJoined],
      [nicheJoined, ".", "daily"],
      [nicheJoined, ".", "hq"],
      ["its", ".", nicheJoined],
      [nicheJoined, "_", "co"],
    );
  }

  const seen = new Set<string>();
  const results: string[] = [];
  for (const parts of candidates) {
    // Skip patterns that need a part we don't have (e.g. a niche combo with no niche).
    if (parts.some((p) => p === "")) continue;
    const u = sanitizeUsername(build(parts));
    if (!isValidInstagramUsername(u, max, minLength) || seen.has(u)) continue;
    seen.add(u);
    results.push(u);
    if (results.length >= MAX_RESULTS) break;
  }
  return results;
}
