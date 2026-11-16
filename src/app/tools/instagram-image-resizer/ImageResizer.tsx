"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { AlertTriangle, Check, Download, ImagePlus, Loader2, Trash2, Upload } from "lucide-react";

type Loaded = { name: string; src: string; width: number; height: number };
type PresetId = "square" | "portrait" | "story" | "landscape";
type Mode = "crop" | "fit";

const PRESETS: { id: PresetId; label: string; width: number; height: number; ratio: string }[] = [
  { id: "square", label: "Square", width: 1080, height: 1080, ratio: "1:1" },
  { id: "portrait", label: "Portrait 4:5", width: 1080, height: 1350, ratio: "4:5" },
  { id: "story", label: "Story / Reel 9:16", width: 1080, height: 1920, ratio: "9:16" },
  { id: "landscape", label: "Landscape 1.91:1", width: 1080, height: 566, ratio: "1.91:1" },
];

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
const kpi = "min-w-0 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2.5";
const kpiLabel = "flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#5f5873]";

export default function ImageResizer() {
  const [image, setImage] = useState<Loaded | null>(null);
  const [preset, setPreset] = useState<PresetId>("portrait");
  const [mode, setMode] = useState<Mode>("crop");
  const [bg, setBg] = useState("#ffffff");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dlState, setDlState] = useState<"idle" | "done">("idle");
  const dlTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileId = useId();
  const bgId = useId();

  const active = PRESETS.find((p) => p.id === preset) ?? PRESETS[0];

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = active.width;
      canvas.height = active.height;
      if (mode === "crop") {
        const targetRatio = active.width / active.height;
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
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, active.width, active.height);
      } else {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, active.width, active.height);
        const scale = Math.min(active.width / image.width, active.height / image.height);
        const dw = image.width * scale;
        const dh = image.height * scale;
        ctx.drawImage(img, (active.width - dw) / 2, (active.height - dh) / 2, dw, dh);
      }
    };
    img.src = image.src;
    return () => {
      cancelled = true;
    };
  }, [image, active.width, active.height, mode, bg]);

  async function loadFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose a JPG, PNG or WebP image.");
      return;
    }
    setLoading(true);
    setError(null);
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

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `instagram-${preset}.jpg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setDlState("done");
        if (dlTimer.current) clearTimeout(dlTimer.current);
        dlTimer.current = setTimeout(() => setDlState("idle"), 2200);
      },
      "image/jpeg",
      0.92,
    );
  }

  function clearAll() {
    if (inputRef.current) inputRef.current.value = "";
    setImage(null);
    setError(null);
  }

  const upscaled = image ? image.width < active.width : false;

  return (
    <div className="min-w-0 space-y-5 text-left">
      <div className="grid gap-4 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]">
        <div className="min-w-0">
          <label htmlFor={fileId} className="block text-sm font-semibold">Select a photo to resize</label>
          <input
            id={fileId}
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={onFileChange}
            aria-describedby={`${fileId}-help`}
            className="peer sr-only"
          />
          <div
            onClick={() => inputRef.current?.click()}
            className={`mt-2 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 text-center transition peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--poskoo-violet)] sm:flex-row sm:text-left ${image ? "py-3" : "py-7"} border-[var(--poskoo-line)] bg-[var(--poskoo-card)] hover:border-[var(--poskoo-violet)]`}
          >
            <span className="grid h-12 w-12 flex-none place-items-center rounded-2xl bg-[var(--poskoo-band)] text-[var(--poskoo-violet)]" aria-hidden="true">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
            </span>
            <span className="min-w-0">
              <span className="block break-all text-base font-semibold text-[var(--poskoo-ink)]">{image ? image.name : "Drop a photo or browse"}</span>
              <span className="block text-sm text-[#3d3450]">{image ? "Click to use a different photo." : "JPG, PNG or WebP. Nothing is uploaded."}</span>
            </span>
            <span className="inline-flex min-h-11 flex-none items-center gap-2 rounded-xl border border-[var(--poskoo-ink)] bg-[var(--poskoo-card)] px-4 text-sm font-semibold sm:ml-auto">
              <Upload className="h-4 w-4" aria-hidden="true" />{image ? "Replace" : "Browse"}
            </span>
          </div>
          <p id={`${fileId}-help`} className="mt-2 text-xs text-[var(--poskoo-muted)]">
            Your photo is read in your browser and never uploaded.
          </p>
        </div>

        <div className="min-w-0 space-y-3">
          <div>
            <span className="block text-sm font-semibold">Preset size</span>
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={preset === p.id}
                  onClick={() => setPreset(p.id)}
                  className={`inline-flex min-h-11 flex-col items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${preset === p.id ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"}`}
                >
                  <span>{p.label}</span>
                  <span className="text-[10px] font-normal tabular-nums opacity-80">{p.width}x{p.height}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="block text-sm font-semibold">How to fit</span>
            <div className="mt-2 grid grid-cols-2 gap-1 rounded-xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1">
              <button
                type="button"
                aria-pressed={mode === "crop"}
                onClick={() => setMode("crop")}
                className={`inline-flex min-h-11 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${mode === "crop" ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"}`}
              >
                Crop to fill
              </button>
              <button
                type="button"
                aria-pressed={mode === "fit"}
                onClick={() => setMode("fit")}
                className={`inline-flex min-h-11 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${mode === "fit" ? "bg-[var(--poskoo-ink)] text-white" : "text-[#3d3450] hover:bg-[var(--poskoo-band)]"}`}
              >
                Fit with background
              </button>
            </div>
          </div>
          {mode === "fit" ? (
            <div className="flex items-center justify-between gap-3">
              <label htmlFor={bgId} className="text-sm font-semibold">Background</label>
              <input
                id={bgId}
                type="color"
                value={bg}
                onChange={(e) => setBg(e.target.value)}
                className="h-11 w-16 cursor-pointer rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-1"
              />
            </div>
          ) : null}
        </div>
      </div>

      {error ? (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-[var(--poskoo-coral)] bg-[var(--poskoo-coral)]/10 px-3 py-2 text-sm text-[#3d3450]">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-[var(--poskoo-coral)]" aria-hidden="true" />{error}
        </p>
      ) : null}
      {loading ? <p className="text-sm text-[var(--poskoo-muted)]" role="status">Reading your image...</p> : null}

      {!image && !loading ? (
        <div className="grid place-items-center gap-2 rounded-2xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-10 text-center text-sm text-[var(--poskoo-muted)]">
          <ImagePlus className="h-8 w-8 text-[var(--poskoo-violet)]" aria-hidden="true" />
          <p>Your resized photo preview appears here.</p>
        </div>
      ) : null}

      {image ? (
        <>
          {upscaled ? (
            <p className="flex items-start gap-2 rounded-xl border border-[#e8b04b] bg-[#fdf3dd] px-3 py-2 text-sm text-[#6b4a0a]">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-[#a8410f]" aria-hidden="true" />
              Your photo is {image.width} px wide, smaller than the {active.width} px output, so it will be upscaled and may look soft.
            </p>
          ) : null}

          <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start 2xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] p-3 sm:p-4">
              <div className="flex min-h-[240px] items-center justify-center overflow-hidden rounded-xl bg-[var(--poskoo-paper)] p-2">
                <canvas
                  ref={canvasRef}
                  width={active.width}
                  height={active.height}
                  aria-label={`Preview of ${image.name} resized to ${active.width} by ${active.height}`}
                  className="block h-auto max-h-[520px] w-auto max-w-full rounded-lg border border-[var(--poskoo-line)]"
                />
              </div>
              <p className="text-sm text-[#3d3450]">
                {image.name} · output {active.width}x{active.height} px · {mode === "crop" ? "centre crop to fill" : "fit with background"}
              </p>
            </div>

            <aside aria-label="Dimensions and download" className="min-w-0 space-y-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4 max-lg:order-first lg:sticky lg:top-24">
              <div className="grid grid-cols-2 gap-3">
                <div className={kpi}>
                  <p className={kpiLabel}>Original</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-[var(--poskoo-ink)]">{image.width}x{image.height}</p>
                </div>
                <div className={kpi}>
                  <p className={kpiLabel}>Output</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-[var(--poskoo-ink)]">{active.width}x{active.height}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={download}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--poskoo-ink)] px-5 text-base font-semibold text-white transition hover:-translate-y-px hover:bg-[var(--poskoo-violet)]"
              >
                {dlState === "done" ? <Check className="h-5 w-5 text-[var(--poskoo-lime)]" aria-hidden="true" /> : <Download className="h-5 w-5" aria-hidden="true" />}
                {dlState === "done" ? "Downloaded" : `Download ${active.width}x${active.height} JPG`}
              </button>
              <button
                type="button"
                onClick={clearAll}
                className={`${ghostBtn} w-full hover:text-[var(--poskoo-red)]`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Clear photo
              </button>
              <span className="sr-only" aria-live="polite">{dlState === "done" ? "Image downloaded" : ""}</span>
              <p className="text-xs text-[#5f5873]">
                Downloads as a JPG named instagram-{preset}.jpg. Nothing is uploaded.
              </p>
            </aside>
          </div>
        </>
      ) : null}
    </div>
  );
}
