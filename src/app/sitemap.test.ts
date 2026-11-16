import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import robots from "./robots.ts";
import { GET as llmsTxt } from "./llms.txt/route.ts";
import sitemap, { SITEMAP_LAST_MODIFIED } from "./sitemap.ts";
import nextConfig from "../../next.config.ts";
import { BRAND } from "@/lib/brand";
import { isPathIndexable } from "@/lib/indexability";
import { PUBLIC_PATHS } from "@/lib/public-pages";
import { toolMetadata } from "@/components/tools/seo";
import { GUIDES, guidePath } from "@/content/guides/registry";
import { INDEXNOW_KEY } from "@/lib/indexnow";

// Route file for a public path. Guide articles share one statically generated template
// (src/app/guides/[slug]/page.tsx), so a /guides/<slug> path maps to it only when the slug is in the registry.
function routeFile(p: string) {
  if (p === "/") return "src/app/page.tsx";
  const direct = join("src/app", p, "page.tsx");
  const guide = p.match(/^\/guides\/([^/]+)$/);
  if (!existsSync(direct) && guide && GUIDES.some((g) => g.slug === guide[1])) return "src/app/guides/[slug]/page.tsx";
  return direct;
}

// Runs fn with the site taken out of search (BRAND.indexable=false), restoring the launch value after.
function whileNoindex(fn: () => void) {
  const was = BRAND.indexable;
  BRAND.indexable = false;
  try {
    fn();
  } finally {
    BRAND.indexable = was;
  }
}

// Runs fn with the given env values, restoring the previous values after.
function withEnv(values: Record<string, string | undefined>, fn: () => void) {
  const previous = new Map<string, string | undefined>();
  for (const [key, value] of Object.entries(values)) {
    previous.set(key, process.env[key]);
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    fn();
  } finally {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test("sitemap stays empty while staging is noindex", () => {
  whileNoindex(() => assert.deepEqual(sitemap(), []));
});

test("sitemap excludes both audited noindex home URLs while noindex", () => {
  whileNoindex(() => {
    const urls = new Set(sitemap().map((entry) => entry.url));
    for (const url of ["https://poskoo.com/", "https://socialapp.splitforms.com/"]) {
      assert.equal(urls.has(url), false, `${url} must not be listed while it is noindex`);
    }
  });
});

test("sitemap filters the audited home path out even though it is a public path", () => {
  assert.ok(PUBLIC_PATHS.includes("/"), "home must be a public path for this regression to be meaningful");
  whileNoindex(() => {
    assert.equal(isPathIndexable("/"), false, "home is noindex while staging");
    assert.deepEqual(sitemap(), [], "noindex home must not be listed in the sitemap");
  });
});

test("sitemap is empty for both audited host aliases while staging is noindex", () => {
  const wasUrl = BRAND.url;
  try {
    whileNoindex(() => {
      for (const url of ["https://poskoo.com", "https://socialapp.splitforms.com"]) {
        BRAND.url = url;
        assert.deepEqual(sitemap(), [], `${url} must not list any noindex page`);
      }
    });
  } finally {
    BRAND.url = wasUrl;
  }
});

test("legacy staging host is never listed even when BRAND.indexable is forced true", () => {
  const wasUrl = BRAND.url;
  const was = BRAND.indexable;
  try {
    BRAND.indexable = true;
    for (const url of ["https://socialapp.splitforms.com", "https://www.socialapp.splitforms.com"]) {
      BRAND.url = url;
      assert.deepEqual(sitemap(), [], `${url} is noindex and must not appear in the sitemap`);
    }
  } finally {
    BRAND.url = wasUrl;
    BRAND.indexable = was;
  }
});

test("approved production host returns an empty sitemap while BRAND.indexable is false", () => {
  const wasUrl = BRAND.url;
  try {
    // Pin the approved production origin: the empty result must not depend on
    // NEXT_PUBLIC_SITE_URL happening to be unset in the test environment.
    BRAND.url = "https://poskoo.com";
    whileNoindex(() => {
      assert.deepEqual(sitemap(), [], "the approved production host must not list noindex pages");
    });
  } finally {
    BRAND.url = wasUrl;
  }
});

test("approved production host is populated only when BRAND.indexable is true", () => {
  const wasUrl = BRAND.url;
  const was = BRAND.indexable;
  try {
    BRAND.url = "https://poskoo.com";
    BRAND.indexable = true;
    const urls = sitemap().map((entry) => entry.url);
    assert.ok(urls.includes("https://poskoo.com/"), "the production sitemap must list the home page once indexing is enabled");
    assert.ok(urls.length > 0, "the production sitemap must not be empty once indexing is enabled");
  } finally {
    BRAND.url = wasUrl;
    BRAND.indexable = was;
  }
});

test("staging: sitemap omits the home page and robots omits the sitemap", () => {
  assert.equal(BRAND.indexable, false);
  assert.deepEqual(sitemap(), [], "noindex staging must list no URLs at all");
  assert.equal("sitemap" in robots(), false);
});

test("runtime env: poskoo.com is listed and socialapp.splitforms.com returns an empty sitemap", () => {
  const wasUrl = BRAND.url;
  try {
    BRAND.url = "https://poskoo.com";
    withEnv(
      { NEXT_PUBLIC_SITE_INDEXABLE: "true", NEXT_PUBLIC_SITE_URL: "https://poskoo.com" },
      () => {
        assert.ok(sitemap().length > 0, "poskoo.com must list its indexable pages");
        assert.equal("sitemap" in robots(), true, "poskoo.com robots.txt must point to the sitemap");
      },
    );
    withEnv(
      { NEXT_PUBLIC_SITE_INDEXABLE: "true", NEXT_PUBLIC_SITE_URL: "https://socialapp.splitforms.com" },
      () => {
        assert.deepEqual(sitemap(), [], "the noindex staging host must return zero URLs");
        assert.equal("sitemap" in robots(), false, "the noindex staging host must omit the sitemap directive");
      },
    );
  } finally {
    BRAND.url = wasUrl;
  }
});

test("llms.txt uses the same isPathIndexable helper as the sitemap", () => {
  const llmsSource = readFileSync("src/app/llms.txt/route.ts", "utf8");
  assert.ok(llmsSource.includes("isPathIndexable"), "llms.txt must use isPathIndexable");
});

test("every sitemap URL is indexable", () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    for (const entry of sitemap()) {
      const path = entry.url.slice(BRAND.url.length) || "/";
      assert.ok(isPathIndexable(path), `${entry.url} is noindex but listed in the sitemap`);
    }
  } finally {
    BRAND.indexable = was;
  }
});

test("admin descendants inherit noindex and stay out of the production sitemap", () => {
  const adminLayoutSource = readFileSync("src/app/admin/layout.tsx", "utf8");
  assert.ok(adminLayoutSource.includes("export const metadata: Metadata = { robots: { index: false, follow: false } };"), "admin layout must pass noindex and nofollow to its descendants");
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    const paths = sitemap().map((entry) => entry.url.slice(BRAND.url.length));
    assert.ok(!paths.some((path) => path === "/admin" || path.startsWith("/admin/")), "no /admin URL may be in the sitemap");
  } finally {
    BRAND.indexable = was;
  }
});

test("descendants of an always-noindex route are never indexable", () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    for (const path of ["/admin/users", "/data-deletion/status/abc", "/app/review-guide", "/login/help"]) {
      assert.equal(isPathIndexable(path), false, `${path} must inherit noindex from its parent route`);
    }
    assert.equal(isPathIndexable("/data-deletion"), true, "the public parent page stays indexable");
    assert.equal(isPathIndexable("/login-help"), true, "a string prefix must not match an unrelated sibling path");
    // Checkout/thank-you product pages and short-link redirects are noindex.
    for (const path of ["/p", "/p/sample", "/p/sample/success", "/l", "/l/abc123"]) {
      assert.equal(isPathIndexable(path), false, `${path} is a noindex flow page and must not be indexable`);
    }
  } finally {
    BRAND.indexable = was;
  }
});

test("sitemap and layout share the same indexability helper", () => {
  const sitemapSource = readFileSync("src/app/sitemap.ts", "utf8");
  const layoutSource = readFileSync("src/app/layout.tsx", "utf8");
  assert.ok(sitemapSource.includes("isPathIndexable"), "sitemap must use isPathIndexable");
  assert.ok(layoutSource.includes("isPathIndexable"), "layout robots meta must use isPathIndexable");
});

test("metadata routes evaluate indexability at request time, not build time", () => {
  for (const file of ["src/app/robots.ts", "src/app/sitemap.ts"]) {
    const source = readFileSync(file, "utf8");
    assert.match(
      source,
      /export const dynamic = "force-dynamic"/,
      `${file} must set force-dynamic so environment-controlled indexability is read per request`,
    );
  }
});

test("noindex mode returns an empty sitemap and omits the sitemap directive", () => {
  whileNoindex(() => {
    assert.deepEqual(sitemap(), [], "noindex staging must serve an empty sitemap");
    assert.equal("sitemap" in robots(), false, "noindex staging must omit the sitemap directive");
  });
});

test("robots omits the sitemap while staging is noindex", () => {
  whileNoindex(() => assert.equal("sitemap" in robots(), false));
});

test("sitemap.xml and robots.txt are configured never to be cached", async () => {
  const rules = (await nextConfig.headers?.()) ?? [];
  for (const source of ["/sitemap.xml", "/robots.txt"]) {
    const rule = rules.find((entry) => entry.source === source);
    assert.ok(rule, `${source} needs an explicit cache header rule`);
    const headers = new Map(rule.headers.map((header) => [header.key, header.value]));
    for (const key of ["Cache-Control", "CDN-Cache-Control", "Cloudflare-CDN-Cache-Control"]) {
      const value = headers.get(key);
      assert.ok(value, `${source} must set ${key}`);
      assert.match(value, /no-store/, `${source} ${key} must fail closed with no-store`);
    }
    assert.match(headers.get("Cache-Control") ?? "", /no-cache/, `${source} Cache-Control must include no-cache`);
    assert.doesNotMatch(headers.get("Cache-Control") ?? "", /public|s-maxage|max-age=[1-9]/, `${source} must not allow a cached copy`);
  }
});

test("robots disallows app pages for every crawler group", () => {
  const result = robots();
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
  assert.ok(rules.length > 0);
  for (const rule of rules) {
    for (const path of ["/app/", "/api/", "/l/"]) assert.ok(rule.disallow?.includes(path), `${path} must be disallowed`);
  }
});

test("robots names the major AI and search crawlers and allows public pages", () => {
  const result = robots();
  const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
  const agents = rules.flatMap((r) => [r.userAgent].flat());
  for (const bot of ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "PerplexityBot", "Google-Extended", "Bingbot", "Applebot-Extended"]) {
    assert.ok(agents.includes(bot), `${bot} missing from robots.txt`);
  }
  for (const rule of rules) assert.equal(rule.allow, "/");
});

test("sitemap uses one stable lastModified date across repeated calls", () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    assert.ok(SITEMAP_LAST_MODIFIED instanceof Date, "SITEMAP_LAST_MODIFIED must be a Date");
    assert.ok(!Number.isNaN(SITEMAP_LAST_MODIFIED.getTime()), "SITEMAP_LAST_MODIFIED must be a valid Date");
    const first = sitemap();
    const second = sitemap();
    assert.ok(first.length > 0, "the production sitemap must have entries for this regression");
    const firstTimes = first.map((entry) => new Date(entry.lastModified as Date | string).getTime());
    const secondTimes = second.map((entry) => new Date(entry.lastModified as Date | string).getTime());
    assert.deepEqual(secondTimes, firstTimes, "repeated sitemap calls must return the same lastModified values");
    for (const time of firstTimes) {
      assert.equal(time, SITEMAP_LAST_MODIFIED.getTime(), "every entry must use SITEMAP_LAST_MODIFIED");
    }
  } finally {
    BRAND.indexable = was;
  }
});

test("sitemap lists only indexable pages once BRAND.indexable is true", () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    const urls = sitemap().map((e) => e.url);
    assert.ok(urls.includes(`${BRAND.url}/`));
    assert.ok(urls.includes(`${BRAND.url}/pricing`));
    assert.ok(urls.includes(`${BRAND.url}/guides`));
    for (const guide of GUIDES) assert.ok(urls.includes(`${BRAND.url}${guidePath(guide.slug)}`), `${guide.slug} missing from sitemap`);
    for (const path of ["/login", "/signup", "/admin", "/data-deletion/status", "/app/review-guide"]) {
      assert.ok(!urls.includes(`${BRAND.url}${path}`), `${path} must not be in the sitemap`);
    }
    assert.ok(!urls.some((url) => url.includes("/app/")), "no /app/ URL may be in the sitemap");
    assert.ok(urls.length > 0);
  } finally {
    BRAND.indexable = was;
  }
});

test("robots points to the sitemap once BRAND.indexable is true", () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    const result = robots();
    assert.equal("sitemap" in result, true);
    assert.equal(result.sitemap, `${BRAND.url}/sitemap.xml`);
  } finally {
    BRAND.indexable = was;
  }
});

test("every PUBLIC_PATHS entry has a page.tsx route file", () => {
  for (const p of PUBLIC_PATHS) {
    const file = routeFile(p);
    assert.ok(existsSync(file), `PUBLIC_PATHS entry ${p} has no route file at ${file}`);
  }
});

test("every public page declares a canonical", () => {
  for (const p of PUBLIC_PATHS) {
    const file = routeFile(p);
    if (!existsSync(file)) continue; // missing route files are covered by the "real route file" test
    const text = readFileSync(file, "utf8");
    // Tool pages get their canonical from toolMetadata({ path }) (asserted below), and must pass their own path.
    const viaToolMetadata =
      text.includes("toolMetadata(") &&
      (text.includes(`path: "${p}"`) || (text.includes(`const PATH = "${p}";`) && text.includes("path: PATH")));
    assert.ok(text.includes("canonical") || viaToolMetadata, `public page ${p} has no canonical in ${file}`);
  }
});

test("toolMetadata sets the canonical, title, description and social card", () => {
  const meta = toolMetadata({ path: "/tools/x", title: "T", description: "D" });
  assert.equal(meta.alternates?.canonical, "/tools/x");
  // Short tool titles get the brand suffix (toolTitle); long ones stay as written.
  assert.deepEqual(meta.title, { absolute: `T | ${BRAND.name}` });
  const long = "A".repeat(55);
  assert.deepEqual(toolMetadata({ path: "/tools/x", title: long, description: "D" }).title, { absolute: long });
  assert.equal(meta.description, "D");
  assert.equal((meta.openGraph as { url?: string } | undefined)?.url, "/tools/x");
  assert.ok(meta.openGraph?.images, "tool pages carry an Open Graph image");
});

test("sitemap excludes every static route whose metadata is noindex", () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    const urls = new Set(sitemap().map((entry) => entry.url));
    const walk = (dir: string): string[] =>
      readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const full = join(dir, entry.name);
        return entry.isDirectory() ? walk(full) : [full];
      });
    for (const file of walk("src/app")) {
      if (!file.endsWith("page.tsx")) continue;
      if (readFileSync(file, "utf8").includes("index: false") === false) continue;
      const route = file
        .slice("src/app".length)
        .replace(/[\\/]page\.tsx$/, "")
        .replace(/\\/g, "/");
      if (route.includes("[") || route.split("/").some((part) => part.startsWith("("))) continue;
      assert.ok(
        !urls.has(`${BRAND.url}${route}`),
        `${route} sets noindex but is listed in the sitemap`,
      );
    }
  } finally {
    BRAND.indexable = was;
  }
});

test("no PUBLIC_PATHS entry is noindex", () => {
  for (const p of PUBLIC_PATHS) {
    const file = routeFile(p);
    const text = readFileSync(file, "utf8");
    assert.ok(!text.includes("robots: { index: false"), `PUBLIC_PATHS entry ${p} is noindex in ${file}`);
  }
});

test("every guide is a public page with a unique title (max 60) and description (140-160)", () => {
  const paths = new Set<string>(PUBLIC_PATHS);
  const titles = new Set<string>();
  const descriptions = new Set<string>();
  for (const guide of GUIDES) {
    assert.ok(paths.has(guidePath(guide.slug)), `${guide.slug} is not in PUBLIC_PATHS`);
    assert.ok(guide.title.length <= 60, `${guide.slug} title is ${guide.title.length} chars`);
    assert.ok(guide.description.length >= 140 && guide.description.length <= 160, `${guide.slug} description is ${guide.description.length} chars`);
    assert.ok(!titles.has(guide.title) && !descriptions.has(guide.description), `${guide.slug} repeats a title or description`);
    titles.add(guide.title);
    descriptions.add(guide.description);
    assert.ok(existsSync(join("public", guide.cover.src)), `${guide.slug} cover ${guide.cover.src} is missing`);
  }
});

test("llms.txt groups indexable pages and states plan prices from PLANS", async () => {
  const was = BRAND.indexable;
  BRAND.indexable = true;
  try {
    const text = await (await llmsTxt()).text();
    for (const heading of ["## Product", "## Schedulers", "## Free tools", "## Guides", "## Help", "## Alternatives", "## Plans (USD)"]) {
      assert.ok(text.includes(heading), `${heading} missing from llms.txt`);
    }
    assert.ok(text.includes("- Free: free forever."));
    assert.ok(text.includes("- Pro: $17 USD per month"));
    assert.ok(text.includes("- Agency: $35 USD per month"));
    assert.ok(text.includes("auto-DM works on Instagram only"));
    assert.ok(!/\]\([^)]*\/(app|api|l)\//.test(text), "llms.txt must not link private paths");
    for (const p of PUBLIC_PATHS) if (isPathIndexable(p)) assert.ok(text.includes(`](${BRAND.url}${p})`), `${p} missing from llms.txt`);
  } finally {
    BRAND.indexable = was;
  }
});

test("IndexNow key file is served from public/ and holds the key", () => {
  const body = readFileSync(join("public", `${INDEXNOW_KEY}.txt`), "utf8").trim();
  assert.match(INDEXNOW_KEY, /^[0-9a-f]{32}$/);
  assert.equal(body, INDEXNOW_KEY);
});
