import assert from "node:assert/strict";
import { test } from "node:test";
import {
  HOOK_STYLES,
  generateHooks,
  hooksToText,
  normalizeTopic,
  type HookStyleFilter,
} from "./hookIdeas.ts";

test("an empty topic falls back to 'your niche'", () => {
  for (const style of HOOK_STYLES) {
    for (const hook of generateHooks("", style.id)) {
      assert.ok(hook.includes("your niche"), `${style.id}: ${hook}`);
    }
  }
  for (const hook of generateHooks("   ", "all")) {
    assert.ok(hook.includes("your niche"), hook);
  }
  assert.equal(normalizeTopic(""), "your niche");
  assert.equal(normalizeTopic("   "), "your niche");
});

test("the topic is trimmed, collapsed and capped at 60 characters", () => {
  assert.deepEqual(
    generateHooks("  fitness  ", "curiosity"),
    generateHooks("fitness", "curiosity"),
  );
  assert.deepEqual(
    generateHooks("home   workout", "list"),
    generateHooks("home workout", "list"),
  );
  const long = "x".repeat(90);
  for (const hook of generateHooks(long, "list")) {
    assert.ok(hook.includes(long.slice(0, 60)), `not capped: ${hook}`);
    assert.ok(!hook.includes(long), `over cap: ${hook}`);
  }
  assert.equal(normalizeTopic(long).length, 60);
});

test("'all' returns hooks from every style", () => {
  const all = generateHooks("skincare", "all");
  assert.equal(all.length, HOOK_STYLES.length * 6, `got ${all.length} hooks`);
  for (const style of HOOK_STYLES) {
    const hooks = generateHooks("skincare", style.id);
    assert.ok(hooks.length >= 6, `${style.id} has ${hooks.length} hooks`);
    for (const hook of hooks) {
      assert.ok(all.includes(hook), `missing ${style.id} hook: ${hook}`);
    }
  }
});

test("there are no duplicate hooks", () => {
  const styles: HookStyleFilter[] = ["all", ...HOOK_STYLES.map((s) => s.id)];
  for (const style of styles) {
    const hooks = generateHooks("side hustle", style);
    assert.equal(new Set(hooks).size, hooks.length, `duplicates for ${style}`);
  }
});

test("hooksToText puts every hook on its own line", () => {
  const hooks = generateHooks("baking", "list");
  const lines = hooksToText(hooks).split("\n");
  assert.equal(lines.length, hooks.length);
  assert.deepEqual(lines, hooks);
});
