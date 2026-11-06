"use client";

import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Download } from "lucide-react";
import {
  CROP_FORMATS,
  STORY_SAFE_ZONE_PX,
  cropRect,
  type IgFormat,
} from "@/lib/igSizes";
import ui from "@/components/ui/ui.module.css";

const PREVIEW_MAX_W = 320;

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
      },
      "image/jpeg",
      0.92,
    );
  }

  function resetCenter() {
    setFocusX(0.5);
    setFocusY(0.5);
  }

  return (
    <div className="text-left">
      <div>
        <label htmlFor={fileId} className="text-sm font-medium">
          Upload a photo
        </label>
        <input
          id={fileId}
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="mt-2 block w-full max-w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--poskoo-violet)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
        />
        <p className="mt-1 text-xs text-[var(--poskoo-muted)]">Processed locally in your browser; nothing is uploaded.</p>
      </div>

      <fieldset className="mt-6 border-0 p-0">
        <legend id={formatLegendId} className="text-sm font-medium">
          Instagram format
        </legend>
        <div
          className="mt-2 flex flex-wrap gap-2"
          role="radiogroup"
          aria-labelledby={formatLegendId}
        >
          {CROP_FORMATS.map((f) => (
            <label
              key={f.id}
              className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium sm:text-sm ${
                formatId === f.id ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-violet)]/10 text-[var(--poskoo-violet)]" : "border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] text-[#3d3450]"
              }`}
            >
              <input
                type="radio"
                name="igFormat"
                value={f.id}
                checked={formatId === f.id}
                onChange={() => setFormatId(f.id)}
                className="sr-only"
              />
              {f.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
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
            <p className="text-sm font-medium">Reposition the subject</p>
            <p className="mt-1 text-xs text-[var(--poskoo-muted)]">
              Drag the sliders to move the crop; the preview and the downloaded JPG stay in sync.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-medium text-[#3d3450]">
            Horizontal
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(focusX * 100)}
              onChange={(e) => setFocusX(Number(e.target.value) / 100)}
              disabled={!imgLoaded}
              className="mt-1 w-full accent-[var(--poskoo-violet)]"
              aria-label="Horizontal crop position"
            />
          </label>
          <label className="text-xs font-medium text-[#3d3450]">
            Vertical
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(focusY * 100)}
              onChange={(e) => setFocusY(Number(e.target.value) / 100)}
              disabled={!imgLoaded}
              className="mt-1 w-full accent-[var(--poskoo-violet)]"
              aria-label="Vertical crop position"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={resetCenter}
          disabled={!imgLoaded}
          className="mt-3 inline-flex items-center rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-1.5 text-xs font-medium text-[#3d3450] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Center crop
        </button>
      </div>

      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="w-full max-w-[20rem] shrink-0">
          <p className="text-sm font-medium">Crop preview</p>
          <div className="mt-2 flex min-h-[12rem] items-center justify-center rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
            {!objectUrl ? (
              <p className="text-center text-sm text-[var(--poskoo-muted)]">Upload an image to see the crop.</p>
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
                  className="max-h-[min(70vh,32rem)] max-w-full object-contain"
                  aria-label={`Preview cropped to ${format.label}`}
                />
              </>
            )}
          </div>
          {format.id === "story-reel" && objectUrl ? (
            <p className="mt-2 text-xs text-[var(--poskoo-muted)]">
              Shaded areas: keep text and logos outside the top and bottom ~{STORY_SAFE_ZONE_PX} px at 1080×1920.
            </p>
          ) : null}
        </div>
        <div className="min-w-0 flex-1 text-sm text-[#3d3450]">
          <p>
            <span className="font-medium text-[var(--poskoo-ink)]">Output size:</span> {format.width}×{format.height} px
          </p>
          <p className="mt-2">{format.note}</p>
          <button
            type="button"
            onClick={downloadJpg}
            disabled={!imgLoaded}
            className={`${ui.inkFill} mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto`}
          >
            <Download className="h-4 w-4" />
            Download {format.width}px JPG
          </button>
        </div>
      </div>
    </div>
  );
}