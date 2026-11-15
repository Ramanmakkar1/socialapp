import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";
import { publisherRef } from "@/lib/tool-schema";
import type { ToolFaq } from "@/lib/tool-schema";

/** Site-wide 1200×630 social card (src/app/opengraph-image.tsx). */
const OG_IMAGE = { url: "/opengraph-image", width: 1200, height: 630, alt: `${BRAND.name} free Instagram tools` };

/** Longest tool title, brand suffix included, that stays inside the 60-character SEO limit. */
const MAX_TITLED_LENGTH = 50;

/** Add the brand suffix to titles that fit, and leave longer titles alone so the result stays under 60 characters. */
export function toolTitle(title: string): string {
  return title.length <= MAX_TITLED_LENGTH ? `${title} | ${BRAND.name}` : title;
}

/** Page metadata for a tool page: absolute title, description, canonical, Open Graph and Twitter card. */
export function toolMetadata({ path, title, description }: { path: string; title: string; description: string }): Metadata {
  const titled = toolTitle(title);
  return {
    title: { absolute: titled },
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: BRAND.name, title: titled, description, url: path, images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title: titled, description, images: [OG_IMAGE.url] },
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
    publisher: publisherRef(),
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
