import assert from "node:assert/strict";
import { test } from "node:test";
import { bodyForm, bodyJson, bytes, json, mockFetch } from "../../test-utils/mockFetch.ts";
import type { NetAccount } from "./common.ts";
import { exchangeLinkedInCode, fetchLinkedInProfile, linkedinAuthorizeUrl, linkedinScopes, publishToLinkedIn, toLittleText } from "./linkedin.ts";

process.env.LINKEDIN_CLIENT_ID = "li_id";
process.env.LINKEDIN_CLIENT_SECRET = "li_secret_value";
delete process.env.LINKEDIN_COMPANY_PAGES;

const account: NetAccount = {
  id: "l1",
  platform: "linkedin",
  externalId: "abc123",
  username: "Raman M",
  accessToken: "li-token",
  refreshToken: "",
  tokenExpiresAt: null,
  meta: {},
  secret: {},
};

test("authorize URL: OpenID Connect + Share on LinkedIn scopes; company scopes only behind the flag", () => {
  const url = new URL(linkedinAuthorizeUrl("st"));
  assert.equal(url.origin + url.pathname, "https://www.linkedin.com/oauth/v2/authorization");
  assert.equal(url.searchParams.get("scope"), "openid profile email w_member_social");
  assert.equal(url.searchParams.get("redirect_uri"), "https://poskoo.com/api/linkedin/callback");
  process.env.LINKEDIN_COMPANY_PAGES = "1";
  assert.ok(linkedinScopes().includes("w_organization_social"));
  delete process.env.LINKEDIN_COMPANY_PAGES;
});

test("token exchange and userinfo", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /accessToken/, reply: () => json({ access_token: "tok", expires_in: 5184000 }) },
    { match: /userinfo/, reply: () => json({ sub: "abc123", name: "Raman M", email: "r@example.com", picture: "p.jpg" }) },
  ]);
  const t = await exchangeLinkedInCode("c1", fetchImpl);
  assert.equal(t.expiresIn, 5184000);
  assert.equal(bodyForm(calls[0]).get("client_secret"), "li_secret_value");
  assert.equal((await fetchLinkedInProfile("tok", fetchImpl)).sub, "abc123");
});

test("little text: reserved characters are escaped and hashtags stay hashtags", () => {
  assert.equal(toLittleText("Hi (all) @team *wow* #Launch2026!"), "Hi \\(all\\) \\@team \\*wow\\* {hashtag|\\#|Launch2026}!");
  assert.equal(toLittleText("a_b ~c~ [x] <y> {z} |w| \\"), "a\\_b \\~c\\~ \\[x\\] \\<y\\> \\{z\\} \\|w\\| \\\\");
});

test("publish: Images API upload, then rest/posts with LinkedIn-Version and the image URN", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /cdn\.example\.com/, reply: () => bytes(300, "image/png") },
    { match: /initializeUpload/, reply: () => json({ value: { uploadUrl: "https://www.linkedin.com/dms-uploads/abc", image: "urn:li:image:C4E" } }) },
    { match: /dms-uploads/, reply: () => new Response(null, { status: 201 }) },
    { match: /rest\/posts/, reply: () => new Response(null, { status: 201, headers: { "x-restli-id": "urn:li:share:7000" } }) },
  ]);
  const r = await publishToLinkedIn({ account, text: "New post #tips", media: [{ type: "image", url: "https://cdn.example.com/a.png" }], options: {}, fetchImpl });
  assert.ok(r.ok);
  assert.equal(r.id, "urn:li:share:7000");
  assert.equal(r.url, "https://www.linkedin.com/feed/update/urn:li:share:7000/");
  const init = calls.find((c) => c.url.includes("initializeUpload"))!;
  assert.deepEqual(bodyJson(init), { initializeUploadRequest: { owner: "urn:li:person:abc123" } });
  assert.match(init.headers["linkedin-version"], /^\d{6}$/);
  const post = calls.find((c) => c.url.endsWith("/rest/posts"))!;
  assert.equal(post.headers["x-restli-protocol-version"], "2.0.0");
  const body = bodyJson(post);
  assert.equal(body.author, "urn:li:person:abc123");
  assert.equal(body.commentary, "New post {hashtag|\\#|tips}");
  assert.deepEqual(body.content, { media: { id: "urn:li:image:C4E" } });
  assert.equal(body.lifecycleState, "PUBLISHED");
});

test("publish: an organization author is ignored unless company pages are enabled; 401 = reconnect", async () => {
  const { fetchImpl, calls } = mockFetch([{ match: /rest\/posts/, reply: () => json({ message: "Invalid access token" }, 401) }]);
  const r = await publishToLinkedIn({ account: { ...account, meta: { orgs: [{ urn: "urn:li:organization:9" }] } }, text: "x", media: [], options: { author: "urn:li:organization:9" }, fetchImpl });
  assert.equal(!r.ok && r.tokenDead, true);
  assert.equal(bodyJson(calls[0]).author, "urn:li:person:abc123");
  const v = await publishToLinkedIn({ account, text: "x", media: [{ type: "video", url: "https://cdn.example.com/a.mp4" }], options: {} });
  assert.equal(v.ok, false);
});
