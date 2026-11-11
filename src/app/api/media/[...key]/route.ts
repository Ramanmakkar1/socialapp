import { Readable } from "node:stream";
import { openMediaStream, parseRange, statMediaUpload, verifyMediaSignature } from "@/lib/mediaStorage";

export const runtime = "nodejs";

async function serve(request: Request, context: { params: Promise<{ key: string[] }> }, head: boolean) {
  const { key } = await context.params;
  const storageKey = key.join("/");
  const url = new URL(request.url);
  const expires = Number(url.searchParams.get("exp"));
  const signature = url.searchParams.get("sig") ?? "";

  if (!verifyMediaSignature(storageKey, expires, signature)) {
    return new Response("Not Found", { status: 404 });
  }

  const info = await statMediaUpload(storageKey);
  if (!info) return new Response("Not Found", { status: 404 });
  const { size, contentType } = info;

  const baseHeaders: Record<string, string> = {
    "Content-Type": contentType,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Robots-Tag": "noindex",
  };

  const range = parseRange(request.headers.get("range"), size);
  if (range === "unsatisfiable") {
    return new Response(null, { status: 416, headers: { ...baseHeaders, "Content-Range": `bytes */${size}` } });
  }

  const status = range ? 206 : 200;
  const length = range ? range.end - range.start + 1 : size;
  const headers: Record<string, string> = { ...baseHeaders, "Content-Length": String(length) };
  if (range) headers["Content-Range"] = `bytes ${range.start}-${range.end}/${size}`;
  if (head || size === 0) return new Response(null, { status, headers });

  const stream = openMediaStream(storageKey, range);
  if (!stream) return new Response("Not Found", { status: 404 });
  return new Response(Readable.toWeb(stream) as ReadableStream<Uint8Array>, { status, headers });
}

export function GET(request: Request, context: { params: Promise<{ key: string[] }> }) {
  return serve(request, context, false);
}

export function HEAD(request: Request, context: { params: Promise<{ key: string[] }> }) {
  return serve(request, context, true);
}
