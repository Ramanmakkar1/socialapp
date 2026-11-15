import { TWITCH_SCOPES, exchangeTwitchCode, twitchUser } from "@/lib/networks/apps";
import { finishOAuth } from "@/lib/networks/routes";

export async function GET(request: Request) {
  return finishOAuth(request, "twitch", async (code) => {
    const tokens = await exchangeTwitchCode(code);
    const user = await twitchUser(tokens.accessToken);
    return {
      externalId: user.id,
      username: user.login || null,
      tokens,
      scopes: TWITCH_SCOPES,
      meta: { login: user.login, name: user.name },
    };
  });
}
