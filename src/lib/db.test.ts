import assert from "node:assert/strict";
import { test } from "node:test";
import { withSearchPath } from "./db.ts";

// Fake pg Client that flags overlapping queries (what pg warns about) and records order.
class FakeClient {
  log: string[] = [];
  busy = false;
  overlapped = false;
  async connect(): Promise<void> {
    this.log.push("connect");
  }
  async query(text: string): Promise<unknown> {
    if (this.busy) this.overlapped = true;
    this.busy = true;
    await new Promise((r) => setTimeout(r, 5));
    this.log.push(text);
    this.busy = false;
    return { rows: [] };
  }
}

test("connect() resolves only after SET search_path finished, so the next query never overlaps", async () => {
  const C = withSearchPath(FakeClient);
  const c = new C() as unknown as FakeClient & { connect(): Promise<void> };
  await c.connect();
  await c.query("select 1");
  assert.deepEqual(c.log, ["connect", "SET search_path TO socialapp, public", "select 1"]);
  assert.equal(c.overlapped, false);
});

test("callback-style connect (used by pg-pool) is called after the SET, and errors pass through", async () => {
  const C = withSearchPath(FakeClient);
  const c = new C() as unknown as FakeClient & { connect(cb: (err?: Error) => void): void };
  await new Promise<void>((resolve, reject) => c.connect((err) => (err ? reject(err) : resolve())));
  assert.equal(c.log.at(-1), "SET search_path TO socialapp, public");

  class Failing extends FakeClient {
    async connect(): Promise<void> {
      throw new Error("refused");
    }
  }
  const F = withSearchPath(Failing);
  const f = new F() as unknown as { connect(cb: (err?: Error) => void): void };
  const err = await new Promise<Error | undefined>((resolve) => f.connect(resolve));
  assert.equal(err?.message, "refused");
});
