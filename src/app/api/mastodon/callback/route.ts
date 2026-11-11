import { NetworkAuthError } from "@/lib/networks/common";
import { exchangeMastodonCode, fetchInstanceLimits, MASTODON_SCOPES, verifyMastodonCredentials } from "@/lib/networks/mastodon";
import { getMastodonApp } from "@/lib/networks/mastodonApps";
import { finishOAuth } from "@/lib/networks/routes";

export async function GET(request: Request) {
  return finishOAuth(request, "mastodon", async (code, flow) => {
    const instance = flow.extra?.instance ?? "";
    const app = instance ? await getMastodonApp(instance) : null;
    if (!instance || !app) throw new NetworkAuthError("state_error", "unknown Mastodon server");
    const tokens = await exchangeMastodonCode(instance, app, code, flow.verifier ?? "");
    const profile = await verifyMastodonCredentials(instance, tokens.accessToken);
    const limits = await fetchInstanceLimits(instance);
    return {
      // Account ids are only unique per server.
      externalId: `${instance}:${profile.id}`,
      username: `${profile.username}@${instance}`,
      tokens,
      scopes: MASTODON_SCOPES.split(" "),
      meta: { instance, profileUrl: profile.url, avatarUrl: profile.avatar, maxChars: limits.maxChars, maxMedia: limits.maxMedia },
    };
  });
}
