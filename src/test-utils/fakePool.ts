// Test-only helper: a fake pg pool that answers SQL by pattern. Never imported by app code.
import type pg from "pg";

export type FakeHandler = {
  match: RegExp | ((sql: string) => boolean);
  reply: (params: unknown[], sql: string) => unknown[] | Promise<unknown[]>;
};

export type FakeCall = { sql: string; params: unknown[]; client: string };

export function createFakePool(handlers: FakeHandler[]) {
  const calls: FakeCall[] = [];
  let clientSeq = 0;

  async function run(sql: string, params: unknown[] = [], client: string) {
    const text = sql.replace(/\s+/g, " ").trim();
    calls.push({ sql: text, params, client });
    if (/^(begin|commit|rollback)\b/i.test(text)) return { rows: [], rowCount: 0 };
    for (const h of handlers) {
      const hit = typeof h.match === "function" ? h.match(text) : h.match.test(text);
      if (hit) {
        const rows = await h.reply(params, text);
        return { rows, rowCount: rows.length };
      }
    }
    throw new Error(`fakePool: unexpected SQL: ${text.slice(0, 160)}`);
  }

  const pool = {
    query: (sql: string, params?: unknown[]) => run(sql, params, "pool"),
    connect: async () => {
      const id = `c${clientSeq++}`;
      return { query: (sql: string, params?: unknown[]) => run(sql, params, id), release: () => {} };
    },
  } as unknown as pg.Pool;

  return { pool, calls };
}

/** Installs the fake as the app's pool (see src/lib/db.ts) and returns a restore function. */
export function installFakePool(pool: pg.Pool): () => void {
  const previousPool = globalThis.__socialappPool;
  const previousUrl = process.env.DATABASE_URL;
  const previousKey = process.env.TOKEN_ENCRYPTION_KEY;
  globalThis.__socialappPool = pool;
  process.env.DATABASE_URL = "mock";
  if (!process.env.TOKEN_ENCRYPTION_KEY) process.env.TOKEN_ENCRYPTION_KEY = Buffer.alloc(32).toString("base64");
  return () => {
    globalThis.__socialappPool = previousPool;
    if (previousUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.TOKEN_ENCRYPTION_KEY;
    else process.env.TOKEN_ENCRYPTION_KEY = previousKey;
  };
}
