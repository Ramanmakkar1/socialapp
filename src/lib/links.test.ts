import assert from "node:assert/strict";
import { test } from "node:test";
import type pg from "pg";
import { clickCountSql, ctrPercent, formatCtr, isBotUserAgent, resolveAndCount, shouldCountClick, uniqueClickCountSql, visitorHash } from "./links.ts";

const HUMAN = { method: "GET", userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Instagram 350.0.0.0", ip: "203.0.113.9" };

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
      assert.equal(params[0], "abc123");
      if (sql.startsWith("select")) {
        return { rows: found ? [{ target_url: destination }] : [] };
      }
      assert.match(sql, /with tracked_link as \(\s*update socialapp\.short_links set clicks = clicks \+ 1 where code=\$1\s*returning code\s*\)\s*insert into socialapp\.link_clicks \(code, visitor_hash\)\s*select code, \$2 from tracked_link/i);
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
      assert.equal(await resolveAndCount("abc123", HUMAN), destination);
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

test("bots, link previews and HEAD requests are redirected but not counted", async () => {
  const previousPool = globalThis.__socialappPool;
  const previousUrl = process.env.DATABASE_URL;
  const calls: string[] = [];
  process.env.DATABASE_URL = "mock";
  globalThis.__socialappPool = {
    query: async (sql: string) => {
      calls.push(sql);
      return { rows: sql.startsWith("select") ? [{ target_url: "https://example.com" }] : [] };
    },
  } as unknown as pg.Pool;
  try {
    for (const ctx of [
      { method: "GET", userAgent: "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)" },
      { method: "GET", userAgent: "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)" },
      { method: "GET", userAgent: "WhatsApp/2.23.20.0 A" },
      { method: "HEAD", userAgent: HUMAN.userAgent },
      { method: "GET", userAgent: "" },
    ]) {
      calls.length = 0;
      assert.equal(await resolveAndCount("abc123", ctx), "https://example.com");
      assert.equal(calls.length, 1, `not counted: ${ctx.method} ${ctx.userAgent}`);
    }
  } finally {
    globalThis.__socialappPool = previousPool;
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
  }
});

test("bot user agents are recognised; real browsers and in-app browsers are not", () => {
  for (const ua of [
    "facebookexternalhit/1.1",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Twitterbot/1.0",
    "Mozilla/5.0 (compatible; Discordbot/2.0; +https://discordapp.com)",
    "TelegramBot (like TwitterBot)",
    "LinkedInBot/1.0",
    "Mozilla/5.0 (compatible; bingbot/2.0)",
    "meta-externalagent/1.1",
    "curl/8.4.0",
    null,
  ]) {
    assert.equal(isBotUserAgent(ua), true, String(ua));
  }
  for (const ua of [
    HUMAN.userAgent,
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/480.0;]",
  ]) {
    assert.equal(isBotUserAgent(ua), false, ua);
  }
  assert.equal(shouldCountClick(HUMAN), true);
  assert.equal(shouldCountClick({ ...HUMAN, method: "HEAD" }), false);
});

test("unique-click CTR is capped at 100% and visitor hashes are stable", () => {
  assert.equal(ctrPercent(5, 0), null);
  assert.equal(ctrPercent(3, 10), 30);
  assert.equal(ctrPercent(25, 10), 100);
  assert.equal(formatCtr(25, 10), "100%");
  assert.equal(formatCtr(1, 0), "–");
  assert.equal(visitorHash("abc", "1.2.3.4", "ua"), visitorHash("abc", "1.2.3.4", "ua"));
  assert.notEqual(visitorHash("abc", "1.2.3.4", "ua"), visitorHash("abd", "1.2.3.4", "ua"));
  assert.match(clickCountSql("s.rule_id = r.id"), /count\(\*\).*link_clicks c join socialapp\.short_links s.*s\.rule_id = r\.id/);
  assert.match(uniqueClickCountSql("s.user_id = $1"), /count\(distinct coalesce\(c\.visitor_hash, c\.id::text\)\)/);
});
