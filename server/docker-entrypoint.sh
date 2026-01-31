#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "▶ Running build (runtime)"
npm run build

echo "Starting server..."
exec node dist/index.js
