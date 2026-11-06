// Pure helpers for the post composer: draft -> initial state, and the exact schedule instant.
// No React, no DB: safe to unit test.
import type { PlatformId } from "@/lib/platforms";

export type ComposerDraftInitial = {
  id: string;
  caption: string;
  firstComment: string;
  platforms: string[];
  overrides: Partial<Record<PlatformId, string>>;
  mediaUrls: string[];
  igFormat: "feed" | "story";
  dmRuleId: string | null;
  /** Exact UTC instant (ISO string) or null. */
  scheduledAt: string | null;
};

export type ComposerState = {
  draftId: string | undefined;
  mainCaption: string;
  firstComment: string;
  enabled: Record<PlatformId, boolean>;
  customize: Record<PlatformId, boolean>;
  customCaption: Record<PlatformId, string>;
  mediaUrls: string[];
  igFormat: "feed" | "story";
  selectedRuleId: string;
};

const LIVE: PlatformId[] = ["instagram"];

export function blankComposerState(): ComposerState {
  return {
    draftId: undefined,
    mainCaption: "",
    firstComment: "",
    enabled: { instagram: true, facebook: false, threads: false },
    customize: { instagram: false, facebook: false, threads: false },
    customCaption: { instagram: "", facebook: "", threads: "" },
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
    // A draft saved with no platform (or only "coming soon" ones) still opens with Instagram on.
    enabled: { instagram: draft.platforms.includes("instagram") || draft.platforms.length === 0, facebook: false, threads: false },
    customize: { instagram: hasOverride("instagram"), facebook: false, threads: false },
    customCaption: { instagram: overrides.instagram ?? "", facebook: "", threads: "" },
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
