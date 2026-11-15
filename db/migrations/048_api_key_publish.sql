begin;

-- MCP draft-then-approve (src/lib/mcp.ts): an API key either may schedule / publish and switch on
-- Auto-DM rules (can_publish) or only creates drafts and paused rules for the owner to approve.
-- New keys are draft-only unless the owner ticks "Allow publishing" in Settings → API keys.
-- Keys that already exist keep what they could do before (schedule posts), so no connected
-- assistant breaks on deploy; the owner can revoke and re-create a key to make it draft-only.
-- The code treats a missing column as "can publish" (the pre-migration behaviour), so this can run
-- before or after the deploy.
alter table socialapp.api_keys add column if not exists can_publish boolean;
update socialapp.api_keys set can_publish = true where can_publish is null;
alter table socialapp.api_keys alter column can_publish set default false;
alter table socialapp.api_keys alter column can_publish set not null;

commit;
