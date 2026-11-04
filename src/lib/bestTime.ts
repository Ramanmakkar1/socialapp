function formatHour12(hour: number): string {
  const h = hour % 24;
  if (h === 0) return "12 AM";
  if (h === 12) return "12 PM";
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}

function hourRangeLabel(hour: number): string {
  const next = (hour + 1) % 24;
  return `${formatHour12(hour)}–${formatHour12(next)}`;
}

export function hourBars(rows: { hour: number; count: number }[]): number[] {
  const bars = Array.from({ length: 24 }, () => 0);
  for (const row of rows) {
    if (row.hour >= 0 && row.hour <= 23) {
      bars[row.hour] = row.count;
    }
  }
  return bars;
}

export function topHours(
  rows: { hour: number; count: number }[],
  take = 3
): { hour: number; count: number; label: string }[] {
  const byHour = Array.from({ length: 24 }, (_, hour) => {
    const match = rows.find((r) => r.hour === hour);
    return { hour, count: match?.count ?? 0 };
  });

  return byHour
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count || a.hour - b.hour)
    .slice(0, take)
    .map((row) => ({ ...row, label: hourRangeLabel(row.hour) }));
}
