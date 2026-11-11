// Browser only: read a file's facts before upload (size, type, pixels, video length from a hidden
// <video>), make a small JPEG poster, and upload with progress + cancel. No transcoding.
import type { MediaFacts, MediaKind } from "@/lib/mediaLimits";

const POSTER_MAX_SIDE = 480;
const POSTER_MAX_BYTES = 380 * 1024;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("timeout")), ms);
    promise.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      },
    );
  });
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read the image."));
    image.src = url;
  });
}

/** Hidden <video> with metadata loaded (and seeked to a frame when `seek` is set). */
function loadVideo(url: string, seek: boolean): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = seek ? "auto" : "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onerror = () => reject(new Error("Could not read the video."));
    video.onloadedmetadata = () => {
      if (!seek) return resolve(video);
      video.onseeked = () => resolve(video);
      const d = Number.isFinite(video.duration) ? video.duration : 0;
      video.currentTime = Math.min(1, d / 2);
    };
    video.src = url;
  });
}

function drawPoster(source: CanvasImageSource, width: number, height: number): Promise<Blob | null> {
  if (!width || !height) return Promise.resolve(null);
  const scale = Math.min(1, POSTER_MAX_SIDE / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.resolve(null);
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const encode = (q: number) => new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", q));
  return encode(0.78).then((blob) => (blob && blob.size > POSTER_MAX_BYTES ? encode(0.5) : blob));
}

export type ProbeResult = { facts: MediaFacts; poster: Blob | null };

/**
 * Size / type / pixels / duration of a picked file plus a ≤480px JPEG poster. Facts that cannot be
 * read (for example an HEVC .mov in Chrome) are left out; the server still checks size and length.
 */
export async function probeMediaFile(file: File, kind: MediaKind): Promise<ProbeResult> {
  const facts: MediaFacts = { kind, type: (file.type || "").toLowerCase(), size: file.size };
  const url = URL.createObjectURL(file);
  try {
    if (kind === "image") {
      const image = await withTimeout(loadImage(url), 15_000);
      facts.width = image.naturalWidth;
      facts.height = image.naturalHeight;
      const poster = await drawPoster(image, image.naturalWidth, image.naturalHeight).catch(() => null);
      return { facts, poster };
    }
    const video = await withTimeout(loadVideo(url, false), 15_000);
    facts.durationSec = Number.isFinite(video.duration) ? video.duration : null;
    facts.width = video.videoWidth || null;
    facts.height = video.videoHeight || null;
    let poster: Blob | null = null;
    try {
      const frame = await withTimeout(loadVideo(url, true), 10_000);
      poster = await drawPoster(frame, frame.videoWidth, frame.videoHeight);
    } catch {
      poster = null; // a neutral placeholder is used after publishing
    }
    return { facts, poster };
  } catch {
    return { facts, poster: null };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export type UploadResponse = { status: number; body: Record<string, unknown> };

export class UploadCancelled extends Error {
  constructor() {
    super("Upload cancelled");
  }
}

/** POST a raw body with upload progress (XHR: fetch has no upload progress). Abort with `signal`. */
export function uploadWithProgress(
  url: string,
  body: Blob,
  headers: Record<string, string>,
  onProgress: (loaded: number, total: number) => void,
  signal?: AbortSignal,
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    for (const [k, v] of Object.entries(headers)) xhr.setRequestHeader(k, v);
    xhr.upload.onprogress = (e) => onProgress(e.loaded, e.lengthComputable ? e.total : body.size);
    xhr.onload = () => {
      let parsed: Record<string, unknown> = {};
      try {
        parsed = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        parsed = {};
      }
      resolve({ status: xhr.status, body: parsed });
    };
    xhr.onerror = () => reject(new Error("network"));
    xhr.onabort = () => reject(new UploadCancelled());
    if (signal) {
      if (signal.aborted) return reject(new UploadCancelled());
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }
    xhr.send(body);
  });
}
