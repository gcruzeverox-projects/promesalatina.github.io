# 🌎 Promesa Latina — Plataforma B2B Completa

> Monorepo fusionado: Landing Page + Panel Admin + Módulo Cotizaciones + API REST + PostgreSQL

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-10-red?logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5-teal?logo=prisma)

---

## 📦 Módulos incluidos

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| Landing Page bilingüe | `app/[locale]/page.tsx` | Hero, categorías, productos, footer |
| Header con acceso staff | `components/landing/Header.tsx` | Botones Admin + Cotizaciones para ADMIN/VENTAS |
| Login Admin | `app/admin/login/page.tsx` | Autenticación JWT con credenciales demo |
| CRUD Productos | `app/admin/products/` | Crear, editar, duplicar, ocultar, imágenes |
| Drag & Drop imágenes | `components/admin/products/ImageUploader.tsx` | Compresión automática + reorden |
| Módulo Cotizaciones | `app/admin/quotes/` | Editor de precios, PDF, envío por email |
| API REST completa | `apps/api/src/` | Auth, Products, Categories, Orders, Quotes |
| Generación PDF | `quotes/pdf/quote-pdf.tsx` | Plantilla profesional con react-pdf |
| Emails automáticos | `email/email.service.ts` | Resend: órdenes + cotizaciones con PDF |

---

## 🚀 PARTE 1 — SUBIR A GITHUB

### Paso 1 — Crear repositorio en GitHub

```
1. Ir a https://github.com → botón verde "New"
2. Repository name: promesa-latina
3. Descripción: Plataforma B2B distribución productos latinoamericanos
4. Visibilidad: Private ✓
5. NO marcar ningún checkbox de inicialización
6. Clic "Create repository"
7. Copiar la URL: https://github.com/TU_USUARIO/promesa-latina.git
```

### Paso 2 — Preparar los archivos localmente

```bash
# Descomprimir el ZIP en tu carpeta de proyectos
# La carpeta resultante debe llamarse: promesa-latina
# Estructura esperada en la raíz:
#   promesa-latina/
#   ├── package.json
#   ├── .env.example
#   ├── apps/
#   └── database/
```

### Paso 3 — Inicializar y subir a GitHub

```bash
# Entrar a la carpeta del proyecto
cd promesa-latina

# Inicializar Git
git init
git branch -M main

# Conectar con GitHub (reemplazar TU_USUARIO)
git remote add origin https://github.com/TU_USUARIO/promesa-latina.git

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "feat: plataforma B2B completa Promesa Latina

- Landing page bilingüe ES/EN con header adaptativo
- Panel Admin: CRUD productos con drag-and-drop imágenes
- Módulo Cotizaciones: editor precios + PDF profesional + email
- Backend NestJS con JWT, RBAC, Prisma ORM
- Schema PostgreSQL: users, products, categories, orders, quotes
- CI/CD GitHub Actions configurado"

# Subir a GitHub
git push -u origin main
```

### Paso 4 — Agregar Secrets en GitHub (para CI)

```
Ir a: GitHub → tu repo → Settings → Secrets and variables → Actions → New secret

Agregar:
  DATABASE_URL        → tu URL de Neon/Supabase
  NEXT_PUBLIC_API_URL → https://tu-api.railway.app
  NEXT_PUBLIC_APP_URL → https://tu-app.vercel.app
```

---

## ⚙️ PARTE 2 — CONFIGURAR ENTORNO LOCAL

### Paso 5 — Instalar herramientas

```bash
# Node.js 18+ desde https://nodejs.org
# Luego instalar pnpm:
npm install -g pnpm@9.0.0

# Verificar versiones
node --version   # debe ser >= 18
pnpm --version   # debe ser >= 9
```

### Paso 6 — Instalar dependencias

```bash
# Desde la raíz del proyecto
pnpm install
```

### Paso 7 — Configurar variables de entorno

```bash
# Crear archivos .env para cada app
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
```

Editar `apps/api/.env` con valores reales:

```bash
# ── BASE DE DATOS (gratis en neon.tech) ──
DATABASE_URL="postgresql://user:pass@host/promesa_latina?sslmode=require"

# ── JWT ──
JWT_SECRET="genera-con: node -e \"console.log(require('crypto').randomBytes(64).toString('hex'))\""
JWT_EXPIRES_IN="7d"

# ── CLOUDINARY (gratis en cloudinary.com) ──
CLOUDINARY_CLOUD_NAME="tu-cloud-name"
CLOUDINARY_API_KEY="123456789"
CLOUDINARY_API_SECRET="tu-secret"

# ── RESEND (gratis en resend.com) ──
RESEND_API_KEY="re_xxxxxxxxxxxx"
FROM_EMAIL="Promesa Latina <noreply@promesalatina.com>"
SALES_EMAIL="ventas@promesalatina.com"

# ── SERVIDOR ──
PORT=3001
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3000"
ADMIN_URL="http://localhost:3000"
```

Editar `apps/web/.env.local`:

```bash
NEXT_PUBLIC_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_DEFAULT_LOCALE="es"
```

### Paso 8 — Configurar base de datos

```bash
# Generar cliente Prisma
pnpm db:generate

# Crear tablas en la BD
pnpm db:migrate
# Cuando pida nombre de migración → escribir: init

# Poblar con datos de prueba
pnpm db:seed
```

Salida esperada:
```
✓ Usuarios: admin, ventas, cliente
✓ 7 categorías creadas
✓ 8 productos demo creados
✅ Seed completado!
```

---

## 🧪 PARTE 3 — EJECUTAR Y PROBAR

### Paso 9 — Correr el proyecto

Abrir **dos terminales** simultáneamente:

**Terminal 1 — Backend:**
```bash
pnpm api
# Esperado: 🌎 Promesa Latina API corriendo en: http://localhost:3001/api
```

**Terminal 2 — Frontend:**
```bash
pnpm web
# Esperado: ▲ Next.js 14 ready on http://localhost:3000
```

---

### Paso 10 — Probar Landing Page

```
URL: http://localhost:3000

Verificar:
  ✓ Header con logo PL, buscador y selector ES/EN
  ✓ Hero con dos CTAs (Explorar Catálogo / Solicitar Cotización)
  ✓ Barra de estadísticas (500+ Productos, 7 Categorías...)
  ✓ Grid de 8 categorías con iconos
  ✓ Sección "Cómo funciona" (3 pasos)
  ✓ Footer con información de contacto

Probar selector de idioma:
  → Clic "EN" → textos cambian a inglés
  → Clic "ES" → vuelve a español
```

### Paso 11 — Probar Login y Panel Admin

```
URL: http://localhost:3000/admin/login

Credenciales disponibles (botones de auto-fill en la pantalla):
  ADMIN:   admin@promesalatina.com   / Admin123!
  VENTAS:  ventas@promesalatina.com  / Ventas123!
  CLIENTE: cliente@example.com       / Cliente123!

Después del login:
  ADMIN  → redirige a /admin/products
  VENTAS → redirige a /admin/quotes

En el Header de la landing:
  → Con sesión de ADMIN/VENTAS aparecen botones "Cotizaciones" y "Panel Admin"
  → Clic en avatar para ver menú con logout
```

### Paso 12 — Probar CRUD de Productos

```
URL: http://localhost:3000/admin/products (requiere login ADMIN)

1. Ver tabla con 8 productos del seed
2. Usar buscador → escribir "frijoles" → filtra en tiempo real
3. Filtrar por categoría "Bebidas" en el dropdown
4. Crear producto:
   → Clic "+ Nuevo producto"
   → Tab "Información básica": nombre, SKU, categoría
   → Tab "Inventario": precio, stock, MOQ
   → Clic "✅ Crear producto"
   → Redirige a edición con banner verde
5. Subir imagen (requiere Cloudinary configurado):
   → Tab "Imágenes" → arrastrar imagen JPG
   → Ver preview y barra de progreso
6. Ocultar producto → badge cambia a "Oculto"
7. Duplicar → se crea copia con SKU-COPY-xxx
```

### Paso 13 — Probar Módulo de Cotizaciones

```
URL: http://localhost:3000/admin/quotes (requiere login VENTAS o ADMIN)

Flujo completo:
1. Crear una orden de prueba (ver Paso 14 con curl)
2. En /admin/quotes → pestaña "Órdenes por cotizar"
   → aparece la orden creada
3. Clic "+ Cotizar" → abre el QuoteEditor
4. En el editor:
   → Ingresar precio proveedor por item
   → Configurar % Ganancia: 20 y % Embotellado: 5
   → Clic "↺ Aplicar a todos" → precio de venta se calcula automático
   → Verificar análisis de margen (panel derecho)
   → Cambiar vigencia a 7 días
   → Clic "💾 Guardar cotización"
5. En la pantalla de detalle:
   → Revisar resumen financiero
   → Clic "⬇️ Descargar PDF" → descarga el PDF generado
   → Clic "📧 Enviar cotización" → envía por email (requiere Resend)
6. Volver a /admin/quotes → pestaña "Cotizaciones enviadas"
   → badge cambia de "Borrador" a "✓ Enviada"
```

### Paso 14 — Probar API con curl

```bash
# ── Login ──────────────────────────────────────────────────────────────────
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@promesalatina.com","password":"Admin123!"}' \
  | python3 -m json.tool

# ── Guardar token ───────────────────────────────────────────────────────────
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ventas@promesalatina.com","password":"Ventas123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# ── Listar categorías (público) ─────────────────────────────────────────────
curl -s http://localhost:3001/api/categories \
  | python3 -c "import sys,json; [print(c['name']) for c in json.load(sys.stdin)]"

# ── Listar productos (público) ──────────────────────────────────────────────
curl -s "http://localhost:3001/api/products?limit=3" \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"Total: {d['total']}\"); [print(f\"- {p['name']} | SKU: {p['sku']}\") for p in d['data']]"

# ── Crear orden (sin login) ─────────────────────────────────────────────────
PROD_ID=$(curl -s "http://localhost:3001/api/products?limit=1" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['id'])")

curl -s -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d "{
    \"guestName\":     \"Ana Torres\",
    \"guestEmail\":    \"ana@labuena.com\",
    \"guestPhone\":    \"+1 323 555 0199\",
    \"guestBusiness\": \"La Buena Tienda\",
    \"guestAddress\":  \"789 Whittier Blvd, Los Angeles CA\",
    \"items\": [{
      \"productId\": \"$PROD_ID\",
      \"quantity\": 8,
      \"unitType\":  \"caja\",
      \"unitPrice\": 36.00
    }]
  }" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f\"Orden: #{d['orderNumber']} | Total: \${d['total']}\")"

# ── Listar órdenes pendientes (VENTAS) ──────────────────────────────────────
curl -s "http://localhost:3001/api/orders?status=RECIBIDA" \
  -H "Authorization: Bearer $TOKEN" \
  | python3 -c "import sys,json; orders=json.load(sys.stdin); print(f'{len(orders)} órdenes pendientes')"

# ── Ver Prisma Studio (interfaz visual de BD) ───────────────────────────────
# En otra terminal:
# pnpm db:studio → abre http://localhost:5555
```

---

## 🌐 PARTE 4 — DEPLOY EN PRODUCCIÓN

### Frontend → Vercel

```
1. Ir a https://vercel.com → New Project
2. Conectar repositorio GitHub "promesa-latina"
3. Configurar:
   - Framework:      Next.js
   - Root Directory: apps/web
4. Variables de entorno:
   NEXT_PUBLIC_API_URL  = https://api.promesalatina.com
   NEXT_PUBLIC_APP_URL  = https://promesalatina.com
5. Deploy → URL automática: promesa-latina.vercel.app
```

### Backend → Railway

```
1. Ir a https://railway.app → New Project → GitHub repo
2. Configurar:
   - Root Directory: apps/api
   - Start Command:  node dist/main
   - Build Command:  pnpm build
3. Variables de entorno (todas las de .env.example)
4. Generate Domain → copiar URL
5. Usar esa URL como NEXT_PUBLIC_API_URL en Vercel
```

### Base de datos → Neon (gratis)

```
1. Ir a https://neon.tech → New Project
2. Copiar Connection String
3. Pegar como DATABASE_URL en Railway
4. En Railway terminal: pnpm db:migrate && pnpm db:seed
```

---

## 📁 Estructura completa del proyecto

```
promesa-latina/                        ← Raíz del monorepo
├── .env.example                       ← Template variables de entorno
├── .gitignore
├── .github/workflows/ci.yml          ← CI automático (pnpm 9.0.0 exacto)
├── package.json                       ← Scripts monorepo (sin packageManager)
├── pnpm-workspace.yaml
├── turbo.json
│
├── apps/
│   ├── web/                           ← Frontend Next.js 14
│   │   ├── app/
│   │   │   ├── layout.tsx            ← Root layout
│   │   │   ├── globals.css
│   │   │   ├── [locale]/             ← i18n routing
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx          ← Landing page
│   │   │   └── admin/
│   │   │       ├── login/page.tsx    ← Login con demo credentials
│   │   │       ├── products/         ← CRUD productos
│   │   │       │   ├── page.tsx
│   │   │       │   ├── new/page.tsx
│   │   │       │   └── [id]/page.tsx
│   │   │       └── quotes/           ← Módulo cotizaciones
│   │   │           ├── page.tsx
│   │   │           ├── new/page.tsx
│   │   │           └── [id]/page.tsx
│   │   ├── components/
│   │   │   ├── landing/
│   │   │   │   └── Header.tsx        ← Header con acceso staff
│   │   │   └── admin/
│   │   │       ├── layout/AdminLayout.tsx
│   │   │       ├── products/
│   │   │       │   ├── ProductForm.tsx
│   │   │       │   └── ImageUploader.tsx
│   │   │       └── quotes/
│   │   │           ├── QuoteEditor.tsx
│   │   │           └── QuoteDetail.tsx
│   │   ├── lib/
│   │   │   ├── api-admin.ts          ← Cliente HTTP productos
│   │   │   └── api-quotes.ts         ← Cliente HTTP cotizaciones
│   │   ├── types/
│   │   │   ├── product.ts
│   │   │   ├── order.ts
│   │   │   └── quote.ts
│   │   ├── messages/
│   │   │   ├── es.json               ← Traducciones español
│   │   │   └── en.json               ← Traducciones inglés
│   │   ├── middleware.ts             ← Routing i18n
│   │   ├── i18n.ts
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                          ← Backend NestJS
│       └── src/
│           ├── main.ts               ← Entry point puerto 3001
│           ├── app.module.ts         ← Todos los módulos registrados
│           ├── auth/                 ← JWT + RBAC
│           ├── products/             ← CRUD + imágenes Cloudinary
│           ├── categories/           ← Categorías dinámicas
│           ├── orders/               ← Órdenes B2B
│           ├── quotes/               ← Cotizaciones + PDF + email
│           │   ├── pdf/quote-pdf.tsx ← Plantilla react-pdf
│           │   └── dto/
│           ├── email/                ← Resend service
│           ├── storage/              ← Cloudinary service
│           └── prisma/               ← Singleton PrismaClient
│
└── database/
    ├── schema.prisma                 ← Schema completo PostgreSQL
    └── seed.ts                       ← Datos demo (3 usuarios, 7 cats, 8 prods)
```

---

## 🔑 Credenciales demo

| Rol | Email | Contraseña | Redirige a |
|-----|-------|-----------|------------|
| ADMIN | admin@promesalatina.com | Admin123! | /admin/products |
| VENTAS | ventas@promesalatina.com | Ventas123! | /admin/quotes |
| CLIENTE | cliente@example.com | Cliente123! | / |

---

## ⚡ Comandos de referencia rápida

```bash
pnpm web           # Frontend puerto 3000
pnpm api           # Backend puerto 3001
pnpm dev           # Ambos con Turborepo

pnpm db:migrate    # Crear/actualizar tablas
pnpm db:seed       # Datos demo
pnpm db:studio     # Interfaz visual BD (puerto 5555)
pnpm db:reset      # Resetear BD completa

pnpm build         # Build de producción (ambas apps)
```

---

## ❗ Solución de errores comunes

| Error | Causa | Solución |
|-------|-------|---------|
| `ERR_PNPM_BAD_PM_VERSION` en CI | Conflicto versión pnpm | Ya corregido: `version: 9.0.0` en ci.yml, sin `packageManager` en package.json |
| `Cannot connect to database` | DATABASE_URL incorrecta | Verificar URL en `apps/api/.env` |
| `Cloudinary upload failed` | Credenciales incorrectas | Revisar las 3 variables CLOUDINARY_* |
| `Module not found '@/types'` | tsconfig paths | Verificar `"paths": { "@/*": ["./*"] }` en tsconfig.json |
| Puerto 3000 en uso | Proceso anterior corriendo | `lsof -ti:3000 | xargs kill -9` (Mac/Linux) |
| `pnpm: command not found` | pnpm no instalado | `npm install -g pnpm@9.0.0` |

---

*Promesa Latina B2B Platform © 2025 — Proyecto privado, todos los derechos reservados*
