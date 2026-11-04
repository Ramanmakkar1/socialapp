type WeekViewPost = {
  id: string;
  caption: string;
  scheduled_at: Date | string | null;
  status: string;
  platforms: string[];
};

type WeekViewProps = {
  posts: WeekViewPost[];
  weekStart: Date;
  prevHref: string;
  nextHref: string;
};

function utcDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  return `${fmt(weekStart)} – ${fmt(weekEnd)}`;
}

function formatTimeUtc(at: Date | string): string {
  const d = typeof at === "string" ? new Date(at) : at;
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function captionPreview(caption: string): string {
  return caption.trim().slice(0, 40);
}

export default function WeekView({ posts, weekStart, prevHref, nextHref }: WeekViewProps) {
  const todayKey = utcDateKey(new Date());
  const byDay = new Map<string, WeekViewPost[]>();

  for (const post of posts) {
    if (!post.scheduled_at) continue;
    const key = utcDateKey(new Date(post.scheduled_at));
    const list = byDay.get(key);
    if (list) list.push(post);
    else byDay.set(key, [post]);
  }

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setUTCDate(d.getUTCDate() + i);
    days.push(d);
  }

  const navClass =
    "rounded-full border border-line px-3 py-1.5 text-sm hover:bg-surface-2";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">{formatWeekRange(weekStart)}</p>
        <div className="flex flex-wrap gap-2">
          <a href={prevHref} className={navClass}>
            ← Previous
          </a>
          <a href={nextHref} className={navClass}>
            Next →
          </a>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
        {days.map((day) => {
          const key = utcDateKey(day);
          const dayPosts = byDay.get(key) ?? [];
          const isToday = key === todayKey;
          const weekday = day.toLocaleDateString("en-US", {
            weekday: "short",
            timeZone: "UTC",
          });
          const dateLabel = day.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "UTC",
          });

          return (
            <div
              key={key}
              className={`min-h-28 rounded-2xl border bg-surface p-3 ${isToday ? "border-brand" : "border-line"}`}
            >
              <p className="text-xs text-muted">
                {weekday} · {dateLabel}
              </p>
              <div className="mt-2 space-y-1">
                {dayPosts.length === 0 ? (
                  <p className="text-xs text-muted">—</p>
                ) : (
                  dayPosts.map((post) => (
                    <span
                      key={post.id}
                      className={`block truncate rounded-lg bg-surface-2 px-2 py-1 text-xs ${
                        post.status === "failed" ? "text-brand-2" : "text-ink-2"
                      }`}
                      title={post.caption}
                    >
                      {formatTimeUtc(post.scheduled_at!)} {captionPreview(post.caption)}
                    </span>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
