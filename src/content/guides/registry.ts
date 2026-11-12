// Single list of every guide article. The /guides hub, the /guides/[slug] template, the
// sitemap, public-pages and llms.txt all read from here, so a new article is added once:
// a registry entry below + a body module in ./bodies.ts.
// Pure data (no JSX) so node:test files can import it.

export type GuideCategory = "growth" | "scheduling" | "auto-dm" | "ideas";

export const GUIDE_CATEGORIES: { id: GuideCategory; label: string }[] = [
  { id: "growth", label: "Instagram growth" },
  { id: "scheduling", label: "Scheduling" },
  { id: "auto-dm", label: "Auto-DM & leads" },
  { id: "ideas", label: "Content ideas" },
];

export type GuideFaq = { q: string; a: string };

export type GuideEntry = {
  slug: string;
  /** <title>, max 60 characters, unique. */
  title: string;
  /** Meta description, 140–155 characters, unique. */
  description: string;
  /** H1 (may be longer than the <title>). */
  h1: string;
  subtitle: string;
  /** Short breadcrumb / card label. */
  crumb: string;
  /** One line for cards. */
  excerpt: string;
  category: GuideCategory;
  author: string;
  /** ISO dates (YYYY-MM-DD). */
  published: string;
  updated: string;
  /** Measured from the article body (≈230 words per minute). */
  wordCount: number;
  cover: { src: string; width: number; height: number; alt: string };
  takeaways: string[];
  faqs: GuideFaq[];
  /** Free tool hrefs for the related-tools carousel (first one is the "relevant tool" CTA). */
  tools: string[];
  /** Related guide slugs. */
  related?: string[];
};

export const GUIDES: GuideEntry[] = [
  {
    slug: "best-instagram-niches-2026",
    title: "Best Instagram Niches to Start in 2026 (and How to Pick)",
    description:
      "18 Instagram niches worth starting in 2026, with content ideas, ways to earn and difficulty for each, plus a simple scoring method and a 7-day niche test.",
    h1: "The best Instagram niches to start in 2026 (and how to pick yours)",
    subtitle:
      "18 niches with real content ideas, honest monetization paths and a simple way to test one in a week before you commit.",
    crumb: "Best Instagram niches 2026",
    excerpt: "18 niches with content ideas, ways to earn and a 7-day test to pick yours.",
    category: "growth",
    author: "Poskoo team",
    published: "2026-11-11",
    updated: "2026-11-11",
    wordCount: 3070,
    cover: {
      src: "/guides/best-instagram-niches-2026.webp",
      width: 1029,
      height: 698,
      alt: "A creator holding a phone picks a plant card from floating niche cards: dumbbell, recipe bowl, laptop, paint palette, coins and a travel pin",
    },
    takeaways: [
      "Pick a niche where you can make 50+ posts without running dry, not just the one that looks most profitable.",
      "Instagram now favours original content in recommendations, so niches you can film or photograph yourself have an edge.",
      "Score each idea on knowledge, demand, repeatability, ways to earn and your angle, then test the top two for 7 days.",
      "Most small accounts earn first from affiliate links, UGC, services or a small digital product, not from big brand deals.",
      "A narrow promise (\"plant care for dark apartments\") beats a broad topic (\"plants\") when you are starting from zero.",
    ],
    faqs: [
      {
        q: "What is the most profitable Instagram niche in 2026?",
        a: "There is no single answer. Finance, business, tech and fitness have many ways to earn but are crowded. The most profitable niche for you is one where you can help, post consistently and sell something real: an affiliate product you use, a service, UGC or a small digital product.",
      },
      {
        q: "Can I grow on Instagram without a niche?",
        a: "You can, but it is slower. A clear niche tells new viewers what they get if they follow, and makes ideas easier to find. A broad topic works if every post keeps the same promise.",
      },
      {
        q: "How many niches should I test before choosing one?",
        a: "Score five to ten ideas on paper, then test your top two in real posts for about a week. Testing more at once splits your effort.",
      },
      {
        q: "Do faceless Instagram accounts still work in 2026?",
        a: "Yes, if the content is original. Recipes, plant care, art process and tech walkthroughs work without showing your face. Reposting other people's clips does not: Instagram limits recommendations for accounts that mostly post unoriginal content.",
      },
      {
        q: "How long does it take to know if a niche is working?",
        a: "A 7-day test shows whether you can keep making the content and which posts get saves, shares and comments. Give the winner a few more weeks of steady posting before judging growth.",
      },
      {
        q: "Can I change my niche later?",
        a: "Yes. Many creators narrow or shift as they learn what their audience responds to. Post the new angle alongside your current content, then update your bio once it works.",
      },
    ],
    tools: [
      "/tools/instagram-post-ideas-generator",
      "/tools/instagram-hashtag-generator",
      "/tools/instagram-hook-generator",
      "/tools/instagram-bio-generator",
      "/tools/instagram-username-generator",
      "/tools/instagram-posting-frequency-calculator",
      "/tools/social-media-content-calendar",
      "/tools/instagram-engagement-rate-calculator",
    ],
  },
];

/** Minutes to read at ≈230 words per minute, at least 1. */
export const readingMinutes = (g: GuideEntry) => Math.max(1, Math.round(g.wordCount / 230));

export const guideBySlug = (slug: string) => GUIDES.find((g) => g.slug === slug);
export const guidePath = (slug: string) => `/guides/${slug}`;
export const categoryLabel = (c: GuideCategory) => GUIDE_CATEGORIES.find((x) => x.id === c)?.label ?? c;

/** Newest first by published date. */
export const GUIDES_BY_DATE = [...GUIDES].sort((a, b) => b.published.localeCompare(a.published));
