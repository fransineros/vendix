# VENDIX — Haz una foto. Vende más.

SaaS MVP completo: foto → IA → contenido profesional para vender.

## 🚀 Stack Prod

- Web: Next.js 14 App Router + TypeScript + Tailwind + shadcn
- API: NestJS 10 + Prisma + PostgreSQL 16 + JWT refresh rotation + Throttler
- Storage: S3 compatible
- IA: capa abstracta AIProductAnalyzer / AIContentGenerator / AIImageProcessor (mock + openai)
- Pagos: PayPal backend-only con idempotencia
- Tests: 8 tests críticos
- Docker multi-stage prod

## 📁 Estructura Final

```
vendix/
├── apps/
│   ├── web/ (Next.js)
│   │   ├── src/app/
│   │   │   ├── page.tsx (landing /)
│   │   │   ├── pricing/ /features /about /contact /login /register /forgot-password /terms /privacy
│   │   │   └── dashboard/
│   │   │       ├── page.tsx (stats, créditos, plan)
│   │   │       ├── products/ (list)
│   │   │       ├── products/new (drag&drop)
│   │   │       └── products/[id] (resultado)
│   │   └── Dockerfile (standalone output)
│   └── api/ (NestJS)
│       ├── prisma/schema.prisma + seed.ts
│       ├── src/modules/
│       │   ├── auth/ (register, login, refresh rotation, forgot, reset)
│       │   ├── users/ (me)
│       │   ├── credits/ (wallet, history, reserve/refund con FOR UPDATE)
│       │   ├── products/ (S3 upload, validation)
│       │   ├── ai/ (interfaces + factory + mock + openai + full pipeline)
│       │   ├── payments/ (paypal create/capture/webhook idempotencia)
│       │   └── admin/ (stats, users, block/unblock, add/remove credits, payments, subs, products, generations)
│       ├── test/critical.test.ts (8 tests)
│       └── Dockerfile (migrate deploy + start)
├── packages/config (PLANS, CREDIT_COSTS no hardcodeados en frontend)
├── docker-compose.yml (dev)
├── docker-compose.prod.yml (prod)
├── .env.example
└── README.md
```

## ✅ Fases Completadas (11/11)

FASE 1 Arquitectura ✅
FASE 2 Prisma schema 8 tablas + refresh_tokens + system_configs ✅
FASE 3 Auth JWT + refresh rotation + block ✅
FASE 4 Créditos con SELECT FOR UPDATE Serializable ✅
FASE 5 Productos S3 validación 10MB ✅
FASE 6 IA capa abstracta + pipeline 6 pasos + refund ✅
FASE 7 Frontend Next.js responsive + drag&drop + resultado ✅
FASE 8 PayPal backend-only idempotencia ✅
FASE 9 Admin panel ✅
FASE 10 Tests 8 críticos ✅
FASE 11 Docker prod ✅

## 🛠️ Quickstart Dev

```bash
cp .env.example .env
docker-compose up postgres minio -d
cd apps/api
npm install
npx prisma migrate dev --name init
npx prisma generate
npx ts-node prisma/seed.ts # admin@vendix.com / Admin123!
npm run start:dev # http://localhost:4000/api

cd ../web
npm install
npm run dev # http://localhost:3000
```

## 🐳 Despliegue Prod

```bash
cp .env.example .env # rellena secrets prod
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

# Logs
docker logs -f vendix-api-1
docker logs -f vendix-web-1

# Migraciones prod (ya se ejecutan en entrypoint)
docker exec vendix-api-1 npx prisma migrate deploy
```

## 🔐 Variables Entorno Prod Checklist

- [ ] JWT_SECRET 32+ chars
- [ ] JWT_REFRESH_SECRET distinto
- [ ] DATABASE_URL postgres prod con password fuerte
- [ ] S3_BUCKET prod + S3 keys
- [ ] PAYPAL_CLIENT_ID + SECRET + WEBHOOK_ID LIVE
- [ ] PAYPAL_ENV=live
- [ ] AI_PROVIDER=openai + OPENAI_API_KEY
- [ ] WEB_URL=https://vendix.com
- [ ] NEXT_PUBLIC_API_URL=https://api.vendix.com (solo public)

## 🔒 Seguridad Checklist

- [ ] PAYPAL_CLIENT_SECRET nunca en frontend
- [ ] JWT_SECRET nunca en logs
- [ ] CORS solo WEB_URL
- [ ] Rate limiting 30 req/min
- [ ] ValidationPipe whitelist
- [ ] User bloqueado no puede usar API
- [ ] Productos filtrados por userId
- [ ] Saldo nunca negativo (Serializable + FOR UPDATE)
- [ ] Webhook idempotencia externalPaymentId unique + reference
- [ ] IA fallida refund

## 📊 Flujo MVP Completo Funcional

Usuario → Registro → Dashboard → Subir foto (drag&drop validado) → IA analiza (1cr) → genera título/desc (1cr) → hashtags (1cr) → procesa imagen sin fondo (2cr) → Resultado con Descargar/Copiar/Compartir → Créditos → Plan → Pago PayPal → Webhook → Créditos/suscripción actualizados → Historial → Admin

## 🚫 V2 (no implementado como pediste)

- Marketplace
- Tienda personal
- Pedidos
- Afiliados
- Generación vídeo

## 📦 Seed

- admin@vendix.com / Admin123! (ADMIN, 1000 créditos)
- demo@vendix.com / Demo123! (USER, 3 créditos)

## 🧪 Tests

```bash
cd apps/api
npx jest test/critical.test.ts --verbose
```