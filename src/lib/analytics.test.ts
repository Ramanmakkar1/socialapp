import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildGrowthSeries,
  parseRangeDays,
  performanceCsvRows,
  toCsv,
  type PostPerformanceRow,
} from "./analytics.ts";

test("parseRangeDays accepts 7/30/90 and falls back to 30", () => {
  assert.equal(parseRangeDays("7"), 7);
  assert.equal(parseRangeDays("30"), 30);
  assert.equal(parseRangeDays("90"), 90);
  assert.equal(parseRangeDays(null), 30);
  assert.equal(parseRangeDays(undefined), 30);
  assert.equal(parseRangeDays(""), 30);
  assert.equal(parseRangeDays("abc"), 30);
  assert.equal(parseRangeDays("15"), 30);
  assert.equal(parseRangeDays("0"), 30);
  assert.equal(parseRangeDays("7.5"), 30);
});

test("toCsv writes headers, rows and CRLF endings", () => {
  const csv = toCsv(["A", "B"], [[1, "x"], [2, "y"]]);
  assert.equal(csv, "A,B\r\n1,x\r\n2,y");
});

test("toCsv escapes commas, quotes and newlines", () => {
  const csv = toCsv(["Post"], [["hello, world"], ['say "hi"'], ["line1\nline2"]]);
  assert.equal(csv, 'Post\r\n"hello, world"\r\n"say ""hi"""\r\n"line1\nline2"');
});

test("toCsv renders null as empty cell", () => {
  const csv = toCsv(["A", "B"], [[null, 5]]);
  assert.equal(csv, "A,B\r\n,5");
});

test("performanceCsvRows maps post rows in column order", () => {
  const row: PostPerformanceRow = {
    id: "p1",
    caption: "Hello",
    publishedAt: "2026-11-01T10:00:00.000Z",
    platforms: ["instagram", "facebook"],
    reach: 100,
    impressions: 150,
    likes: 10,
    comments: 2,
    saved: 3,
    linkClicks: 4,
  };
  assert.deepEqual(performanceCsvRows([row]), [
    ["Hello", "2026-11-01T10:00:00.000Z", "instagram facebook", 100, 150, 10, 2, 3, 4],
  ]);
});

test("buildGrowthSeries sums accounts and forward-fills missing days", () => {
  const rows = [
    { day: "2026-11-05", account: "a", followers: 100 },
    { day: "2026-11-05", account: "b", followers: 50 },
    { day: "2026-11-07", account: "a", followers: 110 },
  ];
  const series = buildGrowthSeries("2026-11-08", 4, rows);
  assert.deepEqual(series, [
    { day: "2026-11-05", followers: 150 },
    { day: "2026-11-06", followers: 150 },
    { day: "2026-11-07", followers: 160 },
    { day: "2026-11-08", followers: 160 },
  ]);
});

test("buildGrowthSeries is zero before the first snapshot", () => {
  const series = buildGrowthSeries("2026-11-08", 3, [
    { day: "2026-11-07", account: "a", followers: 42 },
  ]);
  assert.deepEqual(series, [
    { day: "2026-11-06", followers: 0 },
    { day: "2026-11-07", followers: 42 },
    { day: "2026-11-08", followers: 42 },
  ]);
});

test("buildGrowthSeries handles no snapshots and bad today", () => {
  assert.deepEqual(buildGrowthSeries("2026-11-08", 2, []), [
    { day: "2026-11-07", followers: 0 },
    { day: "2026-11-08", followers: 0 },
  ]);
  assert.deepEqual(buildGrowthSeries("not-a-date", 3, []), []);
});
