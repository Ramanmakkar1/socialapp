import pg from "pg";

const { Pool, Client } = pg;

type ConnectCb = (err?: Error) => void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- mixin constructors must take any[]
type ConnectableClass = new (...args: any[]) => {
  connect(): Promise<void>;
  query(text: string): Promise<unknown>;
};

/**
 * A pg Client whose connect() resolves only after `SET search_path` has finished.
 * The old pool.on("connect", c => c.query(...)) fired the SET without awaiting it, so the first
 * real query on a new client ran while SET was still in flight ("Calling client.query() when the
 * client is already executing a query is deprecated" in production logs).
 */
export function withSearchPath<B extends ConnectableClass>(Base: B, searchPath = "socialapp, public") {
  return class SearchPathClient extends Base {
    connect(): Promise<void>;
    connect(cb: ConnectCb): void;
    connect(cb?: ConnectCb): Promise<void> | void {
      const ready = super.connect().then(async () => {
        await super.query(`SET search_path TO ${searchPath}`);
      });
      if (!cb) return ready;
      ready.then(() => cb(), (err: Error) => cb(err));
    }
  };
}

const SearchPathClient = withSearchPath(Client as unknown as ConnectableClass) as unknown as typeof Client;

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
      Client: SearchPathClient,
      ssl:
        process.env.DATABASE_SSL === "false"
          ? false
          : { rejectUnauthorized: false },
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
  let deadlineExpired = false;
  let deadline: ReturnType<typeof setTimeout> | undefined;
  try {
    const pool = getPool();
    const timeout = new Promise<never>((_, reject) => {
      deadline = setTimeout(() => {
        deadlineExpired = true;
        reject(new Error("db health check timed out after 3000ms"));
      }, 3000);
      deadline.unref?.();
    });
    const connection = pool.connect().then((client) => {
      if (deadlineExpired) client.release(true);
      return client;
    });
    const client = await Promise.race([connection, timeout]);
    try {
      await Promise.race([client.query("select 1"), timeout]);
    } finally {
      client.release(deadlineExpired);
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
  } finally {
    clearTimeout(deadline);
  }
}
