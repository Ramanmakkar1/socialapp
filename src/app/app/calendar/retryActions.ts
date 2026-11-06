"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { getPool, isDbConfigured } from "@/lib/db";
import { scheduledPostLimitError } from "@/lib/planLimits";

export async function retryPost(id: string): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { ok: false, error: "Invalid post." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const user = await requireUser();
  try {
    // A failed post does not count toward the monthly limit; retrying puts it back in the queue.
    const limitError = await scheduledPostLimitError(user.id, new Date(), id);
    if (limitError) return { ok: false, error: limitError };
  } catch (err) {
    console.error("retryPost: plan limit check failed", id, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not retry post." };
  }
  let client;
  try {
    client = await getPool().connect();
  } catch {
    return { ok: false, error: "Could not retry post." };
  }

  try {
    await client.query("begin");

    const postRes = await client.query<{ id: string }>(
      "update scheduled_posts set status='scheduled', scheduled_at = greatest(coalesce(scheduled_at, now()), now()), updated_at = now() where id=$1 and user_id=$2 and status='failed' returning id",
      [id, user.id],
    );
    if (!postRes.rows[0]) {
      await client.query("rollback");
      return { ok: false, error: "Post not found." };
    }

    const targetRes = await client.query<{ id: string }>(
      "update post_targets set status='pending', error=null where post_id=$1 and status='failed' returning id",
      [id],
    );
    if (targetRes.rowCount === 0) {
      await client.query("rollback");
      return { ok: false, error: "Could not retry post." };
    }

    await client.query("commit");
  } catch {
    await client.query("rollback").catch(() => {});
    return { ok: false, error: "Could not retry post." };
  } finally {
    client.release();
  }

  revalidatePath("/app/calendar");
  revalidatePath("/app");
  return { ok: true };
}
