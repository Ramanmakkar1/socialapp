#!/usr/bin/env node
// Submit every URL in the live sitemap to IndexNow (one POST reaches Bing, Yandex and the
// other IndexNow engines). Run after a deploy, once public/<key>.txt is live on poskoo.com:
//
//   node scripts/indexnow-submit.mjs            # submit
//   node scripts/indexnow-submit.mjs --dry-run  # list what would be sent, send nothing
//
// Options: --site=https://poskoo.com  --sitemap=<url>  (defaults to <site>/sitemap.xml)
// The key comes from src/lib/indexnow.ts so the script and the key file never drift.
import { readFileSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  }),
);
const site = String(args.site || "https://poskoo.com").replace(/\/+$/, "");
const host = new URL(site).host;
const sitemapUrl = String(args.sitemap || `${site}/sitemap.xml`);
const dryRun = Boolean(args["dry-run"]);

const src = readFileSync(new URL("../src/lib/indexnow.ts", import.meta.url), "utf8");
const key = src.match(/INDEXNOW_KEY = "([0-9a-f]{32})"/)?.[1];
if (!key) throw new Error("INDEXNOW_KEY not found in src/lib/indexnow.ts");
const keyLocation = `${site}/${key}.txt`;

const xml = await (await fetch(sitemapUrl)).text();
const urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)]
  .map((m) => m[1].replace(/&amp;/g, "&"))
  .filter((u) => new URL(u).host === host);
if (urls.length === 0) throw new Error(`No ${host} URLs found in ${sitemapUrl}`);
console.log(`${urls.length} URLs from ${sitemapUrl}`);

if (dryRun) {
  console.log(urls.join("\n"));
  console.log(`\nDry run: would POST to https://api.indexnow.org/indexnow with key ${key} (${keyLocation}).`);
  process.exit(0);
}

// IndexNow rejects the batch (403) if the key file is missing, so check it first.
const keyRes = await fetch(keyLocation);
const keyBody = keyRes.ok ? (await keyRes.text()).trim() : "";
if (keyBody !== key) {
  console.error(`Key file ${keyLocation} is not live (HTTP ${keyRes.status}). Deploy public/${key}.txt first.`);
  process.exit(1);
}

// The protocol allows up to 10,000 URLs per request.
for (let i = 0; i < urls.length; i += 10000) {
  const urlList = urls.slice(i, i + 10000);
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host, key, keyLocation, urlList }),
  });
  // 200 = accepted, 202 = accepted, key validation pending. Anything else is an error.
  console.log(`IndexNow: HTTP ${res.status} for ${urlList.length} URLs ${await res.text()}`.trim());
  if (res.status !== 200 && res.status !== 202) process.exitCode = 1;
}
