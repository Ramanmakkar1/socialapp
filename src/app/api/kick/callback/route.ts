import { NetworkAuthError } from "@/lib/networks/common";
import { KICK_SCOPES, exchangeKickCode, kickUser } from "@/lib/networks/moreApps";
import { finishOAuth } from "@/lib/networks/routes";

export async function GET(request: Request) {
  return finishOAuth(request, "kick", async (code, flow) => {
    if (!flow.verifier) throw new NetworkAuthError("state_error", "missing PKCE verifier");
    const tokens = await exchangeKickCode(code, flow.verifier);
    const user = await kickUser(tokens.accessToken);
    return { externalId: user.id, username: user.name, tokens, scopes: KICK_SCOPES, meta: {} };
  });
}
