// database/seed.ts
// Seed inicial: categorías, subcategorías, productos demo y usuarios
// Ejecutar: pnpm --filter api prisma db seed

import { PrismaClient, Role } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de Promesa Latina...\n')

  // ── 1. USUARIOS DEMO ────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin123!', 12)

  const admin = await prisma.user.upsert({
    where:  { email: 'admin@promesalatina.com' },
    update: {},
    create: {
      email:        'admin@promesalatina.com',
      password:     passwordHash,
      name:         'Admin Promesa Latina',
      role:         Role.ADMIN,
      businessName: 'Promesa Latina Inc',
    },
  })

  const vendedor = await prisma.user.upsert({
    where:  { email: 'ventas@promesalatina.com' },
    update: {},
    create: {
      email:        'ventas@promesalatina.com',
      password:     await bcrypt.hash('Ventas123!', 12),
      name:         'Equipo de Ventas',
      role:         Role.VENTAS,
      businessName: 'Promesa Latina Inc',
    },
  })

  const cliente = await prisma.user.upsert({
    where:  { email: 'cliente@example.com' },
    update: {},
    create: {
      email:        'cliente@example.com',
      password:     await bcrypt.hash('Cliente123!', 12),
      name:         'María García',
      role:         Role.CLIENTE,
      businessName: 'La Tiendita Latina',
      phone:        '+1 (213) 555-0100',
      address:      '1234 E Cesar Chavez Ave',
      city:         'Los Angeles',
      state:        'CA',
      zipCode:      '90033',
    },
  })

  console.log(`✓ Usuarios: ${admin.email}, ${vendedor.email}, ${cliente.email}`)

  // ── 2. CATEGORÍAS Y SUBCATEGORÍAS ───────────────────────────────────────
  const categoriesData = [
    {
      name: 'Bebidas', nameEn: 'Beverages', slug: 'bebidas', icon: '🥤', order: 1,
      subcategories: [
        { name: 'Jugos', nameEn: 'Juices', slug: 'jugos', order: 1 },
        { name: 'Sodas', nameEn: 'Sodas', slug: 'sodas', order: 2 },
        { name: 'Energizantes', nameEn: 'Energy Drinks', slug: 'energizantes', order: 3 },
        { name: 'Aguas', nameEn: 'Waters', slug: 'aguas', order: 4 },
      ],
    },
    {
      name: 'Galletas & Snacks', nameEn: 'Cookies & Snacks', slug: 'galletas-snacks', icon: '🍪', order: 2,
      subcategories: [
        { name: 'Galletas', nameEn: 'Cookies', slug: 'galletas', order: 1 },
        { name: 'Churritos', nameEn: 'Churritos', slug: 'churritos', order: 2 },
        { name: 'Snacks salados', nameEn: 'Salty Snacks', slug: 'snacks-salados', order: 3 },
      ],
    },
    {
      name: 'Pan & Repostería', nameEn: 'Bread & Bakery', slug: 'pan-reposteria', icon: '🥖', order: 3,
      subcategories: [
        { name: 'Pan dulce', nameEn: 'Sweet Bread', slug: 'pan-dulce', order: 1 },
        { name: 'Tortillas', nameEn: 'Tortillas', slug: 'tortillas', order: 2 },
        { name: 'Pastelería', nameEn: 'Pastry', slug: 'pasteleria', order: 3 },
      ],
    },
    {
      name: 'Granos & Condimentos', nameEn: 'Grains & Condiments', slug: 'granos-condimentos', icon: '🫘', order: 4,
      subcategories: [
        { name: 'Frijoles', nameEn: 'Beans', slug: 'frijoles', order: 1 },
        { name: 'Arroz', nameEn: 'Rice', slug: 'arroz', order: 2 },
        { name: 'Especias', nameEn: 'Spices', slug: 'especias', order: 3 },
        { name: 'Salsas y aderezos', nameEn: 'Sauces & Dressings', slug: 'salsas-aderezos', order: 4 },
      ],
    },
    {
      name: 'Congelados', nameEn: 'Frozen', slug: 'congelados', icon: '🧊', order: 5,
      subcategories: [
        { name: 'Pupusas', nameEn: 'Pupusas', slug: 'pupusas', order: 1 },
        { name: 'Tamales', nameEn: 'Tamales', slug: 'tamales', order: 2 },
        { name: 'Yuca y platano', nameEn: 'Yuca & Plantain', slug: 'yuca-platano', order: 3 },
      ],
    },
    {
      name: 'Medicina & Salud', nameEn: 'Medicine & Health', slug: 'medicina-salud', icon: '💊', order: 6,
      subcategories: [
        { name: 'Remedios naturales', nameEn: 'Natural Remedies', slug: 'remedios-naturales', order: 1 },
        { name: 'Vitaminas', nameEn: 'Vitamins', slug: 'vitaminas', order: 2 },
      ],
    },
    {
      name: 'Nostalgia Latina', nameEn: 'Latin Nostalgia', slug: 'nostalgia-latina', icon: '💛', order: 7,
      subcategories: [
        { name: 'Marcas clásicas', nameEn: 'Classic Brands', slug: 'marcas-clasicas', order: 1 },
        { name: 'Dulces importados', nameEn: 'Imported Candy', slug: 'dulces-importados', order: 2 },
      ],
    },
  ]

  const createdCategories: Record<string, { id: string; subcategories: Record<string, string> }> = {}

  for (const cat of categoriesData) {
    const { subcategories, ...catData } = cat
    const created = await prisma.category.upsert({
      where:  { slug: catData.slug },
      update: {},
      create: catData,
    })

    const subMap: Record<string, string> = {}
    for (const sub of subcategories) {
      const createdSub = await prisma.subcategory.upsert({
        where:  { slug: sub.slug },
        update: {},
        create: { ...sub, categoryId: created.id },
      })
      subMap[sub.slug] = createdSub.id
    }

    createdCategories[cat.slug] = { id: created.id, subcategories: subMap }
  }

  console.log(`✓ ${categoriesData.length} categorías creadas`)

  // ── 3. PRODUCTOS DEMO ───────────────────────────────────────────────────
  const bebidasId    = createdCategories['bebidas'].id
  const sodasId      = createdCategories['bebidas'].subcategories['sodas']
  const gallId       = createdCategories['galletas-snacks'].id
  const granosId     = createdCategories['granos-condimentos'].id
  const frijId       = createdCategories['granos-condimentos'].subcategories['frijoles']
  const congelId     = createdCategories['congelados'].id
  const pupusasId    = createdCategories['congelados'].subcategories['pupusas']

  const productsData = [
    {
      name: 'Gaseosa Colombiana Postobon Uva', nameEn: 'Colombian Grape Soda Postobon',
      sku: 'POS-UVA-350', categoryId: bebidasId, subcategoryId: sodasId,
      description: 'Refresco colombiano sabor uva, la favorita de las tiendas latinas.',
      descriptionEn: 'Colombian grape flavored soft drink, favorite at Latin stores.',
      weight: 350, unitsPerPack: 6, unitsPerCase: 24, moq: 2,
      basePrice: 28.50, stockQuantity: 48, isNew: true, isTopSeller: false,
      countryOfOrigin: 'Colombia', status: 'ACTIVE' as const,
    },
    {
      name: 'Tortillas de Maíz Maseca', nameEn: 'Maseca Corn Tortilla Mix',
      sku: 'MAS-MAIZ-1KG', categoryId: granosId,
      description: 'Harina de maíz para tortillas, la marca más vendida en EE.UU.',
      descriptionEn: 'Corn flour for tortillas, top-selling brand in the US.',
      weight: 1000, unitsPerPack: 10, unitsPerCase: 10, moq: 1,
      basePrice: 42.00, stockQuantity: 30, isNew: false, isTopSeller: true,
      countryOfOrigin: 'México', status: 'ACTIVE' as const,
    },
    {
      name: 'Frijoles Rojos Isleño', nameEn: 'Isleño Red Kidney Beans',
      sku: 'ISL-FRIJ-15OZ', categoryId: granosId, subcategoryId: frijId,
      description: 'Frijoles rojos enlatados, listos para servir. Sabor centroamericano auténtico.',
      descriptionEn: 'Canned red kidney beans, ready to serve. Authentic Central American flavor.',
      weight: 425, unitsPerPack: 12, unitsPerCase: 24, moq: 1,
      basePrice: 36.00, stockQuantity: 60, isNew: false, isTopSeller: true,
      countryOfOrigin: 'El Salvador', status: 'ACTIVE' as const,
    },
    {
      name: 'Pupusas Congeladas de Queso', nameEn: 'Frozen Cheese Pupusas',
      sku: 'PUP-QSO-80G', categoryId: congelId, subcategoryId: pupusasId,
      description: 'Pupusas salvadoreñas rellenas de queso. Cocinar directo desde el congelador.',
      descriptionEn: 'Salvadoran pupusas filled with cheese. Cook directly from frozen.',
      weight: 80, unitsPerPack: 12, unitsPerCase: 48, moq: 2,
      basePrice: 32.00, stockQuantity: 20, isNew: true, isTopSeller: false,
      countryOfOrigin: 'El Salvador', status: 'ACTIVE' as const,
    },
    {
      name: 'Salsa Lizano Original', nameEn: 'Lizano Sauce Original',
      sku: 'LIZ-ORIG-700ML', categoryId: granosId,
      description: 'Salsa costarricense Lizano, el condimento más icónico de Centroamérica.',
      descriptionEn: 'Costa Rican Lizano sauce, the most iconic condiment in Central America.',
      weight: 700, unitsPerPack: 6, unitsPerCase: 12, moq: 1,
      basePrice: 29.00, stockQuantity: 35, isNew: false, isTopSeller: true,
      countryOfOrigin: 'Costa Rica', status: 'ACTIVE' as const,
    },
    {
      name: 'Churritos El Charrito', nameEn: 'El Charrito Corn Snacks',
      sku: 'CHR-ORIG-28G', categoryId: gallId,
      description: 'Churritos de maíz estilo centroamericano, sabor original. Muy demandados en tiendas latinas.',
      descriptionEn: 'Central American style corn snacks, original flavor. High demand in Latin stores.',
      weight: 28, unitsPerPack: 24, unitsPerCase: 50, moq: 1,
      basePrice: 18.00, stockQuantity: 100, isNew: false, isTopSeller: true,
      countryOfOrigin: 'Guatemala', status: 'ACTIVE' as const,
    },
    {
      name: 'Café Bustelo Espresso Ground', nameEn: 'Bustelo Espresso Ground Coffee',
      sku: 'BUS-ESP-10OZ', categoryId: bebidasId,
      description: 'Café molido espresso Bustelo, el preferido de las familias latinas en EE.UU.',
      descriptionEn: 'Bustelo ground espresso coffee, preferred by Latino families in the US.',
      weight: 283, unitsPerPack: 6, unitsPerCase: 12, moq: 1,
      basePrice: 55.00, stockQuantity: 24, isNew: false, isTopSeller: true,
      countryOfOrigin: 'Cuba/USA', status: 'ACTIVE' as const,
    },
    {
      name: 'Incaparina Original Guatemala', nameEn: 'Incaparina Original Guatemala',
      sku: 'INC-ORIG-400G', categoryId: bebidasId,
      description: 'Bebida nutritiva guatemalteca de alto contenido proteico. Nostalgia familiar.',
      descriptionEn: 'Guatemalan nutritional drink with high protein content. Family nostalgia.',
      weight: 400, unitsPerPack: 12, unitsPerCase: 24, moq: 1,
      basePrice: 24.00, stockQuantity: 15, isNew: true, isTopSeller: false,
      countryOfOrigin: 'Guatemala', status: 'ACTIVE' as const,
    },
  ]

  let productCount = 0
  for (const p of productsData) {
    await prisma.product.upsert({
      where:  { sku: p.sku },
      update: {},
      create: p,
    })
    productCount++
  }

  console.log(`✓ ${productCount} productos demo creados`)

  // ── 4. RESUMEN ──────────────────────────────────────────────────────────
  console.log('\n✅ Seed completado exitosamente!\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔑 Credenciales de acceso:')
  console.log('  ADMIN:    admin@promesalatina.com   / Admin123!')
  console.log('  VENTAS:   ventas@promesalatina.com  / Ventas123!')
  console.log('  CLIENTE:  cliente@example.com       / Cliente123!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
