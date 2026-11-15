// Admin → Posts: recent posts across all users (or one user), with each network target's status
// and error. Read-only queries; the retry action lives in src/app/admin/posts/actions.ts and
// reuses retryFailedPost (src/lib/postRetry.ts), the same code path as the calendar's Retry.
import { query } from "@/lib/db";
import { ADMIN_PAGE_SIZE, pageSlice, pageWindow } from "@/lib/adminPaging";

/** scheduled_posts.status values (001_init.sql check constraint). */
export const POST_STATUSES = ["failed", "publishing", "scheduled", "published", "draft"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];

export type AdminPostTarget = { platform: string; status: string; error: string | null; publishedAt: string | null };
export type AdminPostRow = {
  id: string;
  user_id: string;
  email: string;
  caption: string | null;
  status: string;
  scheduled_at: Date | null;
  updated_at: Date;
  targets: AdminPostTarget[];
};

export type PostFilter = { userId?: string | null; status?: PostStatus | ""; network?: string; page: number; pageSize?: number };

// Newest activity first (updated_at). The network filter goes through post_targets' unique
// (post_id, platform) index; targets are aggregated per post on the page only.
export const ADMIN_POSTS_SQL = `
  select p.id, p.user_id, u.email, left(p.caption, 160) as caption, p.status, p.scheduled_at, p.updated_at,
         coalesce((select json_agg(json_build_object('platform', t.platform, 'status', t.status, 'error', t.error, 'publishedAt', t.published_at) order by t.platform)
                   from socialapp.post_targets t where t.post_id = p.id), '[]'::json) as targets
    from socialapp.scheduled_posts p
    join socialapp.users u on u.id = p.user_id
   where ($1::uuid is null or p.user_id = $1::uuid)
     and ($2::text is null or p.status = $2::text)
     and ($3::text is null or exists (select 1 from socialapp.post_targets f where f.post_id = p.id and f.platform = $3::text))
   order by p.updated_at desc, p.id
   limit $4 offset $5`;

export async function listAdminPosts(f: PostFilter): Promise<{ rows: AdminPostRow[]; hasNext: boolean }> {
  const size = f.pageSize ?? ADMIN_PAGE_SIZE;
  const { limit, offset } = pageWindow(f.page, size);
  const rows = await query<AdminPostRow>(ADMIN_POSTS_SQL, [f.userId || null, f.status || null, f.network || null, limit, offset]);
  return pageSlice(rows, size);
}
