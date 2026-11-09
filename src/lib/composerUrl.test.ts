import { test } from "node:test";
import assert from "node:assert/strict";
import { composerOpenFromParams, dayPrefill, hrefWithoutComposer } from "./composerUrl";

test("composerOpenFromParams: compose or draft opens it", () => {
  assert.equal(composerOpenFromParams(new URLSearchParams("compose=1")), true);
  assert.equal(composerOpenFromParams(new URLSearchParams("draft=abc")), true);
  assert.equal(composerOpenFromParams(new URLSearchParams("view=week")), false);
});

test("hrefWithoutComposer: keeps the view, drops compose/draft/day", () => {
  assert.equal(hrefWithoutComposer("/app/calendar", new URLSearchParams("view=week&week=2026-11-09&compose=1&day=2026-11-10")), "/app/calendar?view=week&week=2026-11-09");
  assert.equal(hrefWithoutComposer("/app/calendar", new URLSearchParams("draft=x")), "/app/calendar");
});

test("dayPrefill: 9:00 on a future day, next full hour when past, null when bad", () => {
  const now = new Date(2026, 10, 9, 14, 20);
  const fut = dayPrefill("2026-11-12", now)!;
  assert.equal(fut.getDate(), 12);
  assert.equal(fut.getHours(), 9);
  const today = dayPrefill("2026-11-09", now)!;
  assert.equal(today.getHours(), 15);
  assert.equal(today.getMinutes(), 0);
  assert.equal(dayPrefill("2026-02-31", now), null);
  assert.equal(dayPrefill("nope", now), null);
  assert.equal(dayPrefill(null, now), null);
});
