import { readMediaUpload, verifyMediaSignature } from "@/lib/mediaStorage";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: Promise<{ key: string[] }> },
) {
  const { key } = await context.params;
  const storageKey = key.join("/");
  const url = new URL(request.url);
  const expires = Number(url.searchParams.get("exp"));
  const signature = url.searchParams.get("sig") ?? "";

  if (!verifyMediaSignature(storageKey, expires, signature)) {
    return new Response("Not Found", { status: 404 });
  }

  const file = await readMediaUpload(storageKey);
  if (!file) {
    return new Response("Not Found", { status: 404 });
  }

  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.data.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Robots-Tag": "noindex",
    },
  });
}
