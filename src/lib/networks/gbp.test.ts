import assert from "node:assert/strict";
import { test } from "node:test";
import { bodyForm, bodyJson, json, mockFetch } from "../../test-utils/mockFetch.ts";
import type { NetAccount } from "./common.ts";
import { pkceS256 } from "./common.ts";
import {
  GBP_WAITING_MESSAGE,
  buildGbpPost,
  exchangeGbpCode,
  gbpAuthorizeUrl,
  gbpConfig,
  gbpOptionsError,
  isGbpApprovalPending,
  isGbpConfigured,
  listGbpLocations,
  parseGbpOptions,
  publishToGbp,
} from "./gbp.ts";

const account: NetAccount = {
  id: "g1",
  platform: "gbp",
  externalId: "locations/456",
  username: "Brew Co Downtown",
  accessToken: "ya29.gbp-token",
  refreshToken: "1//refresh",
  tokenExpiresAt: null,
  meta: { account: "accounts/123" },
  secret: {},
};
const PHOTO = "https://poskoo.com/api/media/u/p.jpg?exp=1&sig=s";

test("config: own GBP client wins, otherwise the Sign-in-with-Google client when GBP_ENABLED=1", () => {
  process.env.GOOGLE_CLIENT_ID = "google-id";
  process.env.GOOGLE_CLIENT_SECRET = "google-secret";
  delete process.env.GBP_CLIENT_ID;
  delete process.env.GBP_CLIENT_SECRET;
  delete process.env.GBP_ENABLED;
  assert.equal(isGbpConfigured(), false, "off until switched on (needs Google's API approval)");
  process.env.GBP_ENABLED = "1";
  assert.equal(isGbpConfigured(), true);
  assert.equal(gbpConfig().clientId, "google-id");
  process.env.GBP_CLIENT_ID = "gbp-id";
  process.env.GBP_CLIENT_SECRET = "gbp-secret";
  assert.equal(gbpConfig().clientId, "gbp-id");
  assert.equal(gbpConfig().redirectUri, "https://poskoo.com/api/gbp/callback");
});

test("authorize URL: business.manage, offline access, consent, PKCE", () => {
  const url = new URL(gbpAuthorizeUrl("st", "verifier-1"));
  assert.equal(url.searchParams.get("scope"), "https://www.googleapis.com/auth/business.manage");
  assert.equal(url.searchParams.get("access_type"), "offline");
  assert.equal(url.searchParams.get("prompt"), "consent");
  assert.equal(url.searchParams.get("code_challenge"), pkceS256("verifier-1"));
});

test("code exchange sends the verifier", async () => {
  const { fetchImpl, calls } = mockFetch([{ match: /oauth2\.googleapis\.com\/token/, reply: () => json({ access_token: "a", refresh_token: "r", expires_in: 3599 }) }]);
  const t = await exchangeGbpCode("c", "verifier-1", fetchImpl);
  assert.equal(t.refreshToken, "r");
  assert.equal(bodyForm(calls[0]).get("code_verifier"), "verifier-1");
});

test("locations: every account, readMask, addresses formatted", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /mybusinessaccountmanagement.*\/accounts/, reply: () => json({ accounts: [{ name: "accounts/123", accountName: "Brew Co" }] }) },
    {
      match: /accounts\/123\/locations/,
      reply: () =>
        json({
          locations: [
            { name: "locations/456", title: "Brew Co Downtown", storefrontAddress: { addressLines: ["1 Main St"], locality: "Edmonton", administrativeArea: "AB" } },
            { name: "locations/789", title: "Brew Co West" },
          ],
        }),
    },
  ]);
  const locs = await listGbpLocations("tok", fetchImpl);
  assert.equal(locs.length, 2);
  assert.deepEqual(locs[0], { account: "accounts/123", accountName: "Brew Co", location: "locations/456", title: "Brew Co Downtown", address: "1 Main St, Edmonton, AB" });
  assert.match(calls[1].url, /readMask=name,title,storefrontAddress/);
});

test("Google's API approval not granted yet: 403 SERVICE_DISABLED and 429 quota 0 give the waiting message", async () => {
  const disabled = { error: { code: 403, status: "PERMISSION_DENIED", message: "My Business Account Management API has not been used in project 1 before or it is disabled.", details: [{ reason: "SERVICE_DISABLED" }] } };
  const quota0 = { error: { code: 429, status: "RESOURCE_EXHAUSTED", message: "Quota exceeded for quota metric 'Requests' and limit 'Requests per minute' of service 'mybusinessaccountmanagement.googleapis.com'", details: [{ metadata: { quota_limit_value: "0" } }] } };
  assert.equal(isGbpApprovalPending(403, disabled), true);
  assert.equal(isGbpApprovalPending(429, quota0), true);
  assert.equal(isGbpApprovalPending(429, { error: { message: "Quota exceeded", details: [{ metadata: { quota_limit_value: "300" } }] } }), false);
  assert.equal(isGbpApprovalPending(403, { error: { message: "The caller does not have permission" } }), false);
  const { fetchImpl } = mockFetch([{ match: /accounts/, reply: () => json(disabled, 403) }]);
  await assert.rejects(listGbpLocations("tok", fetchImpl), (e: Error & { reason?: string }) => e.reason === "gbp_pending" && e.message === GBP_WAITING_MESSAGE);
});

test("options: offer/event need title and dates, buttons need a URL (except Call), one photo only", () => {
  const img = [{ type: "image" as const, url: PHOTO }];
  assert.equal(gbpOptionsError(parseGbpOptions({}), img), null);
  assert.match(gbpOptionsError(parseGbpOptions({ type: "OFFER" }), img) ?? "", /title/);
  assert.match(gbpOptionsError(parseGbpOptions({ type: "EVENT", title: "Workshop" }), img) ?? "", /dates/);
  assert.match(gbpOptionsError(parseGbpOptions({ type: "EVENT", title: "W", startDate: "2026-12-05", endDate: "2026-12-01" }), img) ?? "", /ends before/);
  assert.match(gbpOptionsError(parseGbpOptions({ cta: "BOOK" }), img) ?? "", /web address/);
  assert.equal(gbpOptionsError(parseGbpOptions({ cta: "CALL" }), img), null);
  assert.match(gbpOptionsError(parseGbpOptions({}), [...img, ...img]) ?? "", /one photo/);
  assert.match(gbpOptionsError(parseGbpOptions({}), [{ type: "video", url: "https://c/v.mp4" }]) ?? "", /not a video/);
});

test("localPost body: event schedule, offer fields (no CTA), update CTA, one photo", () => {
  const ev = buildGbpPost(parseGbpOptions({ type: "EVENT", title: "Latte art", startDate: "2026-12-05", startTime: "18:30", endDate: "2026-12-05", endTime: "20:00", cta: "SIGN_UP", ctaUrl: "https://brew.co/rsvp" }), "Join us", PHOTO);
  assert.deepEqual(ev.event, {
    title: "Latte art",
    schedule: { startDate: { year: 2026, month: 12, day: 5 }, endDate: { year: 2026, month: 12, day: 5 }, startTime: { hours: 18, minutes: 30, seconds: 0, nanos: 0 }, endTime: { hours: 20, minutes: 0, seconds: 0, nanos: 0 } },
  });
  assert.deepEqual(ev.callToAction, { actionType: "SIGN_UP", url: "https://brew.co/rsvp" });
  assert.deepEqual(ev.media, [{ mediaFormat: "PHOTO", sourceUrl: PHOTO }]);
  const offer = buildGbpPost(parseGbpOptions({ type: "OFFER", title: "20% off", startDate: "2026-12-01", endDate: "2026-12-31", couponCode: "BREW20", redeemUrl: "https://brew.co/o", terms: "One per visit", cta: "ORDER", ctaUrl: "https://x" }), "Deal", null);
  assert.equal(offer.topicType, "OFFER");
  assert.deepEqual(offer.offer, { couponCode: "BREW20", redeemOnlineUrl: "https://brew.co/o", termsConditions: "One per visit" });
  assert.equal(offer.callToAction, undefined);
  assert.equal(offer.media, undefined);
  const call = buildGbpPost(parseGbpOptions({ cta: "CALL" }), "Hi", null);
  assert.deepEqual(call.callToAction, { actionType: "CALL" });
  assert.equal(call.topicType, "STANDARD");
});

test("publish: POST v4 localPosts on the location, returns the search URL", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /HEAD https:\/\/poskoo\.com\/api\/media/, reply: () => new Response(null, { status: 200, headers: { "content-length": "200000", "content-type": "image/jpeg" } }) },
    { match: /localPosts/, reply: () => json({ name: "accounts/123/locations/456/localPosts/9", searchUrl: "https://local.google.com/place?id=1&use=posts&lpsid=9", state: "LIVE" }) },
  ]);
  const r = await publishToGbp({ account, text: "Fresh pastries today", media: [{ type: "image", url: PHOTO }], options: { cta: "LEARN_MORE", ctaUrl: "https://brew.co" }, fetchImpl });
  assert.ok(r.ok);
  assert.equal(r.url, "https://local.google.com/place?id=1&use=posts&lpsid=9");
  const post = calls.find((c) => c.url.includes("localPosts"))!;
  assert.equal(post.url, "https://mybusiness.googleapis.com/v4/accounts/123/locations/456/localPosts");
  assert.equal(post.headers.authorization, "Bearer ya29.gbp-token");
  const body = bodyJson(post);
  assert.equal(body.summary, "Fresh pastries today");
  assert.equal(body.topicType, "STANDARD");
});

test("publish: waiting-for-approval, small photo and 401 cases", async () => {
  const pending = mockFetch([{ match: /localPosts/, reply: () => json({ error: { code: 403, message: "Google My Business API has not been used in project 1 before or it is disabled.", status: "PERMISSION_DENIED" } }, 403) }]);
  const r1 = await publishToGbp({ account, text: "x", media: [], options: {}, fetchImpl: pending.fetchImpl });
  assert.equal(!r1.ok && r1.error, GBP_WAITING_MESSAGE);
  const small = mockFetch([{ match: /HEAD/, reply: () => new Response(null, { status: 200, headers: { "content-length": "5000" } }) }]);
  const r2 = await publishToGbp({ account, text: "x", media: [{ type: "image", url: PHOTO }], options: {}, fetchImpl: small.fetchImpl });
  assert.match(!r2.ok ? r2.error : "", /at least 10 KB/);
  const dead = mockFetch([{ match: /localPosts/, reply: () => json({ error: { code: 401, message: "Request had invalid authentication credentials." } }, 401) }]);
  const r3 = await publishToGbp({ account, text: "x", media: [], options: {}, fetchImpl: dead.fetchImpl });
  assert.equal(!r3.ok && r3.tokenDead, true);
  const gif = await publishToGbp({ account, text: "x", media: [{ type: "image", url: "https://poskoo.com/a.gif" }], options: {} });
  assert.match(!gif.ok ? gif.error : "", /JPG or PNG/);
});
