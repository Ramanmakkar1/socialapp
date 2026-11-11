import assert from "node:assert/strict";
import { test } from "node:test";
import { inboxReturnParams, postKeyFor } from "./returnTo.ts";

function form(entries: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(entries)) f.set(k, v);
  return f;
}

test("keeps the selected post, filter and layout for the redirect", () => {
  const key = postKeyFor("0b5c-acc", "17890012345");
  assert.deepEqual(inboxReturnParams(form({ return_post: key, return_filter: "unanswered" })), { filter: "unanswered", post: key });
  assert.deepEqual(inboxReturnParams(form({ return_view: "list", filter: "hidden" })), { filter: "hidden", view: "list" });
  assert.equal(postKeyFor("a", null), "a:none");
});

test("drops unknown or unsafe values", () => {
  assert.deepEqual(inboxReturnParams(form({ return_post: "x&y=1", return_filter: "all", return_view: "grid" })), {});
  assert.deepEqual(inboxReturnParams(form({})), {});
});
