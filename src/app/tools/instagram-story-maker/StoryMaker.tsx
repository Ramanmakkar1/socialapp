"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Download } from "lucide-react";
import {
  STORY_W,
  STORY_H,
  STORY_CLEAR_ZONE,
  STORY_SAFE_ZONES,
  storyPhotoFit,
  textBox,
} from "@/lib/storyLayout";
import { toPixels } from "@/lib/safeZones";
import ui from "@/components/ui/ui.module.css";

/** Text colour presets. Colour values from src/app/globals.css brand tokens. */
const TEXT_PRESETS: { id: string; name: string; bg: string | null; fg: string }[] = [
  { id: "brand", name: "Brand violet", bg: "#6b4eff", fg: "#ffffff" },
  { id: "ink", name: "Ink", bg: "#1e1631", fg: "#ffffff" },
  { id: "paper", name: "Paper", bg: "#fffcf6", fg: "#1e1631" },
];



const FONT_STACK = "system-ui, -apple-system, Segoe UI, sans-serif";
const SAFE_ZONE_TINT = "rgba(229, 72, 77, 0.35)"; // --poskoo-red
// Gradient background colours: --brand (#6d4aff) to --brand-2 (#ff4fa3) from globals.css.

const sliderClass = "mt-1.5 block w-full min-h-[44px] cursor-pointer accent-[var(--poskoo-violet)]";
const labelClass = "block text-sm font-semibold text-[var(--poskoo-ink)]";
const cardClass = "rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 sm:p-5 shadow-sm";

interface DrawOpts {
  img: HTMLImageElement | null;
  text: string;
  fontSize: number;
  presetId: string;
  gradient: boolean;
}

function presetOf(id: string) {
  return TEXT_PRESETS.find((p) => p.id === id) ?? TEXT_PRESETS[0];
}

function paintText(ctx: CanvasRenderingContext2D, o: DrawOpts) {
  if (!o.text) return;
  const preset = presetOf(o.presetId);
  const { lines, box } = textBox(o.text, o.fontSize, STORY_CLEAR_ZONE);
  if (lines.length === 0) return;
  const padding = 0.5 * o.fontSize;
  const lineHeight = 1.15 * o.fontSize;

  if (preset.bg) {
    ctx.fillStyle = preset.bg;
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, 16);
    ctx.fill();
  }

  ctx.save();
  ctx.fillStyle = preset.fg;
  ctx.font = `700 ${o.fontSize}px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (!preset.bg) {
    // No band: a soft shadow keeps white text readable on bright photos.
    ctx.shadowColor = "rgba(0, 0, 0, 0.55)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 4;
  }
  lines.forEach((line, i) => {
    ctx.fillText(line, STORY_W / 2, box.y + padding + lineHeight * (i + 0.5), box.w - padding * 2);
  });
  ctx.restore();
}

function paintSafeZones(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.fillStyle = SAFE_ZONE_TINT;
  for (const zone of STORY_SAFE_ZONES) {
    const r = toPixels(zone, STORY_W, STORY_H);
    ctx.fillRect(r.x, r.y, r.w, r.h);
    ctx.fillStyle = "#ffffff";
    ctx.font = `700 20px ${FONT_STACK}`;
    ctx.textBaseline = "top";
    ctx.fillText(zone.label, r.x + 12, r.y + 10, Math.max(0, r.w - 24));
    ctx.fillStyle = SAFE_ZONE_TINT;
  }
  ctx.restore();
}

function drawStory(canvas: HTMLCanvasElement, o: DrawOpts, guides: boolean) {
  canvas.width = STORY_W;
  canvas.height = STORY_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (o.gradient) {
    const g = ctx.createLinearGradient(0, 0, 0, STORY_H);
    g.addColorStop(0, "#6d4aff");
    g.addColorStop(1, "#ff4fa3");
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = "#ffffff";
  }
  ctx.fillRect(0, 0, STORY_W, STORY_H);

  if (o.img) {
    const f = storyPhotoFit(o.img.naturalWidth, o.img.naturalHeight, 1, 0, 0);
    ctx.drawImage(o.img, f.dx, f.dy, f.dw, f.dh);
  }

  paintText(ctx, o);
  if (guides) paintSafeZones(ctx);
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

export default function StoryMaker() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [text, setText] = useState("New collection drops Friday");
  const [presetId, setPresetId] = useState(TEXT_PRESETS[0].id);
  const [fontSize, setFontSize] = useState(56);
  const [gradient, setGradient] = useState(false);
  const [guides, setGuides] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const previewRef = useRef<HTMLCanvasElement | null>(null);
  const fileId = useId();
  const textId = useId();
  const sizeId = useId();
  const presetLegendId = useId();
  const gradientId = useId();
  const guidesId = useId();

  const preset = presetOf(presetId);

  // Load the chosen photo with createObjectURL. It is never uploaded to a server;
  // the object URL is revoked when the file changes or the component unmounts.
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
    drawStory(canvas, { img, text, fontSize, presetId, gradient }, guides);
  }, [img, text, fontSize, presetId, gradient, guides]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setImageUrl(URL.createObjectURL(file));
  }

  function download() {
    // Export on a separate canvas so the safe-zone guides never end up in the PNG.
    const canvas = document.createElement("canvas");
    drawStory(canvas, { img, text, fontSize, presetId, gradient }, false);
    canvas.toBlob((blob) => {
      if (blob) saveBlob(blob, "instagram-story.png");
    }, "image/png");
  }

  return (
    <div className="text-left">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
        {/* Live preview */}
        <div className="flex flex-col items-center">
          <div className={cardClass}>
            <div className="flex items-center justify-between border-b border-[var(--poskoo-line)] pb-3 mb-4">
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-[var(--poskoo-ink)]">Live preview</h3>
                <p className="text-xs text-[var(--poskoo-muted)]">1080×1920 Instagram Story</p>
              </div>
              <span className="rounded-full bg-[var(--poskoo-band)] px-3 py-1 text-xs font-semibold text-[var(--poskoo-violet)]">
                {preset.name}
              </span>
            </div>
            <div className="flex flex-col items-center gap-3">
              <canvas
                ref={previewRef}
                role="img"
                aria-label={
                  img
                    ? `Instagram Story preview${text ? ` with the text “${text}”` : ""}`
                    : "Empty Instagram Story preview. Choose a photo to start."
                }
                className="block h-auto rounded-2xl border border-[var(--poskoo-line)] shadow-md"
                style={{ width: "100%", maxWidth: 320 }}
              />
              {guides && (
                <p className="text-xs text-[var(--poskoo-muted)] max-w-[20rem] text-center">
                  Tinted areas: Instagram keeps the top ~250 px (profile name and progress bar) and the bottom
                  ~250 px (reply bar). Keep text inside the clear band. Guides are not saved in the PNG.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          <div className={cardClass}>
            <label htmlFor={fileId} className={labelClass}>
              Story photo
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
          </div>

          <div className={cardClass}>
            <label htmlFor={textId} className={labelClass}>
              Text on Story
            </label>
            <input
              id={textId}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. New collection drops Friday"
              className="mt-1.5 block w-full min-h-[44px] rounded-xl border border-[var(--poskoo-line)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--poskoo-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]"
            />

            <label htmlFor={sizeId} className={`${labelClass} mt-4`}>
              Text size: {fontSize}px
            </label>
            <input
              id={sizeId}
              type="range"
              min={32}
              max={120}
              step={1}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className={sliderClass}
            />

            <fieldset className="mt-4 border-0 p-0">
              <legend id={presetLegendId} className={labelClass}>
                Text colour
              </legend>
              <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-labelledby={presetLegendId}>
                {TEXT_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPresetId(p.id)}
                    aria-pressed={presetId === p.id}
                    className={`min-h-[44px] rounded-xl border-2 px-2 py-2 text-xs font-semibold transition ${presetId === p.id ? "border-[var(--poskoo-violet)]" : "border-[var(--poskoo-line)] hover:border-[var(--poskoo-violet)]"}`}
                    style={{ backgroundColor: p.bg ?? "#3d3450", color: p.fg }}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </fieldset>

            <label htmlFor={gradientId} className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--poskoo-ink)]">
              <input
                id={gradientId}
                type="checkbox"
                checked={gradient}
                onChange={(e) => setGradient(e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-[var(--poskoo-violet)]"
              />
              Gradient background
            </label>

            <label htmlFor={guidesId} className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--poskoo-ink)]">
              <input
                id={guidesId}
                type="checkbox"
                checked={guides}
                onChange={(e) => setGuides(e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-[var(--poskoo-violet)]"
              />
              Show safe zone guides
            </label>
          </div>

          <div className={`${cardClass} space-y-3`}>
            <button
              type="button"
              onClick={download}
              className={`${ui.inkFill} inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold min-h-[44px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
            <p className="text-xs text-[var(--poskoo-muted)] leading-relaxed">
              Saves instagram-story.png (1080×1920) to your device. Nothing is uploaded and no account is needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
