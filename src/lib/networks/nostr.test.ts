import assert from "node:assert/strict";
import { test } from "node:test";
import type { NetAccount } from "./common.ts";
import {
  bech32Decode,
  bech32Encode,
  connectNostr,
  nip44ConversationKey,
  nip44Decrypt,
  nip44Encrypt,
  nip44PaddedLen,
  noteTemplate,
  parseBunkerUri,
  parseRelays,
  parseSecretKey,
  publicKeyOf,
  publishToNostr,
  signEvent,
  verifyEvent,
  type NostrEvent,
  type WsFactory,
  type WsLike,
} from "./nostr.ts";

// Official NIP-44 v2 test vectors (github.com/paulmillr/nip44, nip44.vectors.json).
const CONV = { sec1: "315e59ff51cb9209768cf7da80791ddcaae56ac9775eb25b6dee1234bc5d2268", pub2: "c2f9d9948dc8c7c38321e4b85c8558872eafa0641cd269db76848a6073e69133", key: "3dfef0ce2a4d80a25e7a328accf73448ef67096f65f79588e358d9a0eb9013f1" };
const ENC = {
  conversationKey: "c41c775356fd92eadc63ff5a0dc1da211b268cbea22316767095b2871ea1412d",
  nonce: "0000000000000000000000000000000000000000000000000000000000000001",
  plaintext: "a",
  payload: "AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABee0G5VSK0/9YypIObAtDKfYEAjD35uVkHyB0F4DwrcNaCXlCWZKaArsGrY6M9wnuTMxWfp1RTN9Xga8no+kF5Vsb",
};

// Test-only keys (not anyone's real identity).
const USER_SK = "0000000000000000000000000000000000000000000000000000000000000003";
const SIGNER_SK = "0000000000000000000000000000000000000000000000000000000000000004";

test("NIP-44 v2 matches the official vectors", () => {
  assert.equal(nip44ConversationKey(CONV.sec1, CONV.pub2).toString("hex"), CONV.key);
  const ck = Buffer.from(ENC.conversationKey, "hex");
  assert.equal(nip44Encrypt(ENC.plaintext, ck, Buffer.from(ENC.nonce, "hex")), ENC.payload);
  assert.equal(nip44Decrypt(ENC.payload, ck), "a");
  assert.deepEqual([16, 32, 33, 37, 45, 49, 64, 65, 100, 111, 200, 250, 320, 383, 384, 400, 500, 512, 515, 700, 800, 900, 1020, 65536].map(nip44PaddedLen), [32, 32, 64, 64, 64, 64, 64, 96, 128, 128, 224, 256, 320, 384, 384, 448, 512, 512, 640, 768, 896, 1024, 1024, 65536]);
  assert.throws(() => nip44Decrypt(ENC.payload.slice(0, -4) + "AAAA", ck), /MAC/);
});

test("NIP-19 keys: nsec / npub round trip, checksum errors are rejected", () => {
  const nsec = bech32Encode("nsec", USER_SK);
  assert.deepEqual(bech32Decode(nsec), { prefix: "nsec", hex: USER_SK });
  assert.equal(parseSecretKey(nsec), USER_SK);
  assert.equal(parseSecretKey(USER_SK.toUpperCase()), USER_SK);
  assert.equal(bech32Decode(nsec.slice(0, -1) + (nsec.endsWith("q") ? "p" : "q")), null);
  assert.equal(parseSecretKey("0".repeat(64)), null);
  // NIP-19 example: npub for pubkey 7e7e9c42...
  assert.equal(bech32Encode("npub", "7e7e9c42a91bfef19fa929e5fda1b72e0ebc1a4c1141673e2794234d86addf4e"), "npub10elfcs4fr0l0r8af98jlmgdh9c8tcxjvz9qkw038js35mp4dma8qzvjptg");
});

test("events: NIP-01 id, Schnorr signature, hashtags as t tags", () => {
  const e = signEvent(noteTemplate("Hello #Nostr and #poskoo", 1_700_000_000), USER_SK);
  assert.equal(e.pubkey, publicKeyOf(USER_SK));
  assert.deepEqual(e.tags, [["t", "nostr"], ["t", "poskoo"]]);
  assert.ok(verifyEvent(e));
  assert.ok(!verifyEvent({ ...e, content: "tampered" }));
});

test("relay and bunker inputs", () => {
  assert.deepEqual(parseRelays("wss://relay.damus.io, ws://insecure.example, wss://10.0.0.1, wss://nos.lol/"), ["wss://relay.damus.io", "wss://nos.lol"]);
  const pk = publicKeyOf(SIGNER_SK);
  assert.deepEqual(parseBunkerUri(`bunker://${pk}?relay=wss://relay.nsec.app&secret=abc`), { remotePubkey: pk, relays: ["wss://relay.nsec.app"], secret: "abc" });
  assert.equal(parseBunkerUri("bunker://nothex?relay=wss://a.b"), null);
});

/** A fake relay network: every socket shares one in-memory "relay" that stores and fans out events. */
function fakeNetwork(opts: { reject?: string[]; signer?: { sk: string; userSk: string } } = {}) {
  const subs = new Map<string, { ws: FakeWs; filter: Record<string, unknown> }>();
  const published: { url: string; event: NostrEvent }[] = [];
  class FakeWs implements WsLike {
    private handlers: Record<string, ((ev: { data?: unknown }) => void)[]> = {};
    constructor(private url: string) {
      setTimeout(() => this.emit("open", {}), 0);
    }
    addEventListener(type: string, fn: (ev: { data?: unknown }) => void) {
      (this.handlers[type] ??= []).push(fn);
    }
    emit(type: string, ev: { data?: unknown }) {
      for (const fn of this.handlers[type] ?? []) fn(ev);
    }
    reply(msg: unknown[]) {
      setTimeout(() => this.emit("message", { data: JSON.stringify(msg) }), 0);
    }
    close() {}
    send(data: string) {
      const msg = JSON.parse(data) as unknown[];
      if (msg[0] === "REQ") subs.set(String(msg[1]), { ws: this, filter: msg[2] as Record<string, unknown> });
      if (msg[0] !== "EVENT") return;
      const ev = msg[1] as NostrEvent;
      if (opts.reject?.includes(this.url)) return this.reply(["OK", ev.id, false, "blocked: test"]);
      published.push({ url: this.url, event: ev });
      this.reply(["OK", ev.id, true, ""]);
      if (ev.kind === 24133 && opts.signer) answerAsSigner(ev, opts.signer);
    }
  }
  function answerAsSigner(req: NostrEvent, signer: { sk: string; userSk: string }) {
    const ck = nip44ConversationKey(signer.sk, req.pubkey);
    const body = JSON.parse(nip44Decrypt(req.content, ck)) as { id: string; method: string; params: string[] };
    const result =
      body.method === "connect" ? "ack" : body.method === "get_public_key" ? publicKeyOf(signer.userSk) : JSON.stringify(signEvent(JSON.parse(body.params[0]) as NostrEvent, signer.userSk));
    const res = signEvent({ kind: 24133, created_at: Math.floor(Date.now() / 1000), tags: [["p", req.pubkey]], content: nip44Encrypt(JSON.stringify({ id: body.id, result }), ck) }, signer.sk);
    for (const [id, sub] of subs) {
      if ((sub.filter["#p"] as string[]).includes(req.pubkey)) sub.ws.reply(["EVENT", id, res]);
    }
  }
  const wsf: WsFactory = (url) => new FakeWs(url);
  return { wsf, published };
}

const account = (over: Partial<NetAccount>): NetAccount => ({
  id: "n1",
  platform: "nostr",
  externalId: "",
  username: null,
  accessToken: "",
  refreshToken: "",
  tokenExpiresAt: null,
  meta: {},
  secret: {},
  ...over,
});

test("nsec mode: signs locally; success once one relay accepts", async () => {
  const saved = await connectNostr({ key: bech32Encode("nsec", USER_SK), relays: "wss://a.example.com wss://b.example.com" });
  assert.equal(saved.externalId, publicKeyOf(USER_SK));
  const { wsf, published } = fakeNetwork({ reject: ["wss://a.example.com"] });
  const out = await publishToNostr({ account: account({ accessToken: saved.tokens.accessToken, meta: saved.meta ?? {} }), text: "gm #nostr", media: [], options: {} }, wsf);
  assert.ok(out.ok);
  assert.deepEqual(published.map((p) => p.url), ["wss://b.example.com"]);
  assert.ok(verifyEvent(published[0].event));
  const none = fakeNetwork({ reject: ["wss://a.example.com", "wss://b.example.com"] });
  const fail = await publishToNostr({ account: account({ accessToken: saved.tokens.accessToken, meta: saved.meta ?? {} }), text: "gm", media: [], options: {} }, none.wsf);
  assert.ok(!fail.ok && /No Nostr relay accepted/.test(fail.error));
});

test("bunker mode (NIP-46): Poskoo stores only its own client key; the signer signs each note", async () => {
  const net = fakeNetwork({ signer: { sk: SIGNER_SK, userSk: USER_SK } });
  const uri = `bunker://${publicKeyOf(SIGNER_SK)}?relay=wss://bunker.example.com`;
  const saved = await connectNostr({ key: uri, relays: "wss://out.example.com" }, net.wsf);
  assert.equal(saved.externalId, publicKeyOf(USER_SK));
  assert.notEqual(saved.tokens.accessToken, USER_SK);
  assert.equal(saved.meta?.mode, "bunker");
  const out = await publishToNostr({ account: account({ accessToken: saved.tokens.accessToken, meta: saved.meta ?? {} }), text: "scheduled hello", media: [], options: {} }, net.wsf);
  assert.ok(out.ok, !out.ok ? out.error : "");
  const note = net.published.find((p) => p.url === "wss://out.example.com")?.event;
  assert.equal(note?.pubkey, publicKeyOf(USER_SK));
  assert.equal(note?.content, "scheduled hello");
});

test("connect rejects an npub and media is refused", async () => {
  await assert.rejects(connectNostr({ key: bech32Encode("npub", publicKeyOf(USER_SK)) }), /public key/);
  const out = await publishToNostr({ account: account({ accessToken: USER_SK, meta: { mode: "nsec" } }), text: "x", media: [{ type: "image", url: "https://cdn/a.jpg" }], options: {} });
  assert.ok(!out.ok && /text only/.test(out.error));
});
