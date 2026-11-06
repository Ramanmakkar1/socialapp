"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { scheduledPostLimitError } from "@/lib/planLimits";
import { reschedulePostForUser, UUID_RE } from "@/lib/postMutations";

export async function reschedulePost(
  id: string,
  dateKey: string,
): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || !UUID_RE.test(id)) {
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
    // Moving a scheduled post into another month must respect that month's plan limit.
    const result = await reschedulePostForUser(id, user.id, dateKey, (next, state) =>
      state.status === "scheduled" ? scheduledPostLimitError(user.id, next, id) : Promise.resolve(null));
    if (!result.ok) return result;
    revalidatePath("/app/calendar");
    revalidatePath("/app");
    return { ok: true };
  } catch (err) {
    console.error("reschedulePost failed", id, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not move post." };
  }
}
