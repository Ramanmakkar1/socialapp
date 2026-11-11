// Server only: short-lived cache for the Instagram Graph reads that dashboard pages render
// (profile, latest media, account insights). Page renders and server-action re-renders (e.g. Pause on Home)
// reuse the cached answer instead of calling Meta every time; "Refresh" buttons drop it on demand.
import { createHash } from "node:crypto";
import { fetchAccountInsights, fetchIgProfile, type AccountInsights, type GraphAccount, type IgProfile } from "@/lib/igGraph";
import { fetchRecentMedia, type IgMediaItem } from "@/lib/igMedia";
import { createTtlCache, type TtlCache } from "@/lib/ttlCache";

/** Fresh for 2 minutes, then served stale (and refreshed in the background) for up to 10 more. */
export const IG_CACHE_TTL_MS = 2 * 60_000;
export const IG_CACHE_STALE_MS = 10 * 60_000;

// One process-wide cache (survives across requests; reset on deploy/restart). Kept on globalThis so page
// renders and server actions share it even when the bundler gives each route its own module instance.
const g = globalThis as typeof globalThis & { __poskooIgCache?: TtlCache<unknown> };
const store = (g.__poskooIgCache ??= createTtlCache<unknown>({ ttlMs: IG_CACHE_TTL_MS, staleMs: IG_CACHE_STALE_MS, max: 2000 }));

/** Key prefix for every Graph read of one connected account. */
export function igAccountPrefix(accountId: string): string {
  return `${accountId}:`;
}

/** Account id plus a short hash of the stored token, so a reconnect never serves old data. Never the token itself. */
export function igCacheKey(account: GraphAccount, name: string): string {
  const tokenHash = createHash("sha256").update(account.access_token_enc ?? "").digest("hex").slice(0, 16);
  return `${igAccountPrefix(account.id)}${account.auth_type ?? ""}:${tokenHash}:${name}`;
}

function cached<T>(account: GraphAccount, name: string, load: () => Promise<T>): Promise<T> {
  return store.get(igCacheKey(account, name), load) as Promise<T>;
}

export function invalidateIgAccount(accountId: string): void {
  store.invalidate(igAccountPrefix(accountId));
}

export const cachedIgProfile = (account: GraphAccount): Promise<IgProfile> => cached(account, "profile", () => fetchIgProfile(account));

// Home and Posts & Reels both ask for 25 items so they share one entry.
export const cachedRecentMedia = (account: GraphAccount, limit: number): Promise<IgMediaItem[]> =>
  cached(account, `media:${limit}`, () => fetchRecentMedia(account, limit));

export const cachedAccountInsights = (account: GraphAccount): Promise<AccountInsights> =>
  cached(account, "insights", () => fetchAccountInsights(account));
