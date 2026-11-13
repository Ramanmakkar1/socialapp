"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { CheckCircle2, Film, Trash2, XCircle } from "lucide-react";

type Props = {
  /** Platform name used in the copy and verdicts, e.g. "TikTok". */
  platform: string;
  targetWidth: number;
  targetHeight: number;
  ratioW: number;
  ratioH: number;
  /** Longest allowed duration in seconds, e.g. 600 for 10 minutes. */
  maxSeconds: number;
  /** Note about the app vs desktop duration rules. */
  durationNote?: string;
  /** Label of the file picker. */
  inputLabel?: string;
};

type Loaded = {
  name: string;
  url: string;
  width: number;
  height: number;
  seconds: number;
  ratio: number;
  ratioLabel: string;
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function ratioLabel(w: number, h: number): string {
  const d = gcd(w, h) || 1;
  return `${w / d}:${h / d}`;
}

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "unknown";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  if (m === 0) return `${s}s`;
  return s === 0 ? `${m}m` : `${m}m ${s}s`;
}

function readVideo(file: File): Promise<Omit<Loaded, "url">> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    const done = (fn: () => void) => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      fn();
    };
    video.onloadedmetadata = () => {
      const width = video.videoWidth;
      const height = video.videoHeight;
      const seconds = video.duration;
      done(() => {
        if (!width || !height) {
          reject(new Error("Could not read this video's dimensions. Try exporting it again as an MP4."));
          return;
        }
        resolve({
          name: file.name,
          width,
          height,
          seconds,
          ratio: width / height,
          ratioLabel: ratioLabel(width, height),
        });
      });
    };
    video.onerror = () => {
      done(() => reject(new Error("This file could not be opened as a video. Choose an MP4, MOV or WebM file.")));
    };
    video.src = url;
  });
}

export default function VideoSizeChecker({
  platform,
  targetWidth,
  targetHeight,
  ratioW,
  ratioH,
  maxSeconds,
  durationNote,
  inputLabel,
}: Props) {
  const [video, setVideo] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const urlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileId = useId();

  const targetRatio = ratioW / ratioH;

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function clear() {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
    setVideo(null);
    setError(null);
  }

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    if (!file.type.startsWith("video/")) {
      setError("That file is not a video. Choose an MP4, MOV or WebM file.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setLoading(true);
    try {
      const data = await readVideo(file);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      setVideo({ ...data, url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "This video could not be read. Try another file.");
    } finally {
      setLoading(false);
    }
  }

  const ratioDiff = video ? Math.abs(video.ratio - targetRatio) : 0;
  const exact = video ? video.width === targetWidth && video.height === targetHeight : false;
  const correctShape = video ? ratioDiff < 0.01 : false;
  const tooSmall = video ? video.width < targetWidth || video.height < targetHeight : false;
  const tooLong = video ? Number.isFinite(video.seconds) && video.seconds > maxSeconds : false;
  const minutes = Math.round(maxSeconds / 60);

  let verdict = "";
  let detail = "";
  if (video) {
    if (exact && !tooLong) {
      verdict = `Perfect match: ${targetWidth} × ${targetHeight}`;
      detail = `This video is exactly the recommended ${platform} size and ${ratioW}:${ratioH} shape, and it fits within ${minutes} minutes.`;
    } else if (correctShape) {
      const sizeNote = tooSmall
        ? `The shape is right, but it is smaller than ${targetWidth} × ${targetHeight}, so ${platform} may upscale it and it can look soft. Re-export at ${targetWidth} × ${targetHeight} for the sharpest upload.`
        : `The ${ratioW}:${ratioH} shape is right, so ${platform} will fit it to a ${targetWidth} × ${targetHeight} frame.`;
      verdict = tooLong ? `Correct shape, but over ${minutes} minutes` : "Correct shape, different resolution";
      detail = `${sizeNote}${
        tooLong ? ` This video is ${formatDuration(video.seconds)} long, longer than the ${minutes}-minute limit this checker uses.` : ""
      }`;
    } else if (tooLong) {
      verdict = `Not a ${ratioW}:${ratioH} shape, and over ${minutes} minutes`;
      detail = `This video is ${video.width} × ${video.height} px (${video.ratioLabel}) and ${formatDuration(video.seconds)} long. ${platform} uses a ${ratioW}:${ratioH} frame, so this will be cropped or padded, and it is longer than ${minutes} minutes.`;
    } else {
      verdict = `Not a ${ratioW}:${ratioH} shape`;
      detail = `This video is ${video.width} × ${video.height} px (${video.ratioLabel}). ${platform} uses a ${ratioW}:${ratioH} frame (${targetWidth} × ${targetHeight} recommended), so this video will be cropped or padded with bars. Re-export or crop it before you post.`;
    }
  }

  const checks = video
    ? [
        { label: `${ratioW}:${ratioH} shape`, ok: correctShape },
        { label: `At least ${targetWidth} × ${targetHeight} px`, ok: !tooSmall },
        { label: `Up to ${minutes} minutes`, ok: !tooLong },
      ]
    : [];
  const passed = checks.filter((c) => c.ok).length;
  const allPass = exact && !tooLong;
  const tone = allPass ? "green" : correctShape && !tooLong ? "violet" : "coral";
  const toneClass = {
    green: "border-[var(--poskoo-green)]/50 bg-[var(--poskoo-green)]/10",
    violet: "border-[var(--poskoo-violet)]/40 bg-[var(--poskoo-band)]",
    coral: "border-[var(--poskoo-coral)]/60 bg-[var(--poskoo-coral)]/10",
  }[tone];
  const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3";
  const kpiLabel = "text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

  return (
    <div className="min-w-0 text-left">
      <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_17rem] md:items-start lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
            <label htmlFor={fileId} className="text-sm font-semibold">
              {inputLabel ?? `Load a ${platform} video`}
            </label>
            <div className="relative mt-2 grid min-h-32 place-items-center rounded-xl border-2 border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 text-center transition hover:border-[var(--poskoo-violet)] has-[:focus-visible]:border-[var(--poskoo-violet)] has-[:focus-visible]:shadow-[0_0_0_3px_var(--poskoo-band)]">
              <div className="pointer-events-none" aria-hidden="true">
                <Film className="mx-auto h-7 w-7 text-[var(--poskoo-violet)]" />
                <p className="mt-1.5 text-sm font-semibold text-[var(--poskoo-ink)]">{video ? "Choose another video" : "Choose a video or drop it here"}</p>
                <p className="text-xs text-[#5f5873]">MP4, MOV or WebM</p>
              </div>
              <input
                id={fileId}
                ref={inputRef}
                type="file"
                accept="video/*"
                onChange={onFileChange}
                aria-describedby={`${fileId}-help`}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
            <p id={`${fileId}-help`} className="mt-2 text-xs text-[#5f5873]">
              Opened locally in your browser; nothing is uploaded or stored.
            </p>
          </div>

          {error ? (
            <p role="alert" className="flex items-start gap-2 rounded-xl border border-[var(--poskoo-coral)]/60 bg-[var(--poskoo-coral)]/10 px-3 py-2 text-sm text-[#3d3450]">
              <XCircle className="mt-0.5 h-4 w-4 flex-none text-[#b2401a]" aria-hidden="true" />{error}
            </p>
          ) : null}

          {loading ? <p className="text-sm text-[#5f5873]">Reading video details…</p> : null}

          {video ? (
            <div className="space-y-3" aria-live="polite">
              <div className={`rounded-2xl border p-4 ${toneClass}`}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base font-bold text-[var(--poskoo-ink)]">{verdict}</p>
                  <span className="flex-none rounded-full bg-[var(--poskoo-card)] px-2 py-0.5 text-xs font-semibold tabular-nums">{passed}/{checks.length} checks</span>
                </div>
                <p className="mt-1 text-sm text-[#3d3450]">{detail}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className={kpi}>
                  <p className={kpiLabel}>Dimensions</p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--poskoo-ink)]">{video.width} × {video.height}</p>
                </div>
                <div className={kpi}>
                  <p className={kpiLabel}>Aspect ratio</p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--poskoo-ink)]">{video.ratioLabel}</p>
                </div>
                <div className={`${kpi} max-sm:col-span-2`}>
                  <p className={kpiLabel}>Length</p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--poskoo-ink)]">{formatDuration(video.seconds)}</p>
                </div>
              </div>
              <ul className="space-y-1.5 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 text-sm">
                {checks.map((c) => (
                  <li key={c.label} className="flex items-center gap-2">
                    {c.ok ? <CheckCircle2 className="h-4 w-4 flex-none text-[var(--poskoo-green)]" aria-hidden="true" /> : <XCircle className="h-4 w-4 flex-none text-[#b2401a]" aria-hidden="true" />}
                    <span className={c.ok ? "text-[var(--poskoo-ink)]" : "text-[#3d3450]"}>{c.label}</span>
                    <span className="sr-only">{c.ok ? ": pass" : ": fail"}</span>
                  </li>
                ))}
              </ul>
              {durationNote ? <p className="text-xs text-[#5f5873]">{durationNote}</p> : null}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0 break-all text-xs text-[#5f5873]">
                  {video.name} · recommended {targetWidth} × {targetHeight} px ({ratioW}:{ratioH})
                </p>
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Clear video
                </button>
              </div>
            </div>
          ) : null}

          {!video && !loading && !error ? (
            <p className="rounded-xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-5 text-center text-sm text-[#5f5873]">
              Choose a video to see its exact dimensions, aspect ratio and length, and whether it fits the {targetWidth} × {targetHeight} {platform} frame.
            </p>
          ) : null}
        </div>

        <div className="flex min-w-0 justify-center md:sticky md:top-24">
          <div className="w-full max-w-[17rem] rounded-[2.25rem] border border-[var(--poskoo-line)] bg-[#0d0d14] p-2.5 shadow-[var(--poskoo-shadow-float)]">
            <div
              className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.75rem] bg-[repeating-conic-gradient(#f3eeff_0%_25%,#fffcf6_0%_50%)] bg-[length:20px_20px]"
              role="img"
              aria-label={video ? `${ratioW}:${ratioH} preview of ${video.name}` : `Empty ${ratioW}:${ratioH} ${platform} frame`}
            >
              {video ? (
                <video src={video.url} muted playsInline controls className="absolute inset-0 h-full w-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-[#5f5873]">
                  <Film className="h-8 w-8" aria-hidden="true" />
                  <p className="text-xs font-medium">Your video preview appears here</p>
                  <p className="text-[11px]">{ratioW}:{ratioH} · {targetWidth} × {targetHeight} recommended</p>
                </div>
              )}
              {video && (
                <span className={`pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 max-w-[90%] truncate whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold shadow ${allPass ? "bg-[var(--poskoo-green)] text-white" : correctShape && !tooLong ? "bg-[var(--poskoo-lime)] text-[var(--poskoo-ink)]" : "bg-[var(--poskoo-coral)] text-white"}`} aria-hidden="true">
                  {allPass ? "Perfect fit" : correctShape && !tooLong ? `${ratioW}:${ratioH} shape` : tooLong ? `Over ${minutes} min` : `${video.ratioLabel} — not ${ratioW}:${ratioH}`}
                </span>
              )}
              <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/15" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
