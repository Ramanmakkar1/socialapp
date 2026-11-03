import pg from "pg";

const { Pool } = pg;

declare global {
  var __socialappPool: pg.Pool | undefined;
}

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool(): pg.Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!globalThis.__socialappPool) {
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      ssl:
        process.env.DATABASE_SSL === "false"
          ? false
          : { rejectUnauthorized: false },
    });
    pool.on("connect", (client) => {
      client.query("SET search_path TO socialapp, public");
    });
    globalThis.__socialappPool = pool;
  }
  return globalThis.__socialappPool;
}

export async function query<T>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const result = await getPool().query(text, params);
  return result.rows as T[];
}

export async function dbHealth(): Promise<{
  status: "ok" | "not_configured" | "error";
  latencyMs?: number;
  error?: string;
}> {
  if (!process.env.DATABASE_URL) {
    return { status: "not_configured" };
  }
  const start = Date.now();
  try {
    const pool = getPool();
    const timeout = new Promise<never>((_, reject) => {
      const t = setTimeout(
        () => reject(new Error("db health check timed out after 3000ms")),
        3000
      );
      t.unref?.();
    });
    const client = await Promise.race([pool.connect(), timeout]);
    try {
      await Promise.race([client.query("select 1"), timeout]);
    } finally {
      client.release();
    }
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      status: "error",
      latencyMs: Date.now() - start,
      error: message.includes(process.env.DATABASE_URL ?? "\u0000")
        ? "db connection error"
        : message,
    };
  }
}
