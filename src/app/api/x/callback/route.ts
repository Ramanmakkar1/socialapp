import { NetworkAuthError } from "@/lib/networks/common";
import { finishOAuth } from "@/lib/networks/routes";
import { X_SCOPES, exchangeXCode, fetchXProfile } from "@/lib/networks/x";

export async function GET(request: Request) {
  return finishOAuth(request, "x", async (code, flow) => {
    if (!flow.verifier) throw new NetworkAuthError("state_error", "missing PKCE verifier");
    const tokens = await exchangeXCode(code, flow.verifier);
    const profile = await fetchXProfile(tokens.accessToken);
    return {
      externalId: profile.id,
      username: profile.username || null,
      tokens,
      scopes: X_SCOPES,
      meta: { name: profile.name, avatarUrl: profile.avatar },
    };
  });
}
