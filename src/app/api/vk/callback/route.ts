import { NetworkAuthError } from "@/lib/networks/common";
import { VK_SCOPES, exchangeVkCode, vkUser } from "@/lib/networks/moreApps";
import { finishOAuth } from "@/lib/networks/routes";

// VK ID sends code, state and device_id; device_id is needed again for every token refresh.
export async function GET(request: Request) {
  const deviceId = new URL(request.url).searchParams.get("device_id") ?? "";
  return finishOAuth(request, "vk", async (code, flow) => {
    if (!flow.verifier || !deviceId) throw new NetworkAuthError("state_error", "missing PKCE verifier or device_id");
    const tokens = await exchangeVkCode(code, flow.verifier, deviceId, flow.state);
    const user = await vkUser(tokens.accessToken);
    const { userId: _userId, ...tokenSet } = tokens;
    void _userId;
    return { externalId: user.id, username: user.name, tokens: tokenSet, scopes: VK_SCOPES, meta: { deviceId } };
  });
}
