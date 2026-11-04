import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BIO_LIMIT,
  BIO_TEMPLATES,
  NICHES,
  bioLength,
  fillBio,
} from "./bioTemplates.ts";

test("fillBio replaces all placeholders", () => {
  const out = fillBio("Hi {name}\n{what}\n{cta}", {
    name: "Alex",
    what: "Design",
    cta: "Link in bio",
  });
  assert.equal(out, "Hi Alex\nDesign\nLink in bio");
  assert.ok(!out.includes("{"));
});

test("fillBio drops empty lines after trim", () => {
  const out = fillBio("  {name}  \n\n  \n{what}", {
    name: "",
    what: "Photos",
    cta: "DM me",
  });
  assert.equal(out, "Photos");
});

test("bioLength counts emoji as one character", () => {
  assert.equal(bioLength("✨"), 1);
});

test("every template with short samples stays at or under BIO_LIMIT", () => {
  const sample = { name: "Jo", what: "Art", cta: "DM me" };
  for (const niche of NICHES) {
    for (const template of BIO_TEMPLATES[niche.id]) {
      const filled = fillBio(template, sample);
      assert.ok(
        bioLength(filled) <= BIO_LIMIT,
        `${niche.id}: ${bioLength(filled)} chars`,
      );
    }
  }
});
