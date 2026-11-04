// Working name until Raman picks the real name + domain. Change it here only.
const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://socialapp.splitforms.com";
export const BRAND = {
  name: "Poskoo",
  tagline: "Schedule posts. Auto-DM every comment. Grow on autopilot.",
  description:
    "One tool to plan and auto-publish your social posts and automatically DM everyone who comments — with AI replies and lead capture built in.",
  url: rawUrl.replace(/\/+$/, ""),
  // Launch switch: set SITE_INDEXABLE=true only when the product goes public.
  indexable: process.env.SITE_INDEXABLE === "true",
  supportEmail: "support@splitforms.com",
  company: "Town Media Labs",
};
