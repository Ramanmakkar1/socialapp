import assert from "node:assert/strict";
import { test } from "node:test";
import nextConfig from "../../next.config.ts";

test("tool merge redirects (owner decision #280): 301s each duplicate tool to the version we keep", async () => {
  const redirects = await nextConfig.redirects?.();
  const expected: Array<{ source: string; destination: string }> = [
    { source: "/tools/tweet-generator", destination: "/tools/x-post-generator" },
    { source: "/tools/threads-caption-generator", destination: "/tools/threads-post-generator" },
    { source: "/tools/instagram-caption-formatter", destination: "/tools/instagram-line-break-generator" },
  ];
  for (const { source, destination } of expected) {
    const rule = redirects?.find((r) => r.source === source);
    assert.ok(rule, `missing redirect for ${source}`);
    assert.equal(rule.destination, destination);
    assert.equal(rule.permanent, true);
  }
});
