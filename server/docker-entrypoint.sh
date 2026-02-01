#!/bin/sh
set -e

# Configure yt-dlp with JS runtime and PO Token provider
echo "--js-runtimes deno" > /etc/yt-dlp.conf
if [ -n "$BGUTIL_PROVIDER_URL" ]; then
  echo "--extractor-args youtubepot-bgutilhttp:base_url=$BGUTIL_PROVIDER_URL" >> /etc/yt-dlp.conf
  echo "[yt-dlp] PO Token provider: $BGUTIL_PROVIDER_URL"
fi
if [ -f /app/cookies.txt ] && grep -qv '^#' /app/cookies.txt 2>/dev/null; then
  echo "--cookies /app/cookies.txt" >> /etc/yt-dlp.conf
  echo "[yt-dlp] Cookies: LOADED"
else
  echo "[yt-dlp] Cookies: not found"
fi
echo "[yt-dlp] Config:"
cat /etc/yt-dlp.conf

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec node dist/index.js
