"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { CheckCircle2, ImageUp, Trash2, XCircle } from "lucide-react";

const TARGET_W = 1584;
const TARGET_H = 396;
const TARGET_RATIO = TARGET_W / TARGET_H;
const MAX_BYTES = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

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
        typeOk: ACCEPTED_TYPES.includes(file.type),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file could not be opened as an image. Choose a JPG or PNG file."));
    };
    img.src = url;
  });
}

export default function LinkedInBannerChecker() {
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
      setError("That file is not an image. Choose a JPG or PNG file.");
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
  const is41 = image ? ratioDiff <= TARGET_RATIO * 0.01 : false;
  const exact = image ? image.width === TARGET_W && image.height === TARGET_H : false;
  const tooSmall = image ? image.width < TARGET_W : false;

  let verdict = "";
  let detail = "";
  if (image) {
    if (exact) {
      verdict = "Perfect match: 1584 × 396";
      detail =
        "This image is exactly the recommended LinkedIn profile banner size with a 4:1 shape. It will fill the banner frame without cropping, upscaling or padding.";
    } else if (is41) {
      verdict = tooSmall ? "Too small" : "Correct 4:1 shape";
      detail = tooSmall
        ? `This image is ${image.width} × ${image.height} px. The 4:1 shape is right, but it is narrower than 1584 px, so LinkedIn may stretch it and it can look soft. Re-export at 1584 × 396 for the sharpest banner.`
        : `This image is ${image.width} × ${image.height} px. The 4:1 shape is right and it is at least 1584 px wide, so LinkedIn scales it down to fit, which is fine as long as the image is sharp.`;
    } else {
      verdict = "Not a 4:1 banner shape";
      detail = `This image is ${image.width} × ${image.height} px (${image.ratioLabel}). LinkedIn profile banners use a 4:1 frame, so this image will be cropped or padded with bars. Re-export or crop it to 1584 × 396 before you upload.`;
    }
  }

  const checks = image
    ? [
        { label: "JPG or PNG", ok: image.typeOk },
        { label: "Under 8 MB", ok: image.bytes <= MAX_BYTES },
        { label: "At least 1584 px wide", ok: !tooSmall },
        { label: "4:1 aspect ratio", ok: is41 },
      ]
    : [];
  const passed = checks.filter((c) => c.ok).length;
  const tone = exact ? "green" : is41 ? "violet" : "coral";
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
              Load a banner image
            </label>
            <div className="relative mt-2 grid min-h-32 place-items-center rounded-xl border-2 border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 text-center transition hover:border-[var(--poskoo-violet)] has-[:focus-visible]:border-[var(--poskoo-violet)] has-[:focus-visible]:shadow-[0_0_0_3px_var(--poskoo-band)]">
              <div className="pointer-events-none" aria-hidden="true">
                <ImageUp className="mx-auto h-7 w-7 text-[var(--poskoo-violet)]" />
                <p className="mt-1.5 text-sm font-semibold text-[var(--poskoo-ink)]">{image ? "Choose another image" : "Choose an image or drop it here"}</p>
                <p className="text-xs text-[#5f5873]">JPG or PNG · up to 8 MB</p>
              </div>
              <input
                id={fileId}
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
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
                  {image.name} · {formatBytes(image.bytes)} · recommended {TARGET_W} × {TARGET_H} px (4:1)
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
              Choose an image to see its exact dimensions, aspect ratio and whether it fits LinkedIn&apos;s 1584 × 396 profile-banner rules.
            </p>
          ) : null}
        </div>

        <div className="flex min-w-0 justify-center md:sticky md:top-24">
          <div className="w-full max-w-[19rem] rounded-[2rem] border border-[var(--poskoo-line)] bg-[#0d0d14] p-2.5 shadow-[var(--poskoo-shadow-float)]">
            <div
              className="relative aspect-[4/1] w-full overflow-hidden rounded-[1.5rem] bg-[repeating-conic-gradient(#f3eeff_0%_25%,#fffcf6_0%_50%)] bg-[length:20px_20px]"
              role="img"
              aria-label={image ? `4:1 LinkedIn profile banner preview of ${image.name}` : "Empty 4:1 LinkedIn profile banner frame"}
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt="" className="absolute inset-0 h-full w-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-[#5f5873]">
                  <ImageUp className="h-8 w-8" aria-hidden="true" />
                  <p className="text-xs font-medium">Your banner preview appears here</p>
                  <p className="text-[11px]">4:1 · 1584 × 396 recommended</p>
                </div>
              )}
              {/* Profile photo: circle about 20% of the frame height, overlapping the bottom edge on the left. */}
              <div className="pointer-events-none absolute bottom-[-10%] left-[4%] aspect-square w-[5%] rounded-full border-2 border-white/80 bg-[var(--poskoo-violet)]/40" aria-hidden="true" />
              <div className="pointer-events-none absolute bottom-1 left-[10%] max-w-[55%] rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-semibold leading-tight text-white">
                Profile photo covers this area
              </div>
              <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] ring-1 ring-inset ring-white/15" aria-hidden="true" />
            </div>
            <p className="mt-2 px-1 text-center text-[11px] leading-snug text-[#8a8399]">
              LinkedIn places your profile photo over the bottom-left of the banner. Keep text, logos and faces out of the circle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
