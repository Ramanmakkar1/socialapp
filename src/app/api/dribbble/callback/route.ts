import { DRIBBBLE_SCOPES, dribbbleUser, exchangeDribbbleCode } from "@/lib/networks/moreApps";
import { finishOAuth } from "@/lib/networks/routes";

export async function GET(request: Request) {
  return finishOAuth(request, "dribbble", async (code) => {
    const tokens = await exchangeDribbbleCode(code);
    const user = await dribbbleUser(tokens.accessToken);
    return { externalId: user.id, username: user.login || user.name, tokens, scopes: DRIBBBLE_SCOPES, meta: { name: user.name } };
  });
}
