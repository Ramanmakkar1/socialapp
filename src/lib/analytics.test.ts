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

test("parsePeriod: month to date and last month are UTC calendar ranges; day counts keep working", async () => {
  const { parsePeriod } = await import("./analytics.ts");
  const now = new Date("2026-11-11T15:30:00Z");
  const mtd = parsePeriod("mtd", now);
  assert.equal(mtd.range.from.toISOString(), "2026-11-01T00:00:00.000Z");
  assert.equal(mtd.range.to.toISOString(), now.toISOString());
  assert.equal(mtd.days, 11);
  assert.equal(mtd.lastDay, "2026-11-11");

  const last = parsePeriod("last_month", now);
  assert.equal(last.range.from.toISOString(), "2026-10-01T00:00:00.000Z");
  assert.equal(last.range.to.toISOString(), "2026-11-01T00:00:00.000Z");
  assert.equal(last.days, 31);
  assert.equal(last.lastDay, "2026-10-31");
  assert.equal(last.phrase, "October 2026");

  // January → December of the previous year.
  const jan = parsePeriod("last_month", new Date("2027-01-05T00:00:00Z"));
  assert.equal(jan.range.from.toISOString(), "2026-12-01T00:00:00.000Z");
  assert.equal(jan.days, 31);

  const seven = parsePeriod("7", now);
  assert.equal(seven.key, "7");
  assert.equal(seven.days, 7);
  assert.equal(seven.range.to.getTime() - seven.range.from.getTime(), 7 * 86_400_000);
  assert.equal(parsePeriod("bogus", now).key, "30");
});

test("growthDays: N days end today; a range covers the UTC days it touches", async () => {
  const { growthDays, resolveRange } = await import("./analytics.ts");
  const now = new Date("2026-11-11T15:30:00Z");
  assert.deepEqual(growthDays(7, now), { firstDay: "2026-11-05", lastDay: "2026-11-11" });
  assert.deepEqual(growthDays({ from: new Date("2026-10-01T00:00:00Z"), to: new Date("2026-11-01T00:00:00Z") }), { firstDay: "2026-10-01", lastDay: "2026-10-31" });
  const r = { from: new Date("2026-01-01T00:00:00Z"), to: new Date("2026-01-02T00:00:00Z") };
  assert.equal(resolveRange(r), r);
});

test("getPostPerformance / getGrowthSnapshots accept a day count or a range and an optional account", async () => {
  const { createFakePool, installFakePool } = await import("../test-utils/fakePool.ts");
  const { pool, calls } = createFakePool([{ match: () => true, reply: () => [] }]);
  const restore = installFakePool(pool);
  try {
    const { getGrowthSnapshots, getPostPerformance } = await import("./analytics.ts");
    const range = { from: new Date("2026-10-01T00:00:00Z"), to: new Date("2026-11-01T00:00:00Z") };
    await getPostPerformance("u1", range, "acc-1");
    await getPostPerformance("u1", 30);
    await getGrowthSnapshots("u1", range);
  } finally {
    restore();
  }
  assert.deepEqual(calls[0].params, ["u1", new Date("2026-10-01T00:00:00Z"), new Date("2026-11-01T00:00:00Z"), "acc-1"]);
  assert.match(calls[0].sql, /t\.published_at >= \$2 and t\.published_at < \$3/);
  assert.equal(calls[1].params[3], null);
  assert.equal((calls[1].params[2] as Date).getTime() - (calls[1].params[1] as Date).getTime(), 30 * 86_400_000);
  assert.deepEqual(calls[2].params, ["u1", "2026-10-01", "2026-10-31", null]);
});
