"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";

export async function reschedulePost(
  id: string,
  dateKey: string,
): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || id.trim() === "") {
    return { ok: false, error: "Invalid post." };
  }
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    return { ok: false, error: "Invalid day." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const user = await requireUser();
  try {
    const rows = await query<{ scheduled_at: Date | string | null; status: string }>(
      "select scheduled_at, status from socialapp.scheduled_posts where id=$1 and user_id=$2",
      [id, user.id],
    );
    const post = rows[0];
    if (!post) {
      return { ok: false, error: "Post not found" };
    }
    if (post.status !== "scheduled" && post.status !== "draft") {
      return { ok: false, error: "Only scheduled posts can be moved" };
    }

    let hours = 12;
    let minutes = 0;
    if (post.scheduled_at) {
      const old = new Date(post.scheduled_at);
      if (!Number.isNaN(old.getTime())) {
        hours = old.getUTCHours();
        minutes = old.getUTCMinutes();
      }
    }
    const [y, mo, d] = dateKey.split("-").map(Number);
    const next = new Date(Date.UTC(y, mo - 1, d, hours, minutes));
    if (Number.isNaN(next.getTime()) || next.toISOString().slice(0, 10) !== dateKey) {
      return { ok: false, error: "Invalid day." };
    }
    if (next.getTime() <= Date.now()) {
      return { ok: false, error: "Pick a day in the future" };
    }

    await query(
      "update socialapp.scheduled_posts set scheduled_at=$3, updated_at=now() where id=$1 and user_id=$2",
      [id, user.id, next.toISOString()],
    );
    revalidatePath("/app/calendar");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not move post." };
  }
}
