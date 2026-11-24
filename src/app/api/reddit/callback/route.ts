import { REDDIT_SCOPES, exchangeRedditCode, redditMe } from "@/lib/networks/moreApps";
import { finishOAuth } from "@/lib/networks/routes";

export async function GET(request: Request) {
  return finishOAuth(request, "reddit", async (code) => {
    const tokens = await exchangeRedditCode(code);
    const me = await redditMe(tokens.accessToken);
    return { externalId: me.id || me.name, username: me.name, tokens, scopes: REDDIT_SCOPES, meta: { name: me.name } };
  });
}
