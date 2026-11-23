import { BRAND } from "./brand";
import { publisherRef } from "./tool-schema";

/**
 * Article JSON-LD for a /help/[slug] guide.
 * Uses the real publish/update dates from the page, the site Organization as
 * author and publisher, and an absolute mainEntityOfPage on the canonical origin.
 * No aggregateRating or review fields.
 */
export function helpArticleJsonLd({
  headline,
  description,
  path,
  datePublished,
  dateModified,
}: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    image: `${BRAND.canonicalUrl}/landing/hero.webp`,
    datePublished,
    dateModified,
    author: { "@type": "Organization", name: BRAND.company, url: BRAND.canonicalUrl },
    publisher: publisherRef(),
    mainEntityOfPage: `${BRAND.canonicalUrl}${path}`,
  };
}
