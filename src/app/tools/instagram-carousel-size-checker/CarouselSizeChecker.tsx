"use client";

import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Crown, HardDrive, ImagePlus, Images, Loader2, Ratio, Trash2, Upload } from "lucide-react";

type Slide = {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  ratioValue: number;
  ratioLabel: string;
};

type Loaded = Omit<Slide, "url"> & { file: File };

const KNOWN_RATIOS = [
  { label: "1:1", value: 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "3:4", value: 3 / 4 },
  { label: "9:16", value: 9 / 16 },
  { label: "1.91:1", value: 1080 / 566 },
  { label: "16:9", value: 16 / 9 },
  { label: "2:3", value: 2 / 3 },
];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function ratioLabel(w: number, h: number): string {
  const value = w / h;
  const known = KNOWN_RATIOS.find((r) => Math.abs(r.value - value) < 0.005);
  if (known) return known.label;
  const d = gcd(w, h) || 1;
  return `${w / d}:${h / d}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readDimensions(file: File): Promise<Loaded> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      if (!width || !height) {
        reject(new Error("Could not read the image dimensions."));
        return;
      }
      resolve({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        width,
        height,
        bytes: file.size,
        ratioValue: width / height,
        ratioLabel: ratioLabel(width, height),
        file,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file could not be read as an image."));
    };
    img.src = url;
  });
}

const ghostBtn = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const checker = "bg-[repeating-conic-gradient(#f3eeff_0%_25%,#ffffff_0%_50%)] [background-size:16px_16px]";

export default function CarouselSizeChecker() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [view, setView] = useState(0);
  const urlsRef = useRef<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileId = useId();

  const revokeAll = useCallback(() => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
  }, []);

  useEffect(() => {
    return () => revokeAll();
  }, [revokeAll]);

  async function loadFiles(files: File[]) {
    if (files.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const loaded = await Promise.all(files.map(readDimensions));
      revokeAll();
      const next = loaded.map(({ file, ...rest }) => {
        const url = URL.createObjectURL(file);
        urlsRef.current.push(url);
        return { ...rest, url };
      });
      setSlides(next);
      setView(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "One or more files could not be read.");
    } finally {
      setLoading(false);
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    void loadFiles(Array.from(e.target.files ?? []));
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    void loadFiles(Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/")));
  }

  function clearAll() {
    revokeAll();
    if (inputRef.current) inputRef.current.value = "";
    setSlides([]);
    setError(null);
    setView(0);
  }

  const totalBytes = slides.reduce((sum, s) => sum + s.bytes, 0);
  const first = slides[0];
  const sameRatio =
    slides.length > 1 && first
      ? slides.every((s) => Math.abs(s.ratioValue - first.ratioValue) < 0.005)
      : null;
  const matchCount = first ? slides.filter((s) => Math.abs(s.ratioValue - first.ratioValue) < 0.005).length : 0;
  const largest = slides.reduce<Slide | null>((max, s) => (!max || s.bytes > max.bytes ? s : max), null);
  const shown = slides[Math.min(view, slides.length - 1)];
  const shownIndex = Math.min(view, slides.length - 1);

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Input */}
      <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
        <label htmlFor={fileId} className="text-sm font-semibold">
          Select carousel images
        </label>
        <input
          id={fileId}
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onFileChange}
          aria-describedby={`${fileId}-help`}
          className="peer sr-only"
        />

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-2 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 text-center transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--poskoo-violet)] sm:flex-row sm:text-left ${slides.length ? "py-4" : "py-8 sm:py-10 sm:justify-center"} ${dragging ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-band)]" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] hover:border-[var(--poskoo-violet)]"}`}
        >
          <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[var(--poskoo-band)] text-[var(--poskoo-violet)]" aria-hidden="true">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold text-[var(--poskoo-ink)]">{slides.length ? "Replace with other images" : "Drop images here or browse"}</span>
            <span className="block text-sm text-[#3d3450]">JPG, PNG, WebP or any image your browser can open. Pick all slides at once.</span>
          </span>
          <span className="inline-flex min-h-11 flex-none items-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-sm font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] sm:ml-auto">
            <Upload className="h-4 w-4" aria-hidden="true" />Browse files
          </span>
        </div>
        <p id={`${fileId}-help`} className="mt-2 text-xs text-[var(--poskoo-muted)]">
          Select one or more images. They are read in your browser and never uploaded.
        </p>
      </div>

      {error ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-[var(--poskoo-coral)] bg-[var(--poskoo-coral)]/10 px-3 py-2 text-sm text-[#3d3450]">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-coral)]" aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-[var(--poskoo-muted)]" role="status">Reading image dimensions…</p>
      ) : null}

      {slides.length > 0 && first ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-live="polite">
            <div className={kpi}>
              <p className={kpiLabel}><Images className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Slides</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{slides.length}</p>
              <p className="mt-1 text-xs text-[#3d3450]">In the order you picked them.</p>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}><HardDrive className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Total file size</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{formatBytes(totalBytes)}</p>
              <p className="mt-1 text-xs text-[#3d3450]">{largest && slides.length > 1 ? `Largest: slide ${slides.indexOf(largest) + 1}, ${formatBytes(largest.bytes)}` : "Read from the file itself."}</p>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}><Ratio className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Aspect ratio</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl text-[var(--poskoo-ink)]">
                {sameRatio === null ? first.ratioLabel : sameRatio ? `Same · ${first.ratioLabel}` : "Mixed"}
              </p>
              <p className="mt-1 text-xs text-[#3d3450]">First slide: {first.width}×{first.height} px</p>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}>{matchCount === slides.length ? <Check className="h-3.5 w-3.5 text-[var(--poskoo-green)]" aria-hidden="true" /> : <AlertTriangle className="h-3.5 w-3.5 text-[var(--poskoo-coral)]" aria-hidden="true" />}Match first slide</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{matchCount}<span className="text-base font-medium text-[#5f5873]"> / {slides.length}</span></p>
              <div className="mt-2 flex h-2 gap-0.5" aria-hidden="true">
                {slides.map((s) => (
                  <i key={s.id} className="flex-1 rounded-full" style={{ background: Math.abs(s.ratioValue - first.ratioValue) < 0.005 ? "var(--poskoo-green)" : "var(--poskoo-coral)" }} />
                ))}
              </div>
            </div>
          </div>

          <p className={`flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm ${sameRatio === false ? "bg-[var(--poskoo-coral)]/10 text-[#3d3450]" : "bg-[var(--poskoo-band)] text-[#3d3450]"}`} aria-live="polite">
            {sameRatio === false
              ? <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-coral)]" aria-hidden="true" />
              : <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />}
            <span>
              {sameRatio === null
                ? "Add a second slide to compare aspect ratios."
                : sameRatio
                  ? `All ${slides.length} slides share the same ${first.ratioLabel} aspect ratio.`
                  : "Some slides use a different aspect ratio. Instagram carousels work best when every slide matches the first slide."}
            </span>
          </p>

          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
            {/* Results */}
            <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 sm:p-4">
              <h3 className="mb-3 flex items-center gap-2 text-base font-semibold"><Images className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden="true" />Slide details</h3>
              <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {slides.map((slide, i) => {
                  const matches = Math.abs(slide.ratioValue - first.ratioValue) < 0.005;
                  return (
                    <li key={slide.id} className="flex min-w-0 gap-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3" style={{ boxShadow: `inset 3px 0 0 ${i === 0 ? "var(--poskoo-violet)" : matches ? "var(--poskoo-green)" : "var(--poskoo-coral)"}` }}>
                      <div className={`grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border border-[var(--poskoo-line)] ${checker}`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slide.url}
                          alt={`Slide ${i + 1}: ${slide.name}`}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1 text-sm text-[#3d3450]">
                        <p className="truncate font-medium text-[var(--poskoo-ink)]" title={slide.name}>
                          Slide {i + 1} · {slide.name}
                        </p>
                        <p className="mt-1 font-semibold tabular-nums text-[var(--poskoo-ink)]">
                          {slide.width}×{slide.height} px
                        </p>
                        <p className="mt-0.5 tabular-nums">
                          Ratio {slide.ratioLabel} ({slide.ratioValue.toFixed(2)}) · {formatBytes(slide.bytes)}
                        </p>
                        <p className={`mt-1.5 inline-flex items-center gap-1 rounded-md px-1.5 py-px text-xs font-semibold ${i === 0 ? "bg-[var(--poskoo-band)] text-[var(--poskoo-violet)]" : matches ? "bg-[var(--poskoo-green)]/12 text-[#146b43]" : "bg-[var(--poskoo-coral)]/12 text-[#a8410f]"}`}>
                          {i === 0 ? <Crown className="h-3 w-3" aria-hidden="true" /> : matches ? <Check className="h-3 w-3" aria-hidden="true" /> : <AlertTriangle className="h-3 w-3" aria-hidden="true" />}
                          {i === 0 ? "First slide sets the ratio" : matches ? "Matches the first slide" : "Different ratio"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Actions + framed preview */}
            <aside aria-labelledby={`${fileId}-prev`} className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => inputRef.current?.click()} className={ghostBtn}>
                  <ImagePlus className="h-4 w-4" aria-hidden="true" />New set
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  className={`${ghostBtn} hover:text-[var(--poskoo-red)]`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Clear all
                </button>
              </div>
              {shown ? (
                <div>
                  <h4 id={`${fileId}-prev`} className="flex items-center justify-between text-sm font-semibold">
                    Swipe preview
                    <span className="text-xs font-medium tabular-nums text-[#5f5873]">{shownIndex + 1} / {slides.length}</span>
                  </h4>
                  <div className="mx-auto mt-2 max-w-[300px] rounded-[22px] border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-2.5 shadow-[var(--poskoo-shadow-card)] lg:max-w-none">
                    <div className="flex items-center gap-2 px-1 pb-2">
                      <span className="h-7 w-7 rounded-full bg-[conic-gradient(var(--poskoo-violet),var(--poskoo-pink),var(--poskoo-peach),var(--poskoo-violet))] p-[2px]" aria-hidden="true"><span className="block h-full w-full rounded-full border-2 border-white bg-[var(--poskoo-band)]" /></span>
                      <span className="text-xs font-semibold">your_account</span>
                    </div>
                    <div className="relative">
                      <div className="max-h-[420px] overflow-hidden rounded-lg bg-[var(--poskoo-ink)]" style={{ aspectRatio: `${first.width} / ${first.height}` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={shown.url} alt="" className="h-full w-full object-cover" />
                      </div>
                      <button type="button" onClick={() => setView(Math.max(0, shownIndex - 1))} disabled={shownIndex === 0} aria-label="Previous slide"
                        className="absolute left-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--poskoo-ink)] shadow disabled:hidden">
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      <button type="button" onClick={() => setView(Math.min(slides.length - 1, shownIndex + 1))} disabled={shownIndex === slides.length - 1} aria-label="Next slide"
                        className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--poskoo-ink)] shadow disabled:hidden">
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex flex-wrap justify-center gap-1 py-2.5" aria-hidden="true">
                      {slides.map((s, i) => <i key={s.id} className={`h-1.5 rounded-full transition-all ${i === shownIndex ? "w-4 bg-[var(--poskoo-violet)]" : "w-1.5 bg-[var(--poskoo-line)]"}`} />)}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-[#3d3450]">
                    Every slide is framed to the first slide&apos;s {first.ratioLabel} shape here, so you can spot anything that would be cropped.
                  </p>
                </div>
              ) : null}
            </aside>
          </div>
        </>
      ) : null}

      {!loading && slides.length === 0 && !error ? (
        <p className="rounded-xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-6 text-center text-sm text-[var(--poskoo-muted)]">
          Choose your carousel images to see their dimensions, aspect ratio and file size.
        </p>
      ) : null}
    </div>
  );
}
