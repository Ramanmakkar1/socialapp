"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";

export async function retryPost(id: string): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { ok: false, error: "Invalid post." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const user = await requireUser();
  try {
    const rows = await query<{ id: string }>(
      "update scheduled_posts set status='scheduled', scheduled_at = greatest(coalesce(scheduled_at, now()), now()), updated_at = now() where id=$1 and user_id=$2 and status='failed' returning id",
      [id, user.id],
    );
    if (!rows[0]) {
      return { ok: false, error: "Post not found." };
    }
    await query(
      "update post_targets set status='pending', error=null where post_id=$1 and status='failed'",
      [id],
    );
    revalidatePath("/app/calendar");
    revalidatePath("/app");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not retry post." };
  }
}
