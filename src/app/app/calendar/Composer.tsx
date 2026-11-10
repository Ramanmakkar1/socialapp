"use client";

import { useCallback, useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, AtSign, Facebook, Instagram, Link2, Loader2, Sparkles, UploadCloud, X, Youtube as YouTube } from "lucide-react";
import { deleteHashtagGroup, deleteTemplate, listHashtagGroups, listTemplates, nextAvailableSlot, saveHashtagGroup, savePost, saveTemplate } from "./actions";
import PublishingChecklist, { type ChecklistFixTarget } from "./PublishingChecklist";
import { aiAvailable, suggestCaptions } from "./aiActions";
import { BRAND } from "@/lib/brand";
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
import { dayPrefill } from "@/lib/composerUrl";
import { instagramAspectWarning, mediaKindFromUrl, validateMediaFile } from "@/lib/mediaUpload";
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

function readImageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(objectUrl);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read the image."));
    };
    image.src = objectUrl;
  });
}

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

  const [enabled, setEnabled] = useState<Record<PlatformId, boolean>>(init.enabled);
  const [activeTab, setActiveTab] = useState<PlatformId>("instagram");
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
  const [dragActive, setDragActive] = useState(false);
  const [linkMode, setLinkMode] = useState(false);
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
  const [extrasPending, startExtrasTransition] = useTransition();
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
    };
  }

  const filledMediaCount = mediaUrls.map((u) => u.trim()).filter((u) => u !== "").length;
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
    setUploading(true);
    const warnings: string[] = [];
    try {
      for (const file of queue) {
        const check = validateMediaFile({ type: file.type, size: file.size, name: file.name });
        if (!check.ok) {
          setUploadError(check.error);
          continue;
        }
        if (check.kind === "image" && !storyMode) {
          try {
            const size = await readImageSize(file);
            const warning = instagramAspectWarning(size.width, size.height);
            if (warning) warnings.push(`${file.name}: ${warning}`);
          } catch {
            // The server still validates type and size; a preview failure is not fatal.
          }
        }
        const body = new FormData();
        body.append("file", file);
        const response = await fetch("/api/media/upload", { method: "POST", body });
        const result = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!response.ok || !result.url) {
          setUploadError(result.error || "Could not upload that file. Please try again.");
          continue;
        }
        if (storyMode) setMediaUrls([result.url]);
        else addMediaUrl(result.url);
      }
    } catch {
      setUploadError("Could not upload that file. Please try again.");
    } finally {
      setUploading(false);
      setMediaWarnings(warnings);
    }
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

          <details className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
            <summary className="cursor-pointer text-sm font-medium text-[#3d3450]">Saved post templates</summary>
            {templates.length > 0 && (
              <div className="mt-3 space-y-2">
                {templates.map((template) => (
                  <article key={template.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-[var(--poskoo-paper)] p-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-[#3d3450]">{template.name}</h3>
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
              <button type="button" disabled={extrasPending || !templateName.trim()} onClick={handleTemplateSave} className="rounded-full border border-[var(--poskoo-line)] px-3 py-2 text-sm font-medium text-[#3d3450] disabled:opacity-60">Save current as template</button>
            </div>
          </details>

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

          <div>
            <label htmlFor={postTagsId} className="text-sm font-medium text-[#3d3450]">Campaign tags (optional)</label>
            <input id={postTagsId} value={postTags} onChange={(event) => setPostTags(event.target.value)} placeholder="Spring launch, awareness" aria-describedby={`${postTagsId}-help`} className="mt-2 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-sm text-[var(--poskoo-ink)] placeholder:text-[var(--poskoo-muted)] focus:border-[var(--poskoo-violet)] focus:outline-none" />
            <p id={`${postTagsId}-help`} className="mt-1 text-xs text-[var(--poskoo-muted)]">Separate up to 10 tags with commas. Use them to filter the queue and calendar.</p>
          </div>

          <details className="rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
            <summary className="cursor-pointer text-sm font-medium text-[#3d3450]">Saved hashtag groups</summary>
            {hashtagGroups.length > 0 && (
              <div className="mt-3 space-y-2">
                {hashtagGroups.map((group) => (
                  <article key={group.id} className="rounded-lg bg-[var(--poskoo-paper)] p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="min-w-0 flex-1 text-sm font-semibold text-[#3d3450]">{group.name}</h3>
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
            <button type="button" disabled={extrasPending || !hashtagGroupName.trim() || !hashtagText.trim()} onClick={handleHashtagGroupSave} className="mt-2 rounded-full border border-[var(--poskoo-line)] px-3 py-2 text-sm font-medium text-[#3d3450] disabled:opacity-60">Save hashtag group</button>
          </details>

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
            <span className="text-sm font-medium text-[#3d3450]">Media</span>
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
              <p className="mt-2 text-sm font-medium text-[#3d3450]">Drag &amp; drop images or videos</p>
              <p className="mt-1 text-xs text-[var(--poskoo-muted)]">
                JPG or PNG up to 8 MB · MP4 or MOV up to 100 MB · up to 10 images
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
            {uploadError && (
              <p className="mt-2 text-sm text-[var(--poskoo-coral)]" role="alert">
                {uploadError}
              </p>
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
                      <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {index + 1}
                      </span>
                      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/55 p-1">
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveMedia(index, -1)}
                            disabled={index === 0}
                            aria-label="Move media earlier"
                            className="rounded bg-white/90 p-1 text-[#3d3450] disabled:opacity-40"
                          >
                            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveMedia(index, 1)}
                            disabled={index === mediaUrls.length - 1}
                            aria-label="Move media later"
                            className="rounded bg-white/90 p-1 text-[#3d3450] disabled:opacity-40"
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
                        placeholder="https://…/photo.jpg"
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
                  The caption above is used as the video description. Upload an MP4 video above or add a link.
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
              disabled={isPending || uploading || storyMediaError}
              onClick={() => handleSave("draft")}
              className="rounded-full border border-[var(--poskoo-line)] px-4 py-2 text-sm font-medium text-[var(--poskoo-ink)] transition-colors hover:bg-[var(--poskoo-band)] disabled:opacity-60"
            >
              {isPending ? "Saving…" : "Save draft"}
            </button>
            <button
              type="button"
              disabled={isPending || uploading || !scheduledAt || storyMediaError}
              onClick={() => handleSave("schedule")}
              className={`${ui.inkFill} rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60`}
            >
              {isPending ? "Saving…" : "Schedule"}
            </button>
            <button
              type="button"
              disabled={isPending || uploading || !queueReady || storyMediaError}
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
                {(() => {
                  const firstMedia = mediaUrls.map((u) => u.trim()).find((u) => u !== "") ?? "";
                  if (!firstMedia) {
                    return <div className="mt-3 aspect-square w-full rounded-lg bg-[var(--poskoo-band)]" aria-hidden />;
                  }
                  if (mediaKindFromUrl(firstMedia) === "video") {
                    return (
                      <video
                        src={firstMedia}
                        className="mt-3 aspect-square w-full rounded-lg object-cover"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    );
                  }
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={firstMedia}
                      alt="Post media preview"
                      className="mt-3 aspect-square w-full rounded-lg object-cover"
                    />
                  );
                })()}
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
