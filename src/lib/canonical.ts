import { APPROVED_PRODUCTION_URL } from "./brand";

/**
 * Build the absolute, self-referencing canonical URL for a route.
 *
 * - Always uses the approved production origin (never the staging host and never
 *   a NEXT_PUBLIC_SITE_URL override, so a staging deploy cannot leak into the tag).
 * - The root normalises to exactly one trailing slash: "https://poskoo.com/".
 * - Other paths have no trailing slash.
 * - Query strings and fragments are dropped, since they are not canonicals.
 */
export function canonicalUrl(path = "/"): string {
  const origin = APPROVED_PRODUCTION_URL.replace(/\/+$/, "");
  // Drop any query string or fragment before looking at the path.
  const clean = (path || "/").split(/[?#]/, 1)[0];
  if (clean === "" || clean === "/") return `${origin}/`;
  const withLeadingSlash = clean.startsWith("/") ? clean : `/${clean}`;
  return `${origin}${withLeadingSlash.replace(/\/+$/, "")}`;
}

/**
 * The canonical URL of the site root. The home page is the one route the daily
 * audit probes on the legacy staging host, so both the page metadata and the
 * root layout default must resolve to this exact final-domain value.
 */
export const HOME_CANONICAL = canonicalUrl("/");
