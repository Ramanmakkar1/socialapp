import assert from "node:assert/strict";
import { test } from "node:test";
import { bodyForm, bodyJson, json, mockFetch } from "../../test-utils/mockFetch.ts";
import type { NetAccount } from "./common.ts";
import {
  exchangePinterestCode,
  listPinterestBoards,
  pinterestAuthorizeUrl,
  pinterestOptionsError,
  parsePinterestOptions,
  publishToPinterest,
} from "./pinterest.ts";

process.env.PINTEREST_APP_ID = "pin_id";
process.env.PINTEREST_APP_SECRET = "pin_secret";
delete process.env.PINTEREST_SANDBOX;

const account: NetAccount = {
  id: "p1",
  platform: "pinterest",
  externalId: "u1",
  username: "brewco",
  accessToken: "pina_token",
  refreshToken: "pinr_token",
  tokenExpiresAt: null,
  meta: {},
  secret: {},
};

test("authorize URL with boards:read, pins:write, user_accounts:read", () => {
  const url = new URL(pinterestAuthorizeUrl("st"));
  assert.equal(url.origin + url.pathname, "https://www.pinterest.com/oauth/");
  assert.equal(url.searchParams.get("scope"), "boards:read,pins:write,user_accounts:read");
  assert.equal(url.searchParams.get("redirect_uri"), "https://poskoo.com/api/pinterest/callback");
});

test("token exchange uses HTTP Basic auth and continuous refresh", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /oauth\/token/, reply: () => json({ access_token: "a", refresh_token: "r", expires_in: 2592000, refresh_token_expires_in: 5184000 }) },
  ]);
  const t = await exchangePinterestCode("c", fetchImpl);
  assert.equal(t.refreshExpiresIn, 5184000);
  assert.equal(calls[0].headers.authorization, `Basic ${Buffer.from("pin_id:pin_secret").toString("base64")}`);
  assert.equal(bodyForm(calls[0]).get("continuous_refresh"), "true");
});

test("boards follow the bookmark across pages", async () => {
  const { fetchImpl, calls } = mockFetch([
    {
      match: /\/boards/,
      reply: (_c, n) =>
        n === 0
          ? json({ items: [{ id: "b1", name: "Recipes", privacy: "PUBLIC" }], bookmark: "next" })
          : json({ items: [{ id: "b2", name: "Secret", privacy: "SECRET" }], bookmark: null }),
    },
  ]);
  const r = await listPinterestBoards("t", fetchImpl);
  assert.ok(r.ok);
  assert.deepEqual(r.boards.map((b) => b.id), ["b1", "b2"]);
  assert.match(calls[1].url, /bookmark=next/);
});

test("options: board required, title max 100, link must be a web address, image required", () => {
  assert.match(pinterestOptionsError(parsePinterestOptions({}), 1, false) ?? "", /board/);
  assert.match(pinterestOptionsError(parsePinterestOptions({ boardId: "b", title: "x".repeat(101) }), 1, false) ?? "", /100/);
  assert.match(pinterestOptionsError(parsePinterestOptions({ boardId: "b", link: "javascript:alert(1)" }), 1, false) ?? "", /web address/);
  assert.match(pinterestOptionsError(parsePinterestOptions({ boardId: "b" }), 0, false) ?? "", /needs an image/);
  assert.equal(pinterestOptionsError(parsePinterestOptions({ boardId: "b", title: "T", link: "https://x.com" }), 1, false), null);
});

test("publish: one image pin with title, description (caption) and link", async () => {
  const { fetchImpl, calls } = mockFetch([{ match: /\/pins$/, reply: () => json({ id: "987" }, 201) }]);
  const r = await publishToPinterest({
    account,
    text: "Best cold brew",
    media: [{ type: "image", url: "https://cdn.example.com/a.jpg" }],
    options: { boardId: "b1", title: "Cold brew", link: "https://brew.co/recipe" },
    fetchImpl,
  });
  assert.ok(r.ok);
  assert.equal(r.url, "https://www.pinterest.com/pin/987/");
  assert.equal(calls[0].url, "https://api.pinterest.com/v5/pins");
  assert.deepEqual(bodyJson(calls[0]), {
    board_id: "b1",
    title: "Cold brew",
    description: "Best cold brew",
    link: "https://brew.co/recipe",
    media_source: { source_type: "image_url", url: "https://cdn.example.com/a.jpg" },
  });
});

test("publish: a trial-access refusal explains Standard access", async () => {
  const { fetchImpl } = mockFetch([{ match: /\/pins$/, reply: () => json({ code: 29, message: "Apps with Trial access may not create Pins in production" }, 403) }]);
  const r = await publishToPinterest({ account, text: "x", media: [{ type: "image", url: "https://cdn.example.com/a.jpg" }], options: { boardId: "b1" }, fetchImpl });
  assert.match(!r.ok ? r.error : "", /Standard access/);
});
