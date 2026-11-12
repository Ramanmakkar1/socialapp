// Server only: LinkedIn. "Sign In with LinkedIn using OpenID Connect" (openid profile email) +
// "Share on LinkedIn" (w_member_social): posts to the member's own profile through the versioned
// Posts API (rest/posts) with text and images (Images API upload).
// Company pages need the Community Management API (w_organization_social, r_organization_social),
// which LinkedIn grants only after a separate review: built behind LINKEDIN_PAGES_ENABLED=1
// (LINKEDIN_COMPANY_PAGES=1 still works). Off by default.
import { BRAND } from "@/lib/brand";
import {
  NetworkAuthError,
  downloadMedia,
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

const AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization";
const TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken";
const API = "https://api.linkedin.com";

export function linkedinConfig() {
  return {
    clientId: process.env.LINKEDIN_CLIENT_ID ?? "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
    redirectUri: `${BRAND.url}/api/linkedin/callback`,
    /** YYYYMM. LinkedIn supports each version for at least a year; override when it is sunset. */
    apiVersion: process.env.LINKEDIN_API_VERSION || "202605",
    companyPages: linkedinPagesFlag(process.env),
  };
}

/** LINKEDIN_PAGES_ENABLED=1/true (or the older LINKEDIN_COMPANY_PAGES=1) turns company Pages on. */
export function linkedinPagesFlag(env: Record<string, string | undefined>): boolean {
  const v = (env.LINKEDIN_PAGES_ENABLED ?? "").trim().toLowerCase();
  return v === "1" || v === "true" || env.LINKEDIN_COMPANY_PAGES === "1";
}

export function isLinkedInConfigured(): boolean {
  const c = linkedinConfig();
  return c.clientId !== "" && c.clientSecret !== "";
}

export function linkedinScopes(): string[] {
  const base = ["openid", "profile", "email", "w_member_social"];
  return linkedinConfig().companyPages ? [...base, "w_organization_social", "r_organization_social"] : base;
}

export function linkedinAuthorizeUrl(state: string): string {
  const c = linkedinConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: c.clientId,
    redirect_uri: c.redirectUri,
    state,
    scope: linkedinScopes().join(" "),
  });
  return `${AUTH_URL}?${params.toString()}`;
}

async function tokenRequest(body: Record<string, string>, fetchImpl: Fetch): Promise<TokenSet> {
  const c = linkedinConfig();
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
    throw new NetworkAuthError("exchange_failed", `LinkedIn token request failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  const json = obj(await readBody(res));
  if (!res.ok) {
    throw new NetworkAuthError(
      "exchange_failed",
      redact(`LinkedIn token request failed (${res.status}) ${str(json.error)} ${str(json.error_description)}`, c.clientSecret, body.code, body.refresh_token),
      str(json.error) === "invalid_grant",
    );
  }
  return tokenSetFrom(json, "LinkedIn");
}

export function exchangeLinkedInCode(code: string, fetchImpl: Fetch = fetch): Promise<TokenSet> {
  return tokenRequest({ grant_type: "authorization_code", code, redirect_uri: linkedinConfig().redirectUri }, fetchImpl);
}

/** Programmatic refresh tokens exist only for apps LinkedIn enabled them for; otherwise members reconnect every 60 days. */
export function refreshLinkedInToken(refreshToken: string, fetchImpl: Fetch = fetch): Promise<TokenSet> {
  return tokenRequest({ grant_type: "refresh_token", refresh_token: refreshToken }, fetchImpl);
}

export type LinkedInProfile = { sub: string; name: string; email: string; picture: string | null };

export async function fetchLinkedInProfile(token: string, fetchImpl: Fetch = fetch): Promise<LinkedInProfile> {
  const res = await fetchImpl(`${API}/v2/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const json = obj(await readBody(res));
  if (!res.ok || !str(json.sub)) throw new NetworkAuthError("profile_failed", `LinkedIn profile request failed (${res.status})`);
  return { sub: str(json.sub), name: str(json.name), email: str(json.email), picture: str(json.picture) || null };
}

export type LinkedInOrg = { urn: string; name: string };

/** Page roles that may post as the organization (organizationAcls role values). */
export const LINKEDIN_POSTING_ROLES = ["ADMINISTRATOR", "CONTENT_ADMINISTRATOR", "CONTENT_ADMIN"];

/** Organization URNs from an organizationAcls response where the member may post (approved admin / content admin). */
export function postableOrgUrns(elements: unknown): string[] {
  const out: string[] = [];
  for (const el of Array.isArray(elements) ? elements : []) {
    const o = obj(el);
    const urn = str(o.organization) || str(o.organizationTarget);
    if (!urn.startsWith("urn:li:organization:")) continue;
    if (o.state !== undefined && str(o.state) !== "APPROVED") continue;
    if (!LINKEDIN_POSTING_ROLES.includes(str(o.role))) continue;
    if (!out.includes(urn)) out.push(urn);
  }
  return out;
}

/** Organizations the member administers (Community Management API only). Empty on any error. */
export async function fetchLinkedInOrgs(token: string, fetchImpl: Fetch = fetch): Promise<LinkedInOrg[]> {
  const c = linkedinConfig();
  try {
    const res = await fetchImpl(`${API}/rest/organizationAcls?q=roleAssignee&state=APPROVED&count=100`, {
      headers: { Authorization: `Bearer ${token}`, "LinkedIn-Version": c.apiVersion, "X-Restli-Protocol-Version": "2.0.0" },
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) return [];
    const json = obj(await readBody(res));
    const orgs: LinkedInOrg[] = [];
    for (const urn of postableOrgUrns(json.elements).slice(0, 50)) {
      let name = urn.split(":").pop() ?? urn;
      const id = urn.split(":").pop();
      const orgRes = await fetchImpl(`${API}/rest/organizations/${id}`, {
        headers: { Authorization: `Bearer ${token}`, "LinkedIn-Version": c.apiVersion, "X-Restli-Protocol-Version": "2.0.0" },
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      }).catch(() => null);
      if (orgRes?.ok) name = str(obj(await readBody(orgRes)).localizedName) || name;
      orgs.push({ urn, name });
    }
    return orgs;
  } catch {
    return [];
  }
}

const RESERVED = /[\\|{}@[\]()<>#*_~]/g;

/**
 * Posts API "little text" commentary: reserved characters must be escaped, otherwise LinkedIn
 * rejects or truncates the post. Hashtags become {hashtag|\#|tag} so they stay clickable.
 */
export function toLittleText(text: string): string {
  const parts: string[] = [];
  let last = 0;
  for (const m of text.matchAll(/(^|\s)#([\p{L}\p{N}_]+)/gu)) {
    const start = (m.index ?? 0) + m[1].length;
    parts.push(text.slice(last, start).replace(RESERVED, (c) => `\\${c}`));
    parts.push(`{hashtag|\\#|${m[2].replace(RESERVED, (c) => `\\${c}`)}}`);
    last = start + 1 + m[2].length;
  }
  parts.push(text.slice(last).replace(RESERVED, (c) => `\\${c}`));
  return parts.join("");
}

function restHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "LinkedIn-Version": linkedinConfig().apiVersion,
    "X-Restli-Protocol-Version": "2.0.0",
    "Content-Type": "application/json",
  };
}

function liError(status: number, json: Record<string, unknown>, text: string): string {
  return `${status}${str(json.message) ? `: ${str(json.message)}` : text ? `: ${text.slice(0, 200)}` : ""}`;
}

/** Images API: initializeUpload, then PUT the bytes to the upload URL. Returns the image URN. */
async function uploadImage(token: string, owner: string, url: string, fetchImpl: Fetch): Promise<{ ok: true; urn: string } | { ok: false; error: string; tokenDead?: boolean }> {
  const file = await downloadMedia(url, fetchImpl, 36 * 1024 * 1024);
  if (!file.ok) return file;
  const init = await fetchImpl(`${API}/rest/images?action=initializeUpload`, {
    method: "POST",
    headers: restHeaders(token),
    body: JSON.stringify({ initializeUploadRequest: { owner } }),
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  const json = obj(await readBody(init));
  if (!init.ok) return { ok: false, error: redact(`LinkedIn image upload failed (${liError(init.status, json, "")})`, token), tokenDead: init.status === 401 };
  const value = obj(json.value);
  const uploadUrl = str(value.uploadUrl);
  const urn = str(value.image);
  if (!uploadUrl || !urn) return { ok: false, error: "LinkedIn returned no image upload URL" };
  const put = await fetchImpl(uploadUrl, {
    method: "PUT",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": file.contentType || "application/octet-stream" },
    body: new Uint8Array(file.bytes),
    signal: AbortSignal.timeout(5 * 60_000),
  });
  if (!put.ok) return { ok: false, error: `LinkedIn image upload failed (HTTP ${put.status})` };
  return { ok: true, urn };
}

/** Text + up to 20 images to the member profile (or an organization when company pages are on). */
export async function publishToLinkedIn(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  if (input.media.some((m) => m.type === "video")) {
    return { ok: false, error: "LinkedIn posts from Poskoo support text and images for now. Remove the video or untick LinkedIn." };
  }
  const images = input.media.filter((m) => m.type === "image");
  if (images.length > 20) return { ok: false, error: "LinkedIn takes up to 20 images per post." };
  const person = `urn:li:person:${input.account.externalId}`;
  const wanted = str(input.options.author);
  const orgs = Array.isArray(input.account.meta.orgs) ? (input.account.meta.orgs as { urn?: unknown }[]) : [];
  const author = wanted && linkedinConfig().companyPages && orgs.some((o) => o.urn === wanted) ? wanted : person;

  const urns: string[] = [];
  for (const img of images) {
    const up = await uploadImage(token, author, img.url, fetchImpl);
    if (!up.ok) return up;
    urns.push(up.urn);
  }
  const content =
    urns.length === 1
      ? { content: { media: { id: urns[0] } } }
      : urns.length > 1
        ? { content: { multiImage: { images: urns.map((id) => ({ id, altText: "" })) } } }
        : {};
  const body = {
    author,
    commentary: toLittleText(input.text.trim()),
    visibility: "PUBLIC",
    distribution: { feedDistribution: "MAIN_FEED", targetEntities: [], thirdPartyDistributionChannels: [] },
    ...content,
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };
  let res: Response;
  try {
    res = await fetchImpl(`${API}/rest/posts`, {
      method: "POST",
      headers: restHeaders(token),
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(30_000),
    });
  } catch (err) {
    return { ok: false, error: `Could not reach LinkedIn: ${err instanceof Error ? err.message : String(err)}` };
  }
  if (res.status !== 201 && !res.ok) {
    const text = await res.text().catch(() => "");
    let json: Record<string, unknown> = {};
    try {
      json = obj(JSON.parse(text));
    } catch {
      // keep text
    }
    const tokenDead = res.status === 401 || (res.status === 403 && /scope|permission|ACCESS_DENIED/i.test(text) && author === person);
    return { ok: false, error: redact(`LinkedIn post failed (${liError(res.status, json, text)})`, token), tokenDead };
  }
  const id = res.headers.get("x-restli-id") ?? res.headers.get("x-linkedin-id") ?? "";
  if (!id) return { ok: true, id: "linkedin-post" };
  return { ok: true, id, url: `https://www.linkedin.com/feed/update/${id}/` };
}
