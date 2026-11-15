// Poskoo MCP server: Streamable HTTP (JSON-RPC 2.0) at /api/mcp.
// AI assistants (Claude, ChatGPT, …) authenticate with a Poskoo API key:
// Authorization: Bearer poskoo_…
// A key is draft-only unless its owner ticked "Allow publishing" (src/lib/mcp.ts McpAccess).
// See the /developers page for setup.
import { apiKeyAccess } from "@/lib/apiKeys";
import { callMcpTool, mcpRateLimit, MCP_TOOLS } from "@/lib/mcp";
import { clientIp } from "@/lib/rateLimit";

const PROTOCOL_VERSION = "2025-06-18";

function bearerKey(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

function rpcResult(id: unknown, result: unknown): Response {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, result });
}

function rpcError(id: unknown, code: number, message: string, status = 200): Response {
  return Response.json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } }, { status });
}

function unauthorized(): Response {
  return Response.json(
    { jsonrpc: "2.0", id: null, error: { code: -32001, message: "Missing or invalid API key." } },
    { status: 401, headers: { "WWW-Authenticate": "Bearer" } },
  );
}

export async function POST(req: Request) {
  const key = bearerKey(req);
  if (!key) return unauthorized();
  const limited = mcpRateLimit(key, clientIp(req.headers));
  if (!limited.ok) {
    const retryAfter = Math.max(1, Math.ceil(limited.retryAfterMs / 1000));
    return Response.json(
      { jsonrpc: "2.0", id: null, error: { code: -32029, message: `Rate limit reached. Try again in ${retryAfter} seconds.` } },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }
  const access = await apiKeyAccess(key);
  if (!access) return unauthorized();
  const { userId } = access;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return rpcError(null, -32700, "Parse error", 400);
  }
  if (Array.isArray(body) || typeof body !== "object" || body === null) {
    return rpcError(null, -32600, "Invalid request", 400);
  }

  const request = body as { id?: unknown; method?: string; params?: Record<string, unknown> };
  if (typeof request.method !== "string") {
    return rpcError(null, -32600, "Invalid request", 400);
  }

  // Notifications (e.g. notifications/initialized) carry no id: acknowledge, no body.
  if (request.id === undefined) {
    return new Response(null, { status: 202 });
  }

  switch (request.method) {
    case "initialize":
      return rpcResult(request.id, {
        protocolVersion: PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: "poskoo", version: "1.1.0" },
        instructions: access.canPublish
          ? "This key may schedule posts and switch Auto-DMs on. Confirm with the user before scheduling."
          : "This key is draft-only: posts are saved as drafts and Auto-DMs are created paused. The user approves them in Poskoo.",
      });
    case "tools/list":
      return rpcResult(request.id, { tools: MCP_TOOLS });
    case "tools/call": {
      const name = typeof request.params?.name === "string" ? request.params.name : "";
      const args = (request.params?.arguments ?? {}) as Record<string, unknown>;
      return rpcResult(request.id, await callMcpTool(name, args, userId, { canPublish: access.canPublish }));
    }
    default:
      return rpcError(request.id, -32601, `Method not found: ${request.method}`);
  }
}

// No SSE stream in this stateless implementation: the client POSTs and reads the reply.
export function GET() {
  return new Response(null, { status: 405, headers: { Allow: "POST, DELETE" } });
}

export function DELETE() {
  return new Response(null, { status: 204 });
}
