import assert from "node:assert/strict";
import { test } from "node:test";
import { withoutAiClaims } from "./aiClaims.ts";

test("'and AI caption ideas built in' is replaced with 'built in'", () => {
  assert.equal(
    withoutAiClaims("with email capture and AI caption ideas built in."),
    "with email capture built in.",
  );
});

test("', AI captions and lead capture' is replaced with ' and lead capture'", () => {
  assert.equal(
    withoutAiClaims("comment-to-DM, AI captions and lead capture in one"),
    "comment-to-DM and lead capture in one",
  );
});

test("text without either phrase is returned unchanged", () => {
  const untouched = "schedule posts on Instagram, Facebook Page and Threads.";
  assert.equal(withoutAiClaims(untouched), untouched);
});
