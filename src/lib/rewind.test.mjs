import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("./rewind.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function harness(failure) {
  const requests = [];
  const processed = [];
  const timestamp = (days) => new Date(Date.now() - days * 86_400_000).toISOString();
  const imports = (id) => {
    if (id === "@/lib/crypto") return { decryptToken: () => "token" };
    if (id === "@/lib/comments") return { processCommentEvents: async (events, scope) => {
      processed.push({ events, scope });
      return events.length;
    } };
    if (id === "@/lib/db") return { query: async (sql, params) => {
      if (sql.includes("dm_rules")) {
        assert.deepEqual(params, ["rule", "owner"]);
        return [{ id: "rule", social_account_id: "account" }];
      }
      assert.deepEqual(params, ["owner", "account"]);
      return [{ id: "account", external_id: "instagram", access_token_enc: "encrypted" }];
    } };
    throw new Error(`Unexpected import: ${id}`);
  };
  const fetch = async (url, options) => {
    const path = new URL(url);
    requests.push(path);
    assert.equal(options.headers.Authorization, "Bearer token");
    assert.ok(options.signal instanceof AbortSignal);
    if (path.pathname.endsWith("/media")) {
      assert.equal(path.searchParams.get("limit"), "25");
      return Response.json({ data: [{}, ...Array.from({ length: 26 }, (_, i) => ({ id: `old-${i}`, timestamp: timestamp(30) }))] });
    }
    assert.equal(path.searchParams.get("limit"), "50");
    if (failure === "all" || (failure && path.pathname.includes("/old-1/"))) {
      if (failure === "throw") throw new Error("Network unavailable");
      return new Response("Graph unavailable", { status: 503 });
    }
    return Response.json({ data: path.pathname.includes("/old-0/") ? [
      { id: "recent", text: "info", timestamp: timestamp(1), from: { id: "viewer" } },
      { id: "expired", text: "info", timestamp: timestamp(8), from: { id: "viewer" } },
    ] : [] });
  };
  const exports = {};
  new Function("require", "exports", "fetch", compiled)(imports, exports, fetch);
  return { run: () => exports.rewindRule("owner", "rule"), requests, processed };
}

test("recent comments on older posts reach replay; expired comments and excess posts do not", async () => {
  const scan = harness();
  assert.deepEqual(await scan.run(), { queued: 1, scanned: 1, failures: 0 });
  assert.equal(scan.requests.length, 26);
  assert.equal(scan.requests.at(-1).pathname, "/v21.0/old-24/comments");
  assert.deepEqual(scan.processed, [{ events: [{ accountExternalId: "instagram", commentId: "recent", text: "info", fromId: "viewer", fromUsername: null, mediaId: "old-0" }], scope: { userId: "owner", ruleId: "rule" } }]);
});

for (const failure of ["http", "throw"]) {
  test(`comment-fetch ${failure} failures preserve partial results and contribute to failures`, async () => {
    const scan = harness(failure);
    assert.deepEqual(await scan.run(), { queued: 1, scanned: 1, failures: 1 });
    assert.equal(scan.processed[0].events[0].commentId, "recent");
  });
}

test("a completely failed comment scan reports an error before replay", async () => {
  const scan = harness("all");
  await assert.rejects(scan.run(), /Could not scan past comments/);
  assert.equal(scan.processed.length, 0);
});
