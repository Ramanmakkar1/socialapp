import { BRAND } from "./brand";

import type { ReactNode } from "react";

export type ToolFaq = { q: string; a: string; aNode?: ReactNode };
export type Crumb = { name: string; url: string };

/** Reference to the site Organization defined in src/app/layout.tsx (same @id), so every page points at one entity. */
export function publisherRef() {
  return { "@type": "Organization", "@id": `${BRAND.url}#org`, name: BRAND.name, legalName: BRAND.company, url: BRAND.url };
}

/**
 * SoftwareApplication JSON-LD for a free tool page.
 * Free (price 0 USD), web-based, no aggregateRating or review fields.
 * Image tools pass category "MultimediaApplication"; everything else stays "BusinessApplication".
 */
export function toolSoftwareJsonLd({
  name,
  description,
  url,
  category = "BusinessApplication",
}: {
  name: string;
  description: string;
  url: string;
  category?: "BusinessApplication" | "MultimediaApplication";
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    url,
    applicationCategory: category,
    operatingSystem: "Web",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: publisherRef(),
  };
}

/** BreadcrumbList JSON-LD, e.g. Home > Tools > this page. */
export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

/** FAQPage JSON-LD built only from the FAQ items rendered on the page. */
export function faqJsonLd(items: ToolFaq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Serialize JSON-LD for an inline <script type="application/ld+json"> tag. */
export const ldJson = (data: object) => JSON.stringify(data).replace(/</g, "\\u003c");
