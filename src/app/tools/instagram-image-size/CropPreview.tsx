"use client";

import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Check, Crop, Download, ImageIcon, ImagePlus, Maximize2, RotateCcw, Ratio } from "lucide-react";
import {
  CROP_FORMATS,
  STORY_SAFE_ZONE_PX,
  cropRect,
  type IgFormat,
} from "@/lib/igSizes";

const PREVIEW_MAX_W = 320;

function gcd(a: number, b: number): number {
  return b ? gcd(b, a % b) : a;
}

/** "4:5" when the sides reduce to small numbers, otherwise "1.91:1". */
function ratioLabel(w: number, h: number): string {
  const d = gcd(w, h);
  if (w / d <= 20 && h / d <= 20) return `${w / d}:${h / d}`;
  return w >= h ? `${(w / h).toFixed(2)}:1` : `1:${(h / w).toFixed(2)}`;
}

const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const ghostBtn =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:cursor-not-allowed disabled:opacity-40";
const primaryBtn =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] disabled:cursor-not-allowed disabled:opacity-40";

function drawPreview(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  format: IgFormat,
  focusX = 0.5,
  focusY = 0.5,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const { width: outW, height: outH } = format;
  const scale = PREVIEW_MAX_W / outW;
  const dispW = Math.round(outW * scale);
  const dispH = Math.round(outH * scale);
  canvas.width = dispW;
  canvas.height = dispH;

  const crop = cropRect(img.naturalWidth, img.naturalHeight, format.ratio, focusX, focusY);
  ctx.clearRect(0, 0, dispW, dispH);
  ctx.save();
  if (format.circlePreview) {
    ctx.beginPath();
    ctx.arc(dispW / 2, dispH / 2, Math.min(dispW, dispH) / 2, 0, Math.PI * 2);
    ctx.clip();
  }
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, dispW, dispH);
  ctx.restore();

  if (format.id === "story-reel") {
    const top = STORY_SAFE_ZONE_PX * scale;
    const bottom = STORY_SAFE_ZONE_PX * scale;
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, dispW, top);
    ctx.fillRect(0, dispH - bottom, dispW, bottom);
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, top + 0.5, dispW - 1, dispH - top - bottom - 1);
  }
}

function renderExportCanvas(img: HTMLImageElement, format: IgFormat, focusX = 0.5, focusY = 0.5): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = format.width;
  canvas.height = format.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const crop = cropRect(img.naturalWidth, img.naturalHeight, format.ratio, focusX, focusY);
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, format.width, format.height);
  return canvas;
}

export default function CropPreview() {
  const [formatId, setFormatId] = useState(CROP_FORMATS[1]?.id ?? "feed-portrait");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [focusX, setFocusX] = useState(0.5);
  const [focusY, setFocusY] = useState(0.5);
  const [srcSize, setSrcSize] = useState<{ w: number; h: number } | null>(null);
  const [downloaded, setDownloaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileId = useId();
  const formatLegendId = useId();

  const format = CROP_FORMATS.find((f) => f.id === formatId) ?? CROP_FORMATS[0];

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !imgLoaded) return;
    drawPreview(canvas, img, format, focusX, focusY);
  }, [format, imgLoaded, focusX, focusY]);

  useEffect(() => {
    redraw();
  }, [redraw, objectUrl]);

  useEffect(() => {
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [objectUrl]);

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    setImgLoaded(false);
    setSrcSize(null);
    setFocusX(0.5);
    setFocusY(0.5);
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
  }

  function onImageLoad() {
    setFocusX(0.5);
    setFocusY(0.5);
    const img = imgRef.current;
    if (img) setSrcSize({ w: img.naturalWidth, h: img.naturalHeight });
    setImgLoaded(true);
  }

  function downloadJpg() {
    const img = imgRef.current;
    if (!img || !imgLoaded) return;
    const exportCanvas = renderExportCanvas(img, format, focusX, focusY);
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `instagram-${format.id}-${format.width}x${format.height}.jpg`;
        a.click();
        URL.revokeObjectURL(a.href);
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 1800);
      },
      "image/jpeg",
      0.92,
    );
  }

  // Same crop the preview and export use, for the summary cards.
  const crop = srcSize ? cropRect(srcSize.w, srcSize.h, format.ratio, focusX, focusY) : null;
  const keptPct = crop && srcSize ? Math.round(((crop.w * crop.h) / (srcSize.w * srcSize.h)) * 100) : null;
  const upscaled = crop ? Math.round(crop.w) < format.width : false;

  function resetCenter() {
    setFocusX(0.5);
    setFocusY(0.5);
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* At-a-glance summary, from the chosen format and the loaded photo */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}>
            <Maximize2 className="h-3 w-3" aria-hidden="true" />
            Output size
          </p>
          <p className="mt-1 whitespace-nowrap text-lg font-bold sm:text-xl tabular-nums text-[var(--poskoo-ink)]">
            {format.width}×{format.height}
          </p>
          <p className="mt-1 truncate text-xs text-[#3d3450]">{format.label}</p>
        </div>
        <div className={`${kpi} flex items-center gap-3`}>
          <span className="grid h-12 w-12 flex-none place-items-center" aria-hidden="true">
            <i
              className={`block border-2 border-[var(--poskoo-violet)] bg-[var(--poskoo-band)] ${format.circlePreview ? "rounded-full" : "rounded-[4px]"}`}
              style={format.ratio >= 1 ? { width: 44, height: 44 / format.ratio } : { height: 44, width: 44 * format.ratio }}
            />
          </span>
          <div className="min-w-0">
            <p className={kpiLabel}>
              <Ratio className="h-3 w-3" aria-hidden="true" />
              Aspect
            </p>
            <p className="mt-1 whitespace-nowrap text-lg font-bold sm:text-xl tabular-nums text-[var(--poskoo-ink)]">{ratioLabel(format.width, format.height)}</p>
          </div>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>
            <ImageIcon className="h-3 w-3" aria-hidden="true" />
            Your photo
          </p>
          <p className="mt-1 truncate whitespace-nowrap text-lg font-bold sm:text-xl tabular-nums text-[var(--poskoo-ink)]">
            {srcSize ? `${srcSize.w}×${srcSize.h}` : "—"}
          </p>
          <p className={`mt-1 text-xs ${upscaled ? "font-semibold text-[#a8410f]" : "text-[#3d3450]"}`}>
            {crop ? (upscaled ? `Crop is ${Math.round(crop.w)}px wide, so it will be upscaled.` : `Crop is ${Math.round(crop.w)}×${Math.round(crop.h)} px.`) : "Upload a photo to compare."}
          </p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>
            <Crop className="h-3 w-3" aria-hidden="true" />
            Photo kept
          </p>
          <p className="mt-1 whitespace-nowrap text-lg font-bold sm:text-xl tabular-nums text-[var(--poskoo-ink)]">{keptPct === null ? "—" : `${keptPct}%`}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
            <i className="block h-full rounded-full bg-[var(--poskoo-violet)] transition-[width]" style={{ width: `${keptPct ?? 0}%` }} />
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Controls */}
        <div className="min-w-0 space-y-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div>
            <label htmlFor={fileId} className="text-sm font-semibold">
              Upload a photo
            </label>
            <input
              id={fileId}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="mt-2 block w-full min-h-11 max-w-full rounded-xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-2 text-sm file:mr-3 file:min-h-9 file:rounded-lg file:border-0 file:bg-[var(--poskoo-ink)] file:px-3 file:text-sm file:font-semibold file:text-white hover:border-[var(--poskoo-violet)]"
            />
            <p className="mt-1.5 text-xs text-[var(--poskoo-muted)]">Processed locally in your browser; nothing is uploaded.</p>
          </div>

          <fieldset className="border-0 border-t border-[var(--poskoo-line)] p-0 pt-4">
            <legend id={formatLegendId} className="float-left w-full text-sm font-semibold">
              Instagram format
            </legend>
            <div className="clear-both grid grid-cols-2 gap-2 pt-2 sm:grid-cols-3" role="radiogroup" aria-labelledby={formatLegendId}>
              {CROP_FORMATS.map((f) => {
                const on = formatId === f.id;
                return (
                  <label
                    key={f.id}
                    className={`flex min-h-14 cursor-pointer items-center gap-2.5 rounded-xl border px-2.5 py-2 transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--poskoo-violet)] ${
                      on ? "border-[var(--poskoo-ink)] bg-[var(--poskoo-ink)] text-white" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] text-[#3d3450] hover:border-[var(--poskoo-violet)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="igFormat"
                      value={f.id}
                      checked={on}
                      onChange={() => setFormatId(f.id)}
                      className="sr-only"
                    />
                    <span className="grid h-7 w-7 flex-none place-items-center" aria-hidden="true">
                      <i
                        className={`block border-[1.5px] ${on ? "border-[var(--poskoo-lime)]" : "border-current"} ${f.circlePreview ? "rounded-full" : "rounded-[3px]"}`}
                        style={f.ratio >= 1 ? { width: 26, height: 26 / f.ratio } : { height: 26, width: 26 * f.ratio }}
                      />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13px] font-semibold leading-tight">{f.label}</span>
                      <span className={`block text-[11px] tabular-nums ${on ? "text-white/75" : "text-[#5f5873]"}`}>
                        {f.width}×{f.height}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <div className="border-t border-[var(--poskoo-line)] pt-4">
            <div className="flex items-center gap-3">
              <svg
                viewBox="0 0 80 60"
                className="h-12 w-16 shrink-0 text-[var(--poskoo-violet)]"
                aria-hidden="true"
                focusable="false"
              >
                <rect
                  x="22"
                  y="10"
                  width="36"
                  height="40"
                  rx="6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  opacity="0.45"
                />
                <circle cx="40" cy="30" r="7" fill="currentColor" className="crop-subject-dot" />
                <style>{`
                  @media (prefers-reduced-motion: no-preference) {
                    .crop-subject-dot { animation: crop-subject-move 2.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
                  }
                  @keyframes crop-subject-move {
                    0%, 100% { transform: translate(-10px, 0); }
                    50% { transform: translate(10px, 0); }
                  }
                `}</style>
              </svg>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Reposition the subject</p>
                <p className="mt-1 text-xs text-[var(--poskoo-muted)]">
                  Drag the sliders to move the crop; the preview and the downloaded JPG stay in sync.
                </p>
              </div>
            </div>

            <div className="mt-3 grid gap-x-4 gap-y-2 sm:grid-cols-2">
              <label className="text-xs font-medium text-[#3d3450]">
                <span className="flex justify-between">
                  Horizontal <span className="tabular-nums text-[var(--poskoo-violet)]">{Math.round(focusX * 100)}%</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(focusX * 100)}
                  onChange={(e) => setFocusX(Number(e.target.value) / 100)}
                  disabled={!imgLoaded}
                  className="mt-1 min-h-11 w-full accent-[var(--poskoo-violet)] disabled:opacity-40"
                  aria-label="Horizontal crop position"
                />
              </label>
              <label className="text-xs font-medium text-[#3d3450]">
                <span className="flex justify-between">
                  Vertical <span className="tabular-nums text-[var(--poskoo-violet)]">{Math.round(focusY * 100)}%</span>
                </span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={Math.round(focusY * 100)}
                  onChange={(e) => setFocusY(Number(e.target.value) / 100)}
                  disabled={!imgLoaded}
                  className="mt-1 min-h-11 w-full accent-[var(--poskoo-violet)] disabled:opacity-40"
                  aria-label="Vertical crop position"
                />
              </label>
            </div>
            <button type="button" onClick={resetCenter} disabled={!imgLoaded} className={`${ghostBtn} mt-2`}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Center crop
            </button>
          </div>
        </div>

        {/* Preview + download */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Crop preview</p>
            <span className="flex-none rounded-full bg-[var(--poskoo-band)] px-3 py-1 text-xs font-semibold tabular-nums text-[var(--poskoo-violet)]">
              {ratioLabel(format.width, format.height)}
            </span>
          </div>
          <div className="flex min-h-[12rem] items-center justify-center rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3">
            {!objectUrl ? (
              <div
                aria-hidden="true"
                onClick={() => document.getElementById(fileId)?.click()}
                className="grid w-full cursor-pointer justify-items-center gap-2 rounded-xl border-2 border-dashed border-[var(--poskoo-line)] px-3 py-8 text-center text-sm text-[var(--poskoo-muted)] hover:border-[var(--poskoo-violet)]"
              >
                <ImagePlus className="h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden="true" />
                Upload an image to see the crop.
              </div>
            ) : (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={objectUrl}
                  alt=""
                  onLoad={onImageLoad}
                  className="hidden"
                />
                <canvas
                  ref={canvasRef}
                  className="max-h-[min(50vh,28rem)] max-w-full rounded-lg object-contain"
                  aria-label={`Preview cropped to ${format.label}`}
                />
              </>
            )}
          </div>
          {format.id === "story-reel" && objectUrl ? (
            <p className="text-xs text-[var(--poskoo-muted)]">
              Shaded areas: keep text and logos outside the top and bottom ~{STORY_SAFE_ZONE_PX} px at 1080×1920.
            </p>
          ) : null}

          <button type="button" onClick={downloadJpg} disabled={!imgLoaded} className={primaryBtn}>
            {downloaded ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
            {downloaded ? "Downloaded" : `Download ${format.width}px JPG`}
          </button>
          <span className="sr-only" aria-live="polite">{downloaded ? "JPG downloaded" : ""}</span>
          <div className="text-sm text-[#3d3450]">
            <p>
              <span className="font-medium text-[var(--poskoo-ink)]">Output size:</span> {format.width}×{format.height} px
            </p>
            <p className="mt-1 text-xs leading-relaxed">{format.note}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
