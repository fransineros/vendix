
# VENDIX.TOP - HOSTINGER BUSINESS DEPLOY FINAL - 10 MIN

## Tu hosting ahora: Business con 5 apps Node.js - PERFECTO

### 1. PREPARAR DB GRATIS (2 min)

1. Ve a https://neon.tech - Sign up con Google
2. New Project -> Region: EU -> Create
3. Copia DATABASE_URL: postgresql://neondb_owner:xxx@ep-xxx.neon.tech/neondb?sslmode=require
4. Guarda esa URL

### 2. PREPARAR STORAGE R2 GRATIS (2 min)

1. https://dash.cloudflare.com -> R2 -> Create Bucket: vendix-top-prod
2. Manage R2 API Tokens -> Create API Token -> Object Read & Write -> Copia AccessKey y Secret
3. Bucket public URL: https://pub-xxxx.r2.dev (esta en Settings del bucket)

### 3. SUBIR CODIGO VENDIX A HOSTINGER

OPCION A - GitHub (más fácil en tu nuevo plan):

1. En tu PC, sube el proyecto vendix a GitHub privado
2. En Hostinger hPanel > Sitios web > vendix.top > Git (si ves Git)
3. Conecta repositorio y deploy

OPCION B - ZIP (File Manager) - Hazlo así:

#### Backend API:

1. En tu PC local:
```
cd /ruta/a/vendix/apps/api
npm install
npm run build
```
2. Comprime:
- carpeta dist/
- carpeta prisma/
- package.json
- node_modules (o deja que Hostinger haga npm install)

3. En hPanel > File Manager > domains/vendix.top/api > Upload > Extrae ZIP

#### Frontend WEB:

1. En tu PC:
```
cd /ruta/a/vendix/apps/web
npm install
npm run build
# Esto crea .next/standalone con server.js
```
2. Sube a File Manager > domains/vendix.top/public_html:
- .next/ (completo)
- public/
- server.js (de .next/standalone/server.js)
- node_modules (standalone ya incluye, pero sube)
- package.json
- next.config.js

### 4. VARIABLES ENV en Hostinger Node.js App

En hPanel > Node.js > Editar app api.vendix.top > Environment variables > Añade:

```
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://... (de Neon)
WEB_URL=https://vendix.top
API_URL=https://api.vendix.top
NEXT_PUBLIC_API_URL=https://api.vendix.top
JWT_SECRET=GENERA_CON_openssl_rand
JWT_REFRESH_SECRET=GENERA_OTRO
S3_ENDPOINT=https://ACCOUNT.r2.cloudflarestorage.com
S3_BUCKET=vendix-top-prod
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_URL=https://pub-xxx.r2.dev
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_ENV=live
CREDITS_FREE_INITIAL=3
```

WEB app env vars:
```
NEXT_PUBLIC_API_URL=https://api.vendix.top
NODE_ENV=production
```

### 5. MIGRACIONES

En tu PC con DATABASE_URL de Neon:
```
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma db seed
```

### 6. NPM INSTALL + RESTART

En hPanel > Node.js:
- En api.vendix.top -> Run NPM Install -> Restart
- En vendix.top -> Run NPM Install -> Restart

Revisa Logs: debe decir "Nest application successfully started" y "Next.js started"

### 7. SSL

hPanel > Seguridad > SSL > SSL Gratis -> Instalar para vendix.top y api.vendix.top

### 8. TEST

https://vendix.top -> landing
https://api.vendix.top/api/plans -> JSON
https://vendix.top/register -> crea usuario

### Si falla: manda captura de Node.js > Logs

### ARCHIVOS FINALES QUE NECESITAS (te los he dejado):

- .env.production en /mnt/data/vendix-vendixtop/.env.production
- nginx no necesario en Business (Hostinger ya hace proxy)
- docker-compose no necesario en Business

### ZIP LISTO PARA SUBIR:

Usa el vendix-hosting-ready.zip que te di antes, contiene todo.

