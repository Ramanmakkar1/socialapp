// One place for the Meta Graph API version and the host each connected account uses.
// - facebook_login  (Facebook Login for Business, config_id): graph.facebook.com + the Page access token
// - instagram_login (older "Instagram API with Instagram Login" accounts): graph.instagram.com + the IG user token
export const GRAPH_VERSION = "v23.0";
export const FB_GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;
export const IG_GRAPH = `https://graph.instagram.com/${GRAPH_VERSION}`;

export type AuthType = "instagram_login" | "facebook_login";

export function isFacebookLogin(authType: string | null | undefined): boolean {
  return authType === "facebook_login";
}

/** Graph base URL for an account (old rows without auth_type keep the Instagram host). */
export function graphBaseFor(authType: string | null | undefined): string {
  return isFacebookLogin(authType) ? FB_GRAPH : IG_GRAPH;
}
