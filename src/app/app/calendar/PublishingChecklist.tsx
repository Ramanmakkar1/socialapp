"use client";

import { useEffect, useState } from "react";
import { countChars, PLATFORM_LIMITS } from "@/lib/captionLimits";
import { checkCaption, PLATFORMS, type PlatformId } from "@/lib/platforms";

const PLATFORM_ORDER: PlatformId[] = ["instagram", "facebook", "threads"];

export type ChecklistFixTarget =
  | { kind: "platforms" }
  | { kind: "media" }
  | { kind: "schedule" }
  | { kind: "mainCaption" }
  | { kind: "firstComment" }
  | { kind: "igFormat" }
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

function ChecklistIllustration() {
  return (
    <svg
      viewBox="0 0 120 72"
      className="h-16 w-auto shrink-0 text-brand motion-safe:animate-[checklist-float_4s_ease-in-out_infinite]"
      aria-hidden
      role="presentation"
    >
      <style>{`
        @keyframes checklist-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .motion-safe\\:animate-\\[checklist-float_4s_ease-in-out_infinite\\] {
            animation: none !important;
          }
        }
      `}</style>
      <rect x="8" y="10" width="48" height="52" rx="8" fill="var(--surface-2)" stroke="var(--line)" strokeWidth="1.5" />
      <rect x="16" y="18" width="32" height="6" rx="3" fill="var(--brand)" opacity="0.35" />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x="16" y={30 + row * 12} width="8" height="8" rx="2" fill="var(--line)" />
          <rect x="28" y={31 + row * 12} width="20" height="6" rx="2" fill="var(--line)" />
        </g>
      ))}
      <circle cx="88" cy="28" r="14" fill="var(--brand)" opacity="0.15" />
      <circle cx="88" cy="24" r="6" fill="var(--brand)" opacity="0.5" />
      <path
        d="M78 48c4-8 12-12 20-10 4 1 8 5 10 10-6 2-12 2-18 0-4-1-8-3-12-6z"
        fill="var(--brand-2)"
        opacity="0.25"
      />
      <path
        d="M72 52h32v4H72z"
        fill="var(--surface-2)"
        stroke="var(--line)"
        strokeWidth="1"
        rx="2"
      />
      <path
        d="M76 44l3 3 6-7"
        stroke="var(--ok)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

function Row({
  label,
  detail,
  complete,
  fixTarget,
  onFix,
}: {
  label: string;
  detail: string;
  complete: boolean;
  fixTarget?: ChecklistFixTarget;
  onFix: (target: ChecklistFixTarget) => void;
}) {
  const statusId = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <li className="rounded-xl border border-line bg-bg px-3 py-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-medium text-ink">
            <span
              className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs ${
                complete ? "bg-ok/15 text-ok" : "bg-surface-2 text-muted"
              }`}
              aria-hidden
            >
              {complete ? "✓" : "·"}
            </span>
            <span id={`check-${statusId}`}>{label}</span>
          </div>
          <p className="mt-1 pl-7 text-xs leading-relaxed text-muted">{detail}</p>
        </div>
        {!complete && fixTarget && (
          <button
            type="button"
            onClick={() => onFix(fixTarget)}
            className="shrink-0 rounded-lg border border-brand/40 px-2.5 py-1 text-xs font-medium text-brand transition-colors hover:bg-brand/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            aria-describedby={`check-${statusId}`}
          >
            Fix
          </button>
        )}
      </div>
    </li>
  );
}

export type PublishingChecklistProps = {
  enabled: Record<PlatformId, boolean>;
  mainCaption: string;
  firstComment: string;
  customize: Record<PlatformId, boolean>;
  customCaption: Record<PlatformId, string>;
  mediaUrls: string[];
  igFormat: "feed" | "story";
  scheduledAt: string;
  timeZone: string;
  onFix: (target: ChecklistFixTarget) => void;
};

export default function PublishingChecklist({
  enabled,
  mainCaption,
  firstComment,
  customize,
  customCaption,
  mediaUrls,
  igFormat,
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

  const selected = PLATFORM_ORDER.filter((p) => enabled[p]);
  const instagramOn = enabled.instagram;

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
  } else if (urlList.length === 0) {
    mediaDetail = "No media added yet — optional for drafts; required to schedule on Instagram.";
  }

  const mediaComplete =
    !mediaError &&
    !(instagramOn && needsMediaForSchedule) &&
    (urlList.length === 0 || mediaItems.length === urlList.length);

  const captionRows = selected.map((platform) => {
    const text = effectiveCaption(platform, mainCaption, customize, customCaption);
    const check = checkCaption(platform, text);
    const empty = !text.trim();
    const complete = !empty && check.errors.length === 0;
    let detail = empty
      ? "Add a caption for this platform."
      : check.errors[0] ??
        `${check.length.toLocaleString("en-US")} / ${PLATFORMS[platform].captionMax.toLocaleString("en-US")} characters${
          customize[platform] ? " (custom override)" : ""
        }.`;
    if (complete && check.warnings.length > 0) {
      detail = `${detail} ${check.warnings[0]}`;
    }
    const fixTarget: ChecklistFixTarget = customize[platform]
      ? { kind: "platformCaption", platform }
      : { kind: "mainCaption" };
    return { platform, label: `${PLATFORMS[platform].label} caption`, detail, complete, fixTarget };
  });

  const firstCommentMax = PLATFORM_LIMITS.instagram.max ?? 2200;
  const firstCommentOver = countChars(firstComment) > firstCommentMax;
  const showFirstComment = instagramOn && igFormat !== "story";
  const firstCommentComplete = !showFirstComment || !firstCommentOver;
  const firstCommentDetail = firstCommentOver
    ? `First comment must be ${firstCommentMax.toLocaleString("en-US")} characters or fewer.`
    : `${countChars(firstComment).toLocaleString("en-US")} / ${firstCommentMax.toLocaleString("en-US")} characters.`;

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

  const platformsComplete = selected.length > 0;
  const formatComplete = true;

  const readyCount =
    (platformsComplete ? 1 : 0) +
    (instagramOn ? (formatComplete ? 1 : 0) : 0) +
    (mediaComplete ? 1 : 0) +
    captionRows.filter((r) => r.complete).length +
    (showFirstComment && firstCommentComplete ? 1 : 0) +
    (scheduleComplete ? 1 : 0);
  const totalCount =
    1 +
    (instagramOn ? 1 : 0) +
    1 +
    captionRows.length +
    (showFirstComment ? 1 : 0) +
    1;

  return (
    <aside
      className="rounded-2xl border border-line bg-surface p-4"
      aria-labelledby="publishing-checklist-heading"
    >
      <div className="flex items-start gap-3">
        <ChecklistIllustration />
        <div className="min-w-0 flex-1">
          <h3 id="publishing-checklist-heading" className="text-sm font-semibold text-ink">
            Input readiness
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            Checks what you entered in the composer. Does not verify that media URLs load remotely or that
            platforms will accept delivery.
          </p>
          <p className="mt-1 text-xs font-medium text-ink-2" aria-live="polite">
            {readyCount} of {totalCount} ready to schedule
          </p>
        </div>
      </div>

      <ul className="mt-4 space-y-2" aria-label="Publishing input checklist">
        <Row
          label="Platforms"
          detail={
            platformsComplete
              ? selected.map((p) => PLATFORMS[p].label).join(", ")
              : "Select at least one platform."
          }
          complete={platformsComplete}
          fixTarget={{ kind: "platforms" }}
          onFix={onFix}
        />
        {instagramOn && (
          <Row
            label="Instagram format"
            detail={formatExplainer(igFormat, mediaItems.length, mediaItems.some((m) => m.type === "video"))}
            complete={formatComplete}
            fixTarget={{ kind: "igFormat" }}
            onFix={onFix}
          />
        )}
        <Row
          label="Media links"
          detail={mediaDetail}
          complete={mediaComplete}
          fixTarget={{ kind: "media" }}
          onFix={onFix}
        />
        {captionRows.map((row) => (
          <Row
            key={row.platform}
            label={row.label}
            detail={row.detail}
            complete={row.complete}
            fixTarget={row.fixTarget}
            onFix={onFix}
          />
        ))}
        {showFirstComment && (
          <Row
            label="First comment"
            detail={firstCommentDetail}
            complete={firstCommentComplete}
            fixTarget={{ kind: "firstComment" }}
            onFix={onFix}
          />
        )}
        <Row
          label="Schedule time"
          detail={scheduleDetail}
          complete={scheduleComplete}
          fixTarget={{ kind: "schedule" }}
          onFix={onFix}
        />
      </ul>
    </aside>
  );
}
