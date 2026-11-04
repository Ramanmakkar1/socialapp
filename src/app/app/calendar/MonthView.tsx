type MonthViewPost = {
  id: string;
  caption: string;
  scheduled_at: Date | string | null;
  status: string;
  platforms: string[];
};

type MonthViewProps = {
  posts: MonthViewPost[];
  monthStart: Date;
  prevHref: string;
  nextHref: string;
};

const MAX_CHIPS = 3;
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function utcDateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatTimeUtc(at: Date | string): string {
  const d = typeof at === "string" ? new Date(at) : at;
  const h = d.getUTCHours().toString().padStart(2, "0");
  const m = d.getUTCMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function captionPreview(caption: string): string {
  return caption.trim().slice(0, 30);
}

function chipColor(status: string): string {
  switch (status) {
    case "failed":
      return "text-brand-2";
    case "published":
      return "text-ok";
    case "draft":
      return "text-muted";
    default:
      return "text-ink-2";
  }
}

export default function MonthView({ posts, monthStart, prevHref, nextHref }: MonthViewProps) {
  const todayKey = utcDateKey(new Date());
  const month = monthStart.getUTCMonth();
  const byDay = new Map<string, MonthViewPost[]>();

  for (const post of posts) {
    if (!post.scheduled_at) continue;
    const key = utcDateKey(new Date(post.scheduled_at));
    const list = byDay.get(key);
    if (list) list.push(post);
    else byDay.set(key, [post]);
  }

  // Grid starts on the Monday on/before the 1st and ends on the Sunday on/after the last day.
  const gridStart = new Date(monthStart);
  const startDow = gridStart.getUTCDay();
  gridStart.setUTCDate(gridStart.getUTCDate() - (startDow === 0 ? 6 : startDow - 1));

  const monthEnd = new Date(Date.UTC(monthStart.getUTCFullYear(), month + 1, 0));
  const gridEnd = new Date(monthEnd);
  const endDow = gridEnd.getUTCDay();
  gridEnd.setUTCDate(gridEnd.getUTCDate() + (endDow === 0 ? 0 : 7 - endDow));

  const days: Date[] = [];
  for (let d = new Date(gridStart); d <= gridEnd; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push(new Date(d));
  }

  const monthLabel = monthStart.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const navClass =
    "rounded-full border border-line px-3 py-1.5 text-sm hover:bg-surface-2";

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">{monthLabel}</p>
        <div className="flex flex-wrap gap-2">
          <a href={prevHref} className={navClass}>
            ← Previous
          </a>
          <a href={nextHref} className={navClass}>
            Next →
          </a>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="grid min-w-[640px] grid-cols-7 gap-2">
          {WEEKDAYS.map((name) => (
            <p key={name} className="px-1 text-xs font-medium text-muted">
              {name}
            </p>
          ))}
          {days.map((day) => {
            const key = utcDateKey(day);
            const dayPosts = byDay.get(key) ?? [];
            const inMonth = day.getUTCMonth() === month;
            const isToday = key === todayKey;
            const extra = dayPosts.length - MAX_CHIPS;

            return (
              <div
                key={key}
                className={`min-h-24 rounded-2xl border bg-surface p-2 ${isToday ? "border-brand" : "border-line"} ${inMonth ? "" : "opacity-60"}`}
              >
                <p className={`text-xs ${inMonth ? "text-ink" : "text-muted"}`}>
                  {day.getUTCDate()}
                </p>
                <div className="mt-1 space-y-1">
                  {dayPosts.slice(0, MAX_CHIPS).map((post) => (
                    <span
                      key={post.id}
                      className={`block truncate rounded-lg bg-surface-2 px-2 py-1 text-xs ${chipColor(post.status)}`}
                      title={post.caption}
                    >
                      {formatTimeUtc(post.scheduled_at!)} {captionPreview(post.caption)}
                    </span>
                  ))}
                  {extra > 0 ? <p className="px-1 text-xs text-muted">+{extra} more</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
