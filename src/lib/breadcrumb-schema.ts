import { BRAND } from "./brand";

export type BreadcrumbItem = { name: string; path: string };

/**
 * BreadcrumbList JSON-LD for a page trail. Each crumb's `path` is resolved
 * against the production canonical origin, so every emitted item URL is
 * absolute (https://poskoo.com/...). A crumb with an empty path (the current
 * page) is emitted without an item URL.
 */
export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      ...(item.path ? { item: `${BRAND.canonicalUrl}${item.path}` } : {}),
    })),
  };
}
