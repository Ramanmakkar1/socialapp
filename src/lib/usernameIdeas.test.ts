import assert from "node:assert/strict";
import { test } from "node:test";
import {
  MAX_RESULTS,
  USERNAME_MAX,
  USERNAME_STYLES,
  generateUsernames,
  isValidInstagramUsername,
  sanitizeUsername,
} from "./usernameIdeas.ts";

const samples = [
  { name: "Alex Rivera", niche: "fitness coach" },
  { name: "Zoë's Bakery!!", niche: "cakes & cookies" },
  { name: "A very very long creator name indeed", niche: "travel photography adventures" },
  { name: "", niche: "yoga" },
];

test("every result is valid, at most 30 chars and unique", () => {
  for (const sample of samples) {
    for (const { id } of USERNAME_STYLES) {
      const out = generateUsernames({ ...sample, style: id });
      assert.ok(out.length > 0, `${id}: no results for ${JSON.stringify(sample)}`);
      assert.ok(out.length <= MAX_RESULTS);
      assert.equal(new Set(out).size, out.length, "duplicates");
      for (const u of out) {
        assert.ok(u.length <= USERNAME_MAX, `${u} is too long`);
        assert.ok(isValidInstagramUsername(u), `${u} is not valid`);
      }
    }
  }
});

test("an empty name still gives niche-based results", () => {
  const out = generateUsernames({ name: "", niche: "Yoga", style: "clean" });
  assert.ok(out.length >= 5);
  assert.ok(out.every((u) => u.includes("yoga")));
});

test("output is stable for the same input", () => {
  const input = { name: "Alex Rivera", niche: "fitness", style: "business" as const };
  assert.deepEqual(generateUsernames(input), generateUsernames(input));
});

test("empty name and niche give no results", () => {
  assert.deepEqual(generateUsernames({ name: " ", niche: "", style: "clean" }), []);
});

test("isValidInstagramUsername applies Instagram rules", () => {
  assert.ok(isValidInstagramUsername("alex.rivera_1"));
  assert.ok(!isValidInstagramUsername(".alex"));
  assert.ok(!isValidInstagramUsername("alex."));
  assert.ok(!isValidInstagramUsername("alex..rivera"));
  assert.ok(!isValidInstagramUsername("Alex"));
  assert.ok(!isValidInstagramUsername("alex-rivera"));
  assert.ok(!isValidInstagramUsername("a".repeat(31)));
  assert.ok(!isValidInstagramUsername(""));
});

test("sanitizeUsername cleans input", () => {
  assert.equal(sanitizeUsername("..Zoë..Café.."), "zoe.cafe");
});
