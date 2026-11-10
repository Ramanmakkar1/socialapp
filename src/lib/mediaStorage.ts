// Server-only media storage for the composer. Files live on the home server (under /data by
// default) and are served through short-lived signed URLs so Meta can fetch them for publishing.
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Long enough for posts scheduled months ahead; the signature still blocks random access.
export const MEDIA_URL_TTL_SECONDS = 60 * 60 * 24 * 365;

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

export async function saveMediaUpload(userId: string, data: Buffer, ext: string): Promise<string> {
  const key = mediaKeyFor(userId, ext);
  const file = mediaFilePath(key);
  if (!file) throw new Error("Invalid media key");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
  return key;
}

export async function readMediaUpload(
  key: string,
): Promise<{ data: Buffer; contentType: string } | null> {
  const file = mediaFilePath(key);
  if (!file) return null;
  try {
    const data = await readFile(file);
    const ext = key.split(".").pop()?.toLowerCase() ?? "";
    return { data, contentType: CONTENT_TYPES[ext] ?? "application/octet-stream" };
  } catch {
    return null;
  }
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
