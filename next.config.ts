import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Render metadata in <head> for every user agent, so crawlers and audits always see title/description/canonical.
  htmlLimitedBots: /.*/,
  turbopack: {
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
