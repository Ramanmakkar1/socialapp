// Small display helpers for the admin pages (server side; UTC so every admin sees the same times).

export function fmtDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";
}

export function fmtDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" });
}

/** "5 min ago", "3 h ago", "12 d ago"; future times read "in 3 h". */
export function ago(value: Date | string | null | undefined, now = Date.now()): string {
  if (!value) return "never";
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return "—";
  const diff = now - t;
  const future = diff < 0;
  const min = Math.round(Math.abs(diff) / 60000);
  const text = min < 1 ? "just now" : min < 60 ? `${min} min` : min < 60 * 48 ? `${Math.round(min / 60)} h` : `${Math.round(min / 1440)} d`;
  if (text === "just now") return text;
  return future ? `in ${text}` : `${text} ago`;
}

export function num(n: number | null | undefined): string {
  return (n ?? 0).toLocaleString("en-US");
}
