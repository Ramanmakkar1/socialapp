"use server";

import { revalidatePath } from "next/cache";

import { isDbConfigured } from "@/lib/db";
import { retryFailedPost, retryWaitingNow } from "@/lib/postRetry";
import { asOwnerUser, requireWorkspace } from "@/lib/workspace";
import { approvalBlock } from "@/lib/team";

export async function retryPost(id: string): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { ok: false, error: "Invalid post." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const ctx = await requireWorkspace();
  const blocked = approvalBlock(ctx);
  if (blocked) return { ok: false, error: blocked };
  const user = asOwnerUser(ctx);
  const result = await retryFailedPost(id, user.id);
  // Not failed? It may be waiting for an automatic retry: "Retry now" brings that attempt forward.
  if (!result.ok && !(await retryWaitingNow(id, user.id).catch(() => false))) return result;

  revalidatePath("/app/publish");
  revalidatePath("/app");
  return { ok: true };
}
