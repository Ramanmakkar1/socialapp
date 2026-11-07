"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Download } from "lucide-react";
import ui from "@/components/ui/ui.module.css";
import {
  ICONS,
  PALETTES,
  clampText,
  coverLayout,
  type CoverFormat,
  type CoverLayout,
} from "@/lib/highlightCovers";

type BgStyle = "solid" | "gradient" | "ring";

interface DrawOpts {
  layout: CoverLayout;
  bg: string;
  fg: string;
  iconPath: string;
  label: string;
  bgStyle: BgStyle;
}

/** Lighten a #hex colour toward white by `amount` (0..1). */
function lighten(hex: string, amount: number): string {
  const n = hex.replace("#", "");
  const ch = (i: number) => parseInt(n.slice(i, i + 2), 16);
  const f = (c: number) => Math.round(c + (255 - c) * amount);
  const to = (c: number) => c.toString(16).padStart(2, "0");
  return `#${to(f(ch(0)))}${to(f(ch(2)))}${to(f(ch(4)))}`;
}

function paintBackground(ctx: CanvasRenderingContext2D, o: DrawOpts) {
  const { layout } = o;
  if (o.bgStyle === "gradient") {
    const g = ctx.createRadialGradient(layout.cx, layout.cy, 0, layout.cx, layout.cy, Math.max(layout.width, layout.height) / 2);
    g.addColorStop(0, lighten(o.bg, 0.3));
    g.addColorStop(1, o.bg);
    ctx.fillStyle = g;
  } else {
    ctx.fillStyle = o.bg;
  }
  ctx.fillRect(0, 0, layout.width, layout.height);

  if (o.bgStyle === "ring") {
    ctx.strokeStyle = o.fg;
    ctx.lineWidth = Math.max(2, Math.round(layout.circleR * 0.03));
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(layout.cx, layout.cy, layout.circleR * 0.92, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function paintIconAndLabel(ctx: CanvasRenderingContext2D, o: DrawOpts) {
  const { layout } = o;
  const hasLabel = o.label.length > 0;
  const iconCenterY = hasLabel ? layout.cy - Math.round(layout.circleR * 0.09) : layout.cy;
  const scale = layout.iconSize / 24;
  ctx.save();
  ctx.translate(layout.cx - layout.iconSize / 2, iconCenterY - layout.iconSize / 2);
  ctx.scale(scale, scale);
  ctx.fillStyle = o.fg;
  ctx.fill(new Path2D(o.iconPath));
  ctx.restore();

  if (hasLabel) {
    ctx.fillStyle = o.fg;
    ctx.font = `600 ${Math.round(layout.circleR * 0.16)}px system-ui, -apple-system, Segoe UI, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(o.label, layout.cx, layout.cy + layout.circleR * 0.32);
  }
}

function drawCover(canvas: HTMLCanvasElement, o: DrawOpts) {
  canvas.width = o.layout.width;
  canvas.height = o.layout.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  paintBackground(ctx, o);
  paintIconAndLabel(ctx, o);
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

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), "image/png"));
}

export default function HighlightCoverMaker() {
  const [paletteId, setPaletteId] = useState<string>("brand");
  const [customBg, setCustomBg] = useState("#6b4eff");
  const [customFg, setCustomFg] = useState("#ffffff");
  const [iconId, setIconId] = useState<string>("heart");
  const [label, setLabel] = useState<string>("");
  const [bgStyle, setBgStyle] = useState<BgStyle>("solid");
  const [format, setFormat] = useState<CoverFormat>("square");
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const mainRef = useRef<HTMLCanvasElement | null>(null);
  const roundRef = useRef<HTMLCanvasElement | null>(null);
  const bgId = useId();
  const fgId = useId();
  const labelId = useId();
  const iconLegendId = useId();
  const formatLegendId = useId();
  const styleLegendId = useId();

  const activePalette = PALETTES.find((p) => p.id === paletteId) ?? null;
  const bg = activePalette ? activePalette.bg : customBg;
  const fg = activePalette ? activePalette.fg : customFg;
  const icon = ICONS.find((i) => i.id === iconId) ?? ICONS[0];
  const layout = coverLayout(format);
  const clampedLabel = clampText(label);

  const drawOpts: DrawOpts = { layout, bg, fg, iconPath: icon.path, label: clampedLabel, bgStyle };

  // Redraw the live preview and the 64px round crop whenever anything changes.
  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;
    drawCover(main, drawOpts);

    const round = roundRef.current;
    if (round) {
      round.width = 128;
      round.height = 128;
      const rctx = round.getContext("2d");
      if (rctx) {
        const r = layout.circleR;
        rctx.clearRect(0, 0, 128, 128);
        rctx.drawImage(main, layout.cx - r, layout.cy - r, r * 2, r * 2, 0, 0, 128, 128);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bg, fg, iconId, clampedLabel, bgStyle, format]);

  async function downloadOne() {
    const canvas = document.createElement("canvas");
    drawCover(canvas, drawOpts);
    const blob = await canvasToPng(canvas);
    if (blob) saveBlob(blob, `highlight-cover-${icon.id}.png`);
  }

  async function downloadAll() {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      for (let i = 0; i < ICONS.length; i++) {
        const ic = ICONS[i];
        setProgress(`Downloading ${ic.name} (${i + 1}/${ICONS.length})…`);
        const canvas = document.createElement("canvas");
        drawCover(canvas, { ...drawOpts, iconPath: ic.path });
        const blob = await canvasToPng(canvas);
        if (blob) saveBlob(blob, `highlight-cover-${ic.id}.png`);
        await new Promise((r) => setTimeout(r, 250));
      }
      setProgress("All 16 icons downloaded!");
      setTimeout(() => setProgress(null), 2500);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="text-left">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
        {/* Live preview */}
        <div className="flex flex-col items-center">
          <div className="w-full rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--poskoo-line)] pb-3 mb-4">
              <div>
                <h3 className="font-semibold text-sm sm:text-base text-[var(--poskoo-ink)]">Live preview</h3>
                <p className="text-xs text-[var(--poskoo-muted)]">
                  {format === "square" ? "1080×1080 square" : "1080×1920 story"} · circle crop
                </p>
              </div>
              <span className="rounded-full bg-[var(--poskoo-band)] px-3 py-1 text-xs font-semibold text-[var(--poskoo-violet)]">
                {icon.name}
              </span>
            </div>

            <div className="flex flex-col items-center gap-4">
              <canvas
                ref={mainRef}
                role="img"
                aria-label={`Highlight cover preview: ${icon.name} icon on ${bg} background`}
                className="block h-auto w-full max-w-[19rem] rounded-2xl border border-[var(--poskoo-line)] shadow-md"
              />
              <div className="flex items-center gap-3">
                <canvas
                  ref={roundRef}
                  role="img"
                  aria-label="Round preview of how the cover looks on a profile"
                  className="h-16 w-16 rounded-full border-2 border-[var(--poskoo-line)] shadow"
                />
                <p className="text-xs text-[var(--poskoo-muted)] max-w-[14rem]">
                  This is how it appears as a highlight on your profile — keep the icon inside the middle of the circle.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-5">
          {/* Palette */}
          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 sm:p-5 shadow-sm">
            <p className="text-sm font-semibold text-[var(--poskoo-ink)]">Colour</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaletteId(p.id)}
                  aria-pressed={paletteId === p.id}
                  title={p.name}
                  className={`flex min-h-[44px] flex-col items-center justify-center gap-1 rounded-xl border-2 p-1.5 transition ${
                    paletteId === p.id ? "border-[var(--poskoo-violet)]" : "border-transparent hover:border-[var(--poskoo-line)]"
                  }`}
                  style={{ backgroundColor: p.bg }}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill={p.fg} aria-hidden="true">
                    <path d={icon.path} />
                  </svg>
                  <span className="text-[10px] font-semibold" style={{ color: p.fg }}>
                    {p.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--poskoo-ink)]">
                Custom background
                <input
                  id={bgId}
                  type="color"
                  value={customBg}
                  onChange={(e) => {
                    setCustomBg(e.target.value);
                    setPaletteId("");
                  }}
                  className="h-10 w-full cursor-pointer rounded-lg border border-[var(--poskoo-line)] bg-white p-1"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--poskoo-ink)]">
                Custom icon colour
                <input
                  id={fgId}
                  type="color"
                  value={customFg}
                  onChange={(e) => {
                    setCustomFg(e.target.value);
                    setPaletteId("");
                  }}
                  className="h-10 w-full cursor-pointer rounded-lg border border-[var(--poskoo-line)] bg-white p-1"
                />
              </label>
            </div>
            {activePalette === null && (
              <p className="mt-2 text-xs text-[var(--poskoo-muted)]">Using your custom colours.</p>
            )}
          </div>

          {/* Icon picker */}
          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 sm:p-5 shadow-sm">
            <fieldset className="border-0 p-0">
              <legend id={iconLegendId} className="text-sm font-semibold text-[var(--poskoo-ink)]">
                Icon
              </legend>
              <div className="mt-3 grid grid-cols-4 gap-2" role="group" aria-labelledby={iconLegendId}>
                {ICONS.map((ic) => (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setIconId(ic.id)}
                    aria-pressed={iconId === ic.id}
                    title={ic.name}
                    className={`flex min-h-[48px] items-center justify-center rounded-xl border-2 transition ${
                      iconId === ic.id
                        ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-band)]"
                        : "border-[var(--poskoo-line)] bg-white hover:border-[var(--poskoo-violet)]"
                    }`}
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="var(--poskoo-ink)" aria-hidden="true">
                      <path d={ic.path} />
                    </svg>
                  </button>
                ))}
              </div>
            </fieldset>

            <label htmlFor={labelId} className="mt-4 block text-sm font-semibold text-[var(--poskoo-ink)]">
              Label (optional, max 12 characters)
            </label>
            <input
              id={labelId}
              type="text"
              value={label}
              maxLength={12}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Sale, Q&A, New"
              className="mt-1.5 block w-full min-h-[44px] rounded-xl border border-[var(--poskoo-line)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--poskoo-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]"
            />
          </div>

          {/* Background style + format */}
          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 sm:p-5 shadow-sm space-y-4">
            <fieldset className="border-0 p-0">
              <legend id={styleLegendId} className="text-sm font-semibold text-[var(--poskoo-ink)]">
                Background style
              </legend>
              <div className="mt-2 grid grid-cols-3 gap-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-1.5" role="radiogroup" aria-labelledby={styleLegendId}>
                {(["solid", "gradient", "ring"] as BgStyle[]).map((st) => (
                  <label
                    key={st}
                    className={`min-h-[44px] cursor-pointer rounded-lg px-2 py-2 text-center text-xs font-semibold capitalize transition ${
                      bgStyle === st ? "bg-[var(--poskoo-violet)] text-white shadow-sm" : "text-[#3d3450] hover:text-[var(--poskoo-ink)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="bgStyle"
                      value={st}
                      checked={bgStyle === st}
                      onChange={() => setBgStyle(st)}
                      className="sr-only"
                    />
                    {st}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="border-0 p-0">
              <legend id={formatLegendId} className="text-sm font-semibold text-[var(--poskoo-ink)]">
                Format
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-1.5" role="radiogroup" aria-labelledby={formatLegendId}>
                {(["square", "story"] as CoverFormat[]).map((f) => (
                  <label
                    key={f}
                    className={`min-h-[44px] cursor-pointer rounded-lg px-2 py-2 text-center text-xs font-semibold capitalize transition ${
                      format === f ? "bg-[var(--poskoo-violet)] text-white shadow-sm" : "text-[#3d3450] hover:text-[var(--poskoo-ink)]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="coverFormat"
                      value={f}
                      checked={format === f}
                      onChange={() => setFormat(f)}
                      className="sr-only"
                    />
                    {f}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {/* Download */}
          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 sm:p-5 shadow-sm space-y-3">
            <button
              type="button"
              onClick={downloadOne}
              disabled={isDownloading}
              className={`${ui.inkFill} inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold min-h-[44px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Download className="h-4 w-4" />
              Download PNG
            </button>
            <button
              type="button"
              onClick={downloadAll}
              disabled={isDownloading}
              className={`${ui.btn} ${ui.btnGhost} inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Download className="h-4 w-4" />
              Download all 16 icons in this colour
            </button>
            {progress && (
              <p className="text-xs text-center font-medium text-[var(--poskoo-violet)]" aria-live="polite">
                {progress}
              </p>
            )}
            <p className="text-xs text-[var(--poskoo-muted)] leading-relaxed">
              Saves a <code>highlight-cover-{icon.id}.png</code> to your device. Everything runs in your browser — nothing is uploaded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
