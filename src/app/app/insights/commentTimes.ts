import { isDbConfigured, query } from "@/lib/db";

export type CommentTimeCell = { dow: number; hour: number; count: number };

/** Comment (dm_queue) counts per UTC ISO weekday + hour, last 30 days; the chart shifts them to the browser zone. */
export async function getCommentTimeCells(userId: string): Promise<CommentTimeCell[]> {
  if (!isDbConfigured()) return [];
  try {
    return await query<CommentTimeCell>(
      `select extract(isodow from created_at at time zone 'UTC')::int as dow,
         extract(hour from created_at at time zone 'UTC')::int as hour,
         count(*)::int as count
       from socialapp.dm_queue
       where user_id = $1 and created_at > now() - interval '30 days'
       group by 1, 2`,
      [userId],
    );
  } catch {
    return [];
  }
}
