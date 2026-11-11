import { getCurrentUser } from "@/lib/auth";
import { pendingMediaUsage } from "@/lib/mediaLifecycle";
import { PLAN_MEDIA_LIMITS, checkMediaForTargets, formatBytes, pendingQuotaMessage } from "@/lib/mediaLimits";
import { probeVideoDurationSec } from "@/lib/mediaProbe";
import {
  DISK_FULL_MESSAGE,
  MediaTooLargeError,
  THUMB_MAX_BYTES,
  deleteMediaKeys,
  diskDecision,
  isThumbKey,
  mediaDiskSpace,
  mediaFilePath,
  mediaSecret,
  minFreeBytes,
  saveMediaStream,
  signedMediaUrl,
  statMediaUpload,
  thumbKeyFor,
} from "@/lib/mediaStorage";
import { validateMediaFile } from "@/lib/mediaUpload";
import { planForUser } from "@/lib/planLimits";

export const runtime = "nodejs";

/**
 * Upload one image or video. Two request shapes:
 * - raw body (preferred, streamed straight to disk): Content-Type image/jpeg|png or video/mp4|quicktime,
 *   Content-Length, optional X-File-Name (URI-encoded);
 * - multipart/form-data with a "file" field (older clients).
 * Optional headers: X-Networks (comma list of the selected networks) and X-Ig-Format (feed|story)
 * so the file is checked against every selected network's limits (src/lib/mediaLimits.ts).
 * X-Thumb-For: <key of an upload> stores a small JPEG poster for that upload instead (kept after
 * the upload itself is deleted on publish, so published posts still show a picture).
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  if (!mediaSecret()) {
    return Response.json(
      { error: "Media storage is not configured. Add MEDIA_URL_SECRET on the server." },
      { status: 500 },
    );
  }

  const contentType = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  const isRaw = contentType.startsWith("image/") || contentType.startsWith("video/");

  let type: string;
  let size: number;
  let name: string | undefined;
  let body: ReadableStream<Uint8Array> | null;
  if (isRaw) {
    type = contentType;
    size = Number(request.headers.get("content-length") ?? NaN);
    try {
      name = decodeURIComponent(request.headers.get("x-file-name") ?? "") || undefined;
    } catch {
      name = undefined;
    }
    body = request.body;
  } else {
    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return Response.json({ error: "Could not read the upload." }, { status: 400 });
    }
    const file = form.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "Choose an image or video to upload." }, { status: 400 });
    }
    type = file.type;
    size = file.size;
    name = file.name;
    body = file.stream();
  }

  // Poster for an upload made a moment ago (generated in the browser, never transcoded here).
  const thumbFor = (request.headers.get("x-thumb-for") ?? "").trim().toLowerCase();
  if (thumbFor) {
    if (type !== "image/jpeg" || !body || !(size > 0) || size > THUMB_MAX_BYTES) {
      return Response.json({ error: "Poster must be a small JPEG." }, { status: 400 });
    }
    if (!mediaFilePath(thumbFor) || isThumbKey(thumbFor) || !thumbFor.startsWith(`${user.id.toLowerCase()}/`) || !(await statMediaUpload(thumbFor))) {
      return Response.json({ error: "Upload not found." }, { status: 404 });
    }
    try {
      const thumbKey = thumbKeyFor(thumbFor);
      await saveMediaStream(user.id, body, "jpg", THUMB_MAX_BYTES, thumbKey);
      return Response.json({ ok: true, thumbUrl: signedMediaUrl(thumbKey, baseUrl) });
    } catch {
      return Response.json({ error: "Could not save the poster." }, { status: 400 });
    }
  }

  const plan = await planForUser(user.id);
  const validation = validateMediaFile({ type, size, name }, plan);
  if (!validation.ok || !body) {
    return Response.json({ error: validation.ok ? "Choose an image or video to upload." : validation.error }, { status: 400 });
  }
  const platforms = (request.headers.get("x-networks") ?? "").split(",").map((p) => p.trim().toLowerCase()).filter(Boolean).slice(0, 12);
  const igFormat = request.headers.get("x-ig-format") === "story" ? "story" : "feed";
  const precheck = checkMediaForTargets({ kind: validation.kind, type, size }, { plan, platforms, igFormat });
  if (precheck.errors.length > 0) {
    return Response.json({ error: precheck.errors[0], errors: precheck.errors }, { status: 400 });
  }

  // Disk safety: keep MEDIA_MIN_FREE_GB free on the media disk.
  const disk = await mediaDiskSpace();
  if (disk) {
    const decision = diskDecision(disk.freeBytes, size, minFreeBytes());
    if (decision === "refuse") {
      console.error(`media upload refused: only ${formatBytes(disk.freeBytes)} free on the media disk`);
      return Response.json({ error: DISK_FULL_MESSAGE }, { status: 503, headers: { "Retry-After": "3600" } });
    }
    if (decision === "warn") console.warn(`media disk is getting full: ${formatBytes(disk.freeBytes)} free`);
  }

  // Quota: only files waiting to be posted count.
  const quota = PLAN_MEDIA_LIMITS[plan].pendingBytes;
  const used = await pendingMediaUsage(user.id).catch(() => 0);
  if (used + size > quota) {
    return Response.json({ error: pendingQuotaMessage(used, plan) }, { status: 413 });
  }
  const kindMax = validation.kind === "image" ? PLAN_MEDIA_LIMITS[plan].imageBytes : PLAN_MEDIA_LIMITS[plan].videoBytes;
  const maxBytes = Math.min(kindMax, quota - used);

  try {
    const { key } = await saveMediaStream(user.id, body, validation.ext, maxBytes);
    let durationSec: number | null = null;
    if (validation.kind === "video") {
      const file = mediaFilePath(key);
      durationSec = file ? await probeVideoDurationSec(file) : null;
      const after = checkMediaForTargets({ kind: "video", type, size, durationSec }, { plan, platforms, igFormat });
      if (after.errors.length > 0) {
        await deleteMediaKeys([key]);
        return Response.json({ error: after.errors[0], errors: after.errors }, { status: 400 });
      }
    }
    const url = signedMediaUrl(key, baseUrl);
    if (!url) {
      return Response.json({ error: "Could not create a media link." }, { status: 500 });
    }
    return Response.json({ ok: true, url, key, kind: validation.kind, name: name ?? "", durationSec });
  } catch (err) {
    if (err instanceof MediaTooLargeError) {
      return Response.json(
        { error: `This file is bigger than ${formatBytes(maxBytes)}, the most that fits your plan and storage right now.` },
        { status: 413 },
      );
    }
    console.error("media upload failed", err instanceof Error ? err.message : err);
    return Response.json({ error: "Could not save the upload. Please try again." }, { status: 500 });
  }
}
