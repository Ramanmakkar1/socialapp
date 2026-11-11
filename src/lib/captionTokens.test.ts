import { test } from "node:test";
import assert from "node:assert/strict";
import { captionTokens, truncateCaption } from "./captionTokens";

test("captionTokens finds links, hashtags and mentions", () => {
  assert.deepEqual(captionTokens("New menu! #latte by @brew.co see https://poskoo.com/menu."), [
    { kind: "text", text: "New menu! " },
    { kind: "hashtag", text: "#latte" },
    { kind: "text", text: " by " },
    { kind: "mention", text: "@brew.co" },
    { kind: "text", text: " see " },
    { kind: "link", text: "https://poskoo.com/menu" },
    { kind: "text", text: "." },
  ]);
});

test("captionTokens keeps line breaks and ignores e-mail addresses", () => {
  assert.deepEqual(captionTokens("Hi\nmail me@x.com"), [{ kind: "text", text: "Hi\nmail me@x.com" }]);
  assert.deepEqual(captionTokens(""), []);
  assert.deepEqual(captionTokens("#café"), [{ kind: "hashtag", text: "#café" }]);
});

test("truncateCaption cuts on characters, not UTF-16 units", () => {
  assert.deepEqual(truncateCaption("short", 10), { text: "short", cut: false });
  assert.deepEqual(truncateCaption("😀😀😀", 2), { text: "😀😀", cut: true });
  assert.deepEqual(truncateCaption("hello world", 6), { text: "hello", cut: true });
});
