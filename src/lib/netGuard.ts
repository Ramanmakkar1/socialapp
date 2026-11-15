// Server only: SSRF guard for every request to a user-supplied host (self-hosted Mastodon, Misskey,
// Ghost, WordPress, Matrix, Mattermost, Bluesky PDS, Nostr relays, and media URLs from posts).
//
// The connect forms already refuse IP literals, ports and localhost / .local names by string rules
// (normalizeBaseUrl / normalizeInstance). That does not stop "evil.example" from resolving to
// 127.0.0.1, 10.x or 169.254.169.254. This module resolves the host (A + AAAA), refuses the request
// when ANY address is private / loopback / link-local / reserved, and then connects to exactly the
// address it checked (no second DNS lookup, so DNS rebinding can't swap in an internal IP between
// the check and the connect). Redirects are followed by hand and every hop is checked again.
//
// No dependencies: Node's global fetch only takes a custom DNS lookup through an undici dispatcher,
// and undici isn't a dependency, so safeFetch sends with node:http / node:https and a pinned lookup.
import { lookup as dnsLookup } from "node:dns/promises";
import http from "node:http";
import https from "node:https";
import { isIP, type LookupFunction } from "node:net";
import { Readable } from "node:stream";
import zlib from "node:zlib";

export const BLOCKED_HOST_MESSAGE = "That server address isn't reachable from Poskoo. Use the server's public address.";

/** Thrown when a host resolves (or is) a private / internal address. `message` is safe to show. */
export class BlockedHostError extends Error {
  readonly host: string;
  constructor(host: string, message = BLOCKED_HOST_MESSAGE) {
    super(message);
    this.name = "BlockedHostError";
    this.host = host;
  }
}

export type ResolvedAddress = { address: string; family: 4 | 6 };
/** Every A / AAAA address for a host name. Injectable so tests never touch real DNS. */
export type Resolver = (host: string) => Promise<ResolvedAddress[]>;

export const systemResolver: Resolver = async (host) => {
  const rows = await dnsLookup(host, { all: true, verbatim: true });
  return rows.map((r) => ({ address: r.address, family: r.family === 6 ? 6 : 4 }));
};

// ---- Address ranges -------------------------------------------------------------------------------

function v4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p) || Number(p) > 255) return null;
    n = n * 256 + Number(p);
  }
  return n;
}

// [network, prefix length]
const BLOCKED_V4: [string, number][] = [
  ["0.0.0.0", 8], // "this network" / unspecified
  ["10.0.0.0", 8], // private
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8], // loopback
  ["169.254.0.0", 16], // link-local, incl. cloud metadata 169.254.169.254
  ["172.16.0.0", 12], // private
  ["192.0.0.0", 24], // IETF protocol assignments
  ["192.0.2.0", 24], // documentation
  ["192.88.99.0", 24], // 6to4 relay anycast (deprecated)
  ["192.168.0.0", 16], // private
  ["198.18.0.0", 15], // benchmarking
  ["198.51.100.0", 24], // documentation
  ["203.0.113.0", 24], // documentation
  ["224.0.0.0", 4], // multicast
  ["240.0.0.0", 4], // reserved + broadcast
];
const BLOCKED_V4_INT = BLOCKED_V4.map(([net, bits]) => {
  const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
  return { net: (v4ToInt(net)! & mask) >>> 0, mask };
});

function blockedV4Int(n: number): boolean {
  return BLOCKED_V4_INT.some(({ net, mask }) => ((n & mask) >>> 0) === net);
}

/** "fe80::1%en0" / "::ffff:1.2.3.4" -> eight 16-bit groups, or null. */
function v6Groups(ip: string): number[] | null {
  let s = ip.toLowerCase().replace(/^\[|\]$/g, "").replace(/%.*$/, "");
  // A trailing dotted IPv4 becomes two hex groups.
  const dotted = s.match(/^(.*:)(\d+\.\d+\.\d+\.\d+)$/);
  if (dotted) {
    const n = v4ToInt(dotted[2]);
    if (n === null) return null;
    s = `${dotted[1]}${(n >>> 16).toString(16)}:${(n & 0xffff).toString(16)}`;
  }
  const halves = s.split("::");
  if (halves.length > 2) return null;
  const parse = (part: string) => (part === "" ? [] : part.split(":"));
  const head = parse(halves[0]);
  const tail = halves.length === 2 ? parse(halves[1]) : [];
  const fill = 8 - head.length - tail.length;
  if (halves.length === 2 ? fill < 1 : fill !== 0) return null;
  const all = [...head, ...Array<string>(halves.length === 2 ? fill : 0).fill("0"), ...tail];
  const out: number[] = [];
  for (const g of all) {
    if (!/^[0-9a-f]{1,4}$/.test(g)) return null;
    out.push(parseInt(g, 16));
  }
  return out.length === 8 ? out : null;
}

function blockedV6(g: number[]): boolean {
  const v4At = (hi: number, lo: number) => ((g[hi] << 16) >>> 0) + g[lo];
  const zeroUpTo = (n: number) => g.slice(0, n).every((x) => x === 0);
  if (zeroUpTo(8)) return true; // :: unspecified
  if (zeroUpTo(7) && g[7] === 1) return true; // ::1 loopback
  if (zeroUpTo(5) && g[5] === 0xffff) return blockedV4Int(v4At(6, 7)); // ::ffff:a.b.c.d IPv4-mapped
  if (zeroUpTo(4) && g[4] === 0xffff && g[5] === 0) return true; // ::ffff:0:a.b.c.d IPv4-translated
  if (zeroUpTo(6)) return true; // ::a.b.c.d IPv4-compatible (deprecated): never a real public server
  if (g[0] === 0x64 && g[1] === 0xff9b && g[2] === 0 && g[3] === 0 && g[4] === 0 && g[5] === 0) return blockedV4Int(v4At(6, 7)); // NAT64 64:ff9b::/96
  if (g[0] === 0x64 && g[1] === 0xff9b && g[2] === 1) return true; // 64:ff9b:1::/48 local-use NAT64
  if (g[0] === 0x2002) return blockedV4Int(v4At(1, 2)); // 6to4 2002:a.b.c.d::/48
  if (g[0] === 0x2001 && g[1] === 0) return true; // Teredo 2001::/32 (embedded address is obfuscated)
  if (g[0] === 0x2001 && g[1] === 0x0db8) return true; // documentation 2001:db8::/32
  if (g[0] === 0x0100 && g[1] === 0 && g[2] === 0 && g[3] === 0) return true; // discard 100::/64
  if ((g[0] & 0xfe00) === 0xfc00) return true; // unique-local fc00::/7
  if ((g[0] & 0xffc0) === 0xfe80) return true; // link-local fe80::/10
  if ((g[0] & 0xffc0) === 0xfec0) return true; // site-local fec0::/10 (deprecated)
  if ((g[0] & 0xff00) === 0xff00) return true; // multicast ff00::/8
  return false;
}

/** True when an IP address must never be fetched from the server. Anything unparsable is blocked. */
export function isBlockedAddress(ip: string): boolean {
  const bare = ip.replace(/^\[|\]$/g, "");
  const kind = isIP(bare.replace(/%.*$/, ""));
  if (kind === 4) {
    const n = v4ToInt(bare);
    return n === null || blockedV4Int(n);
  }
  if (kind === 6) {
    const g = v6Groups(bare);
    return g === null || blockedV6(g);
  }
  return true;
}

// ---- Host checks ----------------------------------------------------------------------------------

/**
 * Resolve a host and return the address to connect to. Throws BlockedHostError when the host is
 * (or resolves to ANY) internal address, or does not resolve at all. IP literals are checked as is.
 */
export async function resolvePublicHost(hostname: string, resolver: Resolver = systemResolver): Promise<ResolvedAddress> {
  const host = hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
  if (host === "" || host === "localhost" || host.endsWith(".localhost")) throw new BlockedHostError(hostname);
  const literal = isIP(host);
  if (literal) {
    if (isBlockedAddress(host)) throw new BlockedHostError(hostname);
    return { address: host, family: literal === 6 ? 6 : 4 };
  }
  let addresses: ResolvedAddress[];
  try {
    addresses = await resolver(host);
  } catch {
    throw new BlockedHostError(hostname, `Couldn't find the server ${hostname}. Check the address.`);
  }
  if (addresses.length === 0) throw new BlockedHostError(hostname, `Couldn't find the server ${hostname}. Check the address.`);
  if (addresses.some((a) => isBlockedAddress(a.address))) throw new BlockedHostError(hostname);
  return addresses[0];
}

/** resolvePublicHost for a full URL (http, https, ws or wss only). */
export async function assertPublicUrl(url: string | URL, resolver: Resolver = systemResolver): Promise<ResolvedAddress> {
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new BlockedHostError(String(url), "That server address isn't a valid URL.");
  }
  if (!["http:", "https:", "ws:", "wss:"].includes(u.protocol)) throw new BlockedHostError(u.hostname || String(url));
  return resolvePublicHost(u.hostname, resolver);
}

// ---- Pinned fetch ---------------------------------------------------------------------------------

export type SendInit = { method: string; headers: Headers; body: Buffer | null; signal: AbortSignal | null };
/** Sends one request to `url`, connecting to the already-checked `pinned` address. */
export type Sender = (url: URL, pinned: ResolvedAddress, init: SendInit) => Promise<Response>;

const NULL_BODY = new Set([101, 103, 204, 205, 304]);

function decode(stream: Readable, encoding: string): Readable {
  switch (encoding) {
    case "gzip":
    case "x-gzip":
      return stream.pipe(zlib.createGunzip());
    case "deflate":
      return stream.pipe(zlib.createInflate());
    case "br":
      return stream.pipe(zlib.createBrotliDecompress());
    default:
      return stream;
  }
}

/** The real sender: node:http(s) with a lookup that always answers the pinned address. */
export const nodeSender: Sender = (url, pinned, init) =>
  new Promise<Response>((resolve, reject) => {
    const lookup: LookupFunction = (_host, options, cb) => {
      if (options && options.all) (cb as unknown as (e: null, a: { address: string; family: number }[]) => void)(null, [pinned]);
      else cb(null, pinned.address, pinned.family);
    };
    const headers: Record<string, string> = {};
    init.headers.forEach((v, k) => {
      headers[k] = v;
    });
    if (!headers["accept-encoding"]) headers["accept-encoding"] = "gzip, deflate, br";
    if (init.body) headers["content-length"] = String(init.body.length);
    const mod = url.protocol === "https:" ? https : http;
    const req = mod.request(
      {
        protocol: url.protocol,
        hostname: url.hostname.replace(/^\[|\]$/g, ""),
        port: url.port || undefined,
        path: `${url.pathname}${url.search}`,
        method: init.method,
        headers,
        lookup,
        servername: isIP(url.hostname.replace(/^\[|\]$/g, "")) ? undefined : url.hostname,
        signal: init.signal ?? undefined,
        agent: false,
      },
      (res) => {
        const status = res.statusCode ?? 0;
        const out = new Headers();
        for (const [k, v] of Object.entries(res.headers)) {
          if (v === undefined) continue;
          for (const one of Array.isArray(v) ? v : [v]) out.append(k, one);
        }
        let body: ReadableStream<Uint8Array> | null = null;
        if (NULL_BODY.has(status) || init.method === "HEAD") {
          res.resume();
        } else {
          const encoding = (res.headers["content-encoding"] ?? "").toString().trim().toLowerCase();
          const stream = decode(res, encoding);
          if (stream !== res) {
            out.delete("content-encoding");
            out.delete("content-length");
            res.on("error", (e) => stream.destroy(e));
          }
          body = Readable.toWeb(stream) as unknown as ReadableStream<Uint8Array>;
        }
        try {
          resolve(new Response(body, { status, statusText: res.statusMessage, headers: out }));
        } catch (err) {
          res.destroy();
          reject(err);
        }
      },
    );
    req.on("error", reject);
    req.end(init.body ?? undefined);
  });

export type SafeFetchOptions = { resolver?: Resolver; send?: Sender; maxRedirects?: number };

const REDIRECT = new Set([301, 302, 303, 307, 308]);

/**
 * A drop-in `fetch` for user-supplied hosts: every hop's host is resolved and checked, the connect is
 * pinned to the checked address, and redirects (redirect: "follow", the default) are followed by
 * hand so a redirect to an internal host is refused too. "error" and "manual" behave like fetch.
 */
export function createSafeFetch(opts: SafeFetchOptions = {}): typeof fetch {
  const resolver = opts.resolver ?? systemResolver;
  const send = opts.send ?? nodeSender;
  const maxRedirects = opts.maxRedirects ?? 5;
  return (async (input: string | URL | Request, init?: RequestInit) => {
    const req = new Request(input, init);
    const mode = init?.redirect ?? (input instanceof Request ? input.redirect : "follow");
    const signal = init?.signal ?? (input instanceof Request ? input.signal : null);
    let url = new URL(req.url);
    let method = req.method;
    const headers = new Headers(req.headers);
    let body: Buffer | null = req.body ? Buffer.from(await req.arrayBuffer()) : null;
    for (let hop = 0; ; hop++) {
      if (url.protocol !== "https:" && url.protocol !== "http:") throw new BlockedHostError(url.hostname || url.href);
      signal?.throwIfAborted();
      const pinned = await resolvePublicHost(url.hostname, resolver);
      const res = await send(url, pinned, { method, headers, body, signal });
      const location = res.headers.get("location");
      if (!REDIRECT.has(res.status) || !location || mode === "manual") return res;
      await res.body?.cancel().catch(() => undefined);
      if (mode === "error") throw new TypeError(`fetch failed: redirect to ${location} not allowed`);
      if (hop >= maxRedirects) throw new TypeError("fetch failed: too many redirects");
      const next = new URL(location, url);
      if (res.status === 303 || ((res.status === 301 || res.status === 302) && method === "POST")) {
        if (method !== "HEAD") method = "GET";
        body = null;
        for (const h of ["content-type", "content-length", "content-encoding", "content-language", "content-location"]) headers.delete(h);
      }
      if (next.origin !== url.origin) {
        // Like fetch: credentials never follow a redirect to another origin.
        headers.delete("authorization");
        headers.delete("cookie");
        headers.delete("proxy-authorization");
      }
      url = next;
    }
  }) as typeof fetch;
}

/** The fetch every user-supplied-host network uses by default (real DNS, pinned connects). */
export const safeFetch: typeof fetch = createSafeFetch();
