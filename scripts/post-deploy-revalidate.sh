#!/bin/bash
# Run right after a deploy's health check passes (home server: /usr/local/bin/socialapp-deploy.sh,
# after "Deploy OK"). Pages prerendered during the Docker build have no runtime env, so the homepage
# would show the build-time platform count and "Coming soon" networks for up to 10 minutes.
# This marks every page for re-render (src/app/api/jobs/revalidate) and warms the homepage.
# Usage: post-deploy-revalidate.sh [/data/socialapp/src/.env] [http://127.0.0.1:4338]
ENV_FILE=${1:-/data/socialapp/src/.env}
BASE=${2:-http://127.0.0.1:4338}
CRON_SECRET=$(grep -m1 '^CRON_SECRET=' "$ENV_FILE" | cut -d= -f2- | tr -d '"\r'"'")
if [ -z "$CRON_SECRET" ]; then echo "post-deploy-revalidate: CRON_SECRET not found in $ENV_FILE"; exit 1; fi
curl -sf -X POST -H "x-cron-secret: $CRON_SECRET" "$BASE/api/jobs/revalidate" >/dev/null || { echo "post-deploy-revalidate: revalidate failed"; exit 1; }
# Route-handler revalidation re-renders on the next visit: make that visit ours, then a second one
# so the page is served from the fresh render.
curl -sf -o /dev/null "$BASE/" && sleep 2 && curl -sf -o /dev/null "$BASE/"
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) Revalidated public pages"
# Indexing fails closed (NEXT_PUBLIC_SITE_INDEXABLE + NEXT_PUBLIC_SITE_URL). On 2026-11-14 a build lost it and
# Google dropped 42 pages as noindex. Fail the deploy log loudly if a public page is not "index, follow".
PUBLIC_URL=${POSKOO_PUBLIC_URL:-https://poskoo.com}
for page in / /social-media-scheduler /tools/instagram-comment-picker; do
  robots=$(curl -sf "$PUBLIC_URL$page" | grep -oiE '<meta name="robots" content="[^"]*"' | head -1)
  case "$robots" in
    *"index, follow"*) ;;
    *) echo "NOINDEX REGRESSION on $PUBLIC_URL$page: '${robots:-no robots meta}' - check NEXT_PUBLIC_SITE_INDEXABLE/NEXT_PUBLIC_SITE_URL"; exit 1 ;;
  esac
done
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) Public pages are index, follow"
