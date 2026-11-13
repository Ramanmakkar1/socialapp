"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { CheckCircle2, ImageUp, Info, Trash2, XCircle } from "lucide-react";

const DESKTOP_W = 820;
const DESKTOP_H = 312;
const MIN_W = 400;
const MIN_H = 150;
const FAST_BYTES = 100 * 1024;
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

export default function CoverPhotoChecker() {
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

  const tooSmall = image ? image.width < MIN_W || image.height < MIN_H : false;
  const wideEnough = image ? image.width >= DESKTOP_W : false;
  const ratioOk = image ? image.ratio >= 16 / 9 - 0.01 && image.ratio <= DESKTOP_W / DESKTOP_H + 0.01 : false;
  const good = wideEnough && ratioOk;
  const overFast = image ? image.bytes > FAST_BYTES : false;

  let verdict = "";
  let detail = "";
  if (image) {
    if (tooSmall) {
      verdict = "Too small";
      detail = `This image is ${image.width} × ${image.height} px. Facebook needs at least ${MIN_W} × ${MIN_H} px, so re-export it larger before you upload. For a sharp cover, work at 1640 × 624 px or more.`;
    } else if (good) {
      verdict = "Good for desktop and mobile";
      detail = `This image is ${image.width} × ${image.height} px (${image.ratioLabel}). It is at least ${DESKTOP_W} px wide and sits between the 16:9 mobile crop and the 820:312 desktop crop, so both views keep most of the picture.`;
    } else {
      verdict = "Will be cropped heavily";
      detail = `This image is ${image.width} × ${image.height} px (${image.ratioLabel}). The desktop cover is 820:312 and the mobile cover is 16:9, so this shape loses large parts of the image. Crop it closer to 820 × 312 and keep faces and text in the centre.`;
    }
  }

  const checks = image
    ? [
        { label: "JPG or PNG", ok: image.typeOk },
        { label: "At least 400 × 150 px", ok: !tooSmall },
        { label: `At least ${DESKTOP_W} px wide`, ok: wideEnough },
        { label: "Aspect ratio between 16:9 and 820:312", ok: ratioOk },
        { label: "Under 100 KB for the fastest load", ok: !overFast },
      ]
    : [];
  const passed = checks.filter((c) => c.ok).length;
  const tone = good ? "green" : tooSmall ? "coral" : "violet";
  const toneClass = {
    green: "border-[var(--poskoo-green)]/50 bg-[var(--poskoo-green)]/10",
    violet: "border-[var(--poskoo-violet)]/40 bg-[var(--poskoo-band)]",
    coral: "border-[var(--poskoo-coral)]/60 bg-[var(--poskoo-coral)]/10",
  }[tone];
  const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3";
  const kpiLabel = "text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

  return (
    <div className="min-w-0 text-left">
      <div className="grid min-w-0 gap-5 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-4">
          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
            <label htmlFor={fileId} className="text-sm font-semibold">
              Load a cover photo
            </label>
            <div className="relative mt-2 grid min-h-32 place-items-center rounded-xl border-2 border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 text-center transition hover:border-[var(--poskoo-violet)] has-[:focus-visible]:border-[var(--poskoo-violet)] has-[:focus-visible]:shadow-[0_0_0_3px_var(--poskoo-band)]">
              <div className="pointer-events-none" aria-hidden="true">
                <ImageUp className="mx-auto h-7 w-7 text-[var(--poskoo-violet)]" />
                <p className="mt-1.5 text-sm font-semibold text-[var(--poskoo-ink)]">{image ? "Choose another image" : "Choose an image or drop it here"}</p>
                <p className="text-xs text-[#5f5873]">JPG or PNG · up to 2 MB</p>
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

              {overFast ? (
                <p className="flex items-start gap-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-band)] px-3 py-2 text-sm text-[#3d3450]">
                  <Info className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
                  <span>
                    This file is {formatBytes(image.bytes)}. Facebook still accepts it, but an sRGB JPG under 100 KB loads
                    fastest, especially on phones.
                  </span>
                </p>
              ) : null}

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
                  {image.name} · {formatBytes(image.bytes)} · recommended 1640 × 624 px or larger
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
              Choose an image to see how it crops on a desktop cover (820 × 312) and a phone cover (640 × 360).
            </p>
          ) : null}
        </div>

        <div className="min-w-0 md:sticky md:top-24">
          <div className="flex flex-col gap-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3 shadow-[var(--poskoo-shadow-float)] min-[480px]:flex-row">
            <figure className="min-w-0 flex-1">
              <div
                className="relative aspect-[820/312] w-full overflow-hidden rounded-xl bg-[repeating-conic-gradient(#f3eeff_0%_25%,#fffcf6_0%_50%)] bg-[length:20px_20px]"
                role="img"
                aria-label={image ? `Desktop Facebook cover crop of ${image.name} at 820 by 312` : "Empty desktop Facebook cover frame, 820 by 312"}
              >
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-[#5f5873]">
                    <p className="text-[11px] font-medium">Your cover appears here</p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15" aria-hidden="true" />
              </div>
              <figcaption className="mt-1.5 text-center text-[11px] font-semibold text-[var(--poskoo-ink)]">Desktop (820×312)</figcaption>
            </figure>
            <figure className="min-w-0 flex-1">
              <div
                className="relative aspect-[640/360] w-full overflow-hidden rounded-xl bg-[repeating-conic-gradient(#f3eeff_0%_25%,#fffcf6_0%_50%)] bg-[length:20px_20px]"
                role="img"
                aria-label={image ? `Mobile Facebook cover crop of ${image.name} at 640 by 360` : "Empty mobile Facebook cover frame, 640 by 360"}
              >
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-[#5f5873]">
                    <p className="text-[11px] font-medium">Your cover appears here</p>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/15" aria-hidden="true" />
              </div>
              <figcaption className="mt-1.5 text-center text-[11px] font-semibold text-[var(--poskoo-ink)]">Mobile (640×360)</figcaption>
            </figure>
          </div>
          <p className="mt-2 px-1 text-center text-[11px] leading-snug text-[#8a8399]">
            Both frames use object-fit: cover, so you see exactly which parts Facebook crops on each screen.
          </p>
        </div>
      </div>
    </div>
  );
}
