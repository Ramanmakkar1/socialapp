import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import sitemap from "./sitemap.ts";
import { BRAND } from "@/lib/brand";
import { canonicalUrl } from "@/lib/canonical";
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
    pageSource.includes('const canonical = canonicalUrl("/");'),
    "home page must build the canonical via canonicalUrl('/')",
  );
  assert.ok(
    pageSource.includes("alternates: { canonical }"),
    "home page must set alternates.canonical to the absolute canonical",
  );
  assert.ok(
    pageSource.includes('const description = PAGE_DESCRIPTIONS["/"];'),
    "home page description must come from PAGE_DESCRIPTIONS['/']",
  );
  assert.equal(PAGE_DESCRIPTIONS["/"].length > 0, true);
});

test("home page canonical is an absolute https URL on the final domain with no query string", () => {
  // The canonical must end with the trailing slash. new URL("/", base) drops it
  // (it returns the bare origin), and the audit compares the tag against the
  // audited URL https://poskoo.com/ — canonicalUrl("/") preserves it.
  const canonical = canonicalUrl("/");
  assert.equal(canonical, `${BRAND.canonicalUrl}/`, "canonical must be the final domain root with a trailing slash");
  assert.ok(canonical.startsWith("https://"), "canonical must be https");
  assert.ok(!canonical.includes("?"), "canonical must have no query string");
  assert.ok(
    pageSource.includes('const canonical = canonicalUrl("/");'),
    "home page must build the canonical via canonicalUrl('/') so the trailing slash is kept",
  );
});

test("home page canonical is a self-reference on the final domain, not the staging host", () => {
  // Regression guard for the "Missing canonical" audit: Next resolves the
  // absolute canonical against metadataBase, so both must stay on BRAND.canonicalUrl.
  assert.ok(
    layoutSource.includes("metadataBase: new URL(BRAND.canonicalUrl)"),
    "layout metadataBase must be built from BRAND.canonicalUrl so canonicals resolve absolutely",
  );
  const canonical = canonicalUrl("/");
  assert.equal(canonical, `${BRAND.canonicalUrl}/`);
  assert.ok(!canonical.includes("splitforms.com"), "canonical must not point at the staging host");
  assert.ok(!/\?|#/.test(canonical), "canonical must contain no query string or fragment");
  // The Open Graph URL must be the same final-domain self-reference, and the
  // staging host must never leak into the home page metadata source.
  assert.ok(
    pageSource.includes("url: canonical"),
    "home page openGraph.url must reuse the absolute canonical",
  );
  assert.ok(
    !pageSource.includes("splitforms.com"),
    "home page metadata must not hard-code the staging host",
  );
});

test("audited staging URL serves one clean canonical on the final domain", () => {
  // The daily audit still probes https://socialapp.splitforms.com/, the old
  // staging host. Its head must not leak that host: the home metadata always
  // points at BRAND.url. Guard against a duplicated or missing trailing slash
  // so the tag is exactly https://poskoo.com/.
  const audited = "https://socialapp.splitforms.com/";
  assert.equal(new URL(audited).hostname, "socialapp.splitforms.com");
  assert.equal(BRAND.url.endsWith("/"), false, "BRAND.url must not carry a trailing slash");
  const canonical = canonicalUrl("/");
  assert.equal(canonical, `${BRAND.canonicalUrl}/`);
  assert.equal(new URL(canonical).hostname, new URL(BRAND.canonicalUrl).hostname);
  assert.notEqual(new URL(canonical).hostname, new URL(audited).hostname);
  assert.ok(!canonical.includes("//", "https://".length), "canonical must have a single slash at the root");
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

test("home page WebPage node uses BRAND.url as its stable @id and url", () => {
  // The audit requires the home WebPage to be identified by the bare home URL,
  // not a fragment-suffixed @id, so the entity resolves to https://poskoo.com.
  assert.ok(
    homeJsonLdSource.includes('"@id": BRAND.url,'),
    "WebPage @id must be exactly BRAND.url",
  );
  assert.ok(
    homeJsonLdSource.includes("url: BRAND.url,"),
    "WebPage url must be BRAND.url",
  );
  assert.ok(
    homeJsonLdSource.includes("publisher: { \"@id\": BRAND.url + \"#org\" },"),
    "WebPage publisher must reference the Organization node via BRAND.url",
  );
  assert.ok(
    homeJsonLdSource.includes('"@type": "WebPage"'),
    "home page JSON-LD must include a WebPage node",
  );
  assert.ok(
    homeJsonLdSource.includes("url: BRAND.url,"),
    "WebPage must use the production root URL expression",
  );
  assert.ok(
    homeJsonLdSource.includes('inLanguage: "en",'),
    "WebPage must declare inLanguage en",
  );
  assert.ok(
    homeJsonLdSource.includes('isPartOf: { "@id": BRAND.url + "#website" },'),
    "WebPage isPartOf must point at the WebSite node via BRAND.url",
  );
  assert.ok(
    !homeJsonLdSource.includes("BRAND.canonicalUrl"),
    "homepage JSON-LD must not reference the nonexistent BRAND.canonicalUrl",
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
    pageSource.includes("alternates: { canonical }"),
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

test("homepage step illustrations keep descriptive alt text", () => {
  // Regression guard for the empty-alt audit: each of the three "How Poskoo
  // works" images must carry descriptive alt text, not alt="".
  const steps = [
    { src: "/landing/step-connect.webp", alt: "connecting a social account on a phone, linking Instagram, Facebook and Threads" },
    { src: "/landing/step-schedule.webp", alt: "placing photo posts on a wall calendar beside an alarm clock" },
    { src: "/landing/step-dm.webp", alt: "catching an envelope flying from a phone, showing an automatic DM after a keyword comment" },
  ];
  for (const { src, alt } of steps) {
    const tag = pageSource.match(new RegExp(`<Image[^>]*src="${src}"[^>]*>`))?.[0];
    assert.ok(tag, `homepage must render the ${src} step illustration`);
    assert.ok(!tag.includes('alt=""'), `${src} must not use an empty alt attribute`);
    assert.ok(tag.includes(alt), `${src} alt text must describe ${alt}`);
  }
});
