import assert from "node:assert/strict";
import { test } from "node:test";
import { publishNetworkTargets } from "./publish.ts";
import type { NetAccount } from "./common.ts";

const account = { id: "acc", platform: "tiktok", externalId: "open", username: "brew", accessToken: "t", meta: {} } as unknown as NetAccount;
const row = { id: "target-1", post_id: "post-1", caption_override: null, caption: "hi", media: [], user_id: "u" };

async function run(outcome: { ok: true; id: string; mediaPending?: boolean }) {
  const calls: string[] = [];
  await publishNetworkTargets(
    5,
    {
      claim: (() => { let done = false; return async () => (done ? [] : ((done = true), [row])); })(),
      markFailed: async () => {
        calls.push("failed");
      },
      refreshPostStatus: async () => {
        calls.push("refresh");
      },
      loadAccount: async () => account,
      ensureFresh: async (a) => a,
      publish: async () => outcome,
      markPublished: async () => {
        calls.push("published");
      },
      holdMedia: async (id) => {
        calls.push(`hold:${id}`);
      },
    },
    ["tiktok"],
  );
  return calls;
}

test("TikTok accepted but not PUBLISH_COMPLETE: the file is held before the post status is refreshed", async () => {
  assert.deepEqual(await run({ ok: true, id: "p_1", mediaPending: true }), ["published", "hold:target-1", "refresh"]);
});

test("confirmed publish: no hold, files can be released right away", async () => {
  assert.deepEqual(await run({ ok: true, id: "7300" }), ["published", "refresh"]);
});

test("TikTok status poll that never reaches PUBLISH_COMPLETE reports pending", async () => {
  const { pollTikTokStatus } = await import("./tiktok.ts");
  const fetchImpl = (async () =>
    new Response(JSON.stringify({ data: { status: "PROCESSING_DOWNLOAD" }, error: { code: "ok", message: "" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof fetch;
  const r = await pollTikTokStatus("t", "p_1", fetchImpl, async () => undefined);
  assert.deepEqual(r, { ok: true, postId: null, pending: true });
  const done = (async () =>
    new Response(JSON.stringify({ data: { status: "PUBLISH_COMPLETE", publicaly_available_post_id: ["73"] }, error: { code: "ok", message: "" } }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })) as unknown as typeof fetch;
  assert.deepEqual(await pollTikTokStatus("t", "p_1", done, async () => undefined), { ok: true, postId: "73" });
});
