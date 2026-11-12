"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Circle, Download, Images, Palette, Type } from "lucide-react";
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
  const [downloaded, setDownloaded] = useState(false);

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
    if (blob) {
      saveBlob(blob, `highlight-cover-${icon.id}.png`);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 1800);
    }
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
    <div className="min-w-0 space-y-5 text-left">
      {/* At-a-glance summary, all from the current settings */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}>Export size</p>
          <p className="mt-1 whitespace-nowrap text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">
            {layout.width}×{layout.height}
          </p>
          <p className="mt-1 text-xs text-[#3d3450]">{format === "square" ? "Square" : "Story"} PNG, in px.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>
            <Circle className="h-3 w-3" aria-hidden="true" />
            Icon
          </p>
          <p className="mt-1 flex items-center gap-2 whitespace-nowrap text-xl font-bold sm:text-2xl text-[var(--poskoo-ink)]">
            <svg viewBox="0 0 24 24" className="h-6 w-6 flex-none" fill="var(--poskoo-violet)" aria-hidden="true">
              <path d={icon.path} />
            </svg>
            <span className="truncate">{icon.name}</span>
          </p>
          <p className="mt-1 text-xs text-[#3d3450]">
            {ICONS.indexOf(icon) + 1} of {ICONS.length} · {bgStyle} background
          </p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>
            <Type className="h-3 w-3" aria-hidden="true" />
            Label
          </p>
          <p className="mt-1 whitespace-nowrap text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">
            {clampedLabel.length}
            <span className="text-base font-medium text-[#5f5873]"> / 12</span>
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--poskoo-line)]" aria-hidden="true">
            <i className="block h-full rounded-full bg-[var(--poskoo-violet)] transition-[width]" style={{ width: `${(clampedLabel.length / 12) * 100}%` }} />
          </div>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}>
            <Palette className="h-3 w-3" aria-hidden="true" />
            Colours
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="grid h-8 w-8 flex-none place-items-center rounded-full border border-[var(--poskoo-line)]" style={{ background: bg }} aria-hidden="true">
              <i className="block h-3.5 w-3.5 rounded-full border border-black/10" style={{ background: fg }} />
            </span>
            <span className="min-w-0 text-xs leading-tight text-[#3d3450]">
              <b className="block truncate text-[var(--poskoo-ink)]">{activePalette ? activePalette.name : "Custom"}</b>
              <span className="block font-mono uppercase">{bg}</span>
              <span className="block font-mono uppercase opacity-70">{fg}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Controls */}
        <div className="min-w-0 space-y-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
          {/* Palette */}
          <div>
            <p className="text-sm font-semibold text-[var(--poskoo-ink)]">Colour</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {PALETTES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPaletteId(p.id)}
                  aria-pressed={paletteId === p.id}
                  title={p.name}
                  className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-xl p-1.5 ring-offset-2 ring-offset-[var(--poskoo-paper)] transition ${
                    paletteId === p.id ? "ring-2 ring-[var(--poskoo-violet)]" : "ring-1 ring-[var(--poskoo-line)] hover:ring-[var(--poskoo-ink)]"
                  }`}
                  style={{ backgroundColor: p.bg }}
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill={p.fg} aria-hidden="true">
                    <path d={icon.path} />
                  </svg>
                  <span className="text-[11px] font-semibold" style={{ color: p.fg }}>
                    {p.name}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
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
                  className="h-11 w-full cursor-pointer rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1"
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
                  className="h-11 w-full cursor-pointer rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1"
                />
              </label>
            </div>
            {activePalette === null && (
              <p className="mt-2 text-xs text-[var(--poskoo-muted)]">Using your custom colours.</p>
            )}
          </div>

          {/* Icon picker */}
          <fieldset className="border-0 border-t border-[var(--poskoo-line)] p-0 pt-4">
            <legend id={iconLegendId} className="float-left w-full text-sm font-semibold text-[var(--poskoo-ink)]">
              Icon <span className="font-normal text-[#5f5873]">· {icon.name}</span>
            </legend>
            <div className="clear-both grid grid-cols-4 gap-2 pt-2 sm:grid-cols-8 lg:grid-cols-4 xl:grid-cols-8" role="group" aria-labelledby={iconLegendId}>
              {ICONS.map((ic) => (
                <button
                  key={ic.id}
                  type="button"
                  onClick={() => setIconId(ic.id)}
                  aria-pressed={iconId === ic.id}
                  title={ic.name}
                  className={`flex min-h-12 items-center justify-center rounded-xl border transition ${
                    iconId === ic.id
                      ? "border-[var(--poskoo-ink)] bg-[var(--poskoo-ink)]"
                      : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] hover:border-[var(--poskoo-violet)]"
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill={iconId === ic.id ? "#ffffff" : "var(--poskoo-ink)"} aria-hidden="true">
                    <path d={ic.path} />
                  </svg>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="border-t border-[var(--poskoo-line)] pt-4">
            <label htmlFor={labelId} className="flex justify-between gap-2 text-sm font-semibold text-[var(--poskoo-ink)]">
              Label (optional, max 12 characters)
              <span aria-hidden="true" className="rounded-md bg-[var(--poskoo-band)] px-1.5 tabular-nums text-[var(--poskoo-violet)]">{label.length}/12</span>
            </label>
            <input
              id={labelId}
              type="text"
              value={label}
              maxLength={12}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Sale, Q&A, New"
              className={`${field} mt-2 font-medium`}
            />
          </div>

          {/* Background style + format */}
          <div className="grid gap-4 border-t border-[var(--poskoo-line)] pt-4 sm:grid-cols-[1.4fr_1fr]">
            <fieldset className="min-w-0 border-0 p-0">
              <legend id={styleLegendId} className="text-sm font-semibold text-[var(--poskoo-ink)]">
                Background style
              </legend>
              <div className={`${segWrap} grid-cols-3`} role="radiogroup" aria-labelledby={styleLegendId}>
                {(["solid", "gradient", "ring"] as BgStyle[]).map((st) => (
                  <label key={st} className={`${segItem} capitalize ${bgStyle === st ? segOn : segOff}`}>
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

            <fieldset className="min-w-0 border-0 p-0">
              <legend id={formatLegendId} className="text-sm font-semibold text-[var(--poskoo-ink)]">
                Format
              </legend>
              <div className={`${segWrap} grid-cols-2`} role="radiogroup" aria-labelledby={formatLegendId}>
                {(["square", "story"] as CoverFormat[]).map((f) => (
                  <label key={f} className={`${segItem} capitalize ${format === f ? segOn : segOff}`}>
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
        </div>

        {/* Live preview + download */}
        <aside className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[var(--poskoo-ink)]">Live preview</h3>
              <p className="text-xs text-[var(--poskoo-muted)]">
                {format === "square" ? "1080×1080 square" : "1080×1920 story"} · circle crop
              </p>
            </div>
            <span className="flex-none rounded-full bg-[var(--poskoo-band)] px-3 py-1 text-xs font-semibold text-[var(--poskoo-violet)]">
              {icon.name}
            </span>
          </div>

          <div className="grid place-items-center rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3">
            <canvas
              ref={mainRef}
              role="img"
              aria-label={`Highlight cover preview: ${icon.name} icon on ${bg} background`}
              className={`block h-auto rounded-xl border border-[var(--poskoo-line)] shadow-md ${format === "story" ? "w-full max-w-[9.5rem]" : "w-full max-w-[17rem]"}`}
            />
          </div>

          {/* Profile mock: how the round crop sits under the bio */}
          <div className="flex items-center gap-3 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3">
            <div className="flex flex-none flex-col items-center gap-1">
              <span className="rounded-full p-[2px] ring-1 ring-[var(--poskoo-line)]">
                <canvas
                  ref={roundRef}
                  role="img"
                  aria-label="Round preview of how the cover looks on a profile"
                  className="block h-16 w-16 rounded-full"
                />
              </span>
              <span className="max-w-16 truncate text-[11px] font-medium text-[var(--poskoo-ink)]">{clampedLabel || icon.name}</span>
            </div>
            <p className="text-xs text-[var(--poskoo-muted)]">
              This is how it appears as a highlight on your profile — keep the icon inside the middle of the circle.
            </p>
          </div>

          <button type="button" onClick={downloadOne} disabled={isDownloading} className={primaryBtn}>
            {downloaded ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
            {downloaded ? "Downloaded" : "Download PNG"}
          </button>
          <button type="button" onClick={downloadAll} disabled={isDownloading} className={`${ghostBtn} w-full`}>
            <Images className="h-4 w-4" aria-hidden="true" />
            Download all 16 icons in this colour
          </button>
          <span className="sr-only" aria-live="polite">{downloaded ? "PNG downloaded" : ""}</span>
          {progress && (
            <p className="text-center text-xs font-medium text-[var(--poskoo-violet)]" aria-live="polite">
              {progress}
            </p>
          )}
          <p className="text-xs leading-relaxed text-[var(--poskoo-muted)]">
            Saves a <code className="break-all">highlight-cover-{icon.id}.png</code> to your device. Everything runs in your browser — nothing is uploaded.
          </p>
        </aside>
      </div>
    </div>
  );
}

const field =
  "min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-base text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)]";
const ghostBtn =
  "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const primaryBtn =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";
const segWrap = "mt-2 grid rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1";
const segItem =
  "flex min-h-10 cursor-pointer items-center justify-center rounded-lg px-1 text-center text-[13px] font-medium leading-tight has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--poskoo-violet)]";
const segOn = "bg-[var(--poskoo-ink)] text-white";
const segOff = "text-[#3d3450] hover:bg-[var(--poskoo-band)]";
