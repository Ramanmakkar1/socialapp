"use server";

// Admin → Posts actions: requireAdmin(), validated input, audit-logged.
import { revalidatePath } from "next/cache";
import { adminAudit, requireAdmin } from "@/lib/admin";
import { isUuid } from "@/lib/adminPaging";
import { isDbConfigured, query } from "@/lib/db";
import { retryFailedPost } from "@/lib/postRetry";
import type { AdminActionState } from "../ui/ActionForm";

/** Retries a failed post for its owner, through the same code path as the calendar's Retry. */
export async function retryPostAdminAction(_prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const postId = formData.get("postId");
  if (!isUuid(postId)) return { ok: false, message: "Invalid post." };
  if (!isDbConfigured()) return { ok: false, message: "Database not configured." };

  const rows = await query<{ user_id: string; email: string; status: string }>(
    "select p.user_id, u.email, p.status from socialapp.scheduled_posts p join socialapp.users u on u.id = p.user_id where p.id = $1",
    [postId],
  );
  const post = rows[0];
  if (!post) return { ok: false, message: "Post not found." };
  if (post.status !== "failed") return { ok: false, message: `Only failed posts can be retried (this one is ${post.status}).` };

  const result = await retryFailedPost(postId, post.user_id);
  await adminAudit(admin, "post.retry", { userId: post.user_id, email: post.email, details: { postId, ok: result.ok, error: result.ok ? undefined : result.error } });
  if (!result.ok) return { ok: false, message: result.error };
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/users/${post.user_id}`);
  return { ok: true, message: "Queued again: the publish job picks it up on its next run." };
}
