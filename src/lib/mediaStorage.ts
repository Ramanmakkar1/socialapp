// Server-only media storage for the composer. Files live on the home server (under /data by
// default) and are served through short-lived signed URLs so Meta can fetch them for publishing.
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { createReadStream, createWriteStream, type ReadStream } from "node:fs";
import { mkdir, readdir, rename, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { Readable, Transform } from "node:stream";
import { pipeline } from "node:stream/promises";
import type { ReadableStream as WebReadableStream } from "node:stream/web";

// Long enough for posts scheduled months ahead; the signature still blocks random access.
// The URL is written into the post when the file is uploaded and handed to Meta at publish
// time, so it cannot be shorter than the furthest a post can be scheduled.
export const MEDIA_URL_TTL_SECONDS = 60 * 60 * 24 * 365;

/** Storage per user (all uploads together). */
export const MEDIA_QUOTA_BYTES = 1024 * 1024 * 1024;

export class MediaTooLargeError extends Error {
  constructor() {
    super("Upload is larger than allowed");
  }
}

const CONTENT_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  mp4: "video/mp4",
  mov: "video/quicktime",
};

const KEY_RE = /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|jpeg|png|mp4|mov)$/i;

export function mediaStorageDir(): string {
  if (process.env.MEDIA_STORAGE_DIR) return process.env.MEDIA_STORAGE_DIR;
  // The production home server mounts /data; local Windows runs use the repo's data folder.
  return process.platform === "win32"
    ? path.join(process.cwd(), "data", "media")
    : "/data/poskoo-media";
}

export function mediaSecret(): string | null {
  return (
    process.env.MEDIA_URL_SECRET ||
    process.env.TOKEN_ENCRYPTION_KEY ||
    process.env.CRON_SECRET ||
    null
  );
}

export function mediaKeyFor(userId: string, ext: string): string {
  return `${userId}/${randomUUID()}.${ext}`;
}

/** Resolves a storage key to a file path, refusing anything outside the media directory. */
export function mediaFilePath(key: string): string | null {
  if (!KEY_RE.test(key)) return null;
  const base = path.resolve(mediaStorageDir());
  const full = path.resolve(base, key);
  if (!full.startsWith(base + path.sep)) return null;
  return full;
}

/** Bytes used by one user's uploads (0 when they have none). */
export async function userMediaUsage(userId: string): Promise<number> {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) return 0;
  const dir = path.join(path.resolve(mediaStorageDir()), userId);
  let names: string[];
  try {
    names = await readdir(dir);
  } catch {
    return 0;
  }
  let total = 0;
  for (const name of names) {
    try {
      const info = await stat(path.join(dir, name));
      if (info.isFile()) total += info.size;
    } catch {
      // removed meanwhile
    }
  }
  return total;
}

export function quotaMessage(usedBytes: number, quotaBytes = MEDIA_QUOTA_BYTES): string {
  const usedMb = Math.round(usedBytes / 1024 / 1024);
  const quotaMb = Math.round(quotaBytes / 1024 / 1024);
  return `Your media storage is full (${usedMb} MB of ${quotaMb} MB). Delete old drafts with uploads, or use a link to the file instead.`;
}

/**
 * Stream an upload to disk without holding it in memory. Writes to a temp file and renames it
 * when complete; aborts (and removes the temp file) once more than maxBytes arrive.
 */
export async function saveMediaStream(
  userId: string,
  body: WebReadableStream<Uint8Array> | ReadableStream<Uint8Array>,
  ext: string,
  maxBytes: number,
): Promise<{ key: string; size: number }> {
  const key = mediaKeyFor(userId, ext);
  const file = mediaFilePath(key);
  if (!file) throw new Error("Invalid media key");
  await mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.part`;
  let size = 0;
  const counter = new Transform({
    transform(chunk: Buffer, _enc, done) {
      size += chunk.length;
      if (size > maxBytes) done(new MediaTooLargeError());
      else done(null, chunk);
    },
  });
  try {
    await pipeline(Readable.fromWeb(body as WebReadableStream<Uint8Array>), counter, createWriteStream(tmp));
    if (size === 0) throw new Error("Empty upload");
    await rename(tmp, file);
  } catch (err) {
    await unlink(tmp).catch(() => undefined);
    throw err;
  }
  return { key, size };
}

export type ByteRange = { start: number; end: number };

/**
 * Parse a single "bytes=" Range header against a file size. Returns null when there is no
 * usable header (serve the whole file), or "unsatisfiable" for a range outside the file.
 * Multi-range requests are answered with the whole file.
 */
export function parseRange(header: string | null, size: number): ByteRange | null | "unsatisfiable" {
  if (!header) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m) return null;
  const [, a, b] = m;
  if (a === "" && b === "") return null;
  let start: number;
  let end: number;
  if (a === "") {
    const suffix = Number(b);
    if (suffix === 0) return "unsatisfiable";
    start = Math.max(0, size - suffix);
    end = size - 1;
  } else {
    start = Number(a);
    end = b === "" ? size - 1 : Math.min(Number(b), size - 1);
  }
  if (start >= size || start > end) return "unsatisfiable";
  return { start, end };
}

/** Size and type of a stored file, or null when it does not exist. */
export async function statMediaUpload(key: string): Promise<{ size: number; contentType: string } | null> {
  const file = mediaFilePath(key);
  if (!file) return null;
  try {
    const info = await stat(file);
    if (!info.isFile()) return null;
    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    return { size: info.size, contentType: CONTENT_TYPES[ext] ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

/** Stream a stored file (optionally one byte range) instead of reading it into memory. */
export function openMediaStream(key: string, range?: ByteRange | null): ReadStream | null {
  const file = mediaFilePath(key);
  if (!file) return null;
  return range ? createReadStream(file, { start: range.start, end: range.end }) : createReadStream(file);
}

/** Storage keys mentioned in a text (post media JSON, rule rows, ...). */
export function mediaKeysInText(text: string): string[] {
  const out: string[] = [];
  const re = /\/api\/media\/([0-9a-f-]{36}\/[0-9a-f-]{36}\.(?:jpg|jpeg|png|mp4|mov))/gi;
  for (const m of text.matchAll(re)) out.push(m[1].toLowerCase());
  return out;
}

/**
 * Delete uploads older than `olderThanDays` that no row of their owner mentions any more
 * (posts, ideas, automations, bio page, lead magnets, products). If any lookup fails for a
 * user, that user's files are left alone.
 */
export async function cleanupUnusedMedia(
  referencedTexts: (userId: string) => Promise<string[]>,
  olderThanDays = 30,
  nowMs = Date.now(),
): Promise<{ deleted: number; freedBytes: number }> {
  const base = path.resolve(mediaStorageDir());
  let users: string[];
  try {
    users = await readdir(base);
  } catch {
    return { deleted: 0, freedBytes: 0 };
  }
  const cutoff = nowMs - olderThanDays * 86_400_000;
  let deleted = 0;
  let freedBytes = 0;
  for (const userId of users) {
    if (!/^[0-9a-f-]{36}$/i.test(userId)) continue;
    const dir = path.join(base, userId);
    let names: string[];
    try {
      names = await readdir(dir);
    } catch {
      continue;
    }
    const old: { key: string; size: number }[] = [];
    for (const name of names) {
      const key = `${userId}/${name}`;
      const file = mediaFilePath(key);
      if (!file && !name.endsWith(".part")) continue;
      try {
        const info = await stat(path.join(dir, name));
        if (info.isFile() && info.mtimeMs < cutoff) old.push({ key, size: info.size });
      } catch {
        // gone
      }
    }
    if (old.length === 0) continue;
    let referenced: Set<string>;
    try {
      referenced = new Set((await referencedTexts(userId)).flatMap(mediaKeysInText));
    } catch {
      console.error("cleanupUnusedMedia: reference lookup failed for user", userId);
      continue;
    }
    for (const item of old) {
      if (referenced.has(item.key.toLowerCase())) continue;
      try {
        await unlink(path.join(base, item.key));
        deleted++;
        freedBytes += item.size;
      } catch {
        // already gone
      }
    }
  }
  return { deleted, freedBytes };
}

export function signMediaKey(key: string, expires: number, secret: string): string {
  return createHmac("sha256", secret).update(`${key}:${expires}`).digest("base64url");
}

export function verifyMediaSignatureWithSecret(
  key: string,
  expires: number,
  signature: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
): boolean {
  if (!secret || !Number.isFinite(expires) || expires < nowSeconds) return false;
  const expected = signMediaKey(key, expires, secret);
  const given = Buffer.from(signature);
  const want = Buffer.from(expected);
  return given.length === want.length && timingSafeEqual(given, want);
}

export function verifyMediaSignature(key: string, expires: number, signature: string): boolean {
  const secret = mediaSecret();
  return secret ? verifyMediaSignatureWithSecret(key, expires, signature, secret) : false;
}

/** Absolute public URL for a stored file, or null when no signing secret is configured. */
export function signedMediaUrl(
  key: string,
  baseUrl: string,
  ttlSeconds = MEDIA_URL_TTL_SECONDS,
): string | null {
  const secret = mediaSecret();
  if (!secret) return null;
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const signature = signMediaKey(key, expires, secret);
  return `${baseUrl.replace(/\/$/, "")}/api/media/${key}?exp=${expires}&sig=${signature}`;
}
