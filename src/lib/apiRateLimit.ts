// Per-IP rate limits for /api/* (applied in src/proxy.ts). Pure tier lookup so it is testable.
// Webhooks, cron jobs and the health check are exempt: they are signed / secret-protected and
// Meta or Stripe may burst them. Media files get a high limit because Instagram, TikTok etc.
// fetch scheduled images and videos from many IPs at publish time.

export type ApiTier = { name: string; limit: number; windowMs: number } | null;

const MINUTE = 60_000;

const EXEMPT = [
  "/api/health",
  "/api/jobs/",
  "/api/meta/webhook",
  "/api/stripe/webhook",
  "/api/stripe/billing-webhook",
  "/api/instagram/deauthorize",
  "/api/instagram/data-deletion",
];

/** Rate-limit tier for an API path, or null when the path is exempt. */
export function apiTier(pathname: string): ApiTier {
  if (!pathname.startsWith("/api/")) return null;
  if (EXEMPT.some((p) => (p.endsWith("/") ? pathname.startsWith(p) : pathname === p))) return null;
  if (pathname.startsWith("/api/media/upload")) return { name: "upload", limit: 60, windowMs: MINUTE };
  if (pathname.startsWith("/api/media/")) return { name: "media", limit: 600, windowMs: MINUTE };
  if (/^\/api\/[a-z]+\/(connect|callback)$/.test(pathname) || pathname.startsWith("/api/auth/")) {
    return { name: "auth", limit: 30, windowMs: MINUTE };
  }
  if (pathname === "/api/mcp") return { name: "mcp", limit: 120, windowMs: MINUTE };
  return { name: "api", limit: 120, windowMs: MINUTE };
}
