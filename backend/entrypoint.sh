#!/bin/sh
set -e

echo "⏳ Waiting for PostgreSQL to be ready..."
MAX_RETRIES=30
RETRIES=0
while true; do
  if npx prisma db push --accept-data-loss 2>/dev/null; then
    break
  fi
  RETRIES=$((RETRIES + 1))
  if [ $RETRIES -ge $MAX_RETRIES ]; then
    echo "❌ PostgreSQL not ready after $MAX_RETRIES attempts. Exiting."
    exit 1
  fi
  echo "   Waiting... (attempt $RETRIES/$MAX_RETRIES)"
  sleep 2
done
echo "✅ PostgreSQL is ready"

echo "⏳ Running Prisma generate..."
npx prisma generate
echo "✅ Prisma generate done"

echo "⏳ Seeding database..."
npx prisma db seed
echo "✅ Database seeded"

echo "🚀 Starting server..."
exec npm run dev
