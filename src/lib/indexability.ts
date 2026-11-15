import { BRAND, resolveSiteIndexable } from "./brand";

// Paths that must never be indexed, even after the site leaves staging. Keep
// this in sync with the per-page robots metadata (auth, admin, app, status).
export const ALWAYS_NOINDEX_PATHS = new Set([
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/data-deletion/status",
  "/app/review-guide",
  "/admin",
]);

// Snapshot of the module-load value. BRAND.indexable is also the explicit test
// override, so a value that differs from this snapshot is honoured as-is.
const INITIAL_INDEXABLE = BRAND.indexable;

// Runtime-safe site indexability. Re-resolve the env on every call so a staging
// host (or a flag turned off after build) can never be masked by a stale
// module-load snapshot. An explicit override of BRAND.indexable still wins.
export function isSiteIndexable(): boolean {
  if (BRAND.indexable !== INITIAL_INDEXABLE) return BRAND.indexable;
  return resolveSiteIndexable();
}

// Single source of truth for indexability. The root layout robots meta and the
// sitemap both call this, so a noindex page can never be listed in the sitemap.
export function isPathIndexable(path: string): boolean {
  if (!isSiteIndexable()) return false;
  if (ALWAYS_NOINDEX_PATHS.has(path)) return false;
  if (path === "/app" || path.startsWith("/app/")) return false;
  return true;
}
