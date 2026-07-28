'use client'
// apps/web/app/catalog/[id]/page.tsx
// Detalle de producto B2B: imagen con zoom, selector cantidad/tipo,
// agregar al carrito, información completa y productos relacionados.

import { useState, useEffect, Suspense } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'
import type { UnitType } from '@/store/cart'
import { fetchProduct, fetchProducts } from '@/lib/api-catalog'
import { CartButton } from '@/components/cart/CartButton'
import { Header } from '@/components/landing/Header'
import { ProductCard } from '@/components/catalog/ProductCard'

const navy   = '#1F3A93'
const orange = '#E65100'

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function ProductDetailContent() {
  const { id, locale } = useParams<{ id: string; locale: string }>()
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  const router   = useRouter()
  const { addItem, isInCart, getItem, updateQuantity } = useCartStore()

  const [product,  setProduct]  = useState<any>(null)
  const [related,  setRelated]  = useState<any[]>([])
  const [loading,  setLoading]  = useState(true)
  const [qty,      setQty]      = useState(1)
  const [unitType, setUnitType] = useState<UnitType>('caja')
  const [zoom,     setZoom]     = useState(false)
  const [imgIdx,   setImgIdx]   = useState(0)
  const [toast,    setToast]    = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  useEffect(() => {
    if (!id) return
    setLoading(true)
    fetchProduct(id)
      .then(p => {
        setProduct(p)
        setQty(p.moq ?? 1)
        // Cargar relacionados de la misma categoría
        if (p.categoryId) {
          fetchProducts({ categoryId: p.categoryId, limit: 4 })
            .then(r => setRelated(r.data.filter((x: any) => x.id !== id)))
            .catch(() => {})
        }
      })
      .catch(() => router.push('/catalog'))
      .finally(() => setLoading(false))
  }, [id, router])

  function handleAddToCart() {
    if (!product) return
    const inCart   = isInCart(product.id)
    const cartItem = getItem(product.id)

    if (inCart && cartItem) {
      updateQuantity(product.id, cartItem.quantity + qty)
      showToast(`Cantidad actualizada: ${cartItem.quantity + qty} ${unitType}(s)`)
    } else {
      addItem({
        productId:     product.id,
        name:          product.name,
        nameEn:        product.nameEn ?? product.name,
        sku:           product.sku,
        unitType,
        quantity:      qty,
        basePrice:     product.basePrice,
        imageUrl:      product.mainImageUrl ?? '',
        unitsPerCase:  product.unitsPerCase,
        unitsPerPack:  product.unitsPerPack,
        moq:           product.moq,
        categoryName:  product.category?.name ?? '',
        stockQuantity: product.stockQuantity,
      })
      showToast(`${product.name} agregado al carrito`)
    }
  }

  const images = product?.images?.length > 0
    ? product.images
    : product?.mainImageUrl
      ? [{ url: product.mainImageUrl }]
      : []

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
        Cargando producto...
      </div>
    )
  }

  if (!product) return null

  const outOfStock = product.stockQuantity === 0
  const inCart     = isInCart(product.id)

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 999, background: navy, color: '#fff', padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: '0 8px 24px rgba(0,0,0,0.15)' }}>
          ✓ {toast}
        </div>
      )}

      {/* Header */}
        <Header />

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '16px' : '28px 24px', overflowX: 'hidden' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 6, fontSize: 12, color: '#94A3B8', marginBottom: 24, flexWrap: 'wrap' }}>
          <Link href="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Inicio</Link>
          <span>›</span>
          <Link href={`/${locale}/catalog`} style={{ color: '#94A3B8', textDecoration: 'none' }}>Catálogo</Link>
          {product.category && <>
            <span>›</span>
            <span style={{ color: '#94A3B8' }}>{product.category.name}</span>
          </>}
          <span>›</span>
          <span style={{ color: '#0F172A', fontWeight: 600 }}>{product.name}</span>
        </div>

        {/* ── LAYOUT PRINCIPAL ─────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 420px', gap: 32, alignItems: 'start', marginBottom: 48 }}>

          {/* ── IMÁGENES ─────────────────────────────────────────────────── */}
          <div>
            {/* Imagen principal */}
            <div
              onClick={() => setZoom(true)}
              style={{
                background: '#fff', borderRadius: 16, border: '1.5px solid #E2E8F0',
                overflow: 'hidden', cursor: 'zoom-in', position: 'relative',
                aspectRatio: '4/3', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              {images[imgIdx]
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={images[imgIdx].url} alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 16 }} />
                : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, width: '100%', height: '100%' }}>
                    <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="80" height="80" rx="16" fill="#EEF2FF"/>
                      <path d="M20 28L40 20L60 28V52L40 60L20 52V28Z" stroke="#A5B4FC" strokeWidth="2.5" fill="none"/>
                      <path d="M40 20V60M20 28L40 38L60 28" stroke="#A5B4FC" strokeWidth="2.5"/>
                      <circle cx="40" cy="38" r="4" fill="#818CF8"/>
                    </svg>
                    <span style={{ fontSize: 13, color: '#94A3B8', fontFamily: 'Inter, sans-serif', fontWeight: 500, letterSpacing: '0.03em' }}>Sin imagen disponible</span>
                  </div>
              }

              {/* Badges */}
              <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                {product.isNew && <span style={{ background: navy, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>NUEVO</span>}
                {product.isTopSeller && <span style={{ background: orange, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>TOP SELLER</span>}
                {outOfStock && <span style={{ background: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 4 }}>AGOTADO</span>}
              </div>

              <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,0.35)', color: '#fff', borderRadius: 6, padding: '4px 8px', fontSize: 10 }}>
                🔍 Click para ampliar
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {images.map((img: any, i: number) => (
                  <div key={i} onClick={() => setImgIdx(i)}
                    style={{
                      width: 64, height: 64, borderRadius: 8, overflow: 'hidden',
                      border: `2px solid ${i === imgIdx ? navy : '#E2E8F0'}`,
                      cursor: 'pointer', background: '#F8FAFC',
                    }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.url} alt={`${product.name} ${i + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── INFO Y COMPRA ─────────────────────────────────────────────── */}
          <div>
            {/* Categoría */}
            {product.category && (
              <p style={{ fontSize: 11, fontWeight: 700, color: '#E65100', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
                {product.category.name}
                {product.subcategory && ` › ${product.subcategory.name}`}
              </p>
            )}

            <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 24, fontWeight: 800, color: '#0F172A', margin: '0 0 6px', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            <p style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'monospace', margin: '0 0 16px' }}>
              SKU: {product.sku}
              {product.countryOfOrigin && ` · Origen: ${product.countryOfOrigin}`}
            </p>



            {/* En carrito badge */}
            {inCart && (
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 5, background: '#EEF2FF', color: navy }}>
                  🛒 En tu orden
                </span>
              </div>
            )}

            {/* Label caja x unidades */}
            <div style={{ marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#475569', background: '#F1F5F9', padding: '8px 14px', borderRadius: 8, display: 'inline-block' }}>
                📦 Caja × {product.unitsPerCase} unidades
              </span>
            </div>

            {/* Selector cantidad */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: '0 0 8px', letterSpacing: '0.03em', textTransform: 'uppercase' }}>
                Cantidad (MOQ mín. {product.moq})
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button onClick={() => setQty(q => Math.max(product.moq, q - 1))}
                  disabled={qty <= product.moq}
                  style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #E2E8F0', background: '#F8FAFC', cursor: qty <= product.moq ? 'not-allowed' : 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: qty <= product.moq ? 0.4 : 1, fontWeight: 700 }}>
                  −
                </button>
                <input type="number" min={product.moq} value={qty}
                  onChange={e => setQty(Math.max(product.moq, parseInt(e.target.value) || product.moq))}
                  style={{ width: 72, height: 40, textAlign: 'center', border: '2px solid #E2E8F0', borderRadius: 8, fontSize: 18, fontWeight: 700, color: navy, outline: 'none', fontFamily: 'Poppins, sans-serif' }}
                />
                <button onClick={() => setQty(q => q + 1)}
                  style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                  +
                </button>

              </div>
            </div>

            {/* Botón agregar */}
            <button
              onClick={handleAddToCart}
              disabled={outOfStock}
              style={{
                width: '100%', height: 50, background: outOfStock ? '#94A3B8' : orange,
                color: '#fff', border: 'none', borderRadius: 10,
                fontSize: 15, fontWeight: 800, cursor: outOfStock ? 'not-allowed' : 'pointer',
                fontFamily: 'Poppins, sans-serif', marginBottom: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: outOfStock ? 'none' : '0 4px 16px rgba(230,81,0,0.35)',
                transition: 'all .15s',
              }}>
              {outOfStock ? '❌ Sin stock disponible' : inCart ? '🛒 Actualizar en carrito' : '🛒 Agregar al carrito'}
            </button>

            <Link href={`/${locale}/checkout`}
              style={{ display: 'block', width: '100%', height: 44, background: navy, color: '#fff', borderRadius: 8, textAlign: 'center', textDecoration: 'none', fontWeight: 700, fontSize: 14, fontFamily: 'Poppins, sans-serif', lineHeight: '44px' }}>
              ⚡ Ir al checkout →
            </Link>

            {/* Especificaciones */}
            <div style={{ marginTop: 24, background: '#F8FAFC', borderRadius: 10, padding: '16px' }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 12px' }}>Especificaciones</p>
              {[
                ['Unidades por caja', product.unitsPerCase],
                ['Pedido mínimo (MOQ)', `${product.moq} caja(s)`],
                ['País de origen', product.countryOfOrigin ?? '—'],
              ].map(([label, val]) => (
                <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E2E8F0', fontSize: 13 }}>
                  <span style={{ color: '#64748B' }}>{label}</span>
                  <span style={{ fontWeight: 600, color: '#0F172A' }}>{val}</span>
                </div>
              ))}
            </div>

            {product.description && (
              <div style={{ marginTop: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Descripción</p>
                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.7, margin: 0 }}>{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── PRODUCTOS RELACIONADOS ─────────────────────────────────────── */}
        {related.length > 0 && (
          <div>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 20px' }}>
              Productos relacionados
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
              {related.slice(0, 4).map(p => (
                <ProductCard key={p.id} product={p} lang="es" onToast={showToast} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal zoom */}
      {zoom && images[imgIdx] && (
        <div onClick={() => setZoom(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[imgIdx].url} alt={product.name}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} />
          <button onClick={() => setZoom(false)}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer', fontSize: 20 }}>
            ×
          </button>
        </div>
      )}
    </div>
  )
}

export default function ProductDetailPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>
        Cargando...
      </div>
    }>
      <ProductDetailContent />
    </Suspense>
  )
}
