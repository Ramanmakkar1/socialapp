import { BRAND } from "./brand";

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

// Single source of truth for indexability. The root layout robots meta and the
// sitemap both call this, so a noindex page can never be listed in the sitemap.
export function isPathIndexable(path: string): boolean {
  if (!BRAND.indexable) return false;
  if (ALWAYS_NOINDEX_PATHS.has(path)) return false;
  if (path === "/app" || path.startsWith("/app/")) return false;
  return true;
}
