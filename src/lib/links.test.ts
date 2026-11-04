import assert from "node:assert/strict";
import { test } from "node:test";
import type pg from "pg";
import { resolveAndCount } from "./links.ts";

test("link resolution remains available when tracking fails", async () => {
  const previousPool = globalThis.__socialappPool;
  const previousUrl = process.env.DATABASE_URL;
  const previousError = console.error;
  const destination = "https://example.com/lead";
  const calls: string[] = [];
  const errors: unknown[][] = [];
  let failure: "update" | "insert" | null = null;
  let found = true;

  process.env.DATABASE_URL = "mock";
  console.error = (...args: unknown[]) => { errors.push(args); };
  globalThis.__socialappPool = {
    query: async (sql: string, params: unknown[]) => {
      calls.push(sql);
      assert.deepEqual(params, ["abc123"]);
      if (sql.startsWith("select")) {
        return { rows: found ? [{ target_url: destination }] : [] };
      }
      if (failure && sql.startsWith(failure)) {
        throw new Error(`sensitive database error ${destination}`);
      }
      return { rows: [] };
    },
  } as unknown as pg.Pool;

  try {
    for (const scenario of ["update", "insert", null] as const) {
      failure = scenario;
      calls.length = 0;
      errors.length = 0;
      assert.equal(await resolveAndCount("abc123"), destination);
      assert.equal(calls.filter((sql) => sql.startsWith("select")).length, 1);
      assert.equal(calls.filter((sql) => sql.startsWith("update")).length, 1);
      assert.equal(calls.filter((sql) => sql.startsWith("insert")).length, scenario === "update" ? 0 : 1);
      assert.deepEqual(errors, scenario ? [["Failed to record link click"]] : []);
    }

    found = false;
    calls.length = 0;
    assert.equal(await resolveAndCount("abc123"), null);
    assert.equal(calls.length, 1);
    calls.length = 0;
    assert.equal(await resolveAndCount("invalid!"), null);
    assert.equal(calls.length, 0);
  } finally {
    globalThis.__socialappPool = previousPool;
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
    console.error = previousError;
  }
});
