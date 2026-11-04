import assert from "node:assert/strict";
import { test } from "node:test";
import { hourBars, topHours } from "./bestTime.ts";

test("empty input gives []", () => {
  assert.deepEqual(topHours([]), []);
  assert.deepEqual(topHours([], 5), []);
});

test("ties sorted by earlier hour first", () => {
  const result = topHours([
    { hour: 10, count: 2 },
    { hour: 3, count: 2 },
    { hour: 7, count: 5 },
  ]);
  assert.equal(result.length, 3);
  assert.equal(result[0]?.hour, 7);
  assert.equal(result[1]?.hour, 3);
  assert.equal(result[2]?.hour, 10);
});

test("labels for 0, 12, 23", () => {
  assert.equal(topHours([{ hour: 0, count: 1 }])[0]?.label, "12 AM–1 AM");
  assert.equal(topHours([{ hour: 12, count: 1 }])[0]?.label, "12 PM–1 PM");
  assert.equal(topHours([{ hour: 23, count: 1 }])[0]?.label, "11 PM–12 AM");
});

test("hourBars returns 24 counts indexed by hour", () => {
  assert.deepEqual(hourBars([]), Array.from({ length: 24 }, () => 0));
  assert.deepEqual(hourBars([{ hour: 5, count: 3 }, { hour: 5, count: 99 }]), [
    ...Array.from({ length: 5 }, () => 0),
    99,
    ...Array.from({ length: 18 }, () => 0),
  ]);
});
