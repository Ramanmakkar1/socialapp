// Pure helpers for the post composer: draft -> initial state, and the exact schedule instant.
// No React, no DB: safe to unit test.
import { PLATFORM_IDS, type PlatformId } from "@/lib/platforms";

export type ComposerDraftInitial = {
  id: string;
  caption: string;
  firstComment: string;
  tags: string[];
  platforms: string[];
  overrides: Partial<Record<PlatformId, string>>;
  mediaUrls: string[];
  igFormat: "feed" | "story";
  dmRuleId: string | null;
  /** Exact UTC instant (ISO string) or null. */
  scheduledAt: string | null;
  /** The post's status; scheduled posts open in the composer for editing too. */
  status?: "draft" | "scheduled";
  /** Saved per-network options (post_targets.net_options) keyed by platform. */
  netOptions?: Partial<Record<string, unknown>>;
};

export type ComposerState = {
  draftId: string | undefined;
  mainCaption: string;
  firstComment: string;
  tags: string[];
  enabled: Record<PlatformId, boolean>;
  customize: Record<PlatformId, boolean>;
  customCaption: Record<PlatformId, string>;
  mediaUrls: string[];
  igFormat: "feed" | "story";
  selectedRuleId: string;
};

/** Networks added 2026-11-11: restored from a draft like YouTube (enabled + custom caption). */
const NEW_NETWORKS: PlatformId[] = ["tiktok", "bluesky", "mastodon", "linkedin", "pinterest", "x", "gbp", "ig_personal", "fb_group"];
const LIVE: PlatformId[] = ["instagram", "youtube", ...NEW_NETWORKS];

function fill<T>(value: T, over: Partial<Record<PlatformId, T>> = {}): Record<PlatformId, T> {
  const out = {} as Record<PlatformId, T>;
  for (const p of PLATFORM_IDS) out[p] = over[p] ?? value;
  return out;
}

export function blankComposerState(): ComposerState {
  return {
    draftId: undefined,
    mainCaption: "",
    firstComment: "",
    tags: [],
    enabled: fill(false, { instagram: true }),
    customize: fill(false),
    customCaption: fill(""),
    mediaUrls: [""],
    igFormat: "feed",
    selectedRuleId: "",
  };
}

/**
 * Initial composer state for a saved draft (or a blank composer). Used as the lazy initial
 * state, so a draft opened directly by URL renders filled in on the very first render, and the
 * composer is keyed by draft id so switching drafts never shows the previous one (bug d).
 */
export function composerStateFromDraft(draft?: ComposerDraftInitial | null): ComposerState {
  if (!draft) return blankComposerState();
  const overrides = draft.overrides ?? {};
  const hasOverride = (p: PlatformId) => LIVE.includes(p) && Object.prototype.hasOwnProperty.call(overrides, p);
  return {
    draftId: draft.id,
    mainCaption: draft.caption ?? "",
    firstComment: draft.firstComment ?? "",
    tags: [...(draft.tags ?? [])],
    // A draft saved with no platform (or only "coming soon" ones) still opens with Instagram on.
    enabled: fill(false, {
      instagram: draft.platforms.includes("instagram") || draft.platforms.length === 0,
      youtube: draft.platforms.includes("youtube"),
      ...Object.fromEntries(NEW_NETWORKS.map((p) => [p, draft.platforms.includes(p)])),
    }),
    customize: fill(false, Object.fromEntries(LIVE.map((p) => [p, hasOverride(p)]))),
    customCaption: fill("", Object.fromEntries(LIVE.map((p) => [p, overrides[p] ?? ""]))),
    mediaUrls: draft.mediaUrls.length ? [...draft.mediaUrls] : [""],
    igFormat: draft.igFormat === "story" ? "story" : "feed",
    selectedRuleId: draft.dmRuleId ?? "",
  };
}

/** `YYYY-MM-DDTHH:mm` in the browser's (process's) local time zone, for <input type="datetime-local">. */
export function toLocalInputValue(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export type ScheduleOrigin = { local: string; iso: string };

/** The stored instant shown as a local input value, remembered so an untouched time saves unchanged. */
export function scheduleOrigin(iso: string | null | undefined): ScheduleOrigin | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return { local: toLocalInputValue(d), iso: d.toISOString() };
}

/**
 * The UTC instant to save for the schedule input (bug e). An untouched value keeps the
 * draft's exact stored instant (local wall times are ambiguous across DST and drop seconds).
 * A changed value is read in the local time zone and must round-trip (no DST-gap times).
 */
export function scheduleInstantForSave(
  localValue: string,
  origin: ScheduleOrigin | null,
): { ok: true; iso: string | null } | { ok: false } {
  if (!localValue) return { ok: true, iso: null };
  if (origin && origin.local === localValue) return { ok: true, iso: origin.iso };
  const d = new Date(localValue);
  if (Number.isNaN(d.getTime()) || toLocalInputValue(d) !== localValue) return { ok: false };
  return { ok: true, iso: d.toISOString() };
}
