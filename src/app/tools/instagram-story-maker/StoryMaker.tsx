"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Download, ImagePlus, Type } from "lucide-react";
import {
  STORY_W,
  STORY_H,
  STORY_CLEAR_ZONE,
  STORY_SAFE_ZONES,
  maxCharsFor,
  storyPhotoFit,
  textBox,
} from "@/lib/storyLayout";
import { toPixels } from "@/lib/safeZones";

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
const kpi = "min-w-0 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-2.5";
const kpiLabel = "text-[10px] font-semibold uppercase tracking-wide text-[#5f5873]";

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
  const [saved, setSaved] = useState(false);

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
      if (!blob) return;
      saveBlob(blob, "instagram-story.png");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, "image/png");
  }

  const { lines } = textBox(text, fontSize, STORY_CLEAR_ZONE);
  const cut = lines.length > 0 && lines[lines.length - 1].endsWith("…");

  return (
    <div className="min-w-0 text-left">
      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        {/* Controls */}
        <div className="min-w-0 space-y-5 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          <div>
            <label htmlFor={fileId} className={labelClass}>
              Story photo
            </label>
            <div className="relative mt-2 flex min-h-20 items-center gap-3 rounded-xl border-2 border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-4 py-3 transition hover:border-[var(--poskoo-violet)] has-[:focus-visible]:border-[var(--poskoo-violet)] has-[:focus-visible]:shadow-[0_0_0_3px_var(--poskoo-band)]">
              <ImagePlus className="pointer-events-none h-7 w-7 flex-none text-[var(--poskoo-violet)]" aria-hidden="true" />
              <span className="pointer-events-none min-w-0 text-sm" aria-hidden="true">
                <b className="block text-[var(--poskoo-ink)]">{img ? "Photo added — choose another" : "Choose a photo or drop it here"}</b>
                <span className="text-xs text-[#5f5873]">Your photo stays on your device. Nothing is uploaded.</span>
              </span>
              <input
                id={fileId}
                type="file"
                accept="image/*"
                onChange={onFile}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
            </div>
            {error && (
              <p className="mt-2 text-xs font-medium text-[#b42318]" role="alert">
                {error}
              </p>
            )}
          </div>

          <div className="border-t border-[var(--poskoo-line)] pt-5">
            <label htmlFor={textId} className={labelClass}>
              Text on Story
            </label>
            <input
              id={textId}
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. New collection drops Friday"
              className="mt-2 block min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base font-medium text-[var(--poskoo-ink)] outline-none focus:border-[var(--poskoo-violet)]"
            />

            <label htmlFor={sizeId} className={`${labelClass} mt-4 flex justify-between`}>
              Text size: {fontSize}px
              <span className="rounded-md bg-[var(--poskoo-band)] px-1.5 text-[var(--poskoo-violet)] tabular-nums" aria-hidden="true">{fontSize}</span>
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
            <div className="flex justify-between text-xs text-[#3d3450]" aria-hidden="true"><span>32</span><span>120</span></div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className={kpi}><p className={kpiLabel}>Lines</p><p className="text-base font-bold tabular-nums">{lines.length}<span className="text-xs font-medium text-[#5f5873]"> / 4</span></p></div>
              <div className={kpi}><p className={kpiLabel}>Chars / line</p><p className="text-base font-bold tabular-nums">{maxCharsFor(fontSize)}</p></div>
              <div className={kpi}><p className={kpiLabel}>Fits</p><p className={`text-base font-bold ${cut ? "text-[#b2401a]" : "text-[var(--poskoo-green)]"}`}>{!text ? "—" : cut ? "Cut off" : "Yes"}</p></div>
            </div>
            {cut && <p className="mt-2 text-xs text-[#3d3450]">Your text is longer than four lines at this size, so the end is cut. Shorten it or lower the text size.</p>}
          </div>

          <fieldset className="border-0 border-t border-[var(--poskoo-line)] p-0 pt-5">
            <legend id={presetLegendId} className={`${labelClass} float-left w-full`}>
              Text colour
            </legend>
            <div className="clear-both grid grid-cols-3 gap-2 pt-2" role="group" aria-labelledby={presetLegendId}>
              {TEXT_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPresetId(p.id)}
                  aria-pressed={presetId === p.id}
                  className={`flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-2 text-xs font-semibold transition ${presetId === p.id ? "border-[var(--poskoo-violet)] shadow-[0_0_0_3px_var(--poskoo-band)]" : "border-[var(--poskoo-line)] hover:border-[var(--poskoo-violet)]"}`}
                  style={{ backgroundColor: p.bg ?? "#3d3450", color: p.fg }}
                >
                  <Type className="h-3.5 w-3.5 flex-none" aria-hidden="true" />{p.name}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-1 border-t border-[var(--poskoo-line)] pt-3 sm:grid-cols-2">
            <label htmlFor={gradientId} className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--poskoo-ink)]">
              <input
                id={gradientId}
                type="checkbox"
                checked={gradient}
                onChange={(e) => setGradient(e.target.checked)}
                className="h-5 w-5 cursor-pointer accent-[var(--poskoo-violet)]"
              />
              Gradient background
            </label>

            <label htmlFor={guidesId} className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-[var(--poskoo-ink)]">
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
        </div>

        {/* Live preview + primary action */}
        <aside aria-label="Story preview and download" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-[var(--poskoo-ink)]">Live preview</h3>
              <p className="text-xs text-[#5f5873]">1080×1920 Instagram Story</p>
            </div>
            <span className="rounded-full bg-[var(--poskoo-band)] px-3 py-1 text-xs font-semibold text-[var(--poskoo-violet)]">
              {preset.name}
            </span>
          </div>
          <div className="mx-auto w-full max-w-[15rem] rounded-[2rem] bg-[#0d0d14] p-2 shadow-[var(--poskoo-shadow-float)] max-lg:max-w-[13rem]">
            <canvas
              ref={previewRef}
              role="img"
              aria-label={
                img
                  ? `Instagram Story preview${text ? ` with the text “${text}”` : ""}`
                  : "Empty Instagram Story preview. Choose a photo to start."
              }
              className="block h-auto w-full rounded-[1.6rem]"
            />
          </div>
          {guides && (
            <p className="text-center text-xs text-[#5f5873]">
              Tinted areas: Instagram keeps the top ~250 px (profile name and progress bar) and the bottom
              ~250 px (reply bar). Keep text inside the clear band. Guides are not saved in the PNG.
            </p>
          )}
          <button
            type="button"
            onClick={download}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px"
          >
            {saved ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
            {saved ? "Saved" : "Download PNG"}
          </button>
          <span className="sr-only" aria-live="polite">{saved ? "instagram-story.png downloaded" : ""}</span>
          <p className="text-xs leading-relaxed text-[#5f5873]">
            Saves instagram-story.png (1080×1920) to your device. Nothing is uploaded and no account is needed.
          </p>
        </aside>
      </div>
    </div>
  );
}
