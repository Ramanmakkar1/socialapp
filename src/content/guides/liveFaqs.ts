// Server only: guide FAQ answers that follow the live platform status.
// The client GuidesDirectory imports registry.ts, so this module must never be imported from it.
import { getPlatformCopy, listText, pendingNetworksText } from "@/lib/platform-support";

export function liveGuideFaqs(slug: string, faqs: { q: string; a: string }[]): { q: string; a: string }[] {
  return faqs.map((f) => {
    if (slug === "how-to-cross-post-on-social-media" && f.q === "Which networks can Poskoo cross-post to?") {
      const c = getPlatformCopy();
      return { q: f.q, a: `Poskoo publishes today to ${listText(c.live.social)}. ${pendingNetworksText(["tiktok", "pinterest", "x", "linkedin_pages"], c.catalog)}`.trim() };
    }
    if (slug === "linkedin-posting-strategy-for-founders" && f.q === "Can I schedule LinkedIn posts?") {
      const c = getPlatformCopy();
      const live = c.catalog.find((e) => e.id === "linkedin_pages")?.live === true;
      const sentences = f.a.split(/(?<=[.!?])\s+/);
      if (live) return { q: f.q, a: `${sentences.slice(0, 2).join(" ")} Poskoo also schedules text and image posts to personal LinkedIn profiles and company Pages.` };
      return f;
    }
    return f;
  });
}
