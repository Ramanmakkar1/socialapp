import { BRAND } from "./brand";

/**
 * Build the absolute, self-referencing canonical URL for a route.
 *
 * - Always uses the approved origin in BRAND.canonicalUrl (never a request/staging host).
 * - The root normalises to exactly one trailing slash: "https://poskoo.com/".
 * - Other paths have no trailing slash.
 * - Query strings and fragments are dropped, since they are not canonicals.
 */
export function canonicalUrl(path = "/"): string {
  const origin = BRAND.canonicalUrl.replace(/\/+$/, "");
  // Drop any query string or fragment before looking at the path.
  const clean = (path || "/").split(/[?#]/, 1)[0];
  if (clean === "" || clean === "/") return `${origin}/`;
  const withLeadingSlash = clean.startsWith("/") ? clean : `/${clean}`;
  return `${origin}${withLeadingSlash.replace(/\/+$/, "")}`;
}
