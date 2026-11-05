import assert from "node:assert/strict";
import { test } from "node:test";
import { HASHTAG_SETS, buildHashtags, type HashtagMix } from "./hashtagSets.ts";

test("every curated tier has 8–10 plain tags, unique within its niche", () => {
  assert.equal(Object.keys(HASHTAG_SETS).length, 15);
  for (const sets of Object.values(HASHTAG_SETS)) {
    const all = Object.values(sets).flat();
    assert.equal(new Set(all).size, all.length);
    for (const tier of Object.values(sets)) {
      assert.ok(tier.length >= 8 && tier.length <= 10);
      tier.forEach((tag) => assert.match(tag, /^[a-z0-9_]+$/));
    }
  }
});

test("all niches and mixes respect count, cap, uniqueness and tag format", () => {
  for (const niche of Object.keys(HASHTAG_SETS)) {
    for (const mix of ["balanced", "broad", "niche"] as const) {
      for (const count of [0, 5, 15, 30, 99]) {
        const tags = buildHashtags(niche, { count, mix, extra: "#Café Local!" });
        assert.equal(tags.length, Math.min(count, 30));
        assert.equal(new Set(tags).size, tags.length);
        tags.forEach((tag) => assert.match(tag, /^[a-z0-9_]+$/));
      }
    }
  }
});

test("mix changes tier shares at 15 tags across every niche", () => {
  for (const [niche, sets] of Object.entries(HASHTAG_SETS)) {
    const share = (mix: HashtagMix, tier: keyof typeof sets) =>
      buildHashtags(niche, { count: 15, mix }).filter((tag) => sets[tier].includes(tag)).length;
    assert.equal(share("balanced", "broad"), 5);
    assert.equal(share("balanced", "mid"), 5);
    assert.equal(share("balanced", "niche"), 5);
    assert.ok(share("broad", "broad") > share("balanced", "broad"));
    assert.ok(share("niche", "niche") > share("balanced", "niche"));
    assert.ok(share("broad", "niche") < share("niche", "niche"));
  }
});

test("keyword creates at most two clean tags and deduplicates curated tags", () => {
  assert.deepEqual(buildHashtags("food", { count: 2, mix: "balanced", extra: " #Café Local! " }), ["cafelocal", "cafe"]);
  const tags = buildHashtags("fitness", { count: 30, mix: "balanced", extra: "#Fitness" });
  assert.equal(tags.filter((tag) => tag === "fitness").length, 1);
  assert.equal(tags.length, 30);
  assert.deepEqual(buildHashtags("food", { count: 15, mix: "balanced", extra: "## 🚀 !!!" }), buildHashtags("food", { count: 15, mix: "balanced" }));
});

test("ordering is repeatable and calls do not mutate curated sets", () => {
  const original = JSON.stringify(HASHTAG_SETS);
  const opts = { count: 15, mix: "balanced" as const };
  const tags = buildHashtags("travel", opts);
  buildHashtags("travel", { count: 25, mix: "broad" });
  assert.deepEqual(buildHashtags("travel", opts), tags);
  assert.equal(JSON.stringify(HASHTAG_SETS), original);
});

test("unknown niches and unusual counts are safe", () => {
  for (const niche of ["missing", "__proto__", "constructor"]) {
    assert.deepEqual(buildHashtags(niche, { count: 30, mix: "balanced" }), []);
  }
  for (const count of [-1, NaN, -Infinity]) {
    assert.deepEqual(buildHashtags("food", { count, mix: "balanced" }), []);
  }
  assert.equal(buildHashtags("food", { count: Infinity, mix: "balanced" }).length, 30);
  assert.equal(buildHashtags("food", { count: 5.9, mix: "balanced" }).length, 5);
});
