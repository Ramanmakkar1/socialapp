# Environment variables

New on 2026-11-06: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (Sign in with Google, see docs/REPORT-meta-google.md). The app reads these (see `.env.example`):

| Variable | Needed for | Notes |
|---|---|---|
| `DATABASE_URL`, `DATABASE_SSL` | everything | Postgres, schema `socialapp` |
| `TOKEN_ENCRYPTION_KEY` | Instagram tokens | 32-byte base64 |
| `CRON_SECRET` | `/api/jobs/*` | sent as header `x-cron-secret` |
| `NEXT_PUBLIC_SITE_URL` | links, OAuth redirects, tracked links | |
| `META_APP_ID`, `META_APP_SECRET`, `META_LOGIN_CONFIG_ID` | Facebook Login for Business (Instagram connect) | `META_APP_ID` / `META_LOGIN_CONFIG_ID` are read by `src/lib/metaLogin.ts` but are missing from `.env.example` |
| `META_APP_SECRET`, `META_WEBHOOK_VERIFY_TOKEN` | `/api/meta/webhook` | without them the webhook answers 403 (signature check stays on) |
| `INSTAGRAM_APP_ID`, `INSTAGRAM_APP_SECRET` | Instagram Login (older flow) only | deauthorize / data-deletion / webhook now also accept `META_APP_SECRET` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Sign in with Google | button hidden unless both are set; needs migration 016 |
| `REVIEWER_EMAIL`, `REVIEWER_PASSWORD` | optional Meta App Review demo login | |
| `ANTHROPIC_API_KEY`, `AI_MODEL` | optional AI caption helper | |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN`, `NEXT_PUBLIC_ANALYTICS_SRC` | optional analytics | |
| `SITE_INDEXABLE` | keep unset (noindex until launch) | |

While no Instagram/Meta app keys are set, Settings shows "Connecting Instagram is not switched on yet",
scheduling asks to connect first (drafts still save), and Inbox / Analytics show their connect states.
