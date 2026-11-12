"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { CalendarClock, Check, ClipboardList, Maximize2, RectangleHorizontal, RectangleVertical, Square } from "lucide-react";
import { platforms } from "./sizes";

const kpi = "min-w-0 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3";
const kpiLabel = "text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

/** Pixel width/height when the size cell starts with "W×H", otherwise null. */
function pixels(size: string): [number, number] | null {
  const m = /^(\d+)×(\d+)/.exec(size);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/** Width ÷ height from the pixels, or from the "a:b" ratio cell; null for "Varies". */
function shape(size: string, ratio: string): number | null {
  const px = pixels(size);
  if (px) return px[0] / px[1];
  const m = /^([\d.]+):([\d.]+)$/.exec(ratio);
  return m ? Number(m[1]) / Number(m[2]) : null;
}

function Frame({ r, max, label }: { r: number | null; max: number; label?: string }) {
  const w = r === null ? max * 0.7 : r >= 1 ? max : max * r;
  const h = r === null ? max * 0.7 : r >= 1 ? max / r : max;
  return (
    <span className="grid flex-none place-items-center" style={{ width: max, height: max }} aria-hidden="true">
      <span
        className={`grid place-items-center rounded-[4px] border-2 text-[10px] font-bold ${r === null ? "border-dashed border-[#5f5873] text-[#5f5873]" : "border-[var(--poskoo-violet)] bg-[var(--poskoo-band)] text-[var(--poskoo-violet)]"}`}
        style={{ width: Math.max(6, w), height: Math.max(6, h) }}
      >
        {label}
      </span>
    </span>
  );
}

export default function ImageSizeFinder() {
  const id = useId();
  const [pi, setPi] = useState(0);
  const [fi, setFi] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const platform = platforms[pi];
  const row = platform.rows[Math.min(fi, platform.rows.length - 1)];
  const px = pixels(row.size);
  const r = shape(row.size, row.ratio);
  const orientation = r === null ? "Varies" : Math.abs(r - 1) < 0.01 ? "Square" : r > 1 ? "Landscape" : "Portrait";
  const OrientIcon = orientation === "Square" ? Square : orientation === "Landscape" ? RectangleHorizontal : RectangleVertical;

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 1600);
    } catch {
      setCopied(null);
    }
  }

  // Every format with exact pixels, scaled against the largest side on this platform.
  const scaled = platform.rows.flatMap((x, i) => {
    const p = pixels(x.size);
    return p ? [{ format: x.format, i, w: p[0], h: p[1] }] : [];
  });
  const scaleMax = Math.max(1, ...scaled.map((x) => Math.max(x.w, x.h)));

  const sheet =[`${platform.name} image sizes`, ...platform.rows.map((x) => `${x.format}: ${x.size} (${x.ratio})`)].join("\n");

  return (
    <div className="min-w-0 space-y-4 text-left">
      <div role="group" aria-label="Choose a platform" className="-mx-1 flex min-w-0 gap-1.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {platforms.map((p, i) => (
          <button
            key={p.name}
            type="button"
            aria-pressed={i === pi}
            onClick={() => { setPi(i); setFi(0); }}
            className={`inline-flex min-h-10 flex-none items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition ${i === pi ? "border-[var(--poskoo-ink)] bg-[var(--poskoo-ink)] text-white" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] text-[#3d3450] hover:border-[var(--poskoo-ink)]"}`}
          >
            {p.name}
            <span className={`rounded-md px-1.5 text-xs tabular-nums ${i === pi ? "bg-white/15" : "bg-[var(--poskoo-paper)]"}`}>{p.rows.length}</span>
          </button>
        ))}
      </div>

      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
          <p className="px-1 text-sm text-[#3d3450]">{platform.note}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2" aria-label={`${platform.name} formats`}>
            {platform.rows.map((x, i) => {
              const on = x === row;
              return (
                <li key={x.format} className="min-w-0">
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => setFi(i)}
                    className={`flex w-full min-w-0 items-center gap-3 rounded-xl border bg-[var(--poskoo-card)] p-2.5 text-left transition ${on ? "border-[var(--poskoo-violet)] shadow-[0_0_0_3px_var(--poskoo-band)]" : "border-[var(--poskoo-line)] hover:border-[var(--poskoo-ink)]"}`}
                  >
                    <Frame r={shape(x.size, x.ratio)} max={40} />
                    <span className="min-w-0">
                      <b className="block truncate text-sm text-[var(--poskoo-ink)]">{x.format}</b>
                      <span className="block truncate text-xs tabular-nums text-[#5f5873]">{x.size} · {x.ratio}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {scaled.length > 1 && (
            <div className="mt-3 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3">
              <p className={kpiLabel}>Drawn to scale</p>
              <div className="mt-2 flex min-w-0 items-end gap-3 overflow-x-auto pb-1" aria-hidden="true">
                {scaled.map((x) => (
                  <button key={x.format} type="button" tabIndex={-1} onClick={() => setFi(x.i)} className="flex flex-none flex-col items-center gap-1">
                    <span
                      className={`block rounded-[3px] border-2 ${x.i === platform.rows.indexOf(row) ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-band)]" : "border-[#b5aec4] bg-[var(--poskoo-paper)]"}`}
                      style={{ width: Math.max(4, (x.w / scaleMax) * 150), height: Math.max(4, (x.h / scaleMax) * 150) }}
                    />
                    <span className="max-w-[90px] truncate text-[10px] font-semibold text-[#5f5873]">{x.format}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside aria-labelledby={`${id}-sel`} className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 lg:sticky lg:top-24">
          <div className="grid h-40 place-items-center rounded-xl bg-[var(--poskoo-card)] bg-[radial-gradient(var(--poskoo-line)_1px,transparent_1px)] [background-size:12px_12px]">
            <Frame r={r} max={128} label={row.ratio} />
          </div>
          <div>
            <p className={kpiLabel}>{platform.name}</p>
            <h4 id={`${id}-sel`} className="text-lg font-bold text-[var(--poskoo-ink)]">{row.format}</h4>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className={`${kpi} col-span-2`}>
              <p className={kpiLabel}>Size (px)</p>
              <p className="mt-0.5 break-words text-xl font-bold tabular-nums">{row.size}</p>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}>Aspect ratio</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums">{row.ratio}</p>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}>Shape</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-lg font-bold"><OrientIcon className="h-4 w-4 text-[var(--poskoo-violet)]" aria-hidden="true" />{orientation}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={!px}
            onClick={() => px && copy(`${px[0]}×${px[1]}`, "size")}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-40"
          >
            {copied === "size" ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Maximize2 className="h-5 w-5" aria-hidden="true" />}
            {copied === "size" ? "Copied" : px ? `Copy ${px[0]}×${px[1]}` : "No fixed size"}
          </button>
          <button
            type="button"
            onClick={() => copy(sheet, "sheet")}
            className="inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)]"
          >
            {copied === "sheet" ? <Check className="h-4 w-4 text-[var(--poskoo-green)]" aria-hidden="true" /> : <ClipboardList className="h-4 w-4" aria-hidden="true" />}
            {copied === "sheet" ? "Copied" : `Copy all ${platform.name} sizes`}
          </button>
          <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
          <Link href={platform.scheduler} className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-[var(--poskoo-violet)] underline underline-offset-2">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />Schedule {platform.name} posts
          </Link>
        </aside>
      </div>
    </div>
  );
}
