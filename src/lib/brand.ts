// Working name until Raman picks the real name + domain. Change it here only.
const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://poskoo.com";
export const BRAND = {
  name: "Poskoo",
  tagline: "Schedule posts. Auto-DM every comment. Grow on Poskoo.",
  description:
    "One tool to plan and auto-publish your social posts and automatically DM everyone who comments — with AI captions and lead capture built in.",
  url: rawUrl.replace(/\/+$/, ""),
  // Raman must authorize the new-domain launch before this value changes.
  // indexable stays false (staging noindex, empty sitemap) until Raman authorizes the new-domain launch. No env var changes it.
  indexable: false,
  supportEmail: "hello@poskoo.com",
  company: "Town Media Labs",
};
