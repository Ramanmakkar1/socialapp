import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url, max: 1 });

try {
  await pool.query(`
    create schema if not exists socialapp;
    create table if not exists socialapp.schema_migrations (
      name text primary key,
      applied_at timestamptz default now()
    );
  `);

  const files = readdirSync(join(root, "db", "migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const { rows: applied } = await pool.query(
    "select name from socialapp.schema_migrations"
  );
  const done = new Set(applied.map((r) => r.name));

  let count = 0;
  for (const file of files) {
    if (done.has(file)) continue;
    const sql = readFileSync(join(root, "db", "migrations", file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into socialapp.schema_migrations (name) values ($1)",
        [file]
      );
      await client.query("commit");
      console.log("applied " + file);
      count++;
    } catch (err) {
      await client.query("rollback");
      throw err;
    } finally {
      client.release();
    }
  }

  if (count === 0) {
    console.log("up to date");
  }
} finally {
  await pool.end();
}
