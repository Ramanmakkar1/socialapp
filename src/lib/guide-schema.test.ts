import assert from "node:assert/strict";
import { test } from "node:test";
import { GUIDES } from "@/content/guides/registry";
import { guideArticleJsonLd } from "@/lib/guide-schema";

const ORIGIN = "https://poskoo.com";

type Node = Record<string, unknown>;

function graphOf(guide: (typeof GUIDES)[number]): Node[] {
  // Round-trip through JSON so the test sees exactly what the page serialises.
  const data = JSON.parse(JSON.stringify(guideArticleJsonLd(guide))) as { "@graph": Node[] };
  return data["@graph"];
}

test("every guide emits a complete BlogPosting on the production canonical", () => {
  assert.ok(GUIDES.length > 0, "the guide registry must not be empty");

  for (const guide of GUIDES) {
    const graph = graphOf(guide);
    const article = graph.find((node) => node["@type"] === "BlogPosting");
    assert.ok(article, `${guide.slug}: BlogPosting node is missing`);

    assert.equal(article.headline, guide.h1, `${guide.slug}: headline must be the H1`);
    assert.equal(article.datePublished, guide.published, `${guide.slug}: datePublished`);
    assert.equal(article.dateModified, guide.updated, `${guide.slug}: dateModified`);

    const author = article.author as Node | undefined;
    assert.ok(author?.name, `${guide.slug}: author.name is missing`);
    assert.equal(author.name, guide.author, `${guide.slug}: author.name must match the byline`);

    const images = article.image as string[];
    assert.ok(Array.isArray(images) && images.length > 0, `${guide.slug}: image is missing`);
    for (const image of images) {
      assert.ok(image.startsWith(`${ORIGIN}/`), `${guide.slug}: image must be absolute on poskoo.com, got ${image}`);
    }

    for (const node of graph) {
      const id = node["@id"];
      if (typeof id === "string") {
        assert.ok(id.startsWith(ORIGIN), `${guide.slug}: @id must start with ${ORIGIN}, got ${id}`);
      }
    }
  }
});

test("guide JSON-LD never uses the env/staging BRAND.url", () => {
  for (const guide of GUIDES) {
    const serialised = JSON.stringify(guideArticleJsonLd(guide));
    assert.ok(!serialised.includes("socialapp.splitforms.com"), `${guide.slug}: staging host leaked into JSON-LD`);
  }
});
