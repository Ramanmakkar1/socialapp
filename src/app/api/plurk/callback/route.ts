import { NetworkAuthError } from "@/lib/networks/common";
import { exchangePlurkVerifier, plurkProfile } from "@/lib/networks/apps";
import { finishOAuth } from "@/lib/networks/routes";

// Plurk returns ?oauth_token&oauth_verifier (plus the state we put in the callback URL).
export async function GET(request: Request) {
  return finishOAuth(
    request,
    "plurk",
    async (verifier, flow) => {
      const requestToken = flow.extra?.requestToken ?? "";
      const requestSecret = flow.extra?.requestSecret ?? "";
      if (!requestToken || new URL(request.url).searchParams.get("oauth_token") !== requestToken) {
        throw new NetworkAuthError("state_error", "request token mismatch");
      }
      const access = await exchangePlurkVerifier(requestToken, requestSecret, verifier);
      const me = await plurkProfile(access.token, access.secret);
      return {
        externalId: me.id,
        username: me.nick || null,
        tokens: { accessToken: access.token },
        scopes: ["plurk_oauth1"],
        meta: {},
        secret: { tokenSecret: access.secret },
      };
    },
    undefined,
    "oauth_verifier",
  );
}
