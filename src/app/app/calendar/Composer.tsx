"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AtSign, Facebook, Instagram, Sparkles, Youtube as YouTube } from "lucide-react";
import { nextAvailableSlot, savePost } from "./actions";
import PublishingChecklist, { type ChecklistFixTarget } from "./PublishingChecklist";
import { aiAvailable, suggestCaptions } from "./aiActions";
import { BRAND } from "@/lib/brand";
import type { CaptionIdea } from "@/lib/ai";
import { countChars, PLATFORM_LIMITS } from "@/lib/captionLimits";
import { PLATFORMS, checkCaption, type PlatformId } from "@/lib/platforms";
import {
  blankComposerState,
  composerStateFromDraft,
  scheduleInstantForSave,
  scheduleOrigin,
  toLocalInputValue,
  type ComposerDraftInitial,
  type ScheduleOrigin,
} from "@/lib/composerDraft";
import { dayPrefill } from "@/lib/composerUrl";
import ui from "@/components/ui/ui.module.css";

const PLATFORM_ORDER: PlatformId[] = ["instagram", "facebook", "threads", "youtube"];
const HANDLE = `@${BRAND.name.toLowerCase()}`;

const PLATFORM_ICON: Record<PlatformId, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  threads: AtSign,
  youtube: YouTube,
};

function counterClass(length: number, max: number): string {
  if (length > max) return "text-[var(--poskoo-coral)]";
  if (length >= max * 0.9) return "text-[var(--poskoo-coral)]";
  return "text-[var(--poskoo-muted)]";
}

function previewCaption(platform: PlatformId, text: string): string {
  if (platform !== "instagram") return text;
  if (text.length <= 125) return text;
  return `${text.slice(0, 125)}… more`;
}

function effectiveCaption(
  platform: PlatformId,
  main: string,
  customize: Record<PlatformId, boolean>,
  custom: Record<PlatformId, string>,
): string {
  return customize[platform] ? custom[platform] : main;
}

type RuleOption = { id: string; name: string; status: string };
export type { ComposerDraftInitial };

function nextSlotLocal(hourUtc: number): Date {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hourUtc, 0, 0));
  if (d.getTime() <= now.getTime() + 15 * 60_000) d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

export default function Composer({ rules = [], bestHoursUtc = [], initialDraft, initialIdea, facebookReady = false, threadsReady = false, schedulePlatforms = [], youtubeReady = false }: { rules?: RuleOption[]; bestHoursUtc?: number[]; initialDraft?: ComposerDraftInitial; initialIdea?: { id: string; caption: string; mediaUrls: string[] }; facebookReady?: boolean; threadsReady?: boolean; schedulePlatforms?: string[]; youtubeReady?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const livePlatforms: PlatformId[] = ["instagram"];
  if (facebookReady) livePlatforms.push("facebook");
  if (threadsReady) livePlatforms.push("threads");
  if (youtubeReady) livePlatforms.push("youtube");
  // Lazy initial state from the draft: the page keys this component by draft id, so a draft
  // opened by URL is filled in on the first render and switching drafts remounts cleanly.
  const [init] = useState(() => {
    if (initialIdea && !initialDraft) {
      const blank = blankComposerState();
      return {
        ...blank,
        mainCaption: initialIdea.caption,
        mediaUrls: initialIdea.mediaUrls.length ? [...initialIdea.mediaUrls] : [""],
      };
    }
    return composerStateFromDraft(initialDraft);
  });
  const [draftId, setDraftId] = useState(init.draftId);
  // The stored instant of the draft's schedule, so an untouched time saves exactly unchanged.
  const scheduleOriginRef = useRef<ScheduleOrigin | null>(null);
  const mainId = useId();
  const platformsFocusId = useId();
  const customCaptionId = useId();
  const firstCommentId = useId();
  const scheduleId = useId();
  const dmRuleId = useId();
  const imageId = useId();
  const igFormatLegendId = useId();
  const aiTopicId = useId();
  const aiToneId = useId();
  const ytTitleId = useId();
  const ytTagsId = useId();
  const ytPrivacyId = useId();

  const [enabled, setEnabled] = useState<Record<PlatformId, boolean>>(init.enabled);
  const [activeTab, setActiveTab] = useState<PlatformId>("instagram");
  const [mainCaption, setMainCaption] = useState(init.mainCaption);
  const [firstComment, setFirstComment] = useState(init.firstComment);
  const [customize, setCustomize] = useState<Record<PlatformId, boolean>>(init.customize);
  const [customCaption, setCustomCaption] = useState<Record<PlatformId, string>>(init.customCaption);
  const [mediaUrls, setMediaUrls] = useState<string[]>(init.mediaUrls);
  const [igFormat, setIgFormat] = useState<"feed" | "story">(init.igFormat);
  const [selectedRuleId, setSelectedRuleId] = useState(init.selectedRuleId);
  const [scheduledAt, setScheduledAt] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [ytTitle, setYtTitle] = useState("");
  const [ytTags, setYtTags] = useState("");
  const [ytPrivacy, setYtPrivacy] = useState<"public" | "unlisted" | "private">("public");
  const [ytShorts, setYtShorts] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [aiOn, setAiOn] = useState<boolean | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("friendly");
  const [aiIdeas, setAiIdeas] = useState<CaptionIdea[]>([]);
  const [aiError, setAiError] = useState("");
  const [aiPending, startAiTransition] = useTransition();

  const calendarHrefWithoutDraft = useCallback(
    (hash = "#new") => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("draft");
      params.delete("idea");
      const query = params.toString();
      return query ? `/app/calendar?${query}${hash}` : `/app/calendar${hash}`;
    },
    [searchParams],
  );

  const resetComposerForNewPost = useCallback(() => {
    const blank = blankComposerState();
    setMainCaption(blank.mainCaption);
    setFirstComment(blank.firstComment);
    setCustomCaption(blank.customCaption);
    setMediaUrls(blank.mediaUrls);
    setIgFormat(blank.igFormat);
    setSelectedRuleId(blank.selectedRuleId);
    setCustomize(blank.customize);
    setEnabled(blank.enabled);
    setActiveTab("instagram");
    setScheduledAt("");
    setDraftId(undefined);
    setYtTitle("");
    setYtTags("");
    setYtPrivacy("public");
    setYtShorts(false);
    setAiOpen(false);
    setAiTopic("");
    setAiTone("friendly");
    setAiIdeas([]);
    setAiError("");
    scheduleOriginRef.current = null;
  }, []);

  const draftScheduledAt = initialDraft?.scheduledAt ?? null;
  useEffect(() => {
    // Client-only: the local wall time depends on the browser time zone (server renders UTC).
    const origin = scheduleOrigin(draftScheduledAt);
    scheduleOriginRef.current = origin;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser time zone is only known after hydration
    if (origin) setScheduledAt(origin.local);
  }, [draftScheduledAt]);

  // "+" on a calendar day opens /app/calendar?compose=1&day=YYYY-MM-DD: pre-fill that day's time.
  const dayParam = searchParams.get("day");
  const hasDraft = Boolean(initialDraft) || Boolean(initialIdea);
  useEffect(() => {
    if (hasDraft) return;
    const at = dayPrefill(dayParam);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- local wall time is only known in the browser
    if (at) setScheduledAt(toLocalInputValue(at));
  }, [dayParam, hasDraft]);

  useEffect(() => {
    // Client-only: avoids SSR UTC vs browser timezone hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- boss-mandated pattern for #new composer
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  useEffect(() => {
    let active = true;
    aiAvailable()
      .then((available) => {
        if (active) setAiOn(available);
      })
      .catch(() => {
        if (active) setAiOn(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function togglePlatform(platform: PlatformId) {
    if (!livePlatforms.includes(platform)) return;
    const next = { ...enabled, [platform]: !enabled[platform] };
    setEnabled(next);
    if (platform === "instagram" && !next.instagram) {
      setIgFormat("feed");
    }
    if (!next[platform] && activeTab === platform) {
      const fallback = PLATFORM_ORDER.find((p) => next[p]);
      if (fallback) setActiveTab(fallback);
    }
  }

  const selected = PLATFORM_ORDER.filter((p) => enabled[p]);
  // "Add to queue" / "Next available" need at least one selected channel with a saved schedule.
  const queueReady = selected.some((p) => schedulePlatforms.includes(p));

  function buildSaveInput(mode: "draft" | "schedule" | "queue") {
    const schedule = scheduleInstantForSave(scheduledAt, scheduleOriginRef.current);
    if (!schedule.ok) return null;
    if (mode === "schedule" && !schedule.iso) return null;
    const platforms = PLATFORM_ORDER.filter((p) => enabled[p]);
    const overrides: Partial<Record<string, string>> = {};
    for (const p of platforms) {
      if (customize[p]) {
        overrides[p] = customCaption[p];
      }
    }
    return {
      draftId,
      caption: mainCaption,
      firstComment,
      platforms,
      overrides,
      // "queue" lets the server pick the next free slot, so no client time is sent.
      scheduledAt: mode === "queue" ? null : schedule.iso,
      mode,
      imageUrl: mediaUrls[0]?.trim() !== "" ? mediaUrls[0].trim() : null,
      mediaUrls,
      dmRuleId: selectedRuleId || null,
      igFormat: enabled.instagram ? igFormat : "feed",
      ytTitle: enabled.youtube ? ytTitle : undefined,
      ytTags: enabled.youtube ? ytTags.split(",").map((t) => t.trim()).filter((t) => t !== "") : undefined,
      ytPrivacy: enabled.youtube ? ytPrivacy : undefined,
      ytShorts: enabled.youtube ? ytShorts : undefined,
    };
  }

  const filledMediaCount = mediaUrls.map((u) => u.trim()).filter((u) => u !== "").length;
  const storyMediaError =
    enabled.instagram && igFormat === "story" && filledMediaCount > 1;

  function focusChecklistTarget(target: ChecklistFixTarget) {
    const focusEl = (id: string | undefined) => {
      if (!id) return;
      const el = document.getElementById(id);
      if (el && "focus" in el) {
        el.focus({ preventScroll: false });
      }
    };
    switch (target.kind) {
      case "platforms":
        focusEl(platformsFocusId);
        break;
      case "mainCaption":
        focusEl(mainId);
        break;
      case "firstComment":
        focusEl(firstCommentId);
        break;
      case "media":
        focusEl(imageId);
        break;
      case "schedule":
        focusEl(scheduleId);
        break;
      case "igFormat": {
        const fieldset = document.getElementById(igFormatLegendId);
        fieldset?.focus();
        break;
      }
      case "platformCaption":
        setActiveTab(target.platform);
        requestAnimationFrame(() => {
          focusEl(`${customCaptionId}-${target.platform}`);
        });
        break;
    }
  }

  function handleSave(mode: "draft" | "schedule" | "queue") {
    setFeedback(null);
    const input = buildSaveInput(mode);
    if (!input) {
      setFeedback({ kind: "err", text: "Choose a valid local date and time before saving." });
      return;
    }
    const editingDraftId = draftId;
    startTransition(async () => {
      let result;
      try {
        result = await savePost(input);
      } catch {
        setFeedback({ kind: "err", text: "Could not save your post. Your changes are still here. Please try again." });
        return;
      }
      if (!result.ok) {
        setFeedback({ kind: "err", text: result.error });
        return;
      }
      if (mode === "draft") {
        setFeedback({ kind: "ok", text: "Draft saved" });
      } else if (mode === "queue") {
        setFeedback({ kind: "ok", text: "Added to the queue — it will publish at the next free slot." });
      } else {
        const when = input.scheduledAt
          ? new Date(input.scheduledAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "";
        setFeedback({ kind: "ok", text: `Scheduled for ${when}` });
      }
      resetComposerForNewPost();
      if (editingDraftId || initialIdea) {
        router.replace(calendarHrefWithoutDraft());
      }
      router.refresh();
    });
  }

  // "Next available": fill the time picker with the next free slot from the channel schedules.
  function handleNextAvailable() {
    setFeedback(null);
    const platforms = PLATFORM_ORDER.filter((p) => enabled[p]);
    startTransition(async () => {
      try {
        const result = await nextAvailableSlot(platforms);
        if (!result.ok) {
          setFeedback({ kind: "err", text: result.error });
          return;
        }
        setScheduledAt(toLocalInputValue(new Date(result.iso)));
        setFeedback({ kind: "ok", text: "Picked the next available time." });
      } catch {
        setFeedback({ kind: "err", text: "Could not find the next available time. Please try again." });
      }
    });
  }

  return (
    <section id="new" className="mt-6 scroll-mt-20" aria-labelledby={`${mainId}-heading`}>
      <h2 id={`${mainId}-heading`} className="sr-only">
        {draftId ? (initialDraft?.status === "scheduled" ? "Edit scheduled post" : "Edit draft") : "New post composer"}
      </h2>
      {draftId && (
        <Link href={calendarHrefWithoutDraft()} className="mb-4 inline-block text-sm text-[var(--poskoo-violet)]">
          Cancel editing · New post
        </Link>
      )}
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="space-y-6">
          <div>
            <span className="text-sm font-medium text-[#3d3450]">Platforms</span>
            <div
              id={platformsFocusId}
              tabIndex={-1}
              className="mt-2 flex flex-wrap gap-2 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)]"
            >
              {PLATFORM_ORDER.map((platform) => {
                const Icon = PLATFORM_ICON[platform];
                const live = livePlatforms.includes(platform);
                const on = enabled[platform];
                const disabledLabel = !live
                  ? platform === "facebook"
                    ? "Facebook: reconnect in Settings and allow Page posting to enable"
                    : platform === "threads"
                      ? "Threads: connect your Threads account in Settings to enable"
                      : platform === "youtube"
                        ? "YouTube: connect a channel in Settings to enable"
                        : `${PLATFORMS[platform].label} publishing is not available yet`
                  : undefined;
                return (
                  <button
                    key={platform}
                    type="button"
                    disabled={!live}
                    aria-disabled={!live || undefined}
                    aria-pressed={live ? on : undefined}
                    aria-label={live ? `${on ? "Remove" : "Add"} ${PLATFORMS[platform].label}` : disabledLabel}
                    title={disabledLabel}
                    onClick={() => togglePlatform(platform)}
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      live
                        ? on
                          ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-violet)]/10 text-[var(--poskoo-violet)]"
                          : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] text-[var(--poskoo-muted)]"
                        : "cursor-not-allowed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] text-[var(--poskoo-muted)] opacity-60"
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                    {PLATFORMS[platform].label}
                    {!live && (
                      <span className="rounded-full bg-[var(--poskoo-band)] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[var(--poskoo-muted)]">
                        Soon
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor={mainId} className="text-sm font-medium text-[#3d3450]">
              Caption
            </label>
            <textarea
              id={mainId}
              value={mainCaption}
              onChange={(e) => setMainCaption(e.target.value)}
              rows={6}
              placeholder="Write once — customize per platform below if you need to."
              className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none"
            />
            <button
              type="button"
              disabled={aiOn === false}
              onClick={() => setAiOpen((open) => !open)}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--poskoo-violet)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              {aiOn === false ? "AI captions are not switched on" : "Write with AI"}
            </button>
            {aiOpen && aiOn && (
              <div className="mt-3 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <label htmlFor={aiTopicId} className="text-sm font-medium text-[#3d3450]">
                      What is this post about?
                    </label>
                    <input
                      id={aiTopicId}
                      type="text"
                      maxLength={300}
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-sm text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)] focus:outline-none"
                    />
                  </div>
                  <div className="sm:w-44">
                    <label htmlFor={aiToneId} className="text-sm font-medium text-[#3d3450]">
                      Tone
                    </label>
                    <select
                      id={aiToneId}
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-sm text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)] focus:outline-none"
                    >
                      {(["friendly", "professional", "playful", "bold"] as const).map((tone) => (
                        <option key={tone} value={tone}>{tone[0].toUpperCase() + tone.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={aiPending || !aiTopic.trim()}
                  onClick={() => {
                    setAiError("");
                    setAiIdeas([]);
                    startAiTransition(async () => {
                      try {
                        const result = await suggestCaptions({ topic: aiTopic, draft: mainCaption, tone: aiTone });
                        if (result.ok) setAiIdeas(result.ideas);
                        else setAiError(result.error);
                      } catch {
                        setAiError("AI request failed. Try again.");
                      }
                    });
                  }}
                  className="mt-3 rounded-full border border-[var(--poskoo-line)] px-3 py-1.5 text-sm font-medium text-[var(--poskoo-ink)] disabled:opacity-60"
                >
                  {aiPending ? "Thinking…" : "Get ideas"}
                </button>
                {aiError && <p className="mt-2 text-sm text-[var(--poskoo-coral)]" aria-live="polite">{aiError}</p>}
                {aiIdeas.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {aiIdeas.map((idea, index) => (
                      <article key={`${index}-${idea.caption}`} className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
                        <p className="whitespace-pre-wrap text-sm text-[#3d3450]">{idea.caption}</p>
                        {idea.hashtags.length > 0 && (
                          <p className="mt-2 text-sm text-[var(--poskoo-muted)]">{idea.hashtags.join(" ")}</p>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setMainCaption(idea.hashtags.length > 0 ? `${idea.caption}\n\n${idea.hashtags.join(" ")}` : idea.caption);
                            setAiOpen(false);
                          }}
                          className="mt-2 text-sm font-medium text-[var(--poskoo-violet)]"
                        >
                          Use this
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {igFormat !== "story" && (
            <div>
              <label htmlFor={firstCommentId} className="text-sm font-medium text-[#3d3450]">
                First comment (Instagram) (optional)
              </label>
              <textarea
                id={firstCommentId}
                value={firstComment}
                onChange={(e) => setFirstComment(e.target.value)}
                rows={3}
                aria-describedby={`${firstCommentId}-help`}
                className="mt-2 w-full resize-y rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none"
              />
              <p id={`${firstCommentId}-help`} className="mt-1 text-xs text-[var(--poskoo-muted)]">
                Posted from your account right after the post goes live. Good for hashtags.
              </p>
              <p className={`mt-1 text-xs ${counterClass(countChars(firstComment), PLATFORM_LIMITS.instagram.max ?? 2200)}`}>
                {countChars(firstComment)} / {PLATFORM_LIMITS.instagram.max} characters
              </p>
            </div>
          )}

          <div>
            <span className="text-sm font-medium text-[#3d3450]">
              Image or video link (https, .jpg, .png or .mp4)
            </span>
            <div className="mt-2 space-y-2">
              {mediaUrls.map((url, index) => {
                const fieldId = index === 0 ? imageId : `${imageId}-${index}`;
                return (
                  <div key={fieldId} className="flex gap-2">
                    <input
                      id={fieldId}
                      type="url"
                      value={url}
                      onChange={(e) =>
                        setMediaUrls((prev) =>
                          prev.map((u, i) => (i === index ? e.target.value : u)),
                        )
                      }
                      placeholder="https://…/photo.jpg"
                      className="min-w-0 flex-1 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none"
                    />
                    {mediaUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setMediaUrls((prev) =>
                            prev.length <= 1 ? prev : prev.filter((_, i) => i !== index),
                          )
                        }
                        className="shrink-0 rounded-lg border border-[var(--poskoo-line)] px-2 py-2 text-xs font-medium text-[var(--poskoo-muted)] transition-colors hover:bg-[var(--poskoo-band)]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {enabled.instagram && (
              <fieldset id={igFormatLegendId} tabIndex={-1} className="mt-3 border-0 p-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)]">
                <legend className="text-sm font-medium text-[#3d3450]">
                  Instagram format:
                </legend>
                <div
                  className="mt-2 inline-flex rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-0.5 text-sm"
                  role="radiogroup"
                  aria-label="Instagram format"
                >
                  <label
                    className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium transition-colors ${
                      igFormat === "feed" ? "bg-[var(--poskoo-violet)]/10 text-[var(--poskoo-violet)]" : "text-[var(--poskoo-muted)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="ig_format"
                      value="feed"
                      checked={igFormat === "feed"}
                      onChange={() => setIgFormat("feed")}
                      className="sr-only"
                    />
                    Post
                  </label>
                  <label
                    className={`cursor-pointer rounded-lg px-3 py-1.5 font-medium transition-colors ${
                      igFormat === "story" ? "bg-[var(--poskoo-violet)]/10 text-[var(--poskoo-violet)]" : "text-[var(--poskoo-muted)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="ig_format"
                      value="story"
                      checked={igFormat === "story"}
                      onChange={() => {
                        setIgFormat("story");
                        setMediaUrls((prev) => [prev.map((u) => u.trim()).find((u) => u !== "") ?? prev[0] ?? ""]);
                      }}
                      className="sr-only"
                    />
                    Story
                  </label>
                </div>
                {igFormat === "story" && (
                  <p className="mt-1 text-xs text-[var(--poskoo-muted)]">
                    Stories show the image or video only. The caption is not shown on Instagram.
                  </p>
                )}
              </fieldset>
            )}
            {mediaUrls.length < 10 && !(enabled.instagram && igFormat === "story") && (
              <button
                type="button"
                onClick={() =>
                  setMediaUrls((prev) => (prev.length >= 10 ? prev : [...prev, ""]))
                }
                className="mt-2 text-sm font-medium text-[var(--poskoo-violet)] hover:underline"
              >
                + Add another image
              </button>
            )}
            {(() => {
              const previewUrl = mediaUrls.map((u) => u.trim()).find((u) => u !== "") ?? "";
              let parsed: URL | null = null;
              try {
                parsed = previewUrl ? new URL(previewUrl) : null;
              } catch {
                parsed = null;
              }
              if (parsed && parsed.protocol === "https:") {
                return (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={parsed.href}
                      alt="Post image preview"
                      className="mt-2 h-32 w-auto rounded-xl border border-[var(--poskoo-line)] object-cover"
                    />
                    <p className="mt-1 text-xs text-[var(--poskoo-muted)]">
                      Paste a public https link (for example from your website or cloud storage); a .mp4 link is posted as a Reel. 2–10 image links =
                      carousel post.
                    </p>
                  </>
                );
              }
              return (
                <p className="mt-1 text-xs text-[var(--poskoo-muted)]">
                  Paste a public https link (for example from your website or cloud storage); a .mp4 link is posted as a Reel. 2–10 image links =
                  carousel post.
                </p>
              );
            })()}
            {storyMediaError && (
              <p className="mt-2 text-sm text-[var(--poskoo-coral)]" aria-live="polite">
                A Story takes one image or video.
              </p>
            )}
          </div>

          {enabled.youtube && (
            <div>
              <span className="text-sm font-medium text-[#3d3450]">YouTube video details</span>
              <div className="mt-2 space-y-3">
                <div>
                  <label htmlFor={ytTitleId} className="text-sm font-medium text-[#3d3450]">
                    Video title
                  </label>
                  <input
                    id={ytTitleId}
                    type="text"
                    maxLength={100}
                    value={ytTitle}
                    onChange={(e) => setYtTitle(e.target.value)}
                    placeholder="Your video title"
                    className="mt-1 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none"
                  />
                  <p className={`mt-1 text-xs ${counterClass(ytTitle.length, 100)}`}>
                    {ytTitle.length} / 100 characters
                  </p>
                </div>
                <div>
                  <label htmlFor={ytTagsId} className="text-sm font-medium text-[#3d3450]">
                    Tags (comma separated, optional)
                  </label>
                  <input
                    id={ytTagsId}
                    type="text"
                    value={ytTags}
                    onChange={(e) => setYtTags(e.target.value)}
                    placeholder="e.g. garage, sale, tips"
                    className="mt-1 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor={ytPrivacyId} className="text-sm font-medium text-[#3d3450]">
                    Visibility
                  </label>
                  <select
                    id={ytPrivacyId}
                    value={ytPrivacy}
                    onChange={(e) => setYtPrivacy(e.target.value as "public" | "unlisted" | "private")}
                    className="mt-1 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-sm text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)] focus:outline-none"
                  >
                    <option value="public">Public</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="private">Private</option>
                  </select>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[#3d3450]">
                  <input
                    type="checkbox"
                    checked={ytShorts}
                    onChange={(e) => setYtShorts(e.target.checked)}
                    className="rounded border-[var(--poskoo-line)] text-[var(--poskoo-violet)] focus:ring-[var(--poskoo-violet)]"
                  />
                  This is a Short (vertical, under 60 seconds)
                </label>
                <p className="text-xs text-[var(--poskoo-muted)]">
                  The caption above is used as the video description. Add a .mp4 video link above for the upload.
                </p>
              </div>
            </div>
          )}

          <div>
            {rules.length > 0 ? (
              <>
                <label htmlFor={dmRuleId} className="text-sm font-medium text-[#3d3450]">
                  Auto-DM rule (optional)
                </label>
                <select
                  id={dmRuleId}
                  value={selectedRuleId}
                  onChange={(e) => setSelectedRuleId(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-sm text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)] focus:outline-none"
                >
                  <option value="">None</option>
                  {rules.map((rule) => (
                    <option key={rule.id} value={rule.id}>
                      {rule.name}
                      {rule.status === "paused" ? " (paused)" : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[var(--poskoo-muted)]">
                  We switch this rule on when the post goes live, so you can keep it paused until then.
                </p>
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-[#3d3450]">Auto-DM rule (optional)</span>
                <p className="mt-1 text-xs text-[var(--poskoo-muted)]">
                  <Link href="/app/auto-dm" className="text-[var(--poskoo-violet)] hover:underline">
                    Create an auto-DM rule
                  </Link>
                </p>
              </>
            )}
          </div>

          {selected.length > 0 && (
            <div>
              <div className="flex flex-wrap gap-1 border-b border-[var(--poskoo-line)]">
                {selected.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === platform}
                    onClick={() => setActiveTab(platform)}
                    className={`rounded-t-lg px-3 py-2 text-sm font-medium ${
                      activeTab === platform ? "border border-b-0 border-[var(--poskoo-line)] bg-[var(--poskoo-card)] text-[var(--poskoo-ink)]" : "text-[var(--poskoo-muted)]"
                    }`}
                  >
                    {PLATFORMS[platform].label}
                  </button>
                ))}
              </div>
              <div className="rounded-b-xl rounded-tr-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
                {(() => {
                  const platform = activeTab;
                  if (!enabled[platform]) return null;
                  const config = PLATFORMS[platform];
                  const text = effectiveCaption(platform, mainCaption, customize, customCaption);
                  const check = checkCaption(platform, text);
                  return (
                    <>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-[#3d3450]">
                        <input
                          type="checkbox"
                          checked={customize[platform]}
                          onChange={(e) =>
                            setCustomize((c) => ({ ...c, [platform]: e.target.checked }))
                          }
                          className="rounded border-[var(--poskoo-line)] text-[var(--poskoo-violet)] focus:ring-[var(--poskoo-violet)]"
                        />
                        Customize for {config.label}
                      </label>
                      {customize[platform] && (
                        <textarea
                          id={`${customCaptionId}-${platform}`}
                          aria-label={`${config.label} caption`}
                          value={customCaption[platform]}
                          onChange={(e) =>
                            setCustomCaption((c) => ({ ...c, [platform]: e.target.value }))
                          }
                          rows={4}
                          className="mt-3 w-full resize-y rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-sm focus:border-[var(--poskoo-violet)] focus:outline-none"
                        />
                      )}
                      <p className={`mt-3 text-sm tabular-nums ${counterClass(check.length, config.captionMax)}`}>
                        {check.length.toLocaleString("en-US")} / {config.captionMax.toLocaleString("en-US")}
                      </p>
                      {check.errors.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-[var(--poskoo-coral)]" aria-live="polite">
                          {check.errors.map((msg) => (
                            <li key={msg}>{msg}</li>
                          ))}
                        </ul>
                      )}
                      {check.warnings.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm text-[var(--poskoo-coral)]" aria-live="polite">
                          {check.warnings.map((msg) => (
                            <li key={msg}>{msg}</li>
                          ))}
                        </ul>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor={scheduleId} className="text-sm font-medium text-[#3d3450]">
                Schedule
              </label>
              <input
                id={scheduleId}
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-sm focus:border-[var(--poskoo-violet)] focus:outline-none"
              />
              {timeZone && bestHoursUtc.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-[var(--poskoo-muted)]">Best times:</span>
                  {bestHoursUtc.map((h) => {
                    const label = nextSlotLocal(h).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
                    return (
                      <button
                        key={h}
                        type="button"
                        aria-label={`Schedule for ${label}`}
                        onClick={() => setScheduledAt(toLocalInputValue(nextSlotLocal(h)))}
                        className="rounded-full border border-[var(--poskoo-line)] px-3 py-1 text-xs text-[#3d3450] hover:border-[var(--poskoo-violet)] hover:text-[var(--poskoo-violet)]"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
              {queueReady && (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={handleNextAvailable}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--poskoo-line)] px-3 py-1 text-xs font-medium text-[var(--poskoo-violet)] hover:bg-[var(--poskoo-band)] disabled:opacity-60"
                >
                  Next available
                </button>
              )}
              {!queueReady && (
                <p className="mt-1 text-xs text-[var(--poskoo-muted)]">
                  Set a posting schedule in Settings → Channels to use “Next available” and “Add to queue”.
                </p>
              )}
              <p className="mt-1 text-xs text-[var(--poskoo-muted)]">Timezone: {timeZone || "…"}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={isPending || storyMediaError}
              onClick={() => handleSave("draft")}
              className="rounded-full border border-[var(--poskoo-line)] px-4 py-2 text-sm font-medium text-[var(--poskoo-ink)] transition-colors hover:bg-[var(--poskoo-band)] disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              disabled={isPending || !scheduledAt || storyMediaError}
              onClick={() => handleSave("schedule")}
              className={`${ui.inkFill} rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60`}
            >
              {isPending ? "Saving…" : "Schedule"}
            </button>
            <button
              type="button"
              disabled={isPending || !queueReady || storyMediaError}
              onClick={() => handleSave("queue")}
              className="rounded-full border border-[var(--poskoo-violet)] bg-[var(--poskoo-violet)]/10 px-4 py-2 text-sm font-medium text-[var(--poskoo-violet)] transition-colors hover:bg-[var(--poskoo-violet)]/20 disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Add to queue"}
            </button>
          </div>
          {feedback && (
            <p
              className={`text-sm ${feedback.kind === "ok" ? "text-[var(--poskoo-green)]" : "text-[var(--poskoo-coral)]"}`}
              role={feedback.kind === "err" ? "alert" : "status"}
            >
              {feedback.text}
            </p>
          )}

        </div>

        <div className="space-y-4">
          <PublishingChecklist
            enabled={enabled}
            mainCaption={mainCaption}
            firstComment={firstComment}
            customize={customize}
            customCaption={customCaption}
            mediaUrls={mediaUrls}
            igFormat={igFormat}
            scheduledAt={scheduledAt}
            timeZone={timeZone}
            onFix={focusChecklistTarget}
          />
          <span className="text-sm font-medium text-[#3d3450]">Preview</span>
          {selected.map((platform) => {
            const text = effectiveCaption(platform, mainCaption, customize, customCaption);
            const Icon = PLATFORM_ICON[platform];
            return (
              <article
                key={platform}
                aria-label={`${PLATFORMS[platform].label} preview`}
                className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-10 w-10 shrink-0 rounded-full bg-[var(--poskoo-band)]"
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                      <Icon className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden />
                      {BRAND.name}
                    </div>
                    <div className="truncate text-xs text-[var(--poskoo-muted)]">{HANDLE}</div>
                  </div>
                </div>
                <div
                  className="mt-3 aspect-square w-full rounded-lg bg-[var(--poskoo-band)]"
                  aria-hidden
                />
                <p className="mt-3 whitespace-pre-wrap text-sm text-[#3d3450]">
                  {previewCaption(platform, text) || (
                    <span className="text-[var(--poskoo-muted)]">Your caption appears here.</span>
                  )}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
