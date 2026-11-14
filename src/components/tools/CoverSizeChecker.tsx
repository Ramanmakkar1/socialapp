"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { CheckCircle2, ImageUp, Trash2, XCircle } from "lucide-react";

type Overlay = {
  shape: "circle";
  left: string;
  bottom: string;
  size: string;
  label: string;
};

type Props = {
  platform: string;
  targetW: number;
  targetH: number;
  minW?: number;
  maxBytes?: number;
  acceptedTypes: string[];
  acceptLabel: string;
  ratioTolerance?: number;
  overlay?: Overlay;
  frameLabel: string;
  maxPreviewWidth?: number;
};

type Loaded = {
  name: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  ratio: number;
  ratioLabel: string;
  typeOk: boolean;
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

function readImage(file: File, acceptedTypes: string[]): Promise<Omit<Loaded, "url">> {
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
        typeOk: acceptedTypes.includes(file.type),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file could not be opened as an image. Choose a JPG or PNG file."));
    };
    img.src = url;
  });
}

export default function CoverSizeChecker({
  platform,
  targetW,
  targetH,
  minW,
  maxBytes,
  acceptedTypes,
  acceptLabel,
  ratioTolerance = 0.02,
  overlay,
  frameLabel,
  maxPreviewWidth,
}: Props) {
  const [image, setImage] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const urlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileId = useId();

  const targetRatio = targetW / targetH;
  const minWidth = minW ?? targetW;

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
      setError(`That file is not an image. Choose a ${acceptLabel} file.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setLoading(true);
    try {
      const data = await readImage(file, acceptedTypes);
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

  const ratioDiff = image ? Math.abs(image.ratio - targetRatio) : 0;
  const ratioOk = image ? ratioDiff <= targetRatio * ratioTolerance : false;
  const exact = image ? image.width === targetW && image.height === targetH : false;
  const tooSmall = image ? image.width < minWidth : false;

  let verdict = "";
  let detail = "";
  if (image) {
    if (exact) {
      verdict = `Perfect match: ${targetW} × ${targetH}`;
      detail = `This image is exactly the recommended ${platform} size. It will fill the frame without cropping, upscaling or padding.`;
    } else if (ratioOk && image.width >= targetW) {
      verdict = "Correct shape";
      detail = `This image is ${image.width} × ${image.height} px. The shape is right and it is at least ${targetW} px wide, so ${platform} scales it down to fit, which is fine as long as the image is sharp.`;
    } else if (ratioOk && tooSmall) {
      verdict = "Too small";
      detail = `This image is ${image.width} × ${image.height} px. The shape is right, but it is narrower than ${minWidth} px, so ${platform} may stretch it and it can look soft. Re-export at ${targetW} × ${targetH} for the sharpest result.`;
    } else if (ratioOk) {
      verdict = "Correct shape";
      detail = `This image is ${image.width} × ${image.height} px. The shape is right and it is above the ${minWidth} px minimum, but below the recommended ${targetW} px width, so it may look slightly soft. Re-export at ${targetW} × ${targetH} for the sharpest result.`;
    } else {
      verdict = "Not the right shape";
      detail = `This image is ${image.width} × ${image.height} px (${image.ratioLabel}). ${platform} uses a ${targetW}:${targetH} frame, so this image will be cropped or padded with bars. Re-export or crop it to ${targetW} × ${targetH} before you upload.`;
    }
  }

  const checks = image
    ? [
        { label: acceptLabel, ok: image.typeOk },
        ...(maxBytes !== undefined
          ? [{ label: `Under ${formatBytes(maxBytes)}`, ok: image.bytes <= maxBytes }]
          : []),
        { label: `At least ${minWidth} px wide`, ok: !tooSmall },
        { label: `${targetW}:${targetH} aspect ratio`, ok: ratioOk },
      ]
    : [];
  const passed = checks.filter((c) => c.ok).length;
  const tone = exact ? "green" : ratioOk ? "violet" : "coral";
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
              Load a cover image
            </label>
            <div className="relative mt-2 grid min-h-32 place-items-center rounded-xl border-2 border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 text-center transition hover:border-[var(--poskoo-violet)] has-[:focus-visible]:border-[var(--poskoo-violet)] has-[:focus-visible]:shadow-[0_0_0_3px_var(--poskoo-band)]">
              <div className="pointer-events-none" aria-hidden="true">
                <ImageUp className="mx-auto h-7 w-7 text-[var(--poskoo-violet)]" />
                <p className="mt-1.5 text-sm font-semibold text-[var(--poskoo-ink)]">{image ? "Choose another image" : "Choose an image or drop it here"}</p>
                <p className="text-xs text-[#5f5873]">{acceptLabel}{maxBytes !== undefined ? ` · up to ${formatBytes(maxBytes)}` : ""}</p>
              </div>
              <input
                id={fileId}
                ref={inputRef}
                type="file"
                accept={acceptedTypes.join(",")}
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
                  {image.name} · {formatBytes(image.bytes)} · recommended {targetW} × {targetH} px
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
              Choose an image to see its exact dimensions, aspect ratio and whether it fits {platform}&apos;s {targetW} × {targetH} frame.
            </p>
          ) : null}
        </div>

        <div className="flex min-w-0 justify-center md:sticky md:top-24">
          <div
            className="w-full max-w-[19rem] rounded-[2rem] border border-[var(--poskoo-line)] bg-[#0d0d14] p-2.5 shadow-[var(--poskoo-shadow-float)]"
            style={maxPreviewWidth ? { maxWidth: `${maxPreviewWidth}px` } : undefined}
          >
            <div
              className="relative w-full overflow-hidden rounded-[1.5rem] bg-[repeating-conic-gradient(#f3eeff_0%_25%,#fffcf6_0%_50%)] bg-[length:20px_20px]"
              style={{ aspectRatio: `${targetW} / ${targetH}` }}
              role="img"
              aria-label={image ? `${targetW}:${targetH} ${platform} cover preview of ${image.name}` : `Empty ${targetW}:${targetH} ${platform} cover frame`}
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt="" className="absolute inset-0 h-full w-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-[#5f5873]">
                  <ImageUp className="h-8 w-8" aria-hidden="true" />
                  <p className="text-xs font-medium">Your cover preview appears here</p>
                  <p className="text-[11px]">{targetW} × {targetH} recommended</p>
                </div>
              )}
              {overlay ? (
                <>
                  <div
                    className="pointer-events-none absolute aspect-square rounded-full border-2 border-white/80 bg-[var(--poskoo-violet)]/40"
                    style={{ left: overlay.left, bottom: overlay.bottom, width: overlay.size }}
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute max-w-[55%] rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold leading-tight text-white"
                    style={{ left: overlay.left, bottom: "2%" }}
                  >
                    {overlay.label}
                  </div>
                </>
              ) : null}
              <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-white/15" aria-hidden="true" />
            </div>
            <p className="mt-2 px-1 text-center text-[11px] leading-snug text-[#8a8399]">
              {frameLabel}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
