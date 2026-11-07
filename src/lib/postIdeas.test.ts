import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FORMATS,
  NICHES,
  POST_IDEAS,
  ideasToText,
  pickIdeas,
} from "./postIdeas.ts";

test("every niche has at least 6 ideas", () => {
  for (const niche of NICHES) {
    assert.ok(
      POST_IDEAS[niche.id].length >= 6,
      `${niche.id} has ${POST_IDEAS[niche.id].length} ideas`,
    );
  }
});

test("every idea has a valid format and non-empty fields", () => {
  for (const niche of NICHES) {
    for (const idea of POST_IDEAS[niche.id]) {
      assert.ok(
        FORMATS.includes(idea.format),
        `${niche.id}: unknown format ${idea.format}`,
      );
      assert.ok(idea.title.length > 0, `${niche.id}: empty title`);
      assert.ok(idea.hook.length > 0, `${niche.id}: empty hook in ${idea.title}`);
      assert.ok(
        idea.captionStarter.length > 0,
        `${niche.id}: empty caption in ${idea.title}`,
      );
    }
  }
});

test("format filter only returns matching ideas", () => {
  for (const format of FORMATS) {
    const ideas = pickIdeas("creator", { format, count: 20 });
    assert.ok(ideas.length > 0, `no ${format} ideas for creator`);
    for (const idea of ideas) {
      assert.equal(idea.format, format);
    }
  }
});

test("the same seed gives the same order", () => {
  const a = pickIdeas("restaurant", { seed: 42 });
  const b = pickIdeas("restaurant", { seed: 42 });
  assert.deepEqual(a, b);
  const c = pickIdeas("restaurant", { seed: 43 });
  assert.notDeepEqual(
    a.map((i) => i.title),
    c.map((i) => i.title),
    "different seeds should shuffle differently",
  );
});

test("count is respected", () => {
  assert.equal(pickIdeas("coach", { count: 3, seed: 7 }).length, 3);
  assert.equal(pickIdeas("coach", { seed: 7 }).length, 6);
});

test("an unknown niche falls back to creator", () => {
  const ideas = pickIdeas("nonexistent-niche", { count: 6, seed: 1 });
  assert.equal(ideas.length, 6);
  for (const idea of ideas) {
    assert.ok(
      POST_IDEAS.creator.some((c) => c.title === idea.title),
      `idea not from creator: ${idea.title}`,
    );
  }
});

test("ideasToText returns one block per idea", () => {
  const ideas = pickIdeas("fitness", { count: 2, seed: 5 });
  const text = ideasToText(ideas);
  const blocks = text.split("\n\n").filter((b) => b.trim().length > 0);
  assert.equal(blocks.length, 2);
  for (const idea of ideas) {
    assert.ok(text.includes(idea.title));
    assert.ok(text.includes(idea.hook));
  }
});
