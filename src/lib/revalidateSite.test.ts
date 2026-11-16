import assert from "node:assert/strict";
import { test } from "node:test";
import { cronSecretMatches, handleRevalidate } from "./revalidateSite.ts";

const req = (secret?: string) =>
  new Request("http://localhost/api/jobs/revalidate", { method: "POST", headers: secret ? { "x-cron-secret": secret } : {} });

test("revalidate: wrong, missing or unset secret is 401 and revalidates nothing", () => {
  const calls: unknown[] = [];
  const spy = (...args: unknown[]) => void calls.push(args);
  assert.equal(handleRevalidate(req("nope"), spy, { CRON_SECRET: "s3cret" }).status, 401);
  assert.equal(handleRevalidate(req(), spy, { CRON_SECRET: "s3cret" }).status, 401);
  assert.equal(handleRevalidate(req("anything"), spy, {}).status, 401);
  assert.equal(calls.length, 0);
});

test("revalidate: the cron secret revalidates '/' as a layout (every prerendered page)", async () => {
  const calls: unknown[] = [];
  const res = handleRevalidate(req("s3cret"), (...args: unknown[]) => void calls.push(args), { CRON_SECRET: "s3cret" });
  assert.equal(res.status, 200);
  assert.deepEqual(calls, [["/", "layout"]]);
  assert.equal((await res.json()).status, "ok");
});

test("cronSecretMatches: length mismatch and empty values never match", () => {
  assert.equal(cronSecretMatches("abc", "abcd"), false);
  assert.equal(cronSecretMatches("", ""), false);
  assert.equal(cronSecretMatches("abcd", "abcd"), true);
});
