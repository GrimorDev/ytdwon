#!/bin/sh
set -e

# Configure yt-dlp with JS runtime and PO Token provider
echo "--js-runtimes deno" > /etc/yt-dlp.conf
echo "--extractor-args youtube:player-client=web,mweb" >> /etc/yt-dlp.conf

if [ -n "$BGUTIL_PROVIDER_URL" ]; then
  # Wait for bgutil-provider to be ready
  echo "[yt-dlp] Waiting for PO Token provider..."
  for i in 1 2 3 4 5 6 7 8 9 10; do
    if curl -sf "$BGUTIL_PROVIDER_URL" > /dev/null 2>&1; then
      echo "[yt-dlp] PO Token provider: READY at $BGUTIL_PROVIDER_URL"
      break
    fi
    echo "[yt-dlp] Waiting... ($i/10)"
    sleep 3
  done
  echo "--extractor-args youtubepot-bgutilhttp:base_url=$BGUTIL_PROVIDER_URL" >> /etc/yt-dlp.conf
fi

echo "[yt-dlp] Config:"
cat /etc/yt-dlp.conf
echo ""

# Show yt-dlp version for debugging
yt-dlp --version 2>/dev/null && echo "[yt-dlp] Version: $(yt-dlp --version)" || true

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec node dist/index.js
