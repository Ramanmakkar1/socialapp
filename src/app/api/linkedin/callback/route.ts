import { exchangeLinkedInCode, fetchLinkedInOrgs, fetchLinkedInProfile, linkedinConfig, linkedinScopes } from "@/lib/networks/linkedin";
import { finishOAuth } from "@/lib/networks/routes";

export async function GET(request: Request) {
  return finishOAuth(request, "linkedin", async (code) => {
    const tokens = await exchangeLinkedInCode(code);
    const profile = await fetchLinkedInProfile(tokens.accessToken);
    // Company pages only with the Community Management API (LINKEDIN_COMPANY_PAGES=1).
    const orgs = linkedinConfig().companyPages ? await fetchLinkedInOrgs(tokens.accessToken) : [];
    return {
      externalId: profile.sub,
      username: profile.name || null,
      tokens,
      scopes: linkedinScopes(),
      meta: { avatarUrl: profile.picture, orgs },
    };
  });
}
