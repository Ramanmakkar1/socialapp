import { NetworkAuthError } from "@/lib/networks/common";
import { finishOAuth } from "@/lib/networks/routes";
import { TIKTOK_SCOPES, exchangeTikTokCode, fetchTikTokUser, queryCreatorInfo } from "@/lib/networks/tiktok";

export async function GET(request: Request) {
  return finishOAuth(request, "tiktok", async (code) => {
    const { tokens, openId, scope } = await exchangeTikTokCode(code);
    const granted = scope ? scope.split(",").map((s) => s.trim()).filter(Boolean) : TIKTOK_SCOPES;
    if (!granted.includes("video.publish") && !granted.includes("video.upload")) {
      throw new NetworkAuthError("declined", "TikTok posting permission was not granted");
    }
    const user = await fetchTikTokUser(tokens.accessToken);
    // creator_info gives the @username (user.info.basic only has the display name).
    const creator = await queryCreatorInfo(tokens.accessToken);
    const username = creator.ok && creator.info.username ? creator.info.username : user.displayName || null;
    return {
      externalId: user.openId || openId,
      username,
      tokens,
      scopes: granted,
      meta: { displayName: user.displayName, avatarUrl: user.avatarUrl },
    };
  });
}
