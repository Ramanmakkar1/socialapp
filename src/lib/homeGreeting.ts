// Home welcome band: time-of-day greeting and the one-line status summary (pure, shared by server and client).

/** "Good morning" (5:00-11:59), "Good afternoon" (12:00-17:59), "Good evening" (18:00-4:59). */
export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 18) return "Good afternoon";
  return "Good evening";
}

const plural = (n: number, one: string, many: string) => `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;

/** Status parts from real counts, e.g. ["3 posts scheduled in the next 7 days", "2 Auto-DMs live", "9 comments waiting"]. */
export function homeStatusParts({ scheduledThisWeek, liveAutomations, commentsWaiting }: { scheduledThisWeek: number; liveAutomations: number; commentsWaiting: number }): string[] {
  return [
    scheduledThisWeek > 0 ? `${plural(scheduledThisWeek, "post", "posts")} scheduled in the next 7 days` : "No posts scheduled in the next 7 days",
    liveAutomations > 0 ? `${plural(liveAutomations, "Auto-DM", "Auto-DMs")} live` : "No Auto-DMs live",
    commentsWaiting > 0 ? `${plural(commentsWaiting, "comment", "comments")} waiting` : "Inbox clear",
  ];
}
