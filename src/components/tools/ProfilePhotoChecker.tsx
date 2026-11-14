"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { CheckCircle2, ImageUp, Trash2, XCircle } from "lucide-react";

type ProfilePhotoCheckerProps = {
  platform: string;
  recommended: number;
  minSide: number;
  maxSide?: number;
  maxBytes?: number;
  acceptedTypes: string[];
  acceptedLabel: string;
  displayNote: string;
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

export default function ProfilePhotoChecker({
  platform,
  recommended,
  minSide,
  maxSide,
  maxBytes,
  acceptedTypes,
  acceptedLabel,
  displayNote,
}: ProfilePhotoCheckerProps) {
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
      setError(`That file is not an image. Choose a ${acceptedLabel} file.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (maxBytes && file.size > maxBytes) {
      setError(`That image is ${formatBytes(file.size)}. Choose a file under ${formatBytes(maxBytes)}.`);
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

  const square = image ? Math.abs(image.ratio - 1) <= 0.01 : false;
  const shortSide = image ? Math.min(image.width, image.height) : 0;
  const exactlyRecommended = image ? image.width === recommended && image.height === recommended : false;
  const tooSmall = image ? shortSide < minSide : false;
  const tooLarge = image && maxSide ? Math.max(image.width, image.height) > maxSide : false;
  const overBytes = image && maxBytes ? image.bytes > maxBytes : false;

  let verdict = "";
  let detail = "";
  if (image) {
    if (exactlyRecommended) {
      verdict = `Perfect square at ${recommended} × ${recommended}`;
      detail = `This image is exactly ${recommended} × ${recommended} px and square (1:1). It matches the ${platform} profile picture size, and only the four corners fall outside the circle crop.`;
    } else if (square && tooSmall) {
      verdict = "Square, but too small";
      detail = `This image is ${image.width} × ${image.height} px. It is square, but ${platform} profile pictures should be at least ${minSide} × ${minSide} px. Re-export it larger so it stays sharp when shown small.`;
    } else if (square) {
      verdict = "Good square photo";
      detail = `This image is ${image.width} × ${image.height} px and square (1:1). ${platform} shows it as a circle, so the four corners are cut off — keep faces and logos in the middle.`;
    } else {
      verdict = "Not square: the corners will be cropped";
      detail = `This image is ${image.width} × ${image.height} px (${image.ratioLabel}). ${platform} crops profile pictures to a square and then a circle, so the edges and corners of this image are lost. Crop it to a 1:1 square at ${recommended} × ${recommended} px.`;
    }
  }

  const checks = image
    ? [
        { label: acceptedLabel, ok: image.typeOk },
        { label: "Square 1:1", ok: square },
        { label: `At least ${minSide} × ${minSide} px`, ok: !tooSmall },
        ...(maxSide ? [{ label: `No larger than ${maxSide} px`, ok: !tooLarge }] : []),
        ...(maxBytes ? [{ label: `Under ${formatBytes(maxBytes)}`, ok: !overBytes }] : []),
      ]
    : [];
  const passed = checks.filter((c) => c.ok).length;
  const tone = exactlyRecommended ? "green" : square ? "violet" : "coral";
  const toneClass = {
    green: "border-[var(--poskoo-green)]/50 bg-[var(--poskoo-green)]/10",
    violet: "border-[var(--poskoo-violet)]/40 bg-[var(--poskoo-band)]",
    coral: "border-[var(--poskoo-coral)]/60 bg-[var(--poskoo-coral)]/10",
  }[tone];
  const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3";
  const kpiLabel = "text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
  const previewSizes = [
    { size: 110, label: "Feed" },
    { size: 56, label: "Comments" },
    { size: 32, label: "Story ring" },
  ];

  return (
    <div className="min-w-0 text-left">
      <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_18rem] md:items-start lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
            <label htmlFor={fileId} className="text-sm font-semibold">
              Load a profile photo
            </label>
            <div className="relative mt-2 grid min-h-32 place-items-center rounded-xl border-2 border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 text-center transition hover:border-[var(--poskoo-violet)] has-[:focus-visible]:border-[var(--poskoo-violet)] has-[:focus-visible]:shadow-[0_0_0_3px_var(--poskoo-band)]">
              <div className="pointer-events-none" aria-hidden="true">
                <ImageUp className="mx-auto h-7 w-7 text-[var(--poskoo-violet)]" />
                <p className="mt-1.5 text-sm font-semibold text-[var(--poskoo-ink)]">{image ? "Choose another image" : "Choose an image or drop it here"}</p>
                <p className="text-xs text-[#5f5873]">{acceptedLabel}{maxBytes ? ` · up to ${formatBytes(maxBytes)}` : ""}</p>
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
                  {image.name} · {formatBytes(image.bytes)} · recommended {recommended} × {recommended} px (1:1)
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
              Choose an image to see its exact dimensions, aspect ratio and what the {platform} circle crop cuts off.
            </p>
          ) : null}
        </div>

        <div className="min-w-0 md:sticky md:top-24">
          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3 shadow-[var(--poskoo-shadow-float)]">
            <div
              className="relative aspect-square w-full overflow-hidden rounded-xl bg-[repeating-conic-gradient(#f3eeff_0%_25%,#fffcf6_0%_50%)] bg-[length:20px_20px]"
              role="img"
              aria-label={image ? `Square ${platform} profile picture crop of ${image.name}` : `Empty square ${platform} profile picture frame`}
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center p-4 text-center text-[#5f5873]">
                  <p className="text-[11px] font-medium">Your circle crop appears here</p>
                </div>
              )}
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: "radial-gradient(circle closest-side, transparent 0 99.5%, rgba(20, 16, 32, 0.62) 100%)" }}
                aria-hidden="true"
              />
              <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15" aria-hidden="true" />
            </div>
            <p className="mt-2 text-center text-[11px] font-semibold text-[var(--poskoo-ink)]">Square crop, circle shown</p>
            <p className="mt-1 text-center text-[11px] leading-snug text-[#8a8399]">{displayNote}. Dark corners are cut off.</p>

            {image ? (
              <div className="mt-4 flex items-end justify-center gap-4 border-t border-[var(--poskoo-line)] pt-4">
                {previewSizes.map((p) => (
                  <figure key={p.label} className="flex flex-col items-center gap-1.5">
                    <div
                      className="overflow-hidden rounded-full border border-[var(--poskoo-line)] bg-[var(--poskoo-card)]"
                      style={{ width: p.size, height: p.size }}
                      role="img"
                      aria-label={`${p.label} preview at ${p.size} by ${p.size} pixels`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.url} alt="" className="h-full w-full object-cover" />
                    </div>
                    <figcaption className="text-center text-[10px] font-semibold leading-tight text-[#5f5873]">
                      {p.label}<br />{p.size}px
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
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
