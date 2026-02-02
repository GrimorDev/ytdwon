#!/bin/sh
set -e

# Configure yt-dlp (used for Facebook, Twitter, TikTok + fallback)
echo "--js-runtimes deno" > /etc/yt-dlp.conf

# PO Token provider for yt-dlp (optional, helps with YouTube fallback)
if [ -n "$BGUTIL_PROVIDER_URL" ]; then
  BGUTIL_HOST=$(echo "$BGUTIL_PROVIDER_URL" | sed 's|http://||' | cut -d: -f1)
  BGUTIL_PORT=$(echo "$BGUTIL_PROVIDER_URL" | sed 's|http://||' | cut -d: -f2 | cut -d/ -f1)
  for i in $(seq 1 10); do
    if nc -z "$BGUTIL_HOST" "$BGUTIL_PORT" 2>/dev/null; then
      echo "--extractor-args youtubepot-bgutilhttp:base_url=$BGUTIL_PROVIDER_URL" >> /etc/yt-dlp.conf
      echo "[yt-dlp] PO Token provider: READY"
      break
    fi
    sleep 2
  done
fi

echo "[yt-dlp] Config: $(cat /etc/yt-dlp.conf | tr '\n' ' ')"
echo "[cobalt] API URL: ${COBALT_API_URL:-not set}"

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec node dist/index.js
