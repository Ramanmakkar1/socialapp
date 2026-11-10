import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Render metadata in <head> for every user agent, so crawlers and audits always see title/description/canonical.
  htmlLimitedBots: /.*/,
  // The largest source image on the site is 1536px wide. Capping the generated
  // widths here stops Next from upscaling to 1920/2048/3840 on high-DPR screens,
  // which made the image optimizer slow and served needlessly huge files.
  images: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1400, 1536],
  },
  turbopack: {
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
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
