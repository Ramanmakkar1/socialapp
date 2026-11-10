import assert from "node:assert/strict";
import { test } from "node:test";
import { isMissingColumnError, ruleMatchesMedia } from "./ruleMedia.ts";

test("an empty media scope matches every post", () => {
  assert.equal(ruleMatchesMedia({ media_ids: [] }, "post-1"), true);
  assert.equal(ruleMatchesMedia({}, null), true);
});

test("selected posts only match their own media id", () => {
  const rule = { media_ids: ["post-1", "post-2"] };
  assert.equal(ruleMatchesMedia(rule, "post-1"), true);
  assert.equal(ruleMatchesMedia(rule, "post-3"), false);
  assert.equal(ruleMatchesMedia(rule, null), false);
});

test("only PostgreSQL undefined-column errors trigger the compatibility fallback", () => {
  assert.equal(isMissingColumnError(Object.assign(new Error("missing"), { code: "42703" })), true);
  assert.equal(isMissingColumnError(new Error("database unavailable")), false);
  assert.equal(isMissingColumnError(null), false);
});
