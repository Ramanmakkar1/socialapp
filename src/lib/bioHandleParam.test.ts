import assert from "node:assert/strict";
import { test } from "node:test";
import { bioHandleFromParam } from "./bioPageShared.ts";

test("decodes the percent-encoded @ that Next 16 passes to [handle]", () => {
  assert.equal(bioHandleFromParam("%40brewhouse.coffee"), "brewhouse.coffee");
  assert.equal(bioHandleFromParam("%40Brewhouse.Coffee"), "brewhouse.coffee");
});

test("still accepts an already-decoded @handle", () => {
  assert.equal(bioHandleFromParam("@brewhouse.coffee"), "brewhouse.coffee");
});

test("rejects params without @, a bare @ and malformed escapes", () => {
  assert.equal(bioHandleFromParam("brewhouse.coffee"), null);
  assert.equal(bioHandleFromParam("%40"), null);
  assert.equal(bioHandleFromParam("@"), null);
  assert.equal(bioHandleFromParam("%E0%A4%A"), null);
});
