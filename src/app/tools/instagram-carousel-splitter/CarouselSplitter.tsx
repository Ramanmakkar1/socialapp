"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Columns3, Download, ImagePlus, Loader2, Maximize2, Ratio, Scissors, Trash2, Upload } from "lucide-react";

type Loaded = { name: string; src: string; width: number; height: number };
const MIN_SLIDES = 2;
const MAX_SLIDES = 10;

function loadImage(file: File): Promise<Loaded> {
  return new Promise((resolve, reject) => {
    const src = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        URL.revokeObjectURL(src);
        reject(new Error("Could not read the image dimensions."));
        return;
      }
      resolve({ name: file.name, src, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(src);
      reject(new Error("This file could not be read as an image."));
    };
    img.src = src;
  });
}

/** Named shape for a slide's width/height, only when it is within 1% of a common Instagram ratio. */
function shapeName(r: number): string | null {
  const known: [number, string][] = [[4 / 5, "4:5 portrait"], [1, "1:1 square"], [1080 / 566, "1.91:1 landscape"], [3 / 4, "3:4 portrait"]];
  const hit = known.find(([v]) => Math.abs(v - r) / v < 0.01);
  return hit ? hit[1] : null;
}

const ghostBtn = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

export default function CarouselSplitter() {
  const [image, setImage] = useState<Loaded | null>(null);
  const [count, setCount] = useState(3);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [view, setView] = useState(0);
  const [dlState, setDlState] = useState<"idle" | "busy" | "done">("idle");
  const dlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileId = useId();
  const countId = useId();

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.src);
    };
  }, [image]);

  useEffect(() => () => {
    if (dlTimer.current) clearTimeout(dlTimer.current);
  }, []);

  useEffect(() => {
    if (!image) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const next: string[] = [];
      for (let i = 0; i < count; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width / count));
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.drawImage(img, (image.width * i) / count, 0, image.width / count, image.height, 0, 0, canvas.width, canvas.height);
        next.push(canvas.toDataURL("image/png"));
      }
      setPreviews(next);
    };
    img.src = image.src;
    return () => {
      cancelled = true;
    };
  }, [image, count]);

  async function loadFile(file: File | undefined) {
    if (!file) return;
    setLoading(true);
    setError(null);
    setPreviews([]);
    setView(0);
    try {
      setImage(await loadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "That file could not be read.");
    } finally {
      setLoading(false);
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    void loadFile(e.target.files?.[0]);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    void loadFile(Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/")));
  }

  function download(index: number) {
    const url = previews[index];
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `slide-${index + 1}-of-${count}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function downloadAll() {
    previews.forEach((_, i) => window.setTimeout(() => download(i), i * 150));
    setDlState("busy");
    if (dlTimer.current) clearTimeout(dlTimer.current);
    dlTimer.current = setTimeout(() => {
      setDlState("done");
      dlTimer.current = setTimeout(() => setDlState("idle"), 2200);
    }, previews.length * 150 + 300);
  }

  function clearAll() {
    if (inputRef.current) inputRef.current.value = "";
    setImage(null);
    setPreviews([]);
    setError(null);
    setView(0);
  }

  const sliceW = image ? Math.max(1, Math.round(image.width / count)) : 0;
  const sliceRatio = image ? sliceW / image.height : 0;
  const shape = image ? shapeName(sliceRatio) : null;
  // Instagram shows feed images between 4:5 (0.8) and 1.91:1; outside that range it crops.
  const inRange = sliceRatio >= 0.79 && sliceRatio <= 1.92;
  const shownIndex = Math.min(view, Math.max(0, previews.length - 1));

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Controls */}
      <div className="grid gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]">
        <div className="min-w-0">
          <label htmlFor={fileId} className="block text-sm font-semibold">Select an image to split</label>
          <input
            id={fileId}
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            aria-describedby={`${fileId}-help`}
            className="peer sr-only"
          />
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`mt-2 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 text-center transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--poskoo-violet)] sm:flex-row sm:text-left ${image ? "py-3" : "py-7"} ${dragging ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-band)]" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] hover:border-[var(--poskoo-violet)]"}`}
          >
            <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[var(--poskoo-band)] text-[var(--poskoo-violet)]" aria-hidden="true">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            </span>
            <span className="min-w-0">
              <span className="block break-all text-base font-semibold text-[var(--poskoo-ink)]">{image ? image.name : "Drop a wide photo or browse"}</span>
              <span className="block text-sm text-[#3d3450]">{image ? "Click or drop to use a different image." : "A panorama or wide shot works best."}</span>
            </span>
            <span className="inline-flex min-h-11 flex-none items-center gap-2 rounded-xl border border-[var(--poskoo-ink)] bg-[var(--poskoo-card)] px-4 text-sm font-semibold sm:ml-auto">
              <Upload className="h-4 w-4" aria-hidden="true" />{image ? "Replace" : "Browse"}
            </span>
          </div>
          <p id={`${fileId}-help`} className="mt-2 text-xs text-[var(--poskoo-muted)]">
            One image is read in your browser and never uploaded. It is split into equal-width vertical slides.
          </p>
        </div>
        <div className="min-w-0">
          <label htmlFor={countId} className="block text-sm font-semibold">Number of slides</label>
          <div className="relative mt-2">
            <Columns3 aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--poskoo-violet)]" />
            <select
              id={countId}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="block min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] pl-10 pr-3 text-base text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)]"
            >
              {Array.from({ length: MAX_SLIDES - MIN_SLIDES + 1 }, (_, i) => MIN_SLIDES + i).map((n) => (
                <option key={n} value={n}>{n} slides</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex h-10 gap-1 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1" aria-hidden="true">
            {Array.from({ length: count }, (_, i) => (
              <i key={i} className="grid flex-1 place-items-center rounded-md bg-[var(--poskoo-band)] text-[10px] font-bold not-italic tabular-nums text-[var(--poskoo-violet)]">{i + 1}</i>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-[var(--poskoo-coral)] bg-[var(--poskoo-coral)]/10 px-3 py-2 text-sm text-[#3d3450]">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-coral)]" aria-hidden="true" />{error}
        </p>
      ) : null}
      {loading ? <p className="text-sm text-[var(--poskoo-muted)]" role="status">Reading your image…</p> : null}

      {!image && !loading ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-10 text-center text-sm text-[var(--poskoo-muted)]">
          <Scissors className="h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden="true" />
          <p>Your slides appear here, cut left to right, ready to download.</p>
        </div>
      ) : null}

      {image && previews.length > 0 ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className={kpi}>
              <p className={kpiLabel}><Maximize2 className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Source image</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{image.width}×{image.height}</p>
              <p className="mt-1 text-xs text-[#3d3450]">Pixels, read from your file.</p>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}><Columns3 className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Slides</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{previews.length}</p>
              <p className="mt-1 text-xs text-[#3d3450]">Equal-width cuts, left to right.</p>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}><Scissors className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Each slide</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{sliceW}×{image.height}</p>
              <p className="mt-1 text-xs text-[#3d3450]">PNG, no resizing.</p>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}><Ratio className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Slide shape</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{sliceRatio.toFixed(2)}<span className="text-base font-medium text-[#5f5873]"> : 1</span></p>
              <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${inRange ? "text-[#146b43]" : "text-[#a8410f]"}`}>
                {inRange ? <Check className="h-3.5 w-3.5 flex-none" aria-hidden="true" /> : <AlertTriangle className="h-3.5 w-3.5 flex-none" aria-hidden="true" />}
                {shape ?? (inRange ? "Within 4:5 to 1.91:1" : sliceRatio < 0.79 ? "Taller than 4:5, will crop" : "Wider than 1.91:1, will crop")}
              </p>
            </div>
          </div>

          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-3" aria-live="polite">
                <p className="text-sm text-[#3d3450]">
                  {image.name} · {image.width}×{image.height} px · {previews.length} slides, left to right
                </p>
              </div>

              {/* Source with cut lines */}
              <figure className="mx-0 mb-0">
                <div className="grid place-items-center overflow-hidden rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-ink)]">
                  <div className="relative w-fit max-w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.src} alt="" className="block max-h-[360px] max-w-full" />
                  <div className="absolute inset-0 flex" aria-hidden="true">
                    {previews.map((_, i) => (
                      <button key={i} type="button" tabIndex={-1} onClick={() => setView(i)}
                        className={`relative flex-1 border-white/80 transition ${i > 0 ? "border-l-2 border-dashed" : ""} ${i === shownIndex ? "bg-[var(--poskoo-lime)]/25" : "hover:bg-white/10"}`}>
                        <span className="absolute left-1.5 top-1.5 grid h-6 min-w-6 place-items-center rounded-full bg-white/90 px-1 text-[11px] font-bold tabular-nums text-[var(--poskoo-ink)]">{i + 1}</span>
                      </button>
                    ))}
                  </div>
                  </div>
                </div>
                <figcaption className="mt-1.5 text-xs text-[#5f5873]">Dashed lines show where each slide is cut.</figcaption>
              </figure>

              <ol className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
                {previews.map((url, i) => (
                  <li key={i} className={`rounded-2xl border bg-[var(--poskoo-paper)] p-2.5 ${i === shownIndex ? "border-[var(--poskoo-violet)]" : "border-[var(--poskoo-line)]"}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Slide ${i + 1} of ${previews.length}: ${image.name}`} className="w-full rounded-xl border border-[var(--poskoo-line)]" />
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="whitespace-nowrap text-sm font-medium text-[var(--poskoo-ink)]">Slide {i + 1} of {previews.length}</span>
                      <button
                        type="button"
                        onClick={() => download(i)}
                        className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-xs font-medium text-[#3d3450] max-sm:w-full hover:border-[var(--poskoo-ink)]"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Primary action + swipe preview */}
            <aside aria-label="Download and preview" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
              <button
                type="button"
                onClick={downloadAll}
                disabled={dlState === "busy"}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-70"
              >
                {dlState === "done" ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
                {dlState === "busy" ? `Saving ${previews.length} PNGs…` : dlState === "done" ? "Downloaded" : "Download all slides"}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className={`${ghostBtn} w-full hover:text-[var(--poskoo-red)]`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear image
              </button>
              <span className="sr-only" aria-live="polite">{dlState === "busy" ? `Downloading ${previews.length} slides` : dlState === "done" ? "Slides downloaded" : ""}</span>

              <div className="max-lg:hidden">
                <h4 id={`${fileId}-prev`} className="flex items-center justify-between text-sm font-semibold">
                  Swipe preview
                  <span className="text-xs font-medium tabular-nums text-[#5f5873]">{shownIndex + 1} / {previews.length}</span>
                </h4>
                <div className="mx-auto mt-2 max-w-[300px] rounded-[22px] border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-2.5 shadow-[var(--poskoo-shadow-card)] lg:max-w-none">
                  <div className="flex items-center gap-2 px-1 pb-2">
                    <span className="h-7 w-7 rounded-full bg-[conic-gradient(var(--poskoo-violet),var(--poskoo-pink),var(--poskoo-peach),var(--poskoo-violet))] p-[2px]" aria-hidden="true"><span className="block h-full w-full rounded-full border-2 border-white bg-[var(--poskoo-band)]" /></span>
                    <span className="text-xs font-semibold">your_account</span>
                  </div>
                  <div className="relative">
                    <div className="grid max-h-[420px] place-items-center overflow-hidden rounded-lg bg-[var(--poskoo-ink)]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previews[shownIndex]} alt="" className="max-h-[420px] w-full object-contain" />
                    </div>
                    <button type="button" onClick={() => setView(Math.max(0, shownIndex - 1))} disabled={shownIndex === 0} aria-label="Previous slide"
                      className="absolute left-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--poskoo-ink)] shadow disabled:hidden">
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => setView(Math.min(previews.length - 1, shownIndex + 1))} disabled={shownIndex === previews.length - 1} aria-label="Next slide"
                      className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--poskoo-ink)] shadow disabled:hidden">
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="flex justify-center gap-1 py-2.5" aria-hidden="true">
                    {previews.map((_, i) => <i key={i} className={`h-1.5 rounded-full transition-all ${i === shownIndex ? "w-4 bg-[var(--poskoo-violet)]" : "w-1.5 bg-[var(--poskoo-line)]"}`} />)}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
