import assert from "node:assert/strict";
import { test } from "node:test";
import { contactExportUrl, contactRedirectQuery } from "@/lib/contactsQuery";

test("contactRedirectQuery returns an empty string for empty params", () => {
  assert.equal(contactRedirectQuery({}), "");
  assert.equal(contactRedirectQuery({ q: "", email: "", rule: "", page: "" }), "");
});

test("contactRedirectQuery keeps the active filters in a stable order", () => {
  assert.equal(contactRedirectQuery({ q: "ana", email: "1", rule: "r1", page: "2" }), "q=ana&email=1&rule=r1&page=2");
  assert.equal(contactRedirectQuery({ rule: "r1", q: "ana" }), "q=ana&rule=r1");
});

test("contactRedirectQuery takes the first value for array params and ignores unknown keys", () => {
  assert.equal(contactRedirectQuery({ q: ["ana", "bo"], page: ["3", "4"] }), "q=ana&page=3");
  assert.equal(contactRedirectQuery({ foo: "bar", q: "ana" }), "q=ana");
});

test("contactExportUrl builds the export URL from a raw search string", () => {
  assert.equal(contactExportUrl(""), "/app/contacts/export");
  assert.equal(contactExportUrl("?q=ana&email=1"), "/app/contacts/export?q=ana&email=1");
  assert.equal(contactExportUrl("q=ana&email=1"), "/app/contacts/export?q=ana&email=1");
  assert.equal(contactExportUrl("?tz=America%2FToronto"), "/app/contacts/export?tz=America%2FToronto");
});
