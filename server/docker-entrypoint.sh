#!/bin/sh
set -e

# Configure yt-dlp
echo "--js-runtimes deno" > /etc/yt-dlp.conf

# PO Token provider (bgutil)
if [ -n "$BGUTIL_PROVIDER_URL" ]; then
  BGUTIL_HOST=$(echo "$BGUTIL_PROVIDER_URL" | sed 's|http://||' | cut -d: -f1)
  BGUTIL_PORT=$(echo "$BGUTIL_PROVIDER_URL" | sed 's|http://||' | cut -d: -f2 | cut -d/ -f1)

  echo "[yt-dlp] Waiting for PO Token provider at $BGUTIL_HOST:$BGUTIL_PORT ..."
  for i in $(seq 1 20); do
    if nc -z "$BGUTIL_HOST" "$BGUTIL_PORT" 2>/dev/null; then
      echo "[yt-dlp] PO Token provider: READY"
      echo "--extractor-args youtubepot-bgutilhttp:base_url=$BGUTIL_PROVIDER_URL" >> /etc/yt-dlp.conf
      break
    fi
    sleep 3
  done
fi

# Cookies (placed on VPS via docker cp or volume mount)
if [ -f /app/cookies.txt ] && [ -s /app/cookies.txt ]; then
  echo "--cookies /app/cookies.txt" >> /etc/yt-dlp.conf
  echo "[yt-dlp] Cookies: LOADED ($(wc -l < /app/cookies.txt) lines)"
else
  echo "[yt-dlp] Cookies: not found — YouTube/Instagram won't work"
  echo "[yt-dlp] To fix: docker cp cookies.txt <container>:/app/cookies.txt"
fi

echo "[yt-dlp] Config:"
cat /etc/yt-dlp.conf
echo ""
echo "[yt-dlp] Version: $(yt-dlp --version 2>/dev/null || echo 'unknown')"

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec node dist/index.js
