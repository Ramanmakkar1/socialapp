// Run once a day (same cron as send-dms, with x-cron-secret).
import { timingSafeEqual } from "node:crypto";
import { isDbConfigured } from "@/lib/db";
import { UNATTACHED_KEEP_DAYS } from "@/lib/mediaLimits";
import { mediaReferenceTexts, releasePublishedMediaSweep } from "@/lib/mediaLifecycle";
import { cleanupUnusedMedia } from "@/lib/mediaStorage";
import { refreshExpiringTokens } from "@/lib/tokenRefresh";

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
    const result = await refreshExpiringTokens();
    // Daily: remove uploads older than 7 days that no post, idea, automation, bio page,
    // lead magnet or product mentions any more, then catch up on published posts' files.
    let media = { deleted: 0, freedBytes: 0 };
    try {
      media = await cleanupUnusedMedia(mediaReferenceTexts, UNATTACHED_KEEP_DAYS);
      const swept = await releasePublishedMediaSweep(500);
      media = { deleted: media.deleted + swept.deleted, freedBytes: media.freedBytes + swept.freedBytes };
    } catch (err) {
      console.error("media cleanup failed", err instanceof Error ? err.message : err);
    }
    return Response.json({ status: "ok", ...result, mediaDeleted: media.deleted, mediaFreedBytes: media.freedBytes });
  } catch (err) {
    console.error("refresh-tokens job failed", err instanceof Error ? err.message : err);
    return Response.json({ status: "error" }, { status: 500 });
  }
}
