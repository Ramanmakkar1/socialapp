// Test-only: a fetch stand-in that answers by URL pattern and records every call. No network.
export type MockCall = { url: string; method: string; headers: Record<string, string>; body: unknown };
export type MockRoute = {
  match: RegExp | ((url: string, method: string) => boolean);
  reply: (call: MockCall, n: number) => Response | Promise<Response>;
};

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", ...headers } });
}

export function bytes(size: number, type: string): Response {
  return new Response(new Uint8Array(size).fill(7), { status: 200, headers: { "content-type": type, "content-length": String(size) } });
}

export function mockFetch(routes: MockRoute[]) {
  const calls: MockCall[] = [];
  const hits = new Map<MockRoute, number>();
  const fetchImpl = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    const method = (init?.method ?? "GET").toUpperCase();
    const headers: Record<string, string> = {};
    new Headers(init?.headers).forEach((v, k) => (headers[k] = v));
    const call: MockCall = { url, method, headers, body: init?.body ?? null };
    calls.push(call);
    for (const r of routes) {
      const hit = typeof r.match === "function" ? r.match(url, method) : r.match.test(`${method} ${url}`);
      if (hit) {
        const n = hits.get(r) ?? 0;
        hits.set(r, n + 1);
        return r.reply(call, n);
      }
    }
    throw new Error(`mockFetch: unexpected ${method} ${url}`);
  }) as unknown as typeof fetch;
  return { fetchImpl, calls };
}

/** JSON body of a recorded call. */
export function bodyJson(call: MockCall): Record<string, unknown> {
  return JSON.parse(String(call.body)) as Record<string, unknown>;
}

/** Form body of a recorded call. */
export function bodyForm(call: MockCall): URLSearchParams {
  return new URLSearchParams(String(call.body));
}

export const noSleep = async () => {};
