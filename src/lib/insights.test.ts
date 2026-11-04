import assert from "node:assert/strict";
import { test } from "node:test";
import { parseInsights } from "./insights.ts";

test("parseInsights reads full Graph media insights response", () => {
  const parsed = parseInsights({
    data: [
      { name: "reach", period: "lifetime", values: [{ value: 1200 }] },
      { name: "likes", period: "lifetime", values: [{ value: 88 }] },
      { name: "comments", period: "lifetime", values: [{ value: 12 }] },
      { name: "saved", period: "lifetime", values: [{ value: 5 }] },
      { name: "shares", period: "lifetime", values: [{ value: 3 }] },
    ],
  });
  assert.deepEqual(parsed, {
    reach: 1200,
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
    likes: null,
    comments: null,
    saved: null,
    shares: null,
  });
});
