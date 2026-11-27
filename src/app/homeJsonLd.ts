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
      "@id": BRAND.canonicalUrl + "#org",
      name: BRAND.name,
      legalName: BRAND.company,
      url: BRAND.canonicalUrl + "/",
      email: BRAND.supportEmail,
      description: BRAND.description,
      slogan: BRAND.tagline,
      sameAs: BRAND.social,
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: BRAND.supportEmail,
      },
      logo: {
        "@type": "ImageObject",
        url: BRAND.canonicalUrl + "/brand/poskoo-icon-1024.png",
        width: 1024,
        height: 1024,
      },
    },
    {
      "@type": "WebSite",
      "@id": BRAND.canonicalUrl + "#website",
      url: BRAND.canonicalUrl + "/",
      name: BRAND.name,
      publisher: { "@id": BRAND.canonicalUrl + "#org" },
      inLanguage: "en",
      description: BRAND.description,
    },
    {
      "@type": "WebPage",
      "@id": BRAND.canonicalUrl,
      url: BRAND.canonicalUrl,
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
      description: BRAND.description,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      featureList: [
        "Social media post scheduling calendar",
        "Instagram comment-to-DM automation",
        ...(r.ai ? ["AI caption drafting"] : []),
        "Lead capture by email in the DM",
        "Instagram link-in-bio page",
        "Analytics for reach, comments, DMs, link clicks and leads",
      ],
      url: BRAND.canonicalUrl,
      image: BRAND.canonicalUrl + "/landing/hero.webp",
      sameAs: BRAND.social,
      isAccessibleForFree: true,
      mainEntityOfPage: { "@id": BRAND.canonicalUrl },
      publisher: { "@id": BRAND.canonicalUrl + "#org" },
      creator: { "@id": BRAND.canonicalUrl + "#org" },
      offers: softwareOffers(r),
    },
    {
      "@type": "BreadcrumbList",
      "@id": BRAND.canonicalUrl + "#breadcrumb",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: BRAND.canonicalUrl,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": BRAND.canonicalUrl + "/#faq",
      isPartOf: { "@id": BRAND.canonicalUrl },
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
});
