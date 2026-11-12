import assert from "node:assert/strict";
import { test } from "node:test";
import { channelStatus, channelStatuses, cleanChannelRequest, envKey, unavailableStatus } from "./channelStatus.ts";

test("keys configured = ready; missing = awaiting approval or coming soon", () => {
  assert.equal(channelStatus("tiktok", true).state, "ready");
  const tk = channelStatus("tiktok", false);
  assert.equal(tk.state, "awaiting");
  assert.equal(tk.pill, "Awaiting TikTok approval");
  assert.match(tk.body, /TikTok/);
  assert.equal(channelStatus("pinterest", false).pill, "Awaiting Pinterest approval");
  assert.equal(channelStatus("x", false).pill, "Coming soon");
  assert.equal(channelStatus("linkedin_pages", false).pill, "Awaiting LinkedIn approval");
});

test("env override flips wording, but 'ready' still needs the keys", () => {
  assert.equal(channelStatus("x", false, "awaiting").pill, "Awaiting X approval");
  assert.equal(channelStatus("tiktok", true, "awaiting").state, "awaiting");
  assert.equal(channelStatus("gbp", false, "ready").state, "awaiting");
  assert.equal(channelStatus("gbp", true, "nonsense").state, "ready");
  assert.equal(envKey("linkedin_pages"), "CHANNEL_STATUS_LINKEDIN_PAGES");
  const all = channelStatuses({ tiktok: false, pinterest: true, x: false, gbp: false, linkedin_pages: false }, { CHANNEL_STATUS_X: "soon", CHANNEL_STATUS_GBP: "soon" });
  assert.equal(all.pinterest.state, "ready");
  assert.equal(all.gbp.pill, "Coming soon");
  assert.equal(all.tiktok.state, "awaiting");
});

test("generic unavailable status and request cleaning", () => {
  assert.equal(unavailableStatus("Threads").state, "soon");
  assert.deepEqual(cleanChannelRequest("  Reddit   ", "  for my sub \r\n "), { channel: "Reddit", note: "for my sub" });
  assert.deepEqual(cleanChannelRequest("Tumblr", ""), { channel: "Tumblr", note: null });
  assert.equal(cleanChannelRequest(" a ", ""), null);
  assert.equal(cleanChannelRequest("x".repeat(200), "")?.channel.length, 80);
});
