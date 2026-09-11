# VENDIX en Banahosting (cPanel) - Guía completa

Banahosting es cPanel compartido. Sí se puede desplegar VENDIX pero con ajustes.

## Entendiendo Banahosting

- Plan compartido cPanel: soporta Node.js via "Setup Node.js App" (desde cPanel)
- No soporta Docker en compartido (solo VPS). Usaremos Node.js directo.
- Base de datos: cPanel ofrece MySQL y PostgreSQL (si tu plan lo incluye). Si no, usa Neon.tech gratis externo.
- Dominio: apuntas vendix.com a Banahosting nameservers.

## OPCIÓN A: Banahosting + Servicios externos (recomendada para MVP)

Mantén frontend y backend en Banahosting, pero DB y Storage externos para no complicar:

- Frontend: Banahosting public_html (Next.js export estático)
- Backend: Banahosting Node.js App (puerto que te asigna Banahosting)
- DB: Neon.tech Postgres gratis (DATABASE_URL externa)
- Storage: Cloudflare R2 (gratis)
- Total sigue barato, funciona en compartido.

## PASO 1: Preparar build para Banahosting

### Frontend - Export estático

Next.js en cPanel compartido no puede correr en modo standalone serverless bien. Lo mejor es export estático o usar Node.js app también.

Opción 1 - Node.js App para frontend (recomendada):
- En tu local:
cd apps/web
npm install
# En next.config.js ya tienes output: standalone
npm run build

- Esto genera .next/standalone + .next/static
- Zipea la carpeta standalone

Opción 2 - Static export (si tu hosting no soporta 2 Node apps):
En next.config.js cambia:
output: 'export'  // genera carpeta out/ con html estático
Luego sube contenido de out/ a public_html

Para tu caso Banahosting, usa OPCIÓN 1 con 2 Node.js apps (una web 3000, otra api 4000).

### Backend - Build prod

cd apps/api
npm install
npx prisma generate
npm run build
# genera dist/

## PASO 2: cPanel Banahosting - Crear 2 Node.js Apps

1. Entra a cPanel Banahosting (tu-dominio.com:2083 o desde banahosting.com > cPanel)

2. Busca "Setup Node.js App" o "Application Manager"

3. Crear App 1 - API:
- Application mode: Production
- Node.js version: 20.x (la más alta)
- Application root: /home/tuuser/vendix-api (crea carpeta)
- Application URL: api.vendix.com (crea subdominio api.vendix.com antes en Subdomains)
- Application startup file: dist/main.js
- Env vars: pega todas de .env.production (ver abajo)

4. Crear App 2 - WEB:
- Application root: /home/tuuser/vendix-web
- Application URL: vendix.com (dominio principal)
- Startup file: server.js (del standalone)
- Env vars: NEXT_PUBLIC_API_URL=https://api.vendix.com

## PASO 3: Subir archivos via File Manager o FTP

- Usa FileZilla o File Manager cPanel
- Sube contenido de apps/api (dist, node_modules, package.json, prisma) a /home/tuuser/vendix-api
- Sube contenido de apps/web standalone a /home/tuuser/vendix-web
- Importante: node_modules pesa, mejor deja que cPanel haga npm install:
  Solo sube package.json, dist, prisma, .next/standalone, y luego en Node.js App pulsa "Run NPM Install"

## PASO 4: Base de datos

Opción Neon gratis (recomendada si Banahosting no tiene Postgres):

1. neon.tech > New Project > copia DATABASE_URL
2. En Banahosting Node.js App api > Env vars > DATABASE_URL=postgresql://...
3. Desde tu local con esa DATABASE_URL:
DATABASE_URL="postgres://..." npx prisma migrate deploy
DATABASE_URL="..." npx prisma db seed

Si Banahosting sí tiene Postgres:
cPanel > PostgreSQL Databases > Create DB vendix_prod + user + password
DATABASE_URL=postgresql://user:pass@localhost:5432/vendix_prod

## PASO 5: Env vars completas para Banahosting Node App API

En cPanel > Setup Node.js App > api.vendix.com > Environment Variables:

NODE_ENV=production
PORT=4000 (o el que te asigne Banahosting, revisa)
DATABASE_URL=postgresql://... (Neon o local)
WEB_URL=https://vendix.com
API_URL=https://api.vendix.com
JWT_SECRET=genera con: openssl rand -base64 32
JWT_REFRESH_SECRET=otro diferente
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
S3_ENDPOINT=https://ACCOUNT.r2.cloudflarestorage.com
S3_REGION=auto
S3_BUCKET=vendix-prod
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL=https://pub-xxx.r2.dev
AI_PROVIDER=openai
OPENAI_API_KEY=sk-proj-...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
PAYPAL_ENV=live

Para WEB App:
NEXT_PUBLIC_API_URL=https://api.vendix.com
PORT=3000
NODE_ENV=production

## PASO 6: Dominio y SSL

- Si compraste dominio en Banahosting, ya apunta.
- Si dominio en Cloudflare, apunta A record a IP de Banahosting (te la da Banahosting en cPanel > Server Information)
- cPanel > SSL/TLS Status > AutoSSL > Run AutoSSL para vendix.com y api.vendix.com (Let's Encrypt gratis)

## PASO 7: Reiniciar apps

En Setup Node.js App > Restart para api y web.

Logs: cPanel > Node.js App > Logs o en /home/tuuser/logs

## PASO 8: PayPal Webhook

PayPal > Live App > Webhook: https://api.vendix.com/api/payments/paypal/webhook

## Problemas comunes Banahosting

- Error 503: App no inició, revisa startup file dist/main.js y que hiciste npm install
- Prisma error: Asegúrate npx prisma generate se ejecutó, sube carpeta prisma y node_modules/@prisma
- Postgres no conecta: Usa Neon externo, más fácil
- Next.js no carga: Si usas export estático, sube out/ a public_html, no a Node app

## Alternativa si Banahosting se complica

Banahosting compartido para Node es limitado. Si ves que da problemas, la mejor opción es:
- Mantén dominio en Banahosting
- Frontend en Vercel (gratis) apuntando vendix.com via DNS
- Backend en Railway (5$) con api.vendix.com CNAME a Railway
- Sigue usando dominio Banahosting pero hosting externo (más estable para Node)

Te sale igual de barato y más fiable para NestJS + Next.js.

¿Quieres que te prepare el paquete ZIP específico para Banahosting cPanel (con carpetas vendix-api y vendix-web listas para subir)?