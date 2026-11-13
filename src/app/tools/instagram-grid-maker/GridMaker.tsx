"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { AlertTriangle, Check, Download, ImagePlus, LayoutGrid, Loader2, Maximize2, Ratio, Trash2, Upload } from "lucide-react";

type Loaded = { name: string; src: string; width: number; height: number };
type Tile = "portrait" | "square";

const COLUMNS = 3;
const TILE_W = 1080;

function loadImage(file: File): Promise<Loaded> {
  return new Promise((resolve, reject) => {
    const src = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (!img.naturalWidth || !img.naturalHeight) {
        URL.revokeObjectURL(src);
        reject(new Error("Could not read the image dimensions."));
        return;
      }
      resolve({ name: file.name, src, width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(src);
      reject(new Error("This file could not be read as an image."));
    };
    img.src = src;
  });
}

const ghostBtn = "inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 text-sm font-medium hover:border-[var(--poskoo-ink)] disabled:opacity-40";
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3.5";
const kpiLabel = "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

export default function GridMaker() {
  const [image, setImage] = useState<Loaded | null>(null);
  const [rows, setRows] = useState(3);
  const [tile, setTile] = useState<Tile>("portrait");
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dlState, setDlState] = useState<"idle" | "busy" | "done">("idle");
  const dlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileId = useId();
  const rowsId = useId();

  const tileH = tile === "portrait" ? 1440 : 1080;
  const total = rows * COLUMNS;

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.src);
    };
  }, [image]);

  useEffect(() => () => {
    if (dlTimer.current) clearTimeout(dlTimer.current);
  }, []);

  useEffect(() => {
    if (!image) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const targetRatio = (COLUMNS * TILE_W) / (rows * tileH);
      let sx = 0;
      let sy = 0;
      let sw = image.width;
      let sh = image.height;
      if (image.width / image.height > targetRatio) {
        sw = image.height * targetRatio;
        sx = (image.width - sw) / 2;
      } else {
        sh = image.width / targetRatio;
        sy = (image.height - sh) / 2;
      }
      const next: string[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < COLUMNS; c++) {
          const canvas = document.createElement("canvas");
          canvas.width = TILE_W;
          canvas.height = tileH;
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;
          ctx.drawImage(img, sx + (c * sw) / COLUMNS, sy + (r * sh) / rows, sw / COLUMNS, sh / rows, 0, 0, TILE_W, tileH);
          next.push(canvas.toDataURL("image/png"));
        }
      }
      setPreviews(next);
    };
    img.src = image.src;
    return () => {
      cancelled = true;
    };
  }, [image, rows, tile, tileH]);

  async function loadFile(file: File | undefined) {
    if (!file) return;
    setLoading(true);
    setError(null);
    setPreviews([]);
    try {
      setImage(await loadImage(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "That file could not be read.");
    } finally {
      setLoading(false);
    }
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    void loadFile(e.target.files?.[0]);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    void loadFile(Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/")));
  }

  function download(index: number) {
    const url = previews[index];
    if (!url) return;
    const post = total - index;
    const a = document.createElement("a");
    a.href = url;
    a.download = `grid-post-${post}-of-${total}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function downloadAll() {
    // Post 1 is the bottom-right tile, so download from the end of the reading-order list.
    for (let n = 1; n <= total; n++) {
      window.setTimeout(() => download(total - n), (n - 1) * 150);
    }
    setDlState("busy");
    if (dlTimer.current) clearTimeout(dlTimer.current);
    dlTimer.current = setTimeout(() => {
      setDlState("done");
      dlTimer.current = setTimeout(() => setDlState("idle"), 2200);
    }, total * 150 + 300);
  }

  function clearAll() {
    if (inputRef.current) inputRef.current.value = "";
    setImage(null);
    setPreviews([]);
    setError(null);
  }

  const targetRatio = (COLUMNS * TILE_W) / (rows * tileH);
  const cropW = image ? (image.width / image.height > targetRatio ? image.height * targetRatio : image.width) : 0;
  const cropH = image ? (image.width / image.height > targetRatio ? image.height : image.width / targetRatio) : 0;
  const upscaled = image ? image.width < COLUMNS * TILE_W : false;

  return (
    <div className="min-w-0 space-y-5 text-left">
      {/* Controls */}
      <div className="grid gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)]">
        <div className="min-w-0">
          <label htmlFor={fileId} className="block text-sm font-semibold">Select an image to split</label>
          <input
            id={fileId}
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={onFileChange}
            aria-describedby={`${fileId}-help`}
            className="peer sr-only"
          />
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`mt-2 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 text-center transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--poskoo-violet)] sm:flex-row sm:text-left ${image ? "py-3" : "py-7"} ${dragging ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-band)]" : "border-[var(--poskoo-line)] bg-[var(--poskoo-card)] hover:border-[var(--poskoo-violet)]"}`}
          >
            <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[var(--poskoo-band)] text-[var(--poskoo-violet)]" aria-hidden="true">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            </span>
            <span className="min-w-0">
              <span className="block break-all text-base font-semibold text-[var(--poskoo-ink)]">{image ? image.name : "Drop a photo or browse"}</span>
              <span className="block text-sm text-[#3d3450]">{image ? "Click or drop to use a different image." : "One photo becomes your whole profile grid."}</span>
            </span>
            <span className="inline-flex min-h-11 flex-none items-center gap-2 rounded-xl border border-[var(--poskoo-ink)] bg-[var(--poskoo-card)] px-4 text-sm font-semibold sm:ml-auto">
              <Upload className="h-4 w-4" aria-hidden="true" />{image ? "Replace" : "Browse"}
            </span>
          </div>
          <p id={`${fileId}-help`} className="mt-2 text-xs text-[var(--poskoo-muted)]">
            One image is read in your browser and never uploaded. It is centre-cropped and cut into 3 columns.
          </p>
        </div>
        <div className="min-w-0 space-y-3">
          <div>
            <label htmlFor={rowsId} className="block text-sm font-semibold">Grid size</label>
            <div className="relative mt-2">
              <LayoutGrid aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--poskoo-violet)]" />
              <select
                id={rowsId}
                value={rows}
                onChange={(e) => setRows(Number(e.target.value))}
                className="block min-h-11 w-full rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] pl-10 pr-3 text-base text-[var(--poskoo-ink)] focus:border-[var(--poskoo-violet)]"
              >
                <option value={1}>3 × 1 (3 posts)</option>
                <option value={2}>3 × 2 (6 posts)</option>
                <option value={3}>3 × 3 (9 posts)</option>
                <option value={4}>3 × 4 (12 posts)</option>
              </select>
            </div>
          </div>
          <div>
            <span className="block text-sm font-semibold">Tile shape</span>
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1">
              <button
                type="button"
                aria-pressed={tile === "portrait"}
                onClick={() => setTile("portrait")}
                className={`inline-flex min-h-11 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${tile === "portrait" ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"}`}
              >
                3:4 profile grid
              </button>
              <button
                type="button"
                aria-pressed={tile === "square"}
                onClick={() => setTile("square")}
                className={`inline-flex min-h-11 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${tile === "square" ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"}`}
              >
                1:1 square
              </button>
            </div>
          </div>
        </div>
      </div>

      {error ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-[var(--poskoo-coral)] bg-[var(--poskoo-coral)]/10 px-3 py-2 text-sm text-[#3d3450]">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-coral)]" aria-hidden="true" />{error}
        </p>
      ) : null}
      {loading ? <p className="text-sm text-[var(--poskoo-muted)]" role="status">Reading your image…</p> : null}

      {!image && !loading ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-10 text-center text-sm text-[var(--poskoo-muted)]">
          <LayoutGrid className="h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden="true" />
          <p>Your grid tiles appear here, numbered in the order to post them.</p>
        </div>
      ) : null}

      {image && previews.length > 0 ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className={kpi}>
              <p className={kpiLabel}><Maximize2 className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Source image</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{image.width}×{image.height}</p>
              <p className="mt-1 text-xs text-[#3d3450]">Pixels, read from your file.</p>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}><LayoutGrid className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Tiles</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{total}</p>
              <p className="mt-1 text-xs text-[#3d3450]">{rows} rows of 3.</p>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}><Ratio className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Each tile</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{TILE_W}×{tileH}</p>
              <p className="mt-1 text-xs text-[#3d3450]">PNG, {tile === "portrait" ? "3:4" : "1:1"}.</p>
            </div>
            <div className={kpi}>
              <p className={kpiLabel}><Maximize2 className="h-3.5 w-3.5 text-[var(--poskoo-violet)]" aria-hidden="true" />Cropped area</p>
              <p className="mt-1 text-xl font-bold sm:text-2xl tabular-nums text-[var(--poskoo-ink)]">{Math.round(cropW)}×{Math.round(cropH)}</p>
              <p className="mt-1 text-xs text-[#3d3450]">Centre crop of your photo.</p>
            </div>
          </div>

          {upscaled ? (
            <p className="flex items-start gap-2 rounded-xl border border-[#e8b04b] bg-[#fdf3dd] px-3 py-2 text-sm text-[#6b4a0a]">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-[#a8410f]" aria-hidden="true" />
              Your image is smaller than 3240 px wide, so tiles are upscaled and may look soft.
            </p>
          ) : null}

          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 sm:p-4">
              <p className="text-sm text-[#3d3450]">
                {image.name} · {image.width}×{image.height} px · {total} tiles, numbered in posting order
              </p>

              <ol className="grid grid-cols-3 gap-1">
                {previews.map((url, i) => {
                  const post = total - i;
                  return (
                    <li key={i} className="relative min-w-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Grid tile, post ${post} of ${total}`} className="block w-full rounded-md border border-[var(--poskoo-line)]" />
                      <span className="absolute left-1 top-1 rounded-full bg-white/90 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-[var(--poskoo-ink)] shadow-sm">
                        Post {post}
                      </span>
                      <button
                        type="button"
                        onClick={() => download(i)}
                        aria-label={`Download post ${post} of ${total}`}
                        className="mt-1 inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-1 text-[11px] font-medium text-[#3d3450] hover:border-[var(--poskoo-ink)]"
                      >
                        <Download className="h-3.5 w-3.5" aria-hidden="true" /> Download
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>

            <aside aria-label="Download and clear" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
              <button
                type="button"
                onClick={downloadAll}
                disabled={dlState === "busy"}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--poskoo-ink)] px-4 text-base font-semibold text-white shadow-[0_3px_0_var(--poskoo-violet)] transition hover:-translate-y-px disabled:opacity-70"
              >
                {dlState === "done" ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
                {dlState === "busy" ? `Saving ${total} PNGs…` : dlState === "done" ? "Downloaded" : "Download all"}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className={`${ghostBtn} w-full hover:text-[var(--poskoo-red)]`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear image
              </button>
              <span className="sr-only" aria-live="polite">{dlState === "busy" ? `Downloading ${total} tiles` : dlState === "done" ? "Tiles downloaded" : ""}</span>
              <p className="text-xs text-[#5f5873]">
                Post the tiles from post 1 (bottom right) to post {total} (top left) so the picture joins up.
              </p>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
