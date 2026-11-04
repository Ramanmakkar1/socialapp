// Working name until Raman picks the real name + domain. Change it here only.
const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://socialapp.splitforms.com";
export const BRAND = {
  name: "Poskoo",
  tagline: "Schedule posts. Auto-DM every comment. Grow on autopilot.",
  description:
    "One tool to plan and auto-publish your social posts and automatically DM everyone who comments — with AI replies and lead capture built in.",
  url: rawUrl.replace(/\/+$/, ""),
  // Hard-coded false until Raman explicitly approves indexing after the domain move.
  // SITE_INDEXABLE is ignored here so staging cannot leak into sitemap or robots allow.
  indexable: false,
  supportEmail: "support@splitforms.com",
  company: "Town Media Labs",
};
