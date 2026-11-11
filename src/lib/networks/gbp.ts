// Server only: Google Business Profile (GBP) local posts.
// OAuth 2.0 (offline access, refresh token, PKCE) with scope business.manage, then:
//   accounts:  mybusinessaccountmanagement.googleapis.com/v1/accounts
//   locations: mybusinessbusinessinformation.googleapis.com/v1/{account}/locations?readMask=name,title,storefrontAddress
//   posts:     mybusiness.googleapis.com/v4/{account}/{location}/localPosts (v4: still the only localPosts API)
// Uses GBP_CLIENT_ID / GBP_CLIENT_SECRET when set, otherwise the Sign-in-with-Google client
// (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET) with the extra scope and redirect URI added to it.
import { BRAND } from "@/lib/brand";
import {
  NetworkAuthError,
  guessMime,
  obj,
  pkceS256,
  readBody,
  redact,
  str,
  tokenSetFrom,
  type Fetch,
  type PublishInput,
  type PublishOutcome,
  type TokenSet,
} from "@/lib/networks/common";
import { gbpOptionsError, parseGbpOptions, type GbpOptions } from "@/lib/networks/options";

export { GBP_SUMMARY_MAX, parseGbpOptions, gbpOptionsError, type GbpOptions } from "@/lib/networks/options";

export const GBP_SCOPE = "https://www.googleapis.com/auth/business.manage";
const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const ACCOUNTS_API = "https://mybusinessaccountmanagement.googleapis.com/v1";
const INFO_API = "https://mybusinessbusinessinformation.googleapis.com/v1";
const POSTS_API = "https://mybusiness.googleapis.com/v4";

export function gbpConfig() {
  const own = Boolean(process.env.GBP_CLIENT_ID && process.env.GBP_CLIENT_SECRET);
  return {
    clientId: (own ? process.env.GBP_CLIENT_ID : process.env.GOOGLE_CLIENT_ID) ?? "",
    clientSecret: (own ? process.env.GBP_CLIENT_SECRET : process.env.GOOGLE_CLIENT_SECRET) ?? "",
    redirectUri: `${BRAND.url}/api/gbp/callback`,
  };
}

/**
 * GBP posting needs Google's separate API approval, so it is switched on explicitly: either its own
 * client (GBP_CLIENT_ID/SECRET) or GBP_ENABLED=1 to reuse the Sign-in-with-Google client.
 */
export function isGbpConfigured(): boolean {
  const c = gbpConfig();
  const switchedOn = Boolean(process.env.GBP_CLIENT_ID) || process.env.GBP_ENABLED === "1";
  return switchedOn && c.clientId !== "" && c.clientSecret !== "";
}

export function gbpAuthorizeUrl(state: string, verifier: string): string {
  const c = gbpConfig();
  const params = new URLSearchParams({
    client_id: c.clientId,
    redirect_uri: c.redirectUri,
    response_type: "code",
    scope: GBP_SCOPE,
    state,
    code_challenge: pkceS256(verifier),
    code_challenge_method: "S256",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

async function tokenRequest(body: Record<string, string>, fetchImpl: Fetch): Promise<TokenSet> {
  const c = gbpConfig();
  let res: Response;
  try {
    res = await fetchImpl(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ client_id: c.clientId, client_secret: c.clientSecret, ...body }).toString(),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    throw new NetworkAuthError("exchange_failed", `Google token request failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  const json = obj(await readBody(res));
  if (!res.ok) {
    throw new NetworkAuthError(
      "exchange_failed",
      redact(`Google token request failed (${res.status}) ${str(json.error)}`, c.clientSecret, body.code, body.refresh_token, body.code_verifier),
      str(json.error) === "invalid_grant",
    );
  }
  return tokenSetFrom(json, "Google");
}

export function exchangeGbpCode(code: string, verifier: string, fetchImpl: Fetch = fetch): Promise<TokenSet> {
  return tokenRequest({ grant_type: "authorization_code", code, redirect_uri: gbpConfig().redirectUri, code_verifier: verifier }, fetchImpl);
}

/** Google refresh tokens do not rotate: the stored one is kept (no refresh_token in the answer). */
export function refreshGbpToken(refreshToken: string, fetchImpl: Fetch = fetch): Promise<TokenSet> {
  return tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken }, fetchImpl);
}

export const GBP_WAITING_MESSAGE =
  "Google Business Profile posting is waiting for Google's approval. Poskoo's Google Business Profile API access has not been granted yet; posts will work once Google approves it.";

/** 403 "API not enabled / has not been used" and 429 with a quota of 0 = Google has not approved API access yet. */
export function isGbpApprovalPending(status: number, body: unknown): boolean {
  const text = typeof body === "string" ? body : JSON.stringify(body ?? "");
  if (status === 403 && /SERVICE_DISABLED|has not been used in project|is disabled|API has not been enabled|accessNotConfigured/i.test(text)) return true;
  if (status === 429 && /quota|RATE_LIMIT_EXCEEDED|RESOURCE_EXHAUSTED/i.test(text) && /limit\W+'?0'?\b|quota_limit_value"?\s*:\s*"?0\b|per minute.*\b0\b/i.test(text)) return true;
  return false;
}

function googleMessage(body: unknown): string {
  const err = obj(obj(body).error);
  return str(err.message) || (typeof body === "string" ? body.slice(0, 200) : "");
}

async function getJson(url: string, token: string, fetchImpl: Fetch): Promise<{ ok: true; json: Record<string, unknown> } | { ok: false; status: number; body: unknown }> {
  let res: Response;
  try {
    res = await fetchImpl(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store", signal: AbortSignal.timeout(20_000) });
  } catch (err) {
    return { ok: false, status: 0, body: err instanceof Error ? err.message : String(err) };
  }
  const body = await readBody(res);
  if (!res.ok) return { ok: false, status: res.status, body };
  return { ok: true, json: obj(body) };
}

export type GbpLocation = { account: string; accountName: string; location: string; title: string; address: string };

function formatAddress(a: unknown): string {
  const addr = obj(a);
  const lines = Array.isArray(addr.addressLines) ? addr.addressLines.filter((l): l is string => typeof l === "string") : [];
  return [...lines, str(addr.locality), str(addr.administrativeArea)].filter(Boolean).join(", ");
}

/**
 * Every location the user can manage (all accounts, max 10 pages each). Throws NetworkAuthError
 * "gbp_pending" while Google has not approved API access, "no_locations" when there are none.
 */
export async function listGbpLocations(token: string, fetchImpl: Fetch = fetch): Promise<GbpLocation[]> {
  const fail = (status: number, body: unknown): never => {
    if (isGbpApprovalPending(status, body)) throw new NetworkAuthError("gbp_pending", GBP_WAITING_MESSAGE);
    throw new NetworkAuthError("error", redact(`Google Business Profile request failed (${status}): ${googleMessage(body)}`, token), status === 401);
  };
  const accounts: { name: string; label: string }[] = [];
  let page = "";
  for (let i = 0; i < 10; i += 1) {
    const r = await getJson(`${ACCOUNTS_API}/accounts?pageSize=20${page ? `&pageToken=${encodeURIComponent(page)}` : ""}`, token, fetchImpl);
    if (!r.ok) return fail(r.status, r.body);
    for (const a of Array.isArray(r.json.accounts) ? r.json.accounts : []) {
      const acc = obj(a);
      if (str(acc.name).startsWith("accounts/")) accounts.push({ name: str(acc.name), label: str(acc.accountName) });
    }
    page = str(r.json.nextPageToken);
    if (!page) break;
  }
  const out: GbpLocation[] = [];
  for (const acc of accounts) {
    let lp = "";
    for (let i = 0; i < 10; i += 1) {
      const r = await getJson(
        `${INFO_API}/${acc.name}/locations?readMask=name,title,storefrontAddress&pageSize=100${lp ? `&pageToken=${encodeURIComponent(lp)}` : ""}`,
        token,
        fetchImpl,
      );
      if (!r.ok) return fail(r.status, r.body);
      for (const l of Array.isArray(r.json.locations) ? r.json.locations : []) {
        const loc = obj(l);
        if (!str(loc.name).startsWith("locations/")) continue;
        out.push({ account: acc.name, accountName: acc.label, location: str(loc.name), title: str(loc.title) || str(loc.name), address: formatAddress(loc.storefrontAddress) });
      }
      lp = str(r.json.nextPageToken);
      if (!lp) break;
    }
  }
  if (out.length === 0) throw new NetworkAuthError("no_locations", "No Google Business Profile locations were found for this Google account.");
  return out;
}

function dateParts(d: string) {
  const [year, month, day] = d.split("-").map(Number);
  return { year, month, day };
}

function timeParts(t: string) {
  const [hours, minutes] = t.split(":").map(Number);
  return { hours, minutes, seconds: 0, nanos: 0 };
}

/** The localPosts.create body. */
export function buildGbpPost(opts: GbpOptions, summary: string, photoUrl: string | null): Record<string, unknown> {
  const body: Record<string, unknown> = { languageCode: "en", summary, topicType: opts.type };
  if (opts.type !== "STANDARD") {
    body.event = {
      title: opts.title,
      schedule: {
        startDate: dateParts(opts.startDate),
        endDate: dateParts(opts.endDate),
        ...(opts.type === "EVENT" && opts.startTime ? { startTime: timeParts(opts.startTime) } : {}),
        ...(opts.type === "EVENT" && opts.endTime ? { endTime: timeParts(opts.endTime) } : {}),
      },
    };
  }
  if (opts.type === "OFFER") {
    const offer: Record<string, string> = {};
    if (opts.couponCode) offer.couponCode = opts.couponCode;
    if (opts.redeemUrl) offer.redeemOnlineUrl = opts.redeemUrl;
    if (opts.terms) offer.termsConditions = opts.terms;
    body.offer = offer;
  } else if (opts.cta) {
    // Offers get Google's own "View offer" button; updates and events can carry a call to action.
    body.callToAction = opts.cta === "CALL" ? { actionType: "CALL" } : { actionType: opts.cta, url: opts.ctaUrl };
  }
  if (photoUrl) body.media = [{ mediaFormat: "PHOTO", sourceUrl: photoUrl }];
  return body;
}

/** Google wants a public JPG/PNG of 10 KB-5 MB (and at least 250x250, checked by Google). */
async function photoProblem(url: string, fetchImpl: Fetch): Promise<string | null> {
  const mime = guessMime(url);
  if (mime !== "image/jpeg" && mime !== "image/png") return "Google Business Profile photos must be JPG or PNG.";
  try {
    const res = await fetchImpl(url, { method: "HEAD", cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (!res.ok) return `Google could not fetch the photo (HTTP ${res.status}).`;
    const size = Number(res.headers.get("content-length") ?? "0");
    if (size > 0 && size < 10 * 1024) return "Google Business Profile photos must be at least 10 KB.";
    if (size > 5 * 1024 * 1024) return "Google Business Profile photos must be 5 MB or smaller.";
  } catch {
    // Google fetches it itself; a failed HEAD here is not fatal.
  }
  return null;
}

/** accounts/{a}/locations/{l}/localPosts with summary (max 1,500), one photo and the post type. */
export async function publishToGbp(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  const account = str(input.account.meta.account);
  const location = input.account.externalId;
  if (!account.startsWith("accounts/") || !location.startsWith("locations/")) {
    return { ok: false, error: "This Google Business Profile location is missing its account. Reconnect it.", tokenDead: true };
  }
  const opts = parseGbpOptions(input.options);
  const invalid = gbpOptionsError(opts, input.media);
  if (invalid) return { ok: false, error: invalid };
  const summary = Array.from(input.text.trim()).slice(0, 1500).join("");
  const photo = input.media.find((m) => m.type === "image")?.url ?? null;
  if (photo) {
    const problem = await photoProblem(photo, fetchImpl);
    if (problem) return { ok: false, error: problem };
  }
  let res: Response;
  try {
    res = await fetchImpl(`${POSTS_API}/${account}/${location}/localPosts`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(buildGbpPost(opts, summary, photo)),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    return { ok: false, error: `Could not reach Google: ${err instanceof Error ? err.message : String(err)}` };
  }
  const body = await readBody(res);
  if (!res.ok) {
    if (isGbpApprovalPending(res.status, body)) return { ok: false, error: GBP_WAITING_MESSAGE };
    return {
      ok: false,
      error: redact(`Google Business Profile post failed (${res.status}): ${googleMessage(body) || "no message"}`, token),
      tokenDead: res.status === 401,
    };
  }
  const json = obj(body);
  const name = str(json.name);
  return { ok: true, id: name || "localPost", url: str(json.searchUrl) || undefined };
}
