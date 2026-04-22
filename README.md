# 🌎 Promesa Latina — Plataforma B2B

> Distribuidora digital de productos latinoamericanos para tiendas en EE.UU.
> Monorepo completo: Landing Page + Panel Admin + API REST + Base de datos

![Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Stack](https://img.shields.io/badge/NestJS-10-red?logo=nestjs)
![Stack](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Stack](https://img.shields.io/badge/Prisma-5-teal?logo=prisma)
![Stack](https://img.shields.io/badge/Cloudinary-storage-blue)

---

## 📋 Contenido de este repositorio

| Módulo | Ruta | Estado |
|--------|------|--------|
| Landing page bilingüe ES/EN | `apps/web/` | ✅ Listo |
| Panel Admin CRUD productos | `apps/web/app/admin/` | ✅ Listo |
| API REST NestJS | `apps/api/` | ✅ Listo |
| Schema PostgreSQL | `database/schema.prisma` | ✅ Listo |
| Seed con datos demo | `database/seed.ts` | ✅ Listo |
| Mobile React Native | `apps/mobile/` | 🔜 Próximo |

---

## 🚀 PARTE 1 — SUBIR A GITHUB (paso a paso)

### Prerrequisitos

Instalar en tu computadora antes de empezar:

| Herramienta | Versión | Descargar |
|------------|---------|-----------|
| Node.js | >= 18 | https://nodejs.org |
| pnpm | >= 9 | `npm install -g pnpm` |
| Git | cualquiera | https://git-scm.com |
| VS Code | cualquiera | https://code.visualstudio.com |

---

### PASO 1 — Crear el repositorio en GitHub

```
1. Ir a https://github.com
2. Clic en el botón verde "New" (esquina superior izquierda)
3. Llenar el formulario:
   - Repository name: promesa-latina
   - Description: Plataforma B2B distribución productos latinoamericanos
   - Visibilidad: Private ✓ (recomendado para proyectos de negocio)
   - NO marcar "Add a README file" (ya tenemos uno)
   - NO marcar "Add .gitignore"
4. Clic en "Create repository"
5. GitHub muestra la pantalla con la URL del repo:
   https://github.com/TU_USUARIO/promesa-latina.git
   → Copiar esta URL, la necesitarás en el Paso 3
```

---

### PASO 2 — Descomprimir y preparar los archivos

```
1. Descargar el archivo promesa-latina-admin.zip (ya tienes los archivos de la sesión)
2. Crear una carpeta en tu computadora:
   Windows: C:\proyectos\promesa-latina\
   Mac/Linux: ~/proyectos/promesa-latina/

3. Descomprimir el ZIP dentro de esa carpeta
4. La estructura debe quedar así:
   promesa-latina/
   ├── .env.example
   ├── .gitignore
   ├── .github/
   ├── package.json
   ├── pnpm-workspace.yaml
   ├── turbo.json
   ├── database/
   │   ├── schema.prisma
   │   └── seed.ts
   └── apps/
       ├── web/
       └── api/
```

---

### PASO 3 — Inicializar Git y hacer el primer push

Abrir una terminal (CMD en Windows, Terminal en Mac/Linux) dentro de la carpeta del proyecto:

```bash
# Entrar a la carpeta del proyecto
cd C:\proyectos\promesa-latina      # Windows
# ó
cd ~/proyectos/promesa-latina        # Mac/Linux

# Inicializar el repositorio Git local
git init

# Definir la rama principal como "main"
git branch -M main

# Conectar tu carpeta local con el repositorio de GitHub
# (reemplazar TU_USUARIO con tu usuario real de GitHub)
git remote add origin https://github.com/TU_USUARIO/promesa-latina.git

# Verificar que la conexión quedó bien
git remote -v
# Debe mostrar:
# origin  https://github.com/TU_USUARIO/promesa-latina.git (fetch)
# origin  https://github.com/TU_USUARIO/promesa-latina.git (push)

# Ver todos los archivos que Git detecta
git status

# Agregar TODOS los archivos al staging
git add .

# Verificar qué se va a commitear (lista de archivos en verde)
git status

# Crear el primer commit
git commit -m "feat: monorepo inicial Promesa Latina

- Landing page bilingüe ES/EN con Next.js 14
- Panel admin CRUD de productos con drag-and-drop de imágenes
- Backend NestJS con JWT, RBAC y Prisma ORM
- Schema PostgreSQL completo (users, products, orders, quotes)
- Seed con 7 categorías, 20 subcategorías y 8 productos demo
- Configuración Turborepo para monorepo"

# Subir al repositorio de GitHub
git push -u origin main
```

> **Si GitHub pide autenticación:**
> - Usuario: tu email de GitHub
> - Contraseña: un Personal Access Token (no tu contraseña de GitHub)
> - Crear token en: GitHub → Settings → Developer Settings → Personal Access Tokens → Generate new token (classic) → marcar "repo" → Generate

---

### PASO 4 — Verificar en GitHub

```
1. Ir a https://github.com/TU_USUARIO/promesa-latina
2. Debes ver todos los archivos del proyecto listados
3. El README.md se muestra automáticamente abajo
4. Verificar que aparecen estas carpetas:
   ✓ apps/
   ✓ database/
   ✓ .github/
   ✓ .env.example (sin valores reales)
   ✗ .env (NO debe aparecer — está en .gitignore)
```

---

### PASO 5 — Flujo de trabajo para cambios futuros (branches)

```bash
# Siempre trabajar en una rama nueva, nunca directamente en main
git checkout -b feature/nombre-del-modulo

# Ejemplo para el módulo de órdenes:
git checkout -b feature/orders-module

# Hacer cambios... luego:
git add .
git commit -m "feat(orders): agregar listado y cambio de estado"
git push origin feature/orders-module

# En GitHub → abrir Pull Request → merge a main
```

---

## ⚙️ PARTE 2 — CONFIGURAR EL ENTORNO LOCAL

### PASO 6 — Clonar desde GitHub (en otra máquina o colaborador)

```bash
# Si alguien más necesita el proyecto, usa esto:
git clone https://github.com/TU_USUARIO/promesa-latina.git
cd promesa-latina
```

### PASO 7 — Instalar dependencias

```bash
# Desde la raíz del proyecto (instala TODAS las apps)
pnpm install
```

### PASO 8 — Configurar variables de entorno

```bash
# Copiar el template a los archivos reales
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local

# Editar apps/api/.env con tus credenciales reales:
# - DATABASE_URL   → URL de tu base de datos PostgreSQL
# - JWT_SECRET     → string aleatorio de 64 caracteres
# - CLOUDINARY_*   → credenciales de cloudinary.com
# - RESEND_API_KEY → clave de resend.com
```

**Obtener DATABASE_URL gratis:**
```
1. Ir a https://neon.tech
2. Crear cuenta → New Project → nombre: promesa-latina
3. Copiar la "Connection string" que empieza con:
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
4. Pegar en apps/api/.env como DATABASE_URL
```

**Generar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
# Copiar el resultado y pegarlo en JWT_SECRET
```

**Obtener Cloudinary gratis:**
```
1. Ir a https://cloudinary.com → Sign up gratis
2. Dashboard → API Keys
3. Copiar Cloud Name, API Key y API Secret
```

### PASO 9 — Configurar la base de datos

```bash
# Apuntar Prisma al schema correcto
# En apps/api/package.json ya está configurado el path al schema

# Generar el cliente de Prisma (tipos TypeScript)
pnpm db:generate

# Crear las tablas en la base de datos
pnpm db:migrate
# Te pedirá un nombre para la migración → escribir: init

# Poblar la BD con datos de prueba
pnpm db:seed
```

Salida esperada del seed:
```
🌱 Iniciando seed de Promesa Latina...

✓ Usuarios: admin@promesalatina.com, ventas@promesalatina.com, cliente@example.com
✓ 7 categorías creadas
✓ 8 productos demo creados

✅ Seed completado exitosamente!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔑 Credenciales de acceso:
  ADMIN:   admin@promesalatina.com  / Admin123!
  VENTAS:  ventas@promesalatina.com / Ventas123!
  CLIENTE: cliente@example.com      / Cliente123!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🧪 PARTE 3 — EJECUTAR Y PROBAR

### PASO 10 — Correr el proyecto completo

Abrir **DOS terminales** simultáneamente:

**Terminal 1 — Backend API:**
```bash
cd promesa-latina
pnpm api
# Debe mostrar:
# 🌎 Promesa Latina API corriendo en: http://localhost:3001/api
```

**Terminal 2 — Frontend Web:**
```bash
cd promesa-latina
pnpm web
# Debe mostrar:
# ▲ Next.js 14.x.x
# - Local: http://localhost:3000
```

---

### PASO 11 — Prueba de la Landing Page

```
1. Abrir en el navegador: http://localhost:3000
2. Verificar que aparece:
   ✓ Header con logo "PL", buscador y selector ES/EN
   ✓ Sección Hero con los dos botones CTA
   ✓ Barra de estadísticas (500+ Productos, 12 Categorías...)
   ✓ Grid de 8 categorías con iconos
   ✓ Carrusel de nuevos productos con badges
   ✓ Sección "Cómo funciona"
   ✓ Footer con información de contacto

3. Probar el selector de idioma:
   → Clic en "EN" en el header
   → El texto debe cambiar a inglés
   → Clic en "ES" para volver a español

4. Probar el buscador:
   → Escribir "Postobon" y presionar Enter
   → Aparece toast de búsqueda

5. Probar agregar al carrito:
   → Clic en "Agregar al carrito" en cualquier producto
   → Aparece toast de confirmación en azul
```

---

### PASO 12 — Prueba del Panel Admin

```
1. Abrir: http://localhost:3000/admin/products
2. El panel redirige a login si no hay sesión
3. Iniciar sesión con: admin@promesalatina.com / Admin123!

4. Verificar en el listado de productos:
   ✓ Tabla con los 8 productos del seed
   ✓ Imágenes (placeholder si no hay imagen)
   ✓ SKU, categoría, precio, stock y estado
   ✓ Botones: ✏️ editar, 👁️ ocultar, ⧉ duplicar, 🗑️ eliminar

5. Probar búsqueda y filtros:
   → Escribir "Postobon" en el buscador → filtra en tiempo real
   → Seleccionar "Bebidas" en el dropdown → filtra por categoría
   → Seleccionar "Activos" en estado → filtra por estado

6. Probar crear un producto:
   → Clic en "+ Nuevo producto"
   → Tab "Información básica":
     - Nombre: Inca Kola Original
     - SKU: INC-KOLA-355ML
     - Categoría: Bebidas
   → Tab "Inventario & precios":
     - Precio base: 30.00
     - Stock: 25
     - Unidades por caja: 24
   → Clic en "✅ Crear producto"
   → Redirige a la pantalla de edición
   → Aparece banner verde "Producto creado exitosamente"

7. Probar subir imágenes (requiere Cloudinary configurado):
   → Ir al tab "Imágenes"
   → Arrastrar una imagen JPG/PNG al área de drop
   → Verificar preview inmediato con barra de progreso
   → La imagen aparece en la galería al completar la subida

8. Probar ocultar/activar un producto:
   → En la tabla, clic en 👁️ del producto "Inca Kola"
   → El badge cambia de "Activo" a "Oculto"
   → Clic de nuevo en ✅ → vuelve a "Activo"
```

---

### PASO 13 — Prueba de la API con curl o Postman

**Instalar curl** (incluido en Mac/Linux; en Windows descargar desde https://curl.se)

```bash
# ── 1. Login ──────────────────────────────────────────────────────────────────
curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@promesalatina.com","password":"Admin123!"}' | jq .

# Respuesta esperada:
# {
#   "user": { "id": "...", "email": "admin@promesalatina.com", "role": "ADMIN" },
#   "access_token": "eyJhbGc..."
# }

# ── 2. Guardar el token en una variable ───────────────────────────────────────
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@promesalatina.com","password":"Admin123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

echo "Token obtenido: ${TOKEN:0:40}..."

# ── 3. Listar productos (sin token — es público) ──────────────────────────────
curl -s http://localhost:3001/api/products | jq '.data | length'
# Debe mostrar: 8

# ── 4. Listar categorías ──────────────────────────────────────────────────────
curl -s http://localhost:3001/api/categories | jq '.[].name'
# Muestra: "Bebidas" "Galletas & Snacks" "Pan & Repostería" ...

# ── 5. Buscar productos ───────────────────────────────────────────────────────
curl -s "http://localhost:3001/api/products?search=frijoles" | jq '.total'

# ── 6. Crear producto (requiere token) ────────────────────────────────────────
CATEGORY_ID=$(curl -s http://localhost:3001/api/categories | \
  python3 -c "import sys,json; cats=json.load(sys.stdin); print([c['id'] for c in cats if c['slug']=='bebidas'][0])")

curl -s -X POST http://localhost:3001/api/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Inca Kola Original\",
    \"sku\": \"INC-KOLA-355ML-TEST\",
    \"categoryId\": \"$CATEGORY_ID\",
    \"basePrice\": 30.00,
    \"unitsPerPack\": 6,
    \"unitsPerCase\": 24,
    \"moq\": 1,
    \"stockQuantity\": 25,
    \"countryOfOrigin\": \"Perú\"
  }" | jq '{id, name, sku, status}'

# ── 7. Crear una orden (sin login — cliente invitado) ─────────────────────────
PRODUCT_ID=$(curl -s "http://localhost:3001/api/products?search=frijoles" | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['data'][0]['id'])")

curl -s -X POST http://localhost:3001/api/orders \
  -H "Content-Type: application/json" \
  -d "{
    \"guestName\": \"María García\",
    \"guestEmail\": \"maria@tiendita.com\",
    \"guestPhone\": \"+1 213 555 0100\",
    \"guestBusiness\": \"La Tiendita Latina\",
    \"guestAddress\": \"1234 E Cesar Chavez Ave, Los Angeles CA\",
    \"items\": [{
      \"productId\": \"$PRODUCT_ID\",
      \"quantity\": 5,
      \"unitType\": \"caja\",
      \"unitPrice\": 36.00
    }],
    \"notes\": \"Entrega preferible por la mañana\"
  }" | jq '{id, orderNumber, status, total}'

# ── 8. Ver el usuario autenticado ─────────────────────────────────────────────
curl -s http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq '{id, email, role}'
```

**Con Postman (alternativa visual):**
```
1. Descargar Postman: https://www.postman.com/downloads/
2. New Collection → nombre: Promesa Latina API
3. Crear request POST → http://localhost:3001/api/auth/login
4. Body → raw → JSON:
   { "email": "admin@promesalatina.com", "password": "Admin123!" }
5. Send → copiar el access_token de la respuesta
6. Para requests protegidos:
   → Tab "Authorization" → Type: Bearer Token
   → Pegar el access_token
```

---

### PASO 14 — Abrir Prisma Studio (interfaz visual de la BD)

```bash
pnpm db:studio
# Abre automáticamente: http://localhost:5555
# Permite ver y editar los datos directamente
# Tablas disponibles: users, products, categories, orders, quotes...
```

---

## 🌐 PARTE 4 — DEPLOY EN PRODUCCIÓN

### Deploy del Frontend en Vercel

```
1. Ir a https://vercel.com → Sign up con tu cuenta de GitHub
2. Clic en "Add New Project"
3. Seleccionar el repositorio "promesa-latina"
4. Configurar:
   - Framework Preset: Next.js
   - Root Directory: apps/web
   - Build Command: pnpm build (auto-detectado)
5. Agregar Environment Variables:
   NEXT_PUBLIC_API_URL  = https://api.promesalatina.com (o Railway URL)
   NEXT_PUBLIC_APP_URL  = https://promesalatina.com
6. Clic en "Deploy"
7. URL asignada automáticamente: promesa-latina.vercel.app
```

### Deploy del Backend en Railway

```
1. Ir a https://railway.app → Login con GitHub
2. New Project → Deploy from GitHub repo
3. Seleccionar "promesa-latina"
4. Settings:
   - Root Directory: apps/api
   - Build Command: pnpm build
   - Start Command: node dist/main
5. Variables de entorno (pestaña Variables):
   DATABASE_URL       = (URL de Neon en producción)
   JWT_SECRET         = (tu secret de producción)
   CLOUDINARY_*       = (tus credenciales de Cloudinary)
   RESEND_API_KEY     = (tu API key de Resend)
   CORS_ORIGIN        = https://promesalatina.com
   NODE_ENV           = production
6. Generate Domain → copia la URL (ej: api-xxx.railway.app)
7. Usar esa URL como NEXT_PUBLIC_API_URL en Vercel
```

---

## 📁 Estructura completa del repositorio

```
promesa-latina/
├── .env.example                          ← Template variables de entorno
├── .gitignore                            ← Archivos ignorados por Git
├── .github/
│   └── workflows/
│       └── ci.yml                        ← Pipeline CI automático
├── package.json                          ← Scripts raíz del monorepo
├── pnpm-workspace.yaml                   ← Configuración workspace
├── turbo.json                            ← Configuración Turborepo
│
├── apps/
│   ├── web/                              ← Frontend Next.js 14
│   │   ├── app/
│   │   │   ├── [locale]/
│   │   │   │   └── page.tsx             ← Landing page
│   │   │   └── admin/
│   │   │       └── products/
│   │   │           ├── page.tsx         ← Listado de productos
│   │   │           ├── new/page.tsx     ← Crear producto
│   │   │           └── [id]/page.tsx    ← Editar producto
│   │   ├── components/
│   │   │   ├── landing/                 ← Componentes de la landing
│   │   │   └── admin/
│   │   │       ├── layout/
│   │   │       │   └── AdminLayout.tsx  ← Sidebar + topbar
│   │   │       └── products/
│   │   │           ├── ProductForm.tsx  ← Formulario con tabs
│   │   │           └── ImageUploader.tsx← Drag-and-drop imágenes
│   │   ├── lib/
│   │   │   └── api-admin.ts            ← Cliente HTTP tipado
│   │   ├── messages/
│   │   │   ├── es.json                 ← Traducciones español
│   │   │   └── en.json                 ← Traducciones inglés
│   │   ├── types/
│   │   │   └── product.ts              ← TypeScript types
│   │   ├── i18n.ts                     ← Config internacionalización
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                             ← Backend NestJS
│       ├── src/
│       │   ├── main.ts                 ← Entry point
│       │   ├── app.module.ts           ← Módulo raíz
│       │   ├── auth/                   ← JWT + RBAC
│       │   ├── products/               ← CRUD + imágenes
│       │   ├── categories/             ← Categorías dinámicas
│       │   ├── orders/                 ← Órdenes de compra
│       │   ├── email/                  ← Correos automáticos
│       │   ├── storage/                ← Cloudinary
│       │   └── prisma/                 ← Singleton PrismaClient
│       ├── nest-cli.json
│       ├── tsconfig.json
│       └── package.json
│
└── database/
    ├── schema.prisma                    ← Schema PostgreSQL completo
    └── seed.ts                          ← Datos iniciales de prueba
```

---

## 🔑 Credenciales demo (después del seed)

| Rol | Email | Contraseña | Acceso |
|-----|-------|-----------|--------|
| ADMIN | admin@promesalatina.com | Admin123! | Todo el panel |
| VENTAS | ventas@promesalatina.com | Ventas123! | Órdenes y cotizaciones |
| CLIENTE | cliente@example.com | Cliente123! | Catálogo y órdenes propias |

---

## 🛠️ Comandos de referencia rápida

```bash
# Desarrollo
pnpm dev              # Correr todo el monorepo
pnpm web              # Solo frontend (puerto 3000)
pnpm api              # Solo backend (puerto 3001)

# Base de datos
pnpm db:migrate       # Crear/actualizar tablas
pnpm db:seed          # Poblar con datos demo
pnpm db:studio        # Interfaz visual de BD (puerto 5555)
pnpm db:reset         # Resetear BD completa (¡cuidado en producción!)
pnpm db:generate      # Regenerar tipos de Prisma

# Git — flujo de trabajo recomendado
git checkout -b feature/nombre   # Nueva rama
git add .                        # Agregar cambios
git commit -m "feat: descripción"# Commit
git push origin feature/nombre   # Subir rama
# → Abrir Pull Request en GitHub → merge a main
```

---

## ⚠️ Problemas comunes y soluciones

**"Cannot connect to database"**
→ Verificar que `DATABASE_URL` en `apps/api/.env` tenga la URL correcta de Neon/Supabase

**"pnpm: command not found"**
→ Ejecutar: `npm install -g pnpm`

**"Port 3000 already in use"**
→ En Mac/Linux: `lsof -ti:3000 | xargs kill -9`
→ En Windows: `netstat -ano | findstr 3000` → `taskkill /PID <numero> /F`

**"Cloudinary upload failed"**
→ Verificar las 3 variables: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**"Module not found: @/types/product"**
→ Verificar `tsconfig.json` tiene: `"paths": { "@/*": ["./*"] }`

**Las imágenes no aparecen en producción**
→ Agregar `res.cloudinary.com` en `next.config.ts` → `images.remotePatterns`

---

<!-- REEMPLAZAR AQUÍ INFORMACIÓN DE PROMESA LATINA -->
## 📞 Contacto

- **Email:** ventas@promesalatina.com
- **Teléfono:** +1 (XXX) XXX-XXXX
- **Ciudad:** Los Ángeles, California, EE.UU.

---

*Promesa Latina © 2025 — Todos los derechos reservados*
