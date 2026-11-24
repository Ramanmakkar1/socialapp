import { exchangeMeweLogin, meweMe } from "@/lib/networks/moreApps";
import { finishOAuth } from "@/lib/networks/routes";

// MeWe returns ?loginRequestToken=… (swapped for an API token) instead of an OAuth code.
export async function GET(request: Request) {
  return finishOAuth(
    request,
    "mewe",
    async (loginRequestToken) => {
      const tokens = await exchangeMeweLogin(loginRequestToken);
      const me = await meweMe(tokens.accessToken);
      return { externalId: me.id, username: me.handle || me.name, tokens, scopes: [], meta: { name: me.name } };
    },
    undefined,
    "loginRequestToken",
  );
}
