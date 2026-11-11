// Tiny in-memory cache with stale-while-revalidate for slow external reads (Instagram Graph).
// Kept in the server process on purpose: unlike unstable_cache it is not tied to the page's implicit
// cache tags, so a revalidatePath("/app") after e.g. Pause does not force a new Meta call.
// - fresh (age < ttlMs): served from memory
// - stale (age < ttlMs + staleMs): served from memory, refreshed once in the background
// - older / missing: loaded; concurrent callers share one in-flight load
// Errors are never cached.

type Entry<T> = { value: T; at: number };

export type TtlCache<T> = {
  get(key: string, load: () => Promise<T>): Promise<T>;
  /** Drops every entry whose key starts with `prefix` (e.g. one account). */
  invalidate(prefix: string): void;
  size(): number;
};

export function createTtlCache<T>({ ttlMs, staleMs = 0, max = 500, now = Date.now }: { ttlMs: number; staleMs?: number; max?: number; now?: () => number }): TtlCache<T> {
  const entries = new Map<string, Entry<T>>();
  const inflight = new Map<string, Promise<T>>();
  let generation = 0;

  function load(key: string, fn: () => Promise<T>): Promise<T> {
    const running = inflight.get(key);
    if (running) return running;
    const gen = generation;
    const p = fn()
      .then((value) => {
        // Skip writing a result that started before an invalidate().
        if (gen === generation) {
          entries.delete(key);
          entries.set(key, { value, at: now() });
          while (entries.size > max) entries.delete(entries.keys().next().value as string);
        }
        return value;
      })
      .finally(() => {
        if (inflight.get(key) === p) inflight.delete(key);
      });
    inflight.set(key, p);
    return p;
  }

  return {
    get(key, fn) {
      const hit = entries.get(key);
      if (hit) {
        const age = now() - hit.at;
        if (age < ttlMs) return Promise.resolve(hit.value);
        if (age < ttlMs + staleMs) {
          load(key, fn).catch(() => undefined);
          return Promise.resolve(hit.value);
        }
        entries.delete(key);
      }
      return load(key, fn);
    },
    invalidate(prefix) {
      generation++;
      for (const key of [...entries.keys()]) if (key.startsWith(prefix)) entries.delete(key);
      for (const key of [...inflight.keys()]) if (key.startsWith(prefix)) inflight.delete(key);
    },
    size: () => entries.size,
  };
}
