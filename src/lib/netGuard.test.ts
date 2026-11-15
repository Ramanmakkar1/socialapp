import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { test } from "node:test";
import { gzipSync } from "node:zlib";
import { BlockedHostError, assertPublicUrl, createSafeFetch, isBlockedAddress, nodeSender, resolvePublicHost, type ResolvedAddress, type Resolver, type Sender } from "@/lib/netGuard";

/** Fake DNS: host -> addresses (never touches real DNS). */
function fakeDns(map: Record<string, string[]>): Resolver {
  return async (host) => {
    const list = map[host];
    if (!list) throw Object.assign(new Error(`getaddrinfo ENOTFOUND ${host}`), { code: "ENOTFOUND" });
    return list.map((address) => ({ address, family: address.includes(":") ? 6 : 4 }));
  };
}

const BLOCKED = [
  "0.0.0.0",
  "0.1.2.3",
  "10.0.0.1",
  "10.255.255.255",
  "100.64.0.1",
  "100.127.255.254",
  "127.0.0.1",
  "127.8.9.10",
  "169.254.169.254", // cloud metadata
  "169.254.0.1",
  "172.16.0.1",
  "172.31.255.255",
  "192.0.0.8",
  "192.0.2.1",
  "192.168.1.1",
  "198.18.0.1",
  "198.19.255.255",
  "198.51.100.7",
  "203.0.113.9",
  "224.0.0.1",
  "239.255.255.250",
  "240.0.0.1",
  "255.255.255.255",
  "::",
  "::1",
  "[::1]",
  "fe80::1",
  "fe80::1%en0",
  "febf::1",
  "fc00::1",
  "fd12:3456:789a::1",
  "ff02::1",
  "::ffff:127.0.0.1", // IPv4-mapped loopback
  "::ffff:7f00:1", // same, hex form
  "::ffff:169.254.169.254", // IPv4-mapped metadata
  "::ffff:10.0.0.1",
  "0:0:0:0:0:ffff:192.168.0.1",
  "64:ff9b::10.0.0.1", // NAT64 of a private address
  "64:ff9b::a9fe:a9fe", // NAT64 of 169.254.169.254
  "2002:7f00:1::1", // 6to4 of 127.0.0.1
  "2002:c0a8:0101::", // 6to4 of 192.168.1.1
  "::127.0.0.1", // IPv4-compatible
  "2001:db8::1",
  "2001::1", // Teredo
  "not-an-ip",
];

const ALLOWED = ["1.1.1.1", "8.8.8.8", "93.184.216.34", "172.32.0.1", "100.128.0.1", "169.255.0.1", "2606:4700:4700::1111", "2a00:1450:4001::200e", "::ffff:8.8.8.8", "64:ff9b::8.8.8.8", "2002:0808:0808::1"];

test("isBlockedAddress: every internal / reserved range is blocked", () => {
  for (const ip of BLOCKED) assert.equal(isBlockedAddress(ip), true, ip);
});

test("isBlockedAddress: public addresses are allowed", () => {
  for (const ip of ALLOWED) assert.equal(isBlockedAddress(ip), false, ip);
});

test("resolvePublicHost: a host name that resolves to a private IP is refused", async () => {
  const dns = fakeDns({ "evil.example": ["10.0.0.5"], "meta.example": ["169.254.169.254"], "mapped.example": ["::ffff:127.0.0.1"], "lo6.example": ["::1"] });
  for (const host of ["evil.example", "meta.example", "mapped.example", "lo6.example"]) {
    await assert.rejects(resolvePublicHost(host, dns), (err: unknown) => err instanceof BlockedHostError && /isn't reachable from Poskoo/.test(err.message), host);
  }
});

test("resolvePublicHost: ANY private address in the A/AAAA set is enough to refuse", async () => {
  const dns = fakeDns({ "mixed.example": ["93.184.216.34", "2606:4700::1", "fd00::1"] });
  await assert.rejects(resolvePublicHost("mixed.example", dns), BlockedHostError);
});

test("resolvePublicHost: public hosts resolve to the checked address", async () => {
  const dns = fakeDns({ "mastodon.example": ["93.184.216.34", "2606:4700::1"] });
  assert.deepEqual(await resolvePublicHost("mastodon.example", dns), { address: "93.184.216.34", family: 4 });
});

test("resolvePublicHost: IP literals, localhost and unknown hosts", async () => {
  const dns = fakeDns({});
  await assert.rejects(resolvePublicHost("127.0.0.1", dns), BlockedHostError);
  await assert.rejects(resolvePublicHost("[::ffff:169.254.169.254]", dns), BlockedHostError);
  await assert.rejects(resolvePublicHost("localhost", dns), BlockedHostError);
  await assert.rejects(resolvePublicHost("db.localhost", dns), BlockedHostError);
  await assert.rejects(resolvePublicHost("nope.example", dns), /Couldn't find the server/);
  assert.deepEqual(await resolvePublicHost("8.8.8.8", dns), { address: "8.8.8.8", family: 4 });
});

test("assertPublicUrl: checks wss relays and refuses other schemes", async () => {
  const dns = fakeDns({ "relay.example": ["93.184.216.34"], "inner.example": ["192.168.0.10"] });
  assert.equal((await assertPublicUrl("wss://relay.example", dns)).address, "93.184.216.34");
  await assert.rejects(assertPublicUrl("wss://inner.example", dns), BlockedHostError);
  await assert.rejects(assertPublicUrl("file:///etc/passwd", dns), BlockedHostError);
});

function recordingSender(reply: (url: URL) => Response): { send: Sender; calls: { url: string; pinned: ResolvedAddress; method: string; auth: string | null }[] } {
  const calls: { url: string; pinned: ResolvedAddress; method: string; auth: string | null }[] = [];
  return {
    calls,
    send: async (url, pinned, init) => {
      calls.push({ url: url.href, pinned, method: init.method, auth: init.headers.get("authorization") });
      return reply(url);
    },
  };
}

test("safeFetch: connects to the pinned, checked address", async () => {
  const { send, calls } = recordingSender(() => Response.json({ ok: true }));
  const f = createSafeFetch({ resolver: fakeDns({ "ghost.example": ["93.184.216.34"] }), send });
  const res = await f("https://ghost.example/ghost/api/admin/site/");
  assert.equal(res.status, 200);
  assert.deepEqual(calls[0].pinned, { address: "93.184.216.34", family: 4 });
});

test("safeFetch: a private host never reaches the sender", async () => {
  const { send, calls } = recordingSender(() => Response.json({}));
  const f = createSafeFetch({ resolver: fakeDns({ "evil.example": ["127.0.0.1"] }), send });
  await assert.rejects(f("https://evil.example/api"), BlockedHostError);
  await assert.rejects(f("http://169.254.169.254/latest/meta-data/"), BlockedHostError);
  assert.equal(calls.length, 0);
});

test("safeFetch: a redirect to a private host is refused", async () => {
  const { send, calls } = recordingSender((url) =>
    url.hostname === "public.example" ? new Response(null, { status: 302, headers: { location: "https://internal.example/admin" } }) : Response.json({ leaked: true }),
  );
  const f = createSafeFetch({ resolver: fakeDns({ "public.example": ["93.184.216.34"], "internal.example": ["10.1.2.3"] }), send });
  await assert.rejects(f("https://public.example/media.jpg"), BlockedHostError);
  assert.equal(calls.length, 1);
  // A redirect straight to the metadata IP literal is refused too.
  const g = createSafeFetch({ resolver: fakeDns({ "public.example": ["93.184.216.34"] }), send: async () => new Response(null, { status: 301, headers: { location: "http://169.254.169.254/" } }) });
  await assert.rejects(g("https://public.example/x"), BlockedHostError);
});

test("safeFetch: public redirects are followed (303 -> GET, auth dropped cross-origin); redirect: error throws", async () => {
  const { send, calls } = recordingSender((url) =>
    url.hostname === "a.example" ? new Response(null, { status: 303, headers: { location: "https://b.example/done" } }) : Response.json({ ok: 1 }),
  );
  const f = createSafeFetch({ resolver: fakeDns({ "a.example": ["93.184.216.34"], "b.example": ["93.184.216.35"] }), send });
  const res = await f("https://a.example/post", { method: "POST", headers: { Authorization: "Bearer s3cret" }, body: "x" });
  assert.equal(res.status, 200);
  assert.deepEqual(
    calls.map((c) => [c.url, c.method, c.auth, c.pinned.address]),
    [
      ["https://a.example/post", "POST", "Bearer s3cret", "93.184.216.34"],
      ["https://b.example/done", "GET", null, "93.184.216.35"],
    ],
  );
  await assert.rejects(f("https://a.example/post", { method: "POST", body: "x", redirect: "error" }), /redirect/);
  const manual = await f("https://a.example/post", { method: "POST", body: "x", redirect: "manual" });
  assert.equal(manual.status, 303);
});

test("safeFetch: redirect loops stop", async () => {
  const f = createSafeFetch({
    resolver: fakeDns({ "loop.example": ["93.184.216.34"] }),
    send: async () => new Response(null, { status: 302, headers: { location: "https://loop.example/again" } }),
    maxRedirects: 3,
  });
  await assert.rejects(f("https://loop.example/"), /too many redirects/);
});

test("nodeSender: sends method, headers and FormData body to the pinned address; decodes gzip", async () => {
  let seen: { method?: string; host?: string; type?: string; auth?: string; body?: string } = {};
  const server = http.createServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => {
      seen = { method: req.method, host: req.headers.host, type: req.headers["content-type"], auth: req.headers.authorization, body: Buffer.concat(chunks).toString() };
      res.writeHead(201, { "content-type": "application/json", "content-encoding": "gzip" });
      res.end(gzipSync(JSON.stringify({ id: "42" })));
    });
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const { port } = server.address() as AddressInfo;
  try {
    const form = new FormData();
    form.set("status", "hello");
    form.set("file", new Blob([new Uint8Array([1, 2, 3])], { type: "image/png" }), "a.png");
    const req = new Request(`http://social.example:${port}/api/v1/media`, { method: "POST", body: form, headers: { Authorization: "Bearer t" } });
    // The URL's host name doesn't resolve anywhere: the connect must go to the pinned address.
    const res = await nodeSender(new URL(req.url), { address: "127.0.0.1", family: 4 }, {
      method: "POST",
      headers: req.headers,
      body: Buffer.from(await req.arrayBuffer()),
      signal: AbortSignal.timeout(5000),
    });
    assert.equal(res.status, 201);
    assert.deepEqual(await res.json(), { id: "42" });
    assert.equal(seen.method, "POST");
    assert.equal(seen.host, `social.example:${port}`);
    assert.equal(seen.auth, "Bearer t");
    assert.match(seen.type ?? "", /^multipart\/form-data; boundary=/);
    assert.match(seen.body ?? "", /name="status"\r\n\r\nhello/);
  } finally {
    server.close();
  }
});
