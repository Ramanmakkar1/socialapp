import { NetworkAuthError } from "@/lib/networks/common";
import { WHOP_SCOPES, exchangeWhopCode, whopForums, whopUser } from "@/lib/networks/moreApps";
import { finishOAuth } from "@/lib/networks/routes";

export async function GET(request: Request) {
  return finishOAuth(request, "whop", async (code, flow) => {
    if (!flow.verifier) throw new NetworkAuthError("state_error", "missing PKCE verifier");
    const tokens = await exchangeWhopCode(code, flow.verifier);
    const user = await whopUser(tokens.accessToken);
    // The first forum becomes the default; the composer can name another one per post.
    const forums = await whopForums(tokens.accessToken).catch(() => []);
    return { externalId: user.id, username: user.name, tokens, scopes: WHOP_SCOPES, meta: { defaultExperience: forums[0]?.id ?? "", forums: forums.slice(0, 50) } };
  });
}
