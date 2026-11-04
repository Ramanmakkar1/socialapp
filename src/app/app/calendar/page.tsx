import Composer from "./Composer";
import PostList, { type Post } from "./PostList";
import { requireUser } from "@/lib/auth";
import { isDbConfigured, query } from "@/lib/db";

export const metadata = { title: "Calendar" };

export default async function CalendarPage() {
  let rows: Post[] = [];
  if (isDbConfigured()) {
    const user = await requireUser();
    try {
      rows = await query<Post>(
        "select p.id, p.caption, p.scheduled_at, p.status, coalesce(array_agg(t.platform order by t.platform) filter (where t.platform is not null), '{}') as platforms from scheduled_posts p left join post_targets t on t.post_id = p.id where p.user_id = $1 and p.status <> 'published' group by p.id order by p.scheduled_at nulls last, p.created_at desc limit 50",
        [user.id],
      );
    } catch {
      rows = [];
    }
  }

  return (
    <>
      <div><h1 className="text-2xl font-semibold">Calendar</h1><p className="text-sm text-muted">Plan posts for Instagram, Facebook and Threads.</p></div>
      <Composer />
      <PostList posts={rows} />
    </>
  );
}
