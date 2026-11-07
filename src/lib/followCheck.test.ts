import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, mock, test } from "node:test";
import ts from "typescript";
import * as graphHost from "./graphHost.ts";

// Use the same isolated TypeScript execution approach as rewind.test.mjs.
const compiled = ts.transpileModule(
  readFileSync(new URL("./followCheck.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;
const exports = {} as {
  isFollower: (igsid: string, token: string) => Promise<boolean | null>;
};
new Function("require", "exports", compiled)((id: string) => (id === "@/lib/graphHost" ? graphHost : {}), exports);
const { isFollower } = exports;
const nativeTimeout = AbortSignal.timeout.bind(AbortSignal);

afterEach(() => mock.restoreAll());

function mockTimeout() {
  let signal: AbortSignal;
  mock.method(AbortSignal, "timeout", (ms: number) => {
    assert.equal(ms, 6_000);
    signal = nativeTimeout(5);
    return signal;
  });
  return (options?: RequestInit) => {
    assert.ok(options?.signal instanceof AbortSignal);
    assert.equal(options.signal, signal);
    return options.signal;
  };
}

function rejectOnAbort(signal: AbortSignal): Promise<never> {
  assert.equal(signal.aborted, false);
  return new Promise((_, reject) => {
    // Keep Node alive while the native timeout's unreferenced timer runs.
    const guard = setTimeout(() => reject(new Error("Signal did not abort")), 1_000);
    signal.addEventListener("abort", () => {
      clearTimeout(guard);
      reject(signal.reason);
    }, { once: true });
  });
}

for (const following of [true, false]) {
  test(`returns ${following} for an explicit boolean`, async () => {
    const checkSignal = mockTimeout();
    const fetchMock = mock.method(globalThis, "fetch", async (_url: unknown, options?: RequestInit) => {
      checkSignal(options);
      return Response.json({ is_user_follow_business: following });
    });
    assert.equal(await isFollower("viewer", "token"), following);
    assert.equal(fetchMock.mock.callCount(), 1);
  });
}

for (const body of [{}, { is_user_follow_business: "false" }, null]) {
  test(`returns null for a missing boolean: ${JSON.stringify(body)}`, async () => {
    const checkSignal = mockTimeout();
    mock.method(globalThis, "fetch", async (_url: unknown, options?: RequestInit) => {
      checkSignal(options);
      return Response.json(body);
    });
    assert.equal(await isFollower("viewer", "token"), null);
  });
}

test("returns null for malformed JSON", async () => {
  const checkSignal = mockTimeout();
  mock.method(globalThis, "fetch", async (_url: unknown, options?: RequestInit) => {
    checkSignal(options);
    return new Response("{invalid");
  });
  assert.equal(await isFollower("viewer", "token"), null);
});

test("returns null for HTTP failure without parsing the body", async () => {
  const checkSignal = mockTimeout();
  const json = mock.fn();
  mock.method(globalThis, "fetch", async (_url: unknown, options?: RequestInit) => {
    checkSignal(options);
    return { ok: false, json } as unknown as Response;
  });
  assert.equal(await isFollower("viewer", "token"), null);
  assert.equal(json.mock.callCount(), 0);
});

test("returns null for network failure", async () => {
  const checkSignal = mockTimeout();
  mock.method(globalThis, "fetch", async (_url: unknown, options?: RequestInit) => {
    checkSignal(options);
    throw new TypeError("Network unavailable");
  });
  assert.equal(await isFollower("viewer", "token"), null);
});

for (const stage of ["fetch", "body read"]) {
  test(`returns null when timeout aborts the ${stage}`, async () => {
    const checkSignal = mockTimeout();
    let signal: AbortSignal | undefined;
    mock.method(globalThis, "fetch", async (_url: unknown, options?: RequestInit) => {
      signal = checkSignal(options);
      if (stage === "fetch") return rejectOnAbort(signal);
      return { ok: true, json: () => rejectOnAbort(signal!) } as unknown as Response;
    });
    assert.equal(await isFollower("viewer", "token"), null);
    assert.equal(signal?.aborted, true);
    assert.equal(signal?.reason.name, "TimeoutError");
  });
}
