// Server only: one entry per new network: is it set up on this server, how to publish, how to refresh.
import { NetworkAuthError, NETWORK_IDS, str, type Fetch, type NetAccount, type NetworkId, type PublishInput, type PublishOutcome, type TokenSet } from "@/lib/networks/common";
import { BLUESKY_DEFAULT_SERVICE, createBlueskySession, jwtExpiresIn, publishToBluesky, refreshBlueskySession } from "@/lib/networks/bluesky";
import { isLinkedInConfigured, publishToLinkedIn, refreshLinkedInToken } from "@/lib/networks/linkedin";
import { publishToMastodon } from "@/lib/networks/mastodon";
import { isPinterestConfigured, publishToPinterest, refreshPinterestToken } from "@/lib/networks/pinterest";
import { isTikTokConfigured, publishToTikTok, refreshTikTokToken } from "@/lib/networks/tiktok";
import { isXConfigured, publishToX, refreshXToken } from "@/lib/networks/x";
import { isGbpConfigured, publishToGbp, refreshGbpToken } from "@/lib/networks/gbp";

export type NetworkAdapter = {
  configured: () => boolean;
  publish: (input: PublishInput) => Promise<PublishOutcome>;
  /** New tokens for this account; throws NetworkAuthError(tokenDead) when the user must reconnect. */
  refresh?: (account: NetAccount, fetchImpl?: Fetch) => Promise<TokenSet>;
  /** Refresh before publishing when the access token expires within this many seconds. */
  refreshSkewSec: number;
};

async function refreshBluesky(account: NetAccount, fetchImpl: Fetch = fetch): Promise<TokenSet> {
  const service = str(account.meta.service) || BLUESKY_DEFAULT_SERVICE;
  try {
    if (!account.refreshToken) throw new NetworkAuthError("refresh_failed", "no refresh JWT", true);
    return await refreshBlueskySession(service, account.refreshToken, fetchImpl);
  } catch (err) {
    // An expired refresh JWT: log in again with the stored app password (revoked password = reconnect).
    const password = account.secret.appPassword;
    if (!(err instanceof NetworkAuthError && err.tokenDead) || !password) throw err;
    const session = await createBlueskySession(account.externalId, password, service, fetchImpl);
    return { accessToken: session.accessJwt, refreshToken: session.refreshJwt, expiresIn: jwtExpiresIn(session.accessJwt) };
  }
}

function needsRefreshToken(fn: (rt: string, f?: Fetch) => Promise<TokenSet>, label: string) {
  return (account: NetAccount, fetchImpl?: Fetch) => {
    if (!account.refreshToken) {
      throw new NetworkAuthError("refresh_failed", `${label} access expired and there is no refresh token. Reconnect ${label} in Settings.`, true);
    }
    return fn(account.refreshToken, fetchImpl);
  };
}

export const NETWORKS: Record<NetworkId, NetworkAdapter> = {
  tiktok: { configured: isTikTokConfigured, publish: publishToTikTok, refresh: needsRefreshToken(refreshTikTokToken, "TikTok"), refreshSkewSec: 15 * 60 },
  bluesky: { configured: () => true, publish: publishToBluesky, refresh: refreshBluesky, refreshSkewSec: 10 * 60 },
  mastodon: { configured: () => true, publish: publishToMastodon, refreshSkewSec: 0 },
  linkedin: { configured: isLinkedInConfigured, publish: publishToLinkedIn, refresh: needsRefreshToken(refreshLinkedInToken, "LinkedIn"), refreshSkewSec: 60 * 60 },
  pinterest: { configured: isPinterestConfigured, publish: publishToPinterest, refresh: needsRefreshToken(refreshPinterestToken, "Pinterest"), refreshSkewSec: 60 * 60 },
  x: { configured: isXConfigured, publish: publishToX, refresh: needsRefreshToken(refreshXToken, "X"), refreshSkewSec: 10 * 60 },
  gbp: { configured: isGbpConfigured, publish: publishToGbp, refresh: needsRefreshToken(refreshGbpToken, "Google Business Profile"), refreshSkewSec: 5 * 60 },
};

/** Which new networks can be connected on this server (Bluesky / Mastodon need no keys). */
export function networkAvailability(): Record<NetworkId, boolean> {
  const out = {} as Record<NetworkId, boolean>;
  for (const id of NETWORK_IDS) out[id] = NETWORKS[id].configured();
  return out;
}

/** Where the "Connect" button for a network points (Bluesky / Mastodon use the inline forms in the dialog). */
export function connectHref(platform: string): string {
  switch (platform) {
    case "threads":
      return "/api/threads/connect";
    case "youtube":
      return "/api/youtube/connect";
    case "tiktok":
    case "linkedin":
    case "pinterest":
    case "x":
    case "gbp":
      return `/api/${platform}/connect`;
    case "bluesky":
    case "mastodon":
      return `/app/settings?connect=${platform}#connect`;
    default:
      return "/api/instagram/connect";
  }
}
