#!/bin/sh
set -e

# Configure yt-dlp with JS runtime
echo "--js-runtimes deno" > /etc/yt-dlp.conf

if [ -n "$BGUTIL_PROVIDER_URL" ]; then
  # Wait for bgutil-provider to be ready (up to 120s — it needs to launch headless browser)
  echo "[yt-dlp] Waiting for PO Token provider at $BGUTIL_PROVIDER_URL ..."
  READY=0
  for i in $(seq 1 40); do
    if curl -sf "$BGUTIL_PROVIDER_URL" > /dev/null 2>&1; then
      echo "[yt-dlp] PO Token provider: READY (after ${i}x3s)"
      READY=1
      break
    fi
    echo "[yt-dlp] Waiting... ($i/40)"
    sleep 3
  done

  if [ "$READY" = "1" ]; then
    # Single extractor-args line combining player-client AND bgutil provider
    echo "--extractor-args youtube:player-client=web,mweb" >> /etc/yt-dlp.conf
    echo "--extractor-args youtubepot-bgutilhttp:base_url=$BGUTIL_PROVIDER_URL" >> /etc/yt-dlp.conf
  else
    echo "[yt-dlp] WARNING: PO Token provider NOT available! YouTube may not work."
    echo "--extractor-args youtube:player-client=web,mweb" >> /etc/yt-dlp.conf
  fi
else
  echo "--extractor-args youtube:player-client=web,mweb" >> /etc/yt-dlp.conf
fi

echo "[yt-dlp] Config:"
cat /etc/yt-dlp.conf
echo ""

# Show yt-dlp version for debugging
echo "[yt-dlp] Version: $(yt-dlp --version 2>/dev/null || echo 'unknown')"

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec node dist/index.js
