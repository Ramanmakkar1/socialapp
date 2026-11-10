"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Download, Trash2 } from "lucide-react";

type Loaded = { name: string; src: string; width: number; height: number };
const MIN_SLIDES = 2;
const MAX_SLIDES = 10;

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

export default function CarouselSplitter() {
  const [image, setImage] = useState<Loaded | null>(null);
  const [count, setCount] = useState(3);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileId = useId();
  const countId = useId();

  useEffect(() => {
    return () => {
      if (image) URL.revokeObjectURL(image.src);
    };
  }, [image]);

  useEffect(() => {
    if (!image) return;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const next: string[] = [];
      for (let i = 0; i < count; i++) {
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width / count));
        canvas.height = image.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        ctx.drawImage(img, (image.width * i) / count, 0, image.width / count, image.height, 0, 0, canvas.width, canvas.height);
        next.push(canvas.toDataURL("image/png"));
      }
      setPreviews(next);
    };
    img.src = image.src;
    return () => {
      cancelled = true;
    };
  }, [image, count]);

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
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

  function download(index: number) {
    const url = previews[index];
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `slide-${index + 1}-of-${count}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function clearAll() {
    if (inputRef.current) inputRef.current.value = "";
    setImage(null);
    setPreviews([]);
    setError(null);
  }

  return (
    <div className="text-left">
      <label htmlFor={fileId} className="text-sm font-medium">Select an image to split</label>
      <input
        id={fileId}
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onFileChange}
        aria-describedby={`${fileId}-help`}
        className="mt-2 block w-full max-w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--poskoo-violet)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
      />
      <p id={`${fileId}-help`} className="mt-1 text-xs text-[var(--poskoo-muted)]">
        One image is read in your browser and never uploaded. It is split into equal-width vertical slides.
      </p>
      <label htmlFor={countId} className="mt-4 block text-sm font-medium">Number of slides</label>
      <select
        id={countId}
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        className="mt-2 block w-full max-w-[12rem] rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-2 text-sm text-[var(--poskoo-ink)]"
      >
        {Array.from({ length: MAX_SLIDES - MIN_SLIDES + 1 }, (_, i) => MIN_SLIDES + i).map((n) => (
          <option key={n} value={n}>{n} slides</option>
        ))}
      </select>
      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-[var(--poskoo-coral)] bg-[var(--poskoo-coral)]/10 px-3 py-2 text-sm text-[#3d3450]">{error}</p>
      ) : null}
      {loading ? <p className="mt-4 text-sm text-[var(--poskoo-muted)]">Reading your image…</p> : null}
      {image && previews.length > 0 ? (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3" aria-live="polite">
            <p className="text-sm text-[#3d3450]">
              {image.name} · {image.width}×{image.height} px · {previews.length} slides, left to right
            </p>
            <button
              type="button"
              onClick={() => previews.forEach((_, i) => window.setTimeout(() => download(i), i * 150))}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--poskoo-violet)] px-3 py-2 text-sm font-medium text-white"
            >
              <Download className="h-4 w-4" /> Download all slides
            </button>
          </div>
          <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {previews.map((url, i) => (
              <li key={i} className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Slide ${i + 1} of ${previews.length}: ${image.name}`} className="w-full rounded-xl border border-[var(--poskoo-line)]" />
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-[var(--poskoo-ink)]">Slide {i + 1} of {previews.length}</span>
                  <button
                    type="button"
                    onClick={() => download(i)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-2.5 py-1.5 text-xs font-medium text-[#3d3450]"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </div>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-1.5 text-xs font-medium text-[#3d3450]"
          >
            <Trash2 className="h-4 w-4" /> Clear image
          </button>
        </>
      ) : null}
    </div>
  );
}
