"use client";

import { useCallback, useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { Trash2 } from "lucide-react";

type Slide = {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  ratioValue: number;
  ratioLabel: string;
};

type Loaded = Omit<Slide, "url"> & { file: File };

const KNOWN_RATIOS = [
  { label: "1:1", value: 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "3:4", value: 3 / 4 },
  { label: "9:16", value: 9 / 16 },
  { label: "1.91:1", value: 1080 / 566 },
  { label: "16:9", value: 16 / 9 },
  { label: "2:3", value: 2 / 3 },
];

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function ratioLabel(w: number, h: number): string {
  const value = w / h;
  const known = KNOWN_RATIOS.find((r) => Math.abs(r.value - value) < 0.005);
  if (known) return known.label;
  const d = gcd(w, h) || 1;
  return `${w / d}:${h / d}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readDimensions(file: File): Promise<Loaded> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      if (!width || !height) {
        reject(new Error("Could not read the image dimensions."));
        return;
      }
      resolve({
        id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        width,
        height,
        bytes: file.size,
        ratioValue: width / height,
        ratioLabel: ratioLabel(width, height),
        file,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file could not be read as an image."));
    };
    img.src = url;
  });
}

export default function CarouselSizeChecker() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urlsRef = useRef<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileId = useId();

  const revokeAll = useCallback(() => {
    urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    urlsRef.current = [];
  }, []);

  useEffect(() => {
    return () => revokeAll();
  }, [revokeAll]);

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const loaded = await Promise.all(files.map(readDimensions));
      revokeAll();
      const next = loaded.map(({ file, ...rest }) => {
        const url = URL.createObjectURL(file);
        urlsRef.current.push(url);
        return { ...rest, url };
      });
      setSlides(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "One or more files could not be read.");
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    revokeAll();
    if (inputRef.current) inputRef.current.value = "";
    setSlides([]);
    setError(null);
  }

  const totalBytes = slides.reduce((sum, s) => sum + s.bytes, 0);
  const first = slides[0];
  const sameRatio =
    slides.length > 1 && first
      ? slides.every((s) => Math.abs(s.ratioValue - first.ratioValue) < 0.005)
      : null;

  return (
    <div className="text-left">
      <div>
        <label htmlFor={fileId} className="text-sm font-medium">
          Select carousel images
        </label>
        <input
          id={fileId}
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onFileChange}
          aria-describedby={`${fileId}-help`}
          className="mt-2 block w-full max-w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--poskoo-violet)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
        />
        <p id={`${fileId}-help`} className="mt-1 text-xs text-[var(--poskoo-muted)]">
          Select one or more images. They are read in your browser and never uploaded.
        </p>
      </div>

      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-[var(--poskoo-coral)] bg-[var(--poskoo-coral)]/10 px-3 py-2 text-sm text-[#3d3450]">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-4 text-sm text-[var(--poskoo-muted)]">Reading image dimensions…</p>
      ) : null}

      {slides.length > 0 && first ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3" aria-live="polite">
            <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
              <p className="text-xs font-medium text-[var(--poskoo-muted)]">Slides</p>
              <p className="mt-1 text-xl font-semibold text-[var(--poskoo-ink)]">{slides.length}</p>
            </div>
            <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
              <p className="text-xs font-medium text-[var(--poskoo-muted)]">Total file size</p>
              <p className="mt-1 text-xl font-semibold text-[var(--poskoo-ink)]">{formatBytes(totalBytes)}</p>
            </div>
            <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-4">
              <p className="text-xs font-medium text-[var(--poskoo-muted)]">Aspect ratio</p>
              <p className="mt-1 text-xl font-semibold text-[var(--poskoo-ink)]">
                {sameRatio === null ? first.ratioLabel : sameRatio ? `Same · ${first.ratioLabel}` : "Mixed"}
              </p>
            </div>
          </div>

          <p className="mt-3 text-sm text-[#3d3450]" aria-live="polite">
            {sameRatio === null
              ? "Add a second slide to compare aspect ratios."
              : sameRatio
                ? `All ${slides.length} slides share the same ${first.ratioLabel} aspect ratio.`
                : "Some slides use a different aspect ratio. Instagram carousels work best when every slide matches the first slide."}
          </p>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {slides.map((slide, i) => {
              const matches = Math.abs(slide.ratioValue - first.ratioValue) < 0.005;
              return (
                <li key={slide.id} className="flex gap-3 rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.url}
                    alt={`Slide ${i + 1}: ${slide.name}`}
                    className="h-20 w-20 shrink-0 rounded-xl border border-[var(--poskoo-line)] object-cover"
                  />
                  <div className="min-w-0 flex-1 text-sm text-[#3d3450]">
                    <p className="truncate font-medium text-[var(--poskoo-ink)]" title={slide.name}>
                      Slide {i + 1} · {slide.name}
                    </p>
                    <p className="mt-1">
                      {slide.width}×{slide.height} px
                    </p>
                    <p className="mt-0.5">
                      Ratio {slide.ratioLabel} ({slide.ratioValue.toFixed(2)}) · {formatBytes(slide.bytes)}
                    </p>
                    <p className={`mt-1 text-xs font-medium ${matches ? "text-[var(--poskoo-violet)]" : "text-[var(--poskoo-coral)]"}`}>
                      {i === 0 ? "First slide sets the ratio" : matches ? "Matches the first slide" : "Different ratio"}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={clearAll}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-1.5 text-xs font-medium text-[#3d3450]"
          >
            <Trash2 className="h-4 w-4" />
            Clear all
          </button>
        </>
      ) : null}

      {!loading && slides.length === 0 && !error ? (
        <p className="mt-4 rounded-xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-6 text-center text-sm text-[var(--poskoo-muted)]">
          Choose your carousel images to see their dimensions, aspect ratio and file size.
        </p>
      ) : null}
    </div>
  );
}
