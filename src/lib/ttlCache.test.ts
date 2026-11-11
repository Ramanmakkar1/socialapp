import { test } from "node:test";
import assert from "node:assert/strict";
import { createTtlCache } from "./ttlCache";

function clock(start = 0) {
  let t = start;
  return { now: () => t, advance: (ms: number) => { t += ms; } };
}

test("fresh entries are served from memory", async () => {
  const c = clock();
  const cache = createTtlCache<number>({ ttlMs: 1000, now: c.now });
  let calls = 0;
  const load = async () => ++calls;
  assert.equal(await cache.get("a", load), 1);
  c.advance(999);
  assert.equal(await cache.get("a", load), 1);
  assert.equal(calls, 1);
});

test("concurrent misses share one load", async () => {
  const cache = createTtlCache<number>({ ttlMs: 1000 });
  let calls = 0;
  const load = () => new Promise<number>((r) => setTimeout(() => r(++calls), 5));
  const [x, y] = await Promise.all([cache.get("a", load), cache.get("a", load)]);
  assert.equal(x, 1);
  assert.equal(y, 1);
  assert.equal(calls, 1);
});

test("stale entries are served at once and refreshed in the background", async () => {
  const c = clock();
  const cache = createTtlCache<number>({ ttlMs: 1000, staleMs: 5000, now: c.now });
  let calls = 0;
  const load = async () => ++calls;
  await cache.get("a", load);
  c.advance(2000);
  assert.equal(await cache.get("a", load), 1); // stale value, no waiting
  await new Promise((r) => setTimeout(r, 0));
  assert.equal(await cache.get("a", load), 2); // background refresh landed
});

test("expired entries are loaded again; errors are not cached", async () => {
  const c = clock();
  const cache = createTtlCache<number>({ ttlMs: 1000, staleMs: 1000, now: c.now });
  await cache.get("a", async () => 1);
  c.advance(2500);
  await assert.rejects(cache.get("a", async () => { throw new Error("meta down"); }));
  assert.equal(await cache.get("a", async () => 3), 3);
});

test("invalidate drops entries by prefix and ignores loads that started before it", async () => {
  const cache = createTtlCache<string>({ ttlMs: 60_000 });
  await cache.get("acc1:profile", async () => "old");
  await cache.get("acc2:profile", async () => "other");
  let release: (v: string) => void = () => {};
  const slow = cache.get("acc1:media", () => new Promise<string>((r) => { release = r; }));
  cache.invalidate("acc1:");
  release("stale-media");
  assert.equal(await slow, "stale-media");
  assert.equal(await cache.get("acc1:profile", async () => "new"), "new");
  assert.equal(await cache.get("acc1:media", async () => "fresh-media"), "fresh-media");
  assert.equal(await cache.get("acc2:profile", async () => "x"), "other");
});

test("max bounds the number of entries (oldest dropped first)", async () => {
  const cache = createTtlCache<number>({ ttlMs: 60_000, max: 2 });
  await cache.get("a", async () => 1);
  await cache.get("b", async () => 2);
  await cache.get("c", async () => 3);
  assert.equal(cache.size(), 2);
  assert.equal(await cache.get("a", async () => 9), 9);
});
