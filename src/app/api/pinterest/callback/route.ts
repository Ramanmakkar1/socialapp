import { PINTEREST_SCOPES, exchangePinterestCode, fetchPinterestProfile } from "@/lib/networks/pinterest";
import { finishOAuth } from "@/lib/networks/routes";

export async function GET(request: Request) {
  return finishOAuth(request, "pinterest", async (code) => {
    const tokens = await exchangePinterestCode(code);
    const profile = await fetchPinterestProfile(tokens.accessToken);
    return {
      externalId: profile.id || profile.username,
      username: profile.username || null,
      tokens,
      scopes: PINTEREST_SCOPES,
      meta: { avatarUrl: profile.avatar },
    };
  });
}
