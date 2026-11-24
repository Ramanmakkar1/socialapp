# Poskoo

Open-source social media scheduler with Instagram comment-to-DM automation. Plan posts on one calendar,
publish to Instagram, Facebook, Threads, TikTok, YouTube, LinkedIn, X, Pinterest, Bluesky, Mastodon and more,
and auto-DM everyone who comments your keyword. Hosted version: https://poskoo.com

Built with Next.js and PostgreSQL. Licensed under the GNU AGPL v3.0 (see `LICENSE` and `NOTICE.md`).

## Run it locally

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL, TOKEN_ENCRYPTION_KEY, CRON_SECRET at minimum
DATABASE_URL=... node scripts/migrate.mjs
npm run dev
```

Each social network needs your own developer app and keys (Meta, TikTok, Google, LinkedIn, Pinterest, X ...);
see `.env.example`. Background jobs (publishing, DMs, token refresh) are POST routes under `/api/jobs/*`
called by a scheduler with header `x-cron-secret`.

## Environment

- `DATABASE_URL` — PostgreSQL connection string (required for the database).
- `DATABASE_SSL` — optional; set to `false` to disable SSL.
- `TOKEN_ENCRYPTION_KEY` — 32-byte base64 key for AES-256-GCM token encryption. Generate one with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
  ```
- `CRON_SECRET` — shared secret for the DM send worker; a cron calls `POST /api/jobs/send-dms` every minute with header `x-cron-secret: $CRON_SECRET` (wrong or missing secret returns 401).

- `INSTAGRAM_APP_ID` / `INSTAGRAM_APP_SECRET` — Instagram API with Instagram Login. In the Meta app set the Deauthorize callback to `/api/instagram/deauthorize` and the Data deletion request URL to `/api/instagram/data-deletion` (both verify Meta's `signed_request` with `INSTAGRAM_APP_SECRET`).
- `REVIEWER_EMAIL` / `REVIEWER_PASSWORD` — optional Meta App Review demo login (disabled when either is empty; password needs 8+ characters). Reviewers follow `/app/review-guide`.

See `.env.example` for the full list.

Run database migrations with:

```bash
npm run db:migrate
```

Never commit a `.env` file.
