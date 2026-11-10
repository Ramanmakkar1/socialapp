import assert from "node:assert/strict";
import { test } from "node:test";
import { allPostTags, hasColumn, parseTags, postMatchesTag, tagValidationError } from "./tagFilter.ts";

test("tag parsing trims, splits and deduplicates campaign tags", () => {
  assert.deepEqual(parseTags(" Launch, spring sale\n#LAUNCH, ,#spring sale "), ["Launch", "spring sale"]);
  assert.deepEqual(parseTags(["One", "one", " Two,Three "]), ["One", "Two", "Three"]);
});

test("tag validation rejects too many or overly long campaign tags", () => {
  assert.equal(tagValidationError(parseTags("one,two")), null);
  assert.match(tagValidationError(Array.from({ length: 11 }, (_, i) => `tag${i}`)) ?? "", /up to 10/);
  assert.match(tagValidationError(["x".repeat(51)]) ?? "", /50 characters/);
});

test("empty tag filter matches every post", () => {
  assert.equal(postMatchesTag({ tags: ["Launch"] }, ""), true);
  assert.equal(postMatchesTag({}, "   "), true);
  assert.equal(postMatchesTag({ tags: ["Launch"] }, "Other"), false);
});

test("tag matching and the available-tag list are case-insensitive", () => {
  assert.equal(postMatchesTag({ tags: ["Product Launch"] }, "product launch"), true);
  assert.equal(postMatchesTag({ tags: ["Product Launch"] }, "PRODUCT LAUNCH"), true);
  assert.deepEqual(allPostTags([{ tags: ["Launch"] }, { tags: ["launch", "Sale"] }]), ["Launch", "Sale"]);
});

test("the information-schema guard accepts PostgreSQL existence values", () => {
  assert.equal(hasColumn([{ exists: true }]), true);
  assert.equal(hasColumn([{ exists: "t" }]), true);
  assert.equal(hasColumn([]), false);
  assert.equal(hasColumn([{ exists: false }]), false);
});
