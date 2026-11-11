import { DM_TEMPLATES, type DmTemplate } from "@/lib/dmTemplates";

export type TemplateCategoryId = "all" | "popular" | "leads" | "sell" | "events" | "content";

export const CATEGORIES: { id: TemplateCategoryId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "popular", label: "Featured" },
  { id: "leads", label: "Lead magnets" },
  { id: "sell", label: "Selling products" },
  { id: "events", label: "Events and calls" },
  { id: "content", label: "Content and downloads" },
];

export type GoalCategory = Exclude<TemplateCategoryId, "all" | "popular">;

const POPULAR = new Set(["free-guide", "product-link", "discount-code", "send-link", "book-a-call", "story-freebie"]);

// Each template's own use case decides its section; the two odd ones join the closest section.
const BY_USE_CASE: Record<string, GoalCategory> = {
  "Lead magnets": "leads",
  "Selling products": "sell",
  "Events and calls": "events",
  "Booking clients": "events",
  "Content and downloads": "content",
  "Engaging your audience": "content",
};

export function categoriesFor(slug: string): GoalCategory[] {
  const t = DM_TEMPLATES.find((tpl) => tpl.slug === slug);
  const c = t ? BY_USE_CASE[t.useCase] : undefined;
  return c ? [c] : [];
}

export function visibleIn(template: DmTemplate, category: TemplateCategoryId): boolean {
  if (category === "all") return true;
  if (category === "popular") return POPULAR.has(template.slug);
  return categoriesFor(template.slug).includes(category);
}

export const FEATURED_SLUGS = [...POPULAR];
