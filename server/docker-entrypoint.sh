#!/bin/sh
set -e

# Configure yt-dlp
echo "--js-runtimes deno" > /etc/yt-dlp.conf

# OAuth token for YouTube (persisted via volume mount)
if [ -d /app/yt-dlp-cache ]; then
  echo "--cache-dir /app/yt-dlp-cache" >> /etc/yt-dlp.conf
  echo "--username oauth" >> /etc/yt-dlp.conf
  echo '--password ""' >> /etc/yt-dlp.conf
  echo "[yt-dlp] OAuth: enabled (cache at /app/yt-dlp-cache)"
else
  echo "[yt-dlp] OAuth: disabled (no cache volume)"
fi

# PO Token provider (bgutil)
if [ -n "$BGUTIL_PROVIDER_URL" ]; then
  BGUTIL_HOST=$(echo "$BGUTIL_PROVIDER_URL" | sed 's|http://||' | cut -d: -f1)
  BGUTIL_PORT=$(echo "$BGUTIL_PROVIDER_URL" | sed 's|http://||' | cut -d: -f2 | cut -d/ -f1)

  echo "[yt-dlp] Waiting for PO Token provider at $BGUTIL_HOST:$BGUTIL_PORT ..."
  READY=0
  for i in $(seq 1 20); do
    if nc -z "$BGUTIL_HOST" "$BGUTIL_PORT" 2>/dev/null; then
      echo "[yt-dlp] PO Token provider: READY"
      READY=1
      break
    fi
    sleep 3
  done

  if [ "$READY" = "1" ]; then
    echo "--extractor-args youtubepot-bgutilhttp:base_url=$BGUTIL_PROVIDER_URL" >> /etc/yt-dlp.conf
  else
    echo "[yt-dlp] WARNING: PO Token provider NOT available!"
  fi
fi

# Cookies fallback
if [ -f /app/cookies.txt ] && [ -s /app/cookies.txt ]; then
  echo "--cookies /app/cookies.txt" >> /etc/yt-dlp.conf
  echo "[yt-dlp] Cookies: LOADED"
fi

echo "[yt-dlp] Config:"
cat /etc/yt-dlp.conf
echo ""
echo "[yt-dlp] Version: $(yt-dlp --version 2>/dev/null || echo 'unknown')"

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec node dist/index.js
