#!/bin/bash
set -e
echo "🚀 VENDIX Deploy Prod"
if [ ! -f .env ]; then echo "❌ .env no existe, copia .env.example"; exit 1; fi
echo "📦 Building..."
docker-compose -f docker-compose.prod.yml build --no-cache
echo "⬆️ Starting..."
docker-compose -f docker-compose.prod.yml up -d
echo "⏳ Waiting postgres..."
sleep 10
echo "🗄️ Migrate..."
docker-compose -f docker-compose.prod.yml exec api npx prisma migrate deploy || true
echo "🌱 Seed (opcional)..."
# docker-compose -f docker-compose.prod.yml exec api npx ts-node prisma/seed.ts
echo "✅ Deploy OK - Web: http://localhost:3000 API: http://localhost:4000/api"
docker-compose -f docker-compose.prod.yml ps