import { ldJson } from "@/lib/tool-schema";

/**
 * Renders the homepage JSON-LD graph (Organization, WebSite,
 * SoftwareApplication and the page's linked nodes) as a single
 * <script type="application/ld+json">. The graph itself is built by
 * homePageJsonLd so the @ids stay shared with the rest of the site.
 */
export function HomeSchema({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: ldJson(data) }}
    />
  );
}
