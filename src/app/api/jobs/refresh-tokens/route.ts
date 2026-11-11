// Run once a day (same cron as send-dms, with x-cron-secret).
import { timingSafeEqual } from "node:crypto";
import { isDbConfigured, query } from "@/lib/db";
import { cleanupUnusedMedia } from "@/lib/mediaStorage";
import { refreshExpiringTokens } from "@/lib/tokenRefresh";

// Every row of a user that can hold an uploaded media URL. Rows are read as JSON text and
// scanned for /api/media/<key>; a failing query skips that user's cleanup.
const MEDIA_REFERENCE_SQL = [
  "select media::text as t from socialapp.scheduled_posts where user_id=$1",
  "select to_jsonb(x)::text as t from socialapp.ideas x where user_id=$1",
  "select to_jsonb(x)::text as t from socialapp.dm_rules x where user_id=$1",
  "select to_jsonb(x)::text as t from socialapp.bio_pages x where user_id=$1",
  "select to_jsonb(x)::text as t from socialapp.lead_magnets x where user_id=$1",
  "select to_jsonb(x)::text as t from socialapp.products x where user_id=$1",
];

async function mediaReferenceTexts(userId: string): Promise<string[]> {
  const out: string[] = [];
  for (const sql of MEDIA_REFERENCE_SQL) {
    const rows = await query<{ t: string | null }>(sql, [userId]);
    for (const r of rows) if (r.t && r.t.includes("/api/media/")) out.push(r.t);
  }
  return out;
}

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
    // Daily: remove uploads older than 30 days that no post, idea, automation, bio page,
    // lead magnet or product mentions any more.
    let media = { deleted: 0, freedBytes: 0 };
    try {
      media = await cleanupUnusedMedia(mediaReferenceTexts);
    } catch (err) {
      console.error("media cleanup failed", err instanceof Error ? err.message : err);
    }
    return Response.json({ status: "ok", ...result, mediaDeleted: media.deleted, mediaFreedBytes: media.freedBytes });
  } catch (err) {
    console.error("refresh-tokens job failed", err instanceof Error ? err.message : err);
    return Response.json({ status: "error" }, { status: 500 });
  }
}
