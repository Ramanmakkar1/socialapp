# Instructions for AI workers
Read PROJECT-PLAN.md first. Build in phase order. Keep changes small and match the existing design (tokens in src/app/globals.css, components styled like src/app/page.tsx).
Never commit secrets or .env files. Never add payment code before Phase 4. poskoo.com is LIVE IN SEARCH (Raman launched it 2026-11-12): public pages must stay "index, follow". Never add site-wide noindex, never change BRAND.indexable / NEXT_PUBLIC_SITE_INDEXABLE logic, and never edit tests to expect noindex on poskoo.com. Only /app, auth and checkout pages are noindex. The old staging host socialapp.splitforms.com stays noindex.
Check only the files you changed: `npx eslint <files>`. Do not run builds or dev servers.
