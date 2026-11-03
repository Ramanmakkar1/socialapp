// Working name until Raman picks the real name + domain. Change it here only.
export const BRAND = {
  name: "Postflow",
  tagline: "Schedule every post. Turn every comment into a lead.",
  description:
    "One tool to plan and auto-publish your social posts and automatically DM everyone who comments — with AI replies and lead capture built in.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  // Launch switch: set SITE_INDEXABLE=true only when the product goes public.
  indexable: process.env.SITE_INDEXABLE === "true",
  supportEmail: "support@splitforms.com",
  company: "Town Media Labs",
};
