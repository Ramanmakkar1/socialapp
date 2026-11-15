import { BRAND } from "@/lib/brand";
import { softwareOffers, type PlanReadiness } from "@/lib/plans";

// Home page JSON-LD graph. The Organization (#org) and WebSite (#website) nodes
// are emitted once by the root layout; this graph links to them by @id so the
// page, app and FAQ stay part of the same entity graph.
export const homePageJsonLd = (
  faqs: { q: string; a: string }[],
  r: PlanReadiness,
  title: string = BRAND.name,
) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": BRAND.url,
      url: BRAND.url,
      name: title,
      description: BRAND.description,
      inLanguage: "en",
      isPartOf: { "@id": BRAND.canonicalUrl + "#website" },
      publisher: { "@id": BRAND.canonicalUrl + "#org" },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: BRAND.canonicalUrl + "/landing/hero.webp",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": BRAND.canonicalUrl + "#app",
      name: BRAND.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: BRAND.canonicalUrl,
      image: BRAND.canonicalUrl + "/landing/hero.webp",
      description: BRAND.description,
      mainEntityOfPage: { "@id": BRAND.url },
      publisher: { "@id": BRAND.canonicalUrl + "#org" },
      offers: softwareOffers(r),
    },
    {
      "@type": "FAQPage",
      "@id": BRAND.canonicalUrl + "/#faq",
      isPartOf: { "@id": BRAND.url },
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
});
