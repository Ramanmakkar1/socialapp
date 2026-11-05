"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getPool, isDbConfigured } from "@/lib/db";

export async function duplicatePost(id: string): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { ok: false, error: "Invalid post." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const user = await requireUser();
  try {
    const client = await getPool().connect();
    try {
      await client.query("begin");
      const result = await client.query<{ id: string }>(
        "insert into socialapp.scheduled_posts (caption, media, user_id, scheduled_at, status, ig_format, first_comment, dm_rule_id) select caption, media, user_id, null, 'draft', ig_format, first_comment, dm_rule_id from socialapp.scheduled_posts where id=$1 and user_id=$2 returning id",
        [id, user.id],
      );
      if (!result.rows[0]) {
        await client.query("rollback");
        return { ok: false, error: "Post not found." };
      }
      await client.query(
        "insert into socialapp.post_targets (post_id, platform, social_account_id, caption_override, status, external_post_id, error, published_at, insights, insights_at) select $2, platform, social_account_id, caption_override, 'pending', null, null, null, null, null from socialapp.post_targets where post_id=$1",
        [id, result.rows[0].id],
      );
      await client.query("commit");
    } catch (error) {
      await client.query("rollback").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  } catch {
    return { ok: false, error: "Could not duplicate post." };
  }
  revalidatePath("/app/calendar");
  return { ok: true };
}
