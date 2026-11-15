# MCP OAuth 2.1 for connector directories (design note, not built)

Status: **not implemented** (2026-11-15). The MCP server (`/api/mcp`) authenticates with Poskoo API
keys only (`Authorization: Bearer poskoo_…`, `src/lib/apiKeys.ts`). That works for Claude Code,
Claude Desktop config files and any client that can send a header, but the ChatGPT and Claude
connector directories expect the MCP authorization spec: OAuth 2.1 authorization code + PKCE, with
discovery and (ideally) dynamic client registration.

## Why it was skipped

The codebase has OAuth **client** code only (Google sign-in, Meta, Threads, YouTube, TikTok,
LinkedIn, X, Pinterest, GBP connect flows). There is no authorization-server piece to build on:
no client registry, no authorization codes, no access/refresh token issuing, no consent screen,
no `.well-known` metadata. Adding all of that is a security-sensitive feature of its own, so it is
designed here and left for a separate change.

## Design

Endpoints (all under the app origin):

| Endpoint | Spec | Notes |
|---|---|---|
| `GET /.well-known/oauth-protected-resource` | RFC 9728 | `{ resource: "<origin>/api/mcp", authorization_servers: ["<origin>"], scopes_supported: ["posts:draft", "posts:publish", "automations", "contacts:read", "analytics:read"] }` |
| `GET /.well-known/oauth-authorization-server` | RFC 8414 | issuer, `authorization_endpoint`, `token_endpoint`, `registration_endpoint`, `revocation_endpoint`, `code_challenge_methods_supported: ["S256"]`, `grant_types_supported: ["authorization_code", "refresh_token"]`, `token_endpoint_auth_methods_supported: ["none"]` |
| `POST /api/oauth/register` | RFC 7591 (DCR) | public clients only (`token_endpoint_auth_method: "none"`); validate `redirect_uris` (https, or `http://localhost` / `127.0.0.1` for desktop clients); rate limited per IP |
| `GET /oauth/authorize` | OAuth 2.1 | `requireUser()` (normal login), consent page listing the client name, redirect host and scopes; **"Allow publishing" unticked by default** (maps to `posts:publish`, same meaning as `api_keys.can_publish`); PKCE S256 required; `state` echoed; exact redirect URI match |
| `POST /api/oauth/token` | OAuth 2.1 | `authorization_code` (verify `code_verifier`, single use, 60 s lifetime, bound to client + redirect URI) and `refresh_token` (rotation, reuse detection revokes the family) |
| `POST /api/oauth/revoke` | RFC 7009 | revoke access or refresh token |

`/api/mcp` changes:

- On 401 add `WWW-Authenticate: Bearer resource_metadata="<origin>/.well-known/oauth-protected-resource"`.
- Accept either a `poskoo_…` API key (today) or an OAuth access token; both resolve to the same
  `{ userId, canPublish }` (`McpAccess`), so `src/lib/mcp.ts` does not change. `posts:publish` sets
  `canPublish`; without it the existing draft-then-approve behaviour applies.

Storage (new migration, same style as `032_api_keys.sql`):

- `oauth_clients` (id, name, redirect_uris text[], created_at, created_ip)
- `oauth_codes` (code_hash, client_id, user_id, redirect_uri, code_challenge, scopes, expires_at, used_at)
- `oauth_tokens` (id, family_id, client_id, user_id, access_hash, refresh_hash, scopes, expires_at,
  refresh_expires_at, revoked_at, last_used_at)

Hash every secret with `hashToken` (as API keys are). Access tokens: opaque, 1 hour. Refresh tokens:
30 days, rotated on use.

UI: Settings → API keys gets a "Connected apps" list (client name, scopes, last used, Revoke), next
to the existing keys.

Tests: PKCE verification, code single use and expiry, redirect URI exact match, refresh rotation and
reuse detection, scope → `canPublish` mapping, and that `/api/mcp` still accepts API keys.

Open questions for the owner: whether DCR should be open to any client or limited to an allow-list
of connector directories, and the token lifetimes.
