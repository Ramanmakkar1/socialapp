import { BRAND } from "@/lib/brand";
import { GUIDES_BY_DATE, guidePath } from "@/content/guides/registry";

/**
 * JSON-LD for the /guides hub: a CollectionPage whose mainEntity is the
 * ItemList of every published guide. BreadcrumbList is added by PublicShell.
 */
export function guidesHubJsonLd({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  const itemList = {
    "@type": "ItemList",
    "@id": `${url}#itemlist`,
    name,
    numberOfItems: GUIDES_BY_DATE.length,
    itemListElement: GUIDES_BY_DATE.map((x, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: x.h1,
      url: `${BRAND.url}${guidePath(x.slug)}`,
    })),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#collectionpage`,
        name,
        description,
        url,
        mainEntity: { "@id": `${url}#itemlist` },
      },
      itemList,
    ],
  };
}
