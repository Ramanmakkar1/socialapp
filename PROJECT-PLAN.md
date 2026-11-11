# Postflow (working name) — build plan

One tool: **social media scheduler (like Buffer) + Instagram comment→DM automation (like ManyChat) + AI replies + lead capture.**
Live: https://poskoo.com (Raman 2026-11-05; noindex until Raman says go). Old staging socialapp.splitforms.com points to the same app.

## Stack
Next.js 16 (App Router, TypeScript, Tailwind v4) · Postgres on the shared Supabase (own schema `socialapp`) · pg-boss job queue (inside Postgres) · Node workers · official platform APIs only.

## Phases
- **Phase 0 — base** (done/in progress): landing page, dashboard shell, privacy/terms/data-deletion pages, health route, Docker deploy.
- **Phase 1 — Instagram auto-DM**: email+password and Google login; "Connect Instagram" (Instagram API with Instagram Login, OAuth); store tokens encrypted; Meta webhook receiver (comments, story replies, messages); rules (keyword → DM with link, email gate, follow gate, rewind); send queue with rate limits + retries; contacts list + CSV export; link click tracking.
- **Phase 2 — Scheduler**: calendar (week/month, drag & drop); post editor (one post → many platforms, per-platform captions); media upload + resize; publish worker for Instagram (feed, reels, carousel, story), Facebook Pages, Threads; failed-post alerts; a scheduled post can carry an auto-DM rule that switches on when it goes live.
- **Phase 3 — AI + analytics**: AI captions/hashtags in brand voice; AI DM replies that collect name/email/phone and send a booking link; per-post dashboard (reach, comments, DMs, clicks, leads); best time to post.
- **Phase 4 — money + launch**: Stripe plans (Free / Pro $19 / Agency $49) with limits; onboarding (3 minutes to first rule + first post); help docs.
- **Phase 5 — v2**: YouTube, LinkedIn, Pinterest, TikTok, WhatsApp, Messenger; agency workspaces + approve-before-post; PWA.

## Rules for every worker
- Official APIs only. Never scraping, never asking users for passwords.
- Secrets only in env vars (never commit `.env`). Tokens encrypted at rest.
- Small, focused changes; keep the design system in `src/app/globals.css` (tokens) and the look of the landing page.
- No payment code until Phase 4 — EXCEPTION approved by Raman 2026-11-11: creator Products/Orders via Stripe Connect (Managed Risk, direct charges, 3% platform fee), lead magnets and refer-and-earn are built. Subscription billing for Pro/Agency is built (2026-11-11: Stripe Checkout + Customer Portal on the platform account, /app/settings/billing, migration 043). Keep the site noindex until launch.
- Every new page: mobile-friendly, dark-mode friendly, accessible (labels, contrast).
