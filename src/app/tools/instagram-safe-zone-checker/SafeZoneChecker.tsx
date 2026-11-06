"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Download } from "lucide-react";
import {
  FRAME_H,
  FRAME_W,
  SAFE_ZONES,
  SAFE_ZONE_MODES,
  toPixels,
  type SafeZoneMode,
} from "@/lib/safeZones";

type Media = { url: string; kind: "image" | "video"; name: string };

const ZONE_RGB = "225, 29, 72";

function drawTemplate(mode: SafeZoneMode, showGrid: boolean): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = FRAME_W;
  canvas.height = FRAME_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  ctx.fillStyle = "#f5f5fa";
  ctx.fillRect(0, 0, FRAME_W, FRAME_H);

  if (showGrid) {
    ctx.strokeStyle = "rgba(13,13,20,0.18)";
    ctx.lineWidth = 3;
    for (let i = 1; i < 3; i++) {
      const x = Math.round((FRAME_W * i) / 3);
      const y = Math.round((FRAME_H * i) / 3);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, FRAME_H);
      ctx.moveTo(0, y);
      ctx.lineTo(FRAME_W, y);
      ctx.stroke();
    }
  }

  const zones = SAFE_ZONES[mode];
  for (const zone of zones) {
    const r = toPixels(zone);
    ctx.fillStyle = `rgba(${ZONE_RGB}, 0.28)`;
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.strokeStyle = `rgba(${ZONE_RGB}, 0.9)`;
    ctx.lineWidth = 4;
    ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4);

    ctx.save();
    ctx.fillStyle = "#0d0d14";
    ctx.font = "600 40px system-ui, -apple-system, Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (zone.h > zone.w) {
      ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(zone.label, 0, 0);
    } else {
      ctx.fillText(zone.label, r.x + r.w / 2, r.y + r.h / 2);
    }
    ctx.restore();
  }

  // Safe area label in the middle of the frame.
  ctx.fillStyle = "rgba(13,13,20,0.55)";
  ctx.font = "600 48px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const label = mode === "reels" ? "Reels safe zone" : "Story safe zone";
  const midY = mode === "reels" ? FRAME_H * 0.4 : FRAME_H * 0.5;
  const midX = mode === "reels" ? FRAME_W * 0.42 : FRAME_W * 0.5;
  ctx.fillText(label, midX, midY);
  ctx.font = "400 32px system-ui, -apple-system, Segoe UI, sans-serif";
  ctx.fillText("1080 × 1920 · approximate guide", midX, midY + 60);
  return canvas;
}

function PlaceholderArt() {
  return (
    <svg viewBox="0 0 180 320" className="h-full w-full" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="sz-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--brand)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--brand)" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect width="180" height="320" fill="url(#sz-bg)" />
      <circle cx="140" cy="70" r="26" fill="var(--brand)" opacity="0.18" />
      <circle cx="40" cy="250" r="34" fill="var(--brand)" opacity="0.12" />
      <path d="M0 230 L55 170 L95 210 L130 175 L180 225 L180 320 L0 320 Z" fill="var(--brand)" opacity="0.22" />
      <circle cx="90" cy="130" r="22" fill="#fff" opacity="0.9" />
      <rect x="58" y="160" width="64" height="44" rx="18" fill="#fff" opacity="0.9" />
      <rect x="44" y="104" width="92" height="4" rx="2" fill="var(--brand)" opacity="0.35" className="sz-sparkle" />
      <path d="M150 120 l3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 7 -3z" fill="#fff" className="sz-sparkle" />
      <path d="M30 140 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" fill="#fff" className="sz-sparkle" />
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .sz-sparkle { animation: sz-twinkle 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        }
        @keyframes sz-twinkle { 0%, 100% { opacity: 0.4; transform: scale(0.85); } 50% { opacity: 1; transform: scale(1.1); } }
      `}</style>
    </svg>
  );
}

export default function SafeZoneChecker() {
  const [mode, setMode] = useState<SafeZoneMode>("reels");
  const [media, setMedia] = useState<Media | null>(null);
  const [opacity, setOpacity] = useState(45);
  const [showGrid, setShowGrid] = useState(false);
  const fileId = useId();
  const modeLegendId = useId();

  const urlRef = useRef<string | null>(null);

  // Revoke the last object URL when the component unmounts.
  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    if (!file) {
      setMedia(null);
      return;
    }
    const kind = file.type.startsWith("video/") ? "video" : "image";
    const url = URL.createObjectURL(file);
    urlRef.current = url;
    setMedia({ url, kind, name: file.name });
  }

  function downloadTemplate() {
    const canvas = drawTemplate(mode, showGrid);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement("a");
      const url = URL.createObjectURL(blob);
      a.href = url;
      a.download = `instagram-${mode}-safe-zone-template-1080x1920.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  const zones = SAFE_ZONES[mode];
  const alpha = opacity / 100;

  return (
    <div className="glow rounded-3xl border border-line bg-surface p-4 text-left sm:p-6">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] md:items-start">
        <div className="flex justify-center">
          <div className="w-full max-w-[17rem] rounded-[2.25rem] border border-line bg-[#0d0d14] p-2.5 shadow-xl">
            <div
              className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.75rem] bg-bg"
              aria-label={`${mode === "reels" ? "Reels" : "Story"} safe zone preview`}
              role="img"
            >
              {media ? (
                media.kind === "video" ? (
                  <video
                    key={media.url}
                    src={`${media.url}#t=0.1`}
                    muted
                    playsInline
                    preload="metadata"
                    controls={false}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media.url} alt="" className="absolute inset-0 h-full w-full object-cover" />
                )
              ) : (
                <div className="absolute inset-0">
                  <PlaceholderArt />
                </div>
              )}

              {showGrid ? (
                <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                  <div className="absolute inset-y-0 left-1/3 w-px bg-white/60" />
                  <div className="absolute inset-y-0 left-2/3 w-px bg-white/60" />
                  <div className="absolute inset-x-0 top-1/3 h-px bg-white/60" />
                  <div className="absolute inset-x-0 top-2/3 h-px bg-white/60" />
                </div>
              ) : null}

              {zones.map((z) => {
                const vertical = z.h > z.w;
                return (
                  <div
                    key={`${mode}-${z.id}`}
                    className="pointer-events-none absolute flex items-center justify-center border border-dashed border-white/70 transition-all duration-300 motion-reduce:transition-none"
                    style={{
                      left: `${z.x}%`,
                      top: `${z.y}%`,
                      width: `${z.w}%`,
                      height: `${z.h}%`,
                      backgroundColor: `rgba(${ZONE_RGB}, ${alpha})`,
                    }}
                  >
                    <span
                      className="rounded-full bg-[#0d0d14]/80 px-2 py-0.5 text-center text-[10px] font-medium leading-tight text-white"
                      style={vertical ? { writingMode: "vertical-rl" } : undefined}
                    >
                      {z.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor={fileId} className="text-sm font-medium">
              Load an image or video
            </label>
            <input
              id={fileId}
              type="file"
              accept="image/*,video/*"
              onChange={onFileChange}
              className="mt-2 block w-full max-w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
            />
            <p className="mt-1 text-xs text-muted">
              {media ? `Showing ${media.name}. ` : ""}Opened locally in your browser; nothing is uploaded.
            </p>
          </div>

          <fieldset className="border-0 p-0">
            <legend id={modeLegendId} className="text-sm font-medium">
              Format
            </legend>
            <div className="mt-2 inline-flex rounded-full border border-line bg-bg p-1" role="radiogroup" aria-labelledby={modeLegendId}>
              {SAFE_ZONE_MODES.map((m) => (
                <label
                  key={m.id}
                  className={`min-h-10 cursor-pointer rounded-full px-5 py-2 text-sm font-medium transition ${
                    mode === m.id ? "bg-brand text-white" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="safeZoneMode"
                    value={m.id}
                    checked={mode === m.id}
                    onChange={() => setMode(m.id)}
                    className="sr-only"
                  />
                  {m.label}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="block text-sm font-medium">
            Overlay opacity: {opacity}%
            <input
              type="range"
              min={10}
              max={90}
              step={5}
              value={opacity}
              onChange={(e) => setOpacity(Number(e.target.value))}
              className="mt-2 w-full accent-brand"
            />
          </label>

          <label className="flex min-h-10 cursor-pointer items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              checked={showGrid}
              onChange={(e) => setShowGrid(e.target.checked)}
              className="h-4 w-4 accent-brand"
            />
            Show grid (rule of thirds)
          </label>

          <ul className="space-y-1.5 text-xs text-ink-2">
            {zones.map((z) => {
              const px = toPixels(z);
              return (
                <li key={z.id} className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: `rgb(${ZONE_RGB})` }} />
                  <span>
                    <span className="font-medium text-ink">{z.label}</span>: about {px.w}×{px.h} px
                  </span>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={downloadTemplate}
            className="btn-primary inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            Download blank safe-zone template
          </button>
          <p className="text-xs text-muted">
            A 1080×1920 PNG of the {mode === "reels" ? "Reels" : "Story"} guides to use as a layer in Canva, Figma or
            CapCut. Zones are approximate; Instagram&apos;s layout varies by device.
          </p>
        </div>
      </div>
    </div>
  );
}
