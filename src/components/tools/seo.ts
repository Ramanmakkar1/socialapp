import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import type { ToolFaq } from "@/lib/tool-schema";

/** Site-wide 1200×630 social card (src/app/opengraph-image.tsx). */
const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: `${BRAND.name} free Instagram tools` };

/** Page metadata for a tool page: absolute title, description, canonical, Open Graph and Twitter card. */
export function toolMetadata({ path, title, description }: { path: string; title: string; description: string }): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: BRAND.name, title, description, url: path, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}

export type AppCategory = "BusinessApplication" | "MultimediaApplication" | "DesignApplication" | "UtilitiesApplication";

/** WebApplication JSON-LD: a free tool that runs in the browser. No ratings or reviews are claimed. */
export function webAppJsonLd({ name, description, path, category = "BusinessApplication", features }: {
  name: string;
  description: string;
  path: string;
  category?: AppCategory;
  features?: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name,
    description,
    url: `${BRAND.url}${path}`,
    applicationCategory: category,
    operatingSystem: "Web",
    browserRequirements: "Requires JavaScript and a modern web browser.",
    isAccessibleForFree: true,
    ...(features?.length ? { featureList: features } : {}),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: BRAND.company, url: BRAND.url },
  };
}

/** HowTo JSON-LD built from the same steps the page renders. */
export function howToJsonLd({ name, path, steps }: { name: string; path: string; steps: { title: string; text: string }[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map((s, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: s.title,
      text: s.text,
      url: `${BRAND.url}${path}#how-to`,
    })),
  };
}

export { faqJsonLd, ldJson } from "@/lib/tool-schema";
export type { ToolFaq };
