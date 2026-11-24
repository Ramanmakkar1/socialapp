"use server";

import { revalidatePath } from "next/cache";

import { isDbConfigured } from "@/lib/db";
import { scheduledPostLimitError } from "@/lib/planLimits";
import { reschedulePostForUser, reschedulePostToInstantForUser, UUID_RE } from "@/lib/postMutations";
import { asOwnerUser, requireWorkspace } from "@/lib/workspace";
import { approvalBlock } from "@/lib/team";

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

  const ctx = await requireWorkspace();
  const blocked = approvalBlock(ctx);
  if (blocked) return { ok: false, error: blocked };
  const user = asOwnerUser(ctx);
  try {
    // Moving a scheduled post into another month must respect that month's plan limit.
    const result = await reschedulePostForUser(id, user.id, dateKey, (next, state) =>
      state.status === "scheduled" ? scheduledPostLimitError(user.id, next, id) : Promise.resolve(null));
    if (!result.ok) return result;
    revalidatePath("/app/publish");
    revalidatePath("/app");
    return { ok: true };
  } catch (err) {
    console.error("reschedulePost failed", id, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not move post." };
  }
}

/** Week grid: move a draft / scheduled post to an exact time (ISO instant), same guards and plan limit. */
export async function reschedulePostAt(
  id: string,
  iso: string,
): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || !UUID_RE.test(id)) {
    return { ok: false, error: "Invalid post." };
  }
  if (typeof iso !== "string" || iso.length > 40) {
    return { ok: false, error: "Invalid time." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const ctx = await requireWorkspace();
  const blocked = approvalBlock(ctx);
  if (blocked) return { ok: false, error: blocked };
  const user = asOwnerUser(ctx);
  try {
    const result = await reschedulePostToInstantForUser(id, user.id, iso, (next, state) =>
      state.status === "scheduled" ? scheduledPostLimitError(user.id, next, id) : Promise.resolve(null));
    if (!result.ok) return result;
    revalidatePath("/app/publish");
    revalidatePath("/app");
    return { ok: true };
  } catch (err) {
    console.error("reschedulePostAt failed", id, err instanceof Error ? err.message : err);
    return { ok: false, error: "Could not move post." };
  }
}
