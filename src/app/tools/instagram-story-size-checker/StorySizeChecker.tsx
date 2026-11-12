"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { CheckCircle2, ImageUp, Trash2, XCircle } from "lucide-react";

const TARGET_W = 1080;
const TARGET_H = 1920;
const TARGET_RATIO = TARGET_W / TARGET_H;
const MAX_BYTES = 20 * 1024 * 1024;

type Loaded = {
  name: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
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

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readImage(file: File): Promise<Omit<Loaded, "url">> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      if (!width || !height) {
        reject(new Error("Could not read this image's dimensions. Try exporting it again as a JPG or PNG."));
        return;
      }
      resolve({
        name: file.name,
        width,
        height,
        bytes: file.size,
        ratio: width / height,
        ratioLabel: ratioLabel(width, height),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file could not be opened as an image. Choose a JPG, PNG or WebP file."));
    };
    img.src = url;
  });
}

export default function StorySizeChecker() {
  const [image, setImage] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const urlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileId = useId();

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function clear() {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
    setImage(null);
    setError(null);
  }

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("That file is not an image. Choose a JPG, PNG or WebP file.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`That image is ${formatBytes(file.size)}. Choose a file under 20 MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setLoading(true);
    try {
      const data = await readImage(file);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      setImage({ ...data, url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "This image could not be read. Try another file.");
    } finally {
      setLoading(false);
    }
  }

  const ratioDiff = image ? Math.abs(image.ratio - TARGET_RATIO) : 0;
  const exact = image ? image.width === TARGET_W && image.height === TARGET_H : false;
  const correctShape = image ? ratioDiff < 0.005 : false;
  const tooSmall = image ? image.width < TARGET_W || image.height < TARGET_H : false;

  let verdict = "";
  let detail = "";
  if (image) {
    if (exact) {
      verdict = "Perfect match: 1080 × 1920";
      detail = "This image is exactly the recommended Instagram Story size and 9:16 shape. It will fill the screen without cropping or padding.";
    } else if (correctShape) {
      verdict = "Correct 9:16 shape, different resolution";
      detail = tooSmall
        ? `This image is ${image.width} × ${image.height} px. The shape is right, but it is smaller than 1080 × 1920, so Instagram may upscale it and it can look soft. Re-export at 1080 × 1920 for the sharpest Story.`
        : `This image is ${image.width} × ${image.height} px. The 9:16 shape is right, so it will fill the Story frame. Instagram scales it to 1080 × 1920, which is fine as long as the image is sharp.`;
    } else {
      verdict = "Not a 9:16 Story shape";
      detail = `This image is ${image.width} × ${image.height} px (${image.ratioLabel}). Instagram Stories use a 9:16 frame, so this image will be cropped or padded with bars. Re-export or crop it to 1080 × 1920 before you post.`;
    }
  }

  const checks = image
    ? [
        { label: "9:16 Story shape", ok: correctShape },
        { label: "At least 1080 × 1920 px", ok: !tooSmall },
        { label: "Under 20 MB", ok: image.bytes <= MAX_BYTES },
      ]
    : [];
  const passed = checks.filter((c) => c.ok).length;
  const tone = exact ? "green" : correctShape ? "violet" : "coral";
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
              Load a Story image
            </label>
            <div className="relative mt-2 grid min-h-32 place-items-center rounded-xl border-2 border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 text-center transition hover:border-[var(--poskoo-violet)] has-[:focus-visible]:border-[var(--poskoo-violet)] has-[:focus-visible]:shadow-[0_0_0_3px_var(--poskoo-band)]">
              <div className="pointer-events-none" aria-hidden="true">
                <ImageUp className="mx-auto h-7 w-7 text-[var(--poskoo-violet)]" />
                <p className="mt-1.5 text-sm font-semibold text-[var(--poskoo-ink)]">{image ? "Choose another image" : "Choose an image or drop it here"}</p>
                <p className="text-xs text-[#5f5873]">JPG, PNG or WebP · up to 20 MB</p>
              </div>
              <input
                id={fileId}
                ref={inputRef}
                type="file"
                accept="image/*"
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

          {loading ? <p className="text-sm text-[#5f5873]">Reading image dimensions…</p> : null}

          {image ? (
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
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--poskoo-ink)]">{image.width} × {image.height}</p>
                </div>
                <div className={kpi}>
                  <p className={kpiLabel}>Aspect ratio</p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--poskoo-ink)]">{image.ratioLabel}</p>
                </div>
                <div className={`${kpi} max-sm:col-span-2`}>
                  <p className={kpiLabel}>File size</p>
                  <p className="mt-0.5 text-lg font-bold tabular-nums text-[var(--poskoo-ink)]">{formatBytes(image.bytes)}</p>
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="min-w-0 break-all text-xs text-[#5f5873]">
                  {image.name} · {formatBytes(image.bytes)} · recommended {TARGET_W} × {TARGET_H} px (9:16)
                </p>
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)]"
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Clear image
                </button>
              </div>
            </div>
          ) : null}

          {!image && !loading && !error ? (
            <p className="rounded-xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-5 text-center text-sm text-[#5f5873]">
              Choose an image to see its exact dimensions, aspect ratio and whether it fits the 1080 × 1920 Story frame.
            </p>
          ) : null}
        </div>

        <div className="flex min-w-0 justify-center md:sticky md:top-24">
          <div className="w-full max-w-[17rem] rounded-[2.25rem] border border-[var(--poskoo-line)] bg-[#0d0d14] p-2.5 shadow-[var(--poskoo-shadow-float)]">
            <div
              className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.75rem] bg-[repeating-conic-gradient(#f3eeff_0%_25%,#fffcf6_0%_50%)] bg-[length:20px_20px]"
              role="img"
              aria-label={image ? `9:16 Story preview of ${image.name}` : "Empty 9:16 Instagram Story frame"}
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt="" className="absolute inset-0 h-full w-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-[#5f5873]">
                  <ImageUp className="h-8 w-8" aria-hidden="true" />
                  <p className="text-xs font-medium">Your Story preview appears here</p>
                  <p className="text-[11px]">9:16 · 1080 × 1920 recommended</p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-3 top-2.5 flex gap-1" aria-hidden="true">
                <span className="h-0.5 flex-1 rounded-full bg-white/80" /><span className="h-0.5 flex-1 rounded-full bg-white/40" />
              </div>
              {image && (
                <span className={`pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 max-w-[90%] truncate whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold shadow ${exact ? "bg-[var(--poskoo-green)] text-white" : correctShape ? "bg-[var(--poskoo-lime)] text-[var(--poskoo-ink)]" : "bg-[var(--poskoo-coral)] text-white"}`} aria-hidden="true">
                  {exact ? "Perfect fit" : correctShape ? "9:16 shape" : `${image.ratioLabel} — not 9:16`}
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
