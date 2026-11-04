import { isDbConfigured } from "@/lib/db";
import { resolveAndCount } from "@/lib/links";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ code: string }> },
) {
  const { code } = await context.params;
  if (!isDbConfigured()) {
    return new Response("Not Found", { status: 404 });
  }
  const target = await resolveAndCount(code);
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
