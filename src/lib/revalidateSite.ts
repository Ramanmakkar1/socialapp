// Server only: on-demand revalidation of the prerendered public pages (POST /api/jobs/revalidate).
// The Docker build has no runtime env or DB, so pages prerendered at build time fail closed
// ("Coming soon" networks, the build-time platform count, "launching soon" plans) until they
// revalidate (every 10 minutes). The deploy calls this right after the new container starts so the
// first visitors get pages rendered with the runtime env. Same secret and header as the cron jobs.
import { timingSafeEqual } from "node:crypto";

export function cronSecretMatches(given: string | null, expected: string | undefined): boolean {
  if (!given || !expected) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Invalidates "/" as a layout: the root layout and every page under it re-render on their next visit. */
export function handleRevalidate(
  request: Request,
  revalidate: (path: string, type: "layout") => void,
  env: Record<string, string | undefined> = process.env,
): Response {
  if (!cronSecretMatches(request.headers.get("x-cron-secret"), env.CRON_SECRET)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  revalidate("/", "layout");
  return Response.json({ status: "ok", revalidated: "/ (layout)" });
}
