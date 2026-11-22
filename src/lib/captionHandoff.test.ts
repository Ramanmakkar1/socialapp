import assert from "node:assert/strict";
import { test } from "node:test";
import { readSignupDraft, SIGNUP_KEY, writeSignupDraft } from "./captionHandoff.ts";

class MemoryStorage {
  private items = new Map<string, string>();
  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }
  removeItem(key: string): void {
    this.items.delete(key);
  }
}

function useMemoryStorage(): MemoryStorage {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, "sessionStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });
  return storage;
}

test("signup draft round-trips a caption once", () => {
  useMemoryStorage();
  assert.deepEqual(writeSignupDraft("Launch day caption ✨"), { ok: true });
  assert.deepEqual(readSignupDraft(), { ok: true, caption: "Launch day caption ✨" });
  assert.deepEqual(readSignupDraft(), { ok: false, error: "absent" });
});

test("signup draft older than 30 minutes is rejected", () => {
  const storage = useMemoryStorage();
  writeSignupDraft("Old draft");
  const raw = storage.getItem(SIGNUP_KEY);
  assert.ok(raw);
  const payload = JSON.parse(raw) as { writtenAt: string };
  payload.writtenAt = new Date(Date.now() - 31 * 60 * 1000).toISOString();
  storage.setItem(SIGNUP_KEY, JSON.stringify(payload));
  assert.deepEqual(readSignupDraft(), { ok: false, error: "expired" });
});

test("signup draft that is not valid JSON is rejected", () => {
  const storage = useMemoryStorage();
  storage.setItem(SIGNUP_KEY, "not json");
  assert.deepEqual(readSignupDraft(), { ok: false, error: "malformed" });
});
