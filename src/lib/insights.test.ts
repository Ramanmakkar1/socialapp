import assert from "node:assert/strict";
import { test } from "node:test";
import { parseInsights } from "./insights.ts";

test("parseInsights reads full Graph media insights response", () => {
  const parsed = parseInsights({
    data: [
      { name: "reach", period: "lifetime", values: [{ value: 1200 }] },
      { name: "impressions", period: "lifetime", values: [{ value: 1500 }] },
      { name: "likes", period: "lifetime", values: [{ value: 88 }] },
      { name: "comments", period: "lifetime", values: [{ value: 12 }] },
      { name: "saved", period: "lifetime", values: [{ value: 5 }] },
      { name: "shares", period: "lifetime", values: [{ value: 3 }] },
    ],
  });
  assert.deepEqual(parsed, {
    reach: 1200,
    impressions: 1500,
    views: null,
    likes: 88,
    comments: 12,
    saved: 5,
    shares: 3,
  });
});

test("parseInsights fills missing metrics with null", () => {
  const parsed = parseInsights({
    data: [{ name: "reach", values: [{ value: 50 }] }, { name: "likes", values: [{}] }],
  });
  assert.deepEqual(parsed, {
    reach: 50,
    impressions: null,
    views: null,
    likes: null,
    comments: null,
    saved: null,
    shares: null,
  });
});

test("parseInsights maps the new 'views' metric and keeps 'impressions' filled for old readers", () => {
  const parsed = parseInsights({ data: [{ name: "views", values: [{ value: 900 }] }, { name: "reach", values: [{ value: 400 }] }] });
  assert.equal(parsed.views, 900);
  assert.equal(parsed.impressions, 900);
  assert.equal(parsed.reach, 400);
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

test("fetchMediaInsights never asks for the removed 'impressions' metric and uses story-safe metrics for stories", async () => {
  const { fetchMediaInsights } = await import("./insights.ts");
  const asked: string[] = [];
  const fakeFetch = (async (url: string) => {
    asked.push(new URL(url).searchParams.get("metric") ?? "");
    return jsonResponse(200, { data: [{ name: "reach", values: [{ value: 1 }] }] });
  }) as unknown as typeof fetch;
  await fetchMediaInsights("m1", "tok", "instagram_login", "feed", fakeFetch);
  await fetchMediaInsights("m2", "tok", "instagram_login", "story", fakeFetch);
  assert.equal(asked[0], "reach,views,likes,comments,saved,shares");
  assert.equal(asked[1], "reach,views,shares");
  for (const m of asked) assert.ok(!m.includes("impressions"));
});

test("fetchMediaInsights falls back to one metric at a time when one metric is unsupported", async () => {
  const { fetchMediaInsights } = await import("./insights.ts");
  const fakeFetch = (async (url: string) => {
    const metric = new URL(url).searchParams.get("metric") ?? "";
    if (metric.includes(",") || metric === "saved") {
      return jsonResponse(400, { error: { code: 100, message: "(#100) metric[0] must be one of the following values: reach, views" } });
    }
    return jsonResponse(200, { data: [{ name: metric, values: [{ value: metric.length }] }] });
  }) as unknown as typeof fetch;
  const out = await fetchMediaInsights("m1", "tok", null, "feed", fakeFetch);
  assert.equal(out.reach, 5);
  assert.equal(out.views, 5);
  assert.equal(out.likes, 5);
  assert.equal(out.saved, null);
  assert.equal(out.shares, 6);
});

test("fetchMediaInsights rethrows permission errors instead of retrying per metric", async () => {
  const { fetchMediaInsights } = await import("./insights.ts");
  let calls = 0;
  const fakeFetch = (async () => {
    calls++;
    return jsonResponse(403, { error: { code: 10, message: "Application does not have permission" } });
  }) as unknown as typeof fetch;
  await assert.rejects(fetchMediaInsights("m1", "tok", null, "feed", fakeFetch));
  assert.equal(calls, 1);
});
