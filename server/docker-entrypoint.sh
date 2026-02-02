#!/bin/sh
set -e

# Configure yt-dlp with JS runtime
echo "--js-runtimes deno" > /etc/yt-dlp.conf
echo "--verbose" >> /etc/yt-dlp.conf

if [ -n "$BGUTIL_PROVIDER_URL" ]; then
  # Extract host and port from URL
  BGUTIL_HOST=$(echo "$BGUTIL_PROVIDER_URL" | sed 's|http://||' | cut -d: -f1)
  BGUTIL_PORT=$(echo "$BGUTIL_PROVIDER_URL" | sed 's|http://||' | cut -d: -f2 | cut -d/ -f1)

  # Wait for bgutil-provider TCP port to be open (up to 120s)
  echo "[yt-dlp] Waiting for PO Token provider at $BGUTIL_HOST:$BGUTIL_PORT ..."
  READY=0
  for i in $(seq 1 40); do
    if nc -z "$BGUTIL_HOST" "$BGUTIL_PORT" 2>/dev/null; then
      echo "[yt-dlp] PO Token provider: READY (after ~$((i*3))s)"
      READY=1
      break
    fi
    echo "[yt-dlp] Waiting... ($i/40)"
    sleep 3
  done

  if [ "$READY" = "1" ]; then
    echo "--extractor-args youtube:player-client=web,mweb" >> /etc/yt-dlp.conf
    echo "--extractor-args youtubepot-bgutilhttp:base_url=$BGUTIL_PROVIDER_URL" >> /etc/yt-dlp.conf
  else
    echo "[yt-dlp] WARNING: PO Token provider NOT available!"
    echo "--extractor-args youtube:player-client=web,mweb" >> /etc/yt-dlp.conf
  fi
else
  echo "--extractor-args youtube:player-client=web,mweb" >> /etc/yt-dlp.conf
fi

echo "[yt-dlp] Config:"
cat /etc/yt-dlp.conf
echo ""

# Diagnostic: list what's in yt_dlp_plugins directory
echo "[yt-dlp] Plugin files:"
python3 -c "
import os, glob
plugin_dir = '/usr/local/lib/python3.11/dist-packages/yt_dlp_plugins'
if os.path.exists(plugin_dir):
    for root, dirs, files in os.walk(plugin_dir):
        for f in files:
            if not f.startswith('__'):
                print('  ', os.path.join(root, f))
else:
    print('  plugin dir not found')
" 2>&1 || true

# Quick test: try to fetch a short YT video with verbose to see plugin loading
echo "[yt-dlp] Test run (verbose)..."
yt-dlp --dump-json --no-download "https://www.youtube.com/watch?v=jNQXAC9IVRw" 2>&1 | head -50 || true
echo "[yt-dlp] Test run done."

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting server..."
exec node dist/index.js
