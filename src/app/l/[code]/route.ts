import { connection } from "next/server";
import { isDbConfigured } from "@/lib/db";
import { resolveAndCount } from "@/lib/links";

function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim() || null;
  return request.headers.get("x-real-ip") ?? request.headers.get("cf-connecting-ip");
}

async function handle(request: Request, context: { params: Promise<{ code: string }> }) {
  await connection();
  const { code } = await context.params;
  if (!isDbConfigured()) {
    return new Response("Not Found", { status: 404 });
  }
  // HEAD requests and known crawlers / link-preview fetchers are redirected but not counted.
  const target = await resolveAndCount(code, {
    method: request.method,
    userAgent: request.headers.get("user-agent"),
    ip: clientIp(request),
  });
  if (
    !target ||
    (!target.startsWith("http://") && !target.startsWith("https://"))
  ) {
    return new Response("Not Found", { status: 404 });
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: target,
      "X-Robots-Tag": "noindex",
    },
  });
}

export const GET = handle;
export const HEAD = handle;
