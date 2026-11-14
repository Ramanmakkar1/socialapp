export const BIO_LIMIT = 150;

export type BioPlatform = "instagram" | "tiktok" | "x" | "threads" | "facebook";

export const PLATFORM_BIO_LIMIT: Record<BioPlatform, number> = {
  instagram: 150,
  tiktok: 80,
  x: 160,
  threads: 150,
  facebook: 101,
};

export const NICHES = [
  { id: "creator", label: "Creator" },
  { id: "small-business", label: "Small business" },
  { id: "coach", label: "Coach" },
  { id: "photographer", label: "Photographer" },
  { id: "fitness", label: "Fitness" },
  { id: "food", label: "Food" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "agency", label: "Agency" },
] as const;

export type NicheId = (typeof NICHES)[number]["id"];

export const BIO_TEMPLATES: Record<NicheId, string[]> = {
  creator: [
    "✨ {what}\n📍 Creating daily\n👇 {cta}",
    "{name} | {what}\n🎬 New posts weekly\n↓ {cta}",
    "✨ {name}\n{what}\n👇 {cta}",
    "🌟 {what}\n💌 Collabs welcome\n{cta}",
  ],
  "small-business": [
    "{name}\n{what}\n📍 Local & online\n👇 {cta}",
    "✨ {what}\n⭐ Small shop, big heart\n{cta}",
    "{name} | {what}\n🛍️ Shop with us\n↓ {cta}",
    "📦 {what}\n💬 Questions? DM us\n{cta}",
  ],
  coach: [
    "{name} | {what}\n🎯 Your next step\n👇 {cta}",
    "✨ {what}\n📚 Tips & clarity\n{cta}",
    "💡 {name}\nHelping you {what}\n↓ {cta}",
    "🌱 {what}\n📩 Free resources\n{cta}",
  ],
  photographer: [
    "📸 {what}\n📍 Available for shoots\n👇 {cta}",
    "{name} | {what}\n✨ Portfolio below\n{cta}",
    "🖼️ {name}\n{what}\n↓ {cta}",
    "📷 {what}\n💌 Bookings open\n{cta}",
  ],
  fitness: [
    "💪 {what}\n🏋️ Train with purpose\n👇 {cta}",
    "{name} | {what}\n🔥 Programs & tips\n{cta}",
    "✨ {name}\n{what}\n↓ {cta}",
    "🏃 {what}\n📩 Start today\n{cta}",
  ],
  food: [
    "🍽️ {what}\n📍 Recipes & reviews\n👇 {cta}",
    "{name} | {what}\n✨ Good food daily\n{cta}",
    "👨‍🍳 {name}\n{what}\n↓ {cta}",
    "🥗 {what}\n📩 New posts weekly\n{cta}",
  ],
  ecommerce: [
    "🛒 {what}\n📦 Fast shipping\n👇 {cta}",
    "{name} | {what}\n✨ Shop the drop\n{cta}",
    "✨ {name}\n{what}\n↓ {cta}",
    "💎 {what}\n🎁 New arrivals\n{cta}",
  ],
  agency: [
    "{name} | {what}\n🚀 Growth-focused\n👇 {cta}",
    "✨ {what}\n📈 Strategy & creative\n{cta}",
    "💼 {name}\n{what}\n↓ {cta}",
    "🌐 {what}\n📩 Let’s talk\n{cta}",
  ],
};

export function fillBio(
  template: string,
  v: { name: string; what: string; cta: string },
): string {
  const filled = template
    .replace(/\{name\}/g, v.name)
    .replace(/\{what\}/g, v.what)
    .replace(/\{cta\}/g, v.cta);
  return filled
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join("\n");
}

export function bioLength(text: string): number {
  return Array.from(text).length;
}
