import assert from "node:assert/strict";
import { test } from "node:test";
import { utcDateForLocalDay, weekMonthLabel, zonedParts } from "./calendarUtils.ts";

test("reschedule picker: a local day maps to the UTC date that keeps the local time", () => {
  // 2026-11-12 03:30 UTC is the evening of Nov 11 in Edmonton.
  const at = "2026-11-12T03:30:00Z";
  const tz = "America/Edmonton";
  assert.equal(zonedParts(at, tz).key, "2026-11-11");
  const utcDay = utcDateForLocalDay(at, "2026-11-14", tz);
  assert.equal(utcDay, "2026-11-15");
  // The server keeps the UTC time of day, so the moved post lands on Nov 14 at the same local time.
  const before = zonedParts(at, tz);
  const moved = new Date(`${utcDay}T03:30:00Z`);
  assert.deepEqual(zonedParts(moved, tz), { key: "2026-11-14", hour: before.hour, minute: before.minute });
  // UTC zone (before hydration) is a no-op mapping.
  assert.equal(utcDateForLocalDay(at, "2026-11-14", ""), "2026-11-14");
});

test("week header shows both months when the week crosses a month", () => {
  const d = (s: string) => new Date(`${s}T00:00:00Z`);
  assert.equal(weekMonthLabel(d("2026-11-09"), d("2026-11-15")), "November 2026");
  assert.equal(weekMonthLabel(d("2026-10-26"), d("2026-11-01")), "Oct – Nov 2026");
  assert.equal(weekMonthLabel(d("2026-12-28"), d("2027-01-03")), "Dec 2026 – Jan 2027");
});
