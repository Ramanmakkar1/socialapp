// Server only: Nostr. Kind-1 text notes (NIP-01) signed with BIP-340 Schnorr over secp256k1
// (@noble/curves), sent over WebSocket to the user's relays; a post counts as published once at
// least one relay answers OK. Two ways to sign:
//   - "bunker" (recommended): NIP-46 remote signing. The user's key stays in their signer app
//     (nsec.app, Amber, ...); Poskoo keeps only a throwaway client key and asks the signer to sign
//     each note over the bunker's relays, encrypted with NIP-44 v2.
//   - "nsec": the private key itself, stored encrypted like every other token. The Connect form
//     warns to use a dedicated key.
// Text only: Poskoo deletes its media copy after publishing, so image URLs in notes would break.
import { createCipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { schnorr, secp256k1 } from "@noble/curves/secp256k1.js";
import { NetworkAuthError, obj, str, type PublishInput, type PublishOutcome } from "@/lib/networks/common";
import { normalizeBaseUrl } from "@/lib/networks/http";
import type { SaveAccountInput } from "@/lib/networks/store";

export const NOSTR_DEFAULT_RELAYS = ["wss://relay.damus.io", "wss://nos.lol", "wss://relay.primal.net", "wss://relay.nostr.band"];
const NIP46_KIND = 24133;

const hex = (b: Uint8Array) => Buffer.from(b).toString("hex");
const unhex = (h: string) => new Uint8Array(Buffer.from(h, "hex"));
const isHex32 = (h: string) => /^[0-9a-f]{64}$/.test(h);

// ---- bech32 (NIP-19 npub / nsec) ------------------------------------------------------------------

const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
function polymod(values: number[]): number {
  const GEN = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const v of values) {
    const top = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ v;
    for (let i = 0; i < 5; i += 1) if ((top >>> i) & 1) chk ^= GEN[i];
  }
  return chk >>> 0;
}
const hrpExpand = (hrp: string) => [...[...hrp].map((c) => c.charCodeAt(0) >> 5), 0, ...[...hrp].map((c) => c.charCodeAt(0) & 31)];
function convertBits(data: number[], from: number, to: number, pad: boolean): number[] | null {
  let acc = 0;
  let bits = 0;
  const out: number[] = [];
  const max = (1 << to) - 1;
  for (const v of data) {
    acc = (acc << from) | v;
    bits += from;
    while (bits >= to) {
      bits -= to;
      out.push((acc >> bits) & max);
    }
  }
  if (pad) {
    if (bits > 0) out.push((acc << (to - bits)) & max);
  } else if (bits >= from || ((acc << (to - bits)) & max)) return null;
  return out;
}

/** "nsec1..." / "npub1..." -> { prefix, 32 bytes hex }, or null when the checksum fails. */
export function bech32Decode(input: string): { prefix: string; hex: string } | null {
  const s = input.trim().toLowerCase();
  const pos = s.lastIndexOf("1");
  if (pos < 1 || s.length > 200) return null;
  const prefix = s.slice(0, pos);
  const data = [...s.slice(pos + 1)].map((c) => CHARSET.indexOf(c));
  if (data.length < 6 || data.some((d) => d < 0)) return null;
  if (polymod([...hrpExpand(prefix), ...data]) !== 1) return null;
  const bytes = convertBits(data.slice(0, -6), 5, 8, false);
  if (!bytes || bytes.length !== 32) return null;
  return { prefix, hex: Buffer.from(bytes).toString("hex") };
}

export function bech32Encode(prefix: string, hex32: string): string {
  const data = convertBits([...Buffer.from(hex32, "hex")], 8, 5, true) ?? [];
  const mod = polymod([...hrpExpand(prefix), ...data, 0, 0, 0, 0, 0, 0]) ^ 1;
  const checksum = Array.from({ length: 6 }, (_, i) => (mod >>> (5 * (5 - i))) & 31);
  return `${prefix}1${[...data, ...checksum].map((d) => CHARSET[d]).join("")}`;
}

/** A private key typed as nsec1... or 64 hex characters -> hex, or null. */
export function parseSecretKey(input: string): string | null {
  const raw = input.trim();
  const key = raw.startsWith("nsec1") ? bech32Decode(raw)?.hex ?? "" : raw.toLowerCase();
  return isHex32(key) && secp256k1.utils.isValidSecretKey(unhex(key)) ? key : null;
}

export function publicKeyOf(secretHex: string): string {
  return hex(schnorr.getPublicKey(unhex(secretHex)));
}

// ---- Events (NIP-01) ------------------------------------------------------------------------------

export type NostrEvent = { id: string; pubkey: string; created_at: number; kind: number; tags: string[][]; content: string; sig: string };
export type UnsignedEvent = Omit<NostrEvent, "id" | "sig" | "pubkey">;

export function eventId(e: Omit<NostrEvent, "id" | "sig">): string {
  return createHash("sha256").update(JSON.stringify([0, e.pubkey, e.created_at, e.kind, e.tags, e.content])).digest("hex");
}

export function signEvent(e: UnsignedEvent, secretHex: string): NostrEvent {
  const withKey = { ...e, pubkey: publicKeyOf(secretHex) };
  const id = eventId(withKey);
  return { ...withKey, id, sig: hex(schnorr.sign(unhex(id), unhex(secretHex))) };
}

export function verifyEvent(e: NostrEvent): boolean {
  try {
    return isHex32(e.pubkey) && eventId(e) === e.id && schnorr.verify(unhex(e.sig), unhex(e.id), unhex(e.pubkey));
  } catch {
    return false;
  }
}

/** Kind-1 note; #hashtags become "t" tags so they are searchable. */
export function noteTemplate(text: string, nowSec = Math.floor(Date.now() / 1000)): UnsignedEvent {
  const tags = [...new Set([...text.matchAll(/(?:^|\s)#([\p{L}\p{N}_]{1,64})/gu)].map((m) => m[1].toLowerCase()))].map((t) => ["t", t]);
  return { kind: 1, created_at: nowSec, tags, content: text };
}

// ---- NIP-44 v2 encryption (NIP-46 messages) --------------------------------------------------------

function hkdfExpand(prk: Buffer, info: Buffer, length: number): Buffer {
  const out: Buffer[] = [];
  let prev = Buffer.alloc(0);
  for (let i = 1; Buffer.concat(out).length < length; i += 1) {
    prev = createHmac("sha256", prk).update(Buffer.concat([prev, info, Buffer.from([i])])).digest();
    out.push(prev);
  }
  return Buffer.concat(out).subarray(0, length);
}

export function nip44ConversationKey(secretHex: string, pubHex: string): Buffer {
  const shared = secp256k1.getSharedSecret(unhex(secretHex), unhex(`02${pubHex}`)).subarray(1, 33);
  return createHmac("sha256", "nip44-v2").update(shared).digest();
}

export function nip44PaddedLen(len: number): number {
  if (len <= 32) return 32;
  const nextPower = 1 << (Math.floor(Math.log2(len - 1)) + 1);
  const chunk = nextPower <= 256 ? 32 : nextPower / 8;
  return chunk * (Math.floor((len - 1) / chunk) + 1);
}

function messageKeys(conversationKey: Buffer, nonce: Buffer) {
  const k = hkdfExpand(conversationKey, nonce, 76);
  return { chachaKey: k.subarray(0, 32), chachaNonce: k.subarray(32, 44), hmacKey: k.subarray(44, 76) };
}

function chacha20(key: Buffer, nonce12: Buffer, data: Buffer): Buffer {
  // OpenSSL's chacha20 IV = 32-bit little-endian block counter (0) + 96-bit nonce.
  const c = createCipheriv("chacha20", key, Buffer.concat([Buffer.alloc(4), nonce12]));
  return Buffer.concat([c.update(data), c.final()]);
}

export function nip44Encrypt(plaintext: string, conversationKey: Buffer, nonce: Buffer = randomBytes(32)): string {
  const raw = Buffer.from(plaintext, "utf8");
  if (raw.length < 1 || raw.length > 65535) throw new Error("nip44: invalid plaintext length");
  const padded = Buffer.alloc(2 + nip44PaddedLen(raw.length));
  padded.writeUInt16BE(raw.length, 0);
  raw.copy(padded, 2);
  const { chachaKey, chachaNonce, hmacKey } = messageKeys(conversationKey, nonce);
  const ciphertext = chacha20(chachaKey, chachaNonce, padded);
  const mac = createHmac("sha256", hmacKey).update(Buffer.concat([nonce, ciphertext])).digest();
  return Buffer.concat([Buffer.from([2]), nonce, ciphertext, mac]).toString("base64");
}

export function nip44Decrypt(payload: string, conversationKey: Buffer): string {
  const data = Buffer.from(payload, "base64");
  if (data.length < 99 || data[0] !== 2) throw new Error("nip44: unknown version or bad length");
  const nonce = data.subarray(1, 33);
  const ciphertext = data.subarray(33, data.length - 32);
  const mac = data.subarray(data.length - 32);
  const { chachaKey, chachaNonce, hmacKey } = messageKeys(conversationKey, nonce);
  const expected = createHmac("sha256", hmacKey).update(Buffer.concat([nonce, ciphertext])).digest();
  if (!timingSafeEqual(expected, mac)) throw new Error("nip44: invalid MAC");
  const padded = chacha20(chachaKey, chachaNonce, ciphertext);
  const len = padded.readUInt16BE(0);
  if (len < 1 || 2 + len > padded.length || padded.length !== 2 + nip44PaddedLen(len)) throw new Error("nip44: invalid padding");
  return padded.subarray(2, 2 + len).toString("utf8");
}

// ---- Relays ---------------------------------------------------------------------------------------

/** The bits of the WebSocket API we use (a test fake implements the same). */
export type WsLike = {
  send(data: string): void;
  close(): void;
  addEventListener(type: "open" | "message" | "error" | "close", listener: (ev: { data?: unknown }) => void): void;
};
export type WsFactory = (url: string) => WsLike;
const defaultWs: WsFactory = (url) => new WebSocket(url) as unknown as WsLike;

/** "wss://relay.example.com" only: public host names, no ports or private names (normalizeBaseUrl rules). */
export function normalizeRelay(input: string): string | null {
  const raw = input.trim();
  if (!/^wss:\/\//i.test(raw)) return null;
  const base = normalizeBaseUrl(raw.replace(/^wss:/i, "https:"));
  return base ? base.replace(/^https:/, "wss:") : null;
}

export function parseRelays(input: string): string[] {
  return [...new Set(input.split(/[\s,]+/).map(normalizeRelay).filter((r): r is string => r !== null))].slice(0, 10);
}

class Relay {
  private listeners = new Set<(msg: unknown[]) => void>();
  private closed = false;
  private constructor(private ws: WsLike) {
    ws.addEventListener("message", (ev) => {
      let msg: unknown;
      try {
        msg = JSON.parse(String(ev.data));
      } catch {
        return;
      }
      if (Array.isArray(msg)) for (const l of [...this.listeners]) l(msg);
    });
    ws.addEventListener("close", () => {
      this.closed = true;
      for (const l of [...this.listeners]) l(["__closed"]);
    });
  }

  static open(url: string, wsf: WsFactory, timeoutMs: number): Promise<Relay> {
    return new Promise((resolve, reject) => {
      let ws: WsLike;
      try {
        ws = wsf(url);
      } catch (err) {
        reject(err);
        return;
      }
      const timer = setTimeout(() => {
        ws.close();
        reject(new Error(`${url}: timeout`));
      }, timeoutMs);
      ws.addEventListener("open", () => {
        clearTimeout(timer);
        resolve(new Relay(ws));
      });
      ws.addEventListener("error", () => {
        clearTimeout(timer);
        reject(new Error(`${url}: connection failed`));
      });
    });
  }

  send(msg: unknown[]) {
    if (!this.closed) this.ws.send(JSON.stringify(msg));
  }

  /** Resolves with the first message `pick` accepts; rejects on timeout or when the relay closes. */
  waitFor<T>(pick: (msg: unknown[]) => T | undefined, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const done = () => {
        clearTimeout(timer);
        this.listeners.delete(listener);
      };
      const listener = (msg: unknown[]) => {
        if (msg[0] === "__closed") {
          done();
          reject(new Error("relay closed"));
          return;
        }
        const v = pick(msg);
        if (v !== undefined) {
          done();
          resolve(v);
        }
      };
      const timer = setTimeout(() => {
        this.listeners.delete(listener);
        reject(new Error("timeout"));
      }, timeoutMs);
      this.listeners.add(listener);
    });
  }

  close() {
    this.closed = true;
    try {
      this.ws.close();
    } catch {
      // already closed
    }
  }
}

export type RelayResult = { accepted: string[]; rejected: string[] };

/** ["EVENT", e] to every relay at once; OK answers within the timeout count. */
export async function publishToRelays(event: NostrEvent, relays: string[], wsf: WsFactory = defaultWs, timeoutMs = 10_000): Promise<RelayResult> {
  const out: RelayResult = { accepted: [], rejected: [] };
  await Promise.all(
    relays.map(async (url) => {
      let relay: Relay | null = null;
      try {
        relay = await Relay.open(url, wsf, timeoutMs);
        const answer = relay.waitFor((m) => (m[0] === "OK" && m[1] === event.id ? { ok: m[2] === true, reason: str(m[3]) } : undefined), timeoutMs);
        relay.send(["EVENT", event]);
        const r = await answer;
        // "duplicate:" means the relay already has it: that is a success too.
        if (r.ok || r.reason.startsWith("duplicate:")) out.accepted.push(url);
        else out.rejected.push(`${url} (${r.reason || "rejected"})`);
      } catch (err) {
        out.rejected.push(`${url} (${err instanceof Error ? err.message.replace(`${url}: `, "") : "error"})`);
      } finally {
        relay?.close();
      }
    }),
  );
  return out;
}

// ---- NIP-46 remote signing ------------------------------------------------------------------------

export type Bunker = { remotePubkey: string; relays: string[]; secret: string | null };

/** bunker://<remote-signer-pubkey>?relay=wss://...&secret=... */
export function parseBunkerUri(input: string): Bunker | null {
  const raw = input.trim();
  if (!raw.startsWith("bunker://")) return null;
  try {
    const u = new URL(raw.replace(/^bunker:\/\//, "https://bunker.invalid/"));
    const remotePubkey = u.pathname.replace(/^\//, "").toLowerCase();
    const relays = [...new Set(u.searchParams.getAll("relay").map(normalizeRelay).filter((r): r is string => r !== null))].slice(0, 5);
    if (!isHex32(remotePubkey) || relays.length === 0) return null;
    return { remotePubkey, relays, secret: u.searchParams.get("secret") };
  } catch {
    return null;
  }
}

export type BunkerSession = { clientSecret: string; remotePubkey: string; relays: string[] };

/** One NIP-46 request/response (first relay that answers wins). Throws NetworkAuthError. */
export async function bunkerRequest(session: BunkerSession, method: string, params: string[], wsf: WsFactory = defaultWs, timeoutMs = 45_000): Promise<string> {
  const clientPub = publicKeyOf(session.clientSecret);
  const ck = nip44ConversationKey(session.clientSecret, session.remotePubkey);
  const id = randomBytes(8).toString("hex");
  const request = signEvent(
    { kind: NIP46_KIND, created_at: Math.floor(Date.now() / 1000), tags: [["p", session.remotePubkey]], content: nip44Encrypt(JSON.stringify({ id, method, params }), ck) },
    session.clientSecret,
  );
  const attempts = session.relays.map(async (url) => {
    const relay = await Relay.open(url, wsf, 10_000);
    try {
      const sub = `p${id}`;
      const reply = relay.waitFor((m) => {
        if (m[0] !== "EVENT" || m[1] !== sub) return undefined;
        const ev = m[2] as NostrEvent;
        if (!ev || ev.pubkey !== session.remotePubkey || !verifyEvent(ev)) return undefined;
        try {
          const body = obj(JSON.parse(nip44Decrypt(ev.content, ck)));
          // auth_url challenges: keep waiting, the user may approve in the signer meanwhile.
          if (body.id !== id || body.result === "auth_url") return undefined;
          return body;
        } catch {
          return undefined;
        }
      }, timeoutMs);
      relay.send(["REQ", sub, { kinds: [NIP46_KIND], "#p": [clientPub], since: request.created_at - 10 }]);
      relay.send(["EVENT", request]);
      return await reply;
    } finally {
      relay.close();
    }
  });
  let body: Record<string, unknown>;
  try {
    body = await Promise.any(attempts);
  } catch {
    throw new NetworkAuthError("signer_unreachable", "Your Nostr signer didn't answer. Open your signer app (it must be online), approve Poskoo, then try again.");
  }
  if (str(body.error)) throw new NetworkAuthError("signer_refused", `Your Nostr signer refused: ${str(body.error).slice(0, 200)}`, method === "connect");
  return str(body.result);
}

// ---- Connect / publish ----------------------------------------------------------------------------

type Fields = Record<string, string>;

const npubShort = (pubHex: string) => {
  const npub = bech32Encode("npub", pubHex);
  return `${npub.slice(0, 12)}…${npub.slice(-6)}`;
};

export async function connectNostr(f: Fields, wsf: WsFactory = defaultWs): Promise<SaveAccountInput> {
  const key = (f.key ?? "").trim();
  const extra = parseRelays(f.relays ?? "");
  const relays = extra.length > 0 ? extra : NOSTR_DEFAULT_RELAYS;
  if ((f.relays ?? "").trim() && extra.length === 0) throw new NetworkAuthError("bad_login", "Relays must be wss:// addresses, e.g. wss://relay.damus.io.");
  const bunker = parseBunkerUri(key);
  if (bunker) {
    const session = { clientSecret: hex(schnorr.utils.randomSecretKey()), remotePubkey: bunker.remotePubkey, relays: bunker.relays };
    const ack = await bunkerRequest(session, "connect", [bunker.remotePubkey, bunker.secret ?? "", "sign_event:1"], wsf);
    if (ack !== "ack" && ack !== (bunker.secret ?? "")) throw new NetworkAuthError("signer_refused", "Your Nostr signer didn't accept the connection.");
    const pubkey = (await bunkerRequest(session, "get_public_key", [], wsf)).toLowerCase();
    if (!isHex32(pubkey)) throw new NetworkAuthError("signer_refused", "Your Nostr signer didn't share your public key.");
    return {
      externalId: pubkey,
      username: npubShort(pubkey),
      // The throwaway client key (not the user's key) is what Poskoo stores.
      tokens: { accessToken: session.clientSecret },
      scopes: ["nip46"],
      meta: { mode: "bunker", pubkey, relays, remotePubkey: bunker.remotePubkey, bunkerRelays: bunker.relays },
    };
  }
  if (key.startsWith("npub1")) throw new NetworkAuthError("bad_login", "That's your public key (npub). Poskoo needs a bunker:// link from your signer app, or a private key (nsec).");
  const secretHex = parseSecretKey(key);
  if (!secretHex) throw new NetworkAuthError("bad_login", "Paste a bunker:// link from your signer app, or a private key starting with nsec1.");
  const pubkey = publicKeyOf(secretHex);
  return { externalId: pubkey, username: npubShort(pubkey), tokens: { accessToken: secretHex }, scopes: ["nsec"], meta: { mode: "nsec", pubkey, relays } };
}

export async function publishToNostr(input: PublishInput, wsf: WsFactory = defaultWs): Promise<PublishOutcome> {
  if (input.media.length > 0) return { ok: false, error: "Nostr posts from Poskoo are text only. Remove the media or untick Nostr." };
  const meta = input.account.meta;
  const pubkey = str(meta.pubkey);
  const relays = Array.isArray(meta.relays) ? (meta.relays as unknown[]).map(String) : NOSTR_DEFAULT_RELAYS;
  const template = noteTemplate(input.text.trim());
  let event: NostrEvent;
  if (meta.mode === "bunker") {
    const session = {
      clientSecret: input.account.accessToken,
      remotePubkey: str(meta.remotePubkey),
      relays: Array.isArray(meta.bunkerRelays) ? (meta.bunkerRelays as unknown[]).map(String) : [],
    };
    try {
      const signed = await bunkerRequest(session, "sign_event", [JSON.stringify({ ...template, pubkey })], wsf);
      event = JSON.parse(signed) as NostrEvent;
    } catch (err) {
      const dead = err instanceof NetworkAuthError && err.reason === "signer_refused";
      return { ok: false, error: err instanceof Error ? err.message : "Nostr signer error", tokenDead: dead };
    }
    if (!verifyEvent(event) || event.pubkey !== pubkey || event.content !== template.content) {
      return { ok: false, error: "Your Nostr signer returned an invalid signature." };
    }
  } else {
    const secretHex = input.account.accessToken;
    if (!isHex32(secretHex)) return { ok: false, error: "This Nostr key is unreadable. Reconnect Nostr in Settings.", tokenDead: true };
    event = signEvent(template, secretHex);
  }
  const r = await publishToRelays(event, relays, wsf);
  if (r.accepted.length === 0) return { ok: false, error: `No Nostr relay accepted the note: ${r.rejected.join(", ").slice(0, 400)}` };
  return { ok: true, id: event.id, url: `https://njump.me/${bech32Encode("note", event.id)}` };
}
