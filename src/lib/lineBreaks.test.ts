import assert from "node:assert/strict";
import { test } from "node:test";
import { countChars } from "./captionLimits.ts";
import { countLines, formatForInstagram, hasCollapsedSpacing } from "./lineBreaks.ts";

const BRAILLE = "\u2800";

test("normalises CRLF to LF", () => {
  assert.equal(formatForInstagram("a\r\nb"), "a\nb");
  assert.equal(formatForInstagram("a\rb"), "a\nb");
});

test("empty lines become braille blank or dot", () => {
  assert.equal(formatForInstagram("line one\n\nline two"), `line one\n${BRAILLE}\nline two`);
  assert.equal(formatForInstagram("a\n\n\nb"), `a\n${BRAILLE}\n${BRAILLE}\nb`);
  assert.equal(formatForInstagram("a\n\nb", { blankLine: "dot" }), "a\n.\nb");
});

test("trims trailing spaces on each line", () => {
  assert.equal(formatForInstagram("hello   \nworld  "), "hello\nworld");
  assert.equal(hasCollapsedSpacing("hello   \nworld"), true);
});

test("empty input stays empty", () => {
  assert.equal(formatForInstagram(""), "");
  assert.equal(formatForInstagram("\n\n"), "");
  assert.equal(formatForInstagram("   \n  \n  "), "");
});

test("emoji preserved and char count matches after format", () => {
  const raw = "Drop is live 👋\n\n#style";
  const out = formatForInstagram(raw);
  assert.equal(out.includes("👋"), true);
  assert.equal(countChars(out), countChars(raw.replace(/ +$/gm, "").replace(/\n\n/g, `\n${BRAILLE}\n`)));
});

test("countLines and hasCollapsedSpacing", () => {
  assert.equal(countLines(""), 0);
  assert.equal(countLines("one"), 1);
  assert.equal(countLines("one\ntwo"), 2);
  assert.equal(hasCollapsedSpacing("single line"), false);
  assert.equal(hasCollapsedSpacing("a\n\nb"), true);
});
