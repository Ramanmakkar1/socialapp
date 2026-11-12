"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Bookmark, Check, Download, Frame, Heart, Layers, MessageCircle, Music2, ScanLine, Send, ShieldCheck } from "lucide-react";
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

/** Percent of the frame covered by at least one zone, counted on a 1% grid so overlaps are not double-counted. */
function coveredPercent(zones: { x: number; y: number; w: number; h: number }[]): number {
  let covered = 0;
  for (let y = 0; y < 100; y++) {
    for (let x = 0; x < 100; x++) {
      if (zones.some((z) => x + 0.5 > z.x && x + 0.5 < z.x + z.w && y + 0.5 > z.y && y + 0.5 < z.y + z.h)) covered++;
    }
  }
  return covered / 100;
}

const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const primaryBtn =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40";
const toggleRow =
  "flex min-h-11 items-center gap-3 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium";

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
          <stop offset="0" stopColor="var(--poskoo-violet)" stopOpacity="0.28" />
          <stop offset="1" stopColor="var(--poskoo-violet)" stopOpacity="0.06" />
        </linearGradient>
      </defs>
      <rect width="180" height="320" fill="url(#sz-bg)" />
      <circle cx="140" cy="70" r="26" fill="var(--poskoo-violet)" opacity="0.18" />
      <circle cx="40" cy="250" r="34" fill="var(--poskoo-violet)" opacity="0.12" />
      <path d="M0 230 L55 170 L95 210 L130 175 L180 225 L180 320 L0 320 Z" fill="var(--poskoo-violet)" opacity="0.22" />
      <circle cx="90" cy="130" r="22" fill="#fff" opacity="0.9" />
      <rect x="58" y="160" width="64" height="44" rx="18" fill="#fff" opacity="0.9" />
      <rect x="44" y="104" width="92" height="4" rx="2" fill="var(--poskoo-violet)" opacity="0.35" className="sz-sparkle" />
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

function ReelInterfaceOverlay() {
  const actions = [
    { label: "Like", Icon: Heart },
    { label: "Comment", Icon: MessageCircle },
    { label: "Share", Icon: Send },
    { label: "Save", Icon: Bookmark },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-10 text-white" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
      <div className="absolute bottom-[3%] left-[4%] right-[19%] [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold">
          <span className="h-5 w-5 shrink-0 rounded-full border border-white/80 bg-[var(--poskoo-lilac)]" />
          <span>yourhandle</span>
          <span className="rounded border border-white/80 px-1.5 py-0.5 text-[11px] leading-none">Follow</span>
        </div>
        <p className="mt-2 text-[11px] leading-snug">Your caption appears here… <span className="text-white/75">more</span></p>
        <div className="mt-2 flex items-center gap-1.5 text-[11px]">
          <Music2 className="h-3 w-3 shrink-0" />
          <span className="truncate">Original audio · yourhandle</span>
        </div>
      </div>
      <div className="absolute bottom-[17%] right-[2%] flex w-10 flex-col items-center gap-2.5 [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
        {actions.map(({ label, Icon }) => (
          <div key={label} className="flex flex-col items-center gap-0.5 text-[11px] font-medium">
            <Icon className="h-5 w-5 drop-shadow" strokeWidth={1.8} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SafeZoneChecker() {
  const [mode, setMode] = useState<SafeZoneMode>("reels");
  const [media, setMedia] = useState<Media | null>(null);
  const [opacity, setOpacity] = useState(45);
  const [showGrid, setShowGrid] = useState(false);
  const [showReelInterface, setShowReelInterface] = useState(true);
  const [downloaded, setDownloaded] = useState(false);
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
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 1800);
    }, "image/png");
  }

  const zones = SAFE_ZONES[mode];
  const alpha = opacity / 100;
  const covered = Math.round(coveredPercent(zones) * 10) / 10;
  const clear = Math.round((100 - covered) * 10) / 10;

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* At-a-glance summary, from the zone guide for the chosen format */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}>
            <Frame className="h-3 w-3" aria-hidden="true" />
            Frame
          </p>
          <p className="mt-1 whitespace-nowrap text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">
            {FRAME_W}×{FRAME_H}
          </p>
          <p className="mt-1 text-xs text-[#3d3450]">9:16 {mode === "reels" ? "Reel" : "Story"}, in px.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>
            <ShieldCheck className="h-3 w-3" aria-hidden="true" />
            Clear area
          </p>
          <p className="mt-1 whitespace-nowrap text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{clear}%</p>
          <div className="mt-2 flex h-1.5 overflow-hidden rounded-full" aria-hidden="true">
            <i className="block h-full bg-[var(--poskoo-green)] transition-[width]" style={{ width: `${clear}%` }} />
            <i className="block h-full flex-1" style={{ background: `rgba(${ZONE_RGB}, 0.6)` }} />
          </div>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>
            <ScanLine className="h-3 w-3" aria-hidden="true" />
            Covered by UI
          </p>
          <p className="mt-1 whitespace-nowrap text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{covered}%</p>
          <p className="mt-1 text-xs text-[#3d3450]">Approximate; varies by device.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>
            <Layers className="h-3 w-3" aria-hidden="true" />
            Overlay zones
          </p>
          <p className="mt-1 whitespace-nowrap text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{zones.length}</p>
          <p className="mt-1 truncate text-xs text-[#3d3450]">{zones.map((z) => z.id).join(" · ")}</p>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Controls */}
        <div className="min-w-0 space-y-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div>
            <label htmlFor={fileId} className="text-sm font-semibold">
              Load an image or video
            </label>
            <input
              id={fileId}
              type="file"
              accept="image/*,video/*"
              onChange={onFileChange}
              className="mt-2 block w-full min-h-11 max-w-full rounded-xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-2 text-sm file:mr-3 file:min-h-9 file:rounded-lg file:border-0 file:bg-[var(--poskoo-ink)] file:px-3 file:text-sm file:font-semibold file:text-white hover:border-[var(--poskoo-violet)]"
            />
            <p className="mt-1.5 text-xs text-[var(--poskoo-muted)]">
              {media ? `Showing ${media.name}. ` : ""}Opened locally in your browser; nothing is uploaded.
            </p>
          </div>

          <div className="grid gap-4 border-t border-[var(--poskoo-line)] pt-4 sm:grid-cols-2">
            <fieldset className="min-w-0 border-0 p-0">
              <legend id={modeLegendId} className="text-sm font-semibold">
                Format
              </legend>
              <div className="mt-2 grid grid-cols-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1" role="radiogroup" aria-labelledby={modeLegendId}>
                {SAFE_ZONE_MODES.map((m) => (
                  <label
                    key={m.id}
                    className={`flex min-h-10 cursor-pointer items-center justify-center rounded-lg px-2 text-sm font-medium transition has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--poskoo-violet)] ${
                      mode === m.id ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"
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

            <label className="block min-w-0 text-sm font-semibold">
              <span className="flex justify-between gap-2">
                Overlay opacity: {opacity}%
              </span>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="mt-2 min-h-11 w-full accent-[var(--poskoo-violet)]"
              />
            </label>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <label className={`${toggleRow} ${mode === "reels" ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}>
              <input
                type="checkbox"
                checked={showReelInterface}
                disabled={mode !== "reels"}
                onChange={(e) => setShowReelInterface(e.target.checked)}
                className="h-4 w-4 shrink-0 accent-[var(--poskoo-violet)]"
              />
              Show Reel interface (caption and buttons)
            </label>
            <label className={`${toggleRow} cursor-pointer`}>
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="h-4 w-4 shrink-0 accent-[var(--poskoo-violet)]"
              />
              Show grid (rule of thirds)
            </label>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)]">
            <p className="border-b border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]">
              Keep text and logos out of
            </p>
            <ul className="divide-y divide-[var(--poskoo-line)] text-xs text-[#3d3450]">
              {zones.map((z) => {
                const px = toPixels(z);
                return (
                  <li key={z.id} className="flex items-center gap-3 px-3 py-2.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: `rgb(${ZONE_RGB})` }} />
                    <span className="min-w-0 flex-1">
                      <span className="font-medium text-[var(--poskoo-ink)]">{z.label}</span>: about {px.w}×{px.h} px
                    </span>
                    <span className="flex-none rounded-md bg-[var(--poskoo-paper)] px-1.5 py-0.5 font-semibold tabular-nums text-[var(--poskoo-ink)]">
                      {Math.round((z.w * z.h) / 100)}%
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Phone preview + download */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <div className="flex justify-center">
            <div className="w-full max-w-[17rem] rounded-[2.25rem] border border-[var(--poskoo-line)] bg-[#0d0d14] p-2.5 shadow-xl">
              <div
                className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.75rem] bg-[var(--poskoo-paper)]"
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
                        className="rounded-full bg-[#0d0d14]/80 px-2 py-0.5 text-center text-[11px] font-medium leading-tight text-white"
                        style={vertical ? { writingMode: "vertical-rl" } : undefined}
                      >
                        {z.label}
                      </span>
                    </div>
                  );
                })}

                {mode === "reels" && showReelInterface ? <ReelInterfaceOverlay /> : null}
              </div>
            </div>
          </div>
          {!media && (
            <p className="rounded-xl border border-dashed border-[var(--poskoo-line)] p-2.5 text-center text-xs text-[#5f5873]">
              Showing sample art. Load your own image or video to check it.
            </p>
          )}

          <button type="button" onClick={downloadTemplate} className={`${primaryBtn} !text-sm`}>
            {downloaded ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
            {downloaded ? "Downloaded" : "Download blank safe-zone template"}
          </button>
          <span className="sr-only" aria-live="polite">{downloaded ? "Template downloaded" : ""}</span>
          <p className="text-xs text-[var(--poskoo-muted)]">
            A 1080×1920 PNG of the {mode === "reels" ? "Reels" : "Story"} guides to use as a layer in Canva, Figma or
            CapCut. Zones are approximate; Instagram&apos;s layout varies by device.
          </p>
        </aside>
      </div>
    </div>
  );
}
