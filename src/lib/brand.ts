// Working name until Raman picks the real name + domain. Change it here only.
const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://socialapp.splitforms.com";
export const BRAND = {
  name: "Poskoo",
  tagline: "Schedule posts. Auto-DM every comment. Grow on autopilot.",
  description:
    "One tool to plan and auto-publish your social posts and automatically DM everyone who comments — with AI replies and lead capture built in.",
  url: rawUrl.replace(/\/+$/, ""),
  // Raman must authorize the new-domain launch before this value changes.
  // Keep staging noindex and its sitemap empty, even when SITE_INDEXABLE=true.
  indexable: false,
  supportEmail: "support@splitforms.com",
  company: "Town Media Labs",
};
