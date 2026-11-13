// Working name until Raman picks the real name + domain. Change it here only.
const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://poskoo.com";
export const BRAND = {
  name: "Poskoo",
  tagline: "Schedule posts. Auto-DM every comment. Grow on Poskoo.",
  description:
    "One tool to plan and auto-publish your social posts and automatically DM everyone who comments — with AI captions and lead capture built in.",
  url: rawUrl.replace(/\/+$/, ""),
  // Search launch authorized by Raman on 2026-11-12: pages are indexable and the sitemap is live.
  // Set back to false only to take the whole site out of search (noindex everywhere, empty sitemap).
  indexable: true,
  supportEmail: "hello@poskoo.com",
  // Official Poskoo profiles (Organization sameAs). Add each new one here.
  social: [
    "https://www.facebook.com/profile.php?id=61596482132387",
    "https://www.youtube.com/@poskooapp",
  ],
  company: "Town Media Labs",
};
