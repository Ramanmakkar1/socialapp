"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Check, ChevronLeft, ChevronRight, Download, GalleryHorizontalEnd, Layers, Palette, Plus, Ruler, Trash2, Type } from "lucide-react";

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

function SlideCanvas({ slide, index, total, className }: { slide: Slide; index: number; total: number; className: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (ref.current) drawSlide(ref.current, slide, index, total);
  }, [slide, index, total]);
  return <canvas ref={ref} aria-hidden="true" className={className} />;
}

function SlidePreview({ slide, index, total, onDownload, onSelect, isSelected }: { slide: Slide; index: number; total: number; onDownload: () => void; onSelect: () => void; isSelected: boolean }) {
  return (
    <li className={`group rounded-2xl border bg-[var(--poskoo-paper)] p-2.5 transition ${isSelected ? "border-[var(--poskoo-violet)] ring-2 ring-[var(--poskoo-violet)]" : "border-[var(--poskoo-line)] hover:border-[var(--poskoo-ink)]/30"}`}>
      <button type="button" onClick={onSelect} aria-pressed={isSelected} aria-label={`Edit slide ${index + 1} of ${total}: ${slide.title || "untitled"}`} className="relative block w-full cursor-pointer rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--poskoo-violet)] focus-visible:ring-offset-2">
        <SlideCanvas slide={slide} index={index} total={total} className="block w-full rounded-xl border border-[var(--poskoo-line)]" />
        <span aria-hidden="true" className={`absolute bottom-2 right-2 grid h-7 min-w-7 place-items-center rounded-full px-1.5 text-xs font-bold tabular-nums shadow-sm ${isSelected ? "bg-[var(--poskoo-lime)] text-[var(--poskoo-ink)]" : "bg-white/90 text-[var(--poskoo-ink)]"}`}>{index + 1}</span>
      </button>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-2 gap-y-1.5">
        <span className="whitespace-nowrap text-sm font-medium text-[var(--poskoo-ink)]">Slide {index + 1} of {total}</span>
        <button type="button" onClick={onDownload} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-xs font-medium text-[#3d3450] max-sm:w-full hover:border-[var(--poskoo-ink)]">
          <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download
        </button>
      </div>
    </li>
  );
}

const labelClass = "block text-sm font-semibold text-[var(--poskoo-ink)]";
const inputClass = "mt-1.5 block w-full min-h-[44px] rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5 text-base text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)] focus:outline-none focus:ring-2 focus:ring-[var(--poskoo-violet)]/30";
const iconBtn = "inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] text-[#3d3450] hover:border-[var(--poskoo-ink)] disabled:opacity-40 disabled:hover:border-[var(--poskoo-line)]";
const ghostBtn = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

export default function CarouselMaker() {
  const [slides, setSlides] = useState<Slide[]>(initialSlides);
  const [selected, setSelected] = useState(0);
  const [dlState, setDlState] = useState<"idle" | "busy" | "done">("idle");
  const dlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleId = useId();
  const bodyId = useId();
  const paletteId = useId();
  const prevId = useId();

  const sel = Math.min(selected, slides.length - 1);
  const current = slides[sel];

  useEffect(() => () => {
    if (dlTimer.current) clearTimeout(dlTimer.current);
  }, []);

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

  function downloadAll() {
    slides.forEach((_, i) => setTimeout(() => download(i), i * 200));
    setDlState("busy");
    if (dlTimer.current) clearTimeout(dlTimer.current);
    dlTimer.current = setTimeout(() => {
      setDlState("done");
      dlTimer.current = setTimeout(() => setDlState("idle"), 2200);
    }, slides.length * 200 + 300);
  }

  const totalWords = slides.reduce((n, s) => n + wordCount(s.title) + wordCount(s.body), 0);
  const coloursUsed = new Set(slides.map((s) => s.bg)).size;

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className={kpi}>
          <p className={kpiLabel}><Layers className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Slides</p>
          <p aria-live="polite" className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{slides.length}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Exported in this order.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><Ruler className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Export size</p>
          <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{W}×{H}</p>
          <p className="mt-1 text-xs text-[#3d3450]">4:5 portrait PNG per slide.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><Type className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Words</p>
          <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{totalWords}</p>
          <p className="mt-1 text-xs text-[#3d3450]">Across all headlines and body text.</p>
        </div>
        <div className={kpi}>
          <p className={kpiLabel}><Palette className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Colours</p>
          <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{coloursUsed}<span className="text-base font-medium text-[#5f5873]"> / {PALETTE.length}</span></p>
          <div className="mt-2 flex h-2 overflow-hidden rounded-full" aria-hidden="true">
            {slides.map((s) => <i key={s.id} className="flex-1" style={{ background: s.bg, boxShadow: "inset 0 0 0 1px rgba(30,22,49,.08)" }} />)}
          </div>
        </div>
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-5">
          {/* Editor */}
          <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-semibold text-[var(--poskoo-ink)]">
                <span className="grid h-7 min-w-7 place-items-center rounded-full bg-[var(--poskoo-lime)] px-1.5 text-xs font-bold tabular-nums" aria-hidden="true">{sel + 1}</span>
                Editing slide {sel + 1}
              </p>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => move(selected, -1)} disabled={selected === 0} aria-label="Move slide earlier" className={iconBtn}>
                  <ArrowUp className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => move(selected, 1)} disabled={selected === slides.length - 1} aria-label="Move slide later" className={iconBtn}>
                  <ArrowDown className="h-4 w-4" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => removeSlide(selected)} disabled={slides.length <= 1} aria-label="Delete slide" className={`${iconBtn} hover:text-[var(--poskoo-red)]`}>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 xl:grid-cols-2">
              <div className="min-w-0">
                <label htmlFor={titleId} className={`${labelClass} flex justify-between`}>Headline <span className="text-xs font-medium tabular-nums text-[#5f5873]">{current.title.length} chars</span></label>
                <input id={titleId} type="text" value={current.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. 5 caption hooks that stop the scroll" className={inputClass} />
                <p className="mt-1.5 text-xs text-[#3d3450]">Up to 4 lines fit on the slide.</p>
              </div>
              <div className="min-w-0">
                <label htmlFor={bodyId} className={`${labelClass} flex justify-between`}>Body text <span className="text-xs font-medium tabular-nums text-[#5f5873]">{current.body.length} chars</span></label>
                <textarea id={bodyId} value={current.body} onChange={(e) => update({ body: e.target.value })} rows={3} placeholder="Add a short line of supporting text." className={`${inputClass} resize-y`} />
              </div>
            </div>

            <fieldset className="mt-4 border-0 p-0">
              <legend id={paletteId} className={labelClass}>Background colour</legend>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6" role="group" aria-labelledby={paletteId}>
                {PALETTE.map((p) => {
                  const on = current.bg === p.bg;
                  return (
                    <button key={p.name} type="button" onClick={() => update({ bg: p.bg, fg: p.fg })} aria-pressed={on}
                      className={`relative inline-flex min-h-11 items-center justify-center gap-1 rounded-xl border-2 px-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--poskoo-violet)] ${on ? "border-[var(--poskoo-ink)] shadow-[0_3px_0_var(--poskoo-violet)]" : "border-[var(--poskoo-line)] hover:border-[var(--poskoo-violet)]"}`}
                      style={{ backgroundColor: p.bg, color: p.fg }}>
                      {on && <Check className="h-3.5 w-3.5" aria-hidden="true" />}{p.name}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          {/* Slide strip */}
          <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold text-[var(--poskoo-ink)] sm:text-base"><GalleryHorizontalEnd className="h-5 w-5 text-[var(--poskoo-violet)]" aria-hidden="true" />Carousel preview</h3>
                <p className="text-xs text-[var(--poskoo-muted)]">{slides.length} slides · 1080×1350 px each · in order</p>
              </div>
              <button type="button" onClick={addSlide} className={`${ghostBtn} border-[var(--poskoo-violet)] text-[var(--poskoo-violet)] hover:bg-[var(--poskoo-band)]`}>
                <Plus className="h-4 w-4" aria-hidden="true" /> Add slide
              </button>
            </div>
            <ol className="grid grid-cols-2 gap-3 md:grid-cols-3 2xl:grid-cols-4">
              {slides.map((slide, i) => (
                <SlidePreview key={slide.id} slide={slide} index={i} total={slides.length} onDownload={() => download(i)} onSelect={() => setSelected(i)} isSelected={i === sel} />
              ))}
              <li aria-hidden="true">
                <button type="button" onClick={addSlide} tabIndex={-1} className="grid h-full min-h-40 w-full place-items-center rounded-2xl border-2 border-dashed border-[var(--poskoo-line)] text-sm font-medium text-[#5f5873] hover:border-[var(--poskoo-violet)] hover:text-[var(--poskoo-violet)]">
                  <span className="grid place-items-center gap-1"><Plus className="h-6 w-6" />New slide</span>
                </button>
              </li>
            </ol>
          </div>
        </div>

        {/* Primary action + live phone preview */}
        <aside aria-label="Download and preview" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <button type="button" onClick={downloadAll} disabled={dlState === "busy"}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-70">
            {dlState === "done" ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
            {dlState === "busy" ? `Saving ${slides.length} PNGs…` : dlState === "done" ? "Downloaded" : "Download all slides"}
          </button>
          <button type="button" onClick={() => download(sel)} className={`${ghostBtn} w-full`}>
            <Download className="h-4 w-4" aria-hidden="true" />This slide only
          </button>
          <span className="sr-only" aria-live="polite">{dlState === "busy" ? `Downloading ${slides.length} slides` : dlState === "done" ? "Slides downloaded" : ""}</span>

          <div className="max-lg:hidden">
            <h4 id={prevId} className="flex items-center justify-between text-sm font-semibold">
              Phone preview
              <span className="text-xs font-medium tabular-nums text-[#5f5873]">{sel + 1} / {slides.length}</span>
            </h4>
            <div className="mx-auto mt-2 max-w-[300px] rounded-[22px] border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-2.5 shadow-[var(--poskoo-shadow-card)] lg:max-w-none">
              <div className="flex items-center gap-2 px-1 pb-2">
                <span className="h-7 w-7 rounded-full bg-[conic-gradient(var(--poskoo-violet),var(--poskoo-pink),var(--poskoo-peach),var(--poskoo-violet))] p-[2px]" aria-hidden="true"><span className="block h-full w-full rounded-full border-2 border-white bg-[var(--poskoo-band)]" /></span>
                <span className="text-xs font-semibold">your_account</span>
              </div>
              <div className="relative">
                <SlideCanvas slide={current} index={sel} total={slides.length} className="block w-full rounded-lg" />
                <button type="button" onClick={() => setSelected(Math.max(0, sel - 1))} disabled={sel === 0} aria-label="Previous slide"
                  className="absolute left-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--poskoo-ink)] shadow disabled:hidden">
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                <button type="button" onClick={() => setSelected(Math.min(slides.length - 1, sel + 1))} disabled={sel === slides.length - 1} aria-label="Next slide"
                  className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[var(--poskoo-ink)] shadow disabled:hidden">
                  <ChevronRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <div className="flex justify-center gap-1 py-2.5" aria-hidden="true">
                {slides.map((s, i) => <i key={s.id} className={`h-1.5 rounded-full transition-all ${i === sel ? "w-4 bg-[var(--poskoo-violet)]" : "w-1.5 bg-[var(--poskoo-line)]"}`} />)}
              </div>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-[var(--poskoo-muted)]">
            Each slide saves as a 1080×1350 PNG. Everything runs in your browser — nothing is uploaded and no account is needed.
          </p>
        </aside>
      </div>
    </div>
  );
}
