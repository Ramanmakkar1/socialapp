import { BRAND } from "@/lib/brand";

// Official "Instagram API with Instagram Login". Secrets only from env vars; never log tokens.
export const IG_SCOPES = [
  "instagram_business_basic",
  "instagram_business_manage_messages",
  "instagram_business_manage_comments",
  "instagram_business_content_publish",
  "instagram_business_manage_insights",
];

export function igConfig() {
  return {
    appId: process.env.INSTAGRAM_APP_ID ?? "",
    appSecret: process.env.INSTAGRAM_APP_SECRET ?? "",
    redirectUri: `${BRAND.url}/api/instagram/callback`,
  };
}

export function isIgConfigured(): boolean {
  const { appId, appSecret } = igConfig();
  return Boolean(appId && appSecret);
}

export function authorizeUrl(state: string): string {
  const { appId, redirectUri } = igConfig();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: IG_SCOPES.join(","),
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${params.toString()}`;
}

export async function exchangeCode(code: string): Promise<{ access_token: string; user_id: string }> {
  const { appId, appSecret, redirectUri } = igConfig();
  const body = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });
  const res = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Instagram code exchange failed (${res.status})`);
  const json = (await res.json()) as {
    access_token?: string;
    user_id?: string | number;
    data?: { access_token?: string; user_id?: string | number }[];
  };
  const row = json.data?.[0] ?? json;
  if (!row.access_token) throw new Error("Instagram code exchange returned no token");
  return { access_token: row.access_token, user_id: String(row.user_id ?? "") };
}

export async function longLivedToken(short: string): Promise<{ access_token: string; expires_in: number }> {
  const { appSecret } = igConfig();
  const params = new URLSearchParams({
    grant_type: "ig_exchange_token",
    client_secret: appSecret,
    access_token: short,
  });
  const res = await fetch(`https://graph.instagram.com/access_token?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Instagram long-lived token failed (${res.status})`);
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) throw new Error("Instagram long-lived token missing");
  return { access_token: json.access_token, expires_in: Number(json.expires_in ?? 0) };
}

export async function refreshLongLivedToken(token: string): Promise<{ access_token: string; expires_in: number }> {
  const params = new URLSearchParams({
    grant_type: "ig_refresh_token",
    access_token: token,
  });
  const res = await fetch(`https://graph.instagram.com/refresh_access_token?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Instagram token refresh failed (${res.status})`);
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) throw new Error("Instagram token refresh missing access_token");
  return { access_token: json.access_token, expires_in: Number(json.expires_in ?? 0) };
}

export async function fetchProfile(token: string): Promise<{ user_id: string; username: string }> {
  const params = new URLSearchParams({ fields: "user_id,username", access_token: token });
  const res = await fetch(`https://graph.instagram.com/me?${params.toString()}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Instagram profile fetch failed (${res.status})`);
  const json = (await res.json()) as { user_id?: string | number; id?: string | number; username?: string };
  return { user_id: String(json.user_id ?? json.id ?? ""), username: json.username ?? "" };
}
