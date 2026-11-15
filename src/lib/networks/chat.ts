// Server only: chat networks connected with a bot token, webhook or access token (no app review):
// Telegram (Bot API), Discord / Slack / Mattermost (incoming webhooks), Matrix (client-server API).
// Every connect* function checks the credentials once and returns what store.ts saves; every
// publish* function takes a fetchImpl so tests run without the network.
import { NetworkAuthError, obj, redact, str, type Fetch, type PublishInput, type PublishOutcome } from "@/lib/networks/common";
import { blobOf, call, downloadAll, failed, hostOf, normalizeBaseUrl } from "@/lib/networks/http";
import type { SaveAccountInput } from "@/lib/networks/store";

type Fields = Record<string, string>;

const MB = 1024 * 1024;

// ---- Telegram ------------------------------------------------------------------------------------

const TELEGRAM_CAPTION_MAX = 1024;

/** "@name", "t.me/name", "https://t.me/name", "-1001234" -> chat_id for the Bot API. */
export function normalizeTelegramChat(input: string): string | null {
  const raw = input.trim();
  if (/^-?\d{5,20}$/.test(raw)) return raw;
  const m = raw.match(/^(?:https?:\/\/)?(?:t\.me|telegram\.me)\/([A-Za-z0-9_]{5,32})\/?$/i) ?? raw.match(/^@?([A-Za-z][A-Za-z0-9_]{4,31})$/);
  return m ? `@${m[1]}` : null;
}

export function looksLikeBotToken(token: string): boolean {
  return /^\d{5,15}:[A-Za-z0-9_-]{30,50}$/.test(token);
}

function tg(token: string, method: string): string {
  return `https://api.telegram.org/bot${token}/${method}`;
}

export async function connectTelegram(f: Fields, fetchImpl: Fetch = fetch): Promise<SaveAccountInput> {
  const token = f.token.trim();
  if (!looksLikeBotToken(token)) throw new NetworkAuthError("bad_login", "That doesn't look like a bot token. Copy it from @BotFather (it looks like 123456789:AA…).");
  const chat = normalizeTelegramChat(f.chat);
  if (!chat) throw new NetworkAuthError("bad_login", "Enter the channel as @name, a t.me link, or the numeric chat ID.");
  const me = await call(tg(token, "getMe"), { method: "GET" }, fetchImpl, 15_000);
  if (!me.ok) throw new NetworkAuthError("bad_login", me.status === 401 || me.status === 404 ? "Telegram didn't accept that bot token." : redact(`Telegram: ${me.error}`, token));
  const bot = obj(me.json.result);
  const c = await call(`${tg(token, "getChat")}?chat_id=${encodeURIComponent(chat)}`, { method: "GET" }, fetchImpl, 15_000);
  if (!c.ok) throw new NetworkAuthError("bad_login", "The bot can't see that channel or group. Add the bot to it (as an admin for channels), then try again.");
  const info = obj(c.json.result);
  const chatId = str(info.id);
  if (info.type === "channel") {
    const m = await call(`${tg(token, "getChatMember")}?chat_id=${encodeURIComponent(chatId)}&user_id=${encodeURIComponent(str(bot.id))}`, { method: "GET" }, fetchImpl, 15_000);
    const status = str(obj(m.ok ? m.json.result : {}).status);
    if (status !== "administrator" && status !== "creator") throw new NetworkAuthError("bad_login", "Make the bot an admin of the channel with “Post messages”, then try again.");
  }
  const handle = str(info.username);
  return {
    externalId: `${str(bot.id)}:${chatId}`,
    username: handle ? `@${handle}` : str(info.title) || chatId,
    tokens: { accessToken: token },
    scopes: ["bot_token"],
    meta: { chatId, chatUsername: handle || null, chatTitle: str(info.title) || null, bot: str(bot.username) },
  };
}

export async function publishToTelegram(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  const chatId = str(input.account.meta.chatId);
  if (!chatId) return { ok: false, error: "This Telegram channel has no chat stored. Reconnect it in Settings.", tokenDead: true };
  const text = input.text.trim();
  const fail = (r: { status: number; error: string }, what: string) => failed("Telegram", what, r, token);
  const post = async (method: string, body: FormData | Record<string, unknown>) =>
    call(
      tg(token, method),
      body instanceof FormData ? { method: "POST", body } : { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
      fetchImpl,
      5 * 60_000,
    );
  const sendText = () => post("sendMessage", { chat_id: chatId, text });
  const link = (messageId: string) => {
    const handle = str(input.account.meta.chatUsername);
    return handle ? `https://t.me/${handle}/${messageId}` : undefined;
  };

  if (input.media.length === 0) {
    const r = await sendText();
    if (!r.ok) return fail(r, "post");
    const id = str(obj(r.json.result).message_id);
    return { ok: true, id: `${chatId}/${id}`, url: link(id) };
  }

  const dl = await downloadAll(input.media.slice(0, 10), fetchImpl, 50 * MB);
  if (!dl.ok) return dl;
  // A caption holds 1,024 characters: a longer text goes out as its own message first.
  const captionFits = text.length <= TELEGRAM_CAPTION_MAX;
  let firstId = "";
  if (!captionFits && text) {
    const r = await sendText();
    if (!r.ok) return fail(r, "post");
    firstId = str(obj(r.json.result).message_id);
  }
  const caption = captionFits ? text : "";
  let r;
  if (dl.files.length === 1) {
    const file = dl.files[0];
    const field = file.kind === "video" ? "video" : file.contentType === "image/gif" ? "animation" : "photo";
    const form = new FormData();
    form.set("chat_id", chatId);
    if (caption) form.set("caption", caption);
    form.set(field, blobOf(file), file.filename);
    r = await post(field === "video" ? "sendVideo" : field === "animation" ? "sendAnimation" : "sendPhoto", form);
  } else {
    const form = new FormData();
    form.set("chat_id", chatId);
    const items = dl.files.map((file, i) => ({
      type: file.kind === "video" ? "video" : "photo",
      media: `attach://f${i}`,
      ...(i === 0 && caption ? { caption } : {}),
    }));
    form.set("media", JSON.stringify(items));
    dl.files.forEach((file, i) => form.set(`f${i}`, blobOf(file), file.filename));
    r = await post("sendMediaGroup", form);
  }
  if (!r.ok) return fail(r, "media post");
  const result = Array.isArray(r.json.result) ? obj(r.json.result[0]) : obj(r.json.result);
  const id = firstId || str(result.message_id);
  return { ok: true, id: `${chatId}/${id}`, url: link(id) };
}

// ---- Discord (channel webhook) --------------------------------------------------------------------

/** A Discord webhook URL -> canonical https://discord.com/api/webhooks/<id>/<token>, or null. */
export function normalizeDiscordWebhook(input: string): { url: string; id: string } | null {
  const m = input.trim().match(/^https:\/\/(?:(?:canary|ptb)\.)?discord(?:app)?\.com\/api(?:\/v\d+)?\/webhooks\/(\d{5,25})\/([A-Za-z0-9_-]{20,100})\/?$/);
  return m ? { url: `https://discord.com/api/webhooks/${m[1]}/${m[2]}`, id: m[1] } : null;
}

export async function connectDiscord(f: Fields, fetchImpl: Fetch = fetch): Promise<SaveAccountInput> {
  const hook = normalizeDiscordWebhook(f.webhook);
  if (!hook) throw new NetworkAuthError("bad_login", "Paste the whole webhook URL, e.g. https://discord.com/api/webhooks/123…/abc…");
  const r = await call(hook.url, { method: "GET" }, fetchImpl, 15_000);
  if (!r.ok) throw new NetworkAuthError("bad_login", r.status === 401 || r.status === 404 ? "Discord says that webhook doesn't exist any more. Copy a fresh one." : redact(`Discord: ${r.error}`, hook.url));
  return {
    externalId: hook.id,
    username: str(r.json.name) || "Discord webhook",
    tokens: { accessToken: hook.url },
    scopes: ["webhook"],
    meta: { guildId: str(r.json.guild_id) || null, channelId: str(r.json.channel_id) || null },
  };
}

export async function publishToDiscord(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const url = input.account.accessToken;
  const content = input.text.trim();
  let init: RequestInit;
  if (input.media.length === 0) {
    init = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ content }) };
  } else {
    // Webhook uploads: 10 files, 10 MB each without a server boost.
    const dl = await downloadAll(input.media.slice(0, 10), fetchImpl, 10 * MB);
    if (!dl.ok) return dl.error.includes("too large") ? { ok: false, error: "Discord takes files up to 10 MB. Use a smaller file." } : dl;
    const form = new FormData();
    form.set("payload_json", JSON.stringify({ content, attachments: dl.files.map((file, i) => ({ id: i, filename: file.filename })) }));
    dl.files.forEach((file, i) => form.set(`files[${i}]`, blobOf(file), file.filename));
    init = { method: "POST", body: form };
  }
  const r = await call(`${url}?wait=true`, init, fetchImpl, 5 * 60_000);
  if (!r.ok) return { ...failed("Discord", "post", r, url), tokenDead: r.status === 401 || r.status === 404 };
  const id = str(r.json.id);
  const guild = str(input.account.meta.guildId);
  const channel = str(r.json.channel_id) || str(input.account.meta.channelId);
  return { ok: true, id, url: guild && channel && id ? `https://discord.com/channels/${guild}/${channel}/${id}` : undefined };
}

// ---- Slack (incoming webhook) ---------------------------------------------------------------------

export function normalizeSlackWebhook(input: string): { url: string; id: string } | null {
  const m = input.trim().match(/^https:\/\/hooks\.slack\.com\/services\/(T[A-Z0-9]+)\/(B[A-Z0-9]+)\/([A-Za-z0-9]{10,64})\/?$/);
  return m ? { url: `https://hooks.slack.com/services/${m[1]}/${m[2]}/${m[3]}`, id: `${m[1]}/${m[2]}` } : null;
}

/** Slack only needs &, < and > escaped in message text. */
export function slackEscape(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function connectSlack(f: Fields): Promise<SaveAccountInput> {
  const hook = normalizeSlackWebhook(f.webhook);
  if (!hook) throw new NetworkAuthError("bad_login", "Paste the whole incoming webhook URL, e.g. https://hooks.slack.com/services/T…/B…/…");
  // A webhook can't be checked without posting to the channel: the first scheduled post is the test.
  const name = (f.name ?? "").trim().slice(0, 80);
  return { externalId: hook.id, username: name || "Slack channel", tokens: { accessToken: hook.url }, scopes: ["webhook"], meta: {} };
}

export async function publishToSlack(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const url = input.account.accessToken;
  if (input.media.length > 0) return { ok: false, error: "Slack webhooks post text only. Remove the media or untick Slack." };
  const r = await call(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: slackEscape(input.text.trim()) }) }, fetchImpl, 30_000);
  // 403 invalid_token, 404 no_service / no_team, 410 channel_is_archived: the webhook is gone.
  if (!r.ok) return { ...failed("Slack", "post", r, url), tokenDead: [403, 404, 410].includes(r.status) };
  return { ok: true, id: `slack-${Date.now()}` };
}

// ---- Mattermost (incoming webhook) ----------------------------------------------------------------

export function normalizeMattermostWebhook(input: string): { url: string; id: string } | null {
  const base = normalizeBaseUrl(input);
  if (!base) return null;
  const m = base.match(/^(https:\/\/[^/]+(?:\/[^/]+)*)\/hooks\/([a-z0-9]{20,40})$/i);
  return m ? { url: base, id: `${hostOf(base)}/${m[2]}` } : null;
}

export async function connectMattermost(f: Fields): Promise<SaveAccountInput> {
  const hook = normalizeMattermostWebhook(f.webhook);
  if (!hook) throw new NetworkAuthError("bad_login", "Paste the whole incoming webhook URL, e.g. https://chat.example.com/hooks/abc123…");
  const name = (f.name ?? "").trim().slice(0, 80);
  return { externalId: hook.id, username: name || `Mattermost (${hostOf(hook.url)})`, tokens: { accessToken: hook.url }, scopes: ["webhook"], meta: { host: hostOf(hook.url) } };
}

export async function publishToMattermost(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const url = input.account.accessToken;
  if (input.media.length > 0) return { ok: false, error: "Mattermost webhooks post text only. Remove the media or untick Mattermost." };
  const r = await call(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: input.text.trim() }) }, fetchImpl, 30_000);
  if (!r.ok) return { ...failed("Mattermost", "post", r, url), tokenDead: r.status === 400 && /invalid webhook/i.test(r.error) ? true : r.status === 401 || r.status === 403 };
  return { ok: true, id: `mattermost-${Date.now()}` };
}

// ---- Matrix (client-server API) -------------------------------------------------------------------

/** The client API base for a homeserver name (/.well-known/matrix/client discovery, else the name itself). */
export async function discoverMatrixBase(server: string, fetchImpl: Fetch = fetch): Promise<string | null> {
  const base = normalizeBaseUrl(server);
  if (!base) return null;
  const wk = await call(`https://${hostOf(base)}/.well-known/matrix/client`, { method: "GET" }, fetchImpl, 10_000);
  const found = wk.ok ? str(obj(wk.json["m.homeserver"]).base_url) : "";
  return (found && normalizeBaseUrl(found)) || base;
}

function mx(base: string, path: string): string {
  return `${base}/_matrix/client/v3${path}`;
}

export async function connectMatrix(f: Fields, fetchImpl: Fetch = fetch): Promise<SaveAccountInput> {
  const token = f.token.trim();
  const room = f.room.trim();
  if (!/^[!#][^:\s]+:[^\s]+$/.test(room)) throw new NetworkAuthError("bad_login", "Enter the room as #alias:server or !id:server.");
  const base = await discoverMatrixBase(f.instance, fetchImpl);
  if (!base) throw new NetworkAuthError("bad_instance", "Enter your homeserver, e.g. matrix.org.");
  const auth = { Authorization: `Bearer ${token}` };
  const who = await call(mx(base, "/account/whoami"), { method: "GET", headers: auth }, fetchImpl, 15_000);
  if (!who.ok) {
    throw new NetworkAuthError("bad_login", who.status === 401 ? "The homeserver didn't accept that access token." : redact(`We couldn't reach that homeserver (${who.error}).`, token));
  }
  const userId = str(who.json.user_id);
  let roomId = room;
  if (room.startsWith("#")) {
    const d = await call(mx(base, `/directory/room/${encodeURIComponent(room)}`), { method: "GET", headers: auth }, fetchImpl, 15_000);
    roomId = d.ok ? str(d.json.room_id) : "";
    if (!roomId) throw new NetworkAuthError("bad_login", "We couldn't find that room alias.");
  }
  // Joins when invited or public; already-joined rooms answer 200 too.
  const j = await call(mx(base, `/join/${encodeURIComponent(roomId)}`), { method: "POST", headers: { ...auth, "Content-Type": "application/json" }, body: "{}" }, fetchImpl, 15_000);
  if (!j.ok) throw new NetworkAuthError("bad_login", "That account can't join the room. Invite it to the room first, then try again.");
  return {
    externalId: `${userId} ${roomId}`,
    username: room.startsWith("#") ? room : `${userId} in ${roomId}`,
    tokens: { accessToken: token },
    scopes: ["access_token"],
    meta: { base, roomId, userId, room },
  };
}

export async function publishToMatrix(input: PublishInput): Promise<PublishOutcome> {
  const fetchImpl = input.fetchImpl ?? fetch;
  const token = input.account.accessToken;
  const base = str(input.account.meta.base);
  const roomId = str(input.account.meta.roomId);
  if (!base || !roomId) return { ok: false, error: "This Matrix room has no server stored. Reconnect it in Settings.", tokenDead: true };
  const auth = { Authorization: `Bearer ${token}` };
  // The transaction id makes a retried send idempotent on the homeserver.
  const txn = (suffix: string) => encodeURIComponent(`${input.idempotencyKey ?? Date.now()}-${suffix}`);
  const send = (content: Record<string, unknown>, suffix: string) =>
    call(
      mx(base, `/rooms/${encodeURIComponent(roomId)}/send/m.room.message/${txn(suffix)}`),
      { method: "PUT", headers: { ...auth, "Content-Type": "application/json" }, body: JSON.stringify(content) },
      fetchImpl,
      30_000,
    );
  const text = input.text.trim();
  let firstId = "";
  if (text) {
    const r = await send({ msgtype: "m.text", body: text }, "t");
    if (!r.ok) return failed("Matrix", "post", r, token);
    firstId = str(r.json.event_id);
  }
  if (input.media.length > 0) {
    const dl = await downloadAll(input.media, fetchImpl, 50 * MB);
    if (!dl.ok) return dl;
    for (const [i, file] of dl.files.entries()) {
      const up = await call(
        `${base}/_matrix/media/v3/upload?filename=${encodeURIComponent(file.filename)}`,
        { method: "POST", headers: { ...auth, "Content-Type": file.contentType }, body: new Uint8Array(file.bytes) },
        fetchImpl,
        5 * 60_000,
      );
      if (!up.ok) return failed("Matrix", "upload", up, token);
      const r = await send(
        { msgtype: file.kind === "video" ? "m.video" : "m.image", body: file.filename, url: str(up.json.content_uri), info: { mimetype: file.contentType, size: file.bytes.length } },
        `m${i}`,
      );
      if (!r.ok) return failed("Matrix", "media post", r, token);
      if (!firstId) firstId = str(r.json.event_id);
    }
  }
  if (!firstId) return { ok: false, error: "Nothing to post: the caption and media are empty." };
  return { ok: true, id: firstId, url: `https://matrix.to/#/${encodeURIComponent(roomId)}/${encodeURIComponent(firstId)}` };
}
