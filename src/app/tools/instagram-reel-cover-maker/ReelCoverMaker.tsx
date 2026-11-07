"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Download } from "lucide-react";
import ui from "@/components/ui/ui.module.css";
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

const sliderClass = "mt-1.5 block w-full min-h-[44px] cursor-pointer accent-[var(--poskoo-violet)]";
const labelClass = "block text-sm font-semibold text-[var(--poskoo-ink)]";
const cardClass = "rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 sm:p-5 shadow-sm";

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
      if (blob) saveBlob(blob, "reel-cover.png");
    }, "image/png");
  }

  return (
    <div className="text-left">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
        {/* Live preview */}
        <div className="flex flex-col items-center">
          <div className={`w-full ${cardClass}`}>
            <div className="flex items-center justify-between border-b border-[var(--poskoo-line)] pb-3 mb-4">
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-[var(--poskoo-ink)]">Live preview</h3>
                <p className="text-xs text-[var(--poskoo-muted)]">1080×1920 Reel cover</p>
              </div>
              <span className="rounded-full bg-[var(--poskoo-band)] px-3 py-1 text-xs font-semibold text-[var(--poskoo-violet)]">
                {style.name}
              </span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <canvas
                ref={previewRef}
                role="img"
                aria-label={
                  img
                    ? `Reel cover preview${title ? ` with the title “${title}”` : ""}`
                    : "Empty Reel cover preview. Choose a photo to start."
                }
                className="block h-auto rounded-2xl border border-[var(--poskoo-line)] shadow-md"
                style={{ width: "100%", maxWidth: 320 }}
              />
              {guides && (
                <p className="text-xs text-[var(--poskoo-muted)] max-w-[20rem] text-center">
                  Yellow dashes: profile grid (3:4). Blue dashes: feed (4:5). Guides are not saved in the PNG.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          <div className={cardClass}>
            <label htmlFor={fileId} className={labelClass}>
              Cover photo
            </label>
            <input
              id={fileId}
              type="file"
              accept="image/*"
              onChange={onFile}
              className="mt-1.5 block w-full min-h-[44px] rounded-xl border border-[var(--poskoo-line)] bg-white px-3 py-2.5 text-sm text-[var(--poskoo-ink)] file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--poskoo-band)] file:px-3 file:py-1.5 file:font-semibold file:text-[var(--poskoo-violet)]"
            />
            <p className="mt-2 text-xs text-[var(--poskoo-muted)]">Your photo stays on your device. Nothing is uploaded.</p>
            {error && (
              <p className="mt-2 text-xs font-medium text-red-700" role="alert">
                {error}
              </p>
            )}

            <label htmlFor={zoomId} className={`${labelClass} mt-4`}>
              Zoom: {zoom.toFixed(2)}×
            </label>
            <input
              id={zoomId}
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className={sliderClass}
            />
            <label htmlFor={xId} className={`${labelClass} mt-3`}>
              Horizontal position
            </label>
            <input
              id={xId}
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={offsetX}
              onChange={(e) => setOffsetX(Number(e.target.value))}
              className={sliderClass}
            />
            <label htmlFor={yId} className={`${labelClass} mt-3`}>
              Vertical position
            </label>
            <input
              id={yId}
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={offsetY}
              onChange={(e) => setOffsetY(Number(e.target.value))}
              className={sliderClass}
            />
          </div>

          <div className={cardClass}>
            <label htmlFor={titleId} className={labelClass}>
              Title (optional, max 60 characters)
            </label>
            <input
              id={titleId}
              type="text"
              value={title}
              maxLength={60}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 3 hooks that doubled my views"
              className="mt-1.5 block w-full min-h-[44px] rounded-xl border border-[var(--poskoo-line)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--poskoo-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]"
            />

            <fieldset className="mt-4 border-0 p-0">
              <legend id={styleLegendId} className={labelClass}>
                Title style
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2" role="group" aria-labelledby={styleLegendId}>
                {TITLE_STYLES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setStyleId(t.id)}
                    aria-pressed={styleId === t.id}
                    className={`min-h-[44px] rounded-xl border-2 px-2 py-2 text-xs font-semibold transition ${
                      styleId === t.id ? "border-[var(--poskoo-violet)]" : "border-[var(--poskoo-line)] hover:border-[var(--poskoo-violet)]"
                    }`}
                    style={{ backgroundColor: t.bg ?? "#3d3450", color: t.fg }}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </fieldset>

            <label htmlFor={sizeId} className={`${labelClass} mt-4`}>
              Font size: {fontSize}px
            </label>
            <input
              id={sizeId}
              type="range"
              min={64}
              max={120}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className={sliderClass}
            />

            <label htmlFor={guidesId} className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--poskoo-ink)]">
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

          <div className={`${cardClass} space-y-3`}>
            <button
              type="button"
              onClick={download}
              disabled={!img}
              className={`${ui.inkFill} inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold min-h-[44px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
            <p className="text-xs text-[var(--poskoo-muted)] leading-relaxed">
              {img
                ? "Saves reel-cover.png (1080×1920) to your device. Crop guides are left out."
                : "Choose a photo first to enable the download."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
