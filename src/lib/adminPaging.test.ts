// Admin list helpers: page parsing, LIMIT n+1 paging, filters and ILIKE escaping.
import assert from "node:assert/strict";
import { test } from "node:test";
import { ADMIN_PAGE_SIZE, MAX_ADMIN_PAGE, containsPattern, isUuid, listHref, pageSlice, pageWindow, param, parsePage, pickOne } from "./adminPaging.ts";

test("parsePage clamps junk, negatives and huge pages", () => {
  assert.equal(parsePage(undefined), 1);
  assert.equal(parsePage(""), 1);
  assert.equal(parsePage("abc"), 1);
  assert.equal(parsePage("-3"), 1);
  assert.equal(parsePage("0"), 1);
  assert.equal(parsePage("4"), 4);
  assert.equal(parsePage("99999"), MAX_ADMIN_PAGE);
});

test("pageWindow asks for one extra row; pageSlice trims it and reports a next page", () => {
  assert.deepEqual(pageWindow(1), { limit: ADMIN_PAGE_SIZE + 1, offset: 0 });
  assert.deepEqual(pageWindow(3, 10), { limit: 11, offset: 20 });
  const full = Array.from({ length: 11 }, (_, i) => i);
  assert.deepEqual(pageSlice(full, 10), { rows: full.slice(0, 10), hasNext: true });
  assert.deepEqual(pageSlice([1, 2], 10), { rows: [1, 2], hasNext: false });
});

test("param takes the first value and trims", () => {
  assert.equal(param({ q: "  hi " }, "q"), "hi");
  assert.equal(param({ q: ["a", "b"] }, "q"), "a");
  assert.equal(param({}, "q"), "");
});

test("pickOne only lets allowed values through", () => {
  const allowed = ["failed", "scheduled"] as const;
  assert.equal(pickOne("failed", allowed), "failed");
  assert.equal(pickOne("'; drop table", allowed), "");
  assert.equal(pickOne("", allowed), "");
});

test("containsPattern escapes LIKE wildcards and drops a leading @", () => {
  assert.equal(containsPattern("   "), null);
  assert.equal(containsPattern("@"), null);
  assert.equal(containsPattern("@poskoo"), "%poskoo%");
  assert.equal(containsPattern("100%_off\\"), "%100\\%\\_off\\\\%");
  assert.equal(containsPattern("x".repeat(500))!.length, 102);
});

test("isUuid", () => {
  assert.equal(isUuid("3230f748-f38f-46ea-b7f0-1e11e21b1487"), true);
  assert.equal(isUuid("3230f748"), false);
  assert.equal(isUuid(null), false);
});

test("listHref keeps non-empty params and drops page 1", () => {
  assert.equal(listHref("/admin/users", { q: "", page: 1 }), "/admin/users");
  assert.equal(listHref("/admin/users", { q: "a b", page: 2 }), "/admin/users?q=a+b&page=2");
  assert.equal(listHref("/admin/posts", { status: "failed", network: undefined, page: 0 }), "/admin/posts?status=failed");
});
