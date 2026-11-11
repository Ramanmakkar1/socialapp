import assert from "node:assert/strict";
import { test } from "node:test";
import { readPaging } from "./pager.ts";

test("rows-per-page paging clamps page and per-page", () => {
  assert.deepEqual(readPaging({}, 34), { page: 1, perPage: 10, pages: 4, offset: 0 });
  assert.deepEqual(readPaging({ page: "4", per: "10" }, 34), { page: 4, perPage: 10, pages: 4, offset: 30 });
  assert.deepEqual(readPaging({ page: "9", per: "25" }, 34), { page: 2, perPage: 25, pages: 2, offset: 25 });
  assert.deepEqual(readPaging({ page: "-1", per: "7" }, 0), { page: 1, perPage: 10, pages: 1, offset: 0 });
  assert.deepEqual(readPaging({ page: ["2"], per: ["50"] }, 120), { page: 2, perPage: 50, pages: 3, offset: 50 });
});
