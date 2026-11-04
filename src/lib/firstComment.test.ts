import assert from "node:assert/strict";
import { test } from "node:test";
import { shouldPostFirstComment } from "./firstComment.ts";

test("first comments require text and a non-story format", () => {
  for (const format of ["feed", "reel", "carousel"]) {
    assert.equal(shouldPostFirstComment(format, " #hashtags "), true);
    assert.equal(shouldPostFirstComment(format, "  "), false);
    assert.equal(shouldPostFirstComment(format, null), false);
  }
  assert.equal(shouldPostFirstComment("story", "#hashtags"), false);
});
