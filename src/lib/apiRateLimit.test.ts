import test from "node:test";
import assert from "node:assert/strict";
import { apiTier } from "./apiRateLimit.ts";

test("webhooks, jobs and health are exempt", () => {
  for (const p of ["/api/health", "/api/jobs/send-dms", "/api/meta/webhook", "/api/stripe/webhook", "/api/stripe/billing-webhook", "/api/instagram/deauthorize"]) {
    assert.equal(apiTier(p), null, p);
  }
});

test("non-api paths are not limited here", () => {
  assert.equal(apiTier("/pricing"), null);
});

test("tiers", () => {
  assert.equal(apiTier("/api/instagram/connect")?.name, "auth");
  assert.equal(apiTier("/api/tiktok/callback")?.name, "auth");
  assert.equal(apiTier("/api/auth/google/start")?.name, "auth");
  assert.equal(apiTier("/api/media/upload")?.name, "upload");
  assert.equal(apiTier("/api/media/abc/def.jpg")?.limit, 600);
  assert.equal(apiTier("/api/mcp")?.name, "mcp");
  assert.equal(apiTier("/api/reminders/done")?.name, "api");
});
