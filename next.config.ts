import type { NextConfig } from "next";

// Security headers for every response. Public pages may only be framed by Poskoo itself;
// the signed-in app, admin, auth pages and API can never be framed (clickjacking).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
  // HSTS only on production builds (never on localhost dev, where it would pin http://localhost to https).
  ...(process.env.NODE_ENV === "production"
    ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]
    : []),
];

const noFrameHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
];

const OLD_HOST = [{ type: "host" as const, value: "socialapp.splitforms.com" }];

const nextConfig: NextConfig = {
  output: "standalone",
  // Render metadata in <head> for every user agent, so crawlers and audits always see title/description/canonical.
  htmlLimitedBots: /.*/,
  // The largest source image on the site is 1536px wide. Capping the generated
  // widths here stops Next from upscaling to 1920/2048/3840 on high-DPR screens,
  // which made the image optimizer slow and served needlessly huge files.
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1400, 1536],
    // Next keys the optimizer cache by URL, width and quality, not by file
    // content, so replacing an image at the same path can keep serving the old
    // variant. A 7-day TTL still avoids re-optimizing on every cold request
    // while bounding how long a replaced image can stay stale.
    minimumCacheTTL: 604800,
  },
  turbopack: {
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      // Old staging host: redirect the bare root, sitemap and robots explicitly. The catch-all below needs :path to match an empty string for "/", and the cached home page must never be served on the old host.
      { source: "/", has: OLD_HOST, destination: "https://poskoo.com/", permanent: true },
      { source: "/sitemap.xml", has: OLD_HOST, destination: "https://poskoo.com/sitemap.xml", permanent: true },
      { source: "/robots.txt", has: OLD_HOST, destination: "https://poskoo.com/robots.txt", permanent: true },
      {
        // Old staging host: send every page to the same path on poskoo.com.
        // /api/* is excluded so webhooks or OAuth callbacks still registered on the old host keep working.
        source: "/:path((?!api/).*)",
        has: OLD_HOST,
        destination: "https://poskoo.com/:path",
        permanent: true,
      },
      // Google crawled /Home and got a 404. Send every capitalisation of the
      // old home path to the real home page with a permanent 301.
      { source: "/Home", destination: "/", permanent: true },
      { source: "/home", destination: "/", permanent: true },
      { source: "/:path([Hh][Oo][Mm][Ee])", destination: "/", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      // Later entries override the same header key from earlier ones.
      ...["/app", "/app/:path*", "/admin", "/admin/:path*", "/login", "/signup", "/api/:path*"].map((source) => ({
        source,
        headers: noFrameHeaders,
      })),
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
          // Cloudflare ignores the browser Cache-Control for HTML by default.
          // These headers let the edge cache the prerendered home page too, so
          // repeat visits are served from the CDN instead of the origin.
          {
            key: "CDN-Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
          {
            key: "Cloudflare-CDN-Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
