import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app", "/app/", "/api/", "/l/"],
    },
    ...(BRAND.indexable ? { sitemap: `${BRAND.url}/sitemap.xml` } : {}),
  };
}
