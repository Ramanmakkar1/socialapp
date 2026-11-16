"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Download, ImagePlus, Maximize2, RotateCcw, Type, ZoomIn } from "lucide-react";
import {
  CROPS,
  REEL_H,
  REEL_W,
  TITLE_STYLES,
  coverFit,
  cropRect,
  titleBox,
  wrapTitle,
  type TitleStyle,
} from "@/lib/reelCover";

interface DrawOpts {
  img: HTMLImageElement | null;
  zoom: number;
  offsetX: number;
  offsetY: number;
  title: string;
  style: TitleStyle;
  fontSize: number;
  guides: boolean;
}

const FONT_STACK = "system-ui, -apple-system, Segoe UI, sans-serif";
const GUIDE_COLORS: Record<string, string> = { grid: "#ffd84d", feed: "#4de1ff" };

/** Roughly how many characters fit on one line of the 960 px title band. */
function maxCharsFor(fontSize: number): number {
  return Math.max(8, Math.floor((REEL_W - 120 - fontSize) / (0.56 * fontSize)));
}

function paintTitle(ctx: CanvasRenderingContext2D, o: DrawOpts) {
  const lines = wrapTitle(o.title, maxCharsFor(o.fontSize), 3);
  if (lines.length === 0) return;
  const box = titleBox(lines, o.fontSize);
  const padding = 0.5 * o.fontSize;
  const lineHeight = 1.15 * o.fontSize;

  if (o.style.band && o.style.bg) {
    ctx.fillStyle = o.style.bg;
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, 28);
    ctx.fill();
  }

  ctx.save();
  ctx.fillStyle = o.style.fg;
  ctx.font = `700 ${o.fontSize}px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (!o.style.band) {
    // No band: a soft shadow keeps white text readable on bright photos.
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;
  }
  lines.forEach((line, i) => {
    ctx.fillText(line, REEL_W / 2, box.y + padding + lineHeight * (i + 0.5), box.w - padding * 2);
  });
  ctx.restore();
}

function paintGuides(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.lineWidth = 6;
  ctx.setLineDash([28, 18]);
  ctx.font = `700 34px ${FONT_STACK}`;
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  CROPS.forEach((crop, i) => {
    const r = cropRect(crop);
    const color = GUIDE_COLORS[crop.id] ?? "#ffffff";
    ctx.strokeStyle = color;
    ctx.strokeRect(r.x + 3 + i * 10, r.y, r.w - 6 - i * 20, r.h);

    // Small label tag: grid above its top edge, feed just inside its top edge.
    const label = crop.label;
    const tw = ctx.measureText(label).width + 28;
    const ty = i === 0 ? r.y - 56 : r.y + 14;
    const tx = i === 0 ? 20 : REEL_W - tw - 20;
    ctx.fillStyle = "rgba(30, 22, 49, 0.85)";
    ctx.fillRect(tx, ty, tw, 46);
    ctx.fillStyle = color;
    ctx.fillText(label, tx + 14, ty + 6);
  });
  ctx.restore();
}

function drawReel(canvas: HTMLCanvasElement, o: DrawOpts) {
  canvas.width = REEL_W;
  canvas.height = REEL_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = "#1e1631";
  ctx.fillRect(0, 0, REEL_W, REEL_H);
  if (o.img) {
    const f = coverFit(o.img.naturalWidth, o.img.naturalHeight, o.zoom, o.offsetX, o.offsetY);
    ctx.drawImage(o.img, f.dx, f.dy, f.dw, f.dh);
  }
  paintTitle(ctx, o);
  if (o.guides) paintGuides(ctx);
}

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const sliderClass = "mt-1 block w-full min-h-11 cursor-pointer accent-[var(--poskoo-violet)] disabled:cursor-not-allowed disabled:opacity-40";
const labelClass = "flex items-center justify-between gap-2 text-sm font-semibold text-[var(--poskoo-ink)]";
const panelClass = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4";
const valueChip = "rounded-md bg-[var(--poskoo-band)] px-1.5 tabular-nums text-[var(--poskoo-violet)]";
const ghostBtn =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const primaryBtn =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

export default function ReelCoverMaker() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [title, setTitle] = useState("");
  const [styleId, setStyleId] = useState<string>(TITLE_STYLES[0].id);
  const [fontSize, setFontSize] = useState(88);
  const [guides, setGuides] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState(false);

  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const fileId = useId();
  const zoomId = useId();
  const xId = useId();
  const yId = useId();
  const titleId = useId();
  const sizeId = useId();
  const guidesId = useId();
  const styleLegendId = useId();

  const style = TITLE_STYLES.find((t) => t.id === styleId) ?? TITLE_STYLES[0];
  // Same wrap the canvas uses, so the line count matches the preview.
  const titleLines = wrapTitle(title, maxCharsFor(fontSize), 3).length;
  const framed = zoom !== 1 || offsetX !== 0 || offsetY !== 0;

  // Load the chosen photo; revoke the object URL when it changes or on unmount.
  useEffect(() => {
    if (!imageUrl) return;
    let cancelled = false;
    const el = new window.Image();
    el.onload = () => {
      if (!cancelled) setImg(el);
    };
    el.onerror = () => {
      if (!cancelled) {
        setImg(null);
        setError("That file could not be opened as an image. Try a JPG or PNG.");
      }
    };
    el.src = imageUrl;
    return () => {
      cancelled = true;
      URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  useEffect(() => {
    const canvas = previewRef.current;
    if (!canvas) return;
    drawReel(canvas, { img, zoom, offsetX, offsetY, title, style, fontSize, guides });
  }, [img, zoom, offsetX, offsetY, title, style, fontSize, guides]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setFileName(file.name);
    setImg(null);
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setImageUrl(URL.createObjectURL(file));
  }

  function download() {
    if (!img) return;
    // Export on a separate offscreen canvas so the crop guides never end up in the PNG.
    const canvas = document.createElement("canvas");
    drawReel(canvas, { img, zoom, offsetX, offsetY, title, style, fontSize, guides: false });
    canvas.toBlob((blob) => {
      if (blob) {
        saveBlob(blob, "reel-cover.png");
        setDownloaded(true);
        setTimeout(() => setDownloaded(false), 1800);
      }
    }, "image/png");
  }

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* At-a-glance summary, from the photo and the current settings */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}>
            <ImagePlus className="h-3 w-3" aria-hidden="true" />
            Photo
          </p>
          <p className="mt-1 truncate whitespace-nowrap text-lg font-bold sm:text-xl tabular-nums text-[var(--poskoo-ink)]">
            {img ? `${img.naturalWidth}×${img.naturalHeight}` : "—"}
          </p>
          <p className="mt-1 truncate text-xs text-[#3d3450]">{img && fileName ? fileName : "No photo chosen yet."}</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>
            <Maximize2 className="h-3 w-3" aria-hidden="true" />
            Export
          </p>
          <p className="mt-1 whitespace-nowrap text-lg font-bold sm:text-xl tabular-nums text-[var(--poskoo-ink)]">
            {REEL_W}×{REEL_H}
          </p>
          <p className="mt-1 text-xs text-[#3d3450]">9:16 PNG, crop guides left out.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>
            <ZoomIn className="h-3 w-3" aria-hidden="true" />
            Zoom
          </p>
          <p className="mt-1 whitespace-nowrap text-lg font-bold sm:text-xl tabular-nums text-[var(--poskoo-ink)]">{zoom.toFixed(2)}×</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
            <i className="block h-full rounded-full bg-[var(--poskoo-violet)]" style={{ width: `${((zoom - 1) / 2) * 100}%` }} />
          </div>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>
            <Type className="h-3 w-3" aria-hidden="true" />
            Title
          </p>
          <p className="mt-1 whitespace-nowrap text-lg font-bold sm:text-xl tabular-nums text-[var(--poskoo-ink)]">
            {titleLines}
            <span className="text-base font-medium text-[#5f5873]"> / 3 lines</span>
          </p>
          <p className="mt-1 text-xs tabular-nums text-[#3d3450]">
            {title.length}/60 chars · {fontSize}px
          </p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Controls */}
        <div className="min-w-0 space-y-4">
          <div className={panelClass}>
            <label htmlFor={fileId} className={labelClass}>
              Cover photo
            </label>
            <input
              id={fileId}
              type="file"
              accept="image/*"
              onChange={onFile}
              className="mt-2 block w-full min-h-11 max-w-full rounded-xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-2 text-sm text-[var(--poskoo-ink)] file:mr-3 file:min-h-9 file:rounded-lg file:border-0 file:bg-[var(--poskoo-ink)] file:px-3 file:font-semibold file:text-white hover:border-[var(--poskoo-violet)]"
            />
            <p className="mt-2 text-xs text-[var(--poskoo-muted)]">Your photo stays on your device. Nothing is uploaded.</p>
            {error && (
              <p className="mt-2 text-xs font-medium text-red-700" role="alert">
                {error}
              </p>
            )}

            <div className="mt-4 grid gap-x-4 gap-y-2 border-t border-[var(--poskoo-line)] pt-4 sm:grid-cols-3">
              <div className="min-w-0">
                <label htmlFor={zoomId} className={labelClass}>
                  <span>Zoom: {zoom.toFixed(2)}×</span>
                </label>
                <input id={zoomId} type="range" min={1} max={3} step={0.01} value={zoom} disabled={!img} onChange={(e) => setZoom(Number(e.target.value))} className={sliderClass} />
              </div>
              <div className="min-w-0">
                <label htmlFor={xId} className={labelClass}>
                  Horizontal position
                </label>
                <input id={xId} type="range" min={-1} max={1} step={0.01} value={offsetX} disabled={!img} onChange={(e) => setOffsetX(Number(e.target.value))} className={sliderClass} />
              </div>
              <div className="min-w-0">
                <label htmlFor={yId} className={labelClass}>
                  Vertical position
                </label>
                <input id={yId} type="range" min={-1} max={1} step={0.01} value={offsetY} disabled={!img} onChange={(e) => setOffsetY(Number(e.target.value))} className={sliderClass} />
              </div>
            </div>
            <button
              type="button"
              disabled={!framed}
              onClick={() => {
                setZoom(1);
                setOffsetX(0);
                setOffsetY(0);
              }}
              className={`${ghostBtn} mt-2`}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Reset framing
            </button>
          </div>

          <div className={panelClass}>
            <label htmlFor={titleId} className={labelClass}>
              Title (optional, max 60 characters)
              <span className={valueChip} aria-hidden="true">{title.length}/60</span>
            </label>
            <input
              id={titleId}
              type="text"
              value={title}
              maxLength={60}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 3 hooks that doubled my views"
              className="mt-2 block w-full min-h-11 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base font-medium text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)]"
            />

            <fieldset className="mt-4 border-0 p-0">
              <legend id={styleLegendId} className={labelClass}>
                Title style
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-labelledby={styleLegendId}>
                {TITLE_STYLES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setStyleId(t.id)}
                    aria-pressed={styleId === t.id}
                    className={`relative min-h-11 rounded-xl px-2 py-2 text-xs font-semibold ring-offset-2 ring-offset-[var(--poskoo-paper)] transition ${
                      styleId === t.id ? "ring-2 ring-[var(--poskoo-violet)]" : "ring-1 ring-[var(--poskoo-line)] hover:ring-[var(--poskoo-ink)]"
                    }`}
                    style={{ backgroundColor: t.bg ?? "#3d3450", color: t.fg }}
                  >
                    {t.name}
                    {styleId === t.id && (
                      <Check className="absolute right-1 top-1 h-3.5 w-3.5 rounded-full bg-[var(--poskoo-lime)] p-0.5 text-[var(--poskoo-ink)]" aria-hidden="true" />
                    )}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-4 grid gap-x-4 gap-y-2 border-t border-[var(--poskoo-line)] pt-4 sm:grid-cols-2 sm:items-end">
              <div className="min-w-0">
                <label htmlFor={sizeId} className={labelClass}>
                  Font size: {fontSize}px
                </label>
                <input id={sizeId} type="range" min={64} max={120} step={1} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className={sliderClass} />
              </div>
              <label htmlFor={guidesId} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-semibold text-[var(--poskoo-ink)]">
                <input
                  id={guidesId}
                  type="checkbox"
                  checked={guides}
                  onChange={(e) => setGuides(e.target.checked)}
                  className="h-5 w-5 cursor-pointer accent-[var(--poskoo-violet)]"
                />
                Show crop guides
              </label>
            </div>
          </div>
        </div>

        {/* Live preview + download */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[var(--poskoo-ink)]">Live preview</h3>
              <p className="text-xs text-[var(--poskoo-muted)]">1080×1920 Reel cover</p>
            </div>
            <span className="flex-none rounded-full bg-[var(--poskoo-band)] px-3 py-1 text-xs font-semibold text-[var(--poskoo-violet)]">
              {style.name}
            </span>
          </div>
          <div className="relative mx-auto w-full max-w-[15rem]">
            <canvas
              ref={previewRef}
              role="img"
              aria-label={
                img
                  ? `Reel cover preview${title ? ` with the title “${title}”` : ""}`
                  : "Empty Reel cover preview. Choose a photo to start."
              }
              className="block h-auto w-full rounded-2xl border border-[var(--poskoo-line)] shadow-md"
            />
            {!img && (
              <div
                aria-hidden="true"
                onClick={() => document.getElementById(fileId)?.click()}
                className="absolute inset-3 grid cursor-pointer place-content-center justify-items-center gap-2 rounded-xl border-2 border-dashed border-white/40 p-3 text-center text-xs font-medium text-white/85 hover:border-white/80"
              >
                <ImagePlus className="h-8 w-8 text-[var(--poskoo-lime)]" aria-hidden="true" />
                Choose a photo to start
              </div>
            )}
          </div>
          {guides && (
            <ul className="space-y-1 text-xs text-[var(--poskoo-muted)]">
              <li className="flex items-center gap-2">
                <i className="h-0 w-5 flex-none border-t-2 border-dashed" style={{ borderColor: GUIDE_COLORS.grid }} aria-hidden="true" />
                Yellow dashes: profile grid (3:4).
              </li>
              <li className="flex items-center gap-2">
                <i className="h-0 w-5 flex-none border-t-2 border-dashed" style={{ borderColor: GUIDE_COLORS.feed }} aria-hidden="true" />
                Blue dashes: feed (4:5). Guides are not saved in the PNG.
              </li>
            </ul>
          )}

          <button type="button" onClick={download} disabled={!img} className={primaryBtn}>
            {downloaded ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
            {downloaded ? "Downloaded" : "Download PNG"}
          </button>
          <span className="sr-only" aria-live="polite">{downloaded ? "Reel cover downloaded" : ""}</span>
          <p className="text-xs leading-relaxed text-[var(--poskoo-muted)]">
            {img
              ? "Saves reel-cover.png (1080×1920) to your device. Crop guides are left out."
              : "Choose a photo first to enable the download."}
          </p>
        </aside>
      </div>
    </div>
  );
}
