import assert from "node:assert/strict";
import { test } from "node:test";
import { TEMPLATES_LIST_SQL, templateDeleteResult, templateValidationError } from "./templates.ts";

test("the list query run by listTemplates is scoped to the owner", () => {
  assert.match(TEMPLATES_LIST_SQL, /where user_id = \$1/);
  assert.match(TEMPLATES_LIST_SQL, /socialapp\.post_templates/);
});

test("a returned deleted row is a successful template delete", () => {
  assert.deepEqual(templateDeleteResult([{ id: "9a172450-0b37-4e29-b2de-53acdc1f994a" }]), { ok: true });
});

test("zero returned rows reports the template as not found", () => {
  assert.deepEqual(templateDeleteResult([]), { ok: false, error: "Template not found." });
});

test("template input is validated before a database write", () => {
  assert.match(templateValidationError({ name: " ", caption: "Caption" }) ?? "", /name/);
  assert.match(templateValidationError({ name: "Launch", caption: " " }) ?? "", /caption/);
  assert.equal(templateValidationError({ name: "Launch", caption: "Caption", tags: ["sale"] }), null);
});
