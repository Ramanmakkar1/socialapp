"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";

export async function duplicatePost(id: string): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { ok: false, error: "Invalid post." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const user = await requireUser();
  try {
    const rows = await query<{ id: string }>(
      "insert into socialapp.scheduled_posts (caption, media, user_id, scheduled_at, status, ig_format) select caption, media, user_id, null, 'draft', ig_format from socialapp.scheduled_posts where id=$1 and user_id=$2 returning id",
      [id, user.id],
    );
    if (!rows[0]) {
      return { ok: false, error: "Post not found." };
    }
    await query(
      "insert into socialapp.post_targets (post_id, platform, social_account_id, caption_override) select $2, platform, social_account_id, caption_override from socialapp.post_targets where post_id=$1",
      [id, rows[0].id],
    );
    revalidatePath("/app/calendar");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not duplicate post." };
  }
}
