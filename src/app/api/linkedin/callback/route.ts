import { BRAND } from "@/lib/brand";
import { exchangeLinkedInCode, fetchLinkedInOrgs, fetchLinkedInProfile, linkedinConfig, linkedinScopes } from "@/lib/networks/linkedin";
import { finishOAuth } from "@/lib/networks/routes";

export async function GET(request: Request) {
  return finishOAuth(
    request,
    "linkedin",
    async (code) => {
      const tokens = await exchangeLinkedInCode(code);
      const profile = await fetchLinkedInProfile(tokens.accessToken);
      // Company Pages only with the Community Management API (LINKEDIN_PAGES_ENABLED=1). The member
      // picks which Pages to post to next (meta.orgs); meta.orgsAvailable is what they administer.
      const orgsAvailable = linkedinConfig().companyPages ? await fetchLinkedInOrgs(tokens.accessToken) : [];
      return {
        externalId: profile.sub,
        username: profile.name || null,
        tokens,
        scopes: linkedinScopes(),
        meta: { avatarUrl: profile.picture, orgsAvailable, orgs: [] },
      };
    },
    // Pages to choose from: open the Connect dialog's "Select the Pages to connect" step.
    (input, done) => {
      const available = Array.isArray(input.meta?.orgsAvailable) ? input.meta.orgsAvailable : [];
      return available.length > 0 ? new URL("/app/publish?connect_pick=linkedin", BRAND.url) : done;
    },
  );
}
