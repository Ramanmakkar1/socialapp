import { BRAND } from "@/lib/brand";

// Official Threads API OAuth ("Threads Login"). Secrets only from env vars; tokens are never
// logged, and thrown error messages redact the access token and the app secret.
export const THREADS_SCOPES = ["threads_basic", "threads_content_publish"];

export function threadsConfig() {
  return {
    appId: process.env.THREADS_APP_ID ?? "",
    appSecret: process.env.THREADS_APP_SECRET ?? "",
    redirectUri: process.env.THREADS_REDIRECT_URI || `${BRAND.url}/api/threads/callback`,
  };
}

export function isThreadsConfigured(): boolean {
  const { appId, appSecret } = threadsConfig();
  return Boolean(appId && appSecret);
}

export function threadsAuthorizeUrl(state: string): string {
  const { appId, redirectUri } = threadsConfig();
  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: THREADS_SCOPES.join(","),
    state,
  });
  return `https://threads.net/oauth/authorize?${params.toString()}`;
}

/** Replace the access token and the app secret in a message with '[redacted]' before it is thrown. */
function redact(message: string, token: string, secret: string): string {
  let safe = message;
  for (const value of [token, secret]) {
    if (value) safe = safe.split(value).join("[redacted]");
  }
  return safe;
}

/** Read the Graph error message from a failed response ("" when the body is not JSON). */
async function graphErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { error?: { message?: unknown } };
    if (data && typeof data === "object" && data.error && typeof data.error.message === "string") {
      return data.error.message;
    }
  } catch {
    // non-JSON body
  }
  return "";
}

export async function exchangeThreadsCode(
  code: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ access_token: string; user_id: string }> {
  const { appId, appSecret, redirectUri } = threadsConfig();
  const body = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });
  const res = await fetchImpl("https://graph.threads.net/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await graphErrorMessage(res);
    throw new Error(
      redact(`Threads code exchange failed (${res.status})${detail ? `: ${detail}` : ""}`, "", appSecret)
    );
  }
  const json = (await res.json()) as { access_token?: string; user_id?: string | number };
  if (!json.access_token) throw new Error("Threads code exchange returned no token");
  return { access_token: json.access_token, user_id: String(json.user_id ?? "") };
}

export async function threadsLongLivedToken(
  short: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ access_token: string; expires_in: number }> {
  const { appSecret } = threadsConfig();
  const params = new URLSearchParams({
    grant_type: "th_exchange_token",
    client_secret: appSecret,
    access_token: short,
  });
  const res = await fetchImpl(`https://graph.threads.net/access_token?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await graphErrorMessage(res);
    throw new Error(
      redact(`Threads long-lived token failed (${res.status})${detail ? `: ${detail}` : ""}`, short, appSecret)
    );
  }
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) throw new Error("Threads long-lived token missing");
  return { access_token: json.access_token, expires_in: Number(json.expires_in ?? 0) };
}

export async function refreshThreadsToken(
  token: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ access_token: string; expires_in: number }> {
  const params = new URLSearchParams({
    grant_type: "th_refresh_token",
    access_token: token,
  });
  const res = await fetchImpl(`https://graph.threads.net/refresh_access_token?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await graphErrorMessage(res);
    throw new Error(
      redact(`Threads token refresh failed (${res.status})${detail ? `: ${detail}` : ""}`, token, "")
    );
  }
  const json = (await res.json()) as { access_token?: string; expires_in?: number };
  if (!json.access_token) throw new Error("Threads token refresh missing access_token");
  return { access_token: json.access_token, expires_in: Number(json.expires_in ?? 0) };
}

export async function fetchThreadsProfile(
  token: string,
  fetchImpl: typeof fetch = fetch
): Promise<{ user_id: string; username: string }> {
  const params = new URLSearchParams({ fields: "id,username", access_token: token });
  const res = await fetchImpl(`https://graph.threads.net/v1.0/me?${params.toString()}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await graphErrorMessage(res);
    throw new Error(
      redact(`Threads profile fetch failed (${res.status})${detail ? `: ${detail}` : ""}`, token, "")
    );
  }
  const json = (await res.json()) as { id?: string | number; username?: string };
  return { user_id: String(json.id ?? ""), username: json.username ?? "" };
}
