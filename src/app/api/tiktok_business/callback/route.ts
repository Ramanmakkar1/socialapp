import { TIKTOK_BUSINESS_SCOPES, exchangeTikTokBusinessCode, tiktokBusinessProfile } from "@/lib/networks/moreApps";
import { finishOAuth } from "@/lib/networks/routes";

export async function GET(request: Request) {
  return finishOAuth(request, "tiktok_business", async (code) => {
    const { openId, ...tokens } = await exchangeTikTokBusinessCode(code);
    // open_id doubles as the business_id of every Business API call.
    const profile = await tiktokBusinessProfile(tokens.accessToken, openId);
    return { externalId: openId, username: profile.username || profile.displayName, tokens, scopes: TIKTOK_BUSINESS_SCOPES, meta: { name: profile.displayName } };
  });
}
