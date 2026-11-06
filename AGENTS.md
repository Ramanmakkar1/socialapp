# Instructions for AI workers
Read PROJECT-PLAN.md first. Build in phase order. Keep changes small and match the existing design (tokens in src/app/globals.css, components styled like src/app/page.tsx).
Never commit secrets or .env files. Never add payment code before Phase 4. Keep robots noindex (staging).
Check only the files you changed: `npx eslint <files>`. Do not run builds or dev servers.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
