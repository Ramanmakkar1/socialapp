import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import sitemap from "./sitemap.ts";
import { BRAND } from "@/lib/brand";
import { isPathIndexable } from "@/lib/indexability";
import { PAGE_DESCRIPTIONS } from "@/lib/public-pages";

// page.tsx imports next/font and a CSS module, so it cannot be imported in a
// node:test process. Read the source instead and lock the exact expressions.
const pageSource = readFileSync("src/app/page.tsx", "utf8");
const layoutSource = readFileSync("src/app/layout.tsx", "utf8");
const homeJsonLdSource = readFileSync("src/app/homeJsonLd.ts", "utf8");

test("staging homepage is noindex and excluded from the sitemap", () => {
  assert.equal(BRAND.indexable, false);
  assert.equal(isPathIndexable("/"), false, "home page must be noindex while staging");
  assert.ok(
    layoutSource.includes('robots: isPathIndexable("/") ? { index: true, follow: true } : { index: false, follow: false }'),
    "root layout must emit noindex from the shared indexability helper",
  );
  const urls = sitemap().map((e) => e.url);
  assert.equal(urls.includes(`${BRAND.url}/`), false, "sitemap must exclude the home page");
  assert.ok(!urls.some((u) => u.includes("/app/") || u.endsWith("/login") || u.endsWith("/signup")), "private pages must stay out");
});

test("homepage title matches the keyword-first template and is 50–60 characters", () => {
  const title = `Instagram Scheduler & Auto-DM Automation Tool | ${BRAND.name}`;
  assert.ok(
    pageSource.includes("const title = `Instagram Scheduler & Auto-DM Automation Tool | ${BRAND.name}`;"),
    "homepage title must use the Instagram scheduler keyword-first, brand-last template",
  );
  assert.ok(title.length >= 50 && title.length <= 60, `homepage title is ${title.length} characters: ${title}`);
});

test("home page canonical and description match the shared values", () => {
  assert.ok(
    pageSource.includes("const canonical = HOME_CANONICAL;"),
    "home page canonical must be HOME_CANONICAL",
  );
  assert.ok(
    !pageSource.includes("socialapp.splitforms.com"),
    "home page must never point at the legacy staging host",
  );
  assert.ok(pageSource.includes("alternates: { canonical: HOME_CANONICAL }"), "home page must set alternates.canonical");
  assert.ok(pageSource.includes('const description = PAGE_DESCRIPTIONS["/"];'), "home page description must come from PAGE_DESCRIPTIONS['/']");
  assert.equal(PAGE_DESCRIPTIONS["/"].length > 0, true);
});

test("home page JSON-LD includes WebPage, SoftwareApplication and FAQPage", () => {
  assert.ok(
    homeJsonLdSource.includes('"@type": "WebPage"'),
    "home page JSON-LD must include a WebPage node",
  );
  assert.ok(
    homeJsonLdSource.includes('"@type": "SoftwareApplication"'),
    "home page JSON-LD must include a SoftwareApplication node",
  );
  assert.ok(
    homeJsonLdSource.includes('"@type": "FAQPage"'),
    "home page JSON-LD must include a FAQPage node",
  );
});

test("home page WebPage node uses BRAND.canonicalUrl as its stable @id and url", () => {
  // The audit requires the home WebPage to be identified by the bare canonical
  // URL, not a fragment-suffixed @id or the staging host, so the entity resolves
  // to https://poskoo.com and shares its @id with the root layout's graph.
  assert.ok(
    homeJsonLdSource.includes('"@id": BRAND.canonicalUrl,'),
    "WebPage @id must be exactly BRAND.canonicalUrl",
  );
  assert.ok(
    homeJsonLdSource.includes("url: BRAND.canonicalUrl,"),
    "WebPage url must be BRAND.canonicalUrl",
  );
  assert.ok(
    homeJsonLdSource.includes("publisher: { \"@id\": BRAND.canonicalUrl + \"#org\" },"),
    "WebPage publisher must reference the Organization node via BRAND.canonicalUrl",
  );
  assert.ok(
    homeJsonLdSource.includes('"@type": "WebPage"'),
    "home page JSON-LD must include a WebPage node",
  );
  assert.ok(
    homeJsonLdSource.includes('inLanguage: "en",'),
    "WebPage must declare inLanguage en",
  );
  assert.ok(
    homeJsonLdSource.includes('isPartOf: { "@id": BRAND.canonicalUrl + "#website" },'),
    "WebPage isPartOf must point at the WebSite node via BRAND.canonicalUrl",
  );
  assert.ok(
    !homeJsonLdSource.includes("BRAND.url"),
    "homepage JSON-LD must not point at the env/staging URL override",
  );
});

test("homepage JSON-LD includes a BreadcrumbList with the canonical root URL", () => {
  assert.ok(
    homeJsonLdSource.includes('"@type": "BreadcrumbList"'),
    "homepage JSON-LD must include a BreadcrumbList node",
  );
  assert.ok(
    homeJsonLdSource.includes('name: "Home",'),
    "BreadcrumbList must include a Home item",
  );
  assert.ok(
    homeJsonLdSource.includes("item: BRAND.canonicalUrl,"),
    "BreadcrumbList Home item must point at the canonical root URL",
  );
});

test("home page imports the exported homePageJsonLd helper and renders its script", () => {
  // Regression guard for no_schema: the page must import the same helper name
  // that homeJsonLd.ts exports, and the rendered page must still emit the
  // application/FAQ JSON-LD script.
  assert.ok(
    homeJsonLdSource.includes("export const homePageJsonLd ="),
    "homeJsonLd.ts must export homePageJsonLd",
  );
  assert.ok(
    pageSource.includes('import { homePageJsonLd } from "./homeJsonLd";'),
    "page.tsx must import homePageJsonLd from ./homeJsonLd",
  );
  assert.ok(
    pageSource.includes("const jsonLd = homePageJsonLd(faqList, r, title);"),
    "page.tsx must call the imported homePageJsonLd helper with the homepage title",
  );
  assert.ok(
    pageSource.includes('type="application/ld+json"'),
    "home page must render an application/ld+json script",
  );
  assert.ok(
    pageSource.includes("dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd)"),
    "home page must serialise the JSON-LD graph into the script",
  );
});

test("homepage route owns robots metadata and still renders the full JSON-LD graph", () => {
  // Regression guard for noindex_in_sitemap, missing_canonical and no_schema:
  // the home route must keep its own robots directive (not rely on inheritance)
  // while the rendered page still ships Organization, WebSite,
  // SoftwareApplication and FAQPage nodes.
  assert.ok(
    pageSource.includes('robots: isPathIndexable("/") ? { index: true, follow: true } : { index: false, follow: false },'),
    "home page source must own the explicit robots directive from the shared indexability helper",
  );
  assert.equal(
    pageSource.match(/import \{ isPathIndexable \} from "@\/lib\/indexability";/g)?.length,
    1,
    "home page must import isPathIndexable exactly once",
  );
  assert.ok(
    pageSource.includes("alternates: { canonical: HOME_CANONICAL }"),
    "home page source must keep the absolute self-canonical",
  );
  const rendered = `${layoutSource}\n${pageSource}\n${homeJsonLdSource}`;
  for (const type of ["Organization", "WebSite", "WebPage", "SoftwareApplication", "FAQPage"]) {
    assert.ok(
      rendered.includes(`"@type": "${type}"`),
      `homepage route must render ${type} JSON-LD`,
    );
  }
});

test("homepage robots directive is conditional, not a hardcoded noindex", () => {
  // The audit conflict is only cleared if the home route emits noindex while
  // staging AND index,follow once production indexing is approved. Guard both
  // branches so a future edit cannot collapse this to a single hardcoded value.
  const directive = pageSource.match(/robots: isPathIndexable\("\/"\) \? (\{[^}]*\}) : (\{[^}]*\}),/);
  assert.ok(directive, "home page must declare a conditional robots directive from isPathIndexable('/')");
  assert.equal(directive[1], "{ index: true, follow: true }", "approved production branch must be index,follow");
  assert.equal(directive[2], "{ index: false, follow: false }", "staging branch must be noindex,nofollow");
  assert.equal(isPathIndexable("/"), false, "staging must currently resolve the home page to noindex,nofollow");
});

