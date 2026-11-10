"use client";

import { useEffect, useId, useRef, useState, type ChangeEvent } from "react";
import { ImageUp, Trash2 } from "lucide-react";

const TARGET_W = 1080;
const TARGET_H = 1920;
const TARGET_RATIO = TARGET_W / TARGET_H;
const MAX_BYTES = 20 * 1024 * 1024;

type Loaded = {
  name: string;
  url: string;
  width: number;
  height: number;
  bytes: number;
  ratio: number;
  ratioLabel: string;
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function ratioLabel(w: number, h: number): string {
  const d = gcd(w, h) || 1;
  return `${w / d}:${h / d}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function readImage(file: File): Promise<Omit<Loaded, "url">> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      URL.revokeObjectURL(url);
      if (!width || !height) {
        reject(new Error("Could not read this image's dimensions. Try exporting it again as a JPG or PNG."));
        return;
      }
      resolve({
        name: file.name,
        width,
        height,
        bytes: file.size,
        ratio: width / height,
        ratioLabel: ratioLabel(width, height),
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This file could not be opened as an image. Choose a JPG, PNG or WebP file."));
    };
    img.src = url;
  });
}

export default function StorySizeChecker() {
  const [image, setImage] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const urlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileId = useId();

  useEffect(() => {
    return () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []);

  function clear() {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
    setImage(null);
    setError(null);
  }

  async function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("That file is not an image. Choose a JPG, PNG or WebP file.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`That image is ${formatBytes(file.size)}. Choose a file under 20 MB.`);
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setLoading(true);
    try {
      const data = await readImage(file);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      const url = URL.createObjectURL(file);
      urlRef.current = url;
      setImage({ ...data, url });
    } catch (err) {
      setError(err instanceof Error ? err.message : "This image could not be read. Try another file.");
    } finally {
      setLoading(false);
    }
  }

  const ratioDiff = image ? Math.abs(image.ratio - TARGET_RATIO) : 0;
  const exact = image ? image.width === TARGET_W && image.height === TARGET_H : false;
  const correctShape = image ? ratioDiff < 0.005 : false;
  const tooSmall = image ? image.width < TARGET_W || image.height < TARGET_H : false;

  let verdict = "";
  let detail = "";
  if (image) {
    if (exact) {
      verdict = "Perfect match: 1080 × 1920";
      detail = "This image is exactly the recommended Instagram Story size and 9:16 shape. It will fill the screen without cropping or padding.";
    } else if (correctShape) {
      verdict = "Correct 9:16 shape, different resolution";
      detail = tooSmall
        ? `This image is ${image.width} × ${image.height} px. The shape is right, but it is smaller than 1080 × 1920, so Instagram may upscale it and it can look soft. Re-export at 1080 × 1920 for the sharpest Story.`
        : `This image is ${image.width} × ${image.height} px. The 9:16 shape is right, so it will fill the Story frame. Instagram scales it to 1080 × 1920, which is fine as long as the image is sharp.`;
    } else {
      verdict = "Not a 9:16 Story shape";
      detail = `This image is ${image.width} × ${image.height} px (${image.ratioLabel}). Instagram Stories use a 9:16 frame, so this image will be cropped or padded with bars. Re-export or crop it to 1080 × 1920 before you post.`;
    }
  }

  return (
    <div className="text-left">
      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] md:items-start">
        <div className="flex justify-center">
          <div className="w-full max-w-[17rem] rounded-[2.25rem] border border-[var(--poskoo-line)] bg-[#0d0d14] p-2.5 shadow-xl">
            <div
              className="relative aspect-[9/16] w-full overflow-hidden rounded-[1.75rem] bg-[var(--poskoo-paper)]"
              role="img"
              aria-label={image ? `9:16 Story preview of ${image.name}` : "Empty 9:16 Instagram Story frame"}
            >
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt="" className="absolute inset-0 h-full w-full object-contain" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-[var(--poskoo-muted)]">
                  <ImageUp className="h-8 w-8" aria-hidden="true" />
                  <p className="text-xs font-medium">Your Story preview appears here</p>
                  <p className="text-[11px]">9:16 · 1080 × 1920 recommended</p>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/15" aria-hidden="true" />
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor={fileId} className="text-sm font-medium">
              Load a Story image
            </label>
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
              Opened locally in your browser; nothing is uploaded or stored.
            </p>
          </div>

          {error ? (
            <p role="alert" className="rounded-xl border border-[var(--poskoo-coral)] bg-[var(--poskoo-coral)]/10 px-3 py-2 text-sm text-[#3d3450]">
              {error}
            </p>
          ) : null}

          {loading ? <p className="text-sm text-[var(--poskoo-muted)]">Reading image dimensions…</p> : null}

          {image ? (
            <div className="space-y-3" aria-live="polite">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
                  <p className="text-xs font-medium text-[var(--poskoo-muted)]">Dimensions</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--poskoo-ink)]">
                    {image.width} × {image.height}
                  </p>
                </div>
                <div className="rounded-2xl border border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] p-3">
                  <p className="text-xs font-medium text-[var(--poskoo-muted)]">Aspect ratio</p>
                  <p className="mt-1 text-lg font-semibold text-[var(--poskoo-ink)]">{image.ratioLabel}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--poskoo-muted)]">
                {image.name} · {formatBytes(image.bytes)} · recommended {TARGET_W} × {TARGET_H} px (9:16)
              </p>
              <div
                className={`rounded-2xl border p-4 ${
                  exact
                    ? "border-[var(--poskoo-violet)] bg-[var(--poskoo-violet)]/10"
                    : correctShape
                      ? "border-[var(--poskoo-line)] bg-[var(--poskoo-paper)]"
                      : "border-[var(--poskoo-coral)] bg-[var(--poskoo-coral)]/10"
                }`}
              >
                <p className="text-sm font-semibold text-[var(--poskoo-ink)]">{verdict}</p>
                <p className="mt-1 text-sm text-[#3d3450]">{detail}</p>
              </div>
              <button
                type="button"
                onClick={clear}
                className="inline-flex items-center gap-2 rounded-lg border border-[var(--poskoo-line)] bg-[var(--poskoo-card)] px-3 py-1.5 text-xs font-medium text-[#3d3450]"
              >
                <Trash2 className="h-4 w-4" />
                Clear image
              </button>
            </div>
          ) : null}

          {!image && !loading && !error ? (
            <p className="rounded-xl border border-dashed border-[var(--poskoo-line)] bg-[var(--poskoo-paper)] px-4 py-6 text-center text-sm text-[var(--poskoo-muted)]">
              Choose an image to see its exact dimensions, aspect ratio and whether it fits the 1080 × 1920 Story frame.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
