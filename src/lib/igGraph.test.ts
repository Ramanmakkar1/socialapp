import assert from "node:assert/strict";
import * as graphHost from "./graphHost.ts";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const TOKEN = "secret-token-123";
const account = { id: "acc-1", external_id: "ig-1", access_token_enc: "enc" };

const compiled = ts.transpileModule(readFileSync(new URL("./igGraph.ts", import.meta.url), "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;

function loadIgGraph(fetchImpl: typeof fetch, queryImpl?: (sql: string) => Promise<unknown[]>) {
  let fetchCalls = 0;
  const wrappedFetch = (async (...args: Parameters<typeof fetch>) => {
    fetchCalls += 1;
    return fetchImpl(...args);
  }) as typeof fetch;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = wrappedFetch;
  let expiredMarked = false;
  const exports = {} as typeof import("./igGraph.ts");
  const imports = (id: string) => {
    if (id === "@/lib/graphHost") return graphHost;
    if (id === "@/lib/crypto") return { decryptToken: () => TOKEN };
    if (id === "@/lib/db") {
      return {
        query: async (sql: string) => {
          if (sql.includes("expired")) expiredMarked = true;
          return queryImpl ? queryImpl(sql) : [];
        },
      };
    }
    throw new Error(`Unexpected import: ${id}`);
  };
  new Function("require", "exports", compiled)(imports, exports);
  return {
    mod: exports,
    get fetchCalls() {
      return fetchCalls;
    },
    get expiredMarked() {
      return expiredMarked;
    },
    restore() {
      globalThis.fetch = originalFetch;
    },
  };
}

test("POST network failure and 500 each call fetch once", async () => {
  for (const impl of [
    async () => {
      throw new Error("network down");
    },
    async () =>
      new Response(JSON.stringify({ error: { message: "fail", code: 1 } }), { status: 500, headers: { "Content-Type": "application/json" } }),
  ]) {
    const ctx = loadIgGraph(impl as typeof fetch);
    try {
      await assert.rejects(
        () => ctx.mod.graphCall(account, "thread/replies", { method: "POST", body: { message: "hi" } }),
        (err: unknown) => {
          assert.ok(err instanceof ctx.mod.GraphError);
          assert.match(String((err as Error).message), /Check Instagram before sending again/);
          assert.doesNotMatch(String((err as Error).message), new RegExp(TOKEN));
          return true;
        }
      );
      assert.equal(ctx.fetchCalls, 1);
    } finally {
      ctx.restore();
    }
  }
});

test("successful POST calls fetch once", async () => {
  const ctx = loadIgGraph(async () => new Response(JSON.stringify({ id: "sent" }), { status: 200 }));
  try {
    const out = await ctx.mod.graphCall<{ id: string }>(account, "messages", { method: "POST", body: { text: "hi" } });
    assert.equal(out.id, "sent");
    assert.equal(ctx.fetchCalls, 1);
  } finally {
    ctx.restore();
  }
});

test("GET transient failures still retry", async () => {
  let n = 0;
  const ctx = loadIgGraph(async () => {
    n += 1;
    if (n < 3) throw new Error("flaky");
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  });
  try {
    const out = await ctx.mod.graphCall<{ ok: boolean }>(account, "me");
    assert.equal(out.ok, true);
    assert.equal(ctx.fetchCalls, 3);
  } finally {
    ctx.restore();
  }
});

test("token errors still mark the account expired and never expose the token", async () => {
  const ctx = loadIgGraph(async () =>
    new Response(JSON.stringify({ error: { message: `bad ${TOKEN}`, code: 190 } }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  );
  try {
    await assert.rejects(
      () => ctx.mod.graphCall(account, "me", { method: "POST", body: { message: "x" } }),
      (err: unknown) => {
        assert.ok(err instanceof ctx.mod.GraphError);
        assert.equal((err as InstanceType<typeof ctx.mod.GraphError>).kind, "token");
        assert.doesNotMatch(String((err as Error).message), new RegExp(TOKEN));
        return true;
      }
    );
    assert.equal(ctx.fetchCalls, 1);
    assert.equal(ctx.expiredMarked, true);
  } finally {
    ctx.restore();
  }
});

test("fetchFollowersCount: Facebook-login accounts ask graph.facebook.com/{ig-user-id}, Instagram-login accounts ask graph.instagram.com/me", async () => {
  const urls: string[] = [];
  const ctx = loadIgGraph((async (url: string) => {
    urls.push(String(url));
    return new Response(JSON.stringify({ followers_count: 1234 }), { status: 200 });
  }) as unknown as typeof fetch);
  try {
    assert.equal(await ctx.mod.fetchFollowersCount({ ...account, auth_type: "facebook_login" }), 1234);
    assert.equal(await ctx.mod.fetchFollowersCount({ ...account, auth_type: "instagram_login" }), 1234);
    assert.equal(await ctx.mod.fetchFollowersCount({ ...account, auth_type: null }), 1234);
  } finally {
    ctx.restore();
  }
  assert.equal(urls[0], `${graphHost.FB_GRAPH}/ig-1?fields=followers_count`);
  assert.equal(urls[1], `${graphHost.IG_GRAPH}/me?fields=followers_count`);
  assert.equal(urls[2], `${graphHost.IG_GRAPH}/me?fields=followers_count`);
  assert.ok(urls.every((u) => !u.includes(TOKEN)), "token travels in the Authorization header, never the URL");
});

test("describeGraphError logs the Meta code and message but never the token", async () => {
  const ctx = loadIgGraph((async () =>
    new Response(JSON.stringify({ error: { code: 100, message: `Unsupported get request. access_token=${TOKEN} EAABwzLixnjYBO1234567890abc` } }), { status: 400 })) as unknown as typeof fetch);
  let line = "";
  try {
    await ctx.mod.fetchFollowersCount({ ...account, auth_type: "facebook_login" });
    assert.fail("should throw");
  } catch (e) {
    line = ctx.mod.describeGraphError(e);
  } finally {
    ctx.restore();
  }
  assert.match(line, /kind=other code=100 message=Unsupported get request/);
  assert.ok(!line.includes(TOKEN));
  assert.ok(!line.includes("EAABwzLixnjYBO1234567890abc"));
  assert.equal(ctx.mod.describeGraphError(new Error("Bearer abc.def-123 failed")), "message=Bearer [redacted] failed");
});
