import assert from "node:assert/strict";
import { test } from "node:test";
import { buildContactQuery, isValidRuleId, parseContactFilters } from "@/lib/contactsQuery";

test("parseContactFilters reads q, email and rule", () => {
  assert.deepEqual(parseContactFilters({ q: "ana", email: "1", rule: "r1" }), {
    search: "ana",
    onlyWithEmail: true,
    rule: "r1",
  });
});

test("parseContactFilters treats empty and array values as absent", () => {
  assert.deepEqual(parseContactFilters({}), { search: "", onlyWithEmail: false, rule: "" });
  assert.deepEqual(parseContactFilters({ q: ["ana", "bo"], email: ["1", "0"], rule: [""] }), {
    search: "ana",
    onlyWithEmail: true,
    rule: "",
  });
  assert.deepEqual(parseContactFilters({ q: "   ", email: "0" }), { search: "", onlyWithEmail: false, rule: "" });
});

test("parseContactFilters caps the search at 100 chars", () => {
  const filters = parseContactFilters({ q: "x".repeat(150) });
  assert.equal(filters.search.length, 100);
});

test("buildContactQuery starts from the owner only", () => {
  const { where, params } = buildContactQuery("user-1", { search: "", onlyWithEmail: false, rule: "" });
  assert.equal(where, "c.user_id = $1");
  assert.deepEqual(params, ["user-1"]);
});

test("buildContactQuery adds the search condition with LIKE escaping", () => {
  const { where, params } = buildContactQuery("user-1", { search: "50% off_a\\b", onlyWithEmail: false, rule: "" });
  assert.equal(where, "c.user_id = $1 and (c.username ilike $2 or c.name ilike $2 or c.email ilike $2 or c.phone ilike $2)");
  assert.deepEqual(params, ["user-1", "%50\\% off\\_a\\\\b%"]);
});

test("buildContactQuery adds the with-email condition", () => {
  const { where, params } = buildContactQuery("user-1", { search: "", onlyWithEmail: true, rule: "" });
  assert.equal(where, "c.user_id = $1 and c.email is not null and c.email <> ''");
  assert.deepEqual(params, ["user-1"]);
});

test("buildContactQuery adds the rule condition", () => {
  const { where, params } = buildContactQuery("user-1", { search: "", onlyWithEmail: false, rule: "rule-9" });
  assert.equal(where, "c.user_id = $1 and c.source_rule_id = $2");
  assert.deepEqual(params, ["user-1", "rule-9"]);
});

test("buildContactQuery combines search, email and rule", () => {
  const { where, params } = buildContactQuery("user-1", { search: "ana", onlyWithEmail: true, rule: "rule-9" });
  assert.equal(
    where,
    "c.user_id = $1 and (c.username ilike $2 or c.name ilike $2 or c.email ilike $2 or c.phone ilike $2) and c.email is not null and c.email <> '' and c.source_rule_id = $3",
  );
  assert.deepEqual(params, ["user-1", "%ana%", "rule-9"]);
});

test("the export path rejects a malformed rule before any query", () => {
  assert.equal(isValidRuleId("not-a-uuid"), false);
  assert.equal(isValidRuleId(""), false);
  assert.equal(isValidRuleId("12345678-1234-1234-1234-123456789abc"), false);
  assert.equal(isValidRuleId("12345678-1234-5abc-8abc-123456789abc"), true);
});
