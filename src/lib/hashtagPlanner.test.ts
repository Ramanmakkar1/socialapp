import assert from "node:assert/strict";
import { test } from "node:test";
import { buildHashtags } from "./hashtagSets";
import { POPULARITY_NOTE, captionBlock, hashtagCsv, planHashtags, popularityOf, tierOf } from "./hashtagPlanner";

test("planHashtags keeps buildHashtags' deterministic set and order", () => {
  const opts = { count: 12, mix: "balanced" as const, extra: "Denver fitness" };
  assert.deepEqual(planHashtags("fitness", opts).map((r) => r.tag), buildHashtags("fitness", opts));
});

test("tiers, competition and popularity are derived from the curated tier", () => {
  assert.equal(tierOf("fitness", "workout"), "broad");
  assert.equal(tierOf("fitness", "homeworkout"), "mid");
  assert.equal(tierOf("fitness", "kettlebellworkout"), "niche");
  assert.equal(tierOf("fitness", "denverfitness"), "custom");
  const rows = planHashtags("fitness", { count: 30, mix: "balanced", extra: "Denver" });
  const custom = rows.find((r) => r.tag === "denver");
  assert.equal(custom?.tier, "custom");
  assert.equal(custom?.popularity.label, "Not rated");
  assert.equal(rows.find((r) => r.tag === "kettlebellworkout")?.competition, "Low");
});

test("popularity is always a range label, never an exact count", () => {
  assert.equal(popularityOf("fitness", "broad").label, "100M+");
  assert.equal(popularityOf("workout", "broad").label, "1M+");
  for (const r of planHashtags("food", { count: 30, mix: "balanced" })) {
    assert.match(r.popularity.label, /\+|–|Not rated/);
  }
  assert.match(POPULARITY_NOTE, /estimate/);
});

test("caption block puts invisible spacer lines above the tags", () => {
  assert.equal(captionBlock(["a", "b"]), "⠀\n⠀\n⠀\n#a #b");
  assert.equal(captionBlock([]), "");
});

test("CSV has a header and marks selection", () => {
  const rows = planHashtags("fitness", { count: 5, mix: "balanced" });
  const csv = hashtagCsv(rows, new Set([rows[0].tag])).split("\n");
  assert.equal(csv[0], "hashtag,estimated_popularity,tier,competition,selected");
  assert.equal(csv.length, 6);
  assert.ok(csv[1].endsWith(",yes"));
  assert.ok(csv[2].endsWith(",no"));
});
