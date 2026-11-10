import { getCurrentUser } from "@/lib/auth";
import { mediaSecret, saveMediaUpload, signedMediaUrl } from "@/lib/mediaStorage";
import { validateMediaFile } from "@/lib/mediaUpload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  }

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

  const validation = validateMediaFile({ type: file.type, size: file.size, name: file.name });
  if (!validation.ok) {
    return Response.json({ error: validation.error }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  if (!mediaSecret()) {
    return Response.json(
      { error: "Media storage is not configured. Add MEDIA_URL_SECRET on the server." },
      { status: 500 },
    );
  }

  try {
    const data = Buffer.from(await file.arrayBuffer());
    const key = await saveMediaUpload(user.id, data, validation.ext);
    const url = signedMediaUrl(key, baseUrl);
    if (!url) {
      return Response.json({ error: "Could not create a media link." }, { status: 500 });
    }
    return Response.json({ ok: true, url, kind: validation.kind, name: file.name });
  } catch (err) {
    console.error("media upload failed", err instanceof Error ? err.message : err);
    return Response.json({ error: "Could not save the upload. Please try again." }, { status: 500 });
  }
}
