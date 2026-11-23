import { BRAND } from "@/lib/brand";
import { GUIDES_BY_DATE, categoryLabel, guidePath, type GuideEntry } from "@/content/guides/registry";

/**
 * JSON-LD for a single /guides/[slug] article: a WebPage whose mainEntity is
 * the BlogPosting. Every URL and @id uses the production canonical origin.
 */
export function guideArticleJsonLd(guide: GuideEntry) {
  const url = `${BRAND.canonicalUrl}${guidePath(guide.slug)}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: guide.title,
        description: guide.description,
        inLanguage: "en",
        isPartOf: { "@id": `${BRAND.canonicalUrl}#website` },
        about: { "@id": `${BRAND.canonicalUrl}#org` },
        mainEntity: { "@id": `${url}#article` },
      },
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: guide.h1,
        description: guide.description,
        image: [`${BRAND.canonicalUrl}${guide.cover.src}`],
        datePublished: guide.published,
        dateModified: guide.updated,
        author: { "@type": "Organization", name: guide.author, url: BRAND.canonicalUrl },
        publisher: { "@id": `${BRAND.canonicalUrl}#org` },
        isPartOf: { "@id": `${BRAND.canonicalUrl}#website` },
        mainEntityOfPage: { "@id": `${url}#webpage` },
        url,
        articleSection: categoryLabel(guide.category),
        wordCount: guide.wordCount,
        inLanguage: "en",
      },
    ],
  };
}

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
      url: `${BRAND.canonicalUrl}${guidePath(x.slug)}`,
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
        inLanguage: "en",
        isPartOf: { "@id": `${BRAND.canonicalUrl}#website` },
        mainEntity: { "@id": `${url}#itemlist` },
      },
      itemList,
    ],
  };
}
