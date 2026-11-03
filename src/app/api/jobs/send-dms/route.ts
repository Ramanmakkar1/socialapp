import { timingSafeEqual } from "node:crypto";
import { isDbConfigured } from "@/lib/db";
import { sendDueDms } from "@/lib/sender";

function secretMatches(given: string | null, expected: string): boolean {
  if (!given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected || !secretMatches(request.headers.get("x-cron-secret"), expected)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return Response.json({ status: "not_configured" });
  }
  try {
    const result = await sendDueDms();
    return Response.json({ status: "ok", ...result });
  } catch (err) {
    console.error("send-dms job failed", err instanceof Error ? err.message : err);
    return Response.json({ status: "error" }, { status: 500 });
  }
}
