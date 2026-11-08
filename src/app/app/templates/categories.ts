import type { DmTemplate } from "@/lib/dmTemplates";

export type TemplateCategoryId = "all" | "popular" | "sell" | "engage" | "leads" | "book";

export const CATEGORIES: { id: TemplateCategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "popular", label: "Popular" },
  { id: "sell", label: "Sell & earn" },
  { id: "engage", label: "Engage audience" },
  { id: "leads", label: "Capture leads" },
  { id: "book", label: "Book clients" },
];

const POPULAR = new Set([
  "send-link",
  "product-link",
  "free-guide",
  "discount-code",
  "book-a-call",
  "story-freebie",
]);

const BY_SLUG: Record<string, Exclude<TemplateCategoryId, "all" | "popular">[]> = {
  "send-link": ["sell"],
  "product-link": ["sell"],
  "price-request": ["sell"],
  "discount-code": ["sell"],
  "affiliate-links": ["sell"],
  "story-freebie": ["engage"],
  "follow-bonus": ["engage"],
  "dm-auto-reply": ["engage"],
  "thank-commenters": ["engage"],
  "recipe-download": ["engage"],
  "giveaway-entry": ["engage"],
  "free-guide": ["leads"],
  "email-checklist": ["leads"],
  "course-waitlist": ["leads"],
  "book-a-call": ["book"],
  "webinar-signup": ["book"],
  "portfolio": ["book"],
};

export function categoriesFor(slug: string): Exclude<TemplateCategoryId, "all" | "popular">[] {
  return BY_SLUG[slug] ?? [];
}

export function visibleIn(template: DmTemplate, category: TemplateCategoryId): boolean {
  if (category === "all") return true;
  if (category === "popular") return POPULAR.has(template.slug);
  return categoriesFor(template.slug).includes(category);
}
