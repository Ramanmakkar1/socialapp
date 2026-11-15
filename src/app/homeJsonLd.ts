import { BRAND } from "@/lib/brand";
import { softwareOffers, type PlanReadiness } from "@/lib/plans";

// Home page JSON-LD graph. The root layout also emits Organization and WebSite
// nodes; this graph repeats them (same @ids) so the homepage itself carries a
// complete Organization + WebSite + SoftwareApplication entity graph, and the
// page, app and FAQ stay linked to the same entities.
export const homePageJsonLd = (
  faqs: { q: string; a: string }[],
  r: PlanReadiness,
  title: string = BRAND.name,
) => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": BRAND.url + "#org",
      name: BRAND.name,
      url: BRAND.url,
    },
    {
      "@type": "WebSite",
      "@id": BRAND.url + "#website",
      url: BRAND.url,
      name: BRAND.name,
      publisher: { "@id": BRAND.url + "#org" },
      inLanguage: "en",
      description: BRAND.description,
    },
    {
      "@type": "WebPage",
      "@id": BRAND.url,
      url: BRAND.url,
      name: title,
      description: BRAND.description,
      inLanguage: "en",
      isPartOf: { "@id": BRAND.url + "#website" },
      publisher: { "@id": BRAND.url + "#org" },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: BRAND.url + "/landing/hero.webp",
      },
    },
    {
      "@type": "SoftwareApplication",
      "@id": BRAND.url + "#app",
      name: BRAND.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: BRAND.url,
      image: BRAND.url + "/landing/hero.webp",
      mainEntityOfPage: { "@id": BRAND.url },
      publisher: { "@id": BRAND.url + "#org" },
      offers: softwareOffers(r),
    },
    {
      "@type": "BreadcrumbList",
      "@id": BRAND.url + "#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: BRAND.url,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": BRAND.url + "/#faq",
      isPartOf: { "@id": BRAND.url },
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
});
