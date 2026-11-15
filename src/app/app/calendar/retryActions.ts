"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { isDbConfigured } from "@/lib/db";
import { retryFailedPost } from "@/lib/postRetry";

export async function retryPost(id: string): Promise<{ ok: boolean; error?: string }> {
  if (typeof id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
    return { ok: false, error: "Invalid post." };
  }
  if (!isDbConfigured()) {
    return { ok: false, error: "Database not configured" };
  }

  const user = await requireUser();
  const result = await retryFailedPost(id, user.id);
  if (!result.ok) return result;

  revalidatePath("/app/calendar");
  revalidatePath("/app");
  return { ok: true };
}
