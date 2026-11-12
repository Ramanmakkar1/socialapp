"use client";

import { useEffect, useState } from "react";
import { countChars, PLATFORM_LIMITS } from "@/lib/captionLimits";
import { planFacebookPost } from "@/lib/facebookPublish";
import { checkCaption, PLATFORM_IDS, PLATFORMS, type PlatformId } from "@/lib/platforms";


export type ChecklistFixTarget =
  | { kind: "platforms" }
  | { kind: "media" }
  | { kind: "schedule" }
  | { kind: "mainCaption" }
  | { kind: "firstComment" }
  | { kind: "igFormat" }
  | { kind: "ytTitle" }
  | { kind: "platformCaption"; platform: PlatformId };

type MediaItem = { type: "image" | "video"; url: string };

function parseMediaLink(
  trimmed: string,
): { ok: true; item: MediaItem } | { ok: false; error: string } {
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      error: "Media link must be a public https link to a .jpg, .png or .mp4 file.",
    };
  }
  const pathname = parsed.pathname.toLowerCase();
  let detectedType: "image" | "video" | null = null;
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg") || pathname.endsWith(".png")) {
    detectedType = "image";
  } else if (pathname.endsWith(".mp4") || pathname.endsWith(".mov")) {
    detectedType = "video";
  }
  if (parsed.protocol !== "https:" || trimmed.length > 2000 || !detectedType) {
    return {
      ok: false,
      error: "Media link must be a public https link to a .jpg, .png or .mp4 file.",
    };
  }
  return { ok: true, item: { type: detectedType, url: trimmed } };
}

function effectiveCaption(
  platform: PlatformId,
  main: string,
  customize: Record<PlatformId, boolean>,
  custom: Record<PlatformId, string>,
): string {
  return customize[platform] ? custom[platform] : main;
}

function toLocalInputValue(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function formatExplainer(igFormat: "feed" | "story", mediaCount: number, hasVideo: boolean): string {
  if (igFormat === "story") {
    return "Story — one image or video; caption is not shown on Instagram.";
  }
  if (mediaCount === 0) {
    return "Feed post — add at least one https media link to schedule.";
  }
  if (mediaCount > 1) {
    return hasVideo
      ? "Carousel — images only (no video in a carousel)."
      : `Carousel — ${mediaCount} image links (2–10).`;
  }
  return hasVideo ? "Feed — single video (.mp4) posts as a Reel." : "Feed — single image post.";
}

type Check = { key: string; label: string; hint: string; state: "done" | "todo" | "error"; fix?: ChecklistFixTarget; fixLabel: string };

function StatusIcon({ state }: { state: Check["state"] }) {
  if (state === "done") {
    return (
      <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-[var(--poskoo-green)] text-[11px] font-bold leading-none text-white" aria-hidden>
        ✓
      </span>
    );
  }
  return (
    <span className="grid h-4 w-4 shrink-0 place-items-center" aria-hidden>
      <span className={`h-2 w-2 rounded-full ${state === "error" ? "bg-[#f5a524]" : "bg-[var(--poskoo-line)] ring-1 ring-[var(--poskoo-muted)]/30"}`} />
    </span>
  );
}

export type PublishingChecklistProps = {
  enabled: Record<PlatformId, boolean>;
  /** The composer's selected channels (same list as its tabs and preview). Defaults to every enabled platform. */
  selected?: PlatformId[];
  mainCaption: string;
  firstComment: string;
  customize: Record<PlatformId, boolean>;
  customCaption: Record<PlatformId, string>;
  mediaUrls: string[];
  igFormat: "feed" | "story";
  ytTitle: string;
  scheduledAt: string;
  timeZone: string;
  onFix: (target: ChecklistFixTarget) => void;
};

export default function PublishingChecklist({
  enabled,
  selected: selectedProp,
  mainCaption,
  firstComment,
  customize,
  customCaption,
  mediaUrls,
  igFormat,
  ytTitle,
  scheduledAt,
  timeZone,
  onFix,
}: PublishingChecklistProps) {
  const [nowMs, setNowMs] = useState(0);
  useEffect(() => {
    const tick = () => setNowMs(Date.now());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  // One source of truth with the composer tabs/preview: every selected network counts (Bluesky, TikTok, …).
  const selected = selectedProp ?? PLATFORM_IDS.filter((p) => enabled[p]);
  const instagramOn = selected.includes("instagram");

  const urlList = mediaUrls.map((u) => u.trim()).filter((u) => u !== "");
  const mediaItems: MediaItem[] = [];
  let mediaError: string | null = null;
  for (const trimmed of urlList) {
    const parsed = parseMediaLink(trimmed);
    if (!parsed.ok) {
      mediaError = parsed.error;
      break;
    }
    mediaItems.push(parsed.item);
  }
  if (!mediaError && urlList.length > 10) {
    mediaError = "Up to 10 images per carousel.";
  }
  if (!mediaError && mediaItems.length > 1 && mediaItems.some((m) => m.type === "video")) {
    mediaError = "Carousels can only have images for now.";
  }
  if (!mediaError && igFormat === "story" && mediaItems.length > 1) {
    mediaError = "A Story takes one image or video.";
  }

  const needsMediaForSchedule =
    instagramOn && igFormat === "story" ? mediaItems.length !== 1 : instagramOn && mediaItems.length === 0;
  const youtubeOn = selected.includes("youtube");
  const youtubeNeedsVideo = youtubeOn && mediaItems.filter((m) => m.type === "video").length === 0;

  let mediaDetail = formatExplainer(
    instagramOn ? igFormat : "feed",
    mediaItems.length,
    mediaItems.some((m) => m.type === "video"),
  );
  if (mediaError) mediaDetail = mediaError;
  else if (needsMediaForSchedule) {
    mediaDetail =
      igFormat === "story"
        ? "Story scheduling needs exactly one valid https media link."
        : "Instagram scheduling needs at least one valid https media link.";
  } else if (youtubeNeedsVideo) {
    mediaDetail = "YouTube scheduling needs a .mp4 video link.";
  } else if (urlList.length === 0) {
    mediaDetail = "No media added yet — optional for drafts; required to schedule on Instagram.";
  }

  const mediaComplete =
    !mediaError &&
    !(instagramOn && needsMediaForSchedule) &&
    !youtubeNeedsVideo &&
    (urlList.length === 0 || mediaItems.length === urlList.length);

  const firstCommentMax = PLATFORM_LIMITS.instagram.max ?? 2200;
  const firstCommentOver = countChars(firstComment) > firstCommentMax;
  const showFirstComment = instagramOn && igFormat !== "story";

  type PlatformIssue = { text: string; fixTarget: ChecklistFixTarget };
  const platformReadiness = selected.map((platform) => {
    const text = effectiveCaption(platform, mainCaption, customize, customCaption);
    const check = checkCaption(platform, text);
    const captionFix: ChecklistFixTarget = customize[platform]
      ? { kind: "platformCaption", platform }
      : { kind: "mainCaption" };
    const issues: PlatformIssue[] = [];
    if (!text.trim()) {
      issues.push({ text: "Add a caption.", fixTarget: captionFix });
    } else if (check.errors.length > 0) {
      issues.push({ text: check.errors[0], fixTarget: captionFix });
    }
    if (mediaError) {
      issues.push({ text: mediaError, fixTarget: { kind: "media" } });
    } else if (platform === "instagram" && needsMediaForSchedule) {
      issues.push({
        text:
          igFormat === "story"
            ? "Add exactly one image or video for this Story."
            : "Add at least one image or video.",
        fixTarget: { kind: "media" },
      });
    } else if (platform === "facebook") {
      if (text.trim() || mediaItems.length > 0) {
        const plan = planFacebookPost(text, mediaItems);
        if ("error" in plan) {
          issues.push({
            text: plan.error,
            fixTarget: plan.error.toLowerCase().includes("caption") ? captionFix : { kind: "media" },
          });
        }
      }
    } else if (platform === "youtube") {
      if (!ytTitle.trim()) {
        issues.push({ text: "Add a video title.", fixTarget: { kind: "ytTitle" } });
      }
      if (mediaItems.filter((m) => m.type === "video").length === 0) {
        issues.push({ text: "Add a .mp4 video link.", fixTarget: { kind: "media" } });
      }
    }
    if (platform === "instagram" && showFirstComment && firstCommentOver) {
      issues.push({
        text: `First comment must be ${firstCommentMax.toLocaleString("en-US")} characters or fewer.`,
        fixTarget: { kind: "firstComment" },
      });
    }
    return { platform, label: PLATFORMS[platform].label, issues };
  });


  let scheduleComplete = false;
  let scheduleDetail = "Pick a date and time in your local timezone.";
  if (scheduledAt) {
    const scheduleDate = new Date(scheduledAt);
    if (Number.isNaN(scheduleDate.getTime()) || toLocalInputValue(scheduleDate) !== scheduledAt) {
      scheduleDetail = "Enter a complete local date and time.";
    } else if (nowMs === 0) {
      scheduleDetail = "Checking schedule time…";
    } else if (scheduleDate.getTime() <= nowMs + 60_000) {
      scheduleDetail = "Schedule time must be more than one minute from now.";
    } else {
      scheduleComplete = true;
      const when = scheduleDate.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
      scheduleDetail = timeZone
        ? `${when} (${timeZone})`
        : `${when} (your browser timezone)`;
    }
  }

  const labels = selected.map((p) => PLATFORMS[p].label);
  const listLabel = labels.length <= 2 ? labels.join(" and ") : `${labels.length} channels`;

  // Media other networks need before they can publish (Instagram/YouTube rules come from the checks above).
  const tiktokNeedsVideo = selected.includes("tiktok") && !mediaItems.some((m) => m.type === "video");
  const pinterestNeedsImage = selected.includes("pinterest") && !mediaItems.some((m) => m.type === "image");
  const mediaRequired = (instagramOn && igFormat !== "story") || youtubeOn || selected.includes("tiktok") || selected.includes("pinterest");
  const mediaOk = mediaComplete && !tiktokNeedsVideo && !pinterestNeedsImage;
  let mediaHint: string;
  if (mediaError) mediaHint = mediaError;
  else if (tiktokNeedsVideo) mediaHint = "TikTok needs a video";
  else if (pinterestNeedsImage) mediaHint = "Pinterest needs an image";
  else if (!mediaComplete) mediaHint = mediaDetail;
  else if (urlList.length === 0) mediaHint = selected.length === 0 ? "optional" : mediaRequired ? "required" : `optional for ${listLabel}`;
  else mediaHint = `${urlList.length} ${urlList.length === 1 ? "file" : "files"} added`;

  // Content issues from the per-network checks (caption, YouTube title, first comment, Facebook rules);
  // media issues have their own row. An empty caption is fine for a media-only post on networks that allow it.
  const textFirst = selected.some((p) => p === "bluesky" || p === "x" || p === "threads" || p === "mastodon");
  const contentIssue = platformReadiness
    .flatMap((r) => r.issues.map((issue) => ({ ...issue, platform: r.platform })))
    .find((issue) => issue.fixTarget.kind !== "media" && !(issue.text === "Add a caption." && mediaItems.length > 0 && !textFirst));
  const contentLabel = contentIssue?.fixTarget.kind === "ytTitle" ? "Title" : contentIssue?.fixTarget.kind === "firstComment" ? "First comment" : "Caption";
  const contentHint = contentIssue
    ? contentIssue.text === "Add a caption."
      ? `add text for ${PLATFORMS[contentIssue.platform].label}`
      : contentIssue.text.replace(/\.$/, "")
    : "";

  const checks: Check[] = [
    {
      key: "channel",
      label: "Channel",
      hint: selected.length > 0 ? `${listLabel} selected` : "none selected",
      state: selected.length > 0 ? "done" : "todo",
      fix: { kind: "platforms" },
      fixLabel: "Choose",
    },
    ...(contentIssue
      ? [{ key: "content", label: contentLabel, hint: contentHint, state: "error" as const, fix: contentIssue.fixTarget, fixLabel: "Edit" }]
      : []),
    {
      key: "media",
      label: "Media",
      hint: mediaHint,
      state: mediaOk ? "done" : mediaError ? "error" : "todo",
      fix: { kind: "media" },
      fixLabel: "Add",
    },
    {
      key: "time",
      label: "Time",
      hint: scheduleComplete ? scheduleDetail : scheduledAt ? scheduleDetail.replace(/\.$/, "") : "not set",
      state: scheduleComplete ? "done" : scheduledAt ? "error" : "todo",
      fix: { kind: "schedule" },
      fixLabel: "Set",
    },
  ];
  const done = checks.filter((c) => c.state === "done").length;

  return (
    <aside className="border-t border-[var(--poskoo-line)] pt-3" aria-labelledby="publishing-checklist-heading">
      <div className="flex items-center gap-3">
        <h3 id="publishing-checklist-heading" className="m-0 text-sm font-semibold text-[var(--poskoo-ink)]">
          {done === checks.length ? "Ready to schedule" : "Before you schedule"}
        </h3>
        <span className="ml-auto text-xs tabular-nums text-[var(--poskoo-muted)]" aria-live="polite">
          {done}/{checks.length}
        </span>
        <span className="h-1 w-16 overflow-hidden rounded-full bg-[var(--poskoo-band)]" aria-hidden>
          <span
            className="block h-full rounded-full bg-[var(--poskoo-green)] transition-[width] motion-reduce:transition-none"
            style={{ width: `${Math.round((done / checks.length) * 100)}%` }}
          />
        </span>
      </div>
      <ul className="mt-2 space-y-0.5" aria-label="Publishing checks">
        {checks.map((c) => (
          <li key={c.key} className="relative flex min-h-8 items-center gap-2.5 text-sm">
            <StatusIcon state={c.state} />
            <span className="sr-only">{c.state === "done" ? "Done: " : "Needs attention: "}</span>
            <span className="min-w-0 flex-1 truncate" title={`${c.label} · ${c.hint}`}>
              <span className="font-medium text-[var(--poskoo-ink)]">{c.label}</span>
              <span className="text-[var(--poskoo-muted)]"> · {c.hint}</span>
            </span>
            {c.state !== "done" && c.fix && (
              <button
                type="button"
                onClick={() => onFix(c.fix!)}
                className="shrink-0 rounded px-1 text-xs font-semibold text-[var(--poskoo-violet)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--poskoo-violet)]"
                aria-label={`${c.fixLabel} ${c.label.toLowerCase()}`}
              >
                {c.fixLabel}
              </button>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}
