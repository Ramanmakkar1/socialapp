import assert from "node:assert/strict";
import { test } from "node:test";
import { convert, FONT_STYLES } from "./igFonts.ts";

test("maps bold letters and digits", () => assert.equal(convert("Ab1", "bold"), "\u{1d400}\u{1d41b}\u{1d7cf}"));
test("maps mathematical alphabet exceptions", () => {
  assert.equal(convert("h", "italic"), "\u210e");
  assert.equal(convert("B", "script"), "\u212c");
});
test("preserves punctuation and emoji and handles empty input", () => {
  for (const style of FONT_STYLES) {
    assert.equal(style.map(" ! \u{1f44b}"), " ! \u{1f44b}");
    assert.equal(style.map(""), "");
  }
});
