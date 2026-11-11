// Server only: Pinterest API v5. OAuth (boards:read pins:write user_accounts:read), board list for
// the composer, and pin creation from an image URL with title + description + link.
// Trial-access apps can only create pins in the sandbox: set PINTEREST_SANDBOX=1 until Pinterest
// grants Standard access.
import { BRAND } from "@/lib/brand";
import {
  NetworkAuthError,
  obj,
  readBody,
  redact,
  str,
  tokenSetFrom,
  type Fetch,
  type PublishInput,
  type PublishOutcome,
  type TokenSet,
} from "@/lib/networks/common";
import { PINTEREST_DESCRIPTION_MAX, PINTEREST_TITLE_MAX, parsePinterestOptions, pinterestOptionsError } from "@/lib/networks/options";

export { PINTEREST_DESCRIPTION_MAX, PINTEREST_TITLE_MAX, parsePinterestOptions, pinterestOptionsError, type PinterestOptions } from "@/lib/networks/options";

export const PINTEREST_SCOPES = ["boards:read", "pins:write", "user_accounts:read"];
export function pinterestConfig() {
  return {
    appId: process.env.PINTEREST_APP_ID ?? "",
    appSecret: process.env.PINTEREST_APP_SECRET ?? "",
    redirectUri: `${BRAND.url}/api/pinterest/callback`,
    api: process.env.PINTEREST_SANDBOX === "1" ? "https://api-sandbox.pinterest.com/v5" : "https://api.pinterest.com/v5",
  };
}

export function isPinterestConfigured(): boolean {
  const c = pinterestConfig();
  return c.appId !== "" && c.appSecret !== "";
}

export function pinterestAuthorizeUrl(state: string): string {
  const c = pinterestConfig();
  const params = new URLSearchParams({
    client_id: c.appId,
    redirect_uri: c.redirectUri,
    response_type: "code",
    scope: PINTEREST_SCOPES.join(","),
    state,
  });
  return `https://www.pinterest.com/oauth/?${params.toString()}`;
}

async function tokenRequest(body: Record<string, string>, fetchImpl: Fetch): Promise<TokenSet> {
  const c = pinterestConfig();
  let res: Response;
  try {
    // Token calls always go to the production host (the sandbox only hosts pins/boards).
    res = await fetchImpl("https://api.pinterest.com/v5/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${c.appId}:${c.appSecret}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(body).toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    throw new NetworkAuthError("exchange_failed", `Pinterest token request failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  const json = obj(await readBody(res));
  if (!res.ok) {
    throw new NetworkAuthError(
      "exchange_failed",
      redact(`Pinterest token request failed (${res.status}) ${str(json.message)}`, c.appSecret, body.code, body.refresh_token),
      res.status === 400 || res.status === 401,
    );
  }
  return tokenSetFrom(json, "Pinterest");
}

export function exchangePinterestCode(code: string, fetchImpl: Fetch = fetch): Promise<TokenSet> {
  return tokenRequest({ grant_type: "authorization_code", code, redirect_uri: pinterestConfig().redirectUri, continuous_refresh: "true" }, fetchImpl);
}

/** Continuous refresh: every refresh returns a new refresh token valid for another 60 days. */
export function refreshPinterestToken(refreshToken: string, fetchImpl: Fetch = fetch): Promise<TokenSet> {
  return tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken, continuous_refresh: "true" }, fetchImpl);
}

async function get(path: string, token: string, fetchImpl: Fetch): Promise<{ ok: true; json: Record<string, unknown> } | { ok: false; status: number; message: string }> {
  let res: Response;
  try {
    res = await fetchImpl(`${pinterestConfig().api}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    return { ok: false, status: 0, message: err instanceof Error ? err.message : String(err) };
  }
  const json = obj(await readBody(res));
  if (!res.ok) return { ok: false, status: res.status, message: redact(str(json.message) || `HTTP ${res.status}`, token) };
  return { ok: true, json };
}

export type PinterestProfile = { id: string; username: string; avatar: string | null };

export async function fetchPinterestProfile(token: string, fetchImpl: Fetch = fetch): Promise<PinterestProfile> {
  const r = await get("/user_account", token, fetchImpl);
  if (!r.ok) throw new NetworkAuthError("profile_failed", `Pinterest profile request failed: ${r.message}`);
  const username = str(r.json.username);
  return { id: str(r.json.id) || username, username, avatar: str(r.json.profile_image) || null };
}

export type PinterestBoard = { id: string; name: string; privacy: string };

/** All boards the user can pin to (follows the bookmark, max 10 pages of 100). */
export async function listPinterestBoards(token: string, fetchImpl: Fetch = fetch): Promise<{ ok: true; boards: PinterestBoard[] } | { ok: false; error: string; tokenDead?: boolean }> {
  const boards: PinterestBoard[] = [];
  let bookmark = "";
  for (let page = 0; page < 10; page += 1) {
    const r = await get(`/boards?page_size=100${bookmark ? `&bookmark=${encodeURIComponent(bookmark)}` : ""}`, token, fetchImpl);
    if (!r.ok) return { ok: false, error: `Could not load your Pinterest boards: ${r.message}`, tokenDead: r.status === 401 };
    const items = Array.isArray(r.json.items) ? r.json.items : [];
    for (const it of items) {
      const b = obj(it);
      if (str(b.id)) boards.push({ id: str(b.id), name: str(b.name) || "Untitled board", privacy: str(b.privacy) });
    }
    bookmark = str(r.json.bookmark);
    if (!bookmark) break;
  }
  return { ok: true, boards };
}

/** POST /pins: one image (image_url) or several (multiple_image_urls = carousel pin, 2-5 images). */
export async function publishToPinterest(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  const opts = parsePinterestOptions(input.options);
  const images = input.media.filter((m) => m.type === "image").map((m) => m.url);
  const invalid = pinterestOptionsError(opts, images.length, input.media.some((m) => m.type === "video"));
  if (invalid) return { ok: false, error: invalid };
  const description = Array.from(input.text.trim()).slice(0, PINTEREST_DESCRIPTION_MAX).join("");
  const title = Array.from(opts.title).slice(0, PINTEREST_TITLE_MAX).join("");
  const mediaSource =
    images.length === 1
      ? { source_type: "image_url", url: images[0] }
      : { source_type: "multiple_image_urls", items: images.slice(0, 5).map((url) => ({ url, title, description, ...(opts.link ? { link: opts.link } : {}) })) };
  let res: Response;
  try {
    res = await fetchImpl(`${pinterestConfig().api}/pins`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        board_id: opts.boardId,
        ...(title ? { title } : {}),
        description,
        ...(opts.link ? { link: opts.link } : {}),
        media_source: mediaSource,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
  } catch (err) {
    return { ok: false, error: `Could not reach Pinterest: ${err instanceof Error ? err.message : String(err)}` };
  }
  const json = obj(await readBody(res));
  if (!res.ok) {
    const msg = str(json.message) || `HTTP ${res.status}`;
    const trial = /trial|sandbox|standard access/i.test(msg);
    return {
      ok: false,
      error: redact(
        trial
          ? `Pinterest refused the pin: the Poskoo Pinterest app has Trial access only, so pins can only be created in Pinterest's sandbox until Standard access is approved. (${msg})`
          : `Pinterest pin failed: ${msg}`,
        token,
      ),
      tokenDead: res.status === 401,
    };
  }
  const id = str(json.id);
  return { ok: true, id: id || "pin", url: id ? `https://www.pinterest.com/pin/${id}/` : undefined };
}
