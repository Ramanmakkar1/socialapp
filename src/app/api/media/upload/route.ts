import { getCurrentUser } from "@/lib/auth";
import {
  MEDIA_QUOTA_BYTES,
  MediaTooLargeError,
  mediaSecret,
  quotaMessage,
  saveMediaStream,
  signedMediaUrl,
  userMediaUsage,
} from "@/lib/mediaStorage";
import { MEDIA_IMAGE_MAX_BYTES, MEDIA_VIDEO_MAX_BYTES, validateMediaFile } from "@/lib/mediaUpload";

export const runtime = "nodejs";

/**
 * Upload one image or video. Two request shapes:
 * - raw body (preferred, streamed straight to disk): Content-Type image/jpeg|png or video/mp4|quicktime,
 *   Content-Length, optional X-File-Name (URI-encoded);
 * - multipart/form-data with a "file" field (older clients).
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

  const validation = validateMediaFile({ type, size, name });
  if (!validation.ok || !body) {
    return Response.json({ error: validation.ok ? "Choose an image or video to upload." : validation.error }, { status: 400 });
  }

  const used = await userMediaUsage(user.id);
  if (used + size > MEDIA_QUOTA_BYTES) {
    return Response.json({ error: quotaMessage(used) }, { status: 413 });
  }
  const kindMax = validation.kind === "image" ? MEDIA_IMAGE_MAX_BYTES : MEDIA_VIDEO_MAX_BYTES;
  const maxBytes = Math.min(kindMax, MEDIA_QUOTA_BYTES - used);

  try {
    const { key } = await saveMediaStream(user.id, body, validation.ext, maxBytes);
    const url = signedMediaUrl(key, baseUrl);
    if (!url) {
      return Response.json({ error: "Could not create a media link." }, { status: 500 });
    }
    return Response.json({ ok: true, url, kind: validation.kind, name: name ?? "" });
  } catch (err) {
    if (err instanceof MediaTooLargeError) {
      return Response.json(
        { error: `${validation.kind === "image" ? "Images" : "Videos"} must be ${Math.round(kindMax / 1024 / 1024)} MB or smaller, and fit in your storage.` },
        { status: 413 },
      );
    }
    console.error("media upload failed", err instanceof Error ? err.message : err);
    return Response.json({ error: "Could not save the upload. Please try again." }, { status: 500 });
  }
}
