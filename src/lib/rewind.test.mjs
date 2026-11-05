import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("./rewind.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function harness({ mediaPages, commentPages, fail } = {}) {
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
  const failRequest = (path) => {
    const mode = fail ? fail(path, path.searchParams.get("after")) : null;
    if (!mode) return false;
    if (mode === "throw") throw new Error("Network unavailable");
    return new Response("Graph unavailable", { status: 503 });
  };
  const fetch = async (url, options) => {
    const path = new URL(url);
    requests.push(path);
    assert.equal(options.headers.Authorization, "Bearer token");
    assert.ok(options.signal instanceof AbortSignal);
    const after = path.searchParams.get("after");
    if (path.pathname.endsWith("/media")) {
      assert.equal(path.searchParams.get("limit"), "25");
      const failed = failRequest(path);
      if (failed) return failed;
      return Response.json(mediaPages
        ? mediaPages(after)
        : { data: [{}, ...Array.from({ length: 26 }, (_, i) => ({ id: `old-${i}`, timestamp: timestamp(30) }))] });
    }
    assert.equal(path.searchParams.get("limit"), "50");
    const failed = failRequest(path);
    if (failed) return failed;
    const mediaId = path.pathname.split("/").at(-2);
    return Response.json(commentPages
      ? commentPages(mediaId, after)
      : mediaId === "old-0"
        ? { data: [
            { id: "recent", text: "info", timestamp: timestamp(1), from: { id: "viewer" } },
            { id: "expired", text: "info", timestamp: timestamp(8), from: { id: "viewer" } },
          ] }
        : { data: [] });
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

test("media paging follows the after cursor across short pages until exhausted", async () => {
  const ids = ["a", "b", "c", "d", "e", "f"];
  const mediaPages = (after) => {
    if (after === null) return { data: ids.slice(0, 2).map((id) => ({ id })), paging: { cursors: { after: "p1" } } };
    if (after === "p1") return { data: ids.slice(2, 4).map((id) => ({ id })), paging: { cursors: { after: "p2" } } };
    return { data: ids.slice(4).map((id) => ({ id })) };
  };
  const scan = harness({ mediaPages });
  assert.deepEqual(await scan.run(), { queued: 0, scanned: 0, failures: 0 });
  assert.deepEqual(
    scan.requests.filter((r) => r.pathname.endsWith("/media")).map((r) => r.searchParams.get("after")),
    [null, "p1", "p2"],
  );
  assert.equal(scan.requests.length, 9);
});

test("media and comment caps stop paging at 25 posts and 50 comments", async () => {
  const recent = (id) => ({ id, text: "info", timestamp: new Date().toISOString(), from: { id: "viewer" } });
  const mediaIds = Array.from({ length: 30 }, (_, i) => `m${i}`);
  const mediaPages = (after) => {
    if (after === null) return { data: mediaIds.slice(0, 20).map((id) => ({ id })), paging: { cursors: { after: "a1" } } };
    return { data: mediaIds.slice(20).map((id) => ({ id })), paging: { cursors: { after: "a2" } } };
  };
  const commentPages = (mediaId, after) => {
    if (mediaId !== "m0") return { data: [] };
    if (after === null) return { data: Array.from({ length: 30 }, (_, i) => recent(`c${i}`)), paging: { cursors: { after: "b1" } } };
    return { data: Array.from({ length: 25 }, (_, i) => recent(`d${i}`)), paging: { cursors: { after: "b2" } } };
  };
  const scan = harness({ mediaPages, commentPages });
  assert.deepEqual(await scan.run(), { queued: 50, scanned: 50, failures: 0 });
  assert.equal(scan.requests.filter((r) => r.pathname.endsWith("/media")).length, 2);
  assert.equal(scan.requests.filter((r) => r.pathname === "/v21.0/m0/comments").length, 2);
  assert.equal(scan.requests.length, 28);
});

test("duplicate IDs across pages are counted once against the caps", async () => {
  const recent = (id) => ({ id, text: "info", timestamp: new Date().toISOString(), from: { id: "viewer" } });
  const mediaPages = (after) => {
    if (after === null) return { data: [{ id: "a" }, { id: "b" }], paging: { cursors: { after: "p1" } } };
    return { data: [{ id: "b" }, { id: "c" }] };
  };
  const commentPages = (mediaId, after) => {
    if (mediaId !== "a") return { data: [] };
    if (after === null) return { data: [recent("x"), recent("y")], paging: { cursors: { after: "p1" } } };
    return { data: [recent("y"), recent("z")] };
  };
  const scan = harness({ mediaPages, commentPages });
  assert.deepEqual(await scan.run(), { queued: 3, scanned: 3, failures: 0 });
  assert.deepEqual(scan.processed[0].events.map((e) => e.commentId), ["x", "y", "z"]);
  assert.equal(scan.requests.filter((r) => r.pathname === "/v21.0/a/comments").length, 2);
});

test("a repeated cursor stops paging", async () => {
  const mediaPages = (after) => ({
    data: after === null ? [{ id: "a" }] : [{ id: "b" }],
    paging: { cursors: { after: "same" } },
  });
  const scan = harness({ mediaPages });
  assert.deepEqual(await scan.run(), { queued: 0, scanned: 0, failures: 0 });
  assert.equal(scan.requests.filter((r) => r.pathname.endsWith("/media")).length, 2);
});

test("a later-page failure preserves earlier results and counts as a failure", async () => {
  const recent = (id) => ({ id, text: "info", timestamp: new Date().toISOString(), from: { id: "viewer" } });
  const mediaPages = (after) => {
    if (after === null) return { data: [{ id: "a" }, { id: "b" }], paging: { cursors: { after: "p1" } } };
    return { data: [{ id: "c" }] };
  };
  const commentPages = (mediaId, after) => {
    if (mediaId !== "a") return { data: [] };
    if (after === null) return { data: [recent("x")], paging: { cursors: { after: "p1" } } };
    return { data: [recent("y")] };
  };
  const fail = (path, after) => (path.pathname === "/v21.0/a/comments" && after === "p1" ? "throw" : null);
  const scan = harness({ mediaPages, commentPages, fail });
  assert.deepEqual(await scan.run(), { queued: 1, scanned: 1, failures: 1 });
  assert.deepEqual(scan.processed[0].events.map((e) => e.commentId), ["x"]);
});

for (const failure of ["http", "throw"]) {
  test(`comment-fetch ${failure} failures preserve partial results and contribute to failures`, async () => {
    const scan = harness({ fail: (path) => (path.pathname.includes("/old-1/") ? failure : null) });
    assert.deepEqual(await scan.run(), { queued: 1, scanned: 1, failures: 1 });
    assert.equal(scan.processed[0].events[0].commentId, "recent");
  });
}

test("a completely failed comment scan reports an error before replay", async () => {
  const scan = harness({ fail: (path) => (path.pathname.includes("/comments") ? "http" : null) });
  await assert.rejects(scan.run(), /Could not scan past comments/);
  assert.equal(scan.processed.length, 0);
});
