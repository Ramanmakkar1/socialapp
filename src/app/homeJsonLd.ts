import { BRAND } from "@/lib/brand";
import { softwareOffers, type PlanReadiness } from "@/lib/plans";

// Home page JSON-LD graph. The Organization (#org) and WebSite (#website) nodes
// are emitted once by the root layout; this graph links to them by @id so the
// page, app and FAQ stay part of the same entity graph.
export const homePageJsonLd = (faqs: { q: string; a: string }[], r: PlanReadiness) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": BRAND.canonicalUrl + "/#webpage",
      url: BRAND.canonicalUrl + "/",
      name: `Instagram Scheduler & Auto-DM Automation Tool | ${BRAND.name}`,
      description: BRAND.description,
      isPartOf: { "@id": BRAND.canonicalUrl + "#website" },
      about: { "@id": BRAND.canonicalUrl + "#org" },
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
      mainEntityOfPage: { "@id": BRAND.canonicalUrl + "/#webpage" },
      publisher: { "@id": BRAND.canonicalUrl + "#org" },
      offers: softwareOffers(r),
    },
    {
      "@type": "FAQPage",
      "@id": BRAND.canonicalUrl + "/#faq",
      isPartOf: { "@id": BRAND.canonicalUrl + "/#webpage" },
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
});
