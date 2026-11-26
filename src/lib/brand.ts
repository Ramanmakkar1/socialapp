// Working name until Raman picks the real name + domain. Change it here only.
export const APPROVED_PRODUCTION_URL = "https://poskoo.com";
const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL || APPROVED_PRODUCTION_URL;

function normalizeSiteUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:") return null;
    return `${url.protocol}//${url.host}`.toLowerCase();
  } catch {
    return null;
  }
}

// The sitemap may only ever advertise the approved production origin. A staging
// or legacy host (e.g. socialapp.splitforms.com) is always served with a noindex
// header, so its URLs must never be listed even if the flag is forced on.
export function isApprovedProductionOrigin(value: string | undefined): boolean {
  return normalizeSiteUrl(value) === APPROVED_PRODUCTION_URL;
}

// Indexing is opt-in and fails closed: the flag must be true AND the site URL
// must be explicitly set to the approved production origin. A staging host (or
// a missing URL) can never become indexable by setting the flag alone.
export function resolveSiteIndexable(): boolean {
  const flag = process.env.NEXT_PUBLIC_SITE_INDEXABLE?.trim().toLowerCase();
  if (flag !== "true" && flag !== "1") return false;
  return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) === APPROVED_PRODUCTION_URL;
}

export const BRAND = {
  name: "Poskoo",
  tagline: "Schedule posts. Auto-DM every comment. Grow on Poskoo.",
  description:
    "One tool to plan and auto-publish your social posts and automatically DM everyone who comments, with lead capture built in.",
  url: rawUrl.replace(/\/+$/, ""),
  // Canonicals and metadataBase always use the final production origin, even
  // when NEXT_PUBLIC_SITE_URL points at the legacy staging host.
  canonicalUrl: APPROVED_PRODUCTION_URL,
  // Socialapp remains staging/noindex until Raman moves it to the new domain.
  // Defaults to false; only an explicit flag + approved production URL enables it.
  indexable: resolveSiteIndexable(),
  supportEmail: "hello@poskoo.com",
  // Official Poskoo profiles (Organization sameAs). Add each new one here.
  social: [
    "https://www.facebook.com/profile.php?id=61596482132387",
    "https://www.youtube.com/@poskooapp",
  ],
  company: "Town Media Labs",
};
