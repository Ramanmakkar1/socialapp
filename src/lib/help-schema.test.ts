import assert from "node:assert/strict";
import { test } from "node:test";
import { BRAND } from "./brand";
import { helpArticleJsonLd } from "./help-schema";
import { ldJson } from "./tool-schema";

type Node = Record<string, unknown>;

const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Parse exactly what the page serialises into the <script type="application/ld+json"> tag.
function parse(): Node {
  return JSON.parse(
    ldJson(
      helpArticleJsonLd({
        headline: "How to schedule Instagram posts",
        description: "Schedule Instagram posts in Poskoo: connect your account, pick a time and it auto-publishes.",
        path: "/help/schedule-instagram-posts",
        datePublished: "2026-11-07",
        dateModified: "2026-11-14",
      }),
    ),
  ) as Node;
}

test("helpArticleJsonLd emits a complete Article with real dates", () => {
  const node = parse();

  assert.equal(node["@context"], "https://schema.org");
  assert.equal(node["@type"], "Article");
  assert.equal(node.headline, "How to schedule Instagram posts");
  assert.ok(node.description, "description is missing");

  assert.equal(node.datePublished, "2026-11-07");
  assert.equal(node.dateModified, "2026-11-14");
  assert.match(String(node.datePublished), DATE, "datePublished must be YYYY-MM-DD");
  assert.match(String(node.dateModified), DATE, "dateModified must be YYYY-MM-DD");

  const author = node.author as Node;
  assert.equal(author["@type"], "Organization");
  assert.equal(author.name, BRAND.company);
  assert.equal(author.url, BRAND.canonicalUrl);

  const publisher = node.publisher as Node;
  assert.equal(publisher["@id"], `${BRAND.canonicalUrl}#org`);

  const image = String(node.image);
  assert.ok(image.startsWith(`${BRAND.canonicalUrl}/`), `image must be absolute, got ${image}`);

  const mainEntityOfPage = String(node.mainEntityOfPage);
  assert.ok(
    mainEntityOfPage.startsWith(`${BRAND.canonicalUrl}/help/`),
    `mainEntityOfPage must be absolute on the canonical origin, got ${mainEntityOfPage}`,
  );
});

test("helpArticleJsonLd never emits aggregateRating or review", () => {
  const serialised = ldJson(parse());
  assert.ok(!serialised.includes("aggregateRating"), "aggregateRating must not be emitted");
  assert.ok(!serialised.includes('"review"'), "review must not be emitted");
});
