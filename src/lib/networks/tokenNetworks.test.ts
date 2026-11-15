import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { test } from "node:test";
import { bodyJson, bytes, json, mockFetch } from "../../test-utils/mockFetch.ts";
import type { NetAccount, NetworkId } from "./common.ts";
import { NETWORK_IDS } from "./common.ts";
import { normalizeBaseUrl, textToHtml } from "./http.ts";
import { splitTitle, tokenMediaError, TOKEN_NETWORK_IDS, TOKEN_NETWORKS } from "./tokenNetworks.ts";
import {
  connectDiscord,
  connectMatrix,
  connectSlack,
  connectTelegram,
  normalizeDiscordWebhook,
  normalizeMattermostWebhook,
  normalizeSlackWebhook,
  normalizeTelegramChat,
  publishToDiscord,
  publishToMatrix,
  publishToSlack,
  publishToTelegram,
} from "./chat.ts";
import { connectPeerTube, peertubeTitle, publishToMisskey, publishToPeerTube, refreshPeerTube } from "./fediverse.ts";
import { connectHashnode, connectListmonk, ghostJwt, parseListIds, publishToDevto, publishToHashnode, publishToListmonk, publishToWordPress } from "./blogs.ts";
import { readTokenFields } from "./tokenConnect.ts";
import { networkTargetError } from "./validate.ts";
import { checkCaption } from "../platforms.ts";

const BOT = "123456789:AAH-abcdefghijklmnopqrstuvwxyz012345";
const acct = (platform: NetworkId, over: Partial<NetAccount> = {}): NetAccount => ({
  id: "a1",
  platform,
  externalId: "ext",
  username: null,
  accessToken: "secret-token-1",
  refreshToken: "",
  tokenExpiresAt: null,
  meta: {},
  secret: {},
  ...over,
});

test("every token network is a NetworkId with a spec, a label and a caption limit", () => {
  for (const id of TOKEN_NETWORK_IDS) {
    assert.ok(NETWORK_IDS.includes(id), id);
    assert.ok(TOKEN_NETWORKS[id].fields.length > 0, id);
    assert.equal(checkCaption(id, "hi").max, TOKEN_NETWORKS[id].captionMax);
  }
});

test("server addresses: https public hosts only", () => {
  assert.equal(normalizeBaseUrl("example.com"), "https://example.com");
  assert.equal(normalizeBaseUrl("https://Example.com/blog/"), "https://example.com/blog");
  assert.equal(normalizeBaseUrl("http://example.com"), null);
  assert.equal(normalizeBaseUrl("localhost"), null);
  assert.equal(normalizeBaseUrl("10.0.0.1"), null);
  assert.equal(normalizeBaseUrl("example.com:8443"), null);
  assert.equal(normalizeBaseUrl("db.internal"), null);
});

test("titles: first line (without #) is the title, the rest the body", () => {
  assert.deepEqual(splitTitle("# Hello world\n\nBody here"), { title: "Hello world", body: "Body here" });
  assert.deepEqual(splitTitle("Only a line"), { title: "Only a line", body: "Only a line" });
  assert.equal(peertubeTitle("Hi"), `Hi ${new Date().toISOString().slice(0, 10)}`);
  assert.equal(textToHtml("a <b>\n\nhttps://x.com/a"), '<p>a &lt;b&gt;</p>\n<p><a href="https://x.com/a">https://x.com/a</a></p>');
});

test("media rules per network when saving", () => {
  const img = { type: "image" as const, url: "https://cdn/a.jpg" };
  const vid = { type: "video" as const, url: "https://cdn/a.mp4" };
  assert.match(tokenMediaError("slack", [img], true) ?? "", /text only/);
  assert.equal(tokenMediaError("slack", [], true), null);
  assert.match(tokenMediaError("pixelfed", [], true) ?? "", /at least one image/);
  assert.equal(tokenMediaError("pixelfed", [], false), null);
  assert.match(tokenMediaError("peertube", [img], true) ?? "", /one video/);
  assert.equal(tokenMediaError("peertube", [vid], true), null);
  assert.match(tokenMediaError("wordpress", [vid], true) ?? "", /images only/);
  assert.equal(tokenMediaError("telegram", [img, vid], true), null);
  assert.match(networkTargetError("devto", [img], {}, true) ?? "", /text only/);
});

test("form fields: required ones must be filled, optional ones may be empty", () => {
  const form: Record<string, string> = { webhook: " https://hooks.slack.com/services/T1/B2/abcdefghij ", name: "" };
  const r = readTokenFields("slack", (n) => form[n] ?? "");
  assert.deepEqual(r, { fields: { webhook: "https://hooks.slack.com/services/T1/B2/abcdefghij", name: "" } });
  assert.deepEqual(readTokenFields("telegram", () => ""), { missing: "Bot token" });
});

test("webhook and chat inputs are normalised", () => {
  assert.deepEqual(normalizeDiscordWebhook("https://discordapp.com/api/v10/webhooks/123456789/abcdefghijklmnopqrstuvwxyz"), {
    url: "https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz",
    id: "123456789",
  });
  assert.equal(normalizeDiscordWebhook("https://evil.com/api/webhooks/1/2"), null);
  assert.equal(normalizeSlackWebhook("https://hooks.slack.com/services/T1/B2/abcdefghij")?.id, "T1/B2");
  assert.equal(normalizeMattermostWebhook("chat.example.com/hooks/abcdefghijklmnopqrstuvwxyz")?.id, "chat.example.com/abcdefghijklmnopqrstuvwxyz");
  assert.equal(normalizeTelegramChat("https://t.me/poskoo_news"), "@poskoo_news");
  assert.equal(normalizeTelegramChat("-1001234567890"), "-1001234567890");
  assert.equal(normalizeTelegramChat("a b"), null);
});

test("Telegram connect: checks the token, the chat and that the bot is a channel admin", async () => {
  const { fetchImpl } = mockFetch([
    { match: /getMe/, reply: () => json({ ok: true, result: { id: 42, username: "poskoo_bot" } }) },
    { match: /getChat\?/, reply: () => json({ ok: true, result: { id: -100123, type: "channel", title: "News", username: "news" } }) },
    { match: /getChatMember/, reply: () => json({ ok: true, result: { status: "member" } }) },
  ]);
  await assert.rejects(connectTelegram({ token: BOT, chat: "@newsroom" }, fetchImpl), /admin/);
  const ok = mockFetch([
    { match: /getMe/, reply: () => json({ ok: true, result: { id: 42 } }) },
    { match: /getChat\?/, reply: () => json({ ok: true, result: { id: -100123, type: "channel", title: "News", username: "news" } }) },
    { match: /getChatMember/, reply: () => json({ ok: true, result: { status: "administrator" } }) },
  ]);
  const saved = await connectTelegram({ token: BOT, chat: "t.me/newsroom" }, ok.fetchImpl);
  assert.equal(saved.externalId, "42:-100123");
  assert.equal(saved.username, "@news");
  assert.equal(saved.tokens.accessToken, BOT);
});

test("Telegram publish: files download first, a long caption goes out as text, then the photo; the token never leaks", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /cdn/, reply: () => bytes(10, "image/jpeg") },
    { match: /sendMessage/, reply: () => json({ ok: true, result: { message_id: 7 } }) },
    { match: /sendPhoto/, reply: () => json({ ok: false, description: `Bad Request at bot${BOT}` }, 400) },
  ]);
  const out = await publishToTelegram({
    account: acct("telegram", { accessToken: BOT, meta: { chatId: "-100123", chatUsername: "news" } }),
    text: "x".repeat(2000),
    media: [{ type: "image", url: "https://cdn.example.com/a.jpg" }],
    options: {},
    fetchImpl,
  });
  assert.equal(out.ok, false);
  assert.ok(!out.ok && !out.error.includes(BOT));
  assert.deepEqual(calls.map((c) => c.url.split("/").pop()), ["a.jpg", "sendMessage", "sendPhoto"]);
  const ok = mockFetch([{ match: /sendMessage/, reply: () => json({ ok: true, result: { message_id: 9 } }) }]);
  const text = await publishToTelegram({ account: acct("telegram", { accessToken: BOT, meta: { chatId: "-100123", chatUsername: "news" } }), text: "Hi", media: [], options: {}, fetchImpl: ok.fetchImpl });
  assert.deepEqual(text, { ok: true, id: "-100123/9", url: "https://t.me/news/9" });
});

test("Discord: connect reads the webhook, publish uploads files as multipart", async () => {
  const hook = "https://discord.com/api/webhooks/123456789/abcdefghijklmnopqrstuvwxyz";
  const c = mockFetch([{ match: /webhooks/, reply: () => json({ id: "123456789", name: "Poskoo", guild_id: "g1", channel_id: "c1" }) }]);
  const saved = await connectDiscord({ webhook: hook }, c.fetchImpl);
  assert.equal(saved.externalId, "123456789");
  const { fetchImpl, calls } = mockFetch([
    { match: /cdn/, reply: () => bytes(10, "image/png") },
    { match: /webhooks/, reply: () => json({ id: "m1", channel_id: "c1" }) },
  ]);
  const out = await publishToDiscord({ account: acct("discord", { accessToken: hook, meta: saved.meta }), text: "Hello", media: [{ type: "image", url: "https://cdn.example.com/a.png" }], options: {}, fetchImpl });
  assert.deepEqual(out, { ok: true, id: "m1", url: "https://discord.com/channels/g1/c1/m1" });
  const post = calls[1];
  assert.equal(post.url, `${hook}?wait=true`);
  assert.ok(post.body instanceof FormData);
  assert.equal(JSON.parse(String((post.body as FormData).get("payload_json"))).content, "Hello");
});

test("Slack: webhook URL is the secret; text is escaped; a removed webhook needs a reconnect", async () => {
  const saved = await connectSlack({ webhook: "https://hooks.slack.com/services/T1/B2/abcdefghij", name: "#news" });
  assert.equal(saved.username, "#news");
  const { fetchImpl, calls } = mockFetch([{ match: /hooks\.slack/, reply: () => new Response("no_service", { status: 404 }) }]);
  const out = await publishToSlack({ account: acct("slack", { accessToken: saved.tokens.accessToken }), text: "a < b & c", media: [], options: {}, fetchImpl });
  assert.equal(bodyJson(calls[0]).text, "a &lt; b &amp; c");
  assert.ok(!out.ok && out.tokenDead);
  assert.ok(!out.ok && !out.error.includes("abcdefghij"));
});

test("Matrix: discovers the client API, resolves the alias, sends with an idempotent txn id", async () => {
  const c = mockFetch([
    { match: /well-known/, reply: () => json({ "m.homeserver": { base_url: "https://matrix-client.matrix.org" } }) },
    { match: /whoami/, reply: () => json({ user_id: "@bot:matrix.org" }) },
    { match: /directory\/room/, reply: () => json({ room_id: "!abc:matrix.org" }) },
    { match: /\/join\//, reply: () => json({ room_id: "!abc:matrix.org" }) },
  ]);
  const saved = await connectMatrix({ instance: "matrix.org", token: "syt_x", room: "#poskoo:matrix.org" }, c.fetchImpl);
  assert.equal(saved.meta?.base, "https://matrix-client.matrix.org");
  assert.equal(saved.meta?.roomId, "!abc:matrix.org");
  const { fetchImpl, calls } = mockFetch([{ match: /send\/m\.room\.message/, reply: () => json({ event_id: "$e1" }) }]);
  const out = await publishToMatrix({ account: acct("matrix", { meta: saved.meta }), text: "Hi", media: [], options: {}, idempotencyKey: "t-1", fetchImpl });
  assert.ok(out.ok);
  assert.equal(calls[0].method, "PUT");
  assert.match(calls[0].url, /send\/m\.room\.message\/t-1-t$/);
});

test("Misskey: uploads to the drive, then creates the note with the file ids", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /cdn/, reply: () => bytes(10, "image/jpeg") },
    { match: /drive\/files\/create/, reply: () => json({ id: "f1" }) },
    { match: /notes\/create/, reply: () => json({ createdNote: { id: "n1" } }) },
  ]);
  const out = await publishToMisskey({ account: acct("misskey", { meta: { base: "https://misskey.io" } }), text: "Hi", media: [{ type: "image", url: "https://cdn.example.com/a.jpg" }], options: {}, fetchImpl });
  assert.deepEqual(out, { ok: true, id: "n1", url: "https://misskey.io/notes/n1" });
  assert.deepEqual(bodyJson(calls[2]).fileIds, ["f1"]);
});

test("PeerTube: the password is used once (not stored), tokens refresh with the local client", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /oauth-clients\/local/, reply: () => json({ client_id: "cid", client_secret: "csec" }) },
    { match: /users\/token/, reply: () => json({ access_token: "at", refresh_token: "rt", expires_in: 86400, refresh_token_expires_in: 1209600 }) },
    { match: /users\/me/, reply: () => json({ id: 5, username: "me", videoChannels: [{ id: 9, displayName: "My channel" }] }) },
  ]);
  const saved = await connectPeerTube({ instance: "tube.example.org", username: "me", password: "hunter22" }, fetchImpl);
  assert.equal(saved.externalId, "5@tube.example.org");
  assert.equal(saved.meta?.channelId, "9");
  assert.ok(!JSON.stringify(saved).includes("hunter22"));
  assert.equal(new URLSearchParams(String(calls[1].body)).get("grant_type"), "password");
  const r = mockFetch([{ match: /users\/token/, reply: () => json({ error: "invalid_grant" }, 400) }]);
  await assert.rejects(
    refreshPeerTube(acct("peertube", { refreshToken: "rt", meta: saved.meta ?? {}, secret: { clientSecret: "csec" } }), r.fetchImpl),
    (e: Error & { tokenDead?: boolean }) => e.tokenDead === true,
  );
  const noVideo = await publishToPeerTube({ account: acct("peertube", { meta: saved.meta ?? {} }), text: "Hi", media: [], options: {} });
  assert.equal(noVideo.ok, false);
});

test("Ghost Admin API JWT: HS256 over the hex secret, 5 minutes, audience /admin/", () => {
  const id = "a".repeat(24);
  const secret = "0f".repeat(32);
  const jwt = ghostJwt(`${id}:${secret}`, 1000);
  const [h, p, s] = jwt.split(".");
  assert.deepEqual(JSON.parse(Buffer.from(h, "base64url").toString()), { alg: "HS256", typ: "JWT", kid: id });
  assert.deepEqual(JSON.parse(Buffer.from(p, "base64url").toString()), { iat: 1000, exp: 1300, aud: "/admin/" });
  assert.equal(s, createHmac("sha256", Buffer.from(secret, "hex")).update(`${h}.${p}`).digest("base64url"));
  assert.throws(() => ghostJwt("not-a-key"));
});

test("DEV and Hashnode: title from the first line; GraphQL errors fail the post", async () => {
  const d = mockFetch([{ match: /dev\.to\/api\/articles/, reply: () => json({ id: 1, url: "https://dev.to/me/hello-1" }, 201) }]);
  const out = await publishToDevto({ account: acct("devto"), text: "Hello\nBody **bold**", media: [], options: {}, fetchImpl: d.fetchImpl });
  assert.deepEqual(out, { ok: true, id: "1", url: "https://dev.to/me/hello-1" });
  assert.deepEqual(bodyJson(d.calls[0]).article, { title: "Hello", body_markdown: "Body **bold**", published: true });
  const h = mockFetch([{ match: /gql\.hashnode/, reply: () => json({ errors: [{ message: "Not allowed", extensions: { code: "UNAUTHENTICATED" } }] }) }]);
  const fail = await publishToHashnode({ account: acct("hashnode", { meta: { publicationId: "p1" } }), text: "T\nB", media: [], options: {}, fetchImpl: h.fetchImpl });
  assert.ok(!fail.ok && fail.tokenDead && /Not allowed/.test(fail.error));
  const c = mockFetch([{ match: /gql\.hashnode/, reply: () => json({ data: { me: { id: "u1", username: "me", publications: { edges: [{ node: { id: "p1", title: "Blog", url: "https://me.hashnode.dev" } }] } } } }) }]);
  assert.equal((await connectHashnode({ token: "t", blog: "" }, c.fetchImpl)).externalId, "p1");
});

test("WordPress: uploads images, sets the first as featured, falls back to the ?rest_route form", async () => {
  const { fetchImpl, calls } = mockFetch([
    { match: /cdn/, reply: () => bytes(10, "image/jpeg") },
    { match: /rest_route=%2Fwp%2Fv2%2Fmedia/, reply: () => json({ id: 11, source_url: "https://site.com/a.jpg" }, 201) },
    { match: /rest_route=%2Fwp%2Fv2%2Fposts/, reply: () => json({ id: 12, link: "https://site.com/hello" }, 201) },
  ]);
  const out = await publishToWordPress({
    account: acct("wordpress", { accessToken: "abcd efgh", meta: { base: "https://site.com", user: "me", restQuery: true } }),
    text: "Hello\nBody",
    media: [{ type: "image", url: "https://cdn.example.com/a.jpg" }],
    options: {},
    fetchImpl,
  });
  assert.deepEqual(out, { ok: true, id: "12", url: "https://site.com/hello" });
  assert.equal(calls[1].headers.authorization, `Basic ${Buffer.from("me:abcd efgh").toString("base64")}`);
  assert.equal(bodyJson(calls[2]).featured_media, 11);
});

test("Listmonk: list ids are checked on connect; a post is a campaign that gets started", async () => {
  assert.deepEqual(parseListIds("1, 3 3 x"), [1, 3]);
  const c = mockFetch([{ match: /api\/lists/, reply: () => json({ data: { results: [{ id: 1, name: "Newsletter" }] } }) }]);
  await assert.rejects(connectListmonk({ instance: "lists.example.com", username: "api", token: "t", lists: "1, 2" }, c.fetchImpl), /doesn't exist/);
  const { fetchImpl, calls } = mockFetch([
    { match: /POST .*api\/campaigns$/, reply: () => json({ data: { id: 4 } }) },
    { match: /PUT .*campaigns\/4\/status/, reply: () => json({ data: { id: 4 } }) },
  ]);
  const out = await publishToListmonk({ account: acct("listmonk", { meta: { base: "https://lists.example.com", user: "api", lists: [1] } }), text: "Subject\nBody", media: [], options: {}, fetchImpl });
  assert.deepEqual(out, { ok: true, id: "4", url: "https://lists.example.com/admin/campaigns/4" });
  assert.equal(calls[0].headers.authorization, "token api:secret-token-1");
  assert.equal(bodyJson(calls[0]).subject, "Subject");
});
