"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, AtSign, Bell, CalendarClock, ChevronDown, Facebook, Hash, Info, Instagram, Link2, Loader2, Plus, Smile, Sparkles, UploadCloud, X, Youtube as YouTube } from "lucide-react";
import { deleteHashtagGroup, deleteTemplate, listHashtagGroups, listTemplates, nextAvailableSlot, nextAvailableSlots, saveHashtagGroup, savePost, saveTemplate } from "./actions";
import PublishingChecklist, { type ChecklistFixTarget } from "./PublishingChecklist";
import PostPreview from "./PostPreview";
import { useComposerDialog } from "./ComposerDialog";
import { COMPOSER_EMOJI, insertAtCursor } from "@/lib/captionInsert";
import { isReminderNetwork } from "@/lib/networks/reminder";
import { aiAvailable, suggestCaptions } from "./aiActions";
import type { CaptionIdea } from "@/lib/ai";
import { countChars, PLATFORM_LIMITS } from "@/lib/captionLimits";
import { insertHashtags, parseHashtagGroup, type SavedHashtagGroup } from "@/lib/hashtagSets";
import { parseTags } from "@/lib/tagFilter";
import type { PostTemplate } from "@/lib/templates";
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
import { dayPrefill, hrefWithoutComposer } from "@/lib/composerUrl";
import { instagramAspectWarning, mediaKindFromUrl, validateMediaFile } from "@/lib/mediaUpload";
import { checkMediaForTargets, formatBytes, maxBytesForTargets, type MediaFacts } from "@/lib/mediaLimits";
import { probeMediaFile, UploadCancelled, uploadWithProgress } from "@/lib/mediaUploadClient";
import type { PlanName } from "@/lib/planLimits";
import ui from "@/components/ui/ui.module.css";
import { NEW_NETWORK_COLOR, NEW_NETWORK_ICON } from "@/components/brandIcons";
import NetworkOptionsPanel, { type NetworkPanelData } from "./NetworkOptionsPanel";

const PLATFORM_ORDER: PlatformId[] = ["instagram", "facebook", "threads", "youtube", "tiktok", "linkedin", "x", "bluesky", "mastodon", "pinterest", "gbp", "ig_personal", "fb_group"];
const NEW_NETWORKS = ["tiktok", "bluesky", "mastodon", "linkedin", "pinterest", "x", "gbp", "ig_personal", "fb_group"] as const;
const NET_COLOR: Record<PlatformId, string> = { instagram: "#d62976", facebook: "#1877f2", threads: "#000", youtube: "#ff0000", ...NEW_NETWORK_COLOR };

const PLATFORM_ICON: Record<PlatformId, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  threads: AtSign,
  youtube: YouTube,
  ...NEW_NETWORK_ICON,
};

function counterClass(length: number, max: number): string {
  if (length > max) return "text-[var(--poskoo-coral)]";
  if (length >= max * 0.9) return "text-[var(--poskoo-coral)]";
  return "text-[var(--poskoo-muted)]";
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

export default function Composer({ rules = [], bestHoursUtc = [], initialDraft, initialIdea, facebookReady = false, threadsReady = false, schedulePlatforms = [], youtubeReady = false, scheduledUsage = null, accountNames = {}, networkReady = {}, captionMaxOverrides = {}, networkData = {}, mediaPlan = "Free" }: { mediaPlan?: PlanName; networkReady?: Partial<Record<string, boolean>>; captionMaxOverrides?: Partial<Record<string, number>>; networkData?: NetworkPanelData; rules?: RuleOption[]; bestHoursUtc?: number[]; initialDraft?: ComposerDraftInitial; initialIdea?: { id: string; caption: string; mediaUrls: string[] }; facebookReady?: boolean; threadsReady?: boolean; schedulePlatforms?: string[]; youtubeReady?: boolean; scheduledUsage?: { used: number; limit: number | null } | null; accountNames?: Record<string, string> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const livePlatforms: PlatformId[] = ["instagram"];
  if (facebookReady) livePlatforms.push("facebook");
  if (threadsReady) livePlatforms.push("threads");
  if (youtubeReady) livePlatforms.push("youtube");
  for (const n of NEW_NETWORKS) if (networkReady[n]) livePlatforms.push(n);
  // After connecting a channel the composer opens with ?with=<network>: start with just that one.
  const withParam = searchParams.get("with");
  const preselect = !initialDraft && !initialIdea && withParam && livePlatforms.includes(withParam as PlatformId) ? (withParam as PlatformId) : null;
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
  const mediaInputId = useId();
  const igFormatLegendId = useId();
  const aiTopicId = useId();
  const aiToneId = useId();
  const ytTitleId = useId();
  const ytTagsId = useId();
  const ytPrivacyId = useId();
  const postTagsId = useId();
  const templateNameId = useId();
  const hashtagGroupNameId = useId();
  const hashtagTextId = useId();

  const [enabled, setEnabled] = useState<Record<PlatformId, boolean>>(() =>
    preselect ? (Object.fromEntries(PLATFORM_ORDER.map((p) => [p, p === preselect])) as Record<PlatformId, boolean>) : init.enabled,
  );
  const [activeTab, setActiveTab] = useState<PlatformId>(preselect ?? "instagram");
  const [netOptions, setNetOptions] = useState<Record<string, Record<string, unknown>>>(() => {
    const saved: Record<string, Record<string, unknown>> = {};
    for (const [k, v] of Object.entries(initialDraft?.netOptions ?? {})) {
      if (v && typeof v === "object") saved[k] = v as Record<string, unknown>;
    }
    return saved;
  });
  const [mainCaption, setMainCaption] = useState(init.mainCaption);
  const [firstComment, setFirstComment] = useState(init.firstComment);
  const [postTags, setPostTags] = useState(init.tags.join(", "));
  const [templates, setTemplates] = useState<PostTemplate[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [hashtagGroups, setHashtagGroups] = useState<SavedHashtagGroup[]>([]);
  const [hashtagGroupName, setHashtagGroupName] = useState("");
  const [hashtagText, setHashtagText] = useState("");
  const [customize, setCustomize] = useState<Record<PlatformId, boolean>>(init.customize);
  const [customCaption, setCustomCaption] = useState<Record<PlatformId, string>>(init.customCaption);
  const [mediaUrls, setMediaUrls] = useState<string[]>(init.mediaUrls);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [mediaWarnings, setMediaWarnings] = useState<string[]>([]);
  // Upload progress + cancel, and the facts of files uploaded in this session (re-checked when
  // the selected networks change).
  const [uploadProgress, setUploadProgress] = useState<{ name: string; loaded: number; total: number } | null>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);
  const [mediaFacts, setMediaFacts] = useState<Record<string, MediaFacts>>({});
  const [dragActive, setDragActive] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
  const [igFormat, setIgFormat] = useState<"feed" | "story">(init.igFormat);
  const [selectedRuleId, setSelectedRuleId] = useState(init.selectedRuleId);
  const [scheduledAt, setScheduledAt] = useState("");
  const [timeZone, setTimeZone] = useState("");
  const [nextSlotLabel, setNextSlotLabel] = useState("");
  const [ytTitle, setYtTitle] = useState("");
  const [ytTags, setYtTags] = useState("");
  const [ytPrivacy, setYtPrivacy] = useState<"public" | "unlisted" | "private">("public");
  const [ytShorts, setYtShorts] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [extrasPending, startExtrasTransition] = useTransition();
  const [aiOn, setAiOn] = useState<boolean | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("friendly");
  const [aiIdeas, setAiIdeas] = useState<CaptionIdea[]>([]);
  const [aiError, setAiError] = useState("");
  const [aiPending, startAiTransition] = useTransition();
  const dialog = useComposerDialog();
  const captionRef = useRef<HTMLTextAreaElement>(null);
  const scheduleInputRef = useRef<HTMLInputElement>(null);
  // Which small popover is open: emoji grid, hashtag sets, or the "Next available ▾" slot menu.
  const [openTool, setOpenTool] = useState<"emoji" | "hashtag" | "slots" | null>(null);
  const [slotOptions, setSlotOptions] = useState<{ iso: string; timeZone: string }[] | null>(null);
  const [slotsError, setSlotsError] = useState("");
  const [createAnother, setCreateAnother] = useState(false);

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
    setPostTags(blank.tags.join(", "));
    setTemplateName("");
    setHashtagGroupName("");
    setHashtagText("");
    setCustomCaption(blank.customCaption);
    setMediaUrls(blank.mediaUrls);
    setUploadError("");
    setMediaWarnings([]);
    setLinkMode(false);
    setDragActive(false);
    setIgFormat(blank.igFormat);
    setSelectedRuleId(blank.selectedRuleId);
    setCustomize(blank.customize);
    setEnabled(blank.enabled);
    setActiveTab("instagram");
    setScheduledAt("");
    setNextSlotLabel("");
    setDraftId(undefined);
    setYtTitle("");
    setYtTags("");
    setYtPrivacy("public");
    setYtShorts(false);
    setNetOptions({});
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

  useEffect(() => {
    let active = true;
    Promise.all([listTemplates(), listHashtagGroups()])
      .then(([savedTemplates, savedGroups]) => {
        if (!active) return;
        setTemplates(savedTemplates);
        setHashtagGroups(savedGroups);
      })
      .catch(() => {
        // Saved extras are optional; an unavailable table never blocks composing.
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!openTool) return;
    const onDown = (event: MouseEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest("[data-composer-pop]")) setOpenTool(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        // Close just the popover, not the whole composer window.
        event.stopPropagation();
        setOpenTool(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [openTool]);

  // Emoji / "#" go in at the caret (or replace the selection), then focus returns to the caption.
  function insertIntoCaption(piece: string) {
    const el = captionRef.current;
    const start = el?.selectionStart ?? mainCaption.length;
    const end = el?.selectionEnd ?? mainCaption.length;
    const next = insertAtCursor(mainCaption, start, end, piece);
    setMainCaption(next.text);
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      el.setSelectionRange(next.caret, next.caret);
    });
  }

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
  const selectedScheduleDate = scheduledAt ? new Date(scheduledAt) : null;
  const selectedScheduleLabel = selectedScheduleDate &&
    !Number.isNaN(selectedScheduleDate.getTime()) &&
    toLocalInputValue(selectedScheduleDate) === scheduledAt
    ? selectedScheduleDate.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
    : "";

  function changeScheduledAt(value: string) {
    scheduleOriginRef.current = null;
    setScheduledAt(value);
    setNextSlotLabel("");
  }

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
      tags: parseTags(postTags),
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
      netOptions: Object.fromEntries(NEW_NETWORKS.filter((n) => enabled[n]).map((n) => [n, netOptions[n] ?? {}])),
    };
  }

  const firstNet = selected[0] ?? "instagram";
  const captionMax =
    firstNet === "youtube"
      ? null
      : firstNet === "instagram" || firstNet === "facebook" || firstNet === "threads"
        ? PLATFORM_LIMITS[firstNet].max
        : (captionMaxOverrides[firstNet] ?? PLATFORMS[firstNet].captionMax);
  const filledMediaCount = mediaUrls.map((u) => u.trim()).filter((u) => u !== "").length;
  const selectedPlatforms = PLATFORM_ORDER.filter((p) => enabled[p]);
  // Files uploaded in this session, re-checked against the networks selected now.
  const attachedMediaIssues = [
    ...new Set(
      mediaUrls.flatMap((u) => {
        const facts = mediaFacts[u.trim()];
        return facts ? checkMediaForTargets(facts, { plan: mediaPlan, platforms: selectedPlatforms, igFormat: enabled.instagram ? igFormat : "feed" }).errors : [];
      }),
    ),
  ];
  const storyMediaError =
    enabled.instagram && igFormat === "story" && filledMediaCount > 1;

  function addMediaUrl(url: string) {
    setMediaUrls((prev) => {
      const next = prev.map((u) => u.trim()).filter((u) => u !== "");
      if (next.length >= 10) return prev;
      return [...next, url];
    });
  }

  function moveMedia(index: number, delta: number) {
    setMediaUrls((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function removeMedia(index: number) {
    setMediaUrls((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length > 0 ? next : [""];
    });
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) return;
    setUploadError("");
    setMediaWarnings([]);
    const storyMode = enabled.instagram && igFormat === "story";
    const room = 10 - filledMediaCount;
    if (!storyMode && room <= 0) {
      setUploadError("You can add up to 10 images per post.");
      return;
    }
    const queue = storyMode ? files.slice(0, 1) : files.slice(0, room);
    const platforms = PLATFORM_ORDER.filter((p) => enabled[p]);
    const igFormatNow = enabled.instagram ? igFormat : "feed";
    setUploading(true);
    const warnings: string[] = [];
    const controller = new AbortController();
    uploadAbortRef.current = controller;
    try {
      for (const file of queue) {
        if (controller.signal.aborted) break;
        const check = validateMediaFile({ type: file.type, size: file.size, name: file.name }, mediaPlan);
        if (!check.ok) {
          setUploadError(`${file.name}: ${check.error}`);
          continue;
        }
        // Before upload: size, type, pixels and video length (hidden <video>) against every selected network.
        const { facts, poster } = await probeMediaFile(file, check.kind);
        const verdict = checkMediaForTargets(facts, { plan: mediaPlan, platforms, igFormat: igFormatNow });
        if (verdict.errors.length > 0) {
          setUploadError(`${file.name}: ${verdict.errors[0]}`);
          continue;
        }
        for (const w of verdict.warnings) warnings.push(`${file.name}: ${w}`);
        if (check.kind === "image" && !storyMode && enabled.instagram && facts.width && facts.height) {
          const warning = instagramAspectWarning(facts.width, facts.height);
          if (warning) warnings.push(`${file.name}: ${warning}`);
        }
        // Raw body: the server streams it to disk instead of buffering a multipart form in memory.
        setUploadProgress({ name: file.name, loaded: 0, total: file.size });
        const response = await uploadWithProgress(
          "/api/media/upload",
          file,
          {
            "Content-Type": file.type || "application/octet-stream",
            "X-File-Name": encodeURIComponent(file.name),
            "X-Networks": platforms.join(","),
            "X-Ig-Format": igFormatNow,
          },
          (loaded, total) => setUploadProgress({ name: file.name, loaded, total }),
          controller.signal,
        );
        const result = response.body as { url?: string; key?: string; error?: string; durationSec?: number | null };
        if (response.status < 200 || response.status >= 300 || !result.url) {
          setUploadError(result.error || "Could not upload that file. Please try again.");
          continue;
        }
        const url = result.url;
        if (typeof result.durationSec === "number") facts.durationSec = result.durationSec;
        setMediaFacts((prev) => ({ ...prev, [url]: facts }));
        // Small poster that stays after the file is deleted on publish (best effort).
        if (poster && result.key) {
          void fetch("/api/media/upload", {
            method: "POST",
            body: poster,
            headers: { "Content-Type": "image/jpeg", "X-Thumb-For": result.key },
          }).catch(() => undefined);
        }
        if (storyMode) setMediaUrls([url]);
        else addMediaUrl(url);
      }
    } catch (err) {
      setUploadError(err instanceof UploadCancelled ? "Upload cancelled." : "Could not upload that file. Please try again.");
    } finally {
      uploadAbortRef.current = null;
      setUploadProgress(null);
      setUploading(false);
      setMediaWarnings(warnings);
    }
  }

  function cancelUpload() {
    uploadAbortRef.current?.abort();
  }

  function handleMediaDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    void uploadFiles(Array.from(event.dataTransfer.files));
  }

  function handleMediaInput(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    void uploadFiles(files);
  }

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
      case "ytTitle":
        focusEl(ytTitleId);
        break;
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
      if (dialog && !createAnother) {
        // Done: close the window (and drop ?draft / ?idea so it does not reopen on refresh).
        const params = new URLSearchParams(searchParams.toString());
        params.delete("idea");
        dialog.close(hrefWithoutComposer("/app/calendar", params));
      } else if (editingDraftId || initialIdea) {
        router.replace(calendarHrefWithoutDraft());
      }
      // savePost revalidates /app/calendar, so no extra router.refresh() (it re-rendered the whole page twice).
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
        const slot = new Date(result.iso);
        scheduleOriginRef.current = null;
        setScheduledAt(toLocalInputValue(slot));
        setNextSlotLabel(`${slot.toLocaleString(undefined, {
          timeZone: result.timeZone,
          dateStyle: "medium",
          timeStyle: "short",
        })} (${result.timeZone})`);
        setFeedback({ kind: "ok", text: "Picked the next available time. Review it below, then select Schedule to save." });
      } catch {
        setFeedback({ kind: "err", text: "Could not find the next available time. Please try again." });
      }
    });
  }

  function applySlot(iso: string, zone: string) {
    const slot = new Date(iso);
    scheduleOriginRef.current = null;
    setScheduledAt(toLocalInputValue(slot));
    setNextSlotLabel(`${slot.toLocaleString(undefined, { timeZone: zone, dateStyle: "medium", timeStyle: "short" })} (${zone})`);
    setOpenTool(null);
  }

  // "Next available ▾": load the next 3 free schedule slots for the selected channels.
  function toggleSlotMenu() {
    if (openTool === "slots") {
      setOpenTool(null);
      return;
    }
    setOpenTool("slots");
    setSlotOptions(null);
    setSlotsError("");
    const platforms = PLATFORM_ORDER.filter((p) => enabled[p]);
    nextAvailableSlots(platforms, 3)
      .then((result) => {
        if (result.ok) setSlotOptions(result.slots);
        else setSlotsError(result.error);
      })
      .catch(() => setSlotsError("Could not load the next times. Please try again."));
  }

  function pickDateTime() {
    setOpenTool(null);
    const input = scheduleInputRef.current;
    if (!input) return;
    input.focus();
    try {
      input.showPicker?.();
    } catch {
      // Some browsers only open the picker from a direct click; focus is enough there.
    }
  }

  function applyTemplate(template: PostTemplate) {
    setMainCaption(template.caption);
    setFirstComment(template.first_comment ?? "");
    setPostTags((template.tags ?? []).join(", "));
    setFeedback({ kind: "ok", text: `Template “${template.name}” inserted.` });
  }

  function handleTemplateSave() {
    setFeedback(null);
    startExtrasTransition(async () => {
      try {
        const result = await saveTemplate({
          name: templateName,
          caption: mainCaption,
          firstComment,
          tags: parseTags(postTags),
        });
        if (!result.ok) {
          setFeedback({ kind: "err", text: result.error });
          return;
        }
        setTemplates(await listTemplates());
        setTemplateName("");
        setFeedback({ kind: "ok", text: "Post template saved." });
      } catch {
        setFeedback({ kind: "err", text: "Could not save the template. Please try again." });
      }
    });
  }

  function handleTemplateDelete(id: string) {
    if (!window.confirm("Delete this saved template?")) return;
    setFeedback(null);
    startExtrasTransition(async () => {
      try {
        const result = await deleteTemplate(id);
        if (!result.ok) {
          setFeedback({ kind: "err", text: result.error });
          return;
        }
        setTemplates((current) => current.filter((template) => template.id !== id));
      } catch {
        setFeedback({ kind: "err", text: "Could not delete the template." });
      }
    });
  }

  function handleHashtagGroupSave() {
    setFeedback(null);
    startExtrasTransition(async () => {
      try {
        const result = await saveHashtagGroup({ name: hashtagGroupName, hashtags: parseHashtagGroup(hashtagText) });
        if (!result.ok) {
          setFeedback({ kind: "err", text: result.error });
          return;
        }
        setHashtagGroups(await listHashtagGroups());
        setHashtagGroupName("");
        setHashtagText("");
        setFeedback({ kind: "ok", text: "Hashtag group saved." });
      } catch {
        setFeedback({ kind: "err", text: "Could not save the hashtag group. Please try again." });
      }
    });
  }

  function handleHashtagGroupDelete(id: string) {
    if (!window.confirm("Delete this saved hashtag group?")) return;
    setFeedback(null);
    startExtrasTransition(async () => {
      try {
        const result = await deleteHashtagGroup(id);
        if (!result.ok) {
          setFeedback({ kind: "err", text: result.error });
          return;
        }
        setHashtagGroups((current) => current.filter((group) => group.id !== id));
      } catch {
        setFeedback({ kind: "err", text: "Could not delete the hashtag group." });
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
      <div className="composerPanes grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)]">
        <div className="composerEditor min-w-0 space-y-5">
          <div>
            <span className="text-sm font-medium text-[var(--poskoo-ink)]">Channels</span>
            <div
              id={platformsFocusId}
              tabIndex={-1}
              className="mt-2 flex w-full min-w-0 max-w-full flex-wrap gap-2.5 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)] sm:gap-3"
            >
              {[...PLATFORM_ORDER.filter((p) => livePlatforms.includes(p)), ...PLATFORM_ORDER.filter((p) => !livePlatforms.includes(p))].map((platform, index, ordered) => {
                const Icon = PLATFORM_ICON[platform];
                const live = livePlatforms.includes(platform);
                const firstOff = !live && (index === 0 || livePlatforms.includes(ordered[index - 1]));
                const on = enabled[platform];
                const disabledLabel = !live
                  ? platform === "facebook"
                    ? "Facebook: reconnect in Settings and allow Page posting to enable"
                    : platform === "threads"
                      ? "Threads: connect your Threads account in Settings to enable"
                      : platform === "youtube"
                        ? "YouTube: connect a channel in Settings to enable"
                        : `${PLATFORMS[platform].label}: connect it with “Connect a channel” to enable`
                  : undefined;
                return (
                  <span key={platform} className="contents">
                  {firstOff && index > 0 && <span className="mx-0.5 h-8 w-px self-center bg-[var(--poskoo-line)]" aria-hidden />}
                  <button
                    type="button"
                    disabled={!live}
                    aria-disabled={!live || undefined}
                    aria-pressed={live ? on : undefined}
                    aria-label={live ? `${on ? "Remove" : "Add"} ${PLATFORMS[platform].label}${isReminderNetwork(platform) ? " (reminder: Poskoo e-mails you to post it)" : ""}` : disabledLabel}
                    title={disabledLabel}
                    onClick={() => togglePlatform(platform)}
                    className={`group relative grid place-items-center rounded-full border-2 transition ${live ? "h-11 w-11" : "h-9 w-9 self-center"} ${
                      live
                        ? on
                          ? "border-[var(--poskoo-violet)] opacity-100"
                          : "border-transparent opacity-45 grayscale hover:opacity-80"
                        : "cursor-not-allowed border-transparent opacity-35 grayscale"
                    }`}
                  >
                    <span className={`grid place-items-center rounded-full text-white ${live ? "h-9 w-9" : "h-7 w-7"}`} style={{ background: NET_COLOR[platform] }} aria-hidden>
                      <Icon className={live ? "h-[18px] w-[18px]" : "h-[14px] w-[14px]"} />
                    </span>
                    {on && live && (
                      <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-[var(--poskoo-violet)] text-[11px] font-bold leading-none text-white" aria-hidden>✓</span>
                    )}
                    {live && isReminderNetwork(platform) && (
                      <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full border border-[var(--poskoo-card)] bg-[var(--poskoo-lime)] text-[#1e1631]" aria-hidden>
                        <Bell className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </button>
                  </span>
                );
              })}
              {PLATFORM_ORDER.some((p) => !livePlatforms.includes(p)) && (
                <a href="#connect" className="inline-flex items-center gap-1 self-center rounded-full px-2 py-1 text-xs font-medium text-[var(--poskoo-muted)] hover:bg-[var(--poskoo-band)] hover:text-[var(--poskoo-violet)]">
                  <Plus className="h-3.5 w-3.5" aria-hidden /> Connect
                </a>
              )}
            </div>
            {PLATFORM_ORDER.some((p) => enabled[p] && isReminderNetwork(p) && livePlatforms.includes(p)) && (
              <p className="mt-2 flex items-start gap-2 rounded-xl bg-[var(--poskoo-band)] px-3 py-2 text-xs text-[var(--poskoo-ink)]">
                <Bell className="mt-0.5 h-3.5 w-3.5 flex-none text-[var(--poskoo-violet)]" aria-hidden />
                <span>
                  Poskoo will remind you to post this to{" "}
                  {PLATFORM_ORDER.filter((p) => enabled[p] && isReminderNetwork(p)).map((p) => PLATFORMS[p].label).join(" and ")}. At the scheduled time you get an e-mail with the caption and files, ready to post.
                </span>
              </p>
            )}
          </div>

          <details className="group rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg text-sm font-medium text-[var(--poskoo-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)] [&::-webkit-details-marker]:hidden">
              Saved post templates
              <ChevronDown className="h-4 w-4 text-[var(--poskoo-muted)] transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            {templates.length > 0 && (
              <div className="mt-3 space-y-2">
                {templates.map((template) => (
                  <article key={template.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--poskoo-paper)] p-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[var(--poskoo-ink)]">{template.name}</h3>
                      <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-[var(--poskoo-muted)]">{template.caption}</p>
                    </div>
                    <button type="button" onClick={() => applyTemplate(template)} className="rounded-full border border-[var(--poskoo-violet)] px-3 py-1.5 text-xs font-medium text-[var(--poskoo-violet)]">Insert</button>
                    <button type="button" disabled={extrasPending} onClick={() => handleTemplateDelete(template.id)} aria-label={`Delete template ${template.name}`} className="rounded-full border border-[var(--poskoo-line)] px-3 py-1.5 text-xs text-[var(--poskoo-muted)] disabled:opacity-60">Delete</button>
                  </article>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <div className="min-w-0 flex-1">
                <label htmlFor={templateNameId} className="sr-only">New template name</label>
                <input id={templateNameId} value={templateName} maxLength={80} onChange={(event) => setTemplateName(event.target.value)} placeholder="Template name" className="w-full rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)]" />
              </div>
              <button type="button" disabled={extrasPending || !templateName.trim()} onClick={handleTemplateSave} className="rounded-full border border-[var(--poskoo-line)] px-3 py-2 text-sm font-medium text-[var(--poskoo-ink)] disabled:opacity-60">Save current as template</button>
            </div>
          </details>

          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 shadow-[0_1px_2px_rgba(30,22,49,.05)] focus-within:border-[var(--poskoo-violet)]">
            <div className="flex items-center gap-2 px-1 pb-2">
              {selected.slice(0, 4).map((platform) => {
                const Icon = PLATFORM_ICON[platform];
                return <Icon key={platform} className="h-4 w-4" style={{ color: NET_COLOR[platform] }} aria-hidden />;
              })}
              <label htmlFor={mainId} className="text-sm font-semibold text-[var(--poskoo-ink)]">
                Caption
              </label>
            </div>
            <textarea
              ref={captionRef}
              id={mainId}
              value={mainCaption}
              onChange={(e) => setMainCaption(e.target.value)}
              rows={7}
              placeholder="Start writing or get inspired with Templates. Write once, then customize per network below if you need to."
              className="w-full resize-y rounded-xl border-0 bg-transparent px-1 py-1 text-[15px] leading-relaxed text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:outline-none"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--poskoo-line)] px-1 pt-2 text-xs text-[var(--poskoo-muted)]">
              <div className="flex items-center gap-1">
                <div className="relative" data-composer-pop>
                  <button
                    type="button"
                    onClick={() => setOpenTool((tool) => (tool === "emoji" ? null : "emoji"))}
                    aria-expanded={openTool === "emoji"}
                    aria-haspopup="true"
                    aria-label="Insert emoji"
                    title="Emoji"
                    className="grid h-8 w-8 place-items-center rounded-lg text-[var(--poskoo-muted)] hover:bg-[var(--poskoo-band)] hover:text-[var(--poskoo-ink)]"
                  >
                    <Smile className="h-4 w-4" aria-hidden />
                  </button>
                  {openTool === "emoji" && (
                    <div role="group" aria-label="Emoji" className="absolute bottom-full left-0 z-30 mb-2 grid w-[264px] grid-cols-8 gap-0.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-2 shadow-[0_8px_24px_rgba(30,22,49,.12)]">
                      {COMPOSER_EMOJI.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => insertIntoCaption(emoji)}
                          aria-label={`Insert ${emoji}`}
                          className="grid h-8 w-8 place-items-center rounded-md text-lg hover:bg-[var(--poskoo-band)]"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative" data-composer-pop>
                  <button
                    type="button"
                    onClick={() => {
                      if (hashtagGroups.length === 0) {
                        insertIntoCaption("#");
                        return;
                      }
                      setOpenTool((tool) => (tool === "hashtag" ? null : "hashtag"));
                    }}
                    aria-expanded={hashtagGroups.length > 0 ? openTool === "hashtag" : undefined}
                    aria-haspopup={hashtagGroups.length > 0 ? "true" : undefined}
                    aria-label={hashtagGroups.length > 0 ? "Insert saved hashtags" : "Insert a hashtag"}
                    title="Hashtags"
                    className="grid h-8 w-8 place-items-center rounded-lg text-[var(--poskoo-muted)] hover:bg-[var(--poskoo-band)] hover:text-[var(--poskoo-ink)]"
                  >
                    <Hash className="h-4 w-4" aria-hidden />
                  </button>
                  {openTool === "hashtag" && (
                    <div role="group" aria-label="Saved hashtag groups" className="absolute bottom-full left-0 z-30 mb-2 w-[260px] rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1.5 shadow-[0_8px_24px_rgba(30,22,49,.12)]">
                      {hashtagGroups.map((group) => (
                        <button
                          key={group.id}
                          type="button"
                          onClick={() => {
                            setMainCaption((caption) => insertHashtags(caption, group.hashtags));
                            setOpenTool(null);
                          }}
                          className="block w-full rounded-lg px-2.5 py-2 text-left hover:bg-[var(--poskoo-band)]"
                        >
                          <span className="block text-sm font-medium text-[var(--poskoo-ink)]">{group.name}</span>
                          <span className="block truncate text-xs text-[var(--poskoo-muted)]">{group.hashtags.map((tag) => `#${tag}`).join(" ")}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setOpenTool(null);
                          insertIntoCaption("#");
                        }}
                        className="mt-1 block w-full rounded-lg border-t border-[var(--poskoo-line)] px-2.5 py-2 text-left text-sm text-[var(--poskoo-violet)] hover:bg-[var(--poskoo-band)]"
                      >
                        Type a new # hashtag
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <span className={counterClass(countChars(mainCaption), captionMax ?? 2200)} aria-live="polite">
                {countChars(mainCaption)} / {captionMax ?? "∞"}
              </span>
            </div>
          </div>
          <div>
            {aiOn === false ? (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[var(--poskoo-band)] px-2.5 py-1.5 text-xs text-[var(--poskoo-muted)]">
                <Info className="h-3.5 w-3.5 shrink-0" aria-hidden />
                AI caption ideas aren&apos;t switched on in this workspace yet. Write your caption here, or get ideas from our free{" "}
                <Link href="/tools/instagram-caption-generator" target="_blank" rel="noopener" className="underline font-medium text-[var(--poskoo-violet)]">caption generator</Link>.
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setAiOpen((open) => !open)}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--poskoo-violet)]"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Write with AI
              </button>
            )}
            {aiOpen && aiOn && (
              <div className="mt-3 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="min-w-0 flex-1">
                    <label htmlFor={aiTopicId} className="text-sm font-medium text-[var(--poskoo-ink)]">
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
                    <label htmlFor={aiToneId} className="text-sm font-medium text-[var(--poskoo-ink)]">
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
                        <p className="whitespace-pre-wrap text-sm text-[var(--poskoo-ink)]">{idea.caption}</p>
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

          <div>
            <label htmlFor={postTagsId} className="text-sm font-medium text-[var(--poskoo-ink)]">Campaign tags (optional)</label>
            <input id={postTagsId} value={postTags} onChange={(event) => setPostTags(event.target.value)} placeholder="Spring launch, awareness" aria-describedby={`${postTagsId}-help`} className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none" />
            <p id={`${postTagsId}-help`} className="mt-1 text-xs text-[var(--poskoo-muted)]">Separate up to 10 tags with commas. Use them to filter the queue and calendar.</p>
          </div>

          <details className="group rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg text-sm font-medium text-[var(--poskoo-ink)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)] [&::-webkit-details-marker]:hidden">
              Saved hashtag groups
              <ChevronDown className="h-4 w-4 text-[var(--poskoo-muted)] transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            {hashtagGroups.length > 0 && (
              <div className="mt-3 space-y-2">
                {hashtagGroups.map((group) => (
                  <article key={group.id} className="rounded-lg bg-[var(--poskoo-paper)] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="min-w-0 flex-1 text-sm font-semibold text-[var(--poskoo-ink)]">{group.name}</h3>
                      <button type="button" onClick={() => setMainCaption((caption) => insertHashtags(caption, group.hashtags))} className="rounded-full border border-[var(--poskoo-violet)] px-3 py-1.5 text-xs font-medium text-[var(--poskoo-violet)]">Insert hashtags</button>
                      <button type="button" disabled={extrasPending} onClick={() => handleHashtagGroupDelete(group.id)} aria-label={`Delete hashtag group ${group.name}`} className="rounded-full border border-[var(--poskoo-line)] px-3 py-1.5 text-xs text-[var(--poskoo-muted)] disabled:opacity-60">Delete</button>
                    </div>
                    <p className="mt-2 break-words text-xs text-[var(--poskoo-muted)]">{group.hashtags.map((hashtag) => `#${hashtag}`).join(" ")}</p>
                  </article>
                ))}
              </div>
            )}
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <div>
                <label htmlFor={hashtagGroupNameId} className="sr-only">New hashtag group name</label>
                <input id={hashtagGroupNameId} value={hashtagGroupName} maxLength={80} onChange={(event) => setHashtagGroupName(event.target.value)} placeholder="Group name" className="w-full rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)]" />
              </div>
              <div>
                <label htmlFor={hashtagTextId} className="sr-only">Hashtags for the new group</label>
                <input id={hashtagTextId} value={hashtagText} onChange={(event) => setHashtagText(event.target.value)} placeholder="#launch #newproduct" className="w-full rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)]" />
              </div>
            </div>
            <button type="button" disabled={extrasPending || !hashtagGroupName.trim() || !hashtagText.trim()} onClick={handleHashtagGroupSave} className="mt-2 rounded-full border border-[var(--poskoo-line)] px-3 py-2 text-sm font-medium text-[var(--poskoo-ink)] disabled:opacity-60">Save hashtag group</button>
          </details>

          {igFormat !== "story" && (
            <div>
              <label htmlFor={firstCommentId} className="text-sm font-medium text-[var(--poskoo-ink)]">
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
            <span className="text-sm font-medium text-[var(--poskoo-ink)]">Media</span>
            <div
              id={imageId}
              tabIndex={-1}
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleMediaDrop}
              className={`mt-2 rounded-2xl border-2 border-dashed p-4 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)] ${
                dragActive
                  ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-violet)]/5"
                  : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)]"
              }`}
            >
              <UploadCloud className="mx-auto h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden />
              <p className="mt-2 text-sm font-medium text-[var(--poskoo-ink)]">Drag &amp; drop images or videos</p>
              <p className="mt-1 text-xs text-[var(--poskoo-muted)]">
                JPG or PNG up to {formatBytes(maxBytesForTargets("image", { plan: mediaPlan, platforms: selectedPlatforms, igFormat: enabled.instagram ? igFormat : "feed" }))} · MP4 or MOV up to {formatBytes(maxBytesForTargets("video", { plan: mediaPlan, platforms: selectedPlatforms, igFormat: enabled.instagram ? igFormat : "feed" }))} · up to 10 images
              </p>
              <label
                htmlFor={mediaInputId}
                className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-[var(--poskoo-violet)] px-4 py-2 text-sm font-medium text-[var(--poskoo-violet)] transition-colors hover:bg-[var(--poskoo-violet)]/10"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <UploadCloud className="h-4 w-4" aria-hidden />
                )}
                {uploading ? "Uploading…" : "Choose files"}
              </label>
              <input
                id={mediaInputId}
                type="file"
                accept="image/jpeg,image/png,video/mp4,video/quicktime"
                multiple
                disabled={uploading}
                onChange={handleMediaInput}
                className="sr-only"
              />
            </div>
            {uploadProgress && (
              <div className="mt-2 flex items-center gap-3" aria-live="polite">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-[var(--poskoo-muted)]">
                    Uploading {uploadProgress.name} · {formatBytes(uploadProgress.loaded)} of {formatBytes(uploadProgress.total)}
                  </p>
                  <div
                    className="mt-1 h-2 overflow-hidden rounded-full bg-[var(--poskoo-line)]"
                    role="progressbar"
                    aria-label={`Uploading ${uploadProgress.name}`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round((uploadProgress.loaded / Math.max(1, uploadProgress.total)) * 100)}
                  >
                    <div
                      className="h-full rounded-full bg-[var(--poskoo-violet)] transition-[width]"
                      style={{ width: `${Math.min(100, Math.round((uploadProgress.loaded / Math.max(1, uploadProgress.total)) * 100))}%` }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={cancelUpload}
                  className="shrink-0 rounded-full border border-[var(--poskoo-line)] px-3 py-1 text-xs font-medium text-[var(--poskoo-ink)] hover:bg-[var(--poskoo-line)]/40"
                >
                  Cancel
                </button>
              </div>
            )}
            {uploadError && (
              <p className="mt-2 text-sm text-[var(--poskoo-coral)]" role="alert">
                {uploadError}
              </p>
            )}
            {attachedMediaIssues.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-[var(--poskoo-coral)]" role="status">
                {attachedMediaIssues.map((issue) => (
                  <li key={issue}>{issue}</li>
                ))}
              </ul>
            )}
            {mediaWarnings.length > 0 && (
              <ul className="mt-2 space-y-1 text-xs text-[var(--poskoo-coral)]">
                {mediaWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            )}
            {filledMediaCount > 0 && (
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {mediaUrls.map((url, index) => {
                  const trimmed = url.trim();
                  if (!trimmed) return null;
                  const kind = mediaKindFromUrl(trimmed);
                  return (
                    <li
                      key={`${trimmed}-${index}`}
                      className="relative overflow-hidden rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)]"
                    >
                      {kind === "video" ? (
                        <video
                          src={trimmed}
                          className="h-28 w-full object-cover"
                          muted
                          playsInline
                          preload="metadata"
                        />
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={trimmed}
                          alt={`Media ${index + 1}`}
                          className="h-28 w-full object-cover"
                        />
                      )}
                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-medium text-white">
                        {index + 1}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/55 p-1">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveMedia(index, -1)}
                            disabled={index === 0}
                            aria-label="Move media earlier"
                            className="rounded bg-white/90 p-1 text-[var(--poskoo-ink)] disabled:opacity-40"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveMedia(index, 1)}
                            disabled={index === mediaUrls.length - 1}
                            aria-label="Move media later"
                            className="rounded bg-white/90 p-1 text-[var(--poskoo-ink)] disabled:opacity-40"
                          >
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          aria-label="Remove media"
                          className="rounded bg-white/90 p-1 text-[var(--poskoo-coral)]"
                        >
                          <X className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
            <button
              type="button"
              onClick={() => setLinkMode((open) => !open)}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--poskoo-violet)]"
            >
              <Link2 className="h-4 w-4" aria-hidden />
              {linkMode ? "Hide link fields" : "Add from link"}
            </button>
            {linkMode && (
              <div className="mt-2 space-y-2">
                {mediaUrls.map((url, index) => {
                  const fieldId = index === 0 ? `${imageId}-link` : `${imageId}-link-${index}`;
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
                        placeholder="https://example.com/photo.jpg"
                        className="min-w-0 flex-1 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none"
                      />
                      {mediaUrls.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="shrink-0 rounded-lg border border-[var(--poskoo-line)] px-2 py-2 text-xs font-medium text-[var(--poskoo-muted)] transition-colors hover:bg-[var(--poskoo-band)]"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  );
                })}
                {mediaUrls.length < 10 && !(enabled.instagram && igFormat === "story") && (
                  <button
                    type="button"
                    onClick={() =>
                      setMediaUrls((prev) => (prev.length >= 10 ? prev : [...prev, ""]))
                    }
                    className="text-sm font-medium text-[var(--poskoo-violet)] hover:underline"
                  >
                    + Add another link
                  </button>
                )}
                <p className="text-xs text-[var(--poskoo-muted)]">
                  Paste a public https link (for example from your website or cloud storage); a .mp4 link is posted as a Reel. 2–10 image links = carousel post.
                </p>
              </div>
            )}
            {enabled.instagram && (
              <fieldset id={igFormatLegendId} tabIndex={-1} className="mt-3 border-0 p-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)]">
                <legend className="text-sm font-medium text-[var(--poskoo-ink)]">
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
            {storyMediaError && (
              <p className="mt-2 text-sm text-[var(--poskoo-coral)]" aria-live="polite">
                A Story takes one image or video.
              </p>
            )}
          </div>

          {enabled.youtube && (
            <div>
              <span className="text-sm font-medium text-[var(--poskoo-ink)]">YouTube video details</span>
              <div className="mt-2 space-y-3">
                <div>
                  <label htmlFor={ytTitleId} className="text-sm font-medium text-[var(--poskoo-ink)]">
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
                  <label htmlFor={ytTagsId} className="text-sm font-medium text-[var(--poskoo-ink)]">
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
                  <label htmlFor={ytPrivacyId} className="text-sm font-medium text-[var(--poskoo-ink)]">
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
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--poskoo-ink)]">
                  <input
                    type="checkbox"
                    checked={ytShorts}
                    onChange={(e) => setYtShorts(e.target.checked)}
                    className="rounded border-[var(--poskoo-line)] text-[var(--poskoo-violet)] focus:ring-[var(--poskoo-violet)]"
                  />
                  This is a Short (vertical, under 60 seconds)
                </label>
                <p className="text-xs text-[var(--poskoo-muted)]">
                  The caption above is used as the video description. Upload an MP4 video above or add a link.
                </p>
              </div>
            </div>
          )}

          <NetworkOptionsPanel
            enabled={enabled}
            options={netOptions}
            onChange={(network, value) => setNetOptions((prev) => ({ ...prev, [network]: value }))}
            mediaUrls={mediaUrls}
            data={networkData}
          />

          <div>
            {rules.length > 0 ? (
              <>
                <label htmlFor={dmRuleId} className="text-sm font-medium text-[var(--poskoo-ink)]">
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
                <span className="text-sm font-medium text-[var(--poskoo-ink)]">Auto-DM rule (optional)</span>
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
              <div role="tablist" aria-label="Customize per network" className="flex gap-1 overflow-x-auto border-b border-[var(--poskoo-line)] [scrollbar-width:none]">
                {selected.map((platform) => {
                  const TabIcon = PLATFORM_ICON[platform];
                  const on = activeTab === platform;
                  return (
                    <button
                      key={platform}
                      type="button"
                      role="tab"
                      aria-selected={on}
                      onClick={() => setActiveTab(platform)}
                      className={`-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                        on ? "border-[var(--poskoo-ink)] text-[var(--poskoo-ink)]" : "border-transparent text-[var(--poskoo-muted)] hover:text-[var(--poskoo-ink)]"
                      }`}
                    >
                      <TabIcon className="h-4 w-4" style={{ color: NET_COLOR[platform] }} aria-hidden />
                      {PLATFORMS[platform].label}
                    </button>
                  );
                })}
              </div>
              <div role="tabpanel" className="rounded-b-xl border border-t-0 border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
                {(() => {
                  const platform = activeTab;
                  if (!enabled[platform]) return null;
                  const config = PLATFORMS[platform];
                  const text = effectiveCaption(platform, mainCaption, customize, customCaption);
                  const check = checkCaption(platform, text, captionMaxOverrides[platform]);
                  return (
                    <>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--poskoo-ink)]">
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
                      <p className={`mt-3 text-sm tabular-nums ${counterClass(check.length, check.max)}`}>
                        {check.length.toLocaleString("en-US")} / {check.max.toLocaleString("en-US")}
                        {platform === "bluesky" ? " characters (graphemes)" : platform === "x" ? " (links count as 23)" : ""}
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
              <label htmlFor={scheduleId} className="text-sm font-medium text-[var(--poskoo-ink)]">
                Schedule
              </label>
              <input
                ref={scheduleInputRef}
                id={scheduleId}
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => changeScheduledAt(e.target.value)}
                className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-sm focus:border-[var(--poskoo-violet)] focus:outline-none"
              />
              {selectedScheduleLabel && (
                <p className="mt-2 text-sm font-medium text-[var(--poskoo-ink)]" aria-live="polite">
                  Selected: {selectedScheduleLabel}{timeZone ? ` (${timeZone})` : ""}
                </p>
              )}
              {nextSlotLabel && (
                <p className="mt-1 text-xs text-[var(--poskoo-muted)]">
                  Account schedule: {nextSlotLabel}
                </p>
              )}
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
                        onClick={() => changeScheduledAt(toLocalInputValue(nextSlotLocal(h)))}
                        className="rounded-full border border-[var(--poskoo-line)] px-3 py-1 text-xs text-[var(--poskoo-ink)] hover:border-[var(--poskoo-violet)] hover:text-[var(--poskoo-violet)]"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
              {queueReady && (
                <div className="relative mt-2 inline-flex" data-composer-pop>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={handleNextAvailable}
                    className="inline-flex items-center gap-1.5 rounded-l-full border border-[var(--poskoo-line)] py-1 pl-3 pr-2.5 text-xs font-medium text-[var(--poskoo-violet)] hover:bg-[var(--poskoo-band)] disabled:opacity-60"
                  >
                    Next available
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={toggleSlotMenu}
                    aria-expanded={openTool === "slots"}
                    aria-haspopup="menu"
                    aria-label="More times"
                    className="-ml-px inline-flex items-center rounded-r-full border border-[var(--poskoo-line)] px-2 py-1 text-[var(--poskoo-violet)] hover:bg-[var(--poskoo-band)] disabled:opacity-60"
                  >
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  {openTool === "slots" && (
                    <div role="menu" aria-label="Pick a time" className="absolute left-0 top-full z-30 mt-1.5 w-[260px] rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1.5 shadow-[0_8px_24px_rgba(30,22,49,.12)]">
                      <p className="m-0 px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--poskoo-muted)]">Next free slots</p>
                      {slotOptions === null && !slotsError && (
                        <p className="m-0 flex items-center gap-2 px-2.5 py-2 text-sm text-[var(--poskoo-muted)]">
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Finding times…
                        </p>
                      )}
                      {slotsError && <p className="m-0 px-2.5 py-2 text-sm text-[var(--poskoo-coral)]">{slotsError}</p>}
                      {slotOptions?.map((slot) => {
                        const at = new Date(slot.iso);
                        return (
                          <button
                            key={slot.iso}
                            type="button"
                            role="menuitem"
                            onClick={() => applySlot(slot.iso, slot.timeZone)}
                            className="block w-full rounded-lg px-2.5 py-2 text-left text-sm text-[var(--poskoo-ink)] hover:bg-[var(--poskoo-band)]"
                          >
                            {at.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                          </button>
                        );
                      })}
                      <button
                        type="button"
                        role="menuitem"
                        onClick={pickDateTime}
                        className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-[var(--poskoo-line)] px-2.5 py-2 text-left text-sm font-medium text-[var(--poskoo-violet)] hover:bg-[var(--poskoo-band)]"
                      >
                        <CalendarClock className="h-4 w-4" aria-hidden /> Pick date &amp; time
                      </button>
                    </div>
                  )}
                </div>
              )}
              {!queueReady && (
                <p className="mt-1 text-xs text-[var(--poskoo-muted)]">
                  Set a posting schedule in Settings → Channels to use “Next available” and “Add to queue”.
                </p>
              )}
              <p className="mt-1 text-xs text-[var(--poskoo-muted)]">Timezone: {timeZone || "…"}</p>
            </div>
          </div>


        </div>

        <div className="composerPreview">
          <div className="composerPreviewCard space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 lg:sticky lg:top-0 lg:self-start">
            <PostPreview
              selected={selected}
              captions={Object.fromEntries(selected.map((p) => [p, effectiveCaption(p, mainCaption, customize, customCaption)]))}
              mediaUrls={mediaUrls}
              accountNames={accountNames}
              netOptions={netOptions}
              whenLabel={selectedScheduleDate && !Number.isNaN(selectedScheduleDate.getTime())
                ? selectedScheduleDate.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
                : "now"}
            />
            <PublishingChecklist
              enabled={enabled}
              selected={selected}
              mainCaption={mainCaption}
              firstComment={firstComment}
              customize={customize}
              customCaption={customCaption}
              mediaUrls={mediaUrls}
              igFormat={igFormat}
              ytTitle={ytTitle}
              scheduledAt={scheduledAt}
              timeZone={timeZone}
              onFix={focusChecklistTarget}
            />
          </div>
        </div>
      </div>
      {/* Full-width action bar: sticky at the bottom of the composer window, the last thing in the flow,
          so it never covers the schedule fields once scrolled to the end. */}
      <div className="composerFooter sticky bottom-0 z-10 mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-[var(--poskoo-line)] bg-[var(--poskoo-card)] py-3">
        <div className="mr-auto flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
          {dialog && (
            <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-[var(--poskoo-ink)]">
              <input
                type="checkbox"
                checked={createAnother}
                onChange={(e) => setCreateAnother(e.target.checked)}
                className="h-4 w-4 accent-[var(--poskoo-violet)]"
              />
              Create another
            </label>
          )}
          {scheduledUsage && scheduledUsage.limit !== null && (
            <span
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums ${scheduledUsage.used >= scheduledUsage.limit ? "bg-[var(--poskoo-red)]/10 text-[var(--poskoo-red)]" : "bg-[var(--poskoo-band)] text-[var(--poskoo-muted)]"}`}
              title="Posts scheduled or published this month (UTC) on your plan. Drafts don't count."
            >
              {scheduledUsage.used}/{scheduledUsage.limit} scheduled this month
              {scheduledUsage.used >= scheduledUsage.limit && (
                <Link href="/app/settings/billing" className="underline underline-offset-2">Upgrade</Link>
              )}
            </span>
          )}
        </div>
        <div className="composerActions grid w-full grid-cols-3 gap-2 sm:ml-auto sm:flex sm:w-auto sm:flex-nowrap sm:items-center">
          <button
            type="button"
            disabled={isPending || uploading || storyMediaError}
            onClick={() => handleSave("draft")}
            className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium text-[var(--poskoo-ink)] transition-colors hover:bg-[var(--poskoo-band)] disabled:opacity-60 sm:px-4"
          >
            {isPending ? "Saving…" : "Save draft"}
          </button>
          <button
            type="button"
            disabled={isPending || uploading || !queueReady || storyMediaError}
            onClick={() => handleSave("queue")}
            title={queueReady ? undefined : "Set a posting schedule in Settings → Channels first"}
            className="whitespace-nowrap rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-sm font-medium text-[var(--poskoo-ink)] transition-colors hover:border-[var(--poskoo-violet)] hover:text-[var(--poskoo-violet)] disabled:opacity-60 sm:px-4"
          >
            {isPending ? "Saving…" : "Add to queue"}
          </button>
          <button
            type="button"
            disabled={isPending || uploading || !scheduledAt || storyMediaError}
            onClick={() => handleSave("schedule")}
            className={`${ui.inkFill} whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold disabled:opacity-60 sm:px-5`}
          >
            {isPending ? "Saving…" : "Schedule post"}
          </button>
        </div>
        {feedback && (
          <p
            className={`m-0 basis-full text-sm ${feedback.kind === "ok" ? "text-[var(--poskoo-green)]" : "text-[var(--poskoo-coral)]"}`}
            role={feedback.kind === "err" ? "alert" : "status"}
          >
            {feedback.text}
          </p>
        )}
      </div>
    </section>
  );
}
