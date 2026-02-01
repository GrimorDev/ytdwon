#!/bin/sh
set -e

# Configure yt-dlp with JS runtime and PO Token provider
echo "--js-runtimes deno" > /etc/yt-dlp.conf
if [ -n "$BGUTIL_PROVIDER_URL" ]; then
  echo "--extractor-args youtubepot-bgutilhttp:base_url=$BGUTIL_PROVIDER_URL" >> /etc/yt-dlp.conf
  echo "[yt-dlp] PO Token provider: $BGUTIL_PROVIDER_URL"
fi
echo "[yt-dlp] Config:"
cat /etc/yt-dlp.conf

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec node dist/index.js
