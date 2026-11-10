"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Download, Plus, Trash2 } from "lucide-react";

const W = 1080;
const H = 1350;
const FONT = "system-ui, -apple-system, Segoe UI, sans-serif";

const PALETTE = [
  { name: "Violet", bg: "#6b4eff", fg: "#ffffff" },
  { name: "Ink", bg: "#1e1631", fg: "#ffffff" },
  { name: "Paper", bg: "#fffcf6", fg: "#1e1631" },
  { name: "Coral", bg: "#ff6b6b", fg: "#ffffff" },
  { name: "Mint", bg: "#0f9d8a", fg: "#ffffff" },
  { name: "Sky", bg: "#2563eb", fg: "#ffffff" },
];

type Slide = { id: number; title: string; body: string; bg: string; fg: string };

let nextId = 4;
const initialSlides: Slide[] = [
  { id: 1, title: "5 caption hooks that stop the scroll", body: "Swipe to see the exact lines you can copy for your next post.", bg: PALETTE[0].bg, fg: PALETTE[0].fg },
  { id: 2, title: "Start with a question", body: "“What would you do differently?” gives people a reason to reply.", bg: PALETTE[2].bg, fg: PALETTE[2].fg },
  { id: 3, title: "Save this for later", body: "Follow for more simple Instagram tips every week.", bg: PALETTE[1].bg, fg: PALETTE[1].fg },
];

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawSlide(canvas: HTMLCanvasElement, slide: Slide, index: number, total: number) {
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = slide.bg;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = slide.fg;
  ctx.beginPath();
  ctx.arc(W - 110, 120, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(70, H - 70, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const pad = 96;
  let y = 220;
  ctx.fillStyle = slide.fg;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  if (slide.title.trim()) {
    ctx.font = `800 88px ${FONT}`;
    for (const line of wrap(ctx, slide.title, W - pad * 2).slice(0, 4)) {
      ctx.fillText(line, pad, y);
      y += 104;
    }
    y += 40;
  }

  if (slide.body.trim()) {
    ctx.font = `400 44px ${FONT}`;
    ctx.globalAlpha = 0.9;
    for (const line of wrap(ctx, slide.body, W - pad * 2).slice(0, 8)) {
      ctx.fillText(line, pad, y);
      y += 60;
    }
    ctx.globalAlpha = 1;
  }

  ctx.font = `600 30px ${FONT}`;
  ctx.globalAlpha = 0.7;
  ctx.fillText(`${index + 1} / ${total}`, pad, H - 96);
  ctx.globalAlpha = 1;
}

function SlidePreview({ slide, index, total, onDownload }: { slide: Slide; index: number; total: number; onDownload: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) drawSlide(ref.current, slide, index, total);
  }, [slide, index, total]);
  return (
    <li className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
      <canvas ref={ref} role="img" aria-label={`Slide ${index + 1} of ${total}: ${slide.title || "untitled"}`} className="block w-full rounded-xl border border-[var(--poskoo-line)]" />
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-[var(--poskoo-ink)]">Slide {index + 1} of {total}</span>
        <button type="button" onClick={onDownload} className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-2.5 py-1.5 text-xs font-medium text-[#3d3450]">
          <Download className="h-3.5 w-3.5" /> Download
        </button>
      </div>
    </li>
  );
}

const labelClass = "block text-sm font-semibold text-[var(--poskoo-ink)]";
const inputClass = "mt-1.5 block w-full min-h-[44px] rounded-xl border border-[var(--poskoo-line)] bg-white px-3 py-2.5 text-sm text-[var(--poskoo-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]";
const cardClass = "rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4 sm:p-5 shadow-sm";

export default function CarouselMaker() {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [selected, setSelected] = useState(0);
  const titleId = useId();
  const bodyId = useId();
  const paletteId = useId();

  const current = slides[Math.min(selected, slides.length - 1)];

  function update(patch: Partial<Slide>) {
    setSlides((prev) => prev.map((s, i) => (i === selected ? { ...s, ...patch } : s)));
  }

  function addSlide() {
    const p = PALETTE[slides.length % PALETTE.length];
    setSlides((prev) => [...prev, { id: nextId++, title: "New slide", body: "Add your text here.", bg: p.bg, fg: p.fg }]);
    setSelected(slides.length);
  }

  function removeSlide(index: number) {
    if (slides.length <= 1) return;
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setSelected((prev) => Math.max(0, Math.min(prev, slides.length - 2)));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= slides.length) return;
    setSlides((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setSelected(target);
  }

  function download(index: number) {
    const canvas = document.createElement("canvas");
    drawSlide(canvas, slides[index], index, slides.length);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `slide-${index + 1}-of-${slides.length}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, "image/png");
  }

  return (
    <div className="text-left">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-[var(--poskoo-ink)] sm:text-base">Carousel preview</h3>
              <p className="text-xs text-[var(--poskoo-muted)]">{slides.length} slides · 1080×1350 px each · in order</p>
            </div>
            <button type="button" onClick={addSlide} className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[var(--poskoo-violet)] px-3 py-2 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> Add slide
            </button>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {slides.map((slide, i) => (
              <SlidePreview key={slide.id} slide={slide} index={i} total={slides.length} onDownload={() => download(i)} />
            ))}
          </ol>
        </div>

        <div className="space-y-5">
          <div className={cardClass}>
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-[var(--poskoo-ink)]">Editing slide {selected + 1}</p>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(selected, -1)} disabled={selected === 0} aria-label="Move slide earlier" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--poskoo-line)] bg-white text-[#3d3450] disabled:opacity-40">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => move(selected, 1)} disabled={selected === slides.length - 1} aria-label="Move slide later" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--poskoo-line)] bg-white text-[#3d3450] disabled:opacity-40">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => removeSlide(selected)} disabled={slides.length <= 1} aria-label="Delete slide" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--poskoo-line)] bg-white text-[#3d3450] disabled:opacity-40">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <label htmlFor={titleId} className={`${labelClass} mt-4`}>Headline</label>
            <input id={titleId} type="text" value={current.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. 5 caption hooks that stop the scroll" className={inputClass} />

            <label htmlFor={bodyId} className={`${labelClass} mt-4`}>Body text</label>
            <textarea id={bodyId} value={current.body} onChange={(e) => update({ body: e.target.value })} rows={3} placeholder="Add a short line of supporting text." className={`${inputClass} resize-y`} />

            <fieldset className="mt-4 border-0 p-0">
              <legend id={paletteId} className={labelClass}>Background colour</legend>
              <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-labelledby={paletteId}>
                {PALETTE.map((p) => (
                  <button key={p.name} type="button" onClick={() => update({ bg: p.bg, fg: p.fg })} aria-pressed={current.bg === p.bg} className={`min-h-[44px] rounded-xl border-2 px-2 py-2 text-xs font-semibold transition ${current.bg === p.bg ? "border-[var(--poskoo-violet)]" : "border-[var(--poskoo-line)] hover:border-[var(--poskoo-violet)]"}`} style={{ backgroundColor: p.bg, color: p.fg }}>
                    {p.name}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <div className={`${cardClass} space-y-3`}>
            <button type="button" onClick={() => slides.forEach((_, i) => setTimeout(() => download(i), i * 200))} className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-violet)] px-4 py-3 text-sm font-semibold text-white shadow-sm">
              <Download className="h-4 w-4" /> Download all slides
            </button>
            <p className="text-xs leading-relaxed text-[var(--poskoo-muted)]">
              Each slide saves as a 1080×1350 PNG. Everything runs in your browser — nothing is uploaded and no account is needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
