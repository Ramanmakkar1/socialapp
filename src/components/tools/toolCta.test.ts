import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { BRAND } from "@/lib/brand";
import { networkAvailability, availabilityPhrase } from "@/components/ChannelStatusNote";
import { LIVE_PLATFORMS_TEXT } from "@/lib/platform-support";
import { toolByHref, toolPlatform } from "./registry";

const templateSource = readFileSync("src/components/tools/ToolPageTemplate.tsx", "utf8");

/** Re-implements ctaForPlatform using the same pure dependencies, for node:test (no next/font). */
function ctaForPlatform(config: {
  path: string;
  cta?: { title: string; mark: string; text: string; art?: string; artLabel?: string };
}): { title: string; mark: string; text: string; art?: string; artLabel?: string } | undefined {
  const tool = toolByHref(config.path);
  if (!tool) return config.cta;
  const platform = toolPlatform(tool);
  if (platform !== "tiktok" && platform !== "x" && platform !== "pinterest") return config.cta;
  const state = networkAvailability(platform);
  if (state === "live") return config.cta;
  const name = platform === "tiktok" ? "TikTok" : platform === "x" ? "X" : "Pinterest";
  const base = config.cta ?? {
    title: "Post it on time,",
    mark: "then DM every commenter",
    text: `Schedule the post with ${BRAND.name}, and send your link to everyone who comments a keyword, on the official Meta API.`,
  };
  return {
    ...base,
    text: `${name} publishing in ${BRAND.name} is ${availabilityPhrase(state, name)}. Until then, schedule posts to ${LIVE_PLATFORMS_TEXT} on one calendar.`,
  };
}

test("TikTok tool CTA does not say publish them automatically", () => {
  const cta = ctaForPlatform({ path: "/tools/tiktok-hashtag-generator" });
  assert.ok(cta);
  assert.ok(!cta.text.includes("publish them automatically"));
});

test("Instagram tool CTA keeps its original text", () => {
  const original = `Plan your Instagram posts with ${BRAND.name} and publish them automatically.`;
  const cta = ctaForPlatform({
    path: "/tools/instagram-hashtag-generator",
    cta: { title: "Post it on time,", mark: "then DM every commenter", text: original },
  });
  assert.equal(cta?.text, original);
});

test("CTA keeps its title", () => {
  const cta = ctaForPlatform({ path: "/tools/tiktok-hashtag-generator" });
  assert.equal(cta?.title, "Post it on time,");
});

test("ToolPageTemplate uses ctaForPlatform for the CTA band", () => {
  assert.match(templateSource, /<ToolCta cta=\{ctaForPlatform\(config\)\} \/>/);
});
