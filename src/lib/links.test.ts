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
  let trackingFails = false;
  let clicks = 0;
  const history: string[] = [];
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
      assert.match(sql, /with tracked_link as \(\s*update socialapp\.short_links set clicks = clicks \+ 1 where code=\$1\s*returning code\s*\)\s*insert into socialapp\.link_clicks \(code\)\s*select code from tracked_link/i);
      if (trackingFails) {
        throw new Error(`sensitive database error ${destination}`);
      }
      clicks += 1;
      history.push(params[0] as string);
      return { rows: [] };
    },
  } as unknown as pg.Pool;

  try {
    for (const scenario of [false, true]) {
      trackingFails = scenario;
      calls.length = 0;
      errors.length = 0;
      const previousClicks = clicks;
      const previousHistoryLength = history.length;
      assert.equal(await resolveAndCount("abc123"), destination);
      assert.equal(calls.length, 2);
      assert.equal(calls.filter((sql) => sql.startsWith("select")).length, 1);
      assert.equal(calls.filter((sql) => sql.startsWith("with tracked_link")).length, 1);
      assert.equal(clicks, previousClicks + (scenario ? 0 : 1));
      assert.equal(history.length, previousHistoryLength + (scenario ? 0 : 1));
      assert.deepEqual(history, ["abc123"]);
      assert.deepEqual(errors, scenario ? [["Failed to record link click"]] : []);
    }

    found = false;
    calls.length = 0;
    assert.equal(await resolveAndCount("abc123"), null);
    assert.equal(calls.length, 1);
    calls.length = 0;
    assert.equal(await resolveAndCount("invalid!"), null);
    assert.equal(calls.length, 0);
    assert.equal(clicks, 1);
    assert.deepEqual(history, ["abc123"]);
  } finally {
    globalThis.__socialappPool = previousPool;
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
    console.error = previousError;
  }
});
