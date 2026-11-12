import type { Metadata } from "next";
import { BRAND } from "./brand";

/** Site-wide 1200x630 social card (src/app/opengraph-image.tsx). */
export const SITE_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: `${BRAND.name}: social media scheduler and Instagram auto-DM`,
};

/** The title the page actually renders: absolute titles as-is, plain strings through the root "%s | Poskoo" template. */
function resolvedTitle(title: Metadata["title"]): string | undefined {
  if (!title) return undefined;
  if (typeof title === "string") return `${title} | ${BRAND.name}`;
  if ("absolute" in title && title.absolute) return title.absolute;
  if ("default" in title && title.default) return title.default;
  return undefined;
}

/**
 * Fills Open Graph and Twitter tags from a page's own title, description and canonical.
 * Without this, a page that sets no openGraph inherits the home page's og:title and
 * og:url, and a page that sets openGraph without images loses the site social card.
 * Anything the page sets itself wins.
 */
export function withSocial(meta: Metadata): Metadata {
  const title = resolvedTitle(meta.title);
  const description = meta.description ?? undefined;
  const canonical = meta.alternates?.canonical;
  const url = typeof canonical === "string" ? canonical : canonical instanceof URL ? canonical.toString() : undefined;
  const og = meta.openGraph ?? {};
  const tw = meta.twitter ?? {};
  return {
    ...meta,
    openGraph: {
      type: "website",
      siteName: BRAND.name,
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      ...(url ? { url } : {}),
      images: [SITE_OG_IMAGE],
      ...og,
    },
    twitter: {
      card: "summary_large_image",
      ...(title ? { title } : {}),
      ...(description ? { description } : {}),
      images: [SITE_OG_IMAGE.url],
      ...tw,
    },
  } as Metadata;
}
