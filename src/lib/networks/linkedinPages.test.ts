import assert from "node:assert/strict";
import { test } from "node:test";
import { linkedinPagesFlag, linkedinScopes, postableOrgUrns } from "./linkedin.ts";

test("LinkedIn Pages flag: LINKEDIN_PAGES_ENABLED (or the old LINKEDIN_COMPANY_PAGES)", () => {
  assert.equal(linkedinPagesFlag({}), false);
  assert.equal(linkedinPagesFlag({ LINKEDIN_PAGES_ENABLED: "1" }), true);
  assert.equal(linkedinPagesFlag({ LINKEDIN_PAGES_ENABLED: "true" }), true);
  assert.equal(linkedinPagesFlag({ LINKEDIN_PAGES_ENABLED: "0" }), false);
  assert.equal(linkedinPagesFlag({ LINKEDIN_COMPANY_PAGES: "1" }), true);
});

test("organization scopes only when Pages are enabled", () => {
  const saved = process.env.LINKEDIN_PAGES_ENABLED;
  delete process.env.LINKEDIN_PAGES_ENABLED;
  delete process.env.LINKEDIN_COMPANY_PAGES;
  assert.ok(!linkedinScopes().includes("w_organization_social"));
  process.env.LINKEDIN_PAGES_ENABLED = "1";
  assert.ok(linkedinScopes().includes("w_organization_social"));
  assert.ok(linkedinScopes().includes("r_organization_social"));
  if (saved === undefined) delete process.env.LINKEDIN_PAGES_ENABLED;
  else process.env.LINKEDIN_PAGES_ENABLED = saved;
});

test("organizationAcls: only approved administrators / content admins, no duplicates", () => {
  const urns = postableOrgUrns([
    { organization: "urn:li:organization:1", role: "ADMINISTRATOR", state: "APPROVED" },
    { organization: "urn:li:organization:2", role: "CONTENT_ADMINISTRATOR", state: "APPROVED" },
    { organization: "urn:li:organization:3", role: "ANALYST", state: "APPROVED" },
    { organization: "urn:li:organization:4", role: "ADMINISTRATOR", state: "REQUESTED" },
    { organization: "urn:li:organization:1", role: "CONTENT_ADMINISTRATOR", state: "APPROVED" },
    { organization: "urn:li:person:9", role: "ADMINISTRATOR" },
  ]);
  assert.deepEqual(urns, ["urn:li:organization:1", "urn:li:organization:2"]);
  assert.deepEqual(postableOrgUrns(null), []);
});
