#!/bin/sh
set -e

echo "🔄 Running Prisma migrations..."
./node_modules/prisma/build/index.js migrate deploy

echo "✅ Migrations complete. Starting Next.js..."
exec "$@"